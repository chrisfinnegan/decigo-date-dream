import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const location = useLocation();
  const isPlanPage = location.pathname.startsWith('/p/');
  
  const scrollToIntake = () => {
    const intakeSection = document.getElementById('intake-section');
    if (intakeSection) {
      intakeSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white border-b border-decigo-slate-300 px-4 h-[69px] overflow-visible">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
        <Link to="/" className="flex items-center">
          <img src="/brand/logo-name.png" alt="Decigo" className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <button 
            onClick={scrollToIntake}
            className="hidden md:block text-decigo-teal hover:text-decigo-deep-teal font-medium text-sm no-underline transition-colors"
          >
            How it works
          </button>
          <Link to="/new">
            <Button className="btn-primary text-sm h-9 px-4">
              {isPlanPage ? 'Create your own plan' : 'Start planning'}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
