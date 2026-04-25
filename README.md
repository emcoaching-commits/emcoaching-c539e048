# Em' Coaching — Site de coaching sportif

Site web officiel d'**Em' Coaching**, plateforme de coaching sportif personnalisé tenue par Emma, coach sportive certifiée.

🌐 **Site en ligne** : [emcoaching.lovable.app](https://emcoaching.lovable.app)

---

## ✨ Fonctionnalités
 
- 🏠 **Page d'accueil** dynamique avec présentation du coach
- 💪 **Formules de coaching** personnalisables (présentiel, en ligne, accompagnement)
- 📅 **Planning** avec réservation de créneaux
- 📝 **Questionnaire** d'évaluation pour les nouveaux clients
- ⭐ **Avis clients** modérés
- 👤 **Espace personnel** sécurisé (profil, suivi, paiement)
- 🛠️ **Dashboard administrateur** complet (gestion contenus, formules, créneaux, utilisateurs)
- 📧 **Authentification** par email + Google OAuth
- 📆 **Synchronisation Google Calendar** pour les rendez-vous

---

## 🛠️ Stack technique

| Domaine | Technologie |
|---|---|
| Framework | React 18 + Vite 5 |
| Langage | TypeScript 5 |
| Styles | Tailwind CSS v3 + shadcn/ui |
| Animations | Framer Motion |
| Routing | React Router v6 |
| Data fetching | TanStack Query |
| Backend | Lovable Cloud (Supabase) |
| Auth | Supabase Auth (email + Google) |
| Base de données | PostgreSQL (via Supabase) |
| Tests | Vitest + Playwright |

---

## 🚀 Démarrage rapide

### Prérequis

- [Node.js](https://nodejs.org/) 18+ ou [Bun](https://bun.sh/)

### Installation

```bash
# Cloner le projet
git clone <URL_DU_REPO>
cd <NOM_DU_REPO>

# Installer les dépendances
bun install
# ou
npm install

# Lancer le serveur de développement
bun run dev
# ou
npm run dev
```

L'application sera disponible sur [http://localhost:8080](http://localhost:8080).

---

## 📁 Structure du projet

```
src/
├── components/        # Composants React réutilisables
│   ├── ui/            # Composants shadcn/ui
│   └── admin/         # Composants du dashboard admin
├── pages/             # Pages de l'application (routes)
├── hooks/             # Hooks React personnalisés
├── integrations/      # Intégrations externes (Supabase)
├── lib/               # Utilitaires
└── index.css          # Design system (tokens HSL)

supabase/
├── functions/         # Edge functions (Google Calendar, etc.)
└── migrations/        # Migrations SQL
```

---

## 🎨 Design system

Le projet utilise un **design system** centralisé dans `src/index.css` et `tailwind.config.ts` :

- 🎨 **Palette** : bleu nuit / bleu électrique
- 🔤 **Typographie** : Bebas Neue (titres) + Outfit (corps)
- 🌗 **Mode sombre** par défaut
- 🧩 **Tokens sémantiques** (HSL) — ne jamais utiliser de couleurs en dur

---

## 📜 Scripts disponibles

| Commande | Description |
|---|---|
| `bun run dev` | Lance le serveur de développement |
| `bun run build` | Build de production |
| `bun run preview` | Prévisualise le build de production |
| `bun run lint` | Vérifie le code avec ESLint |
| `bun run test` | Lance les tests unitaires (Vitest) |

---

## 🔐 Sécurité

- ✅ Row-Level Security (RLS) activée sur toutes les tables
- ✅ Rôles utilisateur stockés dans une table dédiée (`user_roles`)
- ✅ Validation côté serveur via fonctions `SECURITY DEFINER`
- ✅ Authentification gérée par Supabase Auth

---

## 📞 Contact

- **Coach** : Emma
- **Téléphone** : 06 70 61 96 28
- **Site** : [emcoaching.lovable.app](https://emcoaching.lovable.app)

---

## 📄 Licence

Projet privé — © Em' Coaching. Tous droits réservés.
