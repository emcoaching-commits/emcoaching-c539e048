import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MentionsLegales = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16 container max-w-3xl">
      <h1 className="font-display text-4xl text-gradient-blue mb-8">MENTIONS LÉGALES</h1>
      <div className="prose prose-invert text-foreground/90 space-y-6">
        <section>
          <h2 className="font-display text-2xl text-foreground mb-2">Éditeur du site</h2>
          <p>Le site EM' Coaching est édité par :</p>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>Nom : Emma Berlin</li>
            <li>Statut : Auto-entrepreneur</li>
            <li>Adresse : [À compléter]</li>
            <li>Email : emcoaching@emcoachingfr.com</li>
            <li>Téléphone : 06 70 61 96 28</li>
            <li>Numéro SIRET : [À compléter]</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground mb-2">Hébergement</h2>
          <p className="text-muted-foreground">Le site est hébergé par GitHub :</p>
          <p className="text-muted-foreground">GitHub, Inc. — 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis</p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground mb-2">Propriété intellectuelle</h2>
          <p className="text-muted-foreground">Tous les contenus présents sur le site sont protégés. Toute reproduction est interdite sans autorisation.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-foreground mb-2">Responsabilité</h2>
          <p className="text-muted-foreground">Le site peut contenir des erreurs. L'éditeur ne peut être tenu responsable.</p>
        </section>
      </div>
    </div>
    <Footer />
  </div>
);

export default MentionsLegales;