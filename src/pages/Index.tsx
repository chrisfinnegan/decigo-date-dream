import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/10 to-primary/5">
      <div className="text-center space-y-8 p-8 max-w-2xl">
        <h1 className="text-5xl font-bold text-foreground mb-4 animate-fade-in">
          Plan Together, Decide Together
        </h1>
        <p className="text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Create group plans, share options, and let everyone vote on where to go.
        </p>
        <Link to="/new">
          <Button size="lg" className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            Create a Plan
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
