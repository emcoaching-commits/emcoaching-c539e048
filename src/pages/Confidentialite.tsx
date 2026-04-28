import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Confidentialite = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16 container max-w-3xl">
      <h1 className="font-display text-4xl text-gradient-blue mb-8">POLITIQUE DE CONFIDENTIALITÉ</h1>
      <div className="space-y-6 text-foreground/90">
        <section>
          <h2 className="font-display text-2xl mb-2">Données collectées</h2>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>Nom / prénom</li>
            <li>Email</li>
            <li>Informations nécessaires au coaching</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-2">Utilisation</h2>
          <p className="text-muted-foreground">Les données servent uniquement à : gérer les clients et améliorer les services.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-2">Stockage</h2>
          <p className="text-muted-foreground">Les données sont conservées de manière sécurisée.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-2">Droits</h2>
          <p className="text-muted-foreground">Conformément au RGPD, vous pouvez accéder à vos données, les modifier ou les supprimer.</p>
          <p className="text-muted-foreground">Contact : emcoaching@emcoachingfr.com</p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-2">Cookies</h2>
          <p className="text-muted-foreground">Le site peut utiliser des cookies pour améliorer l'expérience.</p>
        </section>
      </div>
    </div>
    <Footer />
  </div>
);

export default Confidentialite;