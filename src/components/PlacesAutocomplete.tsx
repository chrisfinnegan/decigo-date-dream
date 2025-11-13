import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string, placeData?: { place_id: string; lat: number; lng: number }) => void;
  placeholder?: string;
}

interface Suggestion {
  id: string;
  name: string;
  types: string[];
  lat?: number;
  lng?: number;
}

export const PlacesAutocomplete = ({ value, onChange, placeholder }: PlacesAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionToken] = useState(crypto.randomUUID());
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    // Debounce the API call
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Call our proxy endpoint instead of Google directly
        const { data, error } = await supabase.functions.invoke('places-autocomplete', {
          body: { 
            q: value,
            sessionToken,
          },
        });

        if (error) throw error;

        setSuggestions(data.predictions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching places:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1">
          <Command className="rounded-lg border shadow-md">
            <CommandList>
              {loading ? (
                <CommandEmpty>Loading...</CommandEmpty>
              ) : (
                <CommandGroup>
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => {
                        onChange(suggestion.name, {
                          place_id: suggestion.id,
                          lat: suggestion.lat || 0,
                          lng: suggestion.lng || 0
                        });
                        setShowSuggestions(false);
                      }}
                      className="cursor-pointer"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>{suggestion.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};
