import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background pt-[64px]">
      <Header />
      <div className="max-w-[1040px] mx-auto px-6 py-10">
        <div className="card">
          <div className="uppercase text-xs tracking-[0.15em] text-muted-foreground font-medium mb-4">
            Legal
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground">Privacy policy content coming soon...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
