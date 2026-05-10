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
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex flex-col p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">KLB.suite</h1>
          <p className="text-sm text-slate-500">Choisis ton environnement de travail.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white px-4 py-2 text-sm text-slate-700">{user?.name}</span>
          {isAdmin && (
            <Button variant="primary" onClick={() => handleEnvironmentSelect('admin')}>
              Panneau admin
            </Button>
          )}
          <Button variant="secondary" onClick={logout}>Déconnexion</Button>
        </div>
      </div>

      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue sur KLB.suite
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Bonjour {user?.name}, choisissez votre environnement de travail
          </p>
          <p className="text-sm text-gray-500">
            Agent N°: {user?.agent_number} | Poste: {user?.position}
          </p>
        </div>

        {/* Environment Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Gestion Stock Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Gestion Stock
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Gérez les stocks des unités mobiles, enregistrez les ventes,
                effectuez les inventaires quotidiens et consultez les rapports détaillés.
              </p>
              <Button
                onClick={() => handleEnvironmentSelect('stock')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Accéder à la Gestion Stock
              </Button>
            </div>
          </div>

          {/* Remise et Repris Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Remise et Repris
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Gérez les opérations de remise et de repris des unités,
                consultez les historiques et générez les rapports financiers.
              </p>
              <Button
                onClick={() => handleEnvironmentSelect('remise')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Accéder aux Remises et Repris
              </Button>
            </div>
          </div>
          {isAdmin && (
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c.27 0 .52.11.71.29l3.5 3.5a1 1 0 010 1.42l-3.5 3.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 010-1.42l3.5-3.5A1 1 0 0112 8zm0-5c-1.1 0-2 .9-2 2v1.5a1 1 0 002 0V5c0-.55.45-1 1-1s1 .45 1 1v1.5a1 1 0 002 0V5c0-1.1-.9-2-2-2zm0 14c1.1 0 2-.9 2-2v-1.5a1 1 0 00-2 0V15c0 .55-.45 1-1 1s-1-.45-1-1v-1.5a1 1 0 00-2 0V15c0 1.1.9 2 2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Administration
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Gérez les agents, attribuez les rôles, corrigez les stocks et visualisez les statistiques globales.
                </p>
                <Button
                  onClick={() => handleEnvironmentSelect('admin')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Accéder au Panneau Admin
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            KLB.suite - Système de gestion intégré
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default EnvironmentSelection;