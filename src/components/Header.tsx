import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const scrollToIntake = () => {
    const intakeSection = document.getElementById('intake-section');
    if (intakeSection) {
      intakeSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white border-b border-decigo-slate-300 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/brand/logo-mark.svg" alt="Decigo" className="h-[60px] w-[60px]" />
        </Link>
        <div className="flex items-center gap-4">
          <button 
            onClick={scrollToIntake}
            className="text-decigo-teal hover:text-decigo-deep-teal font-medium text-sm no-underline transition-colors"
          >
            How it works
          </button>
          <Button onClick={scrollToIntake} className="btn-primary text-sm h-9 px-4">
            Start planning
          </Button>
        </div>
      </div>
    </header>
  );
};
