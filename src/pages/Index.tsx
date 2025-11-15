import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";
import { Zap, Target, CheckCircle, Users, Clock, Shield } from "lucide-react";

const Index = () => {
  useEffect(() => {
    analytics.trackLPView();
  }, []);

  const returningUser = localStorage.getItem('decigo_returning_user');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient orb background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img src="/brand/logo-full.png" alt="Decigo" className="h-12 sm:h-14" />
            </div>
            
            {returningUser && (
              <div className="inline-flex items-center gap-2 bg-accent/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-accent/20">
                <span className="text-lg">👋</span>
                Welcome back
              </div>
            )}
            
            {/* Hero Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary leading-tight">
              Stop debating.
              <br />
              <span className="brand-gradient bg-clip-text text-transparent">
                Start deciding.
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              No more endless "Where should we go?" texts. Decigo suggests great spots, your group votes, and you lock the winner—all in under a minute.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/new">
                <Button className="btn-primary h-14 px-10 text-lg shadow-lg hover:shadow-xl transition-shadow">
                  {returningUser ? 'Create your next plan' : 'Create a plan—free'}
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Under 30 seconds
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                No login required
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Three steps. Zero headaches.
            </h2>
            <p className="text-lg text-muted-foreground">
              From indecision to reservation in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="p-8 border-border hover:shadow-lg transition-shadow bg-card">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <div className="space-y-3">
                <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                  STEP 1
                </div>
                <h3 className="text-xl font-bold text-primary">Set the basics</h3>
                <p className="text-muted-foreground">
                  Tell us when, where, and what vibe. Takes 15 seconds.
                </p>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="p-8 border-border hover:shadow-lg transition-shadow bg-card">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <div className="space-y-3">
                <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                  STEP 2
                </div>
                <h3 className="text-xl font-bold text-primary">We suggest spots</h3>
                <p className="text-muted-foreground">
                  Get curated recommendations that match your criteria—automatically.
                </p>
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="p-8 border-border hover:shadow-lg transition-shadow bg-card">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <div className="space-y-3">
                <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                  STEP 3
                </div>
                <h3 className="text-xl font-bold text-primary">Group votes & lock</h3>
                <p className="text-muted-foreground">
                  Everyone taps their pick. Winner decided. No arguments.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 sm:p-12 border-accent/20 bg-card">
            <div className="text-center space-y-6">
              <div className="text-4xl sm:text-5xl mb-4">😫</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary">
                "Where should we eat?"
              </h2>
              <p className="text-lg text-muted-foreground italic">
                32 messages later and still no decision...
              </p>
              <div className="pt-4">
                <p className="text-base text-foreground font-medium">
                  Sound familiar? Decigo ends the chaos.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Built for real groups
            </h2>
            <p className="text-lg text-muted-foreground">
              Whether it's friends, dates, coworkers, or family
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors">
              <Users className="h-8 w-8 text-accent mb-4" />
              <h3 className="font-semibold text-primary mb-2">Any group size</h3>
              <p className="text-sm text-muted-foreground">Works for 2 people or 20. We'll find spots that fit.</p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors">
              <Clock className="h-8 w-8 text-accent mb-4" />
              <h3 className="font-semibold text-primary mb-2">Lightning fast</h3>
              <p className="text-sm text-muted-foreground">Create a plan in seconds. No signup walls or forms.</p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors">
              <Shield className="h-8 w-8 text-accent mb-4" />
              <h3 className="font-semibold text-primary mb-2">Privacy-light</h3>
              <p className="text-sm text-muted-foreground">We don't track anyone. Nothing is shared publicly.</p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors">
              <Target className="h-8 w-8 text-accent mb-4" />
              <h3 className="font-semibold text-primary mb-2">Smart suggestions</h3>
              <p className="text-sm text-muted-foreground">Recommendations match your vibe, budget, and location.</p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors">
              <Zap className="h-8 w-8 text-accent mb-4" />
              <h3 className="font-semibold text-primary mb-2">One-tap voting</h3>
              <p className="text-sm text-muted-foreground">No apps to download. Just click and vote.</p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors">
              <CheckCircle className="h-8 w-8 text-accent mb-4" />
              <h3 className="font-semibold text-primary mb-2">Lock it in</h3>
              <p className="text-sm text-muted-foreground">Decision locked. Everyone gets the details instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 sm:p-12 text-center border-accent/20 bg-gradient-to-br from-card to-muted">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Ready to skip the debate?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create your first plan in under 30 seconds. No signup, no spam, no hassle.
            </p>
            <Link to="/new">
              <Button className="btn-primary h-14 px-10 text-lg shadow-lg hover:shadow-xl transition-shadow">
                Create a plan now
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
