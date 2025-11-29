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
    <header className="bg-background px-6 h-[72px] overflow-visible">
      <div className="max-w-[840px] mx-auto flex items-center justify-between h-full">
        <Link to="/" className="flex items-center">
          <img src="/brand/logo-name.png" alt="Clusive" className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/new">
            <Button className="h-10 px-6 text-[0.88rem]">
              {isPlanPage ? 'Create your own plan' : 'Start planning'}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
