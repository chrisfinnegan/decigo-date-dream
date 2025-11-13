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
  const { showInstallPrompt, installApp, dismissPrompt, markPlanLocked } = usePWA();

  useEffect(() => {
    if (planId) {
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

  const downloadICS = () => {
    analytics.trackCalendarAdded({
      planId,
      optionId: option?.id,
    });
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    window.open(`${baseUrl}/functions/v1/ics?planId=${planId}`, '_blank');
  };

  const openInMaps = (provider: 'apple' | 'google') => {
    if (!option) return;
    const url = provider === 'apple'
      ? `maps://maps.apple.com/?q=${encodeURIComponent(option.address)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(option.address)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-decigo-cream">
        <Header />
        <div className="p-4 flex items-center justify-center min-h-[60vh]">
          <p className="text-decigo-slate-700">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!plan || !option) {
    return (
      <div className="min-h-screen bg-decigo-cream">
        <Header />
        <div className="p-4 flex items-center justify-center min-h-[60vh]">
          <p className="text-decigo-slate-700">Locked plan not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-decigo-cream">
      <Header />
      <div className="p-4 max-w-4xl mx-auto space-y-6 py-8">
        <div className="text-center space-y-2">
          <div className="inline-block bg-decigo-green text-white px-4 py-2 rounded-2xl mb-2 font-medium">
            🎉 Locked!
          </div>
          <h1 className="text-4xl font-bold text-decigo-deep-teal">
            Your plans are set
          </h1>
          <p className="text-decigo-slate-700">
            {new Date(plan.date_start).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-decigo-deep-teal mb-2">{option.name}</h2>
          <p className="text-decigo-slate-700 mb-4">{option.address}</p>
          
          <div className="flex gap-2 mb-4">
            <span className="chip">{plan.budget_band}</span>
            <span className="chip">{plan.daypart}</span>
            <span className="chip">{plan.neighborhood}</span>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-decigo-deep-teal mb-1">Why this place:</p>
            <p className="text-sm text-decigo-slate-700">{option.why_it_fits}</p>
          </div>

          {option.tip && (
            <div className="mb-4">
              <p className="text-sm font-medium text-decigo-deep-teal mb-1">Insider tip:</p>
              <p className="text-sm text-decigo-slate-700">{option.tip}</p>
            </div>
          )}

          <div className="space-y-2 pt-4">
            <button
              onClick={downloadICS}
              className="btn-primary w-full h-12 flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Add to Calendar
            </button>

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
          </div>
        </div>

        <div className="card bg-decigo-green/10">
          <h3 className="text-lg font-bold text-decigo-deep-teal mb-2">Share with your group</h3>
          <p className="text-sm text-decigo-slate-700 mb-4">
            Let everyone know where you're meeting
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

        {showInstallPrompt && (
          <InstallPrompt onInstall={installApp} onDismiss={dismissPrompt} />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PlanLocked;
