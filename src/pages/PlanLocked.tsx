import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, ExternalLink } from "lucide-react";

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
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!plan || !option) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Locked plan not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Badge className="mb-2" variant="default">🎉 Locked!</Badge>
          <h1 className="text-4xl font-bold text-foreground">
            Your plans are set
          </h1>
          <p className="text-muted-foreground">
            {new Date(plan.date_start).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{option.name}</CardTitle>
            <CardDescription>{option.address}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="secondary">{plan.budget_band}</Badge>
              <Badge variant="secondary">{plan.daypart}</Badge>
              <Badge variant="secondary">{plan.neighborhood}</Badge>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Why this place:</p>
              <p className="text-sm text-muted-foreground">{option.why_it_fits}</p>
            </div>

            {option.tip && (
              <div>
                <p className="text-sm font-medium mb-1">Insider tip:</p>
                <p className="text-sm text-muted-foreground">{option.tip}</p>
              </div>
            )}

            <div className="space-y-2 pt-4">
              <Button
                className="w-full"
                size="lg"
                onClick={downloadICS}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Add to Calendar
              </Button>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => openInMaps('apple')}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Open in Maps
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => openInMaps('google')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Google Maps
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted">
          <CardHeader>
            <CardTitle className="text-lg">Share with your group</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Let everyone know where you're meeting
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({ title: "Link copied!" });
              }}
            >
              Copy link
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlanLocked;
