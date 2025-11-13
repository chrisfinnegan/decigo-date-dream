import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const NewPlan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dateStart: "",
    dateEnd: "",
    neighborhood: "",
    headcount: "2",
    budgetBand: "$$",
    daypart: "dinner",
    twoStop: false,
    notesRaw: "",
  });

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
          headcount: parseInt(formData.headcount),
          budget_band: formData.budgetBand,
          two_stop: formData.twoStop,
          notes_raw: formData.notesRaw,
          notes_chips: [],
        },
      });

      if (error) throw error;

      toast({
        title: "Plan created!",
        description: "Redirecting to your plan...",
      });

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
            <Input
              id="neighborhood"
              type="text"
              placeholder="e.g., SoHo, Brooklyn"
              value={formData.neighborhood}
              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              required
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
              rows={4}
            />
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
