import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const accounts = [
  'Mpesa',
  'OrangeMonnaie',
  'AirtelMonnaie',
  'S.C (SuperCompte)',
  'CashExpress',
  'Portefeuille'
];

const RemiseRepris = () => {
  const { user, logout } = useAuth();
  const [balances, setBalances] = useState(
    accounts.reduce((acc, account) => {
      acc[account] = { fc: '', usd: '' };
      return acc;
    }, {})
  );
  const [savedBalances, setSavedBalances] = useState(
    accounts.reduce((acc, account) => {
      acc[account] = { fc: '0', usd: '0' }; // Default to 0, can be loaded from API later
      return acc;
    }, {})
  );
  const [loading, setLoading] = useState(false);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loadingExchangeRate, setLoadingExchangeRate] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [timeSlot, setTimeSlot] = useState('');
  const [modalStep, setModalStep] = useState('timeSelection');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [actionModalType, setActionModalType] = useState(null);
  const defaultMovementData = {
    amount: '',
    account: accounts[0],
    status: 'Encaissé',
    client: '',
    justification: '',
    scheduledAt: '',
    currency: 'FC',
  };
  const [actionData, setActionData] = useState(defaultMovementData);
  const [dailyMovements, setDailyMovements] = useState([]);
  const [archives, setArchives] = useState([]);
  const [recordedBalances, setRecordedBalances] = useState({
    Matin: accounts.reduce((acc, account) => {
      acc[account] = { fc: '0', usd: '0' };
      return acc;
    }, {}),
    Midi: accounts.reduce((acc, account) => {
      acc[account] = { fc: '0', usd: '0' };
      return acc;
    }, {}),
  });
  const [archiveSearchDate, setArchiveSearchDate] = useState('');
  const [showArchiveDetailsModal, setShowArchiveDetailsModal] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState(null);

  const formatFcAmount = (value) => {
    const number = Number(value) || 0;
    return number.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getSlotTotal = (slot) => {
    const slotBalances = recordedBalances[slot] || {};
    return accounts.reduce((total, account) => {
      const fc = parseFloat(slotBalances[account]?.fc) || 0;
      const usd = parseFloat(slotBalances[account]?.usd) || 0;
      return total + fc + usd * (exchangeRate || 0);
    }, 0);
  };

  const loadBalances = async () => {
    try {
      const response = await api.get('/account-balances');
      const data = response.data;
      const newSavedBalances = { ...savedBalances };
      accounts.forEach(account => {
        if (data[account]) {
          newSavedBalances[account] = {
            fc: data[account].fc_balance.toString(),
            usd: data[account].usd_balance.toString(),
          };
        }
      });
      setSavedBalances(newSavedBalances);
    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
      setLoadingBalances(false);
    }
  };

  const loadExchangeRate = async () => {
    try {
      const response = await api.get('/exchange-rate');
      setExchangeRate(response.data.rate);
    } catch (error) {
      console.error('Error loading exchange rate:', error);
    } finally {
      setLoadingExchangeRate(false);
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
  useEffect(() => {
    loadBalances();
    loadExchangeRate();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */

  const handleBalanceChange = (account, currency, value) => {
    setBalances(prev => ({
      ...prev,
      [account]: {
        ...prev[account],
        [currency]: value
      }
    }));
  };

  const handleActionDataChange = (field, value) => {
    setActionData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const openMovementModal = (type) => {
    setActionModalType(type);
    setActionData({
      ...defaultMovementData,
      account: accounts[0],
      status: type === 'withdraw' ? 'Servie' : 'Encaissé',
    });
    setShowMovementModal(true);
  };

  const closeMovementModal = () => {
    setShowMovementModal(false);
    setActionModalType(null);
    setActionData(defaultMovementData);
    setLoading(false);
  };

  const handleConfirmMovement = async () => {
    setLoading(true);
    try {
      // Create a new movement object with timestamp
      const newMovement = {
        id: Date.now(),
        type: actionModalType,
        timestamp: new Date().toLocaleString('fr-FR'),
        agent: user?.name || 'Agent',
        ...actionData,
      };
      
      // Add movement to daily movements
      setDailyMovements(prev => [newMovement, ...prev]);
      
      // TODO: Replace with backend endpoint once movement API is available.
      console.log('Saving movement', actionModalType, actionData);
      closeMovementModal();
    } catch (error) {
      console.error('Error saving movement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBalances = async () => {
    setLoading(true);
    try {
      const rate = exchangeRate || 0;
      const balancesToSave = accounts.map(account => ({
        account_name: account,
        fc_balance: parseFloat(balances[account].fc) || 0,
        usd_balance: parseFloat(balances[account].usd) || 0,
        time_slot: timeSlot,
      }));

      await api.post('/account-balances', { balances: balancesToSave });
      await loadBalances(); // Reload to show saved balances

      const savedSlotBalances = accounts.reduce((acc, account) => {
        acc[account] = {
          fc: balances[account].fc || '0',
          usd: balances[account].usd || '0',
        };
        return acc;
      }, {});

      setRecordedBalances(prev => ({
        ...prev,
        [timeSlot]: savedSlotBalances,
      }));

      const movements = accounts.map((account, index) => {
        const fcAmount = parseFloat(balances[account].fc) || 0;
        const usdAmount = parseFloat(balances[account].usd) || 0;
        const totalInFc = fcAmount + usdAmount * rate;

        return {
          id: Date.now() + index,
          type: 'balance',
          timestamp: new Date().toLocaleString('fr-FR'),
          account,
          amount: totalInFc.toFixed(2),
          amountFc: fcAmount.toFixed(2),
          amountUsd: usdAmount.toFixed(2),
          currency: 'FC',
          status: timeSlot,
          timeSlot,
          agent: user?.name || 'Agent',
        };
      });

      setDailyMovements(prev => [...movements, ...prev]);

      // Reset inputs
      setBalances(
        accounts.reduce((acc, account) => {
          acc[account] = { fc: '', usd: '' };
          return acc;
        }, {})
      );
      setShowModal(false);
      setModalStep('timeSelection');
      setTimeSlot('');
    } catch (error) {
      console.error('Error saving balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setModalStep('timeSelection');
    setTimeSlot('');
  };

  const handleEndOperations = () => {
    if (dailyMovements.length === 0) {
      alert('Aucune opération à finir.');
      return;
    }

    // Add current date to movements for archiving
    const archivedMovements = dailyMovements.map(movement => ({
      ...movement,
      archivedDate: new Date().toLocaleString('fr-FR'),
    }));

    // Add to archives
    setArchives(prev => [...archivedMovements, ...prev]);

    // Clear daily movements
    setDailyMovements([]);

    alert('Opérations du jour finalisées et archivées avec succès!');
  };

  const getFilteredArchives = () => {
    if (!archiveSearchDate) {
      return archives;
    }

    const searchDate = new Date(archiveSearchDate).toLocaleDateString('fr-FR');
    
    return archives.filter(archive => {
      const archiveDate = new Date(archive.archivedDate).toLocaleDateString('fr-FR');
      return archiveDate === searchDate;
    });
  };

  const openArchiveDetailsModal = (archive) => {
    setSelectedArchive(archive);
    setShowArchiveDetailsModal(true);
  };

  const closeArchiveDetailsModal = () => {
    setShowArchiveDetailsModal(false);
    setSelectedArchive(null);
  };

  const handleTimeSlotSelect = (slot) => {
    setTimeSlot(slot);
    setModalStep('balanceEntry');
  };

  const getAccountConfig = (account) => {
    const config = {
      'Mpesa': {
        color: 'blue',
        bgColor: 'bg-blue-600',
        borderColor: 'border-l-blue-600',
        lightBg: 'bg-blue-50',
        icon: (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
        ),
      },
      'OrangeMonnaie': {
        color: 'orange',
        bgColor: 'bg-orange-500',
        borderColor: 'border-l-orange-500',
        lightBg: 'bg-orange-50',
        icon: (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
          </svg>
        ),
      },
      'AirtelMonnaie': {
        color: 'red',
        bgColor: 'bg-red-600',
        borderColor: 'border-l-red-600',
        lightBg: 'bg-red-50',
        icon: (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
        ),
      },
      'S.C (SuperCompte)': {
        color: 'yellow',
        bgColor: 'bg-yellow-500',
        borderColor: 'border-l-yellow-500',
        lightBg: 'bg-yellow-50',
        icon: (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8zM9 12c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6-6h2v2h-2zm0 3h2v2h-2z" />
          </svg>
        ),
      },
      'CashExpress': {
        color: 'green',
        bgColor: 'bg-green-600',
        borderColor: 'border-l-green-600',
        lightBg: 'bg-green-50',
        icon: (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
        ),
      },
      'Portefeuille': {
        color: 'purple',
        bgColor: 'bg-purple-600',
        borderColor: 'border-l-purple-600',
        lightBg: 'bg-purple-50',
        icon: (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 6h-2c0-2.66-2.16-5-5-5s-5 2.34-5 5H6c-1.1 0-1.99.9-1.99 2L4 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-2c1.66 0 3 1.34 3 3h-6c0-1.66 1.34-3 3-3zm0 7c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z" />
          </svg>
        ),
      },
    };
    return config[account] || config['Mpesa'];
  };

  if (loadingBalances) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des soldes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Remise et Reprise</h1>
              <p className="text-sm text-gray-500">Gestion des soldes des comptes</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{user?.name}</span>
              <Button variant="secondary" onClick={logout}>Déconnexion</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banks Section - Comptes Financiers */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          {/* Header with Icon and Exchange Rate */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-indigo-600 shrink-0">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 2c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9zm0 2c-3.865 0-7 3.135-7 7s3.135 7 7 7 7-3.135 7-7-3.135-7-7-7zm0 2c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Comptes Financiers</h2>
                <p className="text-gray-600 text-sm mt-1">Soldes enregistrés le matin et à midi</p>
              </div>
            </div>
            
            {!loadingExchangeRate && exchangeRate && (
              <div className="rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5 text-right w-full sm:w-auto shadow-sm">
                <p className="text-xs uppercase tracking-wider font-bold text-blue-700 mb-2">Taux d'échange</p>
                <div className="flex items-center justify-end gap-2">
                  <p className="text-2xl font-bold text-blue-900">1 USD = {exchangeRate.toLocaleString('fr-FR')} FC</p>
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14l5-5 5 5H7z" transform="rotate(180 12 12)" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {accounts.map((account) => {
              const morning = recordedBalances.Matin[account];
              const midday = recordedBalances.Midi[account];
              const config = getAccountConfig(account);
              
              return (
                <div 
                  key={account} 
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
                >
                  {/* Card Header with Icon and Status */}
                  <div className="bg-linear-to-r from-gray-50 to-gray-100 p-5 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`${config.bgColor} p-2.5 rounded-lg shadow-md group-hover:shadow-lg transition-all`}>
                          {config.icon}
                        </div>
                        <h3 className="text-base font-bold text-gray-900">{account}</h3>
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Actif
                      </span>
                    </div>
                  </div>

                  {/* Card Body - Balances */}
                  <div className={`p-5 border-l-4 ${config.borderColor}`}>
                    {/* Matin Section */}
                    <div className="mb-5 pb-5 border-b border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">☀️</span>
                        <p className="text-xs font-bold uppercase text-gray-700 tracking-wide">Matin</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-600 font-medium mb-1">FC</p>
                          <p className="text-lg font-bold text-blue-700">{formatFcAmount(morning.fc)}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-600 font-medium mb-1">USD</p>
                          <p className="text-lg font-bold text-green-700">{formatFcAmount(morning.usd)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Midi Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🌙</span>
                        <p className="text-xs font-bold uppercase text-gray-700 tracking-wide">Midi</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-600 font-medium mb-1">FC</p>
                          <p className="text-lg font-bold text-blue-700">{formatFcAmount(midday.fc)}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-600 font-medium mb-1">USD</p>
                          <p className="text-lg font-bold text-green-700">{formatFcAmount(midday.usd)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer with Button and Info */}
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Enregistrements disponibles : Matin et Midi</span>
            </div>
            <Button
              onClick={handleOpenModal}
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              {loading ? 'Enregistrement...' : 'Enregistrement solde'}
            </Button>
          </div>
        </div>

        {/* Total du Jour Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Total du Jour</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Total A</p>
              <p className="text-3xl font-bold text-blue-700">{formatFcAmount(getSlotTotal('Matin'))} FC</p>
              <p className="text-xs text-gray-500 mt-2">Somme des soldes enregistrés le matin en Francs Congolais</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Total B</p>
              <p className="text-3xl font-bold text-blue-700">{formatFcAmount(getSlotTotal('Midi'))} FC</p>
              <p className="text-xs text-gray-500 mt-2">Somme des soldes enregistrés à midi en Francs Congolais</p>
            </div>
          </div>
        </div>

        {/* Mouvements Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Mouvements</h2>
          <p className="text-gray-600 mb-6">Gestion des mouvements de soldes et justifications</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => openMovementModal('add')}
              className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              ➕ Ajout Solde
            </Button>
            <Button
              onClick={() => openMovementModal('withdraw')}
              className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              ➖ Retrait Solde
            </Button>
            <Button
              onClick={() => openMovementModal('justification')}
              className="px-6 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              📄 Justification
            </Button>
          </div>
        </div>

        {/* Daily Movements Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Mouvements Journaliers</h2>
          <p className="text-gray-600 mb-6">Opérations effectuées aujourd'hui par les agents</p>
          
          {dailyMovements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune opération enregistrée pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Heure</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type d'opération</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Compte</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Montant</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyMovements.map((movement) => (
                    <tr key={movement.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700">{movement.timestamp}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                          movement.type === 'add' ? 'bg-blue-600' :
                          movement.type === 'withdraw' ? 'bg-red-600' :
                          movement.type === 'balance' ? 'bg-indigo-600' :
                          'bg-yellow-600'
                        }`}>
                          {movement.type === 'add' ? '➕ Ajout' :
                           movement.type === 'withdraw' ? '➖ Retrait' :
                           movement.type === 'balance' ? '📝 Enregistrement' :
                           '📄 Justification'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{movement.account || '-'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{movement.amount || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          movement.status === 'Matin' ? 'bg-blue-100 text-blue-800' :
                          movement.status === 'Midi' ? 'bg-sky-100 text-sky-800' :
                          movement.status === 'Encaissé' ? 'bg-green-100 text-green-800' :
                          movement.status === 'Servie' ? 'bg-green-100 text-green-800' :
                          movement.status === 'Non Encaissé' ? 'bg-red-100 text-red-800' :
                          movement.status === 'Non servie' ? 'bg-red-100 text-red-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {movement.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 space-y-1">
                        {movement.agent && <div>Agent: {movement.agent}</div>}
                        {movement.client && <div>Client: {movement.client}</div>}
                        {movement.justification && <div>Justif: {movement.justification.substring(0, 30)}...</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {dailyMovements.length > 0 && (
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleEndOperations}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg"
              >
                ✓ Fin des opérations
              </Button>
            </div>
          )}
        </div>

        {/* Archives Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Archives</h2>
              <p className="text-gray-600">Opérations journalières finalisées</p>
            </div>
            
            {/* Search by Date - Top Right */}
            <div className="flex items-end gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Filtrer par date</label>
                <Input
                  type="date"
                  value={archiveSearchDate}
                  onChange={(e) => setArchiveSearchDate(e.target.value)}
                  className="w-40"
                />
              </div>
              {archiveSearchDate && (
                <button
                  onClick={() => setArchiveSearchDate('')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-gray-400 hover:bg-gray-500 rounded-lg transition-colors"
                >
                  ✕ Réinit.
                </button>
              )}
            </div>
          </div>

          {getFilteredArchives().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {archiveSearchDate ? 'Aucune opération trouvée pour cette date' : 'Aucune opération archivée pour le moment'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date d'archivage</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Heure opération</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type d'opération</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Compte</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Montant</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredArchives().map((archive) => (
                    <tr 
                      key={archive.id} 
                      className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => openArchiveDetailsModal(archive)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">{archive.archivedDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{archive.timestamp}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                          archive.type === 'add' ? 'bg-blue-600' :
                          archive.type === 'withdraw' ? 'bg-red-600' :
                          archive.type === 'balance' ? 'bg-indigo-600' :
                          'bg-yellow-600'
                        }`}>
                          {archive.type === 'add' ? '➕ Ajout' :
                           archive.type === 'withdraw' ? '➖ Retrait' :
                           archive.type === 'balance' ? '📝 Enregistrement' :
                           '📄 Justification'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{archive.account || '-'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{archive.amount || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          archive.status === 'Matin' ? 'bg-blue-100 text-blue-800' :
                          archive.status === 'Midi' ? 'bg-sky-100 text-sky-800' :
                          archive.status === 'Encaissé' ? 'bg-green-100 text-green-800' :
                          archive.status === 'Servie' ? 'bg-green-100 text-green-800' :
                          archive.status === 'Non Encaissé' ? 'bg-red-100 text-red-800' :
                          archive.status === 'Non servie' ? 'bg-red-100 text-red-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {archive.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 space-y-1">
                        {archive.agent && <div>Agent: {archive.agent}</div>}
                        {archive.client && <div>Client: {archive.client}</div>}
                        {archive.justification && <div>Justif: {archive.justification.substring(0, 30)}...</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {/* Time Selection Step */}
            {modalStep === 'timeSelection' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Type d'enregistrement</h2>
                <p className="text-gray-600 mb-6">Sélectionnez l'horaire de l'enregistrement</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleTimeSlotSelect('Matin')}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg text-center font-semibold text-gray-900 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    🌅 Matin
                  </button>
                  <button
                    onClick={() => handleTimeSlotSelect('Midi')}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg text-center font-semibold text-gray-900 hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    ☀️ Midi
                  </button>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full mt-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Annuler
                </button>
              </div>
            )}

            {/* Balance Entry Step */}
            {modalStep === 'balanceEntry' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Enregistrement des soldes</h2>
                <p className="text-gray-600 mb-4">Horaire sélectionné: <span className="font-semibold text-blue-600">{timeSlot}</span></p>
                
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {accounts.map((account) => (
                    <div key={account} className="border rounded-lg p-4 bg-gray-50">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">{account}</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Francs Congolais (FC)
                          </label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={balances[account].fc}
                            onChange={(e) => handleBalanceChange(account, 'fc', e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Dollars (USD)
                          </label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={balances[account].usd}
                            onChange={(e) => handleBalanceChange(account, 'usd', e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setModalStep('timeSelection')}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-50"
                  >
                    Retour
                  </button>
                  <Button
                    onClick={handleSaveBalances}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full mt-2 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showMovementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {actionModalType === 'add' && 'Ajout Solde'}
                {actionModalType === 'withdraw' && 'Retrait Solde'}
                {actionModalType === 'justification' && 'Justification'}
              </h2>
              <p className="text-gray-600 mb-6">
                {actionModalType === 'add' && 'Enregistrez un montant à ajouter et choisissez un compte.'}
                {actionModalType === 'withdraw' && 'Enregistrez un montant à retirer et choisissez un compte.'}
                {actionModalType === 'justification' && 'Ajoutez les détails du client, le montant et la justification.'}
              </p>

              <div className="space-y-4">
                {(actionModalType === 'add' || actionModalType === 'withdraw') && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Montant</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={actionData.amount}
                        onChange={(e) => handleActionDataChange('amount', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Devise</label>
                      <select
                        value={actionData.currency}
                        onChange={(e) => handleActionDataChange('currency', e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="FC">Franc Congolais (FC)</option>
                        <option value="USD">Dollars (USD)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Compte</label>
                      <select
                        value={actionData.account}
                        onChange={(e) => handleActionDataChange('account', e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {accounts.map((account) => (
                          <option key={account} value={account}>{account}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Statut du mouvement</label>
                      <select
                        value={actionData.status}
                        onChange={(e) => handleActionDataChange('status', e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {actionModalType === 'add' ? (
                          <>
                            <option value="Encaissé">Encaissé</option>
                            <option value="Non Encaissé">Non Encaissé</option>
                          </>
                        ) : (
                          <>
                            <option value="Servie">Servie</option>
                            <option value="Non servie">Non servie</option>
                          </>
                        )}
                      </select>
                    </div>
                  </>
                )}

                {actionModalType === 'justification' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nom du client</label>
                      <Input
                        type="text"
                        placeholder="Nom du client"
                        value={actionData.client}
                        onChange={(e) => handleActionDataChange('client', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Montant</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={actionData.amount}
                        onChange={(e) => handleActionDataChange('amount', e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Devise</label>
                      <select
                        value={actionData.currency}
                        onChange={(e) => handleActionDataChange('currency', e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="FC">Franc Congolais (FC)</option>
                        <option value="USD">Dollars (USD)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Justification</label>
                      <textarea
                        rows="4"
                        placeholder="Motif / justification"
                        value={actionData.justification}
                        onChange={(e) => handleActionDataChange('justification', e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date et heure prévues</label>
                      <Input
                        type="datetime-local"
                        value={actionData.scheduledAt}
                        onChange={(e) => handleActionDataChange('scheduledAt', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeMovementModal}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <Button
                  onClick={handleConfirmMovement}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  {loading ? 'Confirmation...' : 'Confirmé'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Details Modal */}
      {showArchiveDetailsModal && selectedArchive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Détails de l'opération</h2>
              <button
                onClick={closeArchiveDetailsModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date d'archivage</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedArchive.archivedDate}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Heure de l'opération</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedArchive.timestamp}</p>
                  </div>
                </div>
              </div>

              {/* Operation Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Type d'opération</label>
                <span className={`px-4 py-2 rounded-full text-white text-sm font-semibold ${
                  selectedArchive.type === 'add' ? 'bg-blue-600' :
                  selectedArchive.type === 'withdraw' ? 'bg-red-600' :
                  selectedArchive.type === 'balance' ? 'bg-indigo-600' :
                  'bg-yellow-600'
                }`}>
                  {selectedArchive.type === 'add' ? '➕ Ajout de solde' :
                   selectedArchive.type === 'withdraw' ? '➖ Retrait de solde' :
                   selectedArchive.type === 'balance' ? '📝 Enregistrement' :
                   '📄 Justification'}
                </span>
              </div>

              {/* Operation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {(selectedArchive.type === 'add' || selectedArchive.type === 'withdraw' || selectedArchive.type === 'balance') && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Montant</label>
                        <p className="text-lg font-bold text-gray-900">{selectedArchive.amount || 'N/A'}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Compte</label>
                        <p className="text-sm font-semibold text-gray-900">{selectedArchive.account || 'N/A'}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
                        <span className={`px-3 py-1 rounded text-sm font-medium ${
                          selectedArchive.status === 'Matin' ? 'bg-blue-100 text-blue-800' :
                          selectedArchive.status === 'Midi' ? 'bg-sky-100 text-sky-800' :
                          selectedArchive.status === 'Encaissé' ? 'bg-green-100 text-green-800' :
                          selectedArchive.status === 'Servie' ? 'bg-green-100 text-green-800' :
                          selectedArchive.status === 'Non Encaissé' ? 'bg-red-100 text-red-800' :
                          selectedArchive.status === 'Non servie' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedArchive.status}
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Agent</label>
                        <p className="text-sm font-semibold text-gray-900">{selectedArchive.agent || 'N/A'}</p>
                      </div>

                      {selectedArchive.type === 'balance' && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Montant FC original</label>
                            <p className="text-sm text-gray-900">{selectedArchive.amountFc || '0.00'} FC</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Montant USD original</label>
                            <p className="text-sm text-gray-900">{selectedArchive.amountUsd || '0.00'} USD</p>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {selectedArchive.type === 'justification' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nom du client</label>
                        <p className="text-sm font-semibold text-gray-900">{selectedArchive.client || 'N/A'}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Montant</label>
                        <p className="text-lg font-bold text-gray-900">{selectedArchive.amount || 'N/A'}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date et heure prévues</label>
                        <p className="text-sm font-semibold text-gray-900">{selectedArchive.scheduledAt || 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {selectedArchive.type === 'justification' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Justification complète</label>
                      <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedArchive.justification || 'Aucune justification'}</p>
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">ID de l'opération</label>
                    <p className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{selectedArchive.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={closeArchiveDetailsModal}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemiseRepris;