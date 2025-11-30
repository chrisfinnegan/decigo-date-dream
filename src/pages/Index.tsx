import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";
import { Sparkles, CalendarCheck, RotateCcw, Archive } from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroWaveBackground } from "@/components/HeroWaveBackground";

const Index = () => {
  useEffect(() => {
    analytics.track('lp_view', { lp_version: 'clusive_v2' });
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-[64px]">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background">
          <HeroWaveBackground />
          <div className="relative max-w-[880px] mx-auto px-6 pt-32 pb-28">
            <div className="space-y-6">
              <div className="uppercase text-[0.75rem] tracking-[0.15em] text-muted-foreground font-medium">
                AI Social Infrastructure for groups
              </div>
              
              <h1 className="text-5xl md:text-6xl font-semibold leading-[1.1] text-foreground">
                Belong together.
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-[640px] leading-[1.7]">
                Clusive is an AI-powered space where your groups can form, plan, and keep showing up for each other — without the coordination chaos.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
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
        <section className="py-24 px-6 border-t border-border bg-background">
          <div className="max-w-[880px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-8">
              Connection shouldn't feel this hard.
            </h2>
            
            <div className="space-y-3 text-lg text-muted-foreground leading-[1.7]">
              <p>Group chats, DMs, endless "we should hang" messages — but nothing actually happens.</p>
              <p>It's not that people don't care. It's that coordination is work.</p>
              <div className="pt-2 space-y-1">
                <p>Too many preferences.</p>
                <p>Too many schedules.</p>
                <p>Too many tools that weren't built for real life.</p>
              </div>
              <p className="pt-4 font-medium text-foreground">Clusive changes that.</p>
            </div>
          </div>
        </section>

        {/* Section 2 - What Clusive Does */}
        <section id="what-clusive-does" className="py-24 px-6 border-t border-border bg-background">
          <div className="max-w-[880px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
              Clusive makes it easy to stay close.
            </h2>
            
            <p className="text-lg text-muted-foreground leading-[1.7] mb-16 max-w-[700px]">
              Clusive learns your group's rhythms, preferences, and patterns — and quietly handles the logistics so you don't have to.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-border">
                  <Sparkles className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Smart suggestions</h3>
                <p className="text-base text-muted-foreground leading-[1.7]">
                  Clusive proposes times, places, and ideas that actually fit your group.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-border">
                  <CalendarCheck className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">One-tap plans</h3>
                <p className="text-base text-muted-foreground leading-[1.7]">
                  No 40-message threads. Just "yes," "no," or "next time."
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-border">
                  <RotateCcw className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Routines that stick</h3>
                <p className="text-base text-muted-foreground leading-[1.7]">
                  Weekly dinners, monthly game nights, Sunday walks — Clusive helps you keep them going.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-border">
                  <Archive className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Shared memory</h3>
                <p className="text-base text-muted-foreground leading-[1.7]">
                  Your group's history, vibes, and favorite spots, all in one place.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 - For Small Groups */}
        <section className="py-24 px-6 border-t border-border bg-background">
          <div className="max-w-[880px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
              Built for circles of 2–8 — where life actually happens.
            </h2>
            
            <div className="space-y-4 text-lg text-muted-foreground leading-[1.7]">
              <p>Most tools are built for feeds, followers, and scale.</p>
              <p className="font-medium text-foreground">Clusive is built for:</p>
              <ul className="space-y-2 pl-6">
                <li className="list-disc">couples and best friends</li>
                <li className="list-disc">group chats that actually want to meet</li>
                <li className="list-disc">teams and side-project crews</li>
                <li className="list-disc">housemates, squads, and micro-communities</li>
              </ul>
              <p className="pt-6 italic">If it's a group you'd be sad to lose, it belongs on Clusive.</p>
            </div>
          </div>
        </section>

        {/* Section 4 - The AI Behind Clusive */}
        <section className="py-24 px-6 border-t border-border bg-background">
          <div className="max-w-[880px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
                  AI that supports connection — not replaces it.
                </h2>
                <p className="text-lg text-muted-foreground leading-[1.7]">
                  Clusive uses AI to understand your group's preferences, suggest plans, and detect routines — not to replace human contact.
                </p>
              </div>

              <div className="space-y-3 text-base text-muted-foreground leading-[1.7]">
                <p>Learns when your group can actually meet.</p>
                <p>Understands what you like (and what you don't).</p>
                <p>Spots emerging rituals and helps them stick.</p>
                <p className="pt-4 font-medium text-foreground">It's infrastructure, not a personality.</p>
                <p className="text-muted-foreground">Quietly powerful in the background.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 - Social Proof / Future */}
        <section className="py-24 px-6 border-t border-border bg-background">
          <div className="max-w-[700px] mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
              The future of staying close.
            </h2>
            
            <div className="space-y-3 text-lg text-muted-foreground leading-[1.7]">
              <p>We're building Clusive for a world where your closest relationships don't get lost in feeds and calendars.</p>
              <div className="pt-2 space-y-1">
                <p>No endless scrolling.</p>
                <p>No engagement traps.</p>
                <p>Just an intelligent layer that makes it easier to show up for the people who matter.</p>
              </div>
            </div>

            <div className="pt-6">
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
