import React, { useState, useEffect } from 'react';

const CATEGORIES = ['General', 'Trabajo', 'Personal', 'Estudio', 'Importante', 'Otros'];

export default function TaskModal({ task, isOpen, onClose, onSave }) {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [category, setCategory] = useState('General');
    const [dueDate, setDueDate] = useState('');

    const [errorTitle, setErrorTitle] = useState('');
    const [errorDesc, setErrorDesc] = useState('');

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDesc(task.description || '');
            setCategory(task.category || 'General');
            // Format date for input type="date" (YYYY-MM-DD)
            if (task.due_date) {
                setDueDate(new Date(task.due_date).toISOString().split('T')[0]);
            } else {
                setDueDate('');
            }
        } else {
            setTitle('');
            setDesc('');
            setCategory('General');
            setDueDate('');
        }
        setErrorTitle('');
        setErrorDesc('');
    }, [task, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        let valid = true;

        if (!title.trim()) {
            setErrorTitle('El título es obligatorio.');
            valid = false;
        } else {
            setErrorTitle('');
        }

        if (!desc.trim()) {
            setErrorDesc('La descripción es obligatoria.');
            valid = false;
        } else {
            setErrorDesc('');
        }

        if (!valid) return;

        onSave({
            id: task?.id,
            title: title.trim(),
            description: desc.trim(),
            category,
            due_date: dueDate || null
        });
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-card">
                <div className="modal-header">
                    <h2 className="modal-heading">{task ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
                    <button className="btn-icon-close" onClick={onClose} aria-label="Cerrar modal">✕</button>
                </div>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label className="form-label" htmlFor="task-title">Título <span className="required">*</span></label>
                        <input
                            type="text"
                            id="task-title"
                            className={`form-input${errorTitle ? ' error' : ''}`}
                            placeholder="Ej: Revisar informe mensual"
                            maxLength="80"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        {errorTitle && <span className="field-error" role="alert">{errorTitle}</span>}
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="task-category">Categoría</label>
                            <select
                                id="task-category"
                                className="form-input"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="task-due-date">Vencimiento</label>
                            <input
                                type="date"
                                id="task-due-date"
                                className="form-input"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="task-desc">Descripción <span className="required">*</span></label>
                        <textarea
                            id="task-desc"
                            className={`form-input${errorDesc ? ' error' : ''}`}
                            placeholder="Describe los detalles de la tarea..."
                            rows="3"
                            maxLength="300"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            required
                        />
                        {errorDesc && <span className="field-error" role="alert">{errorDesc}</span>}
                        <span className="char-count">{desc.length} / 300</span>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">
                            {task ? 'Actualizar Tarea' : 'Guardar Tarea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
