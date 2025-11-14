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

  useEffect(() => {
    if (planId) {
      const preferredMode = localStorage.getItem(`plan_${planId}_mode`) as 'top3' | 'full20' | null;
      if (preferredMode) {
        setShowAll(preferredMode === 'full20');
      }
      // Check if user has management token
      const token = localStorage.getItem(`plan_${planId}_token`);
      setHasManagementAccess(!!token);
      
      // Track if this is from a sharecard
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('src') === 'sc') {
        analytics.track('sharecard_click', {
          planId,
          source: 'og_unfurl',
        });
      }
      
      loadPlan();
    }
  }, [planId]);

  const loadPlan = async () => {
    try {
      // Get plan details
      const { data: planData, error: planError } = await supabase.functions.invoke('plans-get', {
        body: { id: planId },
      });

      if (planError) throw planError;

      setPlan(planData.plan);
      setVotesByOption(planData.votesByOption);

      // Get options
      const { data: optionsData, error: optionsError } = await supabase.functions.invoke('options-list', {
        body: { planId, mode: showAll ? 'full20' : 'top3' },
      });

      if (optionsError) throw optionsError;

      setOptions(optionsData.options);
      
      // Track analytics with source and metadata
      const source = optionsData.options[0]?.source_id ? 'google_places' : 'mock';
      const hasPhotos = optionsData.options.filter((o: Option) => o.photo_ref).length;
      const hasRatings = optionsData.options.filter((o: any) => o.rating).length;
      
      analytics.trackOptionsShown(showAll ? 'full20' : 'top3', {
        planId,
        daypart: planData.plan?.daypart,
        neighborhood: planData.plan?.neighborhood,
        source,
        price_level: planData.plan?.budget_band,
        rating_present: hasRatings > 0,
        photo_count: hasPhotos,
      });
    } catch (error) {
      console.error('Error loading plan:', error);
      toast({
        title: "Error",
        description: "Failed to load plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: string) => {
    setVoting(true);
    try {
      // Generate voter hash (in production, use device ID or similar)
      const voterHash = crypto.randomUUID();

      const { data, error } = await supabase.functions.invoke('votes-cast', {
        body: { planId, optionId, voterHash },
      });

      if (error) throw error;

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
        title: "Vote cast!",
        description: "Checking if plan is locked...",
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
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to vote",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
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
    
    const url = provider === 'apple'
      ? `maps://maps.apple.com/?q=${encodeURIComponent(option.address)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(option.address)}`;
    window.open(url, '_blank');
  };

  const copyShareLink = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const shareUrl = `${supabaseUrl}/functions/v1/share?id=${planId}`;
    navigator.clipboard.writeText(shareUrl);
    
    // Track sharecard click
    analytics.track('sharecard_click', {
      planId,
      source: 'copy_button',
    });
    
    toast({
      title: "Link copied!",
      description: "Share this link with your group to vote",
    });
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
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-4 flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Plan not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const totalVotes = Object.values(votesByOption).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-4 max-w-4xl mx-auto space-y-6 py-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {plan.daypart.charAt(0).toUpperCase() + plan.daypart.slice(1)} {plan.neighborhood && `in ${plan.neighborhood}`}
          </h1>
          <div className="flex gap-2 flex-wrap">
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
                  <Badge className="bg-error text-white">Almost there!</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Deadline: {new Date(plan.decision_deadline).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
                <CountdownTimer deadline={plan.decision_deadline} />
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-sm font-medium mb-2 flex items-center gap-2 text-primary">
                <Share2 className="w-4 h-4" />
                Share with your group
              </p>
              <div className="space-y-2">
                <button
                  onClick={copyShareLink}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy voting link
                </button>
                {hasManagementAccess && (
                  <button
                    onClick={goToManagement}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    Manage Plan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {options.map((option) => {
            const thumbnail = getMapThumbnail(option);
            return (
              <div key={option.id} className="card">
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
                        <h3 className="font-bold text-primary text-lg">
                          {option.rank}. {option.name}
                        </h3>
                        <span className="chip text-xs">{option.price_band}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{option.address}</p>
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
                        className="btn-primary text-xs h-9 px-4 flex items-center"
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        Open in Maps
                      </button>
                      <button
                        onClick={() => openInMaps(option, 'google')}
                        className="btn-secondary text-xs h-9 px-4 flex items-center"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Google Maps
                      </button>
                    </div>

                    <Button
                      className="w-full btn-primary"
                      onClick={() => handleVote(option.id)}
                      disabled={voting}
                    >
                      Vote for {option.name}
                      {votesByOption[option.id] && ` (${votesByOption[option.id]} votes)`}
                    </Button>
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
      </div>
      <Footer />
    </div>
  );
};

export default PlanView;
