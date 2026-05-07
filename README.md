# KLB.suite - Architecture Overview

## Description
KLB.suite est un logiciel SaaS moderne pour la gestion de stocks et ventes pour KiLuBak, développé avec une architecture moderne et scalable.

## Stack Technique
- **Backend**: Laravel 11 API REST
- **Frontend**: React + Vite
- **Base de données**: MySQL
- **Authentification**: Laravel Sanctum
- **UI**: TailwindCSS
- **Icônes**: Lucide React

## Fonctionnalités
- Authentification multi-utilisateurs
- Gestion des rôles et permissions (Spatie Laravel Permission)
- Gestion des stocks
- Ventes journalières
- Inventaire intelligent
- Historique des opérations
- Traçabilité des agents

## Structure Backend

### Modèles
- `User` (avec HasRoles, HasApiTokens)
- `Product`
- `Stock`
- `Sale`
- `SaleItem`
- `Inventory`
- `InventoryItem`

### Contrôleurs API (app/Http/Controllers/Api/V1/)
- `AuthController`
- `ProductController`
- `StockController`
- `SaleController`
- `InventoryController`

### Routes API
- `/api/login`
- `/api/register`
- `/api/logout`
- `/api/products`
- `/api/stocks`
- `/api/sales`
- `/api/inventories`

## Structure Frontend

### Composants UI (src/components/ui/)
- `Button.jsx`
- `Input.jsx`
- `Modal.jsx`

### Pages (src/pages/)
- `Login.jsx`
- `Dashboard.jsx`

### Hooks (src/hooks/)
- `useAuth.js`

### Services (src/services/)
- `api.js` (Axios configuration)

## Conventions de Nommage
- **Backend**: snake_case pour DB, PascalCase pour classes PHP
- **Frontend**: camelCase pour variables/fonctions, PascalCase pour composants
- **Routes API**: kebab-case, versionnée (v1)

## Design System
- Palette minimaliste: gris, bleu, blanc
- Composants réutilisables
- Responsive design
- Modals modernes
- Tables dynamiques

## Installation

### Backend
```bash
cd backend
composer install
php artisan migrate
php artisan serve
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Sécurité
- Authentification via Sanctum
- Middleware pour protection des routes
- Validation des données
- Gestion des rôles et permissions

Cette architecture est conçue pour être scalable, maintenable et prête pour la production.