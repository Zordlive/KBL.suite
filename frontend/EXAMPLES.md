# 🎨 Exemples de Code - Composants KLB.suite

## 🔘 Boutons

### Primaire (Indigo)
```jsx
<Button variant="primary">
  Action Principale
</Button>

// Rendu:
// - bg-indigo-600 hover:bg-indigo-700
// - text-white
// - shadow-md hover:shadow-lg
// - rounded-lg
// - h-11 (md size)
```

### Secondaire (Gris)
```jsx
<Button variant="secondary">
  Action Secondaire
</Button>

// Rendu:
// - bg-gray-200 hover:bg-gray-300
// - text-gray-900
```

### Outline (Bordure)
```jsx
<Button variant="outline">
  Action Alternative
</Button>

// Rendu:
// - border-2 border-gray-300
// - bg-white
// - hover:bg-gray-50
```

### Succès (Vert)
```jsx
<Button variant="success">
  Confirmer
</Button>

// Rendu:
// - bg-green-600 hover:bg-green-700
// - text-white
```

### Danger (Rouge)
```jsx
<Button variant="danger">
  Supprimer
</Button>

// Rendu:
// - bg-red-600 hover:bg-red-700
// - text-white
```

### Tailles
```jsx
<Button size="sm">Petit</Button>        // h-9
<Button size="md">Normal</Button>       // h-11 (défaut)
<Button size="lg">Grand</Button>        // h-12
```

## 📝 Formulaires

### Input Simple
```jsx
<Input 
  type="text"
  placeholder="Entrez votre nom"
  className="w-full"
/>

// Rendu:
// - h-11
// - border border-gray-300
// - focus:ring-2 focus:ring-indigo-500
// - rounded-lg
```

### Input avec Label
```jsx
<div className="space-y-2">
  <label className="text-sm font-medium text-gray-700">
    Email
  </label>
  <Input 
    type="email"
    placeholder="user@example.com"
    className="w-full"
  />
</div>
```

### Form Multi-Colonnes
```jsx
<form className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label>Prénom</label>
      <Input type="text" className="w-full" />
    </div>
    <div>
      <label>Nom</label>
      <Input type="text" className="w-full" />
    </div>
  </div>
  <div>
    <label>Email</label>
    <Input type="email" className="w-full" />
  </div>
  <Button variant="primary" className="w-full">
    Envoyer
  </Button>
</form>

// Rendu:
// - 1 colonne sur mobile
// - 2 colonnes sur desktop
// - Spacing cohérent
```

## 🃏 Cartes

### Card Standard
```jsx
<div className="card">
  <h3 className="font-semibold">Titre</h3>
  <p className="text-sm text-gray-600 mt-2">Contenu</p>
</div>

// Rendu:
// - bg-white
// - rounded-2xl
// - border border-gray-200
// - shadow-md hover:shadow-lg
```

### Card Grande
```jsx
<div className="card-lg">
  <h3 className="font-bold text-lg">Titre Important</h3>
  <p className="text-gray-600 mt-4">Contenu avec padding généré</p>
  <div className="mt-6 space-y-3">
    {/* Contenu */}
  </div>
</div>

// Rendu:
// - Même que card mais avec p-6 lg:p-8
```

### Card avec Gradient
```jsx
<div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
  <div className="bg-linear-to-r from-indigo-600 to-blue-600 rounded-lg p-4">
    <h3 className="text-white font-bold">Titre Spécial</h3>
  </div>
  <p className="text-gray-600 mt-4">Contenu de la carte</p>
</div>
```

## 📊 Grilles Responsives

### Grille 3 Colonnes
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  <div className="card-lg">Colonne 1</div>
  <div className="card-lg">Colonne 2</div>
  <div className="card-lg">Colonne 3</div>
</div>

// Rendu:
// - Mobile: 1 colonne full-width
// - Tablet: 2 colonnes (50% chacune)
// - Desktop: 3 colonnes (33% chacune)
// - Gap responsive: 16px (mobile) → 24px (desktop)
```

### Grille 2 Colonnes
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
  <div className="card-lg">Colonne 1</div>
  <div className="card-lg">Colonne 2</div>
</div>
```

## 📱 Headers

