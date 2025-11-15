import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Image, GripVertical } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Option {
  id: string;
  name: string;
  address: string;
  price_band: string;
  why_it_fits: string;
  tip?: string;
  lat: number;
  lng: number;
  rank: number;
  photo_ref?: string;
}

interface RankingInterfaceProps {
  options: Option[];
  groupSize: number;
  onSubmitRankings: (rankings: Record<string, number>) => Promise<void>;
  existingRankings?: Record<string, number>;
  getMapThumbnail: (option: Option) => string | null;
}

export const RankingInterface = ({ 
  options, 
  groupSize,
  onSubmitRankings, 
  existingRankings,
  getMapThumbnail 
}: RankingInterfaceProps) => {
  const [rankedOptions, setRankedOptions] = useState<Option[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Initialize rankings - either from existing or default order
    if (existingRankings && Object.keys(existingRankings).length === 3) {
      // Sort options by their existing rank
      const sorted = [...options].sort((a, b) => {
        return (existingRankings[a.id] || 99) - (existingRankings[b.id] || 99);
      });
      setRankedOptions(sorted);
    } else {
      // Default: use the original ranking order
      setRankedOptions([...options].sort((a, b) => a.rank - b.rank));
    }
  }, [options, existingRankings]);

  const moveOption = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= rankedOptions.length) return;
    
    const newRanked = [...rankedOptions];
    const [movedOption] = newRanked.splice(fromIndex, 1);
    newRanked.splice(toIndex, 0, movedOption);
    setRankedOptions(newRanked);
  };

  const handleSubmit = async () => {
    if (rankedOptions.length !== 3) {
      toast({
        title: "Error",
        description: "Please rank all 3 options",
        variant: "destructive",
      });
      return;
    }

    // Convert array order to rankings object (1st, 2nd, 3rd)
    const rankings: Record<string, number> = {};
    rankedOptions.forEach((option, index) => {
      rankings[option.id] = index + 1; // 1st place = 1, 2nd = 2, 3rd = 3
    });

    setSubmitting(true);
    try {
      await onSubmitRankings(rankings);
    } finally {
      setSubmitting(false);
    }
  };

  const isComplete = rankedOptions.length === 3;
  const hasExistingRankings = existingRankings && Object.keys(existingRankings).length === 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-primary/5 border-primary/10">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-primary">
            {groupSize === 2 ? "🌟 Date Night Harmony" : "👥 Small Group Decision"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {groupSize === 2 
              ? "Rank all 3 spots. We'll find the best match for both of you." 
              : "Each of you, rank all 3 options. We'll pick the favorite of the group."}
          </p>
          {hasExistingRankings && (
            <Badge variant="secondary" className="mt-2">
              ✓ Your rankings are saved
            </Badge>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="card bg-accent/10 border-accent/20">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">How it works:</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Drag options to reorder them (or use the arrow buttons)</li>
            <li>Your #1 choice gets the most weight</li>
            <li>Everyone's rankings are combined to pick the winner</li>
          </ul>
        </div>
      </div>

      {/* Ranking List */}
      <div className="space-y-3">
        {rankedOptions.map((option, index) => {
          const thumbnail = getMapThumbnail(option);
          const rankLabels = ["🥇 1st Choice", "🥈 2nd Choice", "🥉 3rd Choice"];
          
          return (
            <div 
              key={option.id}
              className="card border-2 transition-all"
            >
              <div className="flex items-start gap-3">
                {/* Rank Badge */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <Badge className="bg-primary text-white text-xs whitespace-nowrap">
                    {rankLabels[index]}
                  </Badge>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveOption(index, index - 1)}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      ↑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveOption(index, index + 1)}
                      disabled={index === rankedOptions.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      ↓
                    </Button>
                  </div>
                </div>

                {/* Option Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row gap-3">
                    {/* Image */}
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={option.name}
                        className="w-full md:w-32 h-24 object-cover rounded-lg flex-shrink-0"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full md:w-32 h-24 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center ${thumbnail ? 'hidden' : ''}`}>
                      <Image className="w-6 h-6 text-muted-foreground" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-primary text-base">
                            {option.name}
                          </h3>
                          <span className="chip text-xs flex-shrink-0">{option.price_band}</span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{option.address}</span>
                        </p>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {option.why_it_fits}
                      </p>

                      {option.tip && (
                        <div className="chip inline-block text-xs">
                          💡 {option.tip}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-4 z-10">
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || submitting}
          className="w-full h-14 text-lg font-semibold"
          size="lg"
        >
          {submitting ? "Submitting..." : hasExistingRankings ? "Update My Rankings" : "Submit My Rankings"}
        </Button>
      </div>

      {/* Status Message */}
      {!isComplete && (
        <div className="card bg-destructive/10 border-destructive/20 text-center">
          <p className="text-sm text-destructive font-medium">
            Please rank all 3 options before submitting
          </p>
        </div>
      )}
    </div>
  );
};
