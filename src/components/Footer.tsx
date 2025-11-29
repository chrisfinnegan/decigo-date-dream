import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-8 px-6">
      <div className="max-w-[840px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-[0.75rem] text-muted-foreground uppercase tracking-[0.12em]">
          Privacy-light by design. Your data, your control.
        </p>
        <div className="flex gap-8">
          <Link to="/legal/privacy" className="text-[0.75rem] text-muted-foreground hover:text-foreground no-underline uppercase tracking-[0.12em] transition-colors">
            Privacy
          </Link>
          <Link to="/legal/terms" className="text-[0.75rem] text-muted-foreground hover:text-foreground no-underline uppercase tracking-[0.12em] transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
};
