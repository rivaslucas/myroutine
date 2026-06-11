import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navItems = [
        { path: '/dashboard', label: 'Mi Día', icon: '📋' },
        { path: '/weekly', label: 'Semanal', icon: '📊' },
        { path: '/monthly', label: 'Mensual', icon: '📆' },
        { path: '/reminders', label: 'Recordatorios', icon: '🔔' },
        { path: '/reports', label: 'Reportes', icon: '📈' },
    ];

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
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '64px'
                }}>
                    {/* Logo y marca */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <Link to="/dashboard" style={{
                            textDecoration: 'none',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <div style={{
                                width: '38px',
                                height: '38px',
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px'
                            }}>
                                📋
                            </div>
                            <span style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                letterSpacing: '-0.5px'
                            }}>
                                MiAgenda
                            </span>
                        </Link>

                        {/* Links de navegación */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    style={{
                                        textDecoration: 'none',
                                        padding: '8px 14px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: isActive(item.path) 
                                            ? 'rgba(255,255,255,0.2)' 
                                            : 'transparent',
                                        color: 'white',
                                        border: isActive(item.path) 
                                            ? '1px solid rgba(255,255,255,0.3)' 
                                            : '1px solid transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive(item.path)) {
                                            e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive(item.path)) {
                                            e.target.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                                    <span>{item.label}</span>
                                    {isActive(item.path) && (
                                        <div style={{
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: '#60A5FA',
                                            borderRadius: '50%',
                                            marginLeft: '2px'
                                        }} />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Usuario y logout */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '6px 14px',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '30px'
                        }}>
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.name}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        border: '2px solid rgba(255,255,255,0.5)'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: '#3B82F6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                {user?.name?.split(' ')[0] || 'Usuario'}
                            </span>
                        </div>
                        
                        <button
                            onClick={logout}
                            style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                color: '#FCA5A5',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.4)';
                                e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                                e.target.style.color = '#FCA5A5';
                            }}
                        >
                            <span>🚪</span> Salir
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}