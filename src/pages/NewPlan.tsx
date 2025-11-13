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
import { X } from "lucide-react";

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
    // Simple chip generation from notes
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
      // Call plans-create edge function
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

      // Store magic token for management access
      if (data.magicToken) {
        localStorage.setItem(`plan_${data.planId}_token`, data.magicToken);
      }

      toast({
        title: "Plan created!",
        description: "You can now share the voting link with your group",
      });

      // Store result mode preference
      localStorage.setItem(`plan_${data.planId}_mode`, resultMode);

      // Navigate to plan view
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Create New Plan</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="dateStart">Start Date & Time</Label>
            <Input
              id="dateStart"
              type="datetime-local"
              value={formData.dateStart}
              onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateEnd">End Date & Time</Label>
            <Input
              id="dateEnd"
              type="datetime-local"
              value={formData.dateEnd}
              onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Neighborhood</Label>
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
            <Label htmlFor="headcount">Headcount</Label>
            <Select
              value={formData.headcount}
              onValueChange={(value) => setFormData({ ...formData, headcount: value })}
            >
              <SelectTrigger>
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
            <Label htmlFor="budgetBand">Budget</Label>
            <Select
              value={formData.budgetBand}
              onValueChange={(value) => setFormData({ ...formData, budgetBand: value })}
            >
              <SelectTrigger>
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
            <Label htmlFor="daypart">Daypart</Label>
            <Select
              value={formData.daypart}
              onValueChange={(value) => setFormData({ ...formData, daypart: value })}
            >
              <SelectTrigger>
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

          <div className="flex items-center justify-between">
            <Label htmlFor="twoStop">Two-stop itinerary</Label>
            <Switch
              id="twoStop"
              checked={formData.twoStop}
              onCheckedChange={(checked) => setFormData({ ...formData, twoStop: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notesRaw">Anything else?</Label>
            <Textarea
              id="notesRaw"
              placeholder="Any preferences, dietary restrictions, or special requests..."
              value={formData.notesRaw}
              onChange={(e) => setFormData({ ...formData, notesRaw: e.target.value })}
              onBlur={generateChips}
              rows={4}
            />
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {chips.map((chip, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {chip}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeChip(chip)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Result Mode</Label>
            <RadioGroup value={resultMode} onValueChange={(v) => setResultMode(v as 'top3' | 'full20')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="top3" id="top3" />
                <Label htmlFor="top3" className="font-normal cursor-pointer">
                  Top 3 (Recommended) - Quick decision
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full20" id="full20" />
                <Label htmlFor="full20" className="font-normal cursor-pointer">
                  Full List (~20) - More options
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Plan"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NewPlan;
