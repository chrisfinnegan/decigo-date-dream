import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { analytics } from "@/lib/analytics";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import connectionImg from "@/assets/connection-illustration.png";

const WhyClusive = () => {
  useEffect(() => {
    analytics.track('why_clusive_view');
  }, []);

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    document.querySelectorAll('.fade-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-[64px]">
        {/* Hero Section - Full bleed visual */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 to-background z-0" />
          <img 
            src={connectionImg}
            alt="Connection illustration"
            className="absolute inset-0 w-full h-full object-cover opacity-30 z-0"
          />
          <div className="relative z-10 max-w-[900px] mx-auto px-6 py-20 text-center space-y-8">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">
              Our Story
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold leading-[1.05] text-foreground tracking-tight">
              Why Clusive exists
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/80 max-w-[700px] mx-auto leading-[1.4] font-medium">
              We use AI to remove the friction between people so connection becomes easier, not rarer.
            </p>
          </div>
        </section>

        {/* Opening Statement */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-[800px] mx-auto fade-on-scroll opacity-0">
            <p className="text-2xl md:text-3xl text-foreground leading-[1.5] font-light">
              Most technology pulls attention away from the people you care about. 
              <span className="font-medium"> Clusive is built for the opposite</span>: helping your small groups form, grow, and thrive with just enough intelligence in the background to keep you showing up for each other.
            </p>
          </div>
        </section>

        {/* The Problem - Split layout */}
        <section className="py-16 md:py-32 px-6 bg-secondary/20">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <div className="fade-on-scroll opacity-0">
                <h2 className="text-4xl md:text-5xl font-semibold text-foreground leading-[1.15] mb-12">
                  Connection is breaking on two fronts
                </h2>
              </div>
              
              <div className="space-y-10 fade-on-scroll opacity-0" style={{ animationDelay: '0.2s' }}>
                <div className="space-y-3">
                  <div className="text-6xl font-bold text-primary/20">01</div>
                  <h3 className="text-2xl font-semibold text-foreground">Coordination</h3>
                  <p className="text-lg text-muted-foreground leading-[1.7]">
                    It's hard to get a group from "we should hang" to "see you Thursday at 7." Schedules, preferences, budgets, and energy levels all collide. Most planning apps failed because they couldn't handle this complexity.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="text-6xl font-bold text-primary/20">02</div>
                  <h3 className="text-2xl font-semibold text-foreground">Continuity</h3>
                  <p className="text-lg text-muted-foreground leading-[1.7]">
                    Even when a plan happens, the rhythm often dies. Routines fade, people drift, and nothing is tracking the health of your group over time.
                  </p>
                </div>

                <p className="text-xl font-medium text-foreground pt-6 border-t border-border">
                  We don't need more feeds. We need help keeping the important groups in our lives alive.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* New Category - Centered with emphasis */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-[900px] mx-auto text-center space-y-12 fade-on-scroll opacity-0">
            <h2 className="text-4xl md:text-6xl font-semibold text-foreground leading-[1.1]">
              AI Social Infrastructure
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-[1.6] max-w-[750px] mx-auto">
              A new class of technology that uses intelligence to support the formation, maintenance, and growth of real human relationships.
            </p>

            <div className="grid md:grid-cols-2 gap-8 pt-8 text-left">
              <div className="space-y-4 p-6 rounded-2xl bg-secondary/30">
                <h3 className="text-lg font-semibold text-foreground">It's not:</h3>
                <ul className="space-y-2 text-base text-muted-foreground">
                  <li>• a social network</li>
                  <li>• a chat app</li>
                  <li>• another event planner</li>
                </ul>
              </div>

              <div className="space-y-4 p-6 rounded-2xl bg-primary/10">
                <h3 className="text-lg font-semibold text-foreground">Instead, it's a calm layer that:</h3>
                <ul className="space-y-2 text-base text-foreground/80">
                  <li>• coordinates decisions</li>
                  <li>• remembers what works</li>
                  <li>• supports lasting relationships</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Three Layers - Visual timeline */}
        <section className="py-24 md:py-32 px-6 bg-secondary/20">
          <div className="max-w-[1000px] mx-auto">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground leading-[1.15] mb-16 text-center fade-on-scroll opacity-0">
              From one plan to a living social fabric
            </h2>
            
            <div className="space-y-12">
              <div className="fade-on-scroll opacity-0 flex gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                  1
                </div>
                <div className="space-y-3 pt-2">
                  <h3 className="text-2xl font-semibold text-foreground">Utility: "Group OS"</h3>
                  <p className="text-lg text-muted-foreground leading-[1.7]">
                    Help groups go from intent to plan to meetup with almost no coordination tax. Plan links, one-tap accepts, and a shared group home where the next plan is always one step away.
                  </p>
                </div>
              </div>

              <div className="fade-on-scroll opacity-0 flex gap-6" style={{ animationDelay: '0.1s' }}>
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                  2
                </div>
                <div className="space-y-3 pt-2">
                  <h3 className="text-2xl font-semibold text-foreground">Memory: "Ritual graph"</h3>
                  <p className="text-lg text-muted-foreground leading-[1.7]">
                    Clusive builds a memory of your group's rituals, favorite spots, and patterns. A living map of your shared history and rhythm.
                  </p>
                </div>
              </div>

              <div className="fade-on-scroll opacity-0 flex gap-6" style={{ animationDelay: '0.2s' }}>
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                  3
                </div>
                <div className="space-y-3 pt-2">
                  <h3 className="text-2xl font-semibold text-foreground">Network: "Groups-first social graph"</h3>
                  <p className="text-lg text-muted-foreground leading-[1.7]">
                    Groups connect with other groups, neighborhoods, and venues. Cities and communities can see and support the real rhythms of how people gather.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Today & Tomorrow - Side by side */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 gap-16">
            <div className="space-y-6 fade-on-scroll opacity-0">
              <div className="text-sm font-medium text-primary uppercase tracking-wider">Today</div>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground leading-[1.2]">
                A lighter way to plan and keep rituals
              </h2>
              
              <ul className="space-y-4 text-base md:text-lg text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">→</span>
                  <span>Share a plan link that lets your group accept with one tap</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">→</span>
                  <span>Keep a group home where you see who's in and what's next</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">→</span>
                  <span>Spot emerging rituals so you don't lose momentum</span>
                </li>
              </ul>

              <p className="text-base text-muted-foreground/80 italic pt-4">
                The AI is mostly invisible, powering everything behind the scenes.
              </p>
            </div>

            <div className="space-y-6 fade-on-scroll opacity-0" style={{ animationDelay: '0.2s' }}>
              <div className="text-sm font-medium text-primary uppercase tracking-wider">Tomorrow</div>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground leading-[1.2]">
                The wider social fabric
              </h2>
              
              <ul className="space-y-4 text-base md:text-lg text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">→</span>
                  <span><strong className="text-foreground">For groups:</strong> plans coordinate themselves, rituals stay alive</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">→</span>
                  <span><strong className="text-foreground">For cities:</strong> a group-first map of how people gather</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">→</span>
                  <span><strong className="text-foreground">For society:</strong> less loneliness, more belonging</span>
                </li>
              </ul>

              <p className="text-lg font-medium text-foreground pt-4">
                AI should strengthen human connection, not replace it.
              </p>
            </div>
          </div>
        </section>

        {/* Design Principles - Pullquote style */}
        <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-secondary/30 to-background">
          <div className="max-w-[900px] mx-auto text-center space-y-12 fade-on-scroll opacity-0">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground leading-[1.15]">
              Calm, intelligent, and warmly human
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8">
              {['Calm', 'Intelligent', 'Invisible', 'Warmly human', 'Trustworthy', 'Privacy-first'].map((principle, i) => (
                <div 
                  key={principle}
                  className="p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 fade-on-scroll opacity-0"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <p className="text-lg font-medium text-foreground">{principle}</p>
                </div>
              ))}
            </div>

            <p className="text-2xl md:text-3xl font-light text-foreground/90 italic pt-12 leading-[1.4]">
              "We're designing something to be felt, not seen: <br className="hidden md:block" />
              the invisible fabric between people."
            </p>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-20 md:py-32 px-6">
          <div className="max-w-[700px] mx-auto text-center space-y-8 fade-on-scroll opacity-0">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground leading-[1.2]">
              Join us in building this
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-[1.6]">
              Be one of the first groups on Clusive and help shape the future of how small groups stay connected.
            </p>

            <div className="pt-4">
              <Link to="/new" onClick={() => { analytics.track('cta_join_waitlist', { location: 'why_closing' }); window.scrollTo(0, 0); }}>
                <Button size="lg" className="text-sm px-8">
                  Get early access
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

export default WhyClusive;