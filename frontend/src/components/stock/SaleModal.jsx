import React from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const networks = ['Orange', 'Airtel', 'Vodacom'];
const clientTypes = ['client', 'revendeur'];
const purchaseTypes = ['gros', 'détail'];
const paymentMethods = ['payé en totalité', 'payé en moitié', 'en prêt'];

const SaleModal = ({ isOpen, onClose, form, setForm, onSubmit, errors, saving }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enregis mouv">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            Type client
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.clientType}
              onChange={(event) => setForm((prev) => ({ ...prev, clientType: event.target.value }))}
            >
              {clientTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Réseau
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.network}
              onChange={(event) => setForm((prev) => ({ ...prev, network: event.target.value }))}
            >
              {networks.map((network) => (
                <option key={network} value={network}>{network}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Nom client
            <Input
              value={form.clientName}
              onChange={(event) => setForm((prev) => ({ ...prev, clientName: event.target.value }))}
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Numéro client
            <Input
              value={form.clientPhone}
              onChange={(event) => setForm((prev) => ({ ...prev, clientPhone: event.target.value }))}
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Quantité
            <Input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(event) => setForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))}
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Type achat
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.purchaseType}
              onChange={(event) => setForm((prev) => ({ ...prev, purchaseType: event.target.value }))}
            >
              {purchaseTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Paiement
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.paymentMethod}
              onChange={(event) => setForm((prev) => ({ ...prev, paymentMethod: event.target.value }))}
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </label>
        </div>

        {errors && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errors}</div>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button type="button" onClick={onSubmit} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Valider la vente'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SaleModal;
