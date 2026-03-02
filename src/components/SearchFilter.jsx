import React from 'react';

const CATEGORIES = ['Todas', 'Trabajo', 'Personal', 'Estudio', 'Importante', 'Otros'];

export default function SearchFilter({
    query,
    onSearchChange,
    filter,
    onFilterChange,
    onClearSearch,
    categoryFilter,
    onCategoryChange
}) {
    const filterOptions = [
        { id: 'all', label: 'Todas las tareas' },
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
                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="filter-group" style={{ marginTop: '12px' }}>
                <div style={{ width: '100%', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Estado
                </div>
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

            <div className="filter-group" style={{ marginTop: '12px' }}>
                <div style={{ width: '100%', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Categoría
                </div>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        className={`filter-btn${categoryFilter === cat ? ' active' : ''}`}
                        onClick={() => onCategoryChange(cat)}
                        style={{ background: categoryFilter === cat ? 'var(--p-blue)' : 'white' }}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </section>
    );
}
