import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface FeatureIconProps {
  section: string;
  prompt: string;
  alt: string;
}

export const FeatureIcon = ({ section, prompt, alt }: FeatureIconProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrGenerateIcon = async () => {
      try {
        // Check if icon already exists
        const { data: existing } = await supabase
          .from('illustrations')
          .select('image_url')
          .eq('section', section)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing?.image_url) {
          setImageUrl(existing.image_url);
          setLoading(false);
          return;
        }

        // Generate new icon
        const { data, error } = await supabase.functions.invoke('generate-illustration', {
          body: {
            section,
            prompt: `${prompt} Illustrated icon style with recognizable objects and scenes. Soft purple and coral color palette. Clean, modern, slightly 3D appearance with gentle shadows. No text. Square format, centered composition.`
          }
        });

        if (error) throw error;
        if (data?.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (error) {
        console.error(`Error loading ${section} icon:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrGenerateIcon();
  }, [section, prompt]);

  if (loading) {
    return <Skeleton className="w-16 h-16 rounded-lg" />;
  }

  if (!imageUrl) return null;

  return (
    <img 
      src={imageUrl} 
      alt={alt}
      className="w-16 h-16 rounded-lg"
      loading="lazy"
    />
  );
};