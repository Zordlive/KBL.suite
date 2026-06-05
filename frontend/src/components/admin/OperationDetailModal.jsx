import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import './OperationDetailModal.css';

const OperationDetailModal = ({ isOpen, onClose, operation, operationType, onModify, saving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);

  if (!isOpen || !operation) return null;

  const isSale = operationType === 'sale';

  const handleEditStart = () => {
    setEditedData(isSale ? {
      client_name: operation.client_name,
      client_phone: operation.client_phone,
      quantity: operation.quantity,
      payment_method: operation.payment_method,
      stock_before: operation.stock_before,
      stock_after: operation.stock_after,
    } : {
      counted_quantity: operation.counted_quantity,
      resolved: operation.resolved,
    });
    setIsEditing(true);
  };

  const handleEditChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    await onModify(operation.id, editedData, operationType);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(null);
  };

  return (
    <div className="operation-modal-overlay" onClick={onClose}>
      <div className="operation-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="operation-modal-header">
          <div>
            <h2 className="operation-modal-title">
              {isSale ? '📋 Détails de la Vente' : '📦 Détails de l\'Inventaire'}
            </h2>
            <p className="operation-modal-subtitle">
              {isEditing ? 'Mode édition - Modifiez les informations' : 'Mode consultation'}
            </p>
          </div>
          <button className="operation-modal-close" onClick={onClose}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="operation-modal-content">
          {isSale ? (
            // Sale Details
            <div className="operation-details-grid">
              <div className="operation-detail-group">
                <label className="operation-detail-label">Réseau</label>
                <div className="operation-detail-value">{operation.network}</div>
              </div>

              <div className="operation-detail-group">
                <label className="operation-detail-label">Type de Client</label>
                <div className="operation-detail-value">{operation.client_type}</div>
              </div>

              <div className="operation-detail-group">
                <label className="operation-detail-label">Nom du Client</label>
                {isEditing ? (
                  <Input
                    value={editedData.client_name}
                    onChange={(e) => handleEditChange('client_name', e.target.value)}
                    placeholder="Nom du client"
                  />
                ) : (
                  <div className="operation-detail-value">{operation.client_name}</div>
                )}
              </div>

              <div className="operation-detail-group">
                <label className="operation-detail-label">Numéro Client</label>
                {isEditing ? (
                  <Input
                    value={editedData.client_phone}
                    maxLength="10"
                    onChange={(e) => handleEditChange('client_phone', e.target.value)}
                    placeholder="Numéro de client"
                  />
                ) : (
                  <div className="operation-detail-value">{operation.client_phone}</div>
                )}
              </div>

              <div className="operation-detail-group">
                <label className="operation-detail-label">Quantité</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedData.quantity}
                    onChange={(e) => handleEditChange('quantity', e.target.value)}
                    placeholder="Quantité"
                  />
                ) : (
                  <div className="operation-detail-value">{operation.quantity}</div>
                )}
              </div>

              <div className="operation-detail-group">
                <label className="operation-detail-label">Type d'Achat</label>
                <div className="operation-detail-value">{operation.purchase_type}</div>
              </div>

              <div className="operation-detail-group">
                <label className="operation-detail-label">Méthode de Paiement</label>
                {isEditing ? (
                  <select
                    value={editedData.payment_method}
                    onChange={(e) => handleEditChange('payment_method', e.target.value)}
                    className="operation-detail-select"
                  >
                    <option value="payé en totalité">Payé en totalité</option>
                    <option value="payé en moitié">Payé en moitié</option>
                    <option value="en prêt">En prêt</option>
                  </select>
                ) : (
                  <div className="operation-detail-value">{operation.payment_method}</div>
                )}
              </div>

              <div className="operation-detail-group">
                <label className="operation-detail-label">Stock Avant</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedData.stock_before}
                    onChange={(e) => handleEditChange('stock_before', e.target.value)}
                    placeholder="Stock avant"
                  />
                ) : (
                  <div className="operation-detail-value">{operation.stock_before}</div>
                )}
              </div>

              <div className="operation-detail-group">
                <label className="operation-detail-label">Stock Après</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedData.stock_after}
                    onChange={(e) => handleEditChange('stock_after', e.target.value)}
                    placeholder="Stock après"
                  />
                ) : (
                  <div className="operation-detail-value">{operation.stock_after}</div>
                )}
              </div>

              <div className="operation-detail-group">
                <label className="operation-detail-label">Agent</label>
                <div className="operation-detail-value">{operation.user?.name}</div>
              </div>

              <div className="operation-detail-group">
                <label className="operation-detail-label">Date</label>
                <div className="operation-detail-value">
                  {new Date(operation.sale_date).toLocaleString('fr-FR')}
                </div>
              </div>
            </div>
          ) : (
            // Inventory Details
            <div className="operation-details-grid">
              <div className="operation-detail-group">
                <label className="operation-detail-label">Réseau</label>
                <div className="operation-detail-value">{operation.network}</div>
              </div>

              <div className="operation-detail-group">
                <label className="operation-detail-label">Type de Vérification</label>
                <div className="operation-detail-value">
                  {operation.check_type === 'opening' ? 'Ouverture' : 'Inventaire du soir'}
                </div>
              </div>

              <div className="operation-detail-group">
                <label className="operation-detail-label">Quantité Comptée</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedData.counted_quantity}
                    onChange={(e) => handleEditChange('counted_quantity', e.target.value)}
                    placeholder="Quantité comptée"
                  />
                ) : (
                  <div className="operation-detail-value">{operation.counted_quantity}</div>
                )}
              </div>

              <div className="operation-detail-group">
                <label className="operation-detail-label">Quantité Attendue</label>
                <div className="operation-detail-value">{operation.expected_quantity}</div>
              </div>

              <div className={`operation-detail-group operation-difference ${operation.difference === 0 ? 'no-difference' : operation.difference > 0 ? 'positive-difference' : 'negative-difference'}`}>
                <label className="operation-detail-label">Différence</label>
                <div className="operation-detail-value-difference">
                  {operation.difference > 0 ? '+' : ''}{operation.difference}
                </div>
              </div>

              <div className="operation-detail-group">
                <label className="operation-detail-label">Statut</label>
                {isEditing ? (
                  <select
                    value={editedData.resolved ? 'true' : 'false'}
                    onChange={(e) => handleEditChange('resolved', e.target.value === 'true')}
                    className="operation-detail-select"
                  >
                    <option value="false">En attente</option>
                    <option value="true">✓ Résolu</option>
                  </select>
                ) : (
                  <div className={`operation-detail-badge ${operation.resolved ? 'resolved' : 'pending'}`}>
                    {operation.resolved ? '✓ Résolu' : 'En attente'}
                  </div>
                )}
              </div>

              <div className="operation-detail-group">
                <label className="operation-detail-label">Agent</label>
                <div className="operation-detail-value">{operation.user?.name}</div>
              </div>

              <div className="operation-detail-group col-span-2">
                <label className="operation-detail-label">Date et Heure</label>
                <div className="operation-detail-value">
                  {new Date(operation.checked_at).toLocaleString('fr-FR')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="operation-modal-actions">
          {!isEditing ? (
            <>
              <Button variant="secondary" onClick={onClose}>
                Fermer
              </Button>
              <Button variant="primary" onClick={handleEditStart}>
                ✏️ Modifier l'Opération
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                Annuler
              </Button>
              <Button variant="primary" onClick={handleSaveEdit} disabled={saving}>
                {saving ? 'Enregistrement...' : '✓ Enregistrer les Modifications'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperationDetailModal;
