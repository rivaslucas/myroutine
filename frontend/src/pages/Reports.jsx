import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const response = await api.get('/planner/report');
            if (response.data.success) {
                setReports(response.data.reports || []);
            }
        } catch (error) {
            console.error('Error cargando reportes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getProgressColor = (rate) => {
        if (rate >= 80) return '#10B981';
        if (rate >= 50) return '#F59E0B';
        return '#EF4444';
    };

    const getEmoji = (rate) => {
        if (rate >= 90) return '🌟';
        if (rate >= 70) return '👍';
        if (rate >= 50) return '💪';
        return '📉';
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh' 
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
                    <p style={{ color: '#6B7280', fontSize: '16px' }}>Cargando reportes...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            
            {/* Cabecera */}
            <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '24px'
            }}>
                <h1 style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#1F2937',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span>📊</span> Reportes Semanales
                </h1>
                <p style={{ color: '#6B7280', marginTop: '8px' }}>
                    Seguimiento de tu progreso semanal. Los reportes se generan automáticamente cada domingo.
                </p>
            </div>

            {reports.length === 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '60px 40px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '60px', marginBottom: '16px' }}>📅</div>
                    <h2 style={{ fontSize: '22px', color: '#374151', marginBottom: '8px' }}>
                        No hay reportes todavía
                    </h2>
                    <p style={{ color: '#9CA3AF', fontSize: '15px', maxWidth: '400px', margin: '0 auto' }}>
                        Completa tus tareas durante la semana y el domingo se generará tu primer reporte automáticamente.
                    </p>
                    <button
                        onClick={loadReports}
                        style={{
                            marginTop: '20px',
                            padding: '12px 24px',
                            backgroundColor: '#4F46E5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        🔄 Actualizar
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {reports.map((report, index) => {
                        const dailyData = report.daily_breakdown ? 
                            (typeof report.daily_breakdown === 'string' ? 
                                JSON.parse(report.daily_breakdown) : 
                                report.daily_breakdown) : [];
                        
                        const color = getProgressColor(report.completion_rate);
                        const rate = parseFloat(report.completion_rate) || 0;
                        
                        return (
                            <div
                                key={index}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    padding: '28px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    border: index === 0 ? '2px solid #4F46E5' : '1px solid #E5E7EB'
                                }}
                            >
                                {/* Cabecera del reporte */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '20px'
                                }}>
                                    <div>
                                        <h3 style={{
                                            fontSize: '20px',
                                            fontWeight: '700',
                                            color: '#1F2937',
                                            margin: 0
                                        }}>
                                            Semana del {new Date(report.week_start).toLocaleDateString('es-AR', {
                                                day: 'numeric',
                                                month: 'long'
                                            })}
                                        </h3>
                                        <p style={{
                                            color: '#6B7280',
                                            fontSize: '14px',
                                            marginTop: '4px'
                                        }}>
                                            {report.completed_tasks} de {report.total_tasks} tareas completadas
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '40px' }}>
                                            {getEmoji(rate)}
                                        </div>
                                        <div style={{
                                            fontSize: '32px',
                                            fontWeight: 'bold',
                                            color: color,
                                            lineHeight: '1'
                                        }}>
                                            {rate}%
                                        </div>
                                    </div>
                                </div>

                                {/* Barra de progreso principal */}
                                <div style={{
                                    width: '100%',
                                    height: '28px',
                                    backgroundColor: '#F3F4F6',
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                    marginBottom: '24px',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        width: `${Math.min(rate, 100)}%`,
                                        height: '100%',
                                        backgroundColor: color,
                                        borderRadius: '14px',
                                        transition: 'width 0.8s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '13px',
                                        minWidth: rate > 10 ? 'auto' : '0'
                                    }}>
                                        {rate > 15 && `${rate}%`}
                                    </div>
                                </div>

                                {/* Desglose diario */}
                                {dailyData.length > 0 && (
                                    <div>
                                        <h4 style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            marginBottom: '12px'
                                        }}>
                                            Desglose por día
                                        </h4>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(7, 1fr)',
                                            gap: '10px'
                                        }}>
                                            {dailyData.map((day, j) => {
                                                const dayRate = day.total > 0 ? 
                                                    (day.completed / day.total) * 100 : 0;
                                                const date = new Date(day.task_date + 'T00:00:00');
                                                const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                                                const dayColor = getProgressColor(dayRate);
                                                
                                                return (
                                                    <div key={j} style={{
                                                        textAlign: 'center',
                                                        backgroundColor: '#F9FAFB',
                                                        borderRadius: '10px',
                                                        padding: '12px 8px'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            color: '#6B7280',
                                                            marginBottom: '6px'
                                                        }}>
                                                            {dayNames[date.getDay()]}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '11px',
                                                            color: '#9CA3AF',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {date.getDate()}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '16px',
                                                            fontWeight: 'bold',
                                                            color: dayColor,
                                                            marginBottom: '6px'
                                                        }}>
                                                            {day.completed}/{day.total}
                                                        </div>
                                                        <div style={{
                                                            height: '6px',
                                                            backgroundColor: '#E5E7EB',
                                                            borderRadius: '3px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                height: '100%',
                                                                width: `${dayRate}%`,
                                                                backgroundColor: dayColor,
                                                                borderRadius: '3px',
                                                                transition: 'width 0.5s'
                                                            }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Resumen */}
                                <div style={{
                                    marginTop: '20px',
                                    paddingTop: '16px',
                                    borderTop: '1px solid #E5E7EB',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ color: '#6B7280', fontSize: '13px' }}>
                                        📅 {new Date(report.week_start).toLocaleDateString('es-AR')} - {' '}
                                        {new Date(report.week_end).toLocaleDateString('es-AR')}
                                    </span>
                                    <span style={{
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        backgroundColor: rate >= 80 ? '#D1FAE5' : rate >= 50 ? '#FEF3C7' : '#FEE2E2',
                                        color: rate >= 80 ? '#065F46' : rate >= 50 ? '#92400E' : '#991B1B'
                                    }}>
                                        {rate >= 80 ? '¡Excelente!' : rate >= 50 ? 'Regular' : 'Por mejorar'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}