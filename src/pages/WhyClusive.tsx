import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const WhyClusive = () => {
  useEffect(() => {
    analytics.track('why_clusive_view');
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-[64px]">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[800px] mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-semibold leading-[1.1] text-foreground tracking-tight">
              Why Clusive exists
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-[1.5]">
              We use AI to remove the friction between people so connection becomes easier, not rarer.
            </p>

            <div className="text-lg md:text-xl text-muted-foreground leading-[1.7] pt-4">
              <p>Most technology pulls attention away from the people you care about. Clusive is built for the opposite: helping your small groups form, grow, and thrive with just enough intelligence in the background to keep you showing up for each other.</p>
            </div>

            <div className="pt-6">
              <Link to="/new" onClick={() => { analytics.track('cta_get_early_access', { location: 'why_hero' }); window.scrollTo(0, 0); }}>
                <Button size="lg" className="text-base px-8">
                  Get early access
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 1 - The Problem */}
        <section className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[800px] mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground leading-[1.2]">
              Connection is breaking on two fronts
            </h2>
            
            <div className="space-y-8 text-lg md:text-xl text-muted-foreground leading-[1.7]">
              <div>
                <p className="font-semibold text-foreground mb-3">1. Coordination</p>
                <p>It's hard to get a group from "we should hang" to "see you Thursday at 7." Schedules, preferences, budgets, and energy levels all collide. Most planning apps failed because they couldn't handle this complexity.</p>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-3">2. Continuity</p>
                <p>Even when a plan happens, the rhythm often dies. Routines fade, people drift, and nothing is tracking the health of your group over time.</p>
              </div>

              <p className="text-xl font-medium text-foreground pt-4">
                We don't need more feeds. We need help keeping the important groups in our lives alive.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 - A Different Kind of Category */}
        <section className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[800px] mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground leading-[1.2]">
              AI Social Infrastructure, in plain language
            </h2>
            
            <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-[1.7]">
              <p>We call Clusive AI Social Infrastructure: a new class of technology that uses intelligence to support the formation, maintenance, and growth of real human relationships.</p>

              <div className="space-y-4">
                <p className="font-medium text-foreground">It's not:</p>
                <ul className="space-y-2 pl-6">
                  <li>• a social network (we don't optimize for endless engagement),</li>
                  <li>• a chat app (we're not here to replace your group chats),</li>
                  <li>• another "event planner" bolted on top of your calendar.</li>
                </ul>
              </div>

              <div className="space-y-4 pt-4">
                <p className="font-medium text-foreground">Instead, it's a calm layer that:</p>
                <ul className="space-y-2 pl-6">
                  <li>• coordinates decisions,</li>
                  <li>• remembers what works for your group,</li>
                  <li>• and quietly supports the relationships you want to last.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 - Three Layers */}
        <section className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[800px] mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground leading-[1.2]">
              From one plan to a living social fabric
            </h2>
            
            <div className="space-y-8 text-lg md:text-xl text-muted-foreground leading-[1.7]">
              <div>
                <p className="font-semibold text-foreground mb-3">1. Utility: "Group OS" (today's wedge)</p>
                <p>The starting point is simple: help groups go from intent to plan to meetup with almost no coordination tax. This is your plan links, one-tap accepts, and a shared group home where the next plan is always one step away.</p>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-3">2. Memory: "Ritual graph"</p>
                <p>Over time, Clusive builds a memory of your group's rituals, favorite spots, and patterns: who tends to show up, which nights work, what kinds of plans leave everyone feeling good. This becomes a living map of your shared history and rhythm.</p>
              </div>

              <div>
                <p className="font-semibold text-foreground mb-3">3. Network: "Groups-first social graph"</p>
                <p>In the long run, groups can connect with other groups, neighborhoods, and venues, all through the same intelligent layer. Cities, campuses, and communities can see and support the real rhythms of how people gather.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 - What This Looks Like Today */}
        <section className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[800px] mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground leading-[1.2]">
              Today: a lighter way to plan and keep rituals
            </h2>
            
            <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-[1.7]">
              <p>In v0, Clusive focuses on a few simple jobs:</p>

              <ul className="space-y-4 pl-6">
                <li>• Share a plan link that lets your group accept with one tap. No messy polls or 40-message threads.</li>
                <li>• Keep a group home where you can see who's in the circle, what's next, and what you've done together recently.</li>
                <li>• Spot emerging rituals ("you've done Sunday brunch three times… want to make this a thing?") so you don't lose momentum.</li>
              </ul>

              <p className="pt-4">The AI is mostly invisible. It powers the planning, nudges, suggestions, and shared spaces behind the scenes so the experience feels like "of course this is how our group runs itself," not like talking to a bot.</p>
            </div>
          </div>
        </section>

        {/* Section 5 - Where We're Going */}
        <section className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[800px] mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground leading-[1.2]">
              Long-term: from your group to the wider social fabric
            </h2>
            
            <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-[1.7]">
              <ul className="space-y-4 pl-6">
                <li>• <span className="font-medium text-foreground">For groups:</span> plans coordinate themselves, rituals stay alive, and everyone shares the social load more fairly.</li>
                <li>• <span className="font-medium text-foreground">For cities and communities:</span> a group-first map of how people gather, helping venues, neighborhoods, and organizations support real connection.</li>
                <li>• <span className="font-medium text-foreground">For society:</span> less loneliness, more belonging, and social health that can actually be measured and strengthened over time.</li>
              </ul>

              <p className="text-xl font-medium text-foreground pt-6">
                We think AI should strengthen human connection, not replace it. Clusive is our bet on what that looks like.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6 - How We Build */}
        <section className="py-20 md:py-32 px-6 bg-background">
          <div className="max-w-[800px] mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground leading-[1.2]">
              Calm, intelligent, and warmly human
            </h2>
            
            <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-[1.7]">
              <p>Clusive is intentionally:</p>

              <ul className="space-y-3 pl-6">
                <li>• <span className="font-medium text-foreground">Calm</span> – it reduces chaos, never adds to it.</li>
                <li>• <span className="font-medium text-foreground">Intelligent</span> – clearly AI-powered, but not a gimmick.</li>
                <li>• <span className="font-medium text-foreground">Invisible</span> – runs quietly in the background.</li>
                <li>• <span className="font-medium text-foreground">Warmly human</span> – built for real relationships, not engagement metrics.</li>
                <li>• <span className="font-medium text-foreground">Trustworthy</span> – privacy-first and non-extractive.</li>
              </ul>

              <p className="text-xl italic text-foreground/80 pt-6">
                We're designing something to be felt, not seen: the invisible fabric between people.
              </p>
            </div>

            <div className="pt-8 text-center">
              <Link to="/new" onClick={() => { analytics.track('cta_join_waitlist', { location: 'why_closing' }); window.scrollTo(0, 0); }}>
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

export default WhyClusive;
