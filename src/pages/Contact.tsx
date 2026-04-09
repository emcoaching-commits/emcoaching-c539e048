import Navbar from "@/components/Navbar";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Contact = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-16">
      <ContactSection />
    </div>
    <Footer />
  </div>
);

export default Contact;