### Header Standard
```jsx
<header className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-linear-to-br from-indigo-600 to-blue-600 rounded-lg">
          {/* Icon */}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Titre</h1>
          <p className="text-sm text-gray-600 mt-1">Sous-titre</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">Action 1</Button>
        <Button variant="primary" size="sm">Action 2</Button>
      </div>
    </div>
  </div>
</header>

// Rendu:
// - Sticky au haut
// - Shadow sous header
// - Responsive flex layout
// - User info display
```

## 🏷️ Badges & Statuts

### Badge Vert (Actif)
```jsx
<div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse-soft"></span>
  Actif
</div>

// Rendu:
// - Fond vert clair
// - Texte vert foncé
// - Point animé vert
```

### Badge Gris (Inactif)
```jsx
<div className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
  Inactif
</div>
```

## 🎭 Sections Colorées

### Section Comptes Financiers (RemiseRepris)
```jsx
<div className="space-y-3">
  {/* Mpesa - Bleu */}
  <div className="card-lg border-l-4 border-l-blue-600 bg-blue-50">
    <h3 className="font-bold text-blue-900">Mpesa</h3>
    <p className="text-sm text-blue-700">Montant: 10,000 FC</p>
  </div>

  {/* OrangeMonnaie - Orange */}
  <div className="card-lg border-l-4 border-l-orange-500 bg-orange-50">
    <h3 className="font-bold text-orange-900">Orange Monnaie</h3>
    <p className="text-sm text-orange-700">Montant: 5,000 FC</p>
  </div>

  {/* AirtelMonnaie - Rouge */}
  <div className="card-lg border-l-4 border-l-red-600 bg-red-50">
    <h3 className="font-bold text-red-900">Airtel Monnaie</h3>
    <p className="text-sm text-red-700">Montant: 3,000 FC</p>
  </div>
</div>
```

## 🔄 Flex & Layout

### Flex Direction Responsif
```jsx
<div className="flex flex-col sm:flex-row gap-4">
  <div className="flex-1">Élément 1</div>
  <div className="flex-1">Élément 2</div>
</div>

// Rendu:
// - Mobile: Colonne (100% width chacun)
// - Desktop: Ligne (50% width chacun)
```

### Flex Center
```jsx
<div className="flex items-center justify-center min-h-screen">
  <div className="card-lg">Centré</div>
</div>

// Rendu:
// - Contenu centré verticalement et horizontalement
// - Min height 100vh
```

## 🎯 Conteneur Responsive

### Conteneur Standard
```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Contenu */}
</div>

// Rendu:
// - Max width 80rem (1280px)
// - Centré avec mx-auto
// - Padding responsive: 16px (mobile) → 32px (desktop)
```

## 📨 Message d'Erreur
```jsx
<div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-900">
  Une erreur est survenue. Veuillez réessayer.
</div>

// Rendu:
// - Fond rouge clair
// - Bordure rouge
// - Texte rouge foncé
```

## ✅ Message de Succès
```jsx
<div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-900">
  Opération réussie!
</div>

// Rendu:
// - Fond vert clair
// - Bordure vert
// - Texte vert foncé
```

## 📚 Exemple Complet - Page Simple

```jsx
import React from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Ma Page</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="card-lg">
            <h3 className="font-bold">Card 1</h3>
            <p className="text-sm text-gray-600 mt-2">Contenu</p>
          </div>
          <div className="card-lg">
            <h3 className="font-bold">Card 2</h3>
            <p className="text-sm text-gray-600 mt-2">Contenu</p>
          </div>
          <div className="card-lg">
            <h3 className="font-bold">Card 3</h3>
            <p className="text-sm text-gray-600 mt-2">Contenu</p>
          </div>
        </div>

        {/* Form */}
        <div className="card-lg">
          <h2 className="text-xl font-bold mb-6">Formulaire</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Prénom</label>
                <Input type="text" className="w-full mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nom</label>
                <Input type="text" className="w-full mt-1" />
              </div>
            </div>
            <Button variant="primary" className="w-full">
              Envoyer
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
```

---

**Notes**: Ces exemples suivent tous le système de design KLB.suite. Utilisez-les comme templates pour créer de nouvelles pages et composants.

**Dernière mise à jour**: Mai 2026
