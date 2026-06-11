import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const { login } = useAuth();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1E3A5F 0%, #2D5A8E 30%, #4F46E5 70%, #7C3AED 100%)',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {/* Círculos decorativos de fondo */}
            <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.03)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-150px',
                left: '-50px',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.03)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.02)',
                pointerEvents: 'none'
            }} />

            {/* Contenedor principal */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '48px 40px',
                width: '440px',
                maxWidth: '90%',
                boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
                position: 'relative',
                zIndex: 1,
                textAlign: 'center'
            }}>
                
                {/* Logo / Icono */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 10px 30px rgba(79, 70, 229, 0.3)'
                }}>
                    <span style={{ fontSize: '40px' }}>📋</span>
                </div>

                {/* Título */}
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    color: '#1F2937',
                    margin: '0 0 8px 0',
                    letterSpacing: '-0.5px'
                }}>
                    MiAgenda
                </h1>
                
                {/* Subtítulo */}
                <p style={{
                    fontSize: '16px',
                    color: '#6B7280',
                    margin: '0 0 32px 0',
                    lineHeight: '1.5'
                }}>
                    Organiza tu rutina diaria, semanal y mensual<br />
                    en un solo lugar
                </p>

                {/* Separador decorativo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '32px'
                }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
                    <span style={{ color: '#D1D5DB', fontSize: '13px', fontWeight: '500' }}>
                        INICIAR SESIÓN
                    </span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
                </div>

                {/* Botón de Google */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '28px',
                    transform: 'scale(1.15)',
                    transformOrigin: 'center'
                }}>
                    <GoogleLogin
                        onSuccess={credentialResponse => {
                            login(credentialResponse.credential);
                        }}
                        onError={() => {
                            console.log('Login Failed');
                        }}
                        size="large"
                        shape="pill"
                        text="signin_with"
                        theme="outline"
                    />
                </div>

                {/* Características */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    textAlign: 'left',
                    marginTop: '8px'
                }}>
                    {[
                        { icon: '✅', text: 'Tareas diarias', desc: 'Seguimiento hora a hora' },
                        { icon: '📊', text: 'Plan semanal', desc: 'Organiza tu semana' },
                        { icon: '📆', text: 'Vista mensual', desc: 'Planifica el mes' },
                        { icon: '🔔', text: 'Recordatorios', desc: 'Pagos y citas' },
                        { icon: '📈', text: 'Reportes', desc: 'Progreso semanal' },
                        { icon: '🔄', text: 'Recurrencia', desc: 'Tareas automáticas' }
                    ].map((feature, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '10px',
                                backgroundColor: '#F9FAFB',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#F3F4F6';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#F9FAFB';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <span style={{ fontSize: '20px', flexShrink: 0, marginTop: '1px' }}>
                                {feature.icon}
                            </span>
                            <div>
                                <div style={{ 
                                    fontSize: '13px', 
                                    fontWeight: '600', 
                                    color: '#374151',
                                    marginBottom: '2px'
                                }}>
                                    {feature.text}
                                </div>
                                <div style={{ 
                                    fontSize: '11px', 
                                    color: '#9CA3AF'
                                }}>
                                    {feature.desc}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: '28px',
                    paddingTop: '20px',
                    borderTop: '1px solid #F3F4F6'
                }}>
                    <p style={{
                        fontSize: '12px',
                        color: '#D1D5DB',
                        margin: 0
                    }}>
                        🔒 Inicio de sesión seguro con Google
                    </p>
                    <p style={{
                        fontSize: '11px',
                        color: '#E5E7EB',
                        margin: '4px 0 0 0'
                    }}>
                        Tus datos están protegidos
                    </p>
                </div>
            </div>
        </div>
    );
}