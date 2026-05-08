import React from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const InventoryModal = ({ isOpen, onClose, values, setValues, onSubmit, errors, saving }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inventaire journalier">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Saisissez les stocks restants pour chaque réseau. L’écart sera calculé automatiquement et enregistré.
        </p>

        {['Orange', 'Airtel', 'Vodacom'].map((network) => (
          <div key={network} className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">{network}</label>
            <Input
              type="number"
              min="0"
              value={values[network] ?? ''}
              onChange={(event) => setValues((prev) => ({ ...prev, [network]: Number(event.target.value) }))}
            />
          </div>
        ))}

        {errors && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errors}</div>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button type="button" onClick={onSubmit} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Valider inventaire'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InventoryModal;
