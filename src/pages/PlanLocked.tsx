import { useParams } from "react-router-dom";

const PlanLocked = () => {
  const { planId } = useParams();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Plan Locked</h1>
        <p className="text-muted-foreground">Plan ID: {planId}</p>
        <p className="text-muted-foreground mt-2">ICS download and share card coming soon...</p>
      </div>
    </div>
  );
};

export default PlanLocked;
