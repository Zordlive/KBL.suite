import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import VerificationModal from '../components/stock/VerificationModal';
import InventoryModal from '../components/stock/InventoryModal';
import SaleModal from '../components/stock/SaleModal';
import SalesTable from '../components/stock/SalesTable';
import DiscrepancyAlertModal from '../components/stock/DiscrepancyAlertModal';

const networks = ['Orange', 'Airtel', 'Vodacom'];

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

      // Afficher automatiquement le modal de vérification si nécessaire
      if (response.data.pendingVerification) {
        setShowCheckModal(true);
      }

      // Afficher l'alerte d'écarts si des écarts existent et ne sont pas résolus
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
      setSuccessMessage('Vente enregistrée et stocks mis à jour.');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erreur lors de l’enregistrement.');
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
        setSuccessMessage('Écarts corrigés et historique des corrections enregistré.');
      } else {
        await api.post('/stock-module/checks', { check_type: checkType, checks });
        setSuccessMessage(
          checkType === 'opening'
            ? 'Vérification d’ouverture enregistrée et comparée à l’inventaire du soir précédent.'
            : 'Inventaire du soir enregistré et comparé au stock courant.',
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
      setSuccessMessage('Inventaire journalier validé et anomalies enregistrées.');
      await loadStocks();
      await loadSummary();
      await loadSales();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Erreur lors de l’enregistrement de l’inventaire.');
    } finally {
      setSavingCheck(false);
    }
  };

  const handleDiscrepancyCorrection = async () => {
    setShowCheckModal(true);
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
    <div className="space-y-6">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Gestion Stock</h1>
            <p className="mt-2 text-sm text-slate-600">Module professionnel de gestion des stocks Orange, Airtel et Vodacom.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">{user?.name}</span>
            {openingStatus.canSubmit && !openingStatus.completed ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setCheckType('opening');
                  setShowCheckModal(true);
                }}
              >
                Vérification d’ouverture
              </Button>
            ) : null}
            {inventoryStatus.canSubmit && !inventoryStatus.completed ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setCheckType('evening');
                  setShowCheckModal(true);
                }}
              >
                Vérification du soir
              </Button>
            ) : null}
            <Button variant="secondary" onClick={() => setShowInventoryModal(true)}>Inventaire</Button>
            <Button variant="secondary" onClick={logout}>Déconnexion</Button>
          </div>
        </div>
      </header>

      {successMessage && (
        <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900 shadow-sm">
          {successMessage}
        </div>
      )}

      {openingStatus.canSubmit || inventoryStatus.canSubmit ? null : (
        <div className="rounded-3xl border-l-4 border-blue-500 bg-blue-50 p-6 text-sm text-blue-900 shadow-sm">
          <strong className="block text-base">Fenêtres de vérification fermées</strong>
          <p>La vérification d’ouverture est disponible entre {openingStatus.cutoffStart} et {openingStatus.cutoffEnd}. L’inventaire du soir est disponible entre {inventoryStatus.cutoffStart} et {inventoryStatus.cutoffEnd}.</p>
        </div>
      )}

      {/* Section Enregistrement */}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Enregistrement</h2>
            <p className="mt-1 text-sm text-slate-600">Enregistrez les ventes et consultez les stocks en temps réel</p>
          </div>
          <Button onClick={() => setShowSaleModal(true)} className="bg-blue-600 hover:bg-blue-700">
            Enregis mouv
          </Button>
        </div>

        {/* Stocks par réseau */}
        <div className="grid gap-4 lg:grid-cols-3 mb-8">
          {stocks.map((stock) => (
            <div key={stock.network} className="rounded-2xl bg-linear-to-br from-slate-50 to-slate-100 p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{stock.network}</h3>
              <p className="text-3xl font-bold text-blue-600">{formatNumber(stock.quantity)}</p>
              <p className="text-sm text-slate-500 mt-1">unités disponibles</p>
            </div>
          ))}
        </div>

        {/* Vente détail - Écarts après inventaire */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Vente détail</h3>
          {inventoryStatus.completed ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {['Orange', 'Airtel', 'Vodacom'].map((network) => {
                const check = todayChecks.find((item) => item.network === network);
                const discrepancy = check ? Math.abs(check.difference) : 0;
                return (
                  <div key={network} className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
                    <h4 className="font-semibold text-slate-900 mb-3">{network}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Stock théorique:</span>
                        <span className="font-medium">{check?.expected_quantity ?? '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Stock inventorié:</span>
                        <span className="font-medium">{check?.counted_quantity ?? '—'}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                        <span className="text-slate-600 font-medium">Écart détecté:</span>
                        <span className={`font-bold ${discrepancy > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {discrepancy > 0 ? `-${discrepancy}` : '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg font-medium">Aucun inventaire effectué aujourd'hui</p>
              <p className="text-sm">Les écarts seront affichés après l'inventaire journalier</p>
            </div>
          )}
        </div>
      </section>

      {/* Section Classeur */}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Classeur</h2>
          <p className="mt-1 text-sm text-slate-600">Historique complet des ventes enregistrées</p>
        </div>

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
      </section>

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
  );
};

export default StockManagement;
