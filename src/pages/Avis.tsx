import Navbar from "@/components/Navbar";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";

const Avis = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <ReviewsSection />
    </div>
    <Footer />
  </div>
);

export default Avis;
