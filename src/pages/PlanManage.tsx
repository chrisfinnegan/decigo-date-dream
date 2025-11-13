import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Plan {
  id: string;
  daypart: string;
  date_start: string;
  date_end: string;
  neighborhood: string;
  headcount: number;
  budget_band: string;
  threshold: number;
  decision_deadline: string;
  locked: boolean;
  canceled: boolean;
}

const PlanManage = () => {
  const { planId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteContacts, setInviteContacts] = useState("");

  useEffect(() => {
    if (planId && token) {
      loadPlan();
    }
  }, [planId, token]);

  const loadPlan = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('plans-get', {
        body: { id: planId },
      });

      if (error) throw error;

      setPlan(data.plan);
    } catch (error) {
      console.error('Error loading plan:', error);
      toast({
        title: "Error",
        description: "Failed to load plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPlan = async () => {
    try {
      const { error } = await supabase.functions.invoke('plans-cancel', {
        body: { planId, token },
      });

      if (error) throw error;

      toast({
        title: "Plan canceled",
        description: "Your plan has been canceled",
      });

      navigate('/');
    } catch (error) {
      console.error('Error canceling plan:', error);
      toast({
        title: "Error",
        description: "Failed to cancel plan",
        variant: "destructive",
      });
    }
  };

  const handleSendInvites = async () => {
    try {
      // Parse contacts from textarea (simple implementation)
      const lines = inviteContacts.split('\n').filter(l => l.trim());
      const contacts = lines.map(line => {
        const channel = line.includes('@') ? 'email' : 'sms';
        return {
          channel,
          value: line.trim(),
          consentAt: new Date().toISOString(),
        };
      });

      if (contacts.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one contact",
          variant: "destructive",
        });
        return;
      }

      // Add invites
      const { error: addError } = await supabase.functions.invoke('invites-add', {
        body: { planId, token, contacts },
      });

      if (addError) throw addError;

      // Send invites
      const { error: sendError } = await supabase.functions.invoke('invites-send', {
        body: { planId, token },
      });

      if (sendError) throw sendError;

      toast({
        title: "Invites sent!",
        description: `Sent to ${contacts.length} recipients`,
      });

      setInviteContacts("");
    } catch (error) {
      console.error('Error sending invites:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invites",
        variant: "destructive",
      });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need a valid management token to access this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Plan not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Manage Plan</h1>
          <div className="flex gap-2 flex-wrap">
            {plan.locked && <Badge variant="default">Locked</Badge>}
            {plan.canceled && <Badge variant="destructive">Canceled</Badge>}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Daypart</Label>
              <p className="text-sm text-muted-foreground">{plan.daypart}</p>
            </div>
            <div>
              <Label>Neighborhood</Label>
              <p className="text-sm text-muted-foreground">{plan.neighborhood}</p>
            </div>
            <div>
              <Label>Date Range</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(plan.date_start).toLocaleString()} - {new Date(plan.date_end).toLocaleString()}
              </p>
            </div>
            <div>
              <Label>Headcount</Label>
              <p className="text-sm text-muted-foreground">{plan.headcount} people</p>
            </div>
            <div>
              <Label>Budget</Label>
              <p className="text-sm text-muted-foreground">{plan.budget_band}</p>
            </div>
            <div>
              <Label>Threshold</Label>
              <p className="text-sm text-muted-foreground">{plan.threshold} votes needed to lock</p>
            </div>
            <div>
              <Label>Decision Deadline</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(plan.decision_deadline).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {!plan.locked && !plan.canceled && (
          <Card>
            <CardHeader>
              <CardTitle>Send Invites</CardTitle>
              <CardDescription>Add phone numbers or emails (one per line)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="+1234567890&#10;friend@example.com"
                value={inviteContacts}
                onChange={(e) => setInviteContacts(e.target.value)}
                rows={6}
              />
              <Button onClick={handleSendInvites} className="w-full">
                Send Invites
              </Button>
            </CardContent>
          </Card>
        )}

        {!plan.canceled && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Cancel Plan
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently cancel the plan. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, keep it</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelPlan}>
                      Yes, cancel plan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlanManage;
