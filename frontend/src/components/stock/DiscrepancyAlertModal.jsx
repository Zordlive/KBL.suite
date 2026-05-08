import React from 'react';
import Modal from '../../components/ui/Modal';

const DiscrepancyAlertModal = ({ isOpen, onClose, discrepancies, isAdmin }) => {
  if (!isOpen || !discrepancies || discrepancies.length === 0) return null;

  const totalDiscrepancy = discrepancies.reduce((sum, disc) => sum + Math.abs(disc.difference), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚠️ Écart détecté dans les stocks"
      className="border-red-200 bg-red-50"
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-red-100 p-4 border border-red-200">
          <div className="flex items-center">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Écart total détecté : {totalDiscrepancy} unités
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Un écart a été détecté entre les stocks déclarés et l'inventaire. Veuillez contacter l'administrateur pour correction.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Détails par réseau :</h4>
          {discrepancies.map((discrepancy, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-200">
              <div>
                <span className="font-medium text-gray-900">{discrepancy.network}</span>
                <div className="text-sm text-gray-600">
                  Déclaré: {discrepancy.counted_quantity} | Attendu: {discrepancy.expected_quantity}
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold ${discrepancy.difference < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {discrepancy.difference > 0 ? '+' : ''}{discrepancy.difference}
                </span>
                <div className="text-xs text-gray-500">écart</div>
              </div>
            </div>
          ))}
        </div>

        {!isAdmin && (
          <div className="rounded-lg bg-yellow-50 p-3 border border-yellow-200">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Action requise :</strong> Cet écart doit être corrigé par un administrateur.
                  Les opérations peuvent continuer mais l'écart persistera jusqu'à correction.
                </p>
              </div>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Administrateur :</strong> Vous pouvez corriger cet écart via la section d'administration
              ou en effectuant un nouvel inventaire.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DiscrepancyAlertModal;