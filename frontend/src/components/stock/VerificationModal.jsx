import React from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const VerificationModal = ({
  isOpen,
  onClose,
  counts,
  setCounts,
  onSubmit,
  isAdmin,
  isReviewMode,
  checkType,
  errors,
  saving,
}) => {
  const title = isReviewMode
    ? 'Correction d’écart'
    : checkType === 'opening'
    ? 'Vérification d’ouverture'
    : 'Vérification du soir';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Saisissez les stocks restants par réseau. La comparaison avec le dernier inventaire sera faite automatiquement.
        </p>

        {['Orange', 'Airtel', 'Vodacom'].map((network) => (
          <div key={network} className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">{network}</label>
            <Input
              type="number"
              min="0"
              value={counts[network] ?? ''}
              disabled={isReviewMode && !isAdmin}
              onChange={(event) => setCounts((prev) => ({ ...prev, [network]: Number(event.target.value) }))}
            />
          </div>
        ))}

        {errors && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errors}</div>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Fermer
          </Button>
          <Button type="button" onClick={onSubmit} disabled={saving || (!isAdmin && isReviewMode)}>
            {saving ? 'Enregistrement...' : isReviewMode ? 'Valider la correction' : 'Valider'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default VerificationModal;
