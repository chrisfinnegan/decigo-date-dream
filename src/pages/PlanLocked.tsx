import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { InstallPrompt } from "@/components/InstallPrompt";
import { usePWA } from "@/hooks/usePWA";
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
}

interface Plan {
  id: string;
  daypart: string;
  date_start: string;
  date_end: string;
  neighborhood: string;
  budget_band: string;
}

const PlanLocked = () => {
  const { planId } = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [option, setOption] = useState<Option | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasManagementAccess, setHasManagementAccess] = useState(false);
  const { showInstallPrompt, installApp, dismissPrompt, markPlanLocked } = usePWA();

  useEffect(() => {
    if (planId) {
      // Check if user has management token
      const token = localStorage.getItem(`plan_${planId}_token`);
      setHasManagementAccess(!!token);
      loadLockedPlan();
    }
  }, [planId]);

  const loadLockedPlan = async () => {
    try {
      const { data: planData, error: planError } = await supabase.functions.invoke('plans-get', {
        body: { id: planId },
      });

      if (planError) throw planError;

      setPlan(planData.plan);

      // Get the winning option (first one for now)
      const { data: optionsData, error: optionsError } = await supabase.functions.invoke('options-list', {
        body: { planId, mode: 'top3' },
      });

      if (optionsError) throw optionsError;

      if (optionsData.options && optionsData.options.length > 0) {
        setOption(optionsData.options[0]);
        
        // Track plan lock view
        analytics.track('plan_locked', {
          plan_id: planId,
          chosen_option_id: optionsData.options[0].id,
          chosen_option_name: optionsData.options[0].name,
        });
      }
      
      // Mark plan as locked for PWA prompt
      markPlanLocked();
    } catch (error) {
      console.error('Error loading locked plan:', error);
      toast({
        title: "Error",
        description: "Failed to load locked plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = () => {
    if (!planId || !option) return;

    analytics.trackCalendarAdded({
      planId,
      optionId: option.id,
      provider: 'default',
    });

    const baseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const icsUrl = `${baseUrl}/functions/v1/ics?planId=${planId}&optionId=${option.id}`;
    
    // Use location.href to let OS/browser hand off to default calendar app
    window.location.href = icsUrl;
  };

  const openInGoogleCalendar = () => {
    if (!plan || !option) return;

    const start = new Date(plan.date_start);
    const end = new Date(plan.date_end);

    // Format for Google as YYYYMMDDTHHMMSSZ
    const formatForGoogle = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const dates = `${formatForGoogle(start)}/${formatForGoogle(end)}`;
    const text = encodeURIComponent(option.name);
    const location = encodeURIComponent(option.address || '');
    const details = encodeURIComponent(
      option.why_it_fits || 'Planned with Decigo'
    );

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;

    analytics.trackCalendarAdded({
      planId,
      optionId: option.id,
      provider: 'google',
    });

    window.open(url, '_blank');
  };

  const openInMaps = (provider: 'apple' | 'google') => {
    if (!option) return;
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

  const goToManagement = () => {
    const token = localStorage.getItem(`plan_${planId}_token`);
    if (token) {
      window.location.href = `/p/${planId}/manage?token=${token}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-4 flex items-center justify-center min-h-[60vh]">
          <p className="text-brand-body">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!plan || !option) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-4 flex items-center justify-center min-h-[60vh]">
          <p className="text-brand-body">Locked plan not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-4 max-w-4xl mx-auto space-y-6 py-8">
        {/* Celebration Header */}
        <div className="text-center space-y-2">
          <div className="inline-block bg-brand-success text-white px-4 py-2 rounded-2xl mb-2 font-medium">
            🎉 Locked!
          </div>
          <h1 className="text-4xl font-bold text-brand-primary">
            You're going to {option.name}!
          </h1>
          <p className="text-brand-body text-lg">
            On {new Date(plan.date_start).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })} at {new Date(plan.date_start).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit'
            })} in {plan.neighborhood}
          </p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-brand-primary mb-2">{option.name}</h2>
          <p className="text-brand-body mb-4">{option.address}</p>
          
          <div className="flex gap-2 mb-4">
            <span className="chip">{plan.budget_band}</span>
            <span className="chip">{plan.daypart}</span>
            <span className="chip">{plan.neighborhood}</span>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-brand-primary mb-1">Why this place:</p>
            <p className="text-sm text-brand-body">{option.why_it_fits}</p>
          </div>

          {option.tip && (
            <div className="mb-4">
              <p className="text-sm font-medium text-brand-primary mb-1">Insider tip:</p>
              <p className="text-sm text-brand-body">{option.tip}</p>
            </div>
          )}

          <div className="space-y-2 pt-4">
            <p className="text-xs text-muted-foreground mb-2">
              Add this plan to your calendar so everyone knows where and when you're meeting
            </p>
            <button
              onClick={handleAddToCalendar}
              className="btn-primary w-full h-12 flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Add to Calendar
            </button>
            
            <Button
              variant="outline"
              className="w-full h-10 flex items-center justify-center gap-2"
              onClick={openInGoogleCalendar}
            >
              <Calendar className="w-4 h-4" />
              Add to Google Calendar
            </Button>

            <div className="flex gap-2">
              <button
                onClick={() => openInMaps('apple')}
                className="btn-secondary flex-1 h-10 flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Open in Maps
              </button>
              <button
                onClick={() => openInMaps('google')}
                className="btn-secondary flex-1 h-10 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Google Maps
              </button>
            </div>

            {hasManagementAccess && (
              <button
                onClick={goToManagement}
                className="btn-primary w-full h-10 flex items-center justify-center gap-2"
              >
                Manage Plan
              </button>
            )}
          </div>
        </div>

        <div className="card bg-brand-success/10">
          <h3 className="text-lg font-bold text-brand-primary mb-2">Share the final plan</h3>
          <p className="text-sm text-brand-body mb-4">
            Copy this link to share with anyone who hasn't seen the final plan
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast({ title: "Link copied!" });
            }}
            className="btn-secondary w-full"
          >
            Copy link
          </button>
        </div>

        {/* Create Another Plan CTA */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground mb-3">
            Planning something else soon?
          </p>
          <a href="/new" className="btn-primary inline-block px-6 py-2">
            Create another plan
          </a>
        </div>

        {showInstallPrompt && (
          <InstallPrompt onInstall={installApp} onDismiss={dismissPrompt} />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PlanLocked;
