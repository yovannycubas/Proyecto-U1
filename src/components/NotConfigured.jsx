import React from 'react';

export default function NotConfigured() {
    return (
        <div className="not-configured-overlay">
            <div className="not-configured-card">
                <div className="auth-logo" style={{ marginBottom: '12px' }}>
                    <span className="logo-icon">✦</span>
                    <span className="logo-title-auth">TaskFlow</span>
                </div>
                <h2 className="nc-title">⚙️ Configuración pendiente</h2>
                <p className="nc-text">
                    Para usar la app debes configurar tus credenciales de Supabase.
                </p>
                <ol className="nc-steps">
                    <li>
                        Crea un proyecto en{' '}
                        <a href="https://supabase.com" target="_blank" rel="noreferrer">
                            supabase.com
                        </a>
                    </li>
                    <li>
                        Copia el archivo <code>.env.example</code> como <code>.env</code>
                    </li>
                    <li>
                        Pega tu <strong>Project URL</strong> y <strong>Anon Key</strong>{' '}
                        en el archivo <code>.env</code>
                    </li>
                    <li>
                        Reinicia el servidor con <code>npm run dev</code>
                    </li>
                </ol>
                <div className="nc-code">
                    <pre>{`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co\nVITE_SUPABASE_ANON_KEY=tu-anon-key`}</pre>
                </div>
            </div>
        </div>
    );
}
