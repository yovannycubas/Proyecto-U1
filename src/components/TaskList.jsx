import React from 'react';
import TaskCard from './TaskCard';

export default function TaskList({ tasks, query, onToggle, onEdit, onDelete }) {
    if (tasks.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon" aria-hidden="true">📋</div>
                <p className="empty-title">No hay tareas aquí</p>
                <p className="empty-sub">Agrega una nueva tarea o cambia el filtro</p>
            </div>
        );
    }

    return (
        <section className="task-section" aria-label="Lista de tareas">
            <div className="task-list">
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        query={query}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </section>
    );
}
