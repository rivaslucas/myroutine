import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const { login } = useAuth();

    return (
        <div style={{
            minHeight: '100vh', minHeight: '100dvh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1E3A5F 0%, #2D5A8E 30%, #4F46E5 70%, #7C3AED 100%)',
            padding: '16px', position: 'relative', overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
            <div style={{ position: 'absolute', bottom: '-60px', left: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

            <div style={{
                backgroundColor: 'white', borderRadius: '20px',
                padding: 'clamp(24px, 5vw, 40px)', width: '100%', maxWidth: '400px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                textAlign: 'center', position: 'relative', zIndex: 1
            }}>
                <div style={{
                    width: 'clamp(50px, 10vw, 70px)', height: 'clamp(50px, 10vw, 70px)',
                    borderRadius: '16px', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)'
                }}>
                    <span style={{ fontSize: 'clamp(24px, 5vw, 34px)' }}>📋</span>
                </div>

                <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: '800', color: '#1F2937', margin: '0 0 4px 0' }}>
                    MiAgenda
                </h1>
                <p style={{ fontSize: 'clamp(13px, 2.5vw, 15px)', color: '#6B7280', margin: '0 0 20px 0', lineHeight: '1.4' }}>
                    Organiza tu rutina diaria, semanal y mensual en un solo lugar
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
                    <span style={{ color: '#D1D5DB', fontSize: '11px', fontWeight: '500' }}>INICIAR SESIÓN</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <GoogleLogin
                        onSuccess={credentialResponse => login(credentialResponse.credential)}
                        onError={() => console.log('Login Failed')}
                        size="large" shape="pill" text="signin_with" theme="outline"
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', textAlign: 'left' }}>
                    {[
                        { icon: '✅', text: 'Tareas diarias' },
                        { icon: '📊', text: 'Plan semanal' },
                        { icon: '📆', text: 'Vista mensual' },
                        { icon: '🔔', text: 'Recordatorios' },
                        { icon: '📈', text: 'Reportes' },
                        { icon: '🔄', text: 'Recurrencia' }
                    ].map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '8px', backgroundColor: '#F9FAFB', fontSize: '12px' }}>
                            <span style={{ fontSize: '14px' }}>{f.icon}</span>
                            <span style={{ fontWeight: '500', color: '#374151' }}>{f.text}</span>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
                    <p style={{ fontSize: '10px', color: '#D1D5DB', margin: 0 }}>🔒 Inicio de sesión seguro con Google</p>
                </div>
            </div>
        </div>
    );
}