import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";
import { DateTimePicker } from "@/components/DateTimePicker";
import { analytics } from "@/lib/analytics";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChevronDown, Sparkles, Zap, Target, CheckCircle, Info, Loader2 } from "lucide-react";

const NewPlan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resultMode, setResultMode] = useState<'top3' | 'full20'>('top3');
  const [chips, setChips] = useState<string[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [formData, setFormData] = useState({
    dateStart: "",
    neighborhood: "",
    neighborhoodPlaceId: "",
    neighborhoodLat: 0,
    neighborhoodLng: 0,
    headcount: "4",
    budgetBand: "$$",
    daypart: "dinner",
    twoStop: false,
    notesRaw: "",
  });

  useEffect(() => {
    analytics.trackIntakeStart();
  }, []);

  const generateChips = () => {
    if (formData.notesRaw.trim()) {
      const words = formData.notesRaw.toLowerCase().split(/\s+/);
      const keywords = ['vegan', 'vegetarian', 'gluten-free', 'outdoor', 'indoor', 'romantic', 'casual', 'quiet', 'lively'];
      const foundChips = words.filter(w => keywords.includes(w));
      setChips(Array.from(new Set([...chips, ...foundChips])));
    }
  };

  const fillExamplePlan = () => {
    const today = new Date();
    today.setHours(19, 0, 0, 0);
    
    setFormData({
      ...formData,
      daypart: "dinner",
      dateStart: today.toISOString(),
      neighborhood: "Downtown",
      headcount: "4",
      budgetBand: "$$",
      notesRaw: "Casual spot, vegetarian friendly, not too loud",
    });
    
    toast({
      title: "Example loaded!",
      description: "Feel free to adjust any details",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive validation
    if (!formData.daypart) {
      toast({
        title: "Missing meal time",
        description: "Please select when you want to go out",
        variant: "destructive",
      });
      return;
    }

    if (!formData.dateStart) {
      toast({
        title: "Missing date",
        description: "Please select a date and time",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.neighborhood) {
      toast({
        title: "Missing location",
        description: "Please select a neighborhood",
        variant: "destructive",
      });
      return;
    }

    if (!formData.headcount) {
      toast({
        title: "Missing headcount",
        description: "Please select how many people",
        variant: "destructive",
      });
      return;
    }

    if (!formData.budgetBand) {
      toast({
        title: "Missing budget",
        description: "Please select your budget",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('plans-create', {
        body: {
          daypart: formData.daypart,
          date_start: formData.dateStart,
          date_end: formData.dateStart,
          neighborhood: formData.neighborhood,
          neighborhood_place_id: formData.neighborhoodPlaceId,
          neighborhood_lat: formData.neighborhoodLat,
          neighborhood_lng: formData.neighborhoodLng,
          headcount: parseInt(formData.headcount),
          budget_band: formData.budgetBand,
          two_stop: formData.twoStop,
          notes_raw: formData.notesRaw,
          notes_chips: chips,
          mode: resultMode,
        },
      });

      if (error) {
        console.error('Plan creation error:', error);
        throw error;
      }

      if (!data?.success || !data?.planId) {
        throw new Error('Invalid response from server');
      }

      const planId = data.planId;
      const token = data.token;

      // Store management token
      localStorage.setItem(`plan_${planId}_token`, token);

      // Track successful creation
      analytics.track('plan_created', {
        plan_id: planId,
        daypart: formData.daypart,
        neighborhood: formData.neighborhood,
        headcount: formData.headcount,
        budget_band: formData.budgetBand,
        result_mode: resultMode,
      });

      // Generate share URL
      const shareUrl = `${window.location.origin}/p/${planId}`;
      
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Plan created! Link copied",
          description: "Share it with your group to start voting",
        });
      } catch (clipErr) {
        console.warn('Clipboard copy failed:', clipErr);
        toast({
          title: "Plan created!",
          description: "Share the link to start voting",
        });
      }

      // Navigate to plan view
      navigate(`/p/${planId}`);
    } catch (error: any) {
      console.error('Error creating plan:', error);
      toast({
        title: "Could not create plan",
        description: "Something went wrong creating your plan. Try again?",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Hero Section - Compact */}
          <div className="text-center space-y-3 pt-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary">
              Create your plan
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Set the basics, get smart suggestions, let your group vote
            </p>
          </div>

          {/* Quick Benefits */}
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-accent" />
              </div>
              <span className="text-xs font-medium text-foreground">Under 30s</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-accent" />
              </div>
              <span className="text-xs font-medium text-foreground">Auto-suggest</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-accent" />
              </div>
              <span className="text-xs font-medium text-foreground">One-tap vote</span>
            </div>
          </div>

          {/* What Everyone Will See Preview */}
          <Card className="border-border bg-card max-w-2xl mx-auto">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">What everyone will see</CardTitle>
              <CardDescription className="text-sm">
                We'll show them {resultMode === 'top3' ? '3 great spots' : '~20 options'} matching your criteria. They tap to vote, you lock the winner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2.5 bg-muted/50 rounded-lg flex items-center justify-between border border-border">
                <span className="text-sm font-medium text-foreground">Cozy wine bar</span>
                <span className="text-xs text-muted-foreground">$$</span>
              </div>
              <div className="p-2.5 bg-muted/50 rounded-lg flex items-center justify-between border border-border">
                <span className="text-sm font-medium text-foreground">Casual taco spot</span>
                <span className="text-xs text-muted-foreground">$</span>
              </div>
              <div className="p-2.5 bg-muted/50 rounded-lg flex items-center justify-between border border-border">
                <span className="text-sm font-medium text-foreground">Italian bistro</span>
                <span className="text-xs text-muted-foreground">$$$</span>
              </div>
            </CardContent>
          </Card>

          {/* Try Example Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={fillExamplePlan}
              className="text-sm h-9"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Try an example plan
            </Button>
          </div>

          {/* Main Form */}
          <Card className="border-border bg-card max-w-2xl mx-auto">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                  1
                </div>
                <CardTitle className="text-lg">Set the basics</CardTitle>
              </div>
              <CardDescription className="text-sm">Takes about 15 seconds</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Occasion */}
                <div>
                  <Label htmlFor="daypart" className="text-sm font-medium text-foreground mb-2 block">
                    Occasion
                  </Label>
                  <RadioGroup
                    value={formData.daypart}
                    onValueChange={(value) => setFormData({ ...formData, daypart: value })}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                  >
                    <div>
                      <RadioGroupItem value="breakfast" id="breakfast" className="peer sr-only" />
                      <Label
                        htmlFor="breakfast"
                        className="flex items-center justify-center rounded-lg border-2 border-border bg-card p-2.5 hover:bg-accent/10 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-colors text-sm font-medium"
                      >
                        Breakfast
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="brunch" id="brunch" className="peer sr-only" />
                      <Label
                        htmlFor="brunch"
                        className="flex items-center justify-center rounded-lg border-2 border-border bg-card p-2.5 hover:bg-accent/10 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-colors text-sm font-medium"
                      >
                        Brunch
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="lunch" id="lunch" className="peer sr-only" />
                      <Label
                        htmlFor="lunch"
                        className="flex items-center justify-center rounded-lg border-2 border-border bg-card p-2.5 hover:bg-accent/10 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-colors text-sm font-medium"
                      >
                        Lunch
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="dinner" id="dinner" className="peer sr-only" />
                      <Label
                        htmlFor="dinner"
                        className="flex items-center justify-center rounded-lg border-2 border-border bg-card p-2.5 hover:bg-accent/10 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-colors text-sm font-medium"
                      >
                        Dinner
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Helps us find spots that match the time of day
                  </p>
                </div>

                {/* Date & Time */}
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Date & Time
                  </Label>
                  <DateTimePicker
                    value={formData.dateStart}
                    onChange={(value) => setFormData({ ...formData, dateStart: value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    When are you planning to meet?
                  </p>
                </div>

                {/* Neighborhood */}
                <div>
                  <Label htmlFor="neighborhood" className="text-sm font-medium text-foreground mb-2 block">
                    Neighborhood
                  </Label>
                  <PlacesAutocomplete
                    onChange={(place: any) => {
                      if (typeof place === 'string') {
                        setFormData({ ...formData, neighborhood: place });
                      } else {
                        setFormData({
                          ...formData,
                          neighborhood: place.description,
                          neighborhoodPlaceId: place.place_id,
                        });
                      }
                    }}
                    value={formData.neighborhood}
                    placeholder="e.g., Downtown Seattle"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Pick the area where your group is meeting
                  </p>
                </div>

                {/* Group Size */}
                <div>
                  <Label htmlFor="headcount" className="text-sm font-medium text-foreground mb-2 block">
                    Group Size
                  </Label>
                  <Input
                    id="headcount"
                    type="number"
                    min="1"
                    value={formData.headcount}
                    onChange={(e) => setFormData({ ...formData, headcount: e.target.value })}
                    className="border-border rounded-lg"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    We avoid places that can't fit your group
                  </p>
                </div>

                {/* Budget */}
                <div>
                  <Label htmlFor="budget" className="text-sm font-medium text-foreground mb-2 block">
                    Budget
                  </Label>
                  <RadioGroup
                    value={formData.budgetBand}
                    onValueChange={(value) => setFormData({ ...formData, budgetBand: value })}
                    className="grid grid-cols-4 gap-2"
                  >
                    <div>
                      <RadioGroupItem value="$" id="budget-1" className="peer sr-only" />
                      <Label
                        htmlFor="budget-1"
                        className="flex items-center justify-center rounded-lg border-2 border-border bg-card p-2.5 hover:bg-accent/10 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-colors text-sm font-medium"
                      >
                        $
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="$$" id="budget-2" className="peer sr-only" />
                      <Label
                        htmlFor="budget-2"
                        className="flex items-center justify-center rounded-lg border-2 border-border bg-card p-2.5 hover:bg-accent/10 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-colors text-sm font-medium"
                      >
                        $$
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="$$$" id="budget-3" className="peer sr-only" />
                      <Label
                        htmlFor="budget-3"
                        className="flex items-center justify-center rounded-lg border-2 border-border bg-card p-2.5 hover:bg-accent/10 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-colors text-sm font-medium"
                      >
                        $$$
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="$$$$" id="budget-4" className="peer sr-only" />
                      <Label
                        htmlFor="budget-4"
                        className="flex items-center justify-center rounded-lg border-2 border-border bg-card p-2.5 hover:bg-accent/10 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-colors text-sm font-medium"
                      >
                        $$$$
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    We match places to your price comfort zone
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-foreground mb-2 block">
                    Notes (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notesRaw}
                    onChange={(e) => setFormData({ ...formData, notesRaw: e.target.value })}
                    placeholder="e.g., vegetarian friendly, not too loud, outdoor seating"
                    className="border-border rounded-lg min-h-[70px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Any preferences or requirements
                  </p>
                </div>

                {/* Advanced Options */}
                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full flex items-center justify-between p-2.5 hover:bg-accent/10 rounded-lg text-sm"
                    >
                      <span className="font-medium text-foreground">Advanced options</span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${advancedOpen ? 'transform rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-foreground mb-2 block">
                        Result mode
                      </Label>
                      <RadioGroup
                        value={resultMode}
                        onValueChange={(value) => setResultMode(value as 'top3' | 'full20')}
                        className="space-y-2"
                      >
                        <div className="flex items-start space-x-2 p-3 rounded-lg border-2 border-border bg-card hover:bg-accent/5">
                          <RadioGroupItem value="top3" id="mode-top3" className="mt-0.5" />
                          <Label htmlFor="mode-top3" className="flex-1 cursor-pointer">
                            <div className="text-sm font-medium text-foreground">Show only the best 3 picks</div>
                            <div className="text-xs text-muted-foreground mt-0.5">Recommended – faster decisions</div>
                          </Label>
                        </div>
                        <div className="flex items-start space-x-2 p-3 rounded-lg border-2 border-border bg-card hover:bg-accent/5">
                          <RadioGroupItem value="full20" id="mode-full20" className="mt-0.5" />
                          <Label htmlFor="mode-full20" className="flex-1 cursor-pointer">
                            <div className="text-sm font-medium text-foreground">Show the full list of ~20 places</div>
                            <div className="text-xs text-muted-foreground mt-0.5">More options to choose from</div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Benefit Summary */}
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                  <p className="text-sm text-foreground flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
                    <span>
                      We'll generate the top picks and create a voting link you can share with your group.
                    </span>
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary h-11 text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating your plan...
                    </>
                  ) : (
                    'Create Plan'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="border-border bg-card max-w-2xl mx-auto">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">What happens next</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2.5 text-sm text-foreground">
                <li className="flex gap-2.5">
                  <span className="font-semibold text-accent flex-shrink-0">1.</span>
                  <span>We generate top suggestions in your area</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="font-semibold text-accent flex-shrink-0">2.</span>
                  <span>You get a link to share with your group</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="font-semibold text-accent flex-shrink-0">3.</span>
                  <span>They vote with one tap</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="font-semibold text-accent flex-shrink-0">4.</span>
                  <span>You lock the winner and everyone sees the plan</span>
                </li>
              </ol>
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                We don't track anyone. Nothing is shared publicly.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NewPlan;
