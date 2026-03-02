import React from 'react';

export default function ConfirmModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-card modal-sm">
                <div className="modal-header">
                    <h2 className="modal-heading">Eliminar Tarea</h2>
                </div>
                <p className="confirm-text">¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.</p>
                <div className="modal-actions">
                    <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-danger" onClick={onConfirm}>Eliminar</button>
                </div>
            </div>
        </div>
    );
}
