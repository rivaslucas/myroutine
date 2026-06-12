import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', label: 'Mi Día', icon: '📋' },
        { path: '/weekly', label: 'Semanal', icon: '📊' },
        { path: '/monthly', label: 'Mensual', icon: '📆' },
        { path: '/reminders', label: 'Recordatorios', icon: '🔔' },
        { path: '/reports', label: 'Reportes', icon: '📈' },
    ];

    const linkStyle = (active) => ({
        textDecoration: 'none',
        padding: '10px 14px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s',
        backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'transparent',
        color: 'white',
        border: active ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
        width: '100%'
    });

    return (
        <nav style={{
            background: 'linear-gradient(135deg, #1E3A5F 0%, #2D5A8E 50%, #1E3A5F 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderBottom: '3px solid #3B82F6'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 12px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '56px'
                }}>
                    {/* Logo */}
                    <Link to="/dashboard" style={{
                        textDecoration: 'none', color: 'white',
                        display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0
                    }}>
                        <div style={{
                            width: '32px', height: '32px',
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '16px'
                        }}>📋</div>
                        <span className="brand-text" style={{ fontSize: '18px', fontWeight: '700' }}>MiAgenda</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="desktop-nav" style={{ display: 'none' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {navItems.map(item => (
                                <Link key={item.path} to={item.path} style={linkStyle(isActive(item.path))}
                                    onMouseEnter={(e) => { if (!isActive(item.path)) e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                                    onMouseLeave={(e) => { if (!isActive(item.path)) e.target.style.backgroundColor = 'transparent'; }}
                                >
                                    <span style={{ fontSize: '15px' }}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="desktop-user" style={{ display: 'none', alignItems: 'center', gap: '8px', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px' }}>
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                            ) : (
                                <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' }}>
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <span style={{ fontSize: '13px' }}>{user?.name?.split(' ')[0]}</span>
                        </div>

                        <button onClick={logout} className="logout-btn" style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '7px 12px', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px',
                            whiteSpace: 'nowrap'
                        }}>
                            <span>🚪</span> <span className="hide-mobile">Salir</span>
                        </button>

                        <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger-btn" style={{
                            backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                            fontSize: '20px', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer'
                        }}>
                            {menuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div style={{
                        padding: '8px 0 12px 0',
                        borderTop: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex', flexDirection: 'column', gap: '2px'
                    }}>
                        {navItems.map(item => (
                            <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)} style={linkStyle(isActive(item.path))}>
                                <span>{item.icon}</span> <span>{item.label}</span>
                            </Link>
                        ))}
                        <div style={{ padding: '10px 14px', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600' }}>
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{user?.name}</span>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media (min-width: 769px) {
                    .desktop-nav { display: flex !important; }
                    .desktop-user { display: flex !important; }
                    .hamburger-btn { display: none !important; }
                }
                @media (max-width: 768px) {
                    .hide-mobile { display: none; }
                    .brand-text { font-size: 16px !important; }
                }
            `}</style>
        </nav>
    );
}