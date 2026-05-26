# 🎨 Guide de Customization - StockManagement

## 🎯 Guide Complet de Personnalisation

Cette page est entièrement customisable. Voici comment modifier chaque élément.

---

## 1️⃣ Changer la Palette de Couleurs

### Localisaton: `networkColors` (Top of file)

**Avant:**
```javascript
const networkColors = {
  Orange: { 
    bg: 'from-orange-50 to-orange-100', 
    border: 'border-orange-200', 
    text: 'text-orange-700', 
    badge: 'bg-orange-100 text-orange-800',
    icon: '🟠'
  },
```

**Après (Exemple avec teintes différentes):**
```javascript
const networkColors = {
  Orange: { 
    bg: 'from-amber-50 to-amber-100',   // Teinte plus foncée
    border: 'border-amber-300',
    text: 'text-amber-800', 
    badge: 'bg-amber-100 text-amber-900',
    icon: '🟡'  // Icône différente
  },
```

### Couleurs Tailwind Disponibles:
```
slate, gray, zinc, neutral, stone,
red, orange, amber, yellow, lime, green, emerald, teal, cyan, blue,
indigo, violet, purple, fuchsia, pink, rose
```

### Exemple - Couleurs Personnalisées:
```javascript
const networkColors = {
  Reseau1: {
    bg: 'from-sky-50 to-sky-100',
    border: 'border-sky-300',
    text: 'text-sky-800',
    badge: 'bg-sky-200 text-sky-900',
    icon: '🔷'
  },
  Reseau2: {
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-300',
    text: 'text-purple-800',
    badge: 'bg-purple-200 text-purple-900',
    icon: '🔶'
  },
};
```

---

## 2️⃣ Modifier les Animations

### Location: `StockManagement.css`

