import heroImage from "@/assets/hero-illustration.png";

export const HeroIllustration = () => {
  return (
    <div className="mt-12 max-w-[800px] mx-auto">
      <img 
        src={heroImage} 
        alt="Connected groups illustration" 
        className="w-full h-auto rounded-2xl shadow-lg"
        loading="eager"
        fetchPriority="high"
      />
    </div>
  );
};