import { useState, useEffect } from 'react';
import api from '../services/api';

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function MonthlyPlanner() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [plans, setPlans] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({
        task_name: '',
        start_time: '',
        end_time: '',
        description: ''
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthYear = `${year}-${String(month + 1).padStart(2, '0')}-01`;

    useEffect(() => {
        loadPlans();
    }, [currentDate]);

    const loadPlans = async () => {
        try {
            const response = await api.get(`/planner/monthly?month_year=${monthYear}`);
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
            await api.post('/planner/monthly', {
                month_year: monthYear,
                day_of_month: selectedDay,
                ...formData
            });
            setShowModal(false);
            setSelectedDay(null);
            setFormData({ task_name: '', start_time: '', end_time: '', description: '' });
            loadPlans();
        } catch (error) {
            console.error('Error creando plan:', error);
            alert('Error al crear el plan mensual');
        }
    };

    const handleDelete = async (planId) => {
        if (window.confirm('¿Eliminar este plan?')) {
            try {
                await api.delete(`/planner/weekly/${planId}`);
                loadPlans();
            } catch (error) {
                console.error('Error eliminando:', error);
            }
        }
    };

    const getDaysInMonth = () => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        
        const cells = [];
        for (let i = 0; i < firstDay; i++) {
            cells.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            cells.push(i);
        }
        return cells;
    };

    const getPlansForDay = (day) => {
        return plans.filter(p => p.day_of_month === day);
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() && 
               month === today.getMonth() && 
               year === today.getFullYear();
    };

    const changeMonth = (delta) => {
        const newDate = new Date(year, month + delta, 1);
        setCurrentDate(newDate);
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
            
            {/* CABECERA */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <button
                    onClick={() => changeMonth(-1)}
                    style={{
                        backgroundColor: '#F3F4F6',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#374151',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#E5E7EB'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                >
                    ←
                </button>
                
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ 
                        fontSize: '28px', 
                        fontWeight: 'bold', 
                        color: '#1F2937',
                        margin: 0
                    }}>
                        {MONTHS[month]}
                    </h1>
                    <p style={{ 
                        fontSize: '16px', 
                        color: '#6B7280',
                        margin: '4px 0 0 0'
                    }}>
                        {year}
                    </p>
                </div>
                
                <button
                    onClick={() => changeMonth(1)}
                    style={{
                        backgroundColor: '#F3F4F6',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#374151',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#E5E7EB'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                >
                    →
                </button>
            </div>

            {/* CALENDARIO */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                {/* Encabezado de días */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    backgroundColor: '#4F46E5',
                    color: 'white'
                }}>
                    {WEEKDAYS.map(day => (
                        <div key={day} style={{
                            padding: '14px 8px',
                            textAlign: 'center',
                            fontWeight: '600',
                            fontSize: '14px',
                            letterSpacing: '0.5px'
                        }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Cuadrícula de días */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)'
                }}>
                    {getDaysInMonth().map((day, index) => {
                        const dayPlans = day ? getPlansForDay(day) : [];
                        
                        return (
                            <div
                                key={index}
                                onClick={() => {
                                    if (day) {
                                        setSelectedDay(day);
                                        setSelectedPlan(null);
                                        setFormData({ task_name: '', start_time: '', end_time: '', description: '' });
                                        setShowModal(true);
                                    }
                                }}
                                style={{
                                    minHeight: '110px',
                                    border: '1px solid #F3F4F6',
                                    padding: '8px',
                                    cursor: day ? 'pointer' : 'default',
                                    backgroundColor: day ? 'white' : '#FAFBFC',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    if (day) {
                                        e.currentTarget.style.backgroundColor = '#F0F4FF';
                                        e.currentTarget.style.boxShadow = 'inset 0 0 0 2px #4F46E5';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (day) {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                {day && (
                                    <>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            marginBottom: '6px'
                                        }}>
                                            <div style={{
                                                width: '30px',
                                                height: '30px',
                                                borderRadius: '50%',
                                                backgroundColor: isToday(day) ? '#4F46E5' : 'transparent',
                                                color: isToday(day) ? 'white' : '#1F2937',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: isToday(day) ? 'bold' : '500',
                                                fontSize: '14px'
                                            }}>
                                                {day}
                                            </div>
                                        </div>
                                        
                                        <div style={{ fontSize: '11px' }}>
                                            {dayPlans.slice(0, 3).map((plan, i) => (
                                                <div
                                                    key={i}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedPlan(plan);
                                                    }}
                                                    style={{
                                                        backgroundColor: '#EEF2FF',
                                                        borderRadius: '4px',
                                                        padding: '3px 6px',
                                                        marginBottom: '3px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        color: '#4338CA',
                                                        borderLeft: '3px solid #4F46E5',
                                                        fontSize: '11px'
                                                    }}
                                                    title={plan.task_name}
                                                >
                                                    {plan.start_time && (
                                                        <span style={{ fontWeight: '600' }}>
                                                            {plan.start_time.substring(0, 5)}
                                                        </span>
                                                    )}
                                                    {plan.start_time && ' '}
                                                    {plan.task_name}
                                                </div>
                                            ))}
                                            {dayPlans.length > 3 && (
                                                <div style={{ 
                                                    fontSize: '10px', 
                                                    color: '#6B7280', 
                                                    textAlign: 'center',
                                                    marginTop: '2px'
                                                }}>
                                                    +{dayPlans.length - 3} más
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODAL PARA CREAR PLAN */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }} onClick={() => setShowModal(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '28px',
                        width: '450px',
                        maxWidth: '95%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }} onClick={(e) => e.stopPropagation()}>
                        
                        {/* Header del modal */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: '#1F2937',
                                margin: 0
                            }}>
                                📅 Día {selectedDay} de {MONTHS[month]}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#6B7280',
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    lineHeight: '1'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                ×
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '6px'
                                }}>
                                    Actividad *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.task_name}
                                    onChange={(e) => setFormData({...formData, task_name: e.target.value})}
                                    placeholder="Ej: Reunión de equipo"
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                />
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px',
                                marginBottom: '16px'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '6px'
                                    }}>
                                        Hora inicio
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '2px solid #E5E7EB',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
                                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '6px'
                                    }}>
                                        Hora fin
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '2px solid #E5E7EB',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
                                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '6px'
                                }}>
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Detalles adicionales (opcional)"
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                />
                            </div>

                            {/* Botones */}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#F3F4F6',
                                        color: '#374151',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#E5E7EB'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#4F46E5',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#4338CA'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4F46E5'}
                                >
                                    💾 Guardar
                                </button>
                            </div>
                        </form>

                        {/* Planes existentes del día */}
                        {selectedDay && getPlansForDay(selectedDay).length > 0 && (
                            <div style={{
                                marginTop: '20px',
                                paddingTop: '20px',
                                borderTop: '2px solid #F3F4F6'
                            }}>
                                <h4 style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#6B7280',
                                    marginBottom: '10px'
                                }}>
                                    Actividades de este día:
                                </h4>
                                {getPlansForDay(selectedDay).map((plan, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        backgroundColor: '#F9FAFB',
                                        borderRadius: '8px',
                                        marginBottom: '6px',
                                        fontSize: '14px'
                                    }}>
                                        <div>
                                            <span style={{ fontWeight: '500' }}>{plan.task_name}</span>
                                            {plan.start_time && (
                                                <span style={{ color: '#6B7280', marginLeft: '8px' }}>
                                                    {plan.start_time.substring(0, 5)}
                                                    {plan.end_time && ` - ${plan.end_time.substring(0, 5)}`}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(plan.id)}
                                            style={{
                                                backgroundColor: '#FEE2E2',
                                                color: '#DC2626',
                                                border: 'none',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Estadísticas del mes */}
            <div style={{
                marginTop: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4F46E5' }}>
                        {plans.length}
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '14px', marginTop: '4px' }}>
                        Total actividades
                    </div>
                </div>
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10B981' }}>
                        {new Set(plans.map(p => p.day_of_month)).size}
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '14px', marginTop: '4px' }}>
                        Días con planes
                    </div>
                </div>
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F59E0B' }}>
                        {new Date(year, month + 1, 0).getDate()}
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '14px', marginTop: '4px' }}>
                        Días en el mes
                    </div>
                </div>
            </div>
        </div>
    );
}