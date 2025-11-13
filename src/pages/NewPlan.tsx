import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";
import { analytics } from "@/lib/analytics";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { X, CheckCircle, Zap, Users } from "lucide-react";

const NewPlan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resultMode, setResultMode] = useState<'top3' | 'full20'>('top3');
  const [chips, setChips] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    dateStart: "",
    dateEnd: "",
    neighborhood: "",
    neighborhoodPlaceId: "",
    neighborhoodLat: 0,
    neighborhoodLng: 0,
    headcount: "2",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('plans-create', {
        body: {
          daypart: formData.daypart,
          date_start: formData.dateStart,
          date_end: formData.dateEnd,
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

      if (error) throw error;

      analytics.trackIntakeComplete({
        daypart: formData.daypart,
        neighborhood: formData.neighborhood,
        headcount: parseInt(formData.headcount),
        budget_band: formData.budgetBand,
        result_mode: resultMode,
      });

      if (data.magicToken) {
        localStorage.setItem(`plan_${data.planId}_token`, data.magicToken);
      }

      toast({
        title: "Plan created!",
        description: "You can now share the voting link with your group",
      });

      localStorage.setItem(`plan_${data.planId}_mode`, resultMode);
      navigate(`/p/${data.planId}`);
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToIntake = () => {
    const intakeSection = document.getElementById('intake-section');
    if (intakeSection) {
      intakeSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartPlanning = () => {
    analytics.track('hero_start_planning');
    scrollToIntake();
  };

  const handleWatchDemo = () => {
    analytics.track('hero_watch_demo');
    toast({
      title: "Coming soon",
      description: "Demo video will be available shortly",
    });
  };

  return (
    <div className="min-h-screen bg-decigo-cream">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-decigo-cream py-16 px-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-10">
          <div className="brand-gradient w-full h-full rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-decigo-deep-teal mb-6 leading-tight">
            Plans in minutes, not message storms.
          </h1>
          
          <p className="text-xl text-decigo-slate-700 mb-8 max-w-2xl mx-auto">
            AI-powered shortlists tailored to your time, place, budget, and vibe.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button onClick={handleStartPlanning} className="btn-primary">
              Start planning
            </button>
            <button onClick={handleWatchDemo} className="btn-secondary">
              See a 30-sec demo
            </button>
          </div>
          
          {/* Benefits Row */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="w-10 h-10 text-decigo-teal mb-3" />
              <h3 className="font-bold text-decigo-deep-teal mb-2">Three great options</h3>
              <p className="text-sm text-decigo-slate-700">Curated picks that match your vibe</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Zap className="w-10 h-10 text-decigo-green mb-3" />
              <h3 className="font-bold text-decigo-deep-teal mb-2">Tap to vote & lock</h3>
              <p className="text-sm text-decigo-slate-700">Quick consensus without the back-and-forth</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Users className="w-10 h-10 text-decigo-lime mb-3" />
              <h3 className="font-bold text-decigo-deep-teal mb-2">Out of the thread, still connected</h3>
              <p className="text-sm text-decigo-slate-700">Everyone votes on their own time</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Intake Section */}
      <section id="intake-section" className="py-12 px-4 relative z-20">
        <div className="max-w-md mx-auto card">
          <h2 className="text-2xl font-bold text-decigo-deep-teal mb-6 text-center">Create Your Plan</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="dateStart" className="text-decigo-deep-teal font-medium">Start Date & Time</Label>
                <Input
                  id="dateStart"
                  type="datetime-local"
                  value={formData.dateStart}
                  onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
                  className="rounded-xl border-decigo-slate-300 focus:ring-decigo-green"
                  required
                />
              </div>

              <div className="space-y-2 flex-1">
                <Label htmlFor="dateEnd" className="text-decigo-deep-teal font-medium">End Date & Time</Label>
                <Input
                  id="dateEnd"
                  type="datetime-local"
                  value={formData.dateEnd}
                  onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
                  className="rounded-xl border-decigo-slate-300 focus:ring-decigo-green"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood" className="text-decigo-deep-teal font-medium">Neighborhood</Label>
              <PlacesAutocomplete
                value={formData.neighborhood}
                onChange={(value, placeData) => setFormData({ 
                  ...formData, 
                  neighborhood: value,
                  neighborhoodPlaceId: placeData?.place_id || '',
                  neighborhoodLat: placeData?.lat || 0,
                  neighborhoodLng: placeData?.lng || 0,
                })}
                placeholder="e.g., SoHo, Brooklyn"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headcount" className="text-decigo-deep-teal font-medium">Headcount</Label>
              <Select
                value={formData.headcount}
                onValueChange={(value) => setFormData({ ...formData, headcount: value })}
              >
                <SelectTrigger className="rounded-xl border-decigo-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 7, 8].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n} people</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetBand" className="text-decigo-deep-teal font-medium">Budget</Label>
              <Select
                value={formData.budgetBand}
                onValueChange={(value) => setFormData({ ...formData, budgetBand: value })}
              >
                <SelectTrigger className="rounded-xl border-decigo-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">$ (Budget-friendly)</SelectItem>
                  <SelectItem value="$$">$$ (Moderate)</SelectItem>
                  <SelectItem value="$$$">$$$ (Upscale)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daypart" className="text-decigo-deep-teal font-medium">Daypart</Label>
              <Select
                value={formData.daypart}
                onValueChange={(value) => setFormData({ ...formData, daypart: value })}
              >
                <SelectTrigger className="rounded-xl border-decigo-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="brunch">Brunch</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="drinks">Drinks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="twoStop" className="text-decigo-deep-teal font-medium">Two-stop itinerary</Label>
              <Switch
                id="twoStop"
                checked={formData.twoStop}
                onCheckedChange={(checked) => setFormData({ ...formData, twoStop: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notesRaw" className="text-decigo-deep-teal font-medium">Anything else?</Label>
              <Textarea
                id="notesRaw"
                placeholder="Any preferences, dietary restrictions, or special requests..."
                value={formData.notesRaw}
                onChange={(e) => setFormData({ ...formData, notesRaw: e.target.value })}
                onBlur={generateChips}
                rows={4}
                className="rounded-xl border-decigo-slate-300 focus:ring-decigo-green"
              />
              {chips.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {chips.map((chip, i) => (
                    <Badge key={i} className="chip gap-1">
                      {chip}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeChip(chip)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-decigo-deep-teal font-medium">Result Mode</Label>
              <RadioGroup value={resultMode} onValueChange={(v) => setResultMode(v as 'top3' | 'full20')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="top3" id="top3" />
                  <Label htmlFor="top3" className="font-normal cursor-pointer text-decigo-slate-700">
                    Top 3 (Recommended) - Quick decision
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full20" id="full20" />
                  <Label htmlFor="full20" className="font-normal cursor-pointer text-decigo-slate-700">
                    Full List (~20) - More options
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="btn-primary w-full h-12 text-base" disabled={loading}>
              {loading ? "Creating..." : "Create Plan"}
            </Button>
          </form>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default NewPlan;
