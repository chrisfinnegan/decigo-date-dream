import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";
import { Zap, Target, CheckCircle, Users, Clock, Shield } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
        <section className="relative overflow-hidden">
          <div className="max-w-[840px] mx-auto px-6 lg:px-10 pt-20 pb-16">
            <div className="text-center space-y-6">
              {returningUser && (
                <div className="inline-flex items-center gap-2 bg-secondary text-foreground px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider">
                  <span>👋</span>
                  Welcome back
                </div>
              )}
              
              <div className="uppercase text-xs tracking-[0.15em] text-muted-foreground font-medium mb-4">
                AI Social Infrastructure
              </div>
              
              <h1 className="leading-tight">
                <span className="text-foreground">The invisible fabric</span><br />
                <span className="text-foreground">between people.</span>
              </h1>
              
              <p className="text-base text-foreground max-w-[600px] mx-auto leading-relaxed">
                Clusive keeps your group's rituals alive with gentle, well-timed prompts. Coordinate effortlessly. Build rhythms that last.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link to="/new" onClick={() => { analytics.track('cta_try_click', { location: 'hero', lp_version: 'clusive_v1' }); window.scrollTo(0, 0); }}>
                  <Button size="lg" className="h-12 px-8 text-base">
                    Start your plan
                  </Button>
                </Link>
                <button 
                  onClick={() => {
                    analytics.track('demo_click', { location: 'hero' });
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-12 px-8 text-base font-medium text-foreground hover:text-primary transition-colors"
                >
                  How it works
                </button>
              </div>
              
              <p className="text-sm text-muted-foreground pt-3">
                Works in WhatsApp, iMessage, Slack, and dating apps.
              </p>

              <div className="flex items-center justify-center gap-6 flex-wrap pt-2 text-xs text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Under 60 seconds
                </span>
                <span>•</span>
                <span className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  No login needed
                </span>
                <span>•</span>
                <span className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Chat-native
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-20 px-6 lg:px-10 border-t border-border">
          <div className="max-w-[840px] mx-auto">
            <div className="text-center mb-16">
              <div className="uppercase text-xs tracking-[0.15em] text-muted-foreground font-medium mb-3">
                How Clusive Works
              </div>
              <h2 className="text-foreground">
                One link. Three options. One locked plan.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-8 border border-border hover:border-primary/30 transition-all">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="chip text-[0.7rem]">
                    Step 1
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Set the context</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Tell Clusive the time, general area, and occasion.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border border-border hover:border-primary/30 transition-all">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div className="chip text-[0.7rem]">
                    Step 2
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Get three options</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AI generates three curated picks with context on why each fits.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border border-border hover:border-primary/30 transition-all">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="chip text-[0.7rem]">
                    Step 3
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Share and lock</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Everyone taps once. Clusive auto-locks and sends Add to Calendar.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Value Pillars */}
        <section className="py-20 px-6 lg:px-10 border-t border-border">
          <div className="max-w-[840px] mx-auto">
            <div className="text-center mb-16">
              <div className="uppercase text-xs tracking-[0.15em] text-muted-foreground font-medium mb-3">
                Why Clusive
              </div>
              <h2 className="text-foreground">
                Designed to be felt, not seen.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-8 border border-border">
                <div className="space-y-3">
                  <Target className="h-7 w-7 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Curated, not cluttered</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Three tailored picks, not a directory.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border border-border">
                <div className="space-y-3">
                  <Shield className="h-7 w-7 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Chat-native</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Lives where your conversations already happen.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border border-border">
                <div className="space-y-3">
                  <CheckCircle className="h-7 w-7 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Frictionless consensus</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Clear thresholds. One-tap decisions.
                  </p>
                </div>
              </Card>

              <Card className="p-8 border border-border">
                <div className="space-y-3">
                  <Users className="h-7 w-7 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Calm infrastructure</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Only essential updates. No noise.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 px-6 lg:px-10 border-t border-border">
          <div className="max-w-[840px] mx-auto">
            <div className="text-center mb-16">
              <div className="uppercase text-xs tracking-[0.15em] text-muted-foreground font-medium mb-3">
                Use Cases
              </div>
              <h2 className="text-foreground">
                Built for the plans you actually make
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all">
                <h3 className="text-sm font-semibold text-foreground mb-2">After-work drinks</h3>
                <p className="text-xs text-muted-foreground">Quick decisions with the whole crew.</p>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all">
                <h3 className="text-sm font-semibold text-foreground mb-2">Saturday dinner + bar</h3>
                <p className="text-xs text-muted-foreground">Two stops in one coordinated plan.</p>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all">
                <h3 className="text-sm font-semibold text-foreground mb-2">Sunday brunch</h3>
                <p className="text-xs text-muted-foreground">Conversation-friendly spots, agreed fast.</p>
              </div>

              <div className="p-6 rounded-2xl border border-primary/40 bg-card hover:border-primary/60 transition-all">
                <h3 className="text-sm font-semibold text-foreground mb-2">First-date plans</h3>
                <p className="text-xs text-muted-foreground">Three options. Both tap. Plan locks.</p>
              </div>

              <div className="p-6 rounded-2xl border border-primary/40 bg-card hover:border-primary/60 transition-all">
                <h3 className="text-sm font-semibold text-foreground mb-2">Dating app matches</h3>
                <p className="text-xs text-muted-foreground">Share a Clusive link to coordinate place and time.</p>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all">
                <h3 className="text-sm font-semibold text-foreground mb-2">Group rituals</h3>
                <p className="text-xs text-muted-foreground">Rec leagues, parent nights, recurring hangouts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Share Card Section */}
        <section className="py-20 px-6 lg:px-10 border-t border-border">
          <div className="max-w-[840px] mx-auto">
            <div className="text-center mb-16">
              <div className="uppercase text-xs tracking-[0.15em] text-muted-foreground font-medium mb-3">
                Chat Integration
              </div>
              <h2 className="text-foreground mb-4">
                Your plan, right in the chat
              </h2>
              <p className="text-sm text-muted-foreground max-w-[600px] mx-auto leading-relaxed">
                Paste a Clusive link and a clean card unfurls. Everyone taps. When consensus is reached, Clusive locks the plan and sends Add to Calendar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[700px] mx-auto">
              <Card className="p-10 border border-border bg-card flex flex-col items-center justify-center min-h-[180px]">
                <div className="text-center">
                  <div className="text-3xl mb-3">📋</div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Created</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Vote open</p>
                </div>
              </Card>

              <Card className="p-10 border border-border bg-card flex flex-col items-center justify-center min-h-[180px]">
                <div className="text-center">
                  <div className="text-3xl mb-3">⏰</div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Almost locked</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Few more taps</p>
                </div>
              </Card>

              <Card className="p-10 border border-border bg-card flex flex-col items-center justify-center min-h-[180px]">
                <div className="text-center">
                  <div className="text-3xl mb-3">🎉</div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Locked</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Calendar sent</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 px-6 lg:px-10 border-t border-border bg-secondary/30">
          <div className="max-w-[600px] mx-auto">
            <Card className="p-10 border border-border bg-card text-center">
              <div className="text-center">
                <div className="text-5xl mb-5">💬</div>
                <p className="text-lg font-medium text-foreground italic mb-2">
                  "Agreed in 6 minutes instead of 2 days."
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 lg:px-10">
          <div className="max-w-[600px] mx-auto">
            <Card className="p-12 text-center border border-border bg-card">
              <div className="text-5xl mb-5">😫 → 😎</div>
              <h2 className="text-foreground mb-4">
                Skip the 147-message spiral.
              </h2>
              <p className="text-base text-muted-foreground mb-8">
                One link. Three options. One tap each.
              </p>
              <Link to="/new" onClick={() => { analytics.track('cta_try_click', { location: 'final', lp_version: 'clusive_v1' }); window.scrollTo(0, 0); }}>
                <Button size="lg" className="h-12 px-8 text-base">
                  Create a plan
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-5 uppercase tracking-wider">
                No login. Free during early access.
              </p>
            </Card>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Index;
