export default function ProgressBar({ progress, breakdown }) {
    const progressValue = typeof progress === 'number' ? progress : parseFloat(progress) || 0;
    
    const getColor = () => {
        if (progressValue >= 80) return '#10B981';
        if (progressValue >= 50) return '#F59E0B';
        return '#EF4444';
    };

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '14px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: '600', color: '#374151', fontSize: '15px' }}>
                    Progreso del día
                </span>
                <span style={{ fontWeight: '700', fontSize: '22px', color: getColor() }}>
                    {progressValue.toFixed(1)}%
                </span>
            </div>
            
            <div style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#E5E7EB',
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '8px'
            }}>
                <div style={{
                    width: `${Math.min(progressValue, 100)}%`,
                    height: '100%',
                    backgroundColor: getColor(),
                    borderRadius: '10px',
                    transition: 'width 0.6s ease'
                }} />
            </div>
            
            {breakdown && (
                <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#6B7280', flexWrap: 'wrap' }}>
                    <span>📋 {breakdown.daily?.completed || 0}/{breakdown.daily?.total || 0} diarias</span>
                    <span>📊 {breakdown.weekly?.completed || 0}/{breakdown.weekly?.total || 0} semanales</span>
                    <span>📆 {breakdown.monthly?.completed || 0}/{breakdown.monthly?.total || 0} mensuales</span>
                </div>
            )}
            
            {progressValue === 100 && (
                <p style={{ color: '#10B981', fontWeight: '600', textAlign: 'center', marginTop: '8px' }}>
                    🎉 ¡Todas las tareas completadas!
                </p>
            )}
        </div>
    );
}