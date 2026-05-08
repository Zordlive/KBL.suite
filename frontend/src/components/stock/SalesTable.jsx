import React from 'react';
import Button from '../../components/ui/Button';

const SalesTable = ({
  sales,
  filters,
  onFiltersChange,
  onPageChange,
  pagination,
  onExportExcel,
  onExportPdf,
  loading,
}) => {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Classeur des ventes</h2>
          <p className="mt-2 text-sm text-slate-600">Recherche, filtres et export Excel / PDF pour l’historique des ventes réseau.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onExportExcel} type="button">Export Excel</Button>
          <Button variant="outline" onClick={onExportPdf} type="button">Export PDF</Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        <input
          type="text"
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Recherche client ou réseau"
          value={filters.search}
          onChange={(event) => onFiltersChange({ ...filters, search: event.target.value, page: 1 })}
        />
        <select
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.network}
          onChange={(event) => onFiltersChange({ ...filters, network: event.target.value, page: 1 })}
        >
          <option value="">Tous les réseaux</option>
          {['Orange', 'Airtel', 'Vodacom'].map((network) => (
            <option key={network} value={network}>{network}</option>
          ))}
        </select>
        <input
          type="date"
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.dateFrom}
          onChange={(event) => onFiltersChange({ ...filters, dateFrom: event.target.value, page: 1 })}
        />
        <input
          type="date"
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.dateTo}
          onChange={(event) => onFiltersChange({ ...filters, dateTo: event.target.value, page: 1 })}
        />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-slate-900">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3">N°</th>
              <th className="border-b border-slate-200 px-4 py-3">Date / heure</th>
              <th className="border-b border-slate-200 px-4 py-3">Réseau</th>
              <th className="border-b border-slate-200 px-4 py-3">Type client</th>
              <th className="border-b border-slate-200 px-4 py-3">Nom client</th>
              <th className="border-b border-slate-200 px-4 py-3">Numéro</th>
              <th className="border-b border-slate-200 px-4 py-3">Quantité</th>
              <th className="border-b border-slate-200 px-4 py-3">Type achat</th>
              <th className="border-b border-slate-200 px-4 py-3">Paiement</th>
              <th className="border-b border-slate-200 px-4 py-3">Stock avant</th>
              <th className="border-b border-slate-200 px-4 py-3">Stock après</th>
              <th className="border-b border-slate-200 px-4 py-3">Nom agent</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="12" className="px-4 py-6 text-center text-sm text-slate-500">Chargement...</td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan="12" className="px-4 py-6 text-center text-sm text-slate-500">Aucune vente trouvée.</td>
              </tr>
            ) : (
              sales.map((sale, index) => (
                <tr key={sale.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                  <td className="px-4 py-3">{pagination.offset + index + 1}</td>
                  <td className="px-4 py-3">{new Date(sale.sale_date).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3">{sale.network}</td>
                  <td className="px-4 py-3">{sale.client_type}</td>
                  <td className="px-4 py-3">{sale.client_name}</td>
                  <td className="px-4 py-3">{sale.client_phone}</td>
                  <td className="px-4 py-3">{sale.quantity}</td>
                  <td className="px-4 py-3">{sale.purchase_type}</td>
                  <td className="px-4 py-3">{sale.payment_method}</td>
                  <td className="px-4 py-3">{sale.stock_before}</td>
                  <td className="px-4 py-3">{sale.stock_after}</td>
                  <td className="px-4 py-3">{sale.user?.name || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <div>
          {pagination.total > 0 ? (
            <span>Affichage {pagination.offset + 1} - {Math.min(pagination.offset + sales.length, pagination.total)} sur {pagination.total}</span>
          ) : <span>0 ventes</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" type="button" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>
            Précédent
          </Button>
          <Button variant="outline" type="button" disabled={pagination.page >= pagination.lastPage} onClick={() => onPageChange(pagination.page + 1)}>
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SalesTable;
