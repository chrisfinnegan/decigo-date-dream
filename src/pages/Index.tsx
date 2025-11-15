import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

const Index = () => {
  useEffect(() => {
    analytics.trackLPView();
  }, []);

  const returningUser = localStorage.getItem('decigo_returning_user');

  return (
    <div className="min-h-screen flex items-center justify-center bg-decigo-cream">
      <div className="text-center space-y-8 p-8 max-w-3xl">
        <img src="/brand/logo-full.png" alt="Decigo" className="h-16 mx-auto mb-6" />
        
        {/* Problem/Solution Framing */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-decigo-deep-teal">
            Tired of endless "Where should we go?" texts?
          </h2>
          <p className="text-xl text-decigo-slate-700">
            Decigo suggests great spots, your group votes, and you lock the winner without the group chat chaos.
          </p>
        </div>

        {/* How it Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          <div className="space-y-2">
            <div className="text-3xl">⚡</div>
            <p className="text-sm font-medium text-decigo-deep-teal">Set when & where</p>
            <p className="text-xs text-decigo-slate-600">Takes 15 seconds</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🎯</div>
            <p className="text-sm font-medium text-decigo-deep-teal">We suggest top spots</p>
            <p className="text-xs text-decigo-slate-600">In that area, automatically</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">✅</div>
            <p className="text-sm font-medium text-decigo-deep-teal">Group votes & you lock</p>
            <p className="text-xs text-decigo-slate-600">Winner decided, no arguments</p>
          </div>
        </div>

        <p className="text-base text-decigo-slate-600 italic">
          No more 32-message threads arguing about dinner.
        </p>

        <div className="flex flex-col items-center gap-3 pt-4">
          {returningUser && (
            <div className="inline-block bg-decigo-green/20 text-decigo-deep-teal px-3 py-1 rounded-full text-xs font-medium mb-2">
              Welcome back 👋
            </div>
          )}
          <Link to="/new">
            <Button className="btn-primary h-14 px-10 text-lg">
              {returningUser ? 'Create your next plan' : 'Create a Plan'}
            </Button>
          </Link>
          <p className="text-sm text-decigo-slate-500">
            No login required • Under 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
