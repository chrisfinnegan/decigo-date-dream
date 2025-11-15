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
    analytics.track('lp_view', { lp_version: 'concise_v1' });
  }, []);

  const returningUser = localStorage.getItem('decigo_returning_user');

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              {returningUser && (
                <div className="inline-flex items-center gap-2 bg-accent/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                  <span>👋</span>
                  Welcome back
                </div>
              )}
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-brand-primary">Plans in minutes,</span>{" "}
                <span className="bg-gradient-to-r from-brand-highlight to-brand-success bg-clip-text text-transparent">not message storms.</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-foreground max-w-2xl mx-auto leading-relaxed">
                Share one link in your chat. Get three great options. Everyone taps. decigo locks the plan.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/new" onClick={() => { analytics.track('cta_try_click', { location: 'hero', lp_version: 'concise_v1' }); window.scrollTo(0, 0); }}>
                  <Button className="btn-primary h-14 px-10 text-lg shadow-lg hover:shadow-xl transition-shadow">
                    Create a plan
                  </Button>
                </Link>
                <button 
                  onClick={() => {
                    analytics.track('demo_click', { location: 'hero' });
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-14 px-10 text-lg font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  How it works
                </button>
              </div>
              
              <p className="text-sm text-muted-foreground pt-3">
                Works in WhatsApp, iMessage, Slack, and dating apps.
              </p>

              <div className="flex items-center justify-center gap-6 flex-wrap pt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  Under 60 seconds
                </span>
                <span>•</span>
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />
                  No login needed
                </span>
                <span>•</span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  Chat-native
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works - Three Steps */}
        <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
                One link. Three options. One locked plan.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-2 border-border hover:shadow-lg transition-shadow bg-card">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-accent" />
                  </div>
                  <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                    STEP 1
                  </div>
                  <h3 className="text-xl font-bold text-primary">Choose when, where & vibe</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    Tell decigo the time, general area, and the kind of plan.
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-2 border-border hover:shadow-lg transition-shadow bg-card">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-accent" />
                  </div>
                  <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                    STEP 2
                  </div>
                  <h3 className="text-xl font-bold text-primary">Get your Top 3</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    AI creates three tailored options with a simple "why this fits."
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-2 border-border hover:shadow-lg transition-shadow bg-card">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                    STEP 3
                  </div>
                  <h3 className="text-xl font-bold text-primary">Everyone taps</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    Share the link. Friends or dates tap once. decigo auto-locks + sends Add to Calendar.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Value Pillars - Four Cards */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
                Why decisions actually get made with decigo
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-2 border-border bg-card">
                <div className="space-y-3">
                  <Target className="h-8 w-8 text-accent" />
                  <h3 className="text-xl font-bold text-primary">Tailored Top 3</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    Three curated picks, not a directory.
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-2 border-border bg-card">
                <div className="space-y-3">
                  <Shield className="h-8 w-8 text-accent" />
                  <h3 className="text-xl font-bold text-primary">Chat-native</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    Works where plans already happen.
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-2 border-border bg-card">
                <div className="space-y-3">
                  <CheckCircle className="h-8 w-8 text-accent" />
                  <h3 className="text-xl font-bold text-primary">Frictionless consensus</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    Clear thresholds, one-tap voting.
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-2 border-border bg-card">
                <div className="space-y-3">
                  <Users className="h-8 w-8 text-accent" />
                  <h3 className="text-xl font-bold text-primary">Calm chats</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    Only key updates; no message floods.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Use Cases - Tiles */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
                Built for the plans you actually make
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl border-2 border-border bg-card hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-primary mb-2">After-work drinks</h3>
                <p className="text-sm text-muted-foreground">Decide with the whole crew fast.</p>
              </div>

              <div className="p-5 rounded-xl border-2 border-border bg-card hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-primary mb-2">Saturday dinner + one stop</h3>
                <p className="text-sm text-muted-foreground">Restaurant + dessert/bar in one link.</p>
              </div>

              <div className="p-5 rounded-xl border-2 border-border bg-card hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-primary mb-2">Sunday brunch</h3>
                <p className="text-sm text-muted-foreground">Easy, conversation-friendly spots.</p>
              </div>

              <div className="p-5 rounded-xl border-2 border-primary/30 bg-card hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-primary mb-2">First-date coffee or drinks</h3>
                <p className="text-sm text-muted-foreground">Three options + times; you both tap.</p>
              </div>

              <div className="p-5 rounded-xl border-2 border-primary/30 bg-card hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-primary mb-2">Matches from apps</h3>
                <p className="text-sm text-muted-foreground">Share a decigo link in your dating app chat to pick a place & time quickly.</p>
              </div>

              <div className="p-5 rounded-xl border-2 border-border bg-card hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-primary mb-2">Group hangouts / rec league / parents' night out</h3>
                <p className="text-sm text-muted-foreground">Easy decisions for regular meet-ups.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Share-card / Chat-native Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                Your plan, right in the chat
              </h2>
              <p className="text-base text-foreground max-w-3xl mx-auto leading-relaxed">
                Paste a decigo link and a clean card unfurls. Everyone taps. When it hits a match or threshold, decigo locks the plan and sends Add to Calendar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="p-8 border-2 border-border bg-card flex flex-col items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="text-2xl mb-3">📋</div>
                  <h3 className="text-lg font-bold text-primary mb-2">Created</h3>
                  <p className="text-xs text-muted-foreground">Vote on this plan</p>
                </div>
              </Card>

              <Card className="p-8 border-2 border-border bg-card flex flex-col items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="text-2xl mb-3">⏰</div>
                  <h3 className="text-lg font-bold text-primary mb-2">Almost locked</h3>
                  <p className="text-xs text-muted-foreground">Just a few more votes</p>
                </div>
              </Card>

              <Card className="p-8 border-2 border-border bg-card flex flex-col items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="text-2xl mb-3">🎉</div>
                  <h3 className="text-lg font-bold text-primary mb-2">Locked</h3>
                  <p className="text-xs text-muted-foreground">Plan locked + Add to Calendar</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Social Proof + Early Access */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border bg-muted/20">
          <div className="max-w-3xl mx-auto">
            <Card className="p-8 border-2 border-primary/20 bg-card text-center">
              <div className="text-center">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-xl font-semibold text-primary italic mb-2">
                  "Agreed in 6 minutes instead of 2 days."
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Card className="p-8 sm:p-12 text-center border-2 border-primary/20 bg-card shadow-lg">
              <div className="text-5xl mb-4">😫 → 😎</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                Skip the 147-message spiral.
              </h2>
              <p className="text-lg text-foreground mb-6 max-w-2xl mx-auto">
                One link. Three options. One tap each.
              </p>
              <Link to="/new" onClick={() => { analytics.track('cta_try_click', { location: 'final', lp_version: 'concise_v1' }); window.scrollTo(0, 0); }}>
                <Button className="btn-primary h-14 px-10 text-lg shadow-lg hover:shadow-xl transition-shadow">
                  Create a plan
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
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
