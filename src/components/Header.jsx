import React from 'react';

export default function Header({ user, onAddTask, onLogout }) {
    const initials = user?.email?.[0]?.toUpperCase() ?? 'U';

    return (
        <header className="header">
            <div className="header-inner">
                {/* Logo */}
                <div className="logo">
                    <span className="logo-icon">✦</span>
                    <h1 className="logo-title">TaskFlow</h1>
                </div>

                {/* Right side: user info + actions */}
                <div className="header-right">
                    <div className="user-info" aria-label={`Sesión de ${user?.email}`}>
                        <div className="user-avatar" aria-hidden="true">{initials}</div>
                        <span className="user-email">{user?.email}</span>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={onAddTask}
                        aria-label="Agregar nueva tarea"
                    >
                        <span aria-hidden="true">+</span> Nueva Tarea
                    </button>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={onLogout}
                        aria-label="Cerrar sesión"
                    >
                        ↩ Salir
                    </button>
                </div>
            </div>
        </header>
    );
}