#### Durée d'Animation Plus Rapide:
```css
/* Avant (500ms) */
.transition-smooth {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Après (200ms - Plus rapide) */
.transition-smooth {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### Durée d'Animation Plus Lente:
```css
/* Après (400ms - Plus lent) */
.transition-smooth {
  transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### Ajouter une Nouvelle Animation:
```css
@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-in-from-left {
  animation: slideInFromLeft 0.5s ease-out;
}
```

---

## 3️⃣ Modifier les Effets Hover

### Stock Cards Hover:

**Avant:**
```jsx
hover:scale-105 hover:shadow-xl hover:border-indigo-300
```

**Après (Effet plus prononcé):**
```jsx
hover:scale-110 hover:shadow-2xl hover:border-blue-400 transform transition-all
```

**Après (Effet plus subtil):**
```jsx
hover:scale-103 hover:shadow-lg hover:border-indigo-200 transition-all
```

### Code Exemple:
```jsx
<div 
  className="
    ...
    hover:scale-110        // Zoom 10%
    hover:shadow-2xl       // Shadow plus grande
    hover:-rotate-1        // Rotation légère
    hover:border-blue-500  // Bordure bleue
    transition-all duration-500  // Transition 500ms
  "
>
```

---

## 4️⃣ Modifier la Typographie

### Header Title:

**Avant:**
```jsx
<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
  Gestion des Stocks
</h1>
```

**Après (Plus grand):**
```jsx
<h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
  Gestion des Stocks
</h1>
```

### Section Headers:

**Avant:**
```jsx
<h2 className="text-xl sm:text-2xl font-bold text-gray-900">
  Stocks en Temps Réel
</h2>
```

**Après (Avec gradient):**
```jsx
<h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
  Stocks en Temps Réel
</h2>
```

---

## 5️⃣ Modifier le Spacing (Padding/Margin)

### Sections:

**Avant (Médium):**
```jsx
<div className="p-6 sm:p-8">
```

**Après (Large):**
```jsx
<div className="p-8 sm:p-12">
```

**Après (Compact):**
```jsx
<div className="p-4 sm:p-6">
```

### Cards:

**Avant:**
```jsx
<div className="p-6 sm:p-7">
```

**Après:**
```jsx
<div className="p-5 sm:p-6">  // Plus compact
```

---

## 6️⃣ Modifier les Icônes Emoji

### Change All Icons:

```javascript
// Avant
📊 Stocks en Temps Réel
📋 Historique des Ventes
📈 Analyse des Écarts
➕ Enregistrer Vente
✓ Succès
⚠️ Avertissement
✅ OK
🔴 Erreur

// Après (Alternative)
💹 Stocks en Temps Réel
📝 Historique des Ventes
📊 Analyse des Écarts
🆕 Enregistrer Vente
✔️ Succès
⚡ Avertissement
🟢 OK
❌ Erreur
```

---

## 7️⃣ Modifier les Breakpoints Responsive

### Standard (Défaut):
```jsx
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
```

### Breakpoints Personnalisés:
```jsx
// Plus de colonnes
grid-cols-1 sm:grid-cols-3 lg:grid-cols-4

// Moins de colonnes
grid-cols-1 md:grid-cols-2

// Différent pour mobile
flex-col sm:flex-row lg:flex-row-reverse
```

### Tailwind Breakpoints:
```
sm: 640px    (Small)
md: 768px    (Medium)
lg: 1024px   (Large)
xl: 1280px   (Extra Large)
2xl: 1536px  (2X Large)
```

---

## 8️⃣ Ajouter des Sections Supplémentaires

### Nouveau Widget:

```jsx
{/* New Summary Section */}
<section className="rounded-xl bg-white shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
  <div className="p-6 sm:p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
      <span className="text-2xl">📊</span> Résumé Journalier
    </h2>
    <p className="text-sm text-gray-600 mt-1">Synthèse des opérations du jour</p>
  </div>
  
  <div className="p-6 sm:p-8">
    {/* Your content here */}
  </div>
</section>
```

---

## 9️⃣ Modifier les Boutons

### Styles de Boutons Disponibles:

**Primary:**
```jsx
<Button variant="primary">Action Principale</Button>
// Gradient indigo → blue
```

**Secondary:**
```jsx
<Button variant="secondary">Action Secondaire</Button>
// Gris neutre
```

**Outline:**
```jsx
<Button variant="outline">Alternative</Button>
// Bordure grise
```

**Success:**
```jsx
<Button variant="success">Succès</Button>
// Vert
```

**Danger:**
```jsx
<Button variant="danger">Danger</Button>
// Rouge
```

### Sizes:

```jsx
<Button size="sm">Petit</Button>      // Mobile
<Button size="md">Moyen</Button>      // Défaut
<Button size="lg">Grand</Button>      // Desktop
```

### Avec Hover Personnalisé:

```jsx
<Button 
  className="
    bg-gradient-to-r from-indigo-600 to-blue-600
    hover:from-indigo-700 hover:to-blue-700
    shadow-lg hover:shadow-2xl
    hover:scale-105
    transition-all duration-300
    text-white font-semibold
  "
>
  Action Spéciale
</Button>
```

---

## 🔟 Modifier les Messages d'Alerte

### Success Message:

**Avant:**
```jsx
{successMessage && (
  <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 ...">
```

**Après (Bleu):**
```jsx
{successMessage && (
  <div className="rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 ...">
```

### Ajouter une Icône Personnalisée:

```jsx
{successMessage && (
  <div className="...">
    <div className="flex-shrink-0 text-emerald-600 text-2xl">🎉</div>
    {/* Content */}
  </div>
)}
```

---

## 1️⃣1️⃣ Modifier les Gradients

### Utiliser Gradient Personnalisé:

**Avant (Indigo → Blue):**
```jsx
bg-gradient-to-r from-indigo-600 to-blue-600
```

**Après (Purple → Pink):**
```jsx
bg-gradient-to-r from-purple-600 to-pink-600
```

**Après (Diagonal):**
```jsx
bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600
```

**Après (Vertical):**
```jsx
bg-gradient-to-b from-indigo-600 to-blue-600
```

---

## 1️⃣2️⃣ Exemples de Customization Complets

### Exemple 1: Dark Blue Theme

```javascript
// 1. Couleurs
const networkColors = {
  Orange: { 
    bg: 'from-blue-900 to-blue-800', 
    border: 'border-blue-700', 
    text: 'text-blue-100', 
    badge: 'bg-blue-800 text-blue-100',
    icon: '🔵'
  },
  // ...
};

// 2. Header Background
<header className="bg-gradient-to-r from-slate-900 to-slate-800 ...">

// 3. Main Background
<div className="bg-gradient-to-br from-slate-950 to-slate-900">
```

### Exemple 2: Bright & Energetic

```javascript
// 1. Couleurs vives
const networkColors = {
  Orange: { 
    bg: 'from-yellow-100 to-orange-100', 
    border: 'border-orange-400', 
    text: 'text-orange-900', 
    badge: 'bg-orange-200 text-orange-900',
    icon: '⭐'
  },
  // ...
};

// 2. Animations plus rapides
.transition-smooth {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

// 3. Hover effects plus prononcés
hover:scale-110 hover:shadow-2xl hover:border-yellow-400
```

### Exemple 3: Minimal & Clean

```javascript
// 1. Couleurs minimalistes
const networkColors = {
  Orange: { 
    bg: 'from-gray-100 to-white', 
    border: 'border-gray-300', 
    text: 'text-gray-800', 
    badge: 'bg-gray-200 text-gray-900',
    icon: '📊'
  },
  // ...
};

// 2. Moins d'animations
transition-all duration-150  // Plus court

// 3. Hover subtle
hover:scale-101 hover:shadow-md  // Subtle
```

---

## ✨ Checklist de Customization

- [ ] Couleurs de réseau modifiées
- [ ] Animations ajustées
- [ ] Icônes changées si nécessaire
- [ ] Breakpoints vérifiés
- [ ] Boutons stylisés
- [ ] Messages d'alerte adaptés
- [ ] Typographie vérifiée
- [ ] Spacing ajusté
- [ ] Gradients personnalisés
- [ ] Test sur mobile/desktop

---

## 🚀 Tips de Performance

Lors de la customization:

```javascript
// ✓ BON - Classes statiques
className="bg-gradient-to-r from-indigo-600 to-blue-600"

// ✗ MAUVAIS - Classes dynamiques (Tailwind ne les scan pas)
className={`from-${color}-600`}
```

```javascript
// ✓ BON - Variables CSS
const networkColors = { /* object */ }

// ✗ MAUVAIS - Styles inline excessifs
style={{ backgroundColor: '#4F46E5' }}
```

---

## 📞 Questions Fréquentes

### Q: Comment changer la couleur primaire?
**A:** Modifier `from-indigo-600 to-blue-600` en `from-purple-600 to-pink-600`

### Q: Comment ralentir les animations?
**A:** Augmenter `300ms` à `500ms` ou `800ms`

### Q: Comment rendre le design plus minimaliste?
**A:** Réduire les effets hover, simplifier les couleurs

### Q: Comment ajouter le dark mode?
**A:** Utiliser `dark:` prefix dans Tailwind CSS

### Q: Comment changer les tailles de texte?
**A:** Modifier les classes `text-lg`, `text-xl`, etc.

---

**Last Updated**: 25 mai 2026
**Ready for Production**: ✅ Yes
