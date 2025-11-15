import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";
import { DateTimePicker } from "@/components/DateTimePicker";
import { analytics } from "@/lib/analytics";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { X, ChevronDown } from "lucide-react";

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

  const removeChip = (chip: string) => {
    setChips(chips.filter(c => c !== chip));
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
    <div className="min-h-screen bg-decigo-cream">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        
        {/* 1. Explanation Panel */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-decigo-deep-teal">
            Create a quick plan for your group
          </h1>
          <p className="text-xl text-decigo-slate-700 max-w-2xl mx-auto">
            Tell us when and where. We'll suggest the best spots and everyone votes to decide.
          </p>
          
          {/* Benefits Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-sm font-medium text-decigo-slate-700">Takes under 30 seconds</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl mb-2">🤖</div>
              <p className="text-sm font-medium text-decigo-slate-700">We suggest places automatically</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl mb-2">👥</div>
              <p className="text-sm font-medium text-decigo-slate-700">Your group votes with one tap</p>
            </div>
          </div>
        </div>

        {/* 2. What Everyone Will See Preview */}
        <Card className="p-6 bg-white border-2 border-decigo-green/20">
          <h3 className="text-lg font-bold text-decigo-deep-teal mb-3">
            What everyone will see
          </h3>
          <p className="text-sm text-decigo-slate-700 mb-4">
            We'll show everyone {resultMode === 'top3' ? '3' : '~20'} great spots in your chosen area. They tap to vote, and you lock in the winner.
          </p>
          
          {/* Preview Option Rows */}
          <div className="space-y-2">
            <div className="p-3 border border-decigo-slate-200 rounded-lg bg-decigo-cream/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-decigo-deep-teal">Cozy wine bar</p>
                  <p className="text-xs text-decigo-slate-600">$$ • Quiet atmosphere</p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-decigo-green"></div>
              </div>
            </div>
            <div className="p-3 border border-decigo-slate-200 rounded-lg bg-decigo-cream/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-decigo-deep-teal">Casual taco spot</p>
                  <p className="text-xs text-decigo-slate-600">$ • Lively vibes</p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-decigo-slate-300"></div>
              </div>
            </div>
            {resultMode === 'top3' && (
              <div className="p-3 border border-decigo-slate-200 rounded-lg bg-decigo-cream/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-decigo-deep-teal">Italian bistro</p>
                    <p className="text-xs text-decigo-slate-600">$$$ • Romantic setting</p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-decigo-slate-300"></div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Try Example Button */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={fillExamplePlan}
            className="border-decigo-green text-decigo-deep-teal hover:bg-decigo-green/10"
          >
            Try an example plan
          </Button>
        </div>

        {/* Main Form Card */}
        <Card className="p-6 md:p-8">
          {/* 3. Step Label */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-decigo-slate-600 mb-4">
              Step 1: Set the basics (15 seconds)
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Daypart */}
            <div>
              <Label htmlFor="daypart" className="text-decigo-deep-teal font-medium">
                Occasion
              </Label>
              <RadioGroup
                value={formData.daypart}
                onValueChange={(value) => setFormData({ ...formData, daypart: value })}
                className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2"
              >
                {['breakfast', 'brunch', 'lunch', 'dinner', 'drinks'].map((option) => (
                  <div key={option} className="flex items-center space-x-2 p-3 border rounded-lg hover:border-decigo-green cursor-pointer">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="cursor-pointer capitalize flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-decigo-slate-600 mt-1">
                Helps us find spots that match the time of day.
              </p>
            </div>

            {/* Date & Time */}
            <div>
              <Label className="text-decigo-deep-teal font-medium">
                Date & Time
              </Label>
              <DateTimePicker
                value={formData.dateStart}
                onChange={(value) => setFormData({ ...formData, dateStart: value })}
              />
            </div>

            {/* Neighborhood */}
            <div>
              <Label htmlFor="neighborhood" className="text-decigo-deep-teal font-medium">
                Neighborhood
              </Label>
              <PlacesAutocomplete
                value={formData.neighborhood}
                onChange={(value, placeData) => {
                  if (placeData) {
                    setFormData({
                      ...formData,
                      neighborhood: value,
                      neighborhoodPlaceId: placeData.place_id,
                      neighborhoodLat: placeData.lat,
                      neighborhoodLng: placeData.lng,
                    });
                  } else {
                    setFormData({
                      ...formData,
                      neighborhood: value,
                    });
                  }
                }}
              />
              <p className="text-xs text-decigo-slate-600 mt-1">
                Pick the area where your group is meeting.
              </p>
            </div>

            {/* Headcount */}
            <div>
              <Label htmlFor="headcount" className="text-decigo-deep-teal font-medium">
                Group Size
              </Label>
              <Input
                id="headcount"
                type="number"
                min="1"
                value={formData.headcount}
                onChange={(e) => setFormData({ ...formData, headcount: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-decigo-slate-600 mt-1">
                We avoid places that can't fit your group size.
              </p>
            </div>

            {/* Budget */}
            <div>
              <Label htmlFor="budget" className="text-decigo-deep-teal font-medium">
                Budget
              </Label>
              <RadioGroup
                value={formData.budgetBand}
                onValueChange={(value) => setFormData({ ...formData, budgetBand: value })}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2"
              >
                {['$', '$$', '$$$', '$$$$'].map((budget) => (
                  <div key={budget} className="flex items-center space-x-2 p-3 border rounded-lg hover:border-decigo-green cursor-pointer">
                    <RadioGroupItem value={budget} id={`budget-${budget}`} />
                    <Label htmlFor={`budget-${budget}`} className="cursor-pointer flex-1">
                      {budget} {budget === '$' && 'Budget'}
                      {budget === '$$' && 'Moderate'}
                      {budget === '$$$' && 'Upscale'}
                      {budget === '$$$$' && 'Luxury'}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-decigo-slate-600 mt-1">
                We match places to your price comfort zone.
              </p>
            </div>

            {/* Optional Notes */}
            <div>
              <Label htmlFor="notes" className="text-decigo-deep-teal font-medium">
                Additional Notes (optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="e.g., Vegetarian options, outdoor seating, quiet atmosphere"
                value={formData.notesRaw}
                onChange={(e) => setFormData({ ...formData, notesRaw: e.target.value })}
                onBlur={generateChips}
                className="mt-1"
                rows={3}
              />
              {chips.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {chips.map((chip) => (
                    <Badge
                      key={chip}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeChip(chip)}
                    >
                      {chip}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Advanced Options - Collapsible */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-semibold text-decigo-slate-600 hover:text-decigo-deep-teal">
                <span>Advanced options</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                <div>
                  <Label className="text-decigo-deep-teal font-medium">
                    Result Mode
                  </Label>
                  <RadioGroup
                    value={resultMode}
                    onValueChange={(value: 'top3' | 'full20') => setResultMode(value)}
                    className="space-y-3 mt-2"
                  >
                    <div className="flex items-start space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="top3" id="mode-top3" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="mode-top3" className="font-medium cursor-pointer">
                          Show only the best 3 picks (recommended)
                        </Label>
                        <p className="text-xs text-decigo-slate-600 mt-1">
                          Best for quick decisions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="full20" id="mode-full20" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="mode-full20" className="font-medium cursor-pointer">
                          Show the full list of ~20 places
                        </Label>
                        <p className="text-xs text-decigo-slate-600 mt-1">
                          Give your group more options to explore
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* 6. Benefit Summary above button */}
            <div className="pt-4 border-t">
              <p className="text-sm text-decigo-slate-600 text-center mb-4">
                We'll generate the top picks and create a voting link you can share with your group.
              </p>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 btn-primary text-base"
              >
                {loading ? "Creating your plan..." : "Create Plan"}
              </Button>
            </div>
          </form>
        </Card>

        {/* 8. What Happens Next Box */}
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-bold text-decigo-deep-teal mb-4">
            What happens next?
          </h3>
          <ol className="space-y-3 text-sm text-decigo-slate-700">
            <li className="flex gap-3">
              <span className="font-bold text-decigo-green">1.</span>
              <span>We generate top suggestions in your area.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-decigo-green">2.</span>
              <span>You get a link to share with your group.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-decigo-green">3.</span>
              <span>They vote with one tap.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-decigo-green">4.</span>
              <span>You lock the winner and everyone sees the plan.</span>
            </li>
          </ol>
          
          {/* 9. Privacy Reassurance */}
          <p className="text-xs text-decigo-slate-500 text-center mt-6 pt-4 border-t">
            We don't track anyone. Nothing is shared publicly.
          </p>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default NewPlan;
