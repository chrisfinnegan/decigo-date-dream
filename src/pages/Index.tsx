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
    analytics.trackLPView();
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
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                Plans in minutes, not message storms.
              </h1>
              
              <p className="text-lg sm:text-xl text-foreground max-w-2xl mx-auto leading-relaxed">
                AI-powered shortlists tailored to your time, place, budget, and vibe.<br />
                Share one link in WhatsApp or iMessage, get three great options, tap to vote, and auto-lock the plan — without leaving your chat.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/new" onClick={() => { analytics.track('cta_try_click', { location: 'hero' }); window.scrollTo(0, 0); }}>
                  <Button className="btn-primary h-14 px-10 text-lg shadow-lg hover:shadow-xl transition-shadow">
                    Get a planning link
                  </Button>
                </Link>
                <button 
                  onClick={() => {
                    analytics.track('demo_click', { location: 'hero' });
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-14 px-10 text-lg font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Watch a 30-second demo
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-6 flex-wrap pt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  Under 60 seconds to your Top 3
                </span>
                <span>•</span>
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />
                  No login required
                </span>
                <span>•</span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  Works with WhatsApp, iMessage, and Slack
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
                    STEP 1 — INTAKE
                  </div>
                  <h3 className="text-xl font-bold text-primary">Tell Decigo the basics</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    When, where, who, and the vibe. AI turns that into decision-ready criteria in under a minute.
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-2 border-border hover:shadow-lg transition-shadow bg-card">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-accent" />
                  </div>
                  <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                    STEP 2 — OPTIONS
                  </div>
                  <h3 className="text-xl font-bold text-primary">We serve three spot-on options</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    Not a directory. Just three places that fit your time, budget, and vibe — each with a one-line "why it fits."
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-2 border-border hover:shadow-lg transition-shadow bg-card">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                    STEP 3 — VOTES & LOCK
                  </div>
                  <h3 className="text-xl font-bold text-primary">Friends vote, Decigo locks it</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    Drop the link in your group chat. Everyone taps to vote. When the threshold hits, Decigo locks the plan, posts it back in the thread, and sends Add to Calendar.
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
                Why groups actually make decisions with Decigo
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-2 border-border bg-card">
                <div className="space-y-3">
                  <Target className="h-8 w-8 text-accent" />
                  <h3 className="text-xl font-bold text-primary">AI-tailored shortlists, not directories</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    Three great options with one-line reasons and a quick map preview.
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-2 border-border bg-card">
                <div className="space-y-3">
                  <CheckCircle className="h-8 w-8 text-accent" />
                  <h3 className="text-xl font-bold text-primary">Consensus that completes the job</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    Clear thresholds, deadlines, and automated lock + Add to Calendar. No "so what are we doing?" follow-ups.
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-2 border-border bg-card">
                <div className="space-y-3">
                  <Shield className="h-8 w-8 text-accent" />
                  <h3 className="text-xl font-bold text-primary">Chat-native & privacy-light</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    Works inside WhatsApp, iMessage, and Slack. No account needed. Minimal data, easy opt-outs.
                  </p>
                </div>
              </Card>

              <Card className="p-6 border-2 border-border bg-card">
                <div className="space-y-3">
                  <Users className="h-8 w-8 text-accent" />
                  <h3 className="text-xl font-bold text-primary">Calm chats by default</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    Voting happens outside the thread. We only post Created → Near-Lock → Locked updates back in.
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
                <h3 className="text-base font-bold text-primary mb-2">After-Work Drinks</h3>
                <p className="text-sm text-muted-foreground">Decide with 4–8 people in under 10 minutes.</p>
              </div>

              <div className="p-5 rounded-xl border-2 border-border bg-card hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-primary mb-2">Saturday Dinner + One Stop</h3>
                <p className="text-sm text-muted-foreground">Restaurant + dessert/bar, all in one link.</p>
              </div>

              <div className="p-5 rounded-xl border-2 border-border bg-card hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-primary mb-2">Sunday Brunch</h3>
                <p className="text-sm text-muted-foreground">Low-wait, conversation-friendly options.</p>
              </div>

              <div className="p-5 rounded-xl border-2 border-border bg-card hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-primary mb-2">First-Date Coffee <span className="text-xs text-accent">(beta)</span></h3>
                <p className="text-sm text-muted-foreground">Three place options + three times; you both vote, Decigo locks it.</p>
              </div>

              <div className="p-5 rounded-xl border-2 border-border bg-card hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-primary mb-2">Study Groups / Rec Leagues</h3>
                <p className="text-sm text-muted-foreground">Light, fast decisions.</p>
              </div>

              <div className="p-5 rounded-xl border-2 border-border bg-card hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-primary mb-2">Parents' Night Out</h3>
                <p className="text-sm text-muted-foreground">Quick consensus for busy schedules.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Share-card / Chat-native Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                Your plan, as a clean card in the chat
              </h2>
              <p className="text-base text-foreground max-w-3xl mx-auto leading-relaxed">
                When you paste a Decigo link into chat, we unfurl a clean share-card — first with "Vote on tonight's plan," then "3/4 voted — one more to lock," and finally the locked place + time with Add to Calendar.<br />
                Friends tap once to vote; the thread stays readable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="p-8 border-2 border-border bg-card flex flex-col items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="text-2xl mb-3">📋</div>
                  <h3 className="text-lg font-bold text-primary mb-2">Created</h3>
                  <p className="text-xs text-muted-foreground">Vote on tonight's plan</p>
                </div>
              </Card>

              <Card className="p-8 border-2 border-border bg-card flex flex-col items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="text-2xl mb-3">⏰</div>
                  <h3 className="text-lg font-bold text-primary mb-2">Near-Lock</h3>
                  <p className="text-xs text-muted-foreground">3/4 voted — one more to lock</p>
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
              <div className="mb-6">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-xl font-semibold text-primary italic mb-4">
                  "We agreed in 6 minutes instead of 2 days."
                </p>
                <p className="text-sm text-muted-foreground">— Early Decigo group</p>
              </div>
              
              <div className="pt-6 border-t border-border">
                <div className="inline-block bg-accent/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-3">
                  ⚡ Early Access
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">Free while we're validating</h3>
                <p className="text-sm text-foreground">
                  Help us tune the AI and reminder cadence; you get premium features at no cost during early access.
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
                Share one Decigo link, get three great options, tap to lock — all without leaving your group chat.
              </p>
              <Link to="/new" onClick={() => { analytics.track('cta_try_click', { location: 'final' }); window.scrollTo(0, 0); }}>
                <Button className="btn-primary h-14 px-10 text-lg shadow-lg hover:shadow-xl transition-shadow">
                  Create a plan now
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                No signup, no app download, free in early access.
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
