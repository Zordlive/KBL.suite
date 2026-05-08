import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [stockEdits, setStockEdits] = useState({});
  const [roleEdits, setRoleEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingStock, setSavingStock] = useState(null);
  const [savingRole, setSavingRole] = useState(null);

  const isAdmin = user?.roles?.some((role) => role.name === 'administrator');

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, stocksRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/stock-module/stocks'),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setStocks(stocksRes.data.stocks || []);
      setStockEdits(
        (stocksRes.data.stocks || []).reduce(
          (acc, stock) => ({ ...acc, [stock.network]: stock.quantity }),
          {},
        ),
      );
      setRoleEdits(
        usersRes.data.reduce(
          (acc, userRecord) => ({ ...acc, [userRecord.id]: userRecord.roles[0]?.name || 'agent' }),
          {},
        ),
      );
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les données administrateur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStock = async (network) => {
    setSavingStock(network);
    setError('');

    try {
      const response = await api.put(`/stock-module/stocks/${network}`, {
        quantity: Number(stockEdits[network] ?? 0),
      });

      setStocks((prev) => prev.map((stock) => (stock.network === network ? response.data.stock : stock)));
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de mettre à jour le stock.');
    } finally {
      setSavingStock(null);
    }
  };

  const handleRoleChange = (userId, value) => {
    setRoleEdits((prev) => ({ ...prev, [userId]: value }));
  };

  const handleSaveRole = async (userId) => {
    setSavingRole(userId);
    setError('');

    try {
      const response = await api.put(`/admin/users/${userId}/role`, {
        role: roleEdits[userId],
      });

      setUsers((prev) => prev.map((item) => (item.id === userId ? response.data : item)));
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de modifier le rôle.');
    } finally {
      setSavingRole(null);
    }
  };

  const handleApprove = async (userId) => {
    setError('');

    try {
      const response = await api.post(`/users/${userId}/approve`);
      setUsers((prev) => prev.map((item) => (item.id === userId ? response.data : item)));
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible d’approuver l’utilisateur.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="max-w-2xl rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Accès réservé aux administrateurs</h1>
          <p className="mt-4 text-sm text-slate-600">Votre compte ne dispose pas des droits nécessaires pour accéder à cette page.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>Retour au tableau de bord</Button>
            <Button onClick={logout}>Déconnexion</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Panneau d’administration</h1>
              <p className="mt-1 text-sm text-slate-500">Gestion des stocks, des agents et des statistiques de l’application.</p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700">
                {user?.name} • Administrateur
              </div>
              <Button variant="secondary" onClick={logout}>Déconnexion</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="rounded-3xl bg-red-50 border border-red-200 p-4 text-sm text-red-900 shadow-sm mb-6">
            {error}
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-4 mb-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Total utilisateurs</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{stats?.user_stats?.total_users ?? '-'}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Agents actifs</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{stats?.user_stats?.agents ?? '-'}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Super Agents</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{stats?.user_stats?.super_agents ?? '-'}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Demandes en attente</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{stats?.user_stats?.pending_super_agents ?? '-'}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3 mb-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Stocks actuels</h2>
            <p className="mt-2 text-sm text-slate-600">Ajustez les quantités en cas d’erreur d’enregistrement.</p>
            <div className="mt-6 space-y-4">
              {stocks.map((stock) => (
                <div key={stock.network} className="grid grid-cols-1 gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-medium text-slate-900">{stock.network}</p>
                    <p className="text-sm text-slate-600">Quantité actuelle : {stock.quantity}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Input
                      type="number"
                      min="0"
                      value={stockEdits[stock.network] ?? 0}
                      onChange={(event) => setStockEdits((prev) => ({ ...prev, [stock.network]: Number(event.target.value) }))}
                    />
                    <Button
                      onClick={() => handleUpdateStock(stock.network)}
                      disabled={savingStock === stock.network}
                      size="sm"
                    >
                      {savingStock === stock.network ? 'Mise à jour...' : 'Mettre à jour'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Ventes du jour</h2>
            <p className="mt-2 text-sm text-slate-600">Synthèse des ventes et des écarts.</p>
            <div className="mt-6 space-y-4 text-slate-700">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm">Ventes</p>
                <p className="mt-2 text-2xl font-semibold">{stats?.sales_stats?.today_sales ?? '-'}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm">Unités vendues</p>
                <p className="mt-2 text-2xl font-semibold">{stats?.sales_stats?.today_quantity ?? '-'}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm">Écarts aujourd’hui</p>
                <p className="mt-2 text-2xl font-semibold">{stats?.inventory_stats?.today_discrepancies ?? '-'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Rôles et droits</h2>
            <p className="mt-2 text-sm text-slate-600">Attribuez des rôles et approuvez les super agents en attente.</p>
            <div className="mt-6 space-y-4">
              {stats && (
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p>Administrateurs : {stats.user_stats.administrators}</p>
                  <p>Agents : {stats.user_stats.agents}</p>
                  <p>Super Agents actifs : {stats.user_stats.super_agents}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Gestion des utilisateurs</h2>
              <p className="mt-2 text-sm text-slate-600">Modifiez les rôles et approuvez les super agents.</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Nom</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Rôle</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Statut</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users.map((userRecord) => (
                  <tr key={userRecord.id}>
                    <td className="px-4 py-4 text-slate-700">{userRecord.name}</td>
                    <td className="px-4 py-4 text-slate-700">{userRecord.email}</td>
                    <td className="px-4 py-4 text-slate-700">
                      <select
                        value={roleEdits[userRecord.id] ?? userRecord.roles[0]?.name ?? 'agent'}
                        onChange={(event) => handleRoleChange(userRecord.id, event.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="agent">Agent</option>
                        <option value="super_agent">Super Agent</option>
                        <option value="administrator">Administrateur</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{userRecord.status}</td>
                    <td className="px-4 py-4 text-slate-700 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveRole(userRecord.id)}
                          disabled={savingRole === userRecord.id}
                        >
                          {savingRole === userRecord.id ? 'Enregistrement...' : 'Sauvegarder'}
                        </Button>
                        {userRecord.status === 'pending' && userRecord.roles.some((role) => role.name === 'super_agent') ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleApprove(userRecord.id)}
                          >
                            Approuver
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Statistiques réseau</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {stats?.sales_stats?.network_sales && Object.entries(stats.sales_stats.network_sales).map(([network, quantity]) => (
              <div key={network} className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{network}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{quantity}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminPanel;
