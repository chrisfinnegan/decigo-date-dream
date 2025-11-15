import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, ExternalLink, Share2, Copy, Image } from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { analytics } from "@/lib/analytics";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmptyPlanState } from "@/components/EmptyPlanState";
import { RankingInterface } from "@/components/RankingInterface";

interface Option {
  id: string;
  name: string;
  address: string;
  price_band: string;
  why_it_fits: string;
  tip: string;
  lat: number;
  lng: number;
  rank: number;
  photo_ref?: string;
}

interface Plan {
  id: string;
  daypart: string;
  date_start: string;
  date_end: string;
  neighborhood: string;
  headcount: number;
  budget_band: string;
  two_stop: boolean;
  threshold: number;
  decision_deadline: string;
  locked: boolean;
}

const PlanView = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [votesByOption, setVotesByOption] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [hasManagementAccess, setHasManagementAccess] = useState(false);
  const [myVotes, setMyVotes] = useState<string[]>([]);
  const [myRankings, setMyRankings] = useState<Record<string, number> | null>(null);
  const [rankedVotesByOption, setRankedVotesByOption] = useState<Record<string, number>>({});
  const [pollingForWinner, setPollingForWinner] = useState(false);

  useEffect(() => {
    if (!planId) return;

    let isCancelled = false;
    const controller = new AbortController();

    const preferredMode = localStorage.getItem(`plan_${planId}_mode`) as 'top3' | 'full20' | null;
    if (preferredMode) {
      setShowAll(preferredMode === 'full20');
    }
    
    // Check if user has management token (creator only)
    const token = localStorage.getItem(`plan_${planId}_token`);
    const hasToken = !!token;
    console.log('PlanView - Management access check:', { planId, hasToken, token: token ? 'exists' : 'none' });
    setHasManagementAccess(hasToken);
    
    // Load my votes from localStorage
    const savedVotes = localStorage.getItem(`plan_${planId}_votes`);
    if (savedVotes) {
      try {
        const votesArray = JSON.parse(savedVotes);
        setMyVotes(votesArray);
        console.log('Loaded saved votes:', votesArray);
      } catch (e) {
        console.error('Error parsing saved votes:', e);
      }
    }

    // Load my rankings from localStorage for small groups
    const savedRankings = localStorage.getItem(`plan_${planId}_rankings`);
    if (savedRankings) {
      try {
        const rankingsObj = JSON.parse(savedRankings);
        setMyRankings(rankingsObj);
        console.log('Loaded saved rankings:', rankingsObj);
      } catch (e) {
        console.error('Error parsing saved rankings:', e);
      }
    }
    
    // Track if this is from a sharecard
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('src') === 'sc') {
      analytics.track('sharecard_click', {
        planId,
        source: 'og_unfurl',
      });
    }
    
    const loadPlanData = async () => {
      try {
        setLoading(true);
        console.log('Loading plan:', planId);
        
        const mode = preferredMode || 'top3';
        
        // Get plan details with timeout
        const planPromise = supabase.functions.invoke('plans-get', {
          body: { id: planId },
        });

        const { data: planData, error: planError } = await Promise.race([
          planPromise,
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('Plan request timeout')), 8000)
          )
        ]);

        if (isCancelled) return;

        if (planError) {
          console.error('Plan error:', planError);
          throw planError;
        }
        
        if (!planData?.plan) {
          throw new Error('Plan not found');
        }

      console.log('Plan loaded:', planData.plan);
        setPlan(planData.plan);
        setVotesByOption(planData.votesByOption || {});

        // For small groups (2-3), fetch ranked votes instead
        if (planData.plan.headcount >= 2 && planData.plan.headcount <= 3) {
          const { data: rankedVotesData } = await supabase
            .from('ranked_votes')
            .select('*')
            .eq('plan_id', planId);
          
          if (rankedVotesData) {
            const voteCounts: Record<string, number> = {};
            rankedVotesData.forEach(() => {
              // Count total votes received for display
              Object.keys(voteCounts).forEach(key => voteCounts[key] = (voteCounts[key] || 0) + 1);
            });
            setRankedVotesByOption(voteCounts);
            console.log('Loaded ranked votes:', rankedVotesData.length);
          }
        }

        // Track plan view
        analytics.track('plan_viewed', {
          plan_id: planId,
          is_owner: hasToken,
          daypart: planData.plan.daypart,
          locked: planData.plan.locked,
        });

        // Get options with timeout
        console.log('Loading options with mode:', mode);
        const optionsPromise = supabase.functions.invoke('options-list', {
          body: { planId, mode },
        });

        const { data: optionsData, error: optionsError } = await Promise.race([
          optionsPromise,
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('Options request timeout')), 8000)
          )
        ]);

        if (isCancelled) return;

        if (optionsError) {
          console.error('Options error:', optionsError);
          throw optionsError;
        }
        
        if (!optionsData?.options) {
          throw new Error('Options not found');
        }

        console.log('Options loaded:', optionsData.options.length);
        setOptions(optionsData.options);
        
        // Track analytics with source and metadata (non-blocking)
        try {
          const source = optionsData.options[0]?.source_id ? 'google_places' : 'mock';
          const hasPhotos = optionsData.options.filter((o: Option) => o.photo_ref).length;
          const hasRatings = optionsData.options.filter((o: any) => o.rating).length;
          
          analytics.trackOptionsShown(mode, {
            planId,
            daypart: planData.plan?.daypart,
            neighborhood: planData.plan?.neighborhood,
            source,
            price_level: planData.plan?.budget_band,
            rating_present: hasRatings > 0,
            photo_count: hasPhotos,
          });
        } catch (analyticsError) {
          console.warn('Analytics error:', analyticsError);
        }
      } catch (error) {
        if (isCancelled) return;
        
        console.error('Error loading plan:', error);
        toast({
          title: "Error loading plan",
          description: error instanceof Error ? error.message : "Failed to load plan. Please try again.",
          variant: "destructive",
        });
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };
    
    loadPlanData();
    
    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [planId]);

  const loadPlan = async () => {
    if (!planId) return;
    
    try {
      setLoading(true);
      console.log('Reloading plan:', planId);
      
      const mode = showAll ? 'full20' : 'top3';
      
      // Get plan details
      const { data: planData, error: planError } = await supabase.functions.invoke('plans-get', {
        body: { id: planId },
      });

      if (planError) {
        console.error('Plan error:', planError);
        throw planError;
      }
      
      if (!planData?.plan) {
        throw new Error('Plan not found');
      }

      console.log('Plan reloaded:', planData.plan);
      setPlan(planData.plan);
      setVotesByOption(planData.votesByOption || {});

      // For small groups (2-3), fetch ranked votes
      if (planData.plan.headcount >= 2 && planData.plan.headcount <= 3) {
        const { data: rankedVotesData } = await supabase
          .from('ranked_votes')
          .select('*')
          .eq('plan_id', planId);
        
        if (rankedVotesData) {
          const voteCounts: Record<string, number> = {};
          rankedVotesData.forEach(() => {
            Object.keys(voteCounts).forEach(key => voteCounts[key] = (voteCounts[key] || 0) + 1);
          });
          setRankedVotesByOption(voteCounts);
        }
      }

      // Get options
      console.log('Reloading options with mode:', mode);
      const { data: optionsData, error: optionsError } = await supabase.functions.invoke('options-list', {
        body: { planId, mode },
      });

      if (optionsError) {
        console.error('Options error:', optionsError);
        throw optionsError;
      }
      
      if (!optionsData?.options) {
        throw new Error('Options not found');
      }

      console.log('Options reloaded:', optionsData.options.length);
      setOptions(optionsData.options);
    } catch (error) {
      console.error('Error reloading plan:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reload plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: string) => {
    // Check if already voted (client-side check)
    if (myVotes.length > 0) {
      toast({
        title: "Already voted",
        description: "You can only vote once per plan",
      });
      return;
    }

    setVoting(true);
    try {
      // Voter hash is now generated server-side based on IP and User-Agent
      const { data, error } = await supabase.functions.invoke('votes-cast', {
        body: { planId, optionId },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Vote was not recorded');
      }

      // Save vote locally
      const newVotes = [...myVotes, optionId];
      setMyVotes(newVotes);
      localStorage.setItem(`plan_${planId}_votes`, JSON.stringify(newVotes));

      // Track successful vote
      analytics.track('vote_cast', {
        plan_id: planId,
        option_id: optionId,
        vote_id: data.voteId,
      });

      // Track if vote came from sharecard
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('src') === 'sc') {
        analytics.track('sharecard_to_vote', {
          planId,
          optionId,
        });
      }

      analytics.trackVoteCast({
        planId,
        optionId,
        daypart: plan?.daypart,
        neighborhood: plan?.neighborhood,
      });

      toast({
        title: "Vote recorded!",
        description: "Thanks for voting!",
      });

      // Check lock status
      const { data: lockData } = await supabase.functions.invoke('lock-attempt', {
        body: { planId },
      });

      if (lockData?.locked) {
        analytics.trackLockReached({
          planId,
          optionId: lockData.optionId,
          daypart: plan?.daypart,
        });
        navigate(`/p/${planId}/locked`);
      } else {
        loadPlan();
      }
    } catch (error) {
      console.error('Error voting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Your vote was not saved",
        description: `${errorMessage}. Check your connection and try again.`,
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  const handleSubmitRankings = async (rankings: Record<string, number>) => {
    if (!planId) return;

    try {
      setVoting(true);

      // Submit ranked vote
      const { data, error } = await supabase.functions.invoke('ranked-votes-cast', {
        body: { planId, rankings },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Rankings were not recorded');
      }

      // Save rankings locally
      setMyRankings(rankings);
      localStorage.setItem(`plan_${planId}_rankings`, JSON.stringify(rankings));

      // Track ranking submission
      analytics.trackRankingSubmitted({
        planId,
        groupSize: plan?.headcount,
        stepName: 'initial_ranking',
      });

      toast({
        title: "Rankings recorded!",
        description: "Thanks for ranking the options!",
      });

      // If all votes are in, start polling for winner
      if (data.allVotesIn) {
        setPollingForWinner(true);
        // Trigger winner computation
        await computeWinner();
      } else {
        // Show progress
        toast({
          title: "Waiting for others",
          description: `${data.votesReceived}/${data.totalExpected} participants have ranked their choices`,
        });
      }
    } catch (error) {
      console.error('Error submitting rankings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error submitting rankings",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  const computeWinner = async () => {
    if (!planId) return;

    try {
      const { data, error } = await supabase.functions.invoke('ranked-votes-compute-winner', {
        body: { planId },
      });

      if (error) {
        console.error('Error computing winner:', error);
        return;
      }

      if (data?.success) {
        // Track winner selection
        analytics.trackSmallGroupWinnerSelected({
          planId,
          winnerId: data.winnerId,
          groupSize: plan?.headcount,
          tieBreakerUsed: data.tieBreakerUsed,
        });

        // Navigate to locked page
        toast({
          title: "Winner decided!",
          description: "The group has chosen a place",
        });

        setTimeout(() => {
          navigate(`/p/${planId}/locked`);
        }, 1000);
      }
    } catch (error) {
      console.error('Error computing winner:', error);
    }
  };

  // Poll for winner if all votes might be in
  useEffect(() => {
    if (!pollingForWinner || !planId || !plan) return;

    const pollInterval = setInterval(async () => {
      // Check if plan is locked
      const { data: planData } = await supabase.functions.invoke('plans-get', {
        body: { id: planId },
      });

      if (planData?.plan?.locked) {
        setPollingForWinner(false);
        navigate(`/p/${planId}/locked`);
      } else {
        // Check vote count
        const { count } = await supabase
          .from('ranked_votes')
          .select('*', { count: 'exact', head: true })
          .eq('plan_id', planId);

        if (count === plan.headcount) {
          // All votes are in, try to compute winner
          await computeWinner();
        }
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [pollingForWinner, planId, plan, navigate]);

  // Track small group flow start
  useEffect(() => {
    if (plan && plan.headcount >= 2 && plan.headcount <= 3 && !plan.locked) {
      analytics.trackSmallGroupFlowStarted({
        planId,
        groupSize: plan.headcount,
        occasion: plan.daypart,
      });
    }
  }, [plan, planId]);

  const toggleShowAll = () => {
    setShowAll(!showAll);
    if (planId) {
      localStorage.setItem(`plan_${planId}_mode`, !showAll ? 'full20' : 'top3');
    }
  };

  const getMapThumbnail = (option: Option) => {
    if (option.photo_ref) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      return `${supabaseUrl}/functions/v1/places-photo?photoRef=${encodeURIComponent(option.photo_ref)}`;
    }
    return null;
  };

  const openInMaps = (option: Option, provider: 'apple' | 'google') => {
    analytics.trackMapOpen({
      planId,
      optionId: option.id,
      provider,
    });
    
    // Use place name for better search results
    const searchQuery = `${option.name}, ${option.address}`;
    
    if (provider === 'apple') {
      // Apple Maps URL scheme – iOS will route this to the native app
      const url = `maps://maps.apple.com/?q=${encodeURIComponent(searchQuery)}`;
      window.location.href = url;
    } else {
      // Google Maps deep link for native app
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
      window.location.href = url;
    }
  };

  const copyShareLink = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const shareUrl = `${supabaseUrl}/functions/v1/share?id=${planId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      
      // Track share
      analytics.track('plan_shared', {
        plan_id: planId,
        share_method: 'copy_link',
      });
      
      toast({
        title: "Link copied!",
        description: "Share this link with everyone to vote",
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Could not copy link",
        description: "Please try again or use the share button",
        variant: "destructive",
      });
    }
  };

  const goToManagement = () => {
    const token = localStorage.getItem(`plan_${planId}_token`);
    if (token) {
      navigate(`/p/${planId}/manage?token=${token}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-4 flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading plan...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!plan) {
    return <EmptyPlanState />;
  }

  const totalVotes = Object.values(votesByOption).reduce((a, b) => a + b, 0);
  const isSmallGroup = plan.headcount >= 2 && plan.headcount <= 3;
  const hasEnoughOptions = options.length >= 3;

  // Debug logging
  console.log('PlanView render:', { 
    headcount: plan.headcount, 
    isSmallGroup, 
    optionsCount: options.length,
    hasEnoughOptions,
    willShowRanking: isSmallGroup && hasEnoughOptions 
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-4 max-w-4xl mx-auto space-y-6 py-8">
        {/* Title and Subtitle */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-bold text-primary">
            Help choose the plan
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            The organizer is deciding on a place in {plan.neighborhood}. Tap your favorites below — this takes under 30 seconds.
          </p>
        </div>

        <div>
          <div className="flex gap-2 flex-wrap mb-4">
            <span className="chip">{plan.daypart.charAt(0).toUpperCase() + plan.daypart.slice(1)}</span>
            <span className="chip">{plan.budget_band}</span>
            <span className="chip">{plan.headcount} people</span>
            {plan.two_stop && <span className="chip">Two-stop</span>}
          </div>
        </div>

        <div className="card bg-accent/10 border-accent/20">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-primary">
                  Progress: {totalVotes}/{plan.threshold} votes to lock
                </p>
                {totalVotes >= plan.threshold - 1 && totalVotes < plan.threshold && (
                  <Badge variant="destructive" className="animate-pulse">
                    One more vote locks it!
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Voting closes when this hits zero or when your organizer locks the plan.
              </div>
              <CountdownTimer deadline={plan.decision_deadline} />
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-sm font-medium mb-2 flex items-center gap-2 text-primary">
                <Share2 className="w-4 h-4" />
                Share with everyone
              </p>
              <div className="space-y-2">
                <button
                  onClick={copyShareLink}
                  className="btn-secondary w-full flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Copy className="w-4 h-4" />
                  Copy voting link
                </button>
                {hasManagementAccess && (
                  <button
                    onClick={goToManagement}
                    className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    Manage Plan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Vote Recap */}
        {myVotes.length > 0 && plan.headcount >= 4 && (
          <div className="card bg-primary/10 border-primary/20 sticky top-4 z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">
                  ✓ You voted for {myVotes.length} {myVotes.length === 1 ? 'option' : 'options'}
                </p>
                <p className="text-xs text-muted-foreground">
                  You can change your votes until the plan is locked
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Small Group Ranked Voting (2-3 people) */}
        {isSmallGroup && hasEnoughOptions ? (
          <RankingInterface
            options={options.slice(0, 3)}
            groupSize={plan.headcount}
            onSubmitRankings={handleSubmitRankings}
            existingRankings={myRankings || undefined}
            getMapThumbnail={getMapThumbnail}
          />
        ) : (
          <>
            {/* Voting Instructions for larger groups */}
            <div className="card bg-primary/5 border-primary/10">
              <p className="text-sm text-primary font-medium text-center">
                💡 Select one or more places below to cast your vote
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-primary">
              {showAll ? "All Options" : "Best matches for you"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShowAll}
              className="text-xs"
            >
              {showAll ? "Back to top picks" : `Show all ~${options.length} options`}
            </Button>
          </div>

          {options.map((option) => {
            const thumbnail = getMapThumbnail(option);
            const hasVoted = myVotes.includes(option.id);
            const voteCount = votesByOption[option.id] || 0;
            return (
              <div 
                key={option.id} 
                className={`card transition-all ${hasVoted ? 'border-primary border-2 bg-primary/5' : ''} ${voting ? 'opacity-50' : ''}`}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={option.name}
                      className="w-full md:w-48 h-36 object-cover rounded-lg flex-shrink-0"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full md:w-48 h-36 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center ${thumbnail ? 'hidden' : ''}`}>
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-primary text-lg flex items-center gap-2">
                          {option.rank}. {option.name}
                          {hasVoted && <Badge className="bg-primary text-white text-xs">✓ Your pick</Badge>}
                        </h3>
                        <span className="chip text-xs">{option.price_band}</span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {option.address}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-primary mb-1">Why it fits:</p>
                      <p className="text-sm text-muted-foreground">{option.why_it_fits}</p>
                    </div>

                    {option.tip && (
                      <div className="chip inline-block text-xs">
                        💡 {option.tip}
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap pt-2">
                      <button
                        onClick={() => openInMaps(option, 'apple')}
                        className="btn-secondary text-xs h-9 px-4 flex items-center min-h-[44px]"
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        Open in Maps
                      </button>
                      <button
                        onClick={() => openInMaps(option, 'google')}
                        className="btn-secondary text-xs h-9 px-4 flex items-center min-h-[44px]"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Google Maps
                      </button>
                    </div>

                    <Button
                      className="w-full btn-primary min-h-[44px]"
                      onClick={() => handleVote(option.id)}
                      disabled={voting}
                    >
                      {hasVoted ? `✓ Voted for ${option.name}` : `Vote for ${option.name}`}
                      {voteCount > 0 && ` (${voteCount} ${voteCount === 1 ? 'vote' : 'votes'})`}
                    </Button>
                    {hasVoted && (
                      <p className="text-xs text-center text-muted-foreground">
                        You can change your vote until the plan is locked
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
            </div>

            {!showAll && options.length === 3 && (
              <button
                onClick={() => setShowAll(true)}
                className="btn-secondary w-full"
              >
                See full list (~20 options)
              </button>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PlanView;
