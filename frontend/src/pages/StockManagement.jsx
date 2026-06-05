import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import NavBar from '../components/layout/NavBar';
import VerificationModal from '../components/stock/VerificationModal';
import InventoryModal from '../components/stock/InventoryModal';
import SaleModal from '../components/stock/SaleModal';
import SalesTable from '../components/stock/SalesTable';
import DiscrepancyAlertModal from '../components/stock/DiscrepancyAlertModal';
import logoKLB from '../img/logoKLB.png';
import orangeLogo from '../img/Orange_logo.png';
import airtelLogo from '../img/Airtel_Logo.png';
import vodacomLogo from '../img/vodacom-logo.png';
import './StockManagement.css';

const networks = ['Orange', 'Airtel', 'Vodacom'];

const networkColors = {
  Orange: { 
    bg: 'from-orange-50 to-orange-100', 
    border: 'border-orange-200', 
    text: 'text-orange-700', 
    badge: 'bg-orange-100 text-orange-800',
    logo: orangeLogo
  },
  Airtel: { 
    bg: 'from-red-50 to-red-100', 
    border: 'border-red-200', 
    text: 'text-red-700', 
    badge: 'bg-red-100 text-red-800',
    logo: airtelLogo
  },
  Vodacom: { 
    bg: 'from-blue-50 to-blue-100', 
    border: 'border-blue-200', 
    text: 'text-blue-700', 
    badge: 'bg-blue-100 text-blue-800',
    logo: vodacomLogo
  },
};

const formatNumber = (value) => new Intl.NumberFormat('fr-FR').format(value);

const StockManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some((role) => role.name === 'administrator');

  const [stocks, setStocks] = useState([]);
  const [todayChecks, setTodayChecks] = useState([]);
  const [discrepancies, setDiscrepancies] = useState([]);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [openingStatus, setOpeningStatus] = useState({ completed: false, canSubmit: false, cutoffStart: '07:00', cutoffEnd: '13:00' });
  const [inventoryStatus, setInventoryStatus] = useState({ completed: false, canSubmit: false, cutoffStart: '19:00', cutoffEnd: '21:30' });
  const [lastEveningChecks, setLastEveningChecks] = useState([]);
  const [checkType, setCheckType] = useState('opening');
  const [summary, setSummary] = useState({ total_sales: 0, total_quantity: 0, anomalies: 0, network_sales: {} });
  const [sales, setSales] = useState([]);
  const [salesMeta, setSalesMeta] = useState({ page: 1, last_page: 1, total: 0, per_page: 10, offset: 0 });
  const [filters, setFilters] = useState({ search: '', network: '', dateFrom: '', dateTo: '', page: 1 });
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [showDiscrepancyAlert, setShowDiscrepancyAlert] = useState(false);
  const [checkValues, setCheckValues] = useState({ Orange: 0, Airtel: 0, Vodacom: 0 });
  const [inventoryValues, setInventoryValues] = useState({ Orange: 0, Airtel: 0, Vodacom: 0 });
  const [successMessage, setSuccessMessage] = useState('');
  const [saleForm, setSaleForm] = useState({
    clientType: 'client',
    clientName: '',
    clientPhone: '',
    network: 'Orange',
    quantity: 1,
    purchaseType: 'détail',
    paymentMethod: 'payé en totalité',
  });
  const [savingSale, setSavingSale] = useState(false);
  const [savingCheck, setSavingCheck] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('sales');
  const [inventoryMovements, setInventoryMovements] = useState([]);

  const initCheckValues = (checks = []) => {
    const values = { Orange: 0, Airtel: 0, Vodacom: 0 };
    checks.forEach((check) => {
      values[check.network] = check.counted_quantity;
    });
    setCheckValues(values);
  };

  const loadStocks = async () => {
    try {
      const response = await api.get('/stock-module/stocks');
      setStocks(response.data.stocks || []);
      setTodayChecks(response.data.todayChecks || []);
      setDiscrepancies(response.data.discrepancies || []);
      setPendingVerification(response.data.pendingVerification ?? false);
      setOpeningStatus(response.data.inventoryStatus?.opening || { completed: false, canSubmit: false, cutoffStart: '07:00', cutoffEnd: '13:00' });
      setInventoryStatus(response.data.inventoryStatus?.evening || { completed: false, canSubmit: false, cutoffStart: '19:00', cutoffEnd: '21:30' });
      setLastEveningChecks(response.data.inventoryStatus?.lastEveningChecks || []);
      initCheckValues(response.data.todayChecks || []);
      setInventoryValues(response.data.todayChecks?.reduce((acc, next) => ({ ...acc, [next.network]: next.counted_quantity }), { Orange: 0, Airtel: 0, Vodacom: 0 }) || { Orange: 0, Airtel: 0, Vodacom: 0 });

      if (response.data.pendingVerification) {
        setShowCheckModal(true);
      }

      const unresolvedDiscrepancies = response.data.discrepancies?.filter(d => !d.resolved) || [];
      setShowDiscrepancyAlert(unresolvedDiscrepancies.length > 0);
    } catch (error) {
      console.error(error);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await api.get('/stock-module/summary');
      setSummary(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadSales = async () => {
    try {
      const params = {
        search: filters.search,
        network: filters.network,
        date_from: filters.dateFrom,
        date_to: filters.dateTo,
        page: filters.page,
        per_page: salesMeta.per_page,
      };
      const response = await api.get('/stock-module/sales', { params });
      setSales(response.data.data || []);
      setSalesMeta({
        page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        per_page: response.data.per_page,
        offset: (response.data.current_page - 1) * response.data.per_page,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadStocks();
    loadSummary();
  }, []);

  useEffect(() => {
    loadSales();
  }, [filters.page, filters.search, filters.network, filters.dateFrom, filters.dateTo]);

  const handleSaleSubmit = async () => {
    setSavingSale(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await api.post('/stock-module/sales', {
        client_type: saleForm.clientType,
        client_name: saleForm.clientName,
        client_phone: saleForm.clientPhone,
        network: saleForm.network,
        quantity: saleForm.quantity,
        purchase_type: saleForm.purchaseType,
        payment_method: saleForm.paymentMethod,
      });
      setShowSaleModal(false);
      setSaleForm({
        clientType: 'client',
        clientName: '',
        clientPhone: '',
        network: 'Orange',
        quantity: 1,
        purchaseType: 'détail',
        paymentMethod: 'payé en totalité',
      });
      await loadStocks();
      await loadSummary();
      await loadSales();
      setSuccessMessage('✓ Vente enregistrée et stocks mis à jour.');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setSavingSale(false);
    }
  };

  const handleCheckSubmit = async () => {
    setSavingCheck(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const checks = networks.map((network) => ({
        network,
        counted_quantity: Number(checkValues[network] ?? 0),
      }));

      if (todayChecks.filter((check) => check.check_type === checkType).length === networks.length) {
        if (!isAdmin) {
          setErrorMessage('Seuls les administrateurs peuvent corriger les écarts.');
          return;
        }

        await Promise.all(
          todayChecks
            .filter((check) => check.check_type === checkType)
            .map((check) =>
              api.put(`/stock-module/checks/${check.id}`, {
                counted_quantity: Number(checkValues[check.network] ?? 0),
              }),
            ),
        );
        setSuccessMessage('✓ Écarts corrigés et historique des corrections enregistré.');
      } else {
        await api.post('/stock-module/checks', { check_type: checkType, checks });
        setSuccessMessage(
          checkType === 'opening'
            ? '✓ Vérification d\'ouverture enregistrée et comparée à l\'inventaire du soir précédent.'
            : '✓ Inventaire du soir enregistré et comparé au stock courant.',
        );

        // Add to inventory movements
        const movementType = checkType === 'opening' ? 'Vérification d\'ouverture' : 'Inventaire du soir';
        const newMovement = {
          id: Date.now(),
          type: movementType,
          timestamp: new Date().toLocaleString('fr-FR'),
          agent: user?.name || 'Agent',
          details: checks.map(c => `${c.network}: ${c.counted_quantity}`).join(', '),
        };
        setInventoryMovements([newMovement, ...inventoryMovements]);
      }

      setShowCheckModal(false);
      await loadStocks();
      await loadSummary();
      await loadSales();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erreur lors de la vérification.');
    } finally {
      setSavingCheck(false);
    }
  };

  const handleRecordDiscrepancies = async () => {
    try {
      const newMovement = {
        id: Date.now(),
        type: 'discrepancy',
        timestamp: new Date().toLocaleString('fr-FR'),
        agent: user?.name || 'Agent',
        details: todayChecks
          .filter(check => Math.abs(check.difference) > 0)
          .map(check => `${check.network}: ${check.difference}`)
          .join(', '),
      };
      setInventoryMovements([newMovement, ...inventoryMovements]);
      setSuccessMessage('✓ Écarts enregistrés dans le classeur d\'inventaire.');
    } catch (error) {
      setErrorMessage('Erreur lors de l\'enregistrement des écarts.');
    }
  };

  const handleInventorySubmit = async () => {
    setSavingCheck(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const checks = networks.map((network) => ({
        network,
        counted_quantity: Number(inventoryValues[network] ?? 0),
      }));

      await api.post('/stock-module/inventories', { check_type: 'evening', checks });
      setShowInventoryModal(false);
      setSuccessMessage('✓ Inventaire journalier validé et anomalies enregistrées.');
      await loadStocks();
      await loadSummary();
      await loadSales();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erreur lors de l\'enregistrement de l\'inventaire.');
    } finally {
      setSavingCheck(false);
    }
  };

  const exportToExcel = () => {
    const headers = [
      'N°',
      'Date et heure',
      'Réseau',
      'Type client',
      'Nom client',
      'Numéro client',
      'Quantité',
      'Type achat',
      'Paiement',
      'Stock avant',
      'Stock après',
      'Nom agent',
    ];

    const rows = sales.map((sale, index) => [
      index + 1,
      new Date(sale.sale_date).toLocaleString('fr-FR'),
      sale.network,
      sale.client_type,
      sale.client_name,
      sale.client_phone,
      sale.quantity,
      sale.purchase_type,
      sale.payment_method,
      sale.stock_before,
      sale.stock_after,
      sale.user?.name || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ventes_stock_klb.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPdf = () => {
    window.print();
  };

  const activeDiscrepancy = discrepancies.length > 0;

  return (
    <div 
      className="min-h-screen bg-linear-to-br from-gray-50 via-gray-50 to-blue-50 relative"
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
        {/* Success Message */}
        {successMessage && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 rounded-xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 flex items-start gap-3">
              <div className="shrink-0 text-emerald-600 text-xl">✓</div>
              <div className="flex-1">
                <p className="text-sm sm:text-base font-medium text-emerald-900">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage('')}
                className="text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Alert: Closed Time Windows */}
        {openingStatus.canSubmit || inventoryStatus.canSubmit ? null : (
          <div className="rounded-xl bg-linear-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="shrink-0 text-blue-600 text-2xl">ℹ️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2 text-base sm:text-lg">Fenêtres de vérification fermées</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>⏰ <span className="font-medium">Vérification d'ouverture:</span> {openingStatus.cutoffStart} - {openingStatus.cutoffEnd}</p>
                    <p>⏰ <span className="font-medium">Inventaire du soir:</span> {inventoryStatus.cutoffStart} - {inventoryStatus.cutoffEnd}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ VERIFICATION BUTTONS SECTION ============ */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Opening Verification Button */}
          <div className="rounded-xl bg-white shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔍</span> Vérification d'Ouverture
                </h3>
                <p className="text-sm text-gray-600">
                  {openingStatus.completed ? '✓ Complétée' : 'En attente'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 grow">
                <p className="text-xs sm:text-sm text-gray-700 mb-2">
                  <span className="font-semibold">Fenêtre:</span> {openingStatus.cutoffStart} - {openingStatus.cutoffEnd}
                </p>
                <div className="text-xs text-gray-600">
                  <p>Comparez l'inventaire du soir précédent</p>
                  <p>avec le stock à l'ouverture</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setCheckType('opening');
                  initCheckValues(todayChecks.filter(c => c.check_type === 'opening'));
                  setShowCheckModal(true);
                }}
                disabled={!openingStatus.canSubmit && openingStatus.completed}
                className={`w-full py-2 px-4 font-semibold transition-all duration-300 rounded-lg ${
                  openingStatus.canSubmit 
                    ? 'bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                    : openingStatus.completed 
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                }`}
              >
                {openingStatus.completed ? '✓ Complétée' : openingStatus.canSubmit ? '📋 Commencer' : '⏳ Fenêtre fermée'}
              </Button>
            </div>
          </div>

          {/* Evening Inventory Button */}
          <div className="rounded-xl bg-white shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <span className="text-2xl">📦</span> Inventaire du Soir
                </h3>
                <p className="text-sm text-gray-600">
                  {inventoryStatus.completed ? '✓ Complété' : 'En attente'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 grow">
                <p className="text-xs sm:text-sm text-gray-700 mb-2">
                  <span className="font-semibold">Fenêtre:</span> {inventoryStatus.cutoffStart} - {inventoryStatus.cutoffEnd}
                </p>
                <div className="text-xs text-gray-600">
                  <p>Inventoriez le stock actuel</p>
                  <p>et validez les quantités</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setInventoryValues(
                    todayChecks.reduce((acc, check) => ({ ...acc, [check.network]: check.counted_quantity }), { Orange: 0, Airtel: 0, Vodacom: 0 })
                  );
                  setShowInventoryModal(true);
                }}
                disabled={!inventoryStatus.canSubmit && inventoryStatus.completed}
                className={`w-full py-2 px-4 font-semibold transition-all duration-300 rounded-lg ${
                  inventoryStatus.canSubmit 
                    ? 'bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                    : inventoryStatus.completed 
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                }`}
              >
                {inventoryStatus.completed ? '✓ Complété' : inventoryStatus.canSubmit ? '📝 Commencer' : '⏳ Fenêtre fermée'}
              </Button>
            </div>
          </div>
        </section>

        {/* ============ STOCKS SECTION ============ */}
        <section className="rounded-xl bg-white shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 sm:p-8 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">📊</span> Stocks en Temps Réel
                </h2>
                <p className="text-sm text-gray-600 mt-1">Suivi instantané de vos inventaires par réseau</p>
              </div>
              <Button 
                onClick={() => setShowSaleModal(true)} 
                className="bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-white font-semibold py-2 px-4"
              >
                ➕ Enregistrer Vente
              </Button>
            </div>
          </div>

          {/* Stock Cards Grid */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {stocks.map((stock) => {
                const colors = networkColors[stock.network];
                return (
                  <div 
                    key={stock.network}
                    className={`relative group rounded-xl border-2 bg-linear-to-br ${colors.bg} border-gray-200 p-6 sm:p-7 shadow-md hover:shadow-xl hover:scale-105 hover:border-indigo-300 transition-all duration-300 overflow-hidden cursor-pointer`}
                  >
                    {/* Background animation */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-linear-to-br from-indigo-500 to-blue-500"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{stock.network}</h3>
                        <img src={colors.logo} alt={stock.network} className="h-10 w-auto transition-transform group-hover:scale-110 duration-300 object-contain" />
                      </div>
                      <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-blue-600 mb-2">
                        {formatNumber(stock.quantity)}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm text-gray-700 font-medium">unités</p>
                        <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Inventory Analysis */}
            <div className="pt-8 border-t-2 border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">📈</span> Analyse des Écarts
                </h3>
                {inventoryStatus.completed && todayChecks.some(c => Math.abs(c.difference) > 0) && (
                  <button
                    onClick={handleRecordDiscrepancies}
                    className="group relative px-6 py-2 overflow-hidden rounded-lg bg-linear-to-r from-purple-600 to-purple-700 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></span>
                    <span className="absolute inset-0 overflow-hidden rounded-lg">
                      <span className="absolute h-0 w-0 bg-white/30 rounded-full group-hover:h-32 group-hover:w-32 transition-all duration-500" style={{top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}></span>
                    </span>
                    <span className="relative flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Enregistrer les Écarts
                    </span>
                  </button>
                )}
              </div>
              {inventoryStatus.completed ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {['Orange', 'Airtel', 'Vodacom'].map((network) => {
                    const check = todayChecks.find((item) => item.network === network);
                    const discrepancy = check ? Math.abs(check.difference) : 0;
                    const hasDiscrepancy = discrepancy > 0;
                    
                    return (
                      <div 
                        key={network}
                        className={`rounded-xl border-2 p-5 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 group ${
                          hasDiscrepancy 
                            ? 'border-red-200 bg-linear-to-br from-red-50 to-red-100 hover:border-red-300' 
                            : 'border-green-200 bg-linear-to-br from-green-50 to-green-100 hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-gray-900 text-lg">{network}</h4>
                          <span className={`text-2xl transition-transform group-hover:scale-110 group-hover:rotate-12 duration-300 ${
                            hasDiscrepancy ? '' : ''
                          }`}>
                            {hasDiscrepancy ? '⚠️' : '✅'}
                          </span>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center bg-white bg-opacity-60 rounded-lg p-3 hover:bg-opacity-100 transition-all duration-200">
                            <span className="text-gray-700 font-medium">Théorique:</span>
                            <span className="font-bold text-indigo-600">{check?.expected_quantity ?? '—'}</span>
                          </div>
                          <div className="flex justify-between items-center bg-white bg-opacity-60 rounded-lg p-3 hover:bg-opacity-100 transition-all duration-200">
                            <span className="text-gray-700 font-medium">Inventorié:</span>
                            <span className="font-bold text-indigo-600">{check?.counted_quantity ?? '—'}</span>
                          </div>
                          <div className={`flex justify-between items-center rounded-lg p-3 font-bold transition-all duration-200 ${
                            hasDiscrepancy 
                              ? 'bg-red-200 text-red-800 hover:bg-red-300' 
                              : 'bg-green-200 text-green-800 hover:bg-green-300'
                          }`}>
                            <span>Écart:</span>
                            <span className="text-lg">
                              {hasDiscrepancy ? `−${discrepancy}` : '+0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-12 text-center hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 group cursor-pointer">
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">📭</div>
                  <p className="text-lg font-semibold text-gray-900">Aucun inventaire effectué</p>
                  <p className="text-sm text-gray-600 mt-2">Les écarts seront visibles après validation de l'inventaire journalier</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============ HISTORIQUE & INVENTAIRE SECTION ============ */}
        <section className="rounded-xl bg-white shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 sm:p-8 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📚</span> Historique & Inventaire
            </h2>
            <p className="text-sm text-gray-600 mt-1">Consultez les ventes ou les mouvements d'inventaire</p>
          </div>

          {/* Tabs Navigation */}
          <div className="px-6 sm:px-8 pt-6 border-b border-gray-200">
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={() => setActiveTab('sales')}
                className={`relative group px-4 sm:px-6 py-3 font-semibold transition-all duration-300 ${
                  activeTab === 'sales'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h4V3zm0 14H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm10 12h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-4v14zm0-14h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
                  </svg>
                  Classeur des Ventes
                </span>
                {activeTab === 'sales' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-blue-600 to-blue-400 rounded-t transform transition-all duration-300"></div>
                )}
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`relative group px-4 sm:px-6 py-3 font-semibold transition-all duration-300 ${
                  activeTab === 'inventory'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                  </svg>
                  Classeur d'inventaire
                </span>
                {activeTab === 'inventory' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-green-600 to-green-400 rounded-t transform transition-all duration-300"></div>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {/* Sales Tab */}
            {activeTab === 'sales' && (
              <div className="animate-in fade-in duration-300">
                <SalesTable
                  sales={sales}
                  filters={filters}
                  onFiltersChange={(updated) => setFilters(updated)}
                  onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                  pagination={{
                    page: salesMeta.page,
                    lastPage: salesMeta.last_page,
                    total: salesMeta.total,
                    offset: salesMeta.offset,
                  }}
                  onExportExcel={exportToExcel}
                  onExportPdf={exportToPdf}
                  loading={!sales}
                />
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div className="animate-in fade-in duration-300">
                {inventoryMovements.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-12 text-center hover:bg-gray-100 hover:border-gray-400 transition-all duration-300">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="text-lg font-semibold text-gray-900">Aucun mouvement d'inventaire</p>
                    <p className="text-sm text-gray-600 mt-2">Les mouvements apparaîtront après enregistrement des vérifications</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Date & Heure</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Détails</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Agent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryMovements.map((movement) => (
                          <tr key={movement.id} className="border-b hover:bg-indigo-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-700">{movement.timestamp}</td>
                            <td className="px-4 py-3 text-sm font-medium">
                              <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                                movement.type === 'Vérification d\'ouverture' ? 'bg-blue-600' :
                                movement.type === 'Inventaire du soir' ? 'bg-green-600' :
                                'bg-purple-600'
                              }`}>
                                {movement.type === 'Vérification d\'ouverture' ? '📋 Ouverture' :
                                 movement.type === 'Inventaire du soir' ? '📦 Soir' :
                                 '⚠️ Écarts'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{movement.details}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{movement.agent}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ============ MODALS ============ */}
      <VerificationModal
        isOpen={showCheckModal}
        onClose={() => {
          setShowCheckModal(false);
          setErrorMessage('');
        }}
        counts={checkValues}
        setCounts={setCheckValues}
        onSubmit={handleCheckSubmit}
        isAdmin={isAdmin}
        isReviewMode={activeDiscrepancy}
        checkType={checkType}
        errors={errorMessage}
        saving={savingCheck}
      />

      <InventoryModal
        isOpen={showInventoryModal}
        onClose={() => {
          setShowInventoryModal(false);
          setErrorMessage('');
        }}
        values={inventoryValues}
        setValues={setInventoryValues}
        onSubmit={handleInventorySubmit}
        errors={errorMessage}
        saving={savingCheck}
      />

      <SaleModal
        isOpen={showSaleModal}
        onClose={() => {
          setShowSaleModal(false);
          setErrorMessage('');
        }}
        form={saleForm}
        setForm={setSaleForm}
        onSubmit={handleSaleSubmit}
        errors={errorMessage}
        saving={savingSale}
      />

      <DiscrepancyAlertModal
        isOpen={showDiscrepancyAlert}
        onClose={() => setShowDiscrepancyAlert(false)}
        discrepancies={discrepancies.filter(d => !d.resolved)}
        isAdmin={isAdmin}
      />
      </div>
    </div>
  );
};

export default StockManagement;
