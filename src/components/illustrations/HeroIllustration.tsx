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
          .eq('section', 'hero-v5')
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
            section: 'hero-v5',
            prompt: 'Stylized illustration of connected people using minimalist geometric shapes. Multiple colorful overlapping circles and rounded forms representing diverse individuals coming together. Warm gradient colors flowing from coral to purple to soft pink. Clean, modern vector art with depth through transparency and layering. Sense of unity and collaboration through intersecting shapes. Smooth curves and flowing lines. 16:9 aspect ratio. Contemporary flat design with subtle dimensional effects.'
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