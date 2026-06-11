import { useState, useEffect } from 'react';
import api from '../services/api';

const DAYS = [
    { name: 'Lunes', number: 1, emoji: '📅' },
    { name: 'Martes', number: 2, emoji: '📅' },
    { name: 'Miércoles', number: 3, emoji: '📅' },
    { name: 'Jueves', number: 4, emoji: '📅' },
    { name: 'Viernes', number: 5, emoji: '🎉' },
    { name: 'Sábado', number: 6, emoji: '🌟' },
    { name: 'Domingo', number: 7, emoji: '☀️' }
];

export default function WeeklyPlanner() {
    const [plans, setPlans] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        day_of_week: new Date().getDay() || 7,
        task_name: '',
        start_time: '',
        end_time: ''
    });
    const [activeDay, setActiveDay] = useState(null);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const weekStart = getMonday();
            const response = await api.get(`/planner/weekly?week_start=${weekStart}`);
            if (response.data.success) {
                setPlans(response.data.plans || []);
            }
        } catch (error) {
            console.error('Error cargando planes:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.task_name.trim()) {
            alert('El nombre de la actividad es obligatorio');
            return;
        }
        try {
            const weekStart = getMonday();
            await api.post('/planner/weekly', {
                week_start: weekStart,
                ...formData
            });
            setShowForm(false);
            setFormData({
                day_of_week: new Date().getDay() || 7,
                task_name: '',
                start_time: '',
                end_time: ''
            });
            loadPlans();
        } catch (error) {
            console.error('Error creando plan:', error);
            alert('Error al crear el plan semanal');
        }
    };

    // CORREGIDO: Usar el endpoint correcto con source: 'weekly'
    const toggleComplete = async (id) => {
        try {
            await api.put(`/tasks/${id}/toggle`, { source: 'weekly' });
            loadPlans();
        } catch (error) {
            console.error('Error actualizando:', error);
        }
    };

    const deletePlan = async (id) => {
        if (window.confirm('¿Eliminar esta actividad?')) {
            try {
                await api.delete(`/planner/weekly/${id}`);
                loadPlans();
            } catch (error) {
                console.error('Error eliminando:', error);
            }
        }
    };

    const getMonday = () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.getFullYear(), now.getMonth(), diff);
        return monday.toISOString().split('T')[0];
    };

    const getPlansForDay = (dayNumber) => {
        return plans.filter(p => p.day_of_week === dayNumber);
    };

    const today = new Date();
    const todayDayNumber = today.getDay() === 0 ? 7 : today.getDay();

    // Estadísticas
    const totalPlans = plans.length;
    const completedPlans = plans.filter(p => p.completed).length;
    const progressPercent = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            
            {/* CABECERA */}
            <div style={{
                background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                borderRadius: '16px',
                padding: '28px 32px',
                marginBottom: '24px',
                color: 'white',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ 
                            fontSize: '30px', 
                            fontWeight: 'bold', 
                            margin: '0 0 6px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span>📊</span> Plan Semanal
                        </h1>
                        <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
                            Semana del {new Date(getMonday()).toLocaleDateString('es-AR', { 
                                day: 'numeric', 
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        {/* Progreso semanal */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '36px', fontWeight: 'bold', lineHeight: '1' }}>
                                {progressPercent}%
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                                {completedPlans}/{totalPlans} completado
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setShowForm(!showForm)}
                            style={{
                                backgroundColor: 'white',
                                color: '#667EEA',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>+</span>
                            Agregar Actividad
                        </button>
                    </div>
                </div>
            </div>

            {/* FORMULARIO */}
            {showForm && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '2px solid #667EEA'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1F2937' }}>
                        ✨ Nueva Actividad Semanal
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr 1fr 1fr', 
                            gap: '12px',
                            marginBottom: '16px'
                        }}>
                            <select
                                value={formData.day_of_week}
                                onChange={(e) => setFormData({...formData, day_of_week: parseInt(e.target.value)})}
                                style={{
                                    padding: '12px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    backgroundColor: 'white'
                                }}
                            >
                                {DAYS.map(day => (
                                    <option key={day.number} value={day.number}>
                                        {day.emoji} {day.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Actividad *"
                                value={formData.task_name}
                                onChange={(e) => setFormData({...formData, task_name: e.target.value})}
                                required
                                style={{
                                    padding: '12px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                            />
                            <input
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                style={{
                                    padding: '12px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                            <input
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                style={{
                                    padding: '12px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#F3F4F6',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                style={{
                                    padding: '10px 24px',
                                    backgroundColor: '#667EEA',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px'
                                }}
                            >
                                💾 Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* CUADRÍCULA DE DÍAS */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '12px'
            }}>
                {DAYS.map((day) => {
                    const dayPlans = getPlansForDay(day.number);
                    const isToday = day.number === todayDayNumber;
                    const completedCount = dayPlans.filter(p => p.completed).length;
                    
                    return (
                        <div
                            key={day.number}
                            onClick={() => setActiveDay(activeDay === day.number ? null : day.number)}
                            style={{
                                backgroundColor: isToday ? '#EEF2FF' : 'white',
                                borderRadius: '12px',
                                padding: '14px',
                                minHeight: '250px',
                                border: isToday ? '3px solid #667EEA' : '2px solid #E5E7EB',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: isToday ? '0 4px 15px rgba(102, 126, 234, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                                if (!isToday) {
                                    e.currentTarget.style.borderColor = '#667EEA';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isToday) {
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                                }
                            }}
                        >
                            {/* Cabecera del día */}
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '12px',
                                paddingBottom: '10px',
                                borderBottom: '2px solid #F3F4F6'
                            }}>
                                <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                                    {day.emoji}
                                </div>
                                <div style={{
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    color: isToday ? '#667EEA' : '#374151'
                                }}>
                                    {day.name}
                                </div>
                                {isToday && (
                                    <div style={{
                                        fontSize: '10px',
                                        color: '#667EEA',
                                        fontWeight: '600',
                                        marginTop: '4px',
                                        backgroundColor: '#C7D2FE',
                                        borderRadius: '10px',
                                        padding: '2px 8px',
                                        display: 'inline-block'
                                    }}>
                                        HOY
                                    </div>
                                )}
                            </div>

                            {/* Contador */}
                            {dayPlans.length > 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: '8px',
                                    fontSize: '12px',
                                    color: '#6B7280'
                                }}>
                                    {completedCount}/{dayPlans.length} hecho
                                </div>
                            )}

                            {/* Lista de planes */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {dayPlans.slice(0, activeDay === day.number ? 10 : 4).map((plan) => (
                                    <div
                                        key={plan.id}
                                        style={{
                                            backgroundColor: plan.completed ? '#D1FAE5' : '#F9FAFB',
                                            borderRadius: '8px',
                                            padding: '8px 10px',
                                            border: plan.completed ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
                                            fontSize: '13px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ 
                                                fontWeight: '500',
                                                flex: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                textDecoration: plan.completed ? 'line-through' : 'none',
                                                color: plan.completed ? '#6B7280' : '#1F2937'
                                            }}>
                                                {plan.task_name}
                                            </span>
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: '6px' }}>
                                                {/* Botón completar - CORREGIDO */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleComplete(plan.id);
                                                    }}
                                                    style={{
                                                        backgroundColor: plan.completed ? '#10B981' : '#E5E7EB',
                                                        color: plan.completed ? 'white' : '#6B7280',
                                                        border: 'none',
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    title={plan.completed ? 'Desmarcar' : 'Completar'}
                                                >
                                                    {plan.completed ? '✓' : '○'}
                                                </button>
                                                {/* Botón eliminar */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deletePlan(plan.id);
                                                    }}
                                                    style={{
                                                        backgroundColor: 'transparent',
                                                        color: '#EF4444',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '16px',
                                                        padding: '0 2px',
                                                        lineHeight: '1'
                                                    }}
                                                    title="Eliminar"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                        {(plan.start_time || plan.end_time) && (
                                            <div style={{ 
                                                fontSize: '10px', 
                                                color: '#9CA3AF',
                                                marginTop: '3px'
                                            }}>
                                                🕐 {plan.start_time?.substring(0,5) || '--:--'} 
                                                {plan.end_time && ` - ${plan.end_time.substring(0,5)}`}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                {dayPlans.length === 0 && (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '30px 0',
                                        color: '#D1D5DB',
                                        fontSize: '13px'
                                    }}>
                                        Sin actividades
                                    </div>
                                )}
                                
                                {dayPlans.length > 4 && activeDay !== day.number && (
                                    <div style={{
                                        textAlign: 'center',
                                        fontSize: '12px',
                                        color: '#667EEA',
                                        fontWeight: '600',
                                        marginTop: '4px'
                                    }}>
                                        +{dayPlans.length - 4} más
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}