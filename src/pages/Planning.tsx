import Navbar from "@/components/Navbar";
import PlanningSection from "@/components/PlanningSection";
import Footer from "@/components/Footer";

const Planning = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <PlanningSection />
    </div>
    <Footer />
  </div>
);

export default Planning;
