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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">KLB.suite</h1>
              <p className="mt-1 text-sm text-slate-500">Tableau de bord professionnel pour la gestion des agents et des opérations.</p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700">
                {user?.name} • {isAdmin ? 'Administrateur' : isSuperAgent ? 'Super Agent' : 'Agent'}
              </div>
              {isAdmin && (
                <Button onClick={() => window.location.assign('/admin')} variant="primary">
                  Panneau admin
                </Button>
              )}
              <Button onClick={logout} variant="secondary">
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Mon profil</h2>
            <p className="mt-3 text-sm text-slate-600">{user?.position}</p>
            <dl className="mt-6 grid gap-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <dt>Agent</dt>
                <dd>{user?.agent_number}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Statut</dt>
                <dd>{user?.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Email</dt>
                <dd>{user?.email}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Accès</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {isAdmin && <p>Accès complet au panneau d'administration et validation des Super Agents.</p>}
              {isSuperAgent && <p>Accès Super Agent. Les opérations sont disponibles après validation du compte.</p>}
              {isAgent && <p>Accès Agent. Lecture et ajout autorisés, modification et suppression restreints.</p>}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Actions rapides</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Gestion des stocks, ventes journalières et inventaires sont accessibles depuis le menu principal.</p>
              {isAdmin ? <p>Administration globale et validation des Super Agents.</p> : <p>Vos actions sont limitées selon votre rôle.</p>}
            </div>
          </div>
        </section>
      </main>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <StockManagement />
      </div>
    </div>
  );
};

export default Dashboard;