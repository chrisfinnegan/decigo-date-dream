import { useParams, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const ManagePlan = () => {
  const { planId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen bg-decigo-cream">
      <Header />
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-decigo-deep-teal mb-6">Manage Plan</h1>
        <div className="card">
          <p className="text-decigo-slate-700 mb-2">Plan ID: <span className="font-mono text-sm">{planId}</span></p>
          <p className="text-decigo-slate-700 mt-2">Token: {token ? <span className="text-decigo-green">Valid</span> : <span className="text-decigo-error">Missing</span>}</p>
          <p className="text-decigo-slate-700 mt-4">Edit/extend/cancel controls coming soon...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ManagePlan;
