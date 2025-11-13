import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="bg-white border-b border-decigo-slate-300 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/brand/logo-mark.svg" alt="Decigo" className="h-10 w-10" />
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/new">
            <Button className="btn-primary text-sm h-9 px-4">
              Start planning
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
