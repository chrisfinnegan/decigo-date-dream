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
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
        {/* Hero Section - Compact */}
        <section className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
            <div className="text-center space-y-5 max-w-3xl mx-auto">
              {returningUser && (
                <div className="inline-flex items-center gap-2 bg-accent/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium border border-accent/20">
                  <span>👋</span>
                  Welcome back
                </div>
              )}
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary leading-tight">
                Stop debating. <span className="brand-gradient bg-clip-text text-transparent">Start deciding.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                No more endless back-and-forth. We suggest spots, everyone votes, winner locked—under a minute.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link to="/new">
                  <Button className="btn-primary h-12 px-8 text-base shadow-lg hover:shadow-xl transition-shadow">
                    {returningUser ? 'Create your next plan' : 'Create a plan—free'}
                  </Button>
                </Link>
              </div>
              
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Under 30 seconds
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  No login required
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* How it Works - Compact */}
        <section className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                Three steps. Zero headaches.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 border-border hover:shadow-lg transition-shadow bg-card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5 text-accent" />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                      STEP 1
                    </div>
                    <h3 className="text-base font-bold text-primary">Set the basics</h3>
                    <p className="text-sm text-muted-foreground">
                      When, where, vibe. 15 seconds.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-border hover:shadow-lg transition-shadow bg-card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Target className="h-5 w-5 text-accent" />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                      STEP 2
                    </div>
                    <h3 className="text-base font-bold text-primary">We suggest spots</h3>
                    <p className="text-sm text-muted-foreground">
                      Curated picks matching your criteria.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-border hover:shadow-lg transition-shadow bg-card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-5 w-5 text-accent" />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                      STEP 3
                    </div>
                    <h3 className="text-base font-bold text-primary">Vote & lock</h3>
                    <p className="text-sm text-muted-foreground">
                      One tap per person. Decision made.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Grid - Compact */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                Built for any occasion
              </h2>
              <p className="text-sm text-muted-foreground">
                Friends, dates, coworkers, or family
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-card border border-border">
                <Users className="h-6 w-6 text-accent mb-2" />
                <h3 className="text-sm font-semibold text-primary mb-1">Any size</h3>
                <p className="text-xs text-muted-foreground">2 to 20 people</p>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <Clock className="h-6 w-6 text-accent mb-2" />
                <h3 className="text-sm font-semibold text-primary mb-1">Lightning fast</h3>
                <p className="text-xs text-muted-foreground">No signup walls</p>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <Shield className="h-6 w-6 text-accent mb-2" />
                <h3 className="text-sm font-semibold text-primary mb-1">Private</h3>
                <p className="text-xs text-muted-foreground">Nothing tracked</p>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <Target className="h-6 w-6 text-accent mb-2" />
                <h3 className="text-sm font-semibold text-primary mb-1">Smart picks</h3>
                <p className="text-xs text-muted-foreground">Match your vibe</p>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <Zap className="h-6 w-6 text-accent mb-2" />
                <h3 className="text-sm font-semibold text-primary mb-1">One-tap vote</h3>
                <p className="text-xs text-muted-foreground">No app needed</p>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <CheckCircle className="h-6 w-6 text-accent mb-2" />
                <h3 className="text-sm font-semibold text-primary mb-1">Lock it in</h3>
                <p className="text-xs text-muted-foreground">Instant details</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA - Compact */}
        <section className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Card className="p-6 sm:p-8 text-center border-accent/20 bg-gradient-to-br from-card to-muted">
              <div className="text-3xl mb-3">😫 → 😎</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                Skip the 32-message debate
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                Create your first plan in under 30 seconds. No signup, no spam.
              </p>
              <Link to="/new">
                <Button className="btn-primary h-12 px-8 text-base shadow-lg hover:shadow-xl transition-shadow">
                  Create a plan now
                </Button>
              </Link>
            </Card>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Index;
