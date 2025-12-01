import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface SectionIllustrationProps {
  section: string;
  prompt: string;
  alt: string;
  className?: string;
}

export const SectionIllustration = ({ section, prompt, alt, className = "" }: SectionIllustrationProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const fetchOrGenerateIllustration = async () => {
      try {
        // Check if illustration already exists
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

        // Generate new illustration
        const { data, error } = await supabase.functions.invoke('generate-illustration', {
          body: {
            section,
            prompt: `${prompt} Use soft gradients with warm purple, pink, and coral tones. Minimalist abstract style with flowing organic shapes. No text. Modern, clean, inviting aesthetic.`
          }
        });

        if (error) throw error;
        if (data?.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (error) {
        console.error(`Error loading ${section} illustration:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrGenerateIllustration();
  }, [isVisible, section, prompt]);

  return (
    <div ref={imgRef} className={className}>
      {loading || !imageUrl ? (
        <Skeleton className="w-full h-[300px] rounded-2xl" />
      ) : (
        <img 
          src={imageUrl} 
          alt={alt}
          className="w-full h-auto rounded-2xl"
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};