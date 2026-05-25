import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import StockManagement from './StockManagement';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const roles = user?.roles?.map((role) => role.name) || [];
  const isAdmin = roles.includes('administrator');
  const isSuperAgent = roles.includes('super_agent');
  const isAgent = roles.includes('agent');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-linear-to-br from-indigo-600 to-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">KLB.suite</h1>
                <p className="text-sm text-gray-600 mt-1">Tableau de bord personnalisé</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-2 text-sm">
                <p className="font-semibold text-indigo-900">{user?.name}</p>
                <p className="text-xs text-indigo-700">{isAdmin ? '👑 Administrateur' : isSuperAgent ? '⭐ Super Agent' : '👤 Agent'}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {isAdmin && (
                  <Button 
                    onClick={() => window.location.assign('/admin')} 
                    variant="primary"
                    size="sm"
                  >
                    Admin
                  </Button>
                )}
                <Button 
                  onClick={logout} 
                  variant="outline"
                  size="sm"
                >
                  Quitter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Profile Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {/* Profile Card */}
          <div className="card-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Mon Profil</h2>
                <p className="text-xs text-gray-600 mt-0.5">{user?.position}</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Agent N°:</span>
                <span className="font-semibold text-gray-900">{user?.agent_number}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Statut:</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  {user?.status === 'active' ? '✓ Actif' : 'Inactif'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900 text-xs truncate">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Access Card */}
          <div className="card-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Permissions</h2>
                <p className="text-xs text-gray-600 mt-0.5">Vos accès autorisés</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  <span>Accès complet administrateur</span>
                </div>
              )}
              {isSuperAgent && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  <span>Accès Super Agent validé</span>
                </div>
              )}
              {isAgent && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span>Accès Agent standard</span>
                </div>
              )}
              <p className="text-xs text-gray-600 mt-3 pt-2 border-t border-gray-200">
                {isAdmin 
                  ? 'Vous avez accès complet à l\'administration, à la validation des agents et aux rapports globaux.' 
                  : isSuperAgent 
                  ? 'Vous pouvez gérer les stocks et les remises après validation.' 
                  : 'Vous avez accès aux opérations standard de gestion des stocks.'}
              </p>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="card-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Raccourcis</h2>
                <p className="text-xs text-gray-600 mt-0.5">Accès rapide</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-gray-700">Les modules de gestion sont accessibles depuis le menu principal:</p>
              <div className="space-y-1.5 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-indigo-600">▸</span>
                  <span>Gestion des stocks</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-blue-600">▸</span>
                  <span>Remise et reprise</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">▸</span>
                  <span>Rapports journaliers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Management Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          <div className="px-6 lg:px-8 py-6 border-b border-gray-200 bg-linear-to-r from-gray-50 to-indigo-50">
            <h2 className="text-2xl font-bold text-gray-900">Gestion des Stocks</h2>
            <p className="text-sm text-gray-600 mt-1">Accédez au module de gestion des stocks ci-dessous</p>
          </div>
          <div className="p-6 lg:p-8">
            <StockManagement />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;