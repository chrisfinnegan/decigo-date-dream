import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="card">
          <h1 className="text-3xl font-bold text-decigo-deep-teal mb-6">Terms of Service</h1>
          <p className="text-decigo-slate-700">Terms of service content coming soon...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
