import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-background py-6 px-4 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-decigo-slate-700">
          Privacy-light by design. Your data, your plan, your call.
        </p>
        <div className="flex gap-6">
          <Link to="/privacy" className="text-sm text-decigo-teal hover:text-decigo-deep-teal no-underline">
            Privacy
          </Link>
          <Link to="/terms" className="text-sm text-decigo-teal hover:text-decigo-deep-teal no-underline">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
};
