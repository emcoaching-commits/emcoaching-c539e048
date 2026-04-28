import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CGV = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16 container max-w-3xl">
      <h1 className="font-display text-4xl text-gradient-blue mb-8">CONDITIONS GÉNÉRALES DE VENTE</h1>
      <div className="space-y-6 text-foreground/90">
        <section>
          <h2 className="font-display text-2xl mb-2">Article 1 – Objet</h2>
          <p className="text-muted-foreground">Les présentes CGV définissent les conditions de vente des services proposés par EM' Coaching.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-2">Article 2 – Services</h2>
          <p className="text-muted-foreground">EM' Coaching propose : coaching sportif, suivi personnalisé, conseils nutritionnels.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-2">Article 3 – Prix</h2>
          <p className="text-muted-foreground">Les prix sont affichés sur le site. EM' Coaching se réserve le droit de les modifier à tout moment.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-2">Article 4 – Paiement</h2>
          <p className="text-muted-foreground">Le paiement est exigé avant toute prestation. Les moyens de paiement sont précisés sur le site.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-2">Article 5 – Annulation / remboursement</h2>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>Toute prestation commencée est due</li>
            <li>Aucun remboursement après démarrage sauf cas exceptionnel</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-2">Article 6 – Responsabilité</h2>
          <p className="text-muted-foreground">Le client est responsable de sa santé. Il doit vérifier qu'il est apte à pratiquer une activité physique.</p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-2">Article 7 – Données personnelles</h2>
          <p className="text-muted-foreground">Les données sont utilisées uniquement dans le cadre du coaching.</p>
        </section>
      </div>
    </div>
    <Footer />
  </div>
);

export default CGV;