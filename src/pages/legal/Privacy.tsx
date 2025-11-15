import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="card">
          <h1 className="text-3xl font-bold text-brand-primary mb-6">Privacy Policy</h1>
          <p className="text-brand-body">Privacy policy content coming soon...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
