import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface InstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export const InstallPrompt = ({ onInstall, onDismiss }: InstallPromptProps) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <Card className="shadow-lg border-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-5 h-5" />
                Install Decigo
              </CardTitle>
              <CardDescription className="mt-1">
                Add to your home screen for quick access
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={onInstall} className="flex-1">
            Install
          </Button>
          <Button onClick={onDismiss} variant="outline" className="flex-1">
            Not now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
