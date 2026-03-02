import React from 'react';

export default function TaskCard({ task, query, onToggle, onEdit, onDelete }) {
    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const escapeHtml = (str) => {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    const highlightText = (text, q) => {
        if (!q) return escapeHtml(text);
        const escaped = escapeHtml(text);
        const escapedQ = escapeHtml(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const parts = escaped.split(new RegExp(`(${escapedQ})`, 'gi'));
        return (
            <>
                {parts.map((part, i) =>
                    part.toLowerCase() === q.toLowerCase() ? (
                        <mark key={i} style={{ background: 'rgba(124,92,252,0.35)', borderRadius: '2px', color: 'inherit' }}>
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </>
        );
    };

    const badgeClass = task.completed ? 'badge-completed' : 'badge-pending';
    const badgeLabel = task.completed ? 'Completada' : 'Pendiente';
    const dateLabel = `Creada el ${formatDate(task.created_at)}`;
    const checkLabel = task.completed ? 'Marcar como pendiente' : 'Marcar como completada';

    return (
        <div className={`task-card${task.completed ? ' completed' : ''}`} role="article">
            <div
                className="task-checkbox"
                role="checkbox"
                aria-checked={task.completed}
                aria-label={checkLabel}
                tabIndex="0"
                onClick={() => onToggle(task.id)}
                onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        onToggle(task.id);
                    }
                }}
            />
            <div className="task-content">
                <div className="task-title">{highlightText(task.title, query)}</div>
                <div className="task-desc">{highlightText(task.description, query)}</div>
                <div className="task-meta">
                    <span className={`task-badge ${badgeClass}`}>{badgeLabel}</span>
                    <span className="task-date">{dateLabel}</span>
                </div>
            </div>
            <div className="task-actions">
                <button
                    className="action-btn edit"
                    onClick={() => onEdit(task)}
                    aria-label="Editar tarea"
                >
                    ✏️
                </button>
                <button
                    className="action-btn delete"
                    onClick={() => onDelete(task.id)}
                    aria-label="Eliminar tarea"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
}
