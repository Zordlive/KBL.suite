import React, { useState, useEffect } from 'react';
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
  const [loadingBalances, setLoadingBalances] = useState(true);  const [showModal, setShowModal] = useState(false);
  const [timeSlot, setTimeSlot] = useState('');
  const [modalStep, setModalStep] = useState('timeSelection');
  useEffect(() => {
    loadBalances();
  }, []);

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

  const handleBalanceChange = (account, currency, value) => {
    setBalances(prev => ({
      ...prev,
      [account]: {
        ...prev[account],
        [currency]: value
      }
    }));
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
        {/* Banks Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Banks</h2>
          <p className="text-gray-600 mb-6">Soldes actuels des comptes financiers</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div key={account} className="border rounded-lg p-6 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{account}</h3>
                
                {/* Display of saved balances */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Francs Congolais:</span>
                    <span className="text-lg font-bold text-blue-600">{parseFloat(savedBalances[account].fc).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Dollars:</span>
                    <span className="text-lg font-bold text-green-600">{parseFloat(savedBalances[account].usd).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleOpenModal}
              disabled={loading}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
            >
              {loading ? 'Enregistrement...' : 'Enregistrement solde'}
            </Button>
          </div>
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
    </div>
  );
};

export default RemiseRepris;