# 📱 Guide de Responsive Design - KLB.suite

## Vue d'ensemble

KLB.suite utilise une approche **mobile-first** avec Tailwind CSS pour assurer une expérience optimale sur tous les appareils.

## 🎯 Breakpoints Tailwind

```
sm: 640px   (tablets)
md: 768px   (tablets larges)
lg: 1024px  (desktop)
xl: 1280px  (large desktop)
```

## 📐 Structure de Base Responsive

### Header Responsive
```jsx
<header className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Contenu */}
    </div>
  </div>
</header>
```

### Grille Responsive Standard
```jsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* 1 colonne par défaut, 2 sur tablet, 3 sur desktop */}
</div>
```

### Conteneur Responsive
```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Padding adapté selon écran */}
</div>
```

## 📏 Espacements Responsifs

### Padding
- Mobile: `px-4` (16px)
- Tablet: `sm:px-6` (24px)
- Desktop: `lg:px-8` (32px)

### Gaps (espaces entre éléments)
- Mobile: `gap-3` (12px)
- Tablet: `sm:gap-4` (16px)
- Desktop: `lg:gap-5` (20px)

### Margins
```jsx
<div className="mb-4 sm:mb-6 lg:mb-8">
  {/* Marge inférieure responsive */}
</div>
```

## 🔤 Typographie Responsive

### Titres
```jsx
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
  Titre Principal
</h1>
```

### Texte Body
```jsx
<p className="text-sm sm:text-base md:text-lg text-gray-600">
  Texte normal
</p>
```

### Labels
```jsx
<label className="text-xs sm:text-sm font-medium text-gray-700">
  Label
</label>
```

## 📱 Composants Responsive

### Forms Responsive
```jsx
<form className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <input className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
    <input className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
  </div>
</form>
```

### Cards Grid
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="card-lg">
    {/* Contenu carte */}
  </div>
</div>
```

### Tables Responsive
```jsx
{/* Pour mobile: scroll horizontal */}
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    {/* Tableau */}
  </table>
</div>

{/* Styles spéciaux pour mobile */}
@media (max-width: 640px) {
  table {
    display: block;
    overflow-x: auto;
  }
}
```

## 🎯 Patterns Responsive Courants

### Flex Layout
```jsx
{/* En colonne sur mobile, en ligne sur desktop */}
<div className="flex flex-col sm:flex-row gap-4">
  <div className="flex-1">Élément 1</div>
  <div className="flex-1">Élément 2</div>
</div>
```

### Menu Navigation
```jsx
{/* Menu caché sur mobile, visible sur desktop */}
<nav className="hidden lg:flex gap-6">
  {/* Navigation desktop */}
</nav>

{/* Menu mobile */}
<button className="lg:hidden">
  {/* Hamburger menu */}
</button>
```

### Sidebar + Content
```jsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <aside className="lg:col-span-1">
    {/* Sidebar - pleine largeur sur mobile */}
  </aside>
  <main className="lg:col-span-3">
    {/* Contenu principal */}
  </main>
</div>
```

## 🎨 Classes Responsive Personnalisées

### Container Responsive
```jsx
<div className="container-responsive">
  {/* px-4 sm:px-6 lg:px-8 + mx-auto + w-full */}
</div>
```

### Grid Responsive
```jsx
<div className="grid-responsive">
  {/* grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 */}
</div>
```

### Padding Responsive
```jsx
<div className="p-responsive">
  {/* p-4 sm:p-6 md:p-8 */}
</div>
```

## ✅ Checklist Responsive

Avant de valider une page, vérifiez:

- [ ] **Mobile (320-480px)**
  - [ ] Texte lisible sans scroll horizontal
  - [ ] Boutons et inputs suffisamment grands (min 44px)
  - [ ] Espacement cohérent
  - [ ] Images responsive (max-width: 100%)

- [ ] **Tablet (640-1024px)**
  - [ ] Layout adaptée (grille 2 colonnes)
  - [ ] Navigation adaptée
  - [ ] Forms multi-colonnes

- [ ] **Desktop (1025px+)**
  - [ ] Layout complet (grille 3 colonnes)
  - [ ] Toutes les fonctionnalités visibles
  - [ ] Max-width conteneur respecté

## 🧪 Outils de Test

### DevTools Responsive
```
F12 → Ctrl+Shift+M (ou Cmd+Shift+M sur Mac)
```

### Résolutions à Tester
- **Mobile**: 375x812px (iPhone)
- **Tablet**: 768x1024px (iPad)
- **Desktop**: 1920x1080px
- **Large**: 2560x1440px

## 💡 Bonnes Pratiques

1. **Mobile-First**: Commencez par le mobile, puis ajoutez des breakpoints
2. **Flex et Grid**: Préférez flexbox et grid à float et position
3. **Max-Width**: Limitez toujours les conteneurs à `max-w-7xl`
4. **Images**: Utilisez `max-w-full h-auto` pour responsivité
5. **Touch Targets**: Buttons/links min 44x44px sur mobile
6. **Scroll Horizontal**: Évitez-le, adaptez plutôt le layout
7. **Performance**: Testez les pages sur données 3G

## 🔗 Resources

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Mobile First Design](https://www.google.com/design/spec-mobile/)
- [WCAG 2.1 Mobile Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Version**: 1.0  
**Auteur**: KLB.suite Team
