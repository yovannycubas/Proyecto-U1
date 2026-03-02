import React from 'react';

export default function SearchFilter({ query, onSearchChange, filter, onFilterChange, onClearSearch }) {
    const filterOptions = [
        { id: 'all', label: 'Todas' },
        { id: 'pending', label: 'Pendientes' },
        { id: 'completed', label: 'Completadas' }
    ];

    return (
        <section className="controls" aria-label="Búsqueda y filtros">
            <div className="search-wrapper">
                <span className="search-icon" aria-hidden="true">🔍</span>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar por título o descripción..."
                    value={query}
                    onChange={(e) => onSearchChange(e.target.value)}
                    aria-label="Buscar tareas"
                />
                {query && (
                    <button
                        className="btn-clear"
                        onClick={onClearSearch}
                        aria-label="Limpiar búsqueda"
                    >
                        ✕
                    </button>
                )}
            </div>
            <div className="filter-group" role="group" aria-label="Filtrar por estado">
                {filterOptions.map((opt) => (
                    <button
                        key={opt.id}
                        className={`filter-btn${filter === opt.id ? ' active' : ''}`}
                        onClick={() => onFilterChange(opt.id)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </section>
    );
}
