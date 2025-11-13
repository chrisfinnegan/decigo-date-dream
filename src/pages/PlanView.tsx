import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, ExternalLink } from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { analytics } from "@/lib/analytics";

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

  useEffect(() => {
    if (planId) {
      const preferredMode = localStorage.getItem(`plan_${planId}_mode`) as 'top3' | 'full20' | null;
      if (preferredMode) {
        setShowAll(preferredMode === 'full20');
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
      
      // Track analytics
      analytics.trackOptionsShown(showAll ? 'full20' : 'top3', {
        planId,
        daypart: planData.plan?.daypart,
        neighborhood: planData.plan?.neighborhood,
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
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l+000(${option.lng},${option.lat})/${option.lng},${option.lat},14/320x180@2x?access_token=${mapboxToken}`;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Loading plan...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Plan not found</p>
      </div>
    );
  }

  const totalVotes = Object.values(votesByOption).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {plan.daypart.charAt(0).toUpperCase() + plan.daypart.slice(1)} in {plan.neighborhood}
          </h1>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">{plan.budget_band}</Badge>
            <Badge variant="secondary">{plan.headcount} people</Badge>
            {plan.two_stop && <Badge variant="secondary">Two-stop</Badge>}
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Progress: {totalVotes}/{plan.threshold} votes to lock
            </p>
            {totalVotes >= plan.threshold - 1 && totalVotes < plan.threshold && (
              <Badge variant="destructive">Almost there!</Badge>
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

        <div className="space-y-4">
          {options.map((option) => (
            <Card key={option.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span>{option.rank}. {option.name}</span>
                  <Badge>{option.price_band}</Badge>
                </CardTitle>
                <CardDescription>{option.address}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={getMapThumbnail(option)}
                  alt={`Map of ${option.name}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
                
                <div>
                  <p className="text-sm font-medium mb-1">Why it fits:</p>
                  <p className="text-sm text-muted-foreground">{option.why_it_fits}</p>
                </div>

                {option.tip && (
                  <div>
                    <p className="text-sm font-medium mb-1">Tip:</p>
                    <p className="text-sm text-muted-foreground">{option.tip}</p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openInMaps(option, 'apple')}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Open in Maps
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openInMaps(option, 'google')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Google Maps
                  </Button>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleVote(option.id)}
                  disabled={voting}
                >
                  Vote for {option.name}
                  {votesByOption[option.id] && ` (${votesByOption[option.id]} votes)`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {!showAll && options.length === 3 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAll(true)}
          >
            See full list (~20 options)
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlanView;
