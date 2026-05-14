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
  };
  const [actionData, setActionData] = useState(defaultMovementData);
  const [dailyMovements, setDailyMovements] = useState([]);
  const [archives, setArchives] = useState([]);
  const [archiveSearchDate, setArchiveSearchDate] = useState('');

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
      const balancesToSave = accounts.map(account => ({
        account_name: account,
        fc_balance: parseFloat(balances[account].fc) || 0,
        usd_balance: parseFloat(balances[account].usd) || 0,
        time_slot: timeSlot,
      }));
      await api.post('/account-balances', { balances: balancesToSave });
      await loadBalances(); // Reload to show saved balances
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

  const handleTimeSlotSelect = (slot) => {
    setTimeSlot(slot);
    setModalStep('balanceEntry');
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
        {/* Exchange Rate Section */}
        {!loadingExchangeRate && exchangeRate && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Taux de Change</h2>
            <p className="text-lg font-bold text-blue-600">1 USD = {exchangeRate.toLocaleString('fr-FR')} FC</p>
          </div>
        )}

        {/* Banks Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Comptes Financiers</h2>
          <p className="text-gray-600 mb-6">Soldes actuels des comptes</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div key={account} className="border rounded-lg p-4 bg-linear-to-br from-gray-50 to-white hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">
                    {account === 'Mpesa' ? '📱' : account === 'OrangeMonnaie' ? '🟠' : account === 'AirtelMonnaie' ? '🔴' : account === 'S.C (SuperCompte)' ? '💳' : account === 'CashExpress' ? '💰' : '👛'}
                  </span>
                  {account}
                </h3>
                
                {/* Display of saved balances */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-white rounded border border-gray-200 hover:bg-blue-50 transition-colors">
                    <span className="text-sm font-medium text-gray-700">FC:</span>
                    <span className="text-lg font-bold text-blue-600">{parseFloat(savedBalances[account].fc).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border border-gray-200 hover:bg-green-50 transition-colors">
                    <span className="text-sm font-medium text-gray-700">USD:</span>
                    <span className="text-lg font-bold text-green-600">{parseFloat(savedBalances[account].usd).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end items-center gap-4">
            <span className="text-sm text-gray-600">Enregistrements disponibles : Matin et Midi</span>
            <Button
              onClick={handleOpenModal}
              disabled={loading}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
            >
              {loading ? 'Enregistrement...' : 'Enregistrement solde'}
            </Button>
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
                          'bg-yellow-600'
                        }`}>
                          {movement.type === 'add' ? '➕ Ajout' :
                           movement.type === 'withdraw' ? '➖ Retrait' :
                           '📄 Justification'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{movement.account || '-'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{movement.amount || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          movement.status === 'Encaissé' ? 'bg-green-100 text-green-800' :
                          movement.status === 'Servie' ? 'bg-green-100 text-green-800' :
                          movement.status === 'Non Encaissé' ? 'bg-red-100 text-red-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {movement.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {movement.client && `Client: ${movement.client}`}
                        {movement.justification && `Justif: ${movement.justification.substring(0, 30)}...`}
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
                    <tr key={archive.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700">{archive.archivedDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{archive.timestamp}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                          archive.type === 'add' ? 'bg-blue-600' :
                          archive.type === 'withdraw' ? 'bg-red-600' :
                          'bg-yellow-600'
                        }`}>
                          {archive.type === 'add' ? '➕ Ajout' :
                           archive.type === 'withdraw' ? '➖ Retrait' :
                           '📄 Justification'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{archive.account || '-'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{archive.amount || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          archive.status === 'Encaissé' ? 'bg-green-100 text-green-800' :
                          archive.status === 'Servie' ? 'bg-green-100 text-green-800' :
                          archive.status === 'Non Encaissé' ? 'bg-red-100 text-red-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {archive.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {archive.client && `Client: ${archive.client}`}
                        {archive.justification && `Justif: ${archive.justification.substring(0, 30)}...`}
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
    </div>
  );
};

export default RemiseRepris;