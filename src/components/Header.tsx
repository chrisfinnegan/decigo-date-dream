import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  const location = useLocation();
  const isPlanPage = location.pathname.startsWith('/p/');
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-background z-50">
      <div className="w-full px-6 h-[64px] flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/brand/logo-name.png" alt="Clusive" className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            to="/why-clusive" 
            className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Why Clusive
          </Link>
          <Link to="/new">
            <Button size="sm">
              {isPlanPage ? 'Create your own plan' : 'Get early access'}
            </Button>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="sm" variant="ghost" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link 
                  to="/why-clusive"
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-foreground hover:text-primary transition-colors py-2"
                >
                  Why Clusive
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
