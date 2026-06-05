import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import NavBar from '../components/layout/NavBar';
import logoKLB from '../img/logoKLB.png';
import mpesaLogo from '../img/m-pesa-logo.png';
import orangeMoneyLogo from '../img/Orange-Money-logo.png';
import airtelMoneyLogo from '../img/airtel-money-logo.png';
import './RemiseRepris.css';

const accounts = [
  'Mpesa',
  'OrangeMonnaie',
  'AirtelMonnaie',
  'S.C (SuperCompte)',
  'CashExpress',
  'Portefeuille'
];

const RemiseRepris = () => {
  const { user } = useAuth();
  const [balances, setBalances] = useState(
    accounts.reduce((acc, account) => {
      acc[account] = { fc: '', usd: '' };
      return acc;
    }, {})
  );
  const [savedBalances, setSavedBalances] = useState(
    accounts.reduce((acc, account) => {
      acc[account] = { fc: '0', usd: '0' };
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

  useEffect(() => {
    loadBalances();
    loadExchangeRate();
  }, []);

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
      const newMovement = {
        id: Date.now(),
        type: actionModalType,
        timestamp: new Date().toLocaleString('fr-FR'),
        agent: user?.name || 'Agent',
        ...actionData,
      };
      
      setDailyMovements(prev => [newMovement, ...prev]);
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
      await loadBalances();

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

    const archivedMovements = dailyMovements.map(movement => ({
      ...movement,
      archivedDate: new Date().toLocaleString('fr-FR'),
    }));

    setArchives(prev => [...archivedMovements, ...prev]);
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
        lightBg: 'from-blue-50 to-blue-100',
        logo: mpesaLogo,
      },
      'OrangeMonnaie': {
        color: 'orange',
        bgColor: 'bg-orange-500',
        borderColor: 'border-l-orange-500',
        lightBg: 'from-orange-50 to-orange-100',
        logo: orangeMoneyLogo,
      },
      'AirtelMonnaie': {
        color: 'red',
        bgColor: 'bg-red-600',
        borderColor: 'border-l-red-600',
        lightBg: 'from-red-50 to-red-100',
        logo: airtelMoneyLogo,
      },
      'S.C (SuperCompte)': {
        color: 'yellow',
        bgColor: 'bg-yellow-500',
        borderColor: 'border-l-yellow-500',
        lightBg: 'from-yellow-50 to-yellow-100',
        icon: '🏦',
      },
      'CashExpress': {
        color: 'green',
        bgColor: 'bg-green-600',
        borderColor: 'border-l-green-600',
        lightBg: 'from-green-50 to-green-100',
        icon: '💚',
      },
      'Portefeuille': {
        color: 'purple',
        bgColor: 'bg-purple-600',
        borderColor: 'border-l-purple-600',
        lightBg: 'from-purple-50 to-purple-100',
        icon: '💜',
      },
    };
    return config[account] || config['Mpesa'];
  };

  if (loadingBalances) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des soldes...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-linear-to-br from-gray-50 via-gray-50 to-indigo-50 relative"
      style={{
        backgroundImage: `url(${logoKLB})`,
        backgroundPosition: 'bottom right',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '400px 400px',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>
      
      <NavBar />
      
      <div className="relative z-10">
      {/* ============ MAIN CONTENT ============ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* ============ ACCOUNTS SECTION ============ */}
        <section className="rounded-xl bg-white shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 sm:p-8 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">💳</span> Comptes Financiers
                </h2>
                <p className="text-sm text-gray-600 mt-1">Soldes enregistrés le matin et à midi</p>
              </div>
              
              {!loadingExchangeRate && exchangeRate && (
                <div className="exchange-rate-card rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5 w-full sm:w-auto shadow-sm hover:shadow-md transition-all duration-300">
                  <p className="text-xs uppercase tracking-wider font-bold text-blue-700 mb-2">Taux d'échange</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xl sm:text-2xl font-bold text-blue-900">1 USD = {exchangeRate.toLocaleString('fr-FR')} FC</p>
                    <svg className="w-5 h-5 text-green-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 14l5-5 5 5H7z" transform="rotate(180 12 12)" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {accounts.map((account) => {
                const morning = recordedBalances.Matin[account];
                const midday = recordedBalances.Midi[account];
                const config = getAccountConfig(account);
                
                return (
                  <div 
                    key={account}
                    className="account-card bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-indigo-300 shadow-md hover:shadow-xl"
                  >
                    {/* Card Header */}
                    <div className={`bg-linear-to-r ${config.lightBg} p-5 border-b-2 ${config.borderColor}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`account-icon ${config.bgColor} p-3 rounded-lg shadow-md flex items-center justify-center h-12 w-12`}>
                            {config.logo ? (
                              <img src={config.logo} alt={account} className="h-8 w-auto object-contain" />
                            ) : (
                              <span className="text-2xl">{config.icon}</span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-gray-900">{account}</h3>
                        </div>
                        <span className="badge-pulse inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Actif
                        </span>
                      </div>
                    </div>

                    {/* Card Body - Balances */}
                    <div className="p-5 space-y-4">
                      {/* Matin Section */}
                      <div className="pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">☀️</span>
                          <p className="text-xs font-bold uppercase text-gray-700 tracking-wide">Matin</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-50 rounded-lg p-3 text-center hover:bg-blue-100 transition-colors">
                            <p className="text-xs text-gray-600 font-medium mb-1">FC</p>
                            <p className="text-lg font-bold text-blue-700">{formatFcAmount(morning.fc)}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 text-center hover:bg-green-100 transition-colors">
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
                          <div className="bg-blue-50 rounded-lg p-3 text-center hover:bg-blue-100 transition-colors">
                            <p className="text-xs text-gray-600 font-medium mb-1">FC</p>
                            <p className="text-lg font-bold text-blue-700">{formatFcAmount(midday.fc)}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 text-center hover:bg-green-100 transition-colors">
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

            {/* Button Section */}
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center pt-8 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Enregistrements : Matin et Midi</span>
              </div>
              <Button
                onClick={handleOpenModal}
                disabled={loading}
                className="px-8 py-3 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold"
              >
                ➕ Enregistrement Solde
              </Button>
            </div>
          </div>
        </section>

        {/* ============ TOTALS SECTION ============ */}
        <section className="rounded-xl bg-white shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📊</span> Total du Jour
            </h2>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border-2 border-indigo-200 bg-linear-to-br from-indigo-50 to-indigo-100 p-6 hover:shadow-lg transition-all duration-300">
                <p className="text-sm font-medium text-indigo-700 mb-3">Total Matin</p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-blue-600">{formatFcAmount(getSlotTotal('Matin'))}</p>
                <p className="text-xs text-indigo-600 mt-2">FC</p>
              </div>
              <div className="rounded-xl border-2 border-blue-200 bg-linear-to-br from-blue-50 to-blue-100 p-6 hover:shadow-lg transition-all duration-300">
                <p className="text-sm font-medium text-blue-700 mb-3">Total Midi</p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">{formatFcAmount(getSlotTotal('Midi'))}</p>
                <p className="text-xs text-blue-600 mt-2">FC</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ MOVEMENTS SECTION ============ */}
        <section className="rounded-xl bg-white shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">⚙️</span> Gestion des Mouvements
            </h2>
            <p className="text-sm text-gray-600 mt-1">Ajoutez des mouvements et justifications</p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                onClick={() => openMovementModal('add')}
                className="px-6 py-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                ➕ Ajout Solde
              </Button>
              <Button
                onClick={() => openMovementModal('withdraw')}
                className="px-6 py-4 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                ➖ Retrait Solde
              </Button>
              <Button
                onClick={() => openMovementModal('justification')}
                className="px-6 py-4 bg-linear-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                📄 Justification
              </Button>
            </div>
          </div>
        </section>

        {/* ============ DAILY MOVEMENTS SECTION ============ */}
        <section className="rounded-xl bg-white shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📋</span> Mouvements Journaliers
            </h2>
            <p className="text-sm text-gray-600 mt-1">Opérations effectuées aujourd'hui</p>
          </div>

          <div className="p-6 sm:p-8">
            {dailyMovements.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-500">Aucune opération enregistrée pour le moment</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Heure</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Compte</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Montant</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyMovements.map((movement) => (
                        <tr key={movement.id} className="border-b hover:bg-indigo-50 transition-colors cursor-pointer">
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
                               movement.type === 'balance' ? '📝 Enreg.' :
                               '📄 Justif.'}
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
                              'bg-red-100 text-red-800'
                            }`}>
                              {movement.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-8">
                  <Button
                    onClick={handleEndOperations}
                    className="px-8 py-3 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    ✓ Fin des Opérations
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ============ ARCHIVES SECTION ============ */}
        <section className="rounded-xl bg-white shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">📁</span> Archives
                </h2>
                <p className="text-sm text-gray-600 mt-1">Opérations finalisées</p>
              </div>
              
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
          </div>

          <div className="p-6 sm:p-8">
            {getFilteredArchives().length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-500">
                  {archiveSearchDate ? 'Aucune opération pour cette date' : 'Aucune opération archivée'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Date Archiv.</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Heure Opér.</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Compte</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredArchives().map((archive) => (
                      <tr 
                        key={archive.id}
                        className="border-b hover:bg-indigo-50 transition-colors cursor-pointer"
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
                            {archive.type === 'add' ? '➕' :
                             archive.type === 'withdraw' ? '➖' :
                             archive.type === 'balance' ? '📝' :
                             '📄'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{archive.account || '-'}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{archive.amount || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ============ MODALS ============ */}
      {showModal && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal-content bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            {modalStep === 'timeSelection' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Type d'Enregistrement</h2>
                <p className="text-gray-600 mb-6">Sélectionnez l'horaire</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleTimeSlotSelect('Matin')}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg text-center font-semibold text-gray-900 hover:border-blue-500 hover:bg-blue-50 hover:scale-102 transition-all duration-200"
                  >
                    🌅 Matin
                  </button>
                  <button
                    onClick={() => handleTimeSlotSelect('Midi')}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg text-center font-semibold text-gray-900 hover:border-green-500 hover:bg-green-50 hover:scale-102 transition-all duration-200"
                  >
                    ☀️ Midi
                  </button>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full mt-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            )}

            {modalStep === 'balanceEntry' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Enregistrement Soldes</h2>
                <p className="text-gray-600 mb-4">Horaire: <span className="font-bold text-indigo-600">{timeSlot}</span></p>
                
                <div className="max-h-96 overflow-y-auto space-y-4 mb-6">
                  {accounts.map((account) => (
                    <div key={account} className="border-2 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <h3 className="text-sm font-bold text-gray-900 mb-3">{account}</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">FC</label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={balances[account].fc}
                            onChange={(e) => handleBalanceChange(account, 'fc', e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">USD</label>
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

                <div className="flex gap-3">
                  <button
                    onClick={() => setModalStep('timeSelection')}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    Retour
                  </button>
                  <Button
                    onClick={handleSaveBalances}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    {loading ? 'Enreg...' : 'Enregistrer'}
                  </Button>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full mt-2 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showMovementModal && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal-content bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {actionModalType === 'add' && '➕ Ajout Solde'}
              {actionModalType === 'withdraw' && '➖ Retrait Solde'}
              {actionModalType === 'justification' && '📄 Justification'}
            </h2>

            <div className="space-y-4 mt-6">
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
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="FC">FC</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Compte</label>
                    <select
                      value={actionData.account}
                      onChange={(e) => handleActionDataChange('account', e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {accounts.map((account) => (
                        <option key={account} value={account}>{account}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      value={actionData.status}
                      onChange={(e) => handleActionDataChange('status', e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">Client</label>
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">Justification</label>
                    <textarea
                      rows="3"
                      placeholder="Motif..."
                      value={actionData.justification}
                      onChange={(e) => handleActionDataChange('justification', e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeMovementModal}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <Button
                onClick={handleConfirmMovement}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                {loading ? '...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showArchiveDetailsModal && selectedArchive && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal-content bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Détails Opération</h2>
              <button
                onClick={closeArchiveDetailsModal}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date Archiv.</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedArchive.archivedDate}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Heure Opér.</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedArchive.timestamp}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Montant</label>
                <p className="text-2xl font-bold text-indigo-600">{selectedArchive.amount || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Compte</label>
                <p className="text-sm font-semibold text-gray-900">{selectedArchive.account || 'N/A'}</p>
              </div>

              {selectedArchive.justification && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Justification</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900">{selectedArchive.justification}</p>
                  </div>
                </div>
              )}
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
    </div>
  );
};

export default RemiseRepris;
