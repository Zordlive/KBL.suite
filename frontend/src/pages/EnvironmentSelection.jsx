import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

const EnvironmentSelection = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.roles?.some((role) => role.name === 'administrator');

  const handleEnvironmentSelect = (environment) => {
    if (environment === 'stock') {
      navigate('/stock-management');
    } else if (environment === 'remise') {
      navigate('/remise-repris');
    } else if (environment === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-indigo-900 to-blue-900">
      {/* Header Navigation */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-indigo-600 to-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">KLB.suite</h1>
                <p className="text-xs text-gray-600">Système de gestion intégré</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.position}</p>
                </div>
              </div>
              
              <div className="border-l border-gray-200 pl-4 flex gap-2">
                {isAdmin && (
                  <Button 
                    onClick={() => handleEnvironmentSelect('admin')}
                    variant="outline"
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
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Bienvenue, {user?.name.split(' ')[0]}! 👋
            </h2>
            <p className="text-xl text-indigo-100 mb-2">
              Sélectionnez votre environnement de travail
            </p>
            <p className="text-sm text-indigo-300">
              Agent N°: <span className="font-semibold">{user?.agent_number}</span> | Poste: <span className="font-semibold">{user?.position}</span>
            </p>
          </div>

          {/* Environment Cards Grid */}
          <div className={`grid gap-6 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {/* Gestion Stock Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
              <div className="relative bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-linear-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    Actif
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Gestion Stock</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Gérez les stocks des unités mobiles, enregistrez les ventes, effectuez les inventaires quotidiens et consultez les rapports détaillés.
                </p>
                
                <Button
                  onClick={() => handleEnvironmentSelect('stock')}
                  className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  variant="primary"
                >
                  Accéder à la Gestion Stock
                </Button>
              </div>
            </div>

            {/* Remise et Repris Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-linear-to-r from-green-600 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
              <div className="relative bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-linear-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Actif
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Remise et Repris</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Gérez les opérations de remise et de repris des unités, consultez les historiques et générez les rapports financiers.
                </p>
                
                <Button
                  onClick={() => handleEnvironmentSelect('remise')}
                  className="w-full bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  variant="primary"
                >
                  Accéder aux Remises et Repris
                </Button>
              </div>
            </div>

            {/* Admin Panel Card - Visible only if admin */}
            {isAdmin && (
              <div className="group relative">
                <div className="absolute -inset-1 bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
                <div className="relative bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-linear-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                      Admin
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Administration</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    Gérez les agents, attribuez les rôles, corrigez les stocks et visualisez les statistiques globales.
                  </p>
                  
                  <Button
                    onClick={() => handleEnvironmentSelect('admin')}
                    className="w-full bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                    variant="primary"
                  >
                    Accéder au Panneau Admin
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <p className="text-indigo-200 text-sm">
              KLB.suite - Système de gestion intégré • Tous droits réservés © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentSelection;