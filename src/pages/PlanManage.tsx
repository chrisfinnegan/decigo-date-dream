import { useParams, useSearchParams } from "react-router-dom";

const PlanManage = () => {
  const { planId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Manage Plan</h1>
        <p className="text-muted-foreground">Plan ID: {planId}</p>
        <p className="text-muted-foreground mt-2">Token: {token ? "Valid" : "Missing"}</p>
        <p className="text-muted-foreground mt-2">Edit, extend, cancel controls coming soon...</p>
      </div>
    </div>
  );
};

export default PlanManage;
