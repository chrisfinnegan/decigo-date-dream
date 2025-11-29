import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-background py-6 px-4 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Privacy-light by design. Your data, your control.
        </p>
        <div className="flex gap-6">
          <Link to="/legal/privacy" className="text-xs text-muted-foreground hover:text-primary no-underline uppercase tracking-wider transition-colors">
            Privacy
          </Link>
          <Link to="/legal/terms" className="text-xs text-muted-foreground hover:text-primary no-underline uppercase tracking-wider transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
};
