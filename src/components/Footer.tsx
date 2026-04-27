const Footer = () => (
  <footer className="border-t border-border py-8">
    <div className="container flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
      <p className="font-display text-2xl text-gradient-blue">EM' COACHING</p>
      <div className="flex flex-col items-center gap-1 sm:items-end">
        <p className="text-muted-foreground text-sm">© 2026 Em' Coaching. Tous droits réservés.</p>
        <p className="text-muted-foreground/60 text-xs">
          Site créé par DRODE Tom en collaboration avec BERLIN Emma
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
