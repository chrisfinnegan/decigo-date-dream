import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    analytics.track('lp_view', { lp_version: 'clusive_v3' });
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-[64px]">
        {/* Hero Section */}
        <section className="bg-background">
          <div className="max-w-[1200px] mx-auto px-6 pt-24 md:pt-32 pb-20 md:pb-32 text-center">
            <div className="space-y-8 max-w-[900px] mx-auto">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">
                AI Social Infrastructure for groups
              </div>
              
              <h1 className="text-5xl md:text-7xl font-semibold leading-[1.1] text-foreground tracking-tight">
                Belong together.
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-[720px] mx-auto leading-[1.5]">
                Clusive is an AI-powered space where your groups can form, plan, and keep showing up for each other, without the coordination chaos.
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
            </div>
          </div>
        </section>

        {/* Section 1 - The Problem */}
        <section className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-12 leading-[1.2]">
              Connection shouldn't feel this hard.
            </h2>
            
            <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-[1.7]">
              <p>Group chats, DMs, endless "we should hang" messages, but nothing actually happens.</p>
              <p>It's not that people don't care. It's that coordination is work.</p>
              <div className="pt-4 space-y-4">
                <p>Too many preferences.</p>
                <p>Too many schedules.</p>
                <p>Too many tools that weren't built for real life.</p>
              </div>
              <p className="pt-8 text-xl md:text-2xl font-medium text-foreground">Clusive changes that.</p>
            </div>
          </div>
        </section>

        {/* Section 2 - What Clusive Does */}
        <section id="what-clusive-does" className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-8 leading-[1.2]">
                Clusive makes it easy to stay close.
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-[1.7] max-w-[720px] mx-auto">
                Clusive learns your group's rhythms, preferences, and patterns and quietly handles the logistics so you don't have to.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-[900px] mx-auto">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">Smart suggestions</h3>
                <p className="text-base text-muted-foreground leading-[1.7]">
                  Clusive proposes times, places, and ideas that actually fit your group.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">One-tap plans</h3>
                <p className="text-base text-muted-foreground leading-[1.7]">
                  No 40-message threads. Just "yes," "no," or "next time."
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">Routines that stick</h3>
                <p className="text-base text-muted-foreground leading-[1.7]">
                  Weekly dinners, monthly game nights, Sunday walks. Clusive helps you keep them going.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">Shared memory</h3>
                <p className="text-base text-muted-foreground leading-[1.7]">
                  Your group's history, vibes, and favorite spots, all in one place.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 - For Small Groups */}
        <section className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-12 leading-[1.2]">
              Built for circles of 2 to 8, where life actually happens.
            </h2>
            
            <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-[1.7]">
              <p>Most tools are built for feeds, followers, and scale.</p>
              <p className="font-medium text-foreground text-xl">Clusive is built for:</p>
              <div className="pt-4 space-y-3">
                <p>couples and best friends</p>
                <p>group chats that actually want to meet</p>
                <p>teams and side-project crews</p>
                <p>housemates, squads, and micro-communities</p>
              </div>
              <p className="pt-10 text-xl italic text-foreground/80">If it's a group you'd be sad to lose, it belongs on Clusive.</p>
            </div>
          </div>
        </section>

        {/* Section 4 - The AI Behind Clusive */}
        <section className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[1000px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-8 leading-[1.2]">
                AI that supports connection, not replaces it.
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-[1.7] max-w-[720px] mx-auto">
                Clusive uses AI to understand your group's preferences, suggest plans, and detect routines, not to replace human contact.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[800px] mx-auto text-center">
              <p className="text-base text-muted-foreground">Learns when your group can actually meet.</p>
              <p className="text-base text-muted-foreground">Understands what you like (and what you don't).</p>
              <p className="text-base text-muted-foreground">Spots emerging rituals and helps them stick.</p>
              <p className="text-base text-foreground font-medium">It's infrastructure, not a personality.</p>
            </div>
            
            <p className="text-center text-lg text-muted-foreground mt-12">Quietly powerful in the background.</p>
          </div>
        </section>

        {/* Section 5 - Social Proof / Future */}
        <section className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[900px] mx-auto text-center space-y-12">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground leading-[1.2]">
              The future of staying close.
            </h2>
            
            <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-[1.7]">
              <p className="max-w-[720px] mx-auto">We're building Clusive for a world where your closest relationships don't get lost in feeds and calendars.</p>
              <div className="pt-4 space-y-4">
                <p>No endless scrolling.</p>
                <p>No engagement traps.</p>
                <p className="text-foreground font-medium">Just an intelligent layer that makes it easier to show up for the people who matter.</p>
              </div>
            </div>

            <div className="pt-8">
              <Link to="/new" onClick={() => { analytics.track('cta_join_waitlist', { location: 'future_section' }); window.scrollTo(0, 0); }}>
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
