import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const HeroIllustration = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrGenerateIllustration = async () => {
      try {
        // Check if illustration already exists
        const { data: existing } = await supabase
          .from('illustrations')
          .select('image_url')
          .eq('section', 'hero-v2')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing?.image_url) {
          setImageUrl(existing.image_url);
          setLoading(false);
          return;
        }

        // Generate new illustration
        const { data, error } = await supabase.functions.invoke('generate-illustration', {
          body: {
            section: 'hero-v2',
            prompt: 'A vibrant scene of 4-5 diverse friends joyfully planning together in a bright, modern space. They are gathered naturally, some sitting, some standing, with genuine smiles and animated gestures. Soft purple and coral lighting creates warmth. One person holds a phone showing a plan. Wide angle, eye-level perspective. Contemporary, clean illustration style with rich colors and natural depth. 16:9 aspect ratio. Realistic but stylized with an optimistic, energetic mood.'
          }
        });

        if (error) throw error;
        if (data?.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (error) {
        console.error('Error loading hero illustration:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrGenerateIllustration();
  }, []);

  if (loading) {
    return (
      <div className="mt-12 max-w-[800px] mx-auto">
        <Skeleton className="w-full h-[300px] md:h-[450px] rounded-2xl" />
      </div>
    );
  }

  if (!imageUrl) return null;

  return (
    <div className="mt-12 max-w-[800px] mx-auto">
      <img 
        src={imageUrl} 
        alt="Connected groups illustration" 
        className="w-full h-auto rounded-2xl shadow-lg"
        loading="lazy"
      />
    </div>
  );
};