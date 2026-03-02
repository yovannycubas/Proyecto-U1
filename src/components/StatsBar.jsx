import React from 'react';

export default function StatsBar({ tasks }) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    return (
        <section className="stats-bar" aria-label="Resumen de tareas">
            <div className="stat-card">
                <span className="stat-number">{total}</span>
                <span className="stat-label">Total</span>
            </div>
            <div className="stat-card accent-pending">
                <span className="stat-number">{pending}</span>
                <span className="stat-label">Pendientes</span>
            </div>
            <div className="stat-card accent-done">
                <span className="stat-number">{completed}</span>
                <span className="stat-label">Completadas</span>
            </div>
        </section>
    );
}
