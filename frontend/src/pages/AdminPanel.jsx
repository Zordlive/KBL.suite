import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import NavBar from '../components/layout/NavBar';
import OperationDetailModal from '../components/admin/OperationDetailModal';
import ModificationBadge from '../components/admin/ModificationBadge';
import logoKLB from '../img/logoKLB.png';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Stats and basic data
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [stockEdits, setStockEdits] = useState({});
  const [roleEdits, setRoleEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingStock, setSavingStock] = useState(null);
  const [savingRole, setSavingRole] = useState(null);
  const [exchangeRate, setExchangeRate] = useState('');
  const [savingExchangeRate, setSavingExchangeRate] = useState(false);

  // Archives and operations
  const [operations, setOperations] = useState([]);
  const [archivesLoading, setArchivesLoading] = useState(false);
  const [archivesTab, setArchivesTab] = useState('sales');
  const [archiveFilters, setArchiveFilters] = useState({
    search: '',
    network: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // Operation detail modal
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModifying, setIsModifying] = useState(false);

  // Account activation
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [approvingUser, setApprovingUser] = useState(null);

  // Account management
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'agent' });
  const [deletingUser, setDeletingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAdmin = user?.roles?.some((role) => role.name === 'administrator');

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, stocksRes, exchangeRes, pendingRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/stock-module/stocks'),
        api.get('/exchange-rate'),
        api.get('/users/pending-super-agents').catch(() => ({ data: [] })),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setStocks(stocksRes.data.stocks || []);
      setExchangeRate(exchangeRes.data.rate.toString());
      setPendingAccounts(pendingRes.data || []);
      
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
      await loadOperations();
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les données administrateur.');
    } finally {
      setLoading(false);
    }
  };

  const loadOperations = async () => {
    try {
      setArchivesLoading(true);
      let response;
      
      if (archivesTab === 'sales') {
        response = await api.get('/stock-module/sales', {
          params: {
            search: archiveFilters.search,
            network: archiveFilters.network,
            date_from: archiveFilters.dateFrom,
            date_to: archiveFilters.dateTo,
            per_page: 50
          }
        });
        setOperations(response.data.data || []);
      } else {
        response = await api.get('/stock-module/checks/today', {
          params: {
            search: archiveFilters.search,
            network: archiveFilters.network,
          }
        }).catch(() => ({ data: [] }));
        setOperations(response.data || []);
      }
      
      return response;
    } catch (err) {
      console.error('Error loading operations:', err);
      setOperations([]);
    } finally {
      setArchivesLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (loading) return;
    loadOperations();
  }, [archivesTab, archiveFilters]);

  // Stock management
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

  // Role management
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

  // Account approval
  const handleApproveAccount = async (userId) => {
    setApprovingUser(userId);
    setError('');

    try {
      await api.post(`/users/${userId}/approve`);
      setPendingAccounts((prev) => prev.filter((acc) => acc.id !== userId));
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: 'active' } : u));
      setStats((prev) => ({
        ...prev,
        user_stats: {
          ...prev.user_stats,
          pending_super_agents: (prev.user_stats.pending_super_agents || 1) - 1
        }
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible d\'approuver le compte.');
    } finally {
      setApprovingUser(null);
    }
  };

  // Change user status (active/suspended)
  const handleChangeUserStatus = async (userId, newStatus) => {
    setError('');
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de modifier le statut.');
    }
  };

  // Open edit user modal
  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.roles[0]?.name || 'agent'
    });
    setShowEditModal(true);
  };

  // Save user modifications
  const handleSaveEditUser = async () => {
    setError('');
    try {
      const response = await api.put(`/admin/users/${editingUser.id}`, {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role
      });
      setUsers((prev) => prev.map((u) => u.id === editingUser.id ? response.data : u));
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de modifier l\'utilisateur.');
    }
  };

  // Open delete confirmation
  const handleOpenDeleteConfirm = (user) => {
    setDeletingUser(user);
    setShowDeleteConfirm(true);
  };

  // Delete user
  const handleDeleteUser = async () => {
    setError('');
    try {
      await api.delete(`/admin/users/${deletingUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setShowDeleteConfirm(false);
      setDeletingUser(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de supprimer l\'utilisateur.');
    }
  };

  // Exchange rate
  const handleSaveExchangeRate = async () => {
    setSavingExchangeRate(true);
    setError('');

    try {
      await api.put('/exchange-rate', {
        rate: Number(exchangeRate),
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de mettre à jour le taux de change.');
    } finally {
      setSavingExchangeRate(false);
    }
  };

  // Operation detail modal
  const handleOpenOperation = (operation) => {
    setSelectedOperation(operation);
    setIsModalOpen(true);
  };

  const handleModifyOperation = async (operationId, editedData, operationType) => {
    setIsModifying(true);
    setError('');

    try {
      let response;
      if (operationType === 'sale') {
        response = await api.put(`/stock-module/sales/${operationId}`, editedData);
      } else {
        response = await api.put(`/stock-module/checks/${operationId}`, editedData);
      }

      // Update the selected operation
      setSelectedOperation(response.data);
      
      // Update operations list
      setOperations((prev) =>
        prev.map((op) => (op.id === operationId ? response.data : op))
      );

      // Close modal
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de modifier l\'opération.');
    } finally {
      setIsModifying(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-2xl rounded-2xl bg-white p-10 shadow-sm border border-gray-200 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Accès réservé aux administrateurs</h1>
          <p className="mt-4 text-sm text-gray-600">Votre compte ne dispose pas des droits nécessaires pour accéder à cette page.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/environment')}>Retour à l'accueil</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-indigo-500 to-blue-500 rounded-full mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
          <p className="text-gray-300 text-lg font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <NavBar />
      
      <div className="relative z-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header Section */}
          <div className="mb-10 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-blue-400 to-cyan-400 mb-2">
                  👑 Tableau de Bord Administrateur
                </h1>
                <p className="text-gray-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                  {user?.name || 'Administrateur'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-600">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Système actif</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 animate-in fade-in slide-in-from-top">
              <div className="relative rounded-xl bg-linear-to-r from-red-500/20 to-red-600/20 border border-red-500/50 p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/></svg>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-300">Erreur</h3>
                    <p className="text-red-200 text-sm mt-1">{error}</p>
                  </div>
                  <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">✕</button>
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics Section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Utilisateurs', value: stats?.user_stats?.total_users ?? '-', icon: '👥', color: 'from-blue-500 to-blue-600' },
              { label: 'Agents Actifs', value: stats?.user_stats?.agents ?? '-', icon: '⚡', color: 'from-green-500 to-green-600' },
              { label: 'Super Agents', value: stats?.user_stats?.super_agents ?? '-', icon: '⭐', color: 'from-purple-500 to-purple-600' },
              { label: 'En Attente', value: stats?.user_stats?.pending_super_agents ?? '-', icon: '⏳', color: 'from-orange-500 to-orange-600' },
            ].map((metric, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-xl bg-linear-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-slate-500 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1">
                <div className="absolute inset-0 bg-linear-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/10 group-hover:to-blue-500/10 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{metric.icon}</span>
                    <div className={`text-2xl font-bold bg-linear-to-r ${metric.color} bg-clip-text text-transparent`}>{metric.value}</div>
                  </div>
                  <p className="text-gray-400 text-sm font-medium">{metric.label}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Priority Section: Account Activation */}
          <section className="mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-green-600 via-emerald-600 to-teal-600 border border-green-500/30 shadow-2xl shadow-green-500/20 hover:shadow-green-500/30 transition-all duration-300">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative p-8 sm:p-10">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 mb-2">
                      <span className="text-3xl">✓</span> Activation des Comptes
                    </h2>
                    <p className="text-green-100 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 12a6 6 0 11-12 0 6 6 0 0112 0z"/></svg>
                      {pendingAccounts.length} demande(s) en attente
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                    <span className="text-white font-semibold text-sm">Priorité Haute</span>
                  </div>
                </div>

                {pendingAccounts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-3">🎉</div>
                    <p className="text-green-50 font-semibold mb-2">Aucune demande en attente</p>
                    <p className="text-green-100 text-sm">Tous les comptes sont approuvés</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingAccounts.map((account) => (
                      <div key={account.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 border border-white/10 hover:border-white/20">
                        <div className="flex-1">
                          <p className="font-semibold text-white text-lg">{account.name}</p>
                          <p className="text-green-100 text-sm">{account.email}</p>
                          <p className="text-green-50 text-xs mt-1 font-medium">⭐ Demande Super Agent</p>
                        </div>
                        <Button
                          onClick={() => handleApproveAccount(account.id)}
                          disabled={approvingUser === account.id}
                          className="w-full sm:w-auto bg-white text-green-600 hover:bg-green-50 font-semibold transition-all duration-300 hover:scale-105 active:scale-95 py-2 px-6 rounded-lg"
                        >
                          {approvingUser === account.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              Approbation...
                            </span>
                          ) : (
                            '✓ Approuver'
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Archives Section */}
          <section className="mb-8">
            <div className="rounded-2xl bg-linear-to-br from-slate-700 to-slate-800 border border-slate-600 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="bg-linear-to-r from-indigo-600 to-blue-600 p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                  <span>📚</span> Archives des Opérations
                </h2>
                <p className="text-indigo-100 mt-2">Consultez, filtrez et modifiez tous les enregistrements</p>
              </div>

              <div className="p-6 sm:p-8">
                {/* Tabs */}
                <div className="flex gap-2 sm:gap-4 mb-6 border-b border-slate-600 pb-4">
                  {[
                    { id: 'sales', icon: '📋', label: 'Ventes' },
                    { id: 'inventory', icon: '📦', label: 'Inventaires' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setArchivesTab(tab.id)}
                      className={`relative px-4 py-2 font-semibold transition-all duration-300 ${
                        archivesTab === tab.id
                          ? 'text-indigo-400'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">{tab.icon} {tab.label} ({operations.length})</span>
                      {archivesTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 to-blue-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Rechercher</label>
                    <input
                      type="text"
                      placeholder="Nom, numéro, agent..."
                      value={archiveFilters.search}
                      onChange={(e) => setArchiveFilters({ ...archiveFilters, search: e.target.value })}
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Réseau</label>
                    <select
                      value={archiveFilters.network}
                      onChange={(e) => setArchiveFilters({ ...archiveFilters, network: e.target.value })}
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                    >
                      <option value="">Tous les réseaux</option>
                      <option value="Orange">Orange</option>
                      <option value="Airtel">Airtel</option>
                      <option value="Vodacom">Vodacom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Du</label>
                    <input
                      type="date"
                      value={archiveFilters.dateFrom}
                      onChange={(e) => setArchiveFilters({ ...archiveFilters, dateFrom: e.target.value })}
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Au</label>
                    <input
                      type="date"
                      value={archiveFilters.dateTo}
                      onChange={(e) => setArchiveFilters({ ...archiveFilters, dateTo: e.target.value })}
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Table */}
                {archivesLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg className="w-10 h-10 text-indigo-400 animate-spin mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="text-gray-400">Chargement des opérations...</p>
                  </div>
                ) : operations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="text-gray-400 font-medium">Aucune opération trouvée</p>
                  </div>
                ) : (
                  <div className="responsive-table-wrapper">
                    <table className="responsive-table">
                      <thead>
                        <tr className="bg-slate-600/50 border-b border-slate-500">
                          <th>Date</th>
                          <th>Réseau</th>
                          {archivesTab === 'sales' ? (
                            <>
                              <th>Client</th>
                              <th>Quantité</th>
                              <th>Type</th>
                            </>
                          ) : (
                            <>
                              <th>Vérification</th>
                              <th>Quantité</th>
                              <th>Différence</th>
                            </>
                          )}
                          <th>Agent</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {operations.map((op) => (
                          <tr key={op.id} className="hover:bg-slate-600/30 transition-colors duration-200 group cursor-pointer">
                            <td className="text-gray-300">{new Date(archivesTab === 'sales' ? op.sale_date : op.checked_at).toLocaleDateString('fr-FR')}</td>
                            <td><span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-linear-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium text-xs">{op.network}</span></td>
                            {archivesTab === 'sales' ? (
                              <>
                                <td className="text-gray-300 font-medium">{op.client_name}</td>
                                <td className="text-indigo-400 font-semibold">{op.quantity}</td>
                                <td><span className="px-1.5 sm:px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">{op.purchase_type}</span></td>
                              </>
                            ) : (
                              <>
                                <td className="text-gray-300">{op.check_type === 'opening' ? '🔍 Ouverture' : '📦 Soir'}</td>
                                <td className="text-indigo-400 font-semibold">{op.counted_quantity}</td>
                                <td className="font-bold" style={{ color: op.difference === 0 ? '#4ade80' : op.difference > 0 ? '#f87171' : '#60a5fa' }}>
                                  {op.difference === 0 ? '✓ 0' : op.difference > 0 ? `+${op.difference}` : op.difference}
                                </td>
                              </>
                            )}
                            <td className="text-gray-400">{op.user?.name || 'N/A'}</td>
                            <td>
                              <div className="flex items-center gap-1">
                                {op.modified_at && <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>}
                                <span className={op.modified_at ? 'text-red-400 font-medium text-xs sm:text-sm' : 'text-green-400 font-medium text-xs sm:text-sm'}>{op.modified_at ? 'Modifié' : 'Normal'}</span>
                              </div>
                            </td>
                            <td className="text-center">
                              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleOpenOperation(op); }} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                Détails
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Configuration Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Stocks Management */}
            <div className="rounded-2xl bg-linear-to-br from-slate-700 to-slate-800 border border-slate-600 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="bg-linear-to-r from-cyan-600 to-blue-600 p-6 sm:p-8">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <span>📊</span> Stocks Actuels
                </h2>
                <p className="text-cyan-100 mt-2 text-sm">Ajustez les quantités de chaque réseau</p>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                {stocks.map((stock) => (
                  <div key={stock.network} className="group flex flex-col sm:flex-row sm:items-end gap-3 bg-slate-600/30 hover:bg-slate-600/50 rounded-xl p-4 border border-slate-600 transition-all duration-300 hover:border-cyan-500/50">
                    <div className="flex-1">
                      <p className="font-semibold text-white text-lg">{stock.network}</p>
                      <p className="text-gray-400 text-sm">Quantité actuelle: <span className="text-cyan-400 font-bold">{stock.quantity}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        value={stockEdits[stock.network] ?? 0}
                        onChange={(event) => setStockEdits((prev) => ({ ...prev, [stock.network]: Number(event.target.value) }))}
                        className="w-20 bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                      <Button
                        onClick={() => handleUpdateStock(stock.network)}
                        disabled={savingStock === stock.network}
                        size="sm"
                        className="bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold transition-all duration-300"
                      >
                        {savingStock === stock.network ? '⏳' : '✓'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="rounded-2xl bg-linear-to-br from-slate-700 to-slate-800 border border-slate-600 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="bg-linear-to-r from-purple-600 to-pink-600 p-6 sm:p-8">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <span>💱</span> Taux de Change
                </h2>
                <p className="text-purple-100 mt-2 text-sm">USD → FC</p>
              </div>

              <div className="p-6 sm:p-8">
                <div className="bg-slate-600/30 hover:bg-slate-600/50 rounded-xl p-6 border border-slate-600 transition-all duration-300">
                  <p className="text-gray-400 text-sm mb-4 uppercase tracking-wider font-semibold">Taux actuel</p>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <div className="text-3xl font-black bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                        {exchangeRate || '-'}
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(e.target.value)}
                        placeholder="Entrez le nouveau taux"
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                    </div>
                    <Button 
                      onClick={handleSaveExchangeRate} 
                      disabled={savingExchangeRate}
                      className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all duration-300 h-10 px-6"
                    >
                      {savingExchangeRate ? '⏳' : '✓'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Users Management */}
          <section className="mb-8">
            <div className="rounded-2xl bg-linear-to-br from-slate-700 to-slate-800 border border-slate-600 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="bg-linear-to-r from-rose-600 to-pink-600 p-6 sm:p-8">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <span>👥</span> Gestion des Utilisateurs
                </h2>
                <p className="text-rose-100 mt-2 text-sm">Modifiez les rôles, activez/désactivez et supprimez les comptes</p>
              </div>

              <div className="p-6 sm:p-8">
                <div className="responsive-table-wrapper">
                  <table className="responsive-table">
                    <thead>
                      <tr className="bg-slate-600/50 border-b border-slate-500">
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {users.map((userRecord) => (
                        <tr key={userRecord.id} className="hover:bg-slate-600/30 transition-colors duration-200 group">
                          <td className="font-medium text-white">{userRecord.name}</td>
                          <td className="text-gray-400">{userRecord.email}</td>
                          <td>
                            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                              userRecord.roles[0]?.name === 'administrator'
                                ? 'bg-purple-500/20 text-purple-300'
                                : userRecord.roles[0]?.name === 'super_agent'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {userRecord.roles[0]?.name === 'administrator' ? '👑 Admin' : userRecord.roles[0]?.name === 'super_agent' ? '⭐ Super Agent' : '👤 Agent'}
                            </span>
                          </td>
                          <td>
                            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                              userRecord.status === 'active' 
                                ? 'bg-green-500/20 text-green-300' 
                                : userRecord.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              {userRecord.status === 'active' ? '✓ Actif' : userRecord.status === 'pending' ? '⏳ En attente' : '❌ Suspendu'}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-wrap">
                              {/* Change Role Button */}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleOpenEditUser(userRecord)}
                                className="bg-indigo-500/20 border-indigo-400 text-indigo-300 hover:bg-indigo-500/30 transition-all duration-300 text-xs sm:text-sm"
                                title="Modifier l'utilisateur"
                              >
                                ✎ Modifier
                              </Button>

                              {/* Toggle Status Button */}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleChangeUserStatus(userRecord.id, userRecord.status === 'active' ? 'suspended' : 'active')}
                                className={userRecord.status === 'active' 
                                  ? 'bg-orange-500/20 border-orange-400 text-orange-300 hover:bg-orange-500/30'
                                  : 'bg-green-500/20 border-green-400 text-green-300 hover:bg-green-500/30'
                                }
                                title={userRecord.status === 'active' ? 'Suspendre' : 'Activer'}
                              >
                                {userRecord.status === 'active' ? '🚫 Suspendre' : '✓ Activer'}
                              </Button>

                              {/* Delete Button */}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleOpenDeleteConfirm(userRecord)}
                                className="bg-red-500/20 border-red-400 text-red-300 hover:bg-red-500/30 transition-all duration-300"
                                title="Supprimer l'utilisateur"
                              >
                                🗑 Supprimer
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Daily Summary */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-linear-to-br from-slate-700 to-slate-800 border border-slate-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-4">Ventes Aujourd'hui</h3>
              <p className="text-4xl font-black bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{stats?.sales_stats?.today_sales ?? '-'}</p>
              <p className="text-gray-500 text-sm mt-2">{stats?.sales_stats?.today_quantity ?? '-'} unités</p>
            </div>
            <div className="rounded-2xl bg-linear-to-br from-slate-700 to-slate-800 border border-slate-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-4">Écarts Détectés</h3>
              <p className="text-4xl font-black bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">{stats?.inventory_stats?.today_discrepancies ?? '-'}</p>
              <p className="text-gray-500 text-sm mt-2">À resolver aujourd'hui</p>
            </div>
            <div className="rounded-2xl bg-linear-to-br from-slate-700 to-slate-800 border border-slate-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-4">Statut Système</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold">En ligne</span>
              </div>
              <p className="text-gray-500 text-sm">Tous les services actifs</p>
            </div>
          </section>
        </main>
      </div>

      {/* Operation Detail Modal */}
      <OperationDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        operation={selectedOperation}
        operationType={archivesTab === 'sales' ? 'sale' : 'inventory'}
        onModify={handleModifyOperation}
        saving={isModifying}
      />

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-linear-to-r from-indigo-600 to-blue-600 p-6 flex items-center justify-between">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span>✎</span> Modifier l'Utilisateur
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-white/60 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Nom</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Rôle</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                >
                  <option value="agent">👤 Agent</option>
                  <option value="super_agent">⭐ Super Agent</option>
                  <option value="administrator">👑 Administrateur</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveEditUser}
                  className="flex-1 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold transition-all duration-300"
                >
                  ✓ Enregistrer
                </Button>
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                  className="flex-1 border-slate-500 text-gray-300 hover:bg-slate-700"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-red-500/50 shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-linear-to-r from-red-600 to-red-700 p-6 flex items-center justify-between">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span>⚠️</span> Supprimer l'Utilisateur
              </h3>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-white/60 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-200 text-sm">
                  Êtes-vous certain de vouloir supprimer le compte de <span className="font-bold">{deletingUser.name}</span>?
                </p>
                <p className="text-red-300 text-xs mt-2">Cette action est irréversible.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleDeleteUser}
                  className="flex-1 bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold transition-all duration-300"
                >
                  🗑 Supprimer
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="flex-1 border-slate-500 text-gray-300 hover:bg-slate-700"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
