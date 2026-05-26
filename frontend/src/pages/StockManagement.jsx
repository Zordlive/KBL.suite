import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import VerificationModal from '../components/stock/VerificationModal';
import InventoryModal from '../components/stock/InventoryModal';
import SaleModal from '../components/stock/SaleModal';
import SalesTable from '../components/stock/SalesTable';
import DiscrepancyAlertModal from '../components/stock/DiscrepancyAlertModal';
import logoKLB from '../img/logoKLB.png';
import './StockManagement.css';

const networks = ['Orange', 'Airtel', 'Vodacom'];

const networkColors = {
  Orange: { 
    bg: 'from-orange-50 to-orange-100', 
    border: 'border-orange-200', 
    text: 'text-orange-700', 
    badge: 'bg-orange-100 text-orange-800',
    icon: '🟠'
  },
  Airtel: { 
    bg: 'from-red-50 to-red-100', 
    border: 'border-red-200', 
    text: 'text-red-700', 
    badge: 'bg-red-100 text-red-800',
    icon: '🔴'
  },
  Vodacom: { 
    bg: 'from-blue-50 to-blue-100', 
    border: 'border-blue-200', 
    text: 'text-blue-700', 
    badge: 'bg-blue-100 text-blue-800',
    icon: '🔵'
  },
};

const formatNumber = (value) => new Intl.NumberFormat('fr-FR').format(value);

const StockManagement = () => {
  const { user, logout } = useAuth();
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
      
      <div className="relative z-10">
      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Brand & Title */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <img src={logoKLB} alt="KLB Logo" className="h-10 w-auto shadow-md rounded-lg" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Stocks</h1>
              </div>
              <p className="text-sm text-gray-600 ml-14">Gestion centralisée Orange, Airtel et Vodacom</p>
            </div>

            {/* User & Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors duration-300">
                <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {openingStatus.canSubmit && !openingStatus.completed && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setCheckType('opening');
                      setShowCheckModal(true);
                    }}
                    className="text-xs sm:text-sm transform hover:scale-105 transition-transform duration-200"
                  >
                    📋 Ouverture
                  </Button>
                )}
                {inventoryStatus.canSubmit && !inventoryStatus.completed && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setCheckType('evening');
                      setShowCheckModal(true);
                    }}
                    className="text-xs sm:text-sm transform hover:scale-105 transition-transform duration-200"
                  >
                    📦 Inventaire
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInventoryModal(true)}
                  className="text-xs sm:text-sm"
                >
                  📊 Détails
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={logout}
                  className="text-xs sm:text-sm"
                >
                  🚪 Sortie
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

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
                        <span className="text-3xl transition-transform group-hover:scale-110 duration-300">{colors.icon}</span>
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
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">📈</span> Analyse des Écarts
              </h3>
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

        {/* ============ SALES HISTORY SECTION ============ */}
        <section className="rounded-xl bg-white shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 sm:p-8 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📋</span> Historique des Ventes
            </h2>
            <p className="text-sm text-gray-600 mt-1">Suivi détaillé de toutes les transactions</p>
          </div>

          <div className="p-6 sm:p-8">
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
