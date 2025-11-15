import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Copy, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SharePlanCardProps {
  planId: string;
  state?: 'created' | 'nearlock' | 'locked' | 'scheduled';
}

interface PlanData {
  id: string;
  daypart: string;
  date_start: string;
  date_end: string;
  neighborhood: string;
  headcount: number;
  budget_band: string;
  threshold: number;
  decision_deadline: string;
  locked: boolean;
}

export const SharePlanCard = ({ planId, state: initialState }: SharePlanCardProps) => {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [voteCount, setVoteCount] = useState(0);
  const [state, setState] = useState(initialState);
  const [lockedOption, setLockedOption] = useState<{ name: string; address: string } | null>(null);

  useEffect(() => {
    loadPlanData();
  }, [planId]);

  const loadPlanData = async () => {
    try {
      const { data: planData } = await supabase.functions.invoke('plans-get', {
        body: { id: planId },
      });

      if (planData?.plan) {
        setPlan(planData.plan);
        setVoteCount(Object.values(planData.votesByOption || {}).reduce((a: number, b: number) => a + b, 0) as number);

        // Determine state
        if (planData.plan.locked) {
          setState('locked');
          // Get locked option
          const { data: options } = await supabase
            .from('options')
            .select('name, address')
            .eq('plan_id', planId)
            .order('rank', { ascending: true })
            .limit(1);
          if (options?.[0]) {
            setLockedOption(options[0]);
          }
        } else {
          const threshold = planData.plan.threshold;
          const maxVotes = Math.max(...Object.values(planData.votesByOption || {}).map(v => Number(v)));
          if (maxVotes >= threshold - 1) {
            setState('nearlock');
          } else {
            const now = new Date();
            const dateStart = new Date(planData.plan.date_start);
            const isTonight = dateStart.toDateString() === now.toDateString();
            setState(isTonight ? 'created' : 'scheduled');
          }
        }
      }
    } catch (error) {
      console.error('Error loading plan data:', error);
    }
  };

  const getShareUrl = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/share?id=${planId}`;
  };

  const copyShareLink = async () => {
    const shareUrl = getShareUrl();
    const shareMessage = plan 
      ? `Help choose ${plan.daypart === 'dinner' ? 'tonight\'s' : 'a'} spot! Vote here: ${shareUrl}`
      : shareUrl;
    
    try {
      await navigator.clipboard.writeText(shareMessage);
      
      // Track share
      const { analytics } = await import('@/lib/analytics');
      analytics.track('plan_shared', {
        plan_id: planId,
        share_method: 'copy_link',
        state,
      });
      
      toast({
        title: "Share message copied!",
        description: "Paste it to share with everyone",
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Could not copy link",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const shareCard = async () => {
    const shareUrl = getShareUrl();
    const shareMessage = plan 
      ? `Help pick a spot for ${plan.daypart}! Vote here: ${shareUrl}`
      : shareUrl;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: getTitle(),
          text: shareMessage,
          url: shareUrl,
        });
        
        // Track share
        const { analytics } = await import('@/lib/analytics');
        analytics.track('plan_shared', {
          plan_id: planId,
          share_method: 'native_share',
          state,
        });
      } catch (error) {
        console.log('Share canceled or failed:', error);
      }
    } else {
      copyShareLink();
    }
  };

  const downloadICS = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const icsUrl = `${supabaseUrl}/functions/v1/ics?planId=${planId}`;
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = icsUrl;
    link.download = 'decigo-plan.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTitle = () => {
    if (!plan) return '';
    
    const dateStart = new Date(plan.date_start);
    const startTime = dateStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    switch (state) {
      case 'locked':
        return lockedOption ? `${lockedOption.name} at ${startTime}` : 'Plan Locked';
      case 'nearlock':
        return `${voteCount}/${plan.threshold} voted, one more to lock`;
      case 'scheduled':
        const weekday = dateStart.toLocaleDateString('en-US', { weekday: 'long' });
        return `Vote for ${weekday} night`;
      case 'created':
      default:
        return 'Vote on tonight\'s plan';
    }
  };

  const getDescription = () => {
    if (!plan) return '';
    
    switch (state) {
      case 'locked':
        return lockedOption?.address || `${plan.neighborhood}`;
      case 'nearlock':
        return 'One more vote locks it!';
      case 'scheduled':
      case 'created':
      default:
        return `${plan.daypart} • ${plan.neighborhood} • ${plan.budget_band}`;
    }
  };

  const getChips = () => {
    if (!plan) return [];
    
    const chips = [];
    const now = new Date();
    const dateStart = new Date(plan.date_start);
    const dateEnd = new Date(plan.date_end);
    const decisionDeadline = new Date(plan.decision_deadline);
    
    // Time window
    const startTime = dateStart.toLocaleTimeString('en-US', { hour: 'numeric' });
    const endTime = dateEnd.toLocaleTimeString('en-US', { hour: 'numeric' });
    chips.push(`${startTime}–${endTime}`);
    
    // Budget
    chips.push(plan.budget_band);
    
    // Countdown for scheduled plans
    if (!plan.locked && state === 'scheduled') {
      const hoursUntil = Math.ceil((decisionDeadline.getTime() - now.getTime()) / (1000 * 60 * 60));
      if (hoursUntil > 0 && hoursUntil < 72) {
        if (hoursUntil < 24) {
          chips.push(`Locks in ${hoursUntil}h`);
        } else {
          chips.push(`Locks in ${Math.ceil(hoursUntil / 24)}d`);
        }
      }
    }
    
    return chips;
  };

  if (!plan) {
    return (
      <div className="card animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      {/* Organizer coaching text */}
      {state === 'created' && plan && (
        <div className="bg-accent/10 rounded-lg p-3 mb-4 shadow-sm">
          <p className="text-sm text-decigo-deep-teal font-medium mb-1">
            📣 Share this link with everyone and ask them to vote.
          </p>
          <p className="text-xs text-decigo-slate-700">
            Once you have at least {plan.threshold} votes, you can lock the plan.
            {plan.decision_deadline && ` Locks automatically at ${new Date(plan.decision_deadline).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} or when you're ready.`}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg text-primary">{getTitle()}</h3>
          {state === 'nearlock' && (
            <Badge className="bg-destructive text-white">Almost there!</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {getDescription()}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {getChips().map((chip, i) => (
          <span key={i} className="chip text-xs">
            {chip}
          </span>
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        decigo.ai
      </div>

      <div className="flex gap-2">
        {state === 'locked' ? (
          <Button onClick={downloadICS} className="flex-1 btn-primary">
            <Calendar className="w-4 h-4 mr-2" />
            Add to Calendar
          </Button>
        ) : (
          <Button onClick={() => window.location.href = `/p/${planId}`} className="flex-1 btn-primary">
            Open voting page
          </Button>
        )}
        <Button onClick={shareCard} variant="outline" className="btn-secondary">
          <Share2 className="w-4 h-4" />
        </Button>
        <Button onClick={copyShareLink} variant="outline" className="btn-secondary">
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
