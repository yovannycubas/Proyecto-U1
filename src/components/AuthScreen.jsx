import React, { useState } from 'react';

export default function AuthScreen({ onSignIn, onSignUp, onOAuth }) {
    const [tab, setTab] = useState('login');   // 'login' | 'register'
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    function clear() { setError(''); setSuccess(''); }

    async function handleLogin(e) {
        e.preventDefault();
        if (!email || !pass) return setError('Por favor completa todos los campos.');
        clear();
        setLoading(true);
        const err = await onSignIn(email, pass);
        setLoading(false);
        if (err) setError(err);
    }

    async function handleRegister(e) {
        e.preventDefault();
        if (!email || !pass) return setError('Por favor completa todos los campos.');
        if (pass.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
        clear();
        setLoading(true);
        const err = await onSignUp(email, pass);
        setLoading(false);
        if (err) setError(err);
        else { setSuccess('✅ Revisa tu correo para confirmar tu cuenta.'); setEmail(''); setPass(''); }
    }

    async function handleOAuth(provider) {
        clear();
        setLoading(true);
        const err = await onOAuth(provider);
        if (err) { setLoading(false); setError(err); }
    }

    return (
        <div className="auth-screen">
            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <span className="logo-icon">✦</span>
                    <span className="logo-title-auth">TaskFlow</span>
                </div>
                <p className="auth-subtitle">Gestiona tus tareas en la nube</p>

                {/* Tabs */}
                <div className="auth-tabs" role="tablist">
                    {['login', 'register'].map(t => (
                        <button
                            key={t}
                            role="tab"
                            aria-selected={tab === t}
                            className={`auth-tab${tab === t ? ' active' : ''}`}
                            onClick={() => { setTab(t); clear(); setEmail(''); setPass(''); }}
                        >
                            {t === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form
                    className="auth-form"
                    onSubmit={tab === 'login' ? handleLogin : handleRegister}
                    noValidate
                >
                    <div className="form-group">
                        <label className="form-label" htmlFor="auth-email">Correo electrónico</label>
                        <input
                            id="auth-email"
                            type="email"
                            className="form-input"
                            placeholder="tucorreo@ejemplo.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="auth-pass">
                            Contraseña{' '}
                            {tab === 'register' && <span className="field-hint">(mín. 6 caracteres)</span>}
                        </label>
                        <input
                            id="auth-pass"
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={pass}
                            onChange={e => setPass(e.target.value)}
                            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Cargando...' : tab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </button>
                </form>

                {/* Feedback */}
                {error && <div className="auth-error" role="alert">{error}</div>}
                {success && <div className="auth-success" role="status">{success}</div>}

                {/* OAuth */}
                <div className="auth-divider"><span>o continuar con</span></div>
                <div className="oauth-btns">
                    <button className="btn-oauth btn-oauth-google" onClick={() => handleOAuth('google')} type="button" disabled={loading}>
                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>
                    <button className="btn-oauth btn-oauth-github" onClick={() => handleOAuth('github')} type="button" disabled={loading}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        GitHub
                    </button>
                </div>
            </div>
        </div>
    );
}
