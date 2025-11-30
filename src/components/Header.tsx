import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const location = useLocation();
  const isPlanPage = location.pathname.startsWith('/p/');

  return (
    <header className="w-full bg-background border-b border-border/50">
      <div className="max-w-[1040px] mx-auto px-6 h-[64px] flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/brand/logo-name.png" alt="Clusive" className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/new">
            <Button size="sm">
              {isPlanPage ? 'Create your own plan' : 'Start planning'}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
