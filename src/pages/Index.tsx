import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroWaveBackground } from "@/components/HeroWaveBackground";
import { HeroIllustration } from "@/components/illustrations/HeroIllustration";
import { FeatureIcon } from "@/components/illustrations/FeatureIcon";
import { SectionIllustration } from "@/components/illustrations/SectionIllustration";
import aiBackgroundImg from "@/assets/ai-background-illustration.png";

const Index = () => {
  useEffect(() => {
    analytics.track('lp_view', { lp_version: 'clusive_v3' });
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-[64px]">
        {/* Hero Section */}
        <section className="bg-background relative">
          <HeroWaveBackground />
          <div className="max-w-[1200px] mx-auto px-6 pt-24 md:pt-32 pb-20 md:pb-32 text-center relative z-10">
            <div className="space-y-8 max-w-[900px] mx-auto">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">
                For your closest groups
              </div>
              
              <h1 className="text-4xl md:text-6xl font-semibold leading-[1.1] text-foreground tracking-tight">
                Belong together, more often.
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-[680px] mx-auto leading-[1.5]">
                Clusive is an AI-powered home for your small groups. It remembers what you like, finds times that work, and turns "we should hang" into real plans without the group-chat chaos.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link to="/new" onClick={() => { analytics.track('cta_get_early_access', { location: 'hero' }); window.scrollTo(0, 0); }}>
                  <Button size="lg" className="text-sm px-7">
                    Get early access
                  </Button>
                </Link>
                <button 
                  onClick={() => {
                    analytics.track('see_how_it_works_click', { location: 'hero' });
                    document.getElementById('what-clusive-does')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  See how it works →
                </button>
              </div>
              
              <HeroIllustration />
            </div>
          </div>
        </section>

        {/* Section 1 - What Clusive Does */}
        <section className="py-16 md:py-24 px-6 bg-secondary/30">
          <div className="max-w-[900px] mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground leading-[1.2]">
              Less planning. More showing up.
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 text-base md:text-lg text-muted-foreground leading-[1.6]">
              <div className="space-y-2">
                <p className="font-medium text-foreground">Smart suggestions</p>
                <p className="text-sm md:text-base">Times and ideas that fit everyone.</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">One-tap plans</p>
                <p className="text-sm md:text-base">Say yes, pass, or suggest another time in a tap.</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">Routines that stick</p>
                <p className="text-sm md:text-base">Keep your dinners, walks, and game nights going.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 - Who It's For */}
        <section id="what-clusive-does" className="py-16 md:py-24 px-6 bg-background">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <SectionIllustration 
                  section="small-groups"
                  prompt="A warm, joyful scene of 5-6 diverse friends kayaking together on calm water during golden hour. They're paddling side by side, some laughing and talking across kayaks. Natural lighting with purple and coral reflections on the water. Realistic but stylized illustration."
                  alt="Small groups kayaking together"
                  className="w-full rounded-2xl shadow-lg"
                />
              </div>
              <div className="space-y-6 order-1 md:order-2">
                <h2 className="text-3xl md:text-4xl font-semibold text-foreground leading-[1.2]">
                  Built for 2 to 8 people you'd be sad to lose.
                </h2>
                
                <p className="text-base md:text-lg text-muted-foreground leading-[1.6]">
                  Couples, best friends, group chats that actually want to meet, side-project crews, housemates, and small circles that want to keep showing up for each other.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 - AI in the Background */}
        <section className="py-16 md:py-24 px-6 bg-secondary/30">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-semibold text-foreground leading-[1.2]">
                  AI in the background. People in the center.
                </h2>
                
                <p className="text-base md:text-lg text-muted-foreground leading-[1.6]">
                  Clusive quietly learns when you can meet and what you enjoy, then handles the logistics so your group doesn't have to.
                </p>
              </div>
              <div>
                <img 
                  src={aiBackgroundImg}
                  alt="AI supporting human connection illustration"
                  className="w-full h-auto rounded-2xl shadow-lg"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 - Closing Band */}
        <section className="py-16 md:py-24 px-6 bg-background">
          <div className="max-w-[700px] mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground leading-[1.2]">
              Make it easy to stay close.
            </h2>
            
            <p className="text-base md:text-lg text-muted-foreground leading-[1.6]">
              Join the early access list and be one of the first groups on Clusive.
            </p>

            <div className="pt-2">
              <Link to="/new" onClick={() => { analytics.track('cta_join_waitlist', { location: 'closing_band' }); window.scrollTo(0, 0); }}>
                <Button size="lg" className="text-sm px-7">
                  Join the waitlist for Clusive
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
};

export default Index;
