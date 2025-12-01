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
          .eq('section', 'hero-v3')
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
            section: 'hero-v3',
            prompt: 'A bold, modern photo of 4-5 real diverse friends genuinely laughing and collaborating around a phone in an urban coffee shop. Natural daylight streaming through large windows. Candid, authentic moment captured documentary-style. Sharp focus on faces showing real joy and connection. Warm, cinematic color grading with rich purples and corals in the environment. Shot on professional camera with shallow depth of field. Photorealistic, NOT illustrated or animated. 16:9 aspect ratio. Magazine editorial photography style.'
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