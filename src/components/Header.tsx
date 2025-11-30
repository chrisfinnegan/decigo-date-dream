import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const location = useLocation();
  const isPlanPage = location.pathname.startsWith('/p/');

  return (
    <header className="bg-background z-50 border-b border-border">
      <div className="w-full px-6 h-[64px] flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/brand/logo-name.png" alt="Clusive" className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/new">
            <Button size="sm">
              {isPlanPage ? 'Create your own plan' : 'Get early access'}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
