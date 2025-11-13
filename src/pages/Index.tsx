import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

const Index = () => {
  useEffect(() => {
    analytics.trackLPView();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-decigo-cream">
      <div className="text-center space-y-8 p-8 max-w-2xl">
        <img src="/brand/logo-full.png" alt="Decigo" className="h-16 mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-decigo-deep-teal mb-4">
          Plan Together, Decide Together
        </h1>
        <p className="text-xl text-decigo-slate-700">
          Create group plans, share options, and let everyone vote on where to go.
        </p>
        <Link to="/new">
          <Button className="btn-primary h-12 px-8 text-base">
            Create a Plan
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
