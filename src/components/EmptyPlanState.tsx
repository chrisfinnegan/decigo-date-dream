import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyPlanStateProps {
  title?: string;
  description?: string;
  showCreateButton?: boolean;
}

export const EmptyPlanState = ({ 
  title = "This plan is not available",
  description = "It may have been canceled or the link might be incorrect. Ask your organizer for the latest link.",
  showCreateButton = true
}: EmptyPlanStateProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        {showCreateButton && (
          <CardContent className="flex justify-center">
            <Link to="/new">
              <Button className="btn-primary">
                Create your own plan
              </Button>
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
