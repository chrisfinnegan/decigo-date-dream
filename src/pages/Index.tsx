import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";
import { Zap, Target, CheckCircle, Users, Clock, Shield } from "lucide-react";
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
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background">
          <HeroWaveBackground />
          <div className="relative px-6 lg:px-10 pt-24 pb-20">
            <div className="text-center space-y-8">
              {returningUser && (
                <div className="inline-flex items-center gap-2 bg-secondary text-foreground px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider">
                  <span>👋</span>
                  Welcome back
                </div>
              )}
              
              <div className="uppercase text-[0.78rem] tracking-[0.15em] text-muted-foreground font-medium">
                AI Social Infrastructure
              </div>
              
              <h1 className="leading-[1.15]">
                The invisible fabric<br />
                between people.
              </h1>
              
              <p className="text-[0.95rem] text-muted-foreground max-w-[560px] mx-auto leading-[1.7]">
                Clusive keeps your group's rituals alive with gentle, well-timed prompts. Coordinate effortlessly. Build rhythms that last.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
                <Link to="/new" onClick={() => { analytics.track('cta_try_click', { location: 'hero', lp_version: 'clusive_v1' }); window.scrollTo(0, 0); }}>
                  <Button size="lg" className="h-11 px-7 text-[0.92rem]">
                    Try Clusive
                  </Button>
                </Link>
                <button 
                  onClick={() => {
                    analytics.track('demo_click', { location: 'hero' });
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[0.92rem] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Read the 2030+ vision →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 px-6 lg:px-10 border-t border-border bg-background">
          <div>
            <div className="text-center mb-20">
              <div className="uppercase text-[0.78rem] tracking-[0.15em] text-muted-foreground font-medium mb-4">
                How Clusive Works
              </div>
              <h2 className="text-foreground text-[1.1rem]">
                One link. Three options. One locked plan.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-5">
                <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div className="chip text-[0.7rem]">
                  Step 1
                </div>
                <h3 className="text-[1rem] font-semibold text-foreground">Set the context</h3>
                <p className="text-[0.88rem] text-muted-foreground leading-[1.7]">
                  Tell Clusive the time, general area, and occasion.
                </p>
              </div>

              <div className="space-y-5">
                <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div className="chip text-[0.7rem]">
                  Step 2
                </div>
                <h3 className="text-[1rem] font-semibold text-foreground">Get three options</h3>
                <p className="text-[0.88rem] text-muted-foreground leading-[1.7]">
                  AI generates three curated picks with context on why each fits.
                </p>
              </div>

              <div className="space-y-5">
                <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="chip text-[0.7rem]">
                  Step 3
                </div>
                <h3 className="text-[1rem] font-semibold text-foreground">Share and lock</h3>
                <p className="text-[0.88rem] text-muted-foreground leading-[1.7]">
                  Everyone taps once. Clusive auto-locks and sends Add to Calendar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* System Overview - 3 Column Grid */}
        <section className="py-24 px-6 lg:px-10 border-t border-border bg-background">
          <div>
            <div className="text-center mb-20">
              <div className="uppercase text-[0.78rem] tracking-[0.15em] text-muted-foreground font-medium mb-4">
                System Overview
              </div>
              <h2 className="text-foreground text-[1.1rem]">
                Designed to be felt, not seen.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-3">
                <h3 className="text-[1rem] font-semibold text-foreground">Group OS</h3>
                <p className="text-[0.88rem] text-muted-foreground leading-[1.7]">
                  Three tailored picks, not a directory. Lives where conversations already happen.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-[1rem] font-semibold text-foreground">Ritual memory</h3>
                <p className="text-[0.88rem] text-muted-foreground leading-[1.7]">
                  Clear thresholds. One-tap decisions. Only essential updates.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-[1rem] font-semibold text-foreground">Belonging layer</h3>
                <p className="text-[0.88rem] text-muted-foreground leading-[1.7]">
                  Calm infrastructure. No noise. Frictionless consensus.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Share Card Section */}
        <section className="py-24 px-6 lg:px-10 border-t border-border bg-background">
          <div>
            <div className="text-center mb-20">
              <div className="uppercase text-[0.78rem] tracking-[0.15em] text-muted-foreground font-medium mb-4">
                Chat Integration
              </div>
              <h2 className="text-foreground text-[1.1rem] mb-5">
                Your plan, right in the chat
              </h2>
              <p className="text-[0.88rem] text-muted-foreground max-w-[560px] mx-auto leading-[1.7]">
                Paste a Clusive link and a clean card unfurls. Everyone taps. When consensus is reached, Clusive locks the plan and sends Add to Calendar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[680px] mx-auto">
              <div className="p-8 border border-border bg-card rounded-xl flex flex-col items-center justify-center min-h-[160px]">
                <div className="text-center space-y-3">
                  <div className="text-3xl">📋</div>
                  <h3 className="text-[0.92rem] font-semibold text-foreground">Created</h3>
                  <p className="text-[0.75rem] text-muted-foreground uppercase tracking-[0.12em]">Vote open</p>
                </div>
              </div>

              <div className="p-8 border border-border bg-card rounded-xl flex flex-col items-center justify-center min-h-[160px]">
                <div className="text-center space-y-3">
                  <div className="text-3xl">⏰</div>
                  <h3 className="text-[0.92rem] font-semibold text-foreground">Almost locked</h3>
                  <p className="text-[0.75rem] text-muted-foreground uppercase tracking-[0.12em]">Few more taps</p>
                </div>
              </div>

              <div className="p-8 border border-border bg-card rounded-xl flex flex-col items-center justify-center min-h-[160px]">
                <div className="text-center space-y-3">
                  <div className="text-3xl">🎉</div>
                  <h3 className="text-[0.92rem] font-semibold text-foreground">Locked</h3>
                  <p className="text-[0.75rem] text-muted-foreground uppercase tracking-[0.12em]">Calendar sent</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-24 px-6 lg:px-10 border-t border-border bg-background">
          <div>
            <div className="text-center mb-20">
              <div className="uppercase text-[0.78rem] tracking-[0.15em] text-muted-foreground font-medium mb-4">
                Use Cases
              </div>
              <h2 className="text-foreground text-[1.1rem]">
                Built for the plans you actually make
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-7 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors">
                <h3 className="text-[0.92rem] font-semibold text-foreground mb-2">After-work drinks</h3>
                <p className="text-[0.82rem] text-muted-foreground leading-[1.6]">Quick decisions with the whole crew.</p>
              </div>

              <div className="p-7 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors">
                <h3 className="text-[0.92rem] font-semibold text-foreground mb-2">Saturday dinner + bar</h3>
                <p className="text-[0.82rem] text-muted-foreground leading-[1.6]">Two stops in one coordinated plan.</p>
              </div>

              <div className="p-7 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors">
                <h3 className="text-[0.92rem] font-semibold text-foreground mb-2">Sunday brunch</h3>
                <p className="text-[0.82rem] text-muted-foreground leading-[1.6]">Conversation-friendly spots, agreed fast.</p>
              </div>

              <div className="p-7 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors">
                <h3 className="text-[0.92rem] font-semibold text-foreground mb-2">First-date plans</h3>
                <p className="text-[0.82rem] text-muted-foreground leading-[1.6]">Three options. Both tap. Plan locks.</p>
              </div>

              <div className="p-7 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors">
                <h3 className="text-[0.92rem] font-semibold text-foreground mb-2">Dating app matches</h3>
                <p className="text-[0.82rem] text-muted-foreground leading-[1.6]">Share a Clusive link to coordinate place and time.</p>
              </div>

              <div className="p-7 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors">
                <h3 className="text-[0.92rem] font-semibold text-foreground mb-2">Group rituals</h3>
                <p className="text-[0.82rem] text-muted-foreground leading-[1.6]">Rec leagues, parent nights, recurring hangouts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-24 px-6 lg:px-10 border-t border-border bg-background">
          <div>
            <div className="p-12 rounded-xl border border-border bg-card text-center">
              <div className="text-4xl mb-6">💬</div>
              <p className="text-[1.05rem] font-medium text-foreground italic">
                "Agreed in 6 minutes instead of 2 days."
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 lg:px-10 bg-background">
          <div>
            <div className="p-14 text-center border border-border bg-card rounded-xl">
              <div className="text-4xl mb-6">😫 → 😎</div>
              <h2 className="text-foreground text-[1.1rem] mb-5">
                Skip the 147-message spiral.
              </h2>
              <p className="text-[0.95rem] text-muted-foreground mb-10 leading-[1.7]">
                One link. Three options. One tap each.
              </p>
              <Link to="/new" onClick={() => { analytics.track('cta_try_click', { location: 'final', lp_version: 'clusive_v1' }); window.scrollTo(0, 0); }}>
                <Button size="lg" className="h-11 px-7 text-[0.92rem]">
                  Create a plan
                </Button>
              </Link>
              <p className="text-[0.75rem] text-muted-foreground mt-6 uppercase tracking-[0.12em]">
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
