# 🎨 Guide de Design KLB.suite

## Vue d'ensemble

KLB.suite a reçu un relooking complet et professionnel. Le nouveau design suit une approche moderne, cohérente et responsive sur tous les appareils.

## 🎯 Palette de Couleurs

### Couleurs Primaires
- **Indigo**: `#4F46E5` - Couleur principale, utilisée pour les CTA et les éléments interactifs
- **Bleu**: `#2563EB` - Couleur secondaire, utilisée pour les accents
- **Gris**: `#6B7280` - Texte et bordures

### Couleurs Secondaires
- **Vert**: `#10B981` - Succès et confirmations
- **Rouge**: `#EF4444` - Erreurs et alertes
- **Jaune**: `#F59E0B` - Avertissements
- **Orange**: `#F97316` - Notifications

### Dégradés Personnalisés
- **Gradient Primaire**: De indigo à bleu (`from-indigo-600 to-blue-600`)
- **Gradient Léger**: De indigo léger à bleu léger (`from-indigo-50 to-blue-50`)

## 📐 Typographie

### Hiérarchie de Texte
- **H1**: 24px-30px (md-3xl), Gras
- **H2**: 20px-24px (lg-2xl), Gras
- **H3**: 18px (lg), Gras
- **Body**: 14px-16px, Normal
- **Small**: 12px, Normal

## 🔘 Composants

### Boutons
Les boutons ont été modernisés avec trois variantes :

**Primary** (Indigo)
```jsx
<Button variant="primary">Action Principale</Button>
```

**Secondary** (Gris)
```jsx
<Button variant="secondary">Action Secondaire</Button>
```

**Outline** (Bordure)
```jsx
<Button variant="outline">Action Alternative</Button>
```

**Success** (Vert)
```jsx
<Button variant="success">Succès</Button>
```

**Danger** (Rouge)
```jsx
<Button variant="danger">Danger</Button>
```

### Inputs et Selects
- Hauteur: 44px (11 unités)
- Bordure: 2px au lieu de 1px
- Focus: Ring indigo-500
- Transition: 200ms

### Cartes
Les cartes sont maintenant arrondies et ont une ombre cohérente :
```jsx
<div className="card-lg">
  {/* Contenu */}
</div>
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Considérations Responsive
- **Header**: Sticky, adaptatif sur mobile
- **Grille**: 1 colonne (mobile) → 2 colonnes (tablet) → 3 colonnes (desktop)
- **Padding**: 16px (mobile) → 24px (tablet) → 32px (desktop)
- **Typographie**: Taille adaptée selon l'écran

### Utilities Responsive
```jsx
// Conteneur responsive
<div className="container-responsive">

// Grille responsive
<div className="grid-responsive">

// Padding responsive
<div className="p-responsive">
```

## 🎭 Pages Modernisées

### 1. Login
- ✅ Gradient de fond avec animations
- ✅ Icône de logo professionnelle
- ✅ Animations d'entrée
- ✅ Messages d'erreur améliorés
- ✅ Fully responsive

### 2. Register
- ✅ Formulaire multi-étapes
- ✅ Sélection de rôle interactive
- ✅ Champs validés
- ✅ Animations fluides
- ✅ Design cohérent avec Login

### 3. EnvironmentSelection
- ✅ Header de navigation moderne
- ✅ Cartes avec dégradés et animation de survol
- ✅ Badges de statut dynamiques
- ✅ Fond sombre professionnel
- ✅ Responsive grid

### 4. StockManagement
- ✅ Header sticky et moderne
- ✅ Cartes colorées par réseau (Orange, Airtel, Vodacom)
- ✅ Section des écarts redessinée
- ✅ Table des ventes améliorée
- ✅ Messages d'état cohérents

### 5. RemiseRepris
- ✅ Section "Comptes Financiers" professionnelle
- ✅ Icônes SVG colorées par compte
- ✅ Cartes avec bordure latérale
- ✅ Taux d'échange en évidence
- ✅ Animations de survol

### 6. Dashboard
- ✅ Header avec avatar utilisateur
- ✅ Cartes de profil améliorées
- ✅ Permissions visuelles
- ✅ Section de stock intégrée

## 🎨 Système de Design Global

### Animations
- **Fade In**: 300ms
- **Slide Up**: 500ms
- **Slide Down**: 500ms
- **Pulse Soft**: 3s (boucle infinie)

### Ombres
- **Card**: `shadow-md` (survol: `shadow-lg`)
- **Card Large**: `shadow-lg` (survol: `shadow-2xl`)

### Bordures
- **Cartes**: `border border-gray-200`
- **Cartes Actives**: `border-2 border-indigo-500`
- **Accents**: Bordure latérale 4px colorée

## 🔧 Variables Tailwind Personnalisées

Toutes les classes personnalisées sont définies dans `index.css`:

```css
.card { /* Carte standard */ }
.card-lg { /* Carte large avec padding */ }
.gradient-primary { /* Dégradé principal */ }
.grid-responsive { /* Grille responsive */ }
.container-responsive { /* Conteneur responsive */ }
.animate-slideInUp { /* Animation d'entrée */ }
```

## ✨ Fonctionnalités Visuelles

### Indicateurs d'État
- **Actif**: Badge vert avec point animé
- **Inactif**: Badge gris
- **Erreur**: Alert rouge
- **Succès**: Alert vert

### Codes Couleur par Réseau
- **Mpesa**: Bleu (`from-blue-100 to-blue-50`)
- **OrangeMonnaie**: Orange (`from-orange-100 to-orange-50`)
- **AirtelMonnaie**: Rouge (`from-red-100 to-red-50`)
- **S.C (SuperCompte)**: Jaune (`from-yellow-100 to-yellow-50`)
- **CashExpress**: Vert (`from-green-100 to-green-50`)
- **Portefeuille**: Violet (`from-purple-100 to-purple-50`)

## 🚀 Prochaines Améliorations

- [ ] Mode sombre (dark mode)
- [ ] Thème personnalisé
- [ ] Accessibilité (WCAG 2.1 AA)
- [ ] Performance optimisée (Lazy loading)
- [ ] PWA (Progressive Web App)

## 📞 Support

Pour toute question sur le design, consultez ce guide ou contactez l'équipe de développement.

---

**Version**: 1.0  
**Dernière mise à jour**: 25 mai 2026  
**Auteur**: KLB.suite Design Team
