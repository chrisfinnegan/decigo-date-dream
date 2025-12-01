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
              
              <h1 className="text-5xl md:text-7xl font-semibold leading-[1.1] text-foreground tracking-tight">
                Belong together, more often.
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-[720px] mx-auto leading-[1.5]">
                Clusive is an AI-powered home for your small groups. It remembers what you like, finds times that work, and turns "we should hang" into real plans without the group-chat chaos.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link to="/new" onClick={() => { analytics.track('cta_get_early_access', { location: 'hero' }); window.scrollTo(0, 0); }}>
                  <Button size="lg" className="text-base px-8">
                    Get early access
                  </Button>
                </Link>
                <button 
                  onClick={() => {
                    analytics.track('see_how_it_works_click', { location: 'hero' });
                    document.getElementById('what-clusive-does')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  See how it works →
                </button>
              </div>
              
              <HeroIllustration />
            </div>
          </div>
        </section>

        {/* Section 1 - What Clusive Does */}
        <section className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-12 leading-[1.2]">
              Less planning. More showing up.
            </h2>
            
            <div className="space-y-8 text-lg md:text-xl text-muted-foreground leading-[1.7]">
              <div className="space-y-3">
                <p><span className="font-medium text-foreground">Smart suggestions:</span> Times and ideas that fit everyone.</p>
                <p><span className="font-medium text-foreground">One-tap plans:</span> Say yes, pass, or suggest another time in a tap.</p>
                <p><span className="font-medium text-foreground">Routines that stick:</span> Keep your dinners, walks, and game nights going.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 - Who It's For */}
        <section id="what-clusive-does" className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[800px] mx-auto text-center space-y-12">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-12 leading-[1.2]">
              Built for 2 to 8 people you'd be sad to lose.
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-[1.7]">
              Couples, best friends, group chats that actually want to meet, side-project crews, housemates, and small circles that want to keep showing up for each other.
            </p>
            
            <SectionIllustration 
              section="small-groups"
              prompt="A warm scene of 5-6 diverse friends sitting in a casual circle, laughing together in a cozy living room or cafe. Natural lighting, purple and coral accents. Realistic but stylized illustration."
              alt="Small groups illustration"
              className="max-w-[600px] mx-auto shadow-lg"
            />
          </div>
        </section>

        {/* Section 3 - AI in the Background */}
        <section className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[800px] mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-8 leading-[1.2]">
              AI in the background. People in the center.
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-[1.7] max-w-[720px] mx-auto">
              Clusive quietly learns when you can meet and what you enjoy, then handles the logistics so your group doesn't have to.
            </p>
          </div>
        </section>

        {/* Section 4 - Closing Band */}
        <section className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[800px] mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground leading-[1.2]">
              Make it easy to stay close.
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-[1.7]">
              Join the early access list and be one of the first groups on Clusive.
            </p>

            <div className="pt-4">
              <Link to="/new" onClick={() => { analytics.track('cta_join_waitlist', { location: 'closing_band' }); window.scrollTo(0, 0); }}>
                <Button size="lg" className="text-base px-8">
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
