import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroWaveBackground } from "@/components/HeroWaveBackground";

const Index = () => {
  useEffect(() => {
    analytics.track('lp_view', { lp_version: 'clusive_v1' });
  }, []);

  const returningUser = localStorage.getItem('decigo_returning_user');

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-[64px]">
        {/* Hero Section - Full-width with centered content */}
        <section className="relative overflow-hidden bg-background">
          <HeroWaveBackground />
          <div className="relative max-w-[1040px] mx-auto px-6 pt-28 pb-24">
            <div className="text-center space-y-6">
              {returningUser && (
                <div className="inline-flex items-center bg-secondary text-foreground px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                  Welcome back
                </div>
              )}
              
              <div className="uppercase text-[0.75rem] tracking-[0.15em] text-muted-foreground font-medium">
                AI Social Infrastructure
              </div>
              
              <h1 className="text-5xl md:text-6xl font-semibold leading-[1.1] text-foreground">
                The invisible fabric<br />
                between people.
              </h1>
              
              <p className="text-base text-muted-foreground max-w-[580px] mx-auto leading-[1.6]">
                Clusive keeps your group's rituals alive with gentle, well-timed prompts. Coordinate effortlessly. Build rhythms that last.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link to="/new" onClick={() => { analytics.track('cta_try_click', { location: 'hero', lp_version: 'clusive_v1' }); window.scrollTo(0, 0); }}>
                  <Button>
                    Try Clusive
                  </Button>
                </Link>
                <button 
                  onClick={() => {
                    analytics.track('demo_click', { location: 'hero' });
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Read the 2030+ vision →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works - Full-width with centered content */}
        <section id="how-it-works" className="py-20 px-6 border-t border-border bg-background">
          <div className="max-w-[1040px] mx-auto">
            <div className="text-center mb-16">
              <div className="uppercase text-[0.75rem] tracking-[0.15em] text-muted-foreground font-medium mb-3">
                How Clusive Works
              </div>
              <h2 className="text-2xl font-semibold text-foreground">
                One link. Three options. One locked plan.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  1
                </div>
                <h3 className="text-base font-semibold text-foreground">Set the context</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tell Clusive the time, general area, and occasion.
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  2
                </div>
                <h3 className="text-base font-semibold text-foreground">Get three options</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI generates three curated picks with context on why each fits.
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  3
                </div>
                <h3 className="text-base font-semibold text-foreground">Share and lock</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Everyone taps once. Clusive auto-locks and sends Add to Calendar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* System Overview - 3 Column Grid */}
        <section className="py-20 px-6 border-t border-border bg-background">
          <div className="max-w-[1040px] mx-auto">
            <div className="text-center mb-16">
              <div className="uppercase text-[0.75rem] tracking-[0.15em] text-muted-foreground font-medium mb-3">
                System Overview
              </div>
              <h2 className="text-2xl font-semibold text-foreground">
                Designed to be felt, not seen.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-2.5">
                <h3 className="text-base font-semibold text-foreground">Group OS</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Three tailored picks, not a directory. Lives where conversations already happen.
                </p>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-base font-semibold text-foreground">Ritual memory</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Clear thresholds. One-tap decisions. Only essential updates.
                </p>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-base font-semibold text-foreground">Belonging layer</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Calm infrastructure. No noise. Frictionless consensus.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Share Card Section */}
        <section className="py-20 px-6 border-t border-border bg-background">
          <div className="max-w-[1040px] mx-auto">
            <div className="text-center mb-16">
              <div className="uppercase text-[0.75rem] tracking-[0.15em] text-muted-foreground font-medium mb-3">
                Chat Integration
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Your plan, right in the chat
              </h2>
              <p className="text-sm text-muted-foreground max-w-[580px] mx-auto leading-relaxed">
                Paste a Clusive link and a clean card unfurls. Everyone taps. When consensus is reached, Clusive locks the plan and sends Add to Calendar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[720px] mx-auto">
              <div className="p-6 border border-border bg-card rounded-lg space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">Created</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Vote open</p>
              </div>

              <div className="p-6 border border-border bg-card rounded-lg space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">Almost locked</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Few more taps</p>
              </div>

              <div className="p-6 border border-border bg-card rounded-lg space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">Locked</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Calendar sent</p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 px-6 border-t border-border bg-background">
          <div className="max-w-[1040px] mx-auto">
            <div className="text-center mb-16">
              <div className="uppercase text-[0.75rem] tracking-[0.15em] text-muted-foreground font-medium mb-3">
                Use Cases
              </div>
              <h2 className="text-2xl font-semibold text-foreground">
                Built for the plans you actually make
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-6 rounded-lg border border-border bg-card hover:border-foreground/20 transition-colors">
                <h3 className="text-sm font-semibold text-foreground mb-1.5">After-work drinks</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Quick decisions with the whole crew.</p>
              </div>

              <div className="p-6 rounded-lg border border-border bg-card hover:border-foreground/20 transition-colors">
                <h3 className="text-sm font-semibold text-foreground mb-1.5">Saturday dinner + bar</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Two stops in one coordinated plan.</p>
              </div>

              <div className="p-6 rounded-lg border border-border bg-card hover:border-foreground/20 transition-colors">
                <h3 className="text-sm font-semibold text-foreground mb-1.5">Sunday brunch</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Conversation-friendly spots, agreed fast.</p>
              </div>

              <div className="p-6 rounded-lg border border-border bg-card hover:border-foreground/20 transition-colors">
                <h3 className="text-sm font-semibold text-foreground mb-1.5">First-date plans</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Three options. Both tap. Plan locks.</p>
              </div>

              <div className="p-6 rounded-lg border border-border bg-card hover:border-foreground/20 transition-colors">
                <h3 className="text-sm font-semibold text-foreground mb-1.5">Dating app matches</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Share a Clusive link to coordinate place and time.</p>
              </div>

              <div className="p-6 rounded-lg border border-border bg-card hover:border-foreground/20 transition-colors">
                <h3 className="text-sm font-semibold text-foreground mb-1.5">Group rituals</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Rec leagues, parent nights, recurring hangouts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 px-6 border-t border-border bg-background">
          <div className="max-w-[600px] mx-auto">
            <div className="p-10 rounded-lg border border-border bg-card text-center">
              <p className="text-lg font-medium text-foreground italic">
                "Agreed in 6 minutes instead of 2 days."
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 bg-background">
          <div className="max-w-[600px] mx-auto">
            <div className="p-12 text-center border border-border bg-card rounded-lg">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Skip the 147-message spiral.
              </h2>
              <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                One link. Three options. One tap each.
              </p>
              <Link to="/new" onClick={() => { analytics.track('cta_try_click', { location: 'final', lp_version: 'clusive_v1' }); window.scrollTo(0, 0); }}>
                <Button>
                  Create a plan
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-5 uppercase tracking-wider">
                No login. Free during early access.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Index;
