import React from 'react';

export default function StatsBar({ tasks, profile }) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    const points = profile?.total_points || 0;
    const level = profile?.level || 1;

    return (
        <section className="stats-bar" aria-label="Estadísticas de tareas y progreso">
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
            {/* Gamification Stats */}
            <div className="stat-card accent-points" style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: 'var(--p-purple)', color: 'white' }}>
                <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '0.8rem', opacity: 0.9, textTransform: 'uppercase' }}>Nivel {level}</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>🏆 {points} Puntos</div>
                </div>
                <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', margin: '0 20px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ width: `${points % 100}%`, height: '100%', background: 'white', transition: 'width 0.5s ease' }}></div>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{100 - (points % 100)} pts para sig. nivel</div>
            </div>
        </section>
    );
}
