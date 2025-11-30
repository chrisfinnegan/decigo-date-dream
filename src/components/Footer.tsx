import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12 px-6">
      <div className="max-w-[880px] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <span>·</span>
            <span>AI Social Infrastructure</span>
            <span>·</span>
            <Link to="/legal/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <span>·</span>
            <Link to="/legal/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="https://x.com/clusive" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              @clusive
            </a>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Clusive, Inc. © 2025
        </div>
      </div>
    </footer>
  );
};
