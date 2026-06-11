import { useState, useEffect } from 'react';
import api from '../services/api';

const RECURRENCE_LABELS = {
    daily: 'Diario',
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    yearly: 'Anual'
};

const RECURRENCE_EMOJIS = {
    daily: '🔄',
    weekly: '📅',
    biweekly: '🗓️',
    monthly: '📆',
    quarterly: '⏰',
    yearly: '🎯'
};

export default function Reminders() {
    const [reminders, setReminders] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all'); // all, active, completed
    const [formData, setFormData] = useState({
        title: '',
        reminder_type: 'payment',
        start_date: '',
        start_time: '',
        is_recurring: false,
        recurrence_type: 'monthly',
        recurrence_days: [1],
        description: ''
    });

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = async () => {
        try {
            const response = await api.get('/reminders');
            if (response.data.success) {
                setReminders(response.data.reminders || []);
            }
        } catch (error) {
            console.error('Error cargando recordatorios:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.start_date) {
            alert('Título y fecha son obligatorios');
            return;
        }
        try {
            await api.post('/reminders', formData);
            setShowForm(false);
            setFormData({
                title: '',
                reminder_type: 'payment',
                start_date: '',
                start_time: '',
                is_recurring: false,
                recurrence_type: 'monthly',
                recurrence_days: [1],
                description: ''
            });
            loadReminders();
        } catch (error) {
            console.error('Error creando recordatorio:', error);
            alert('Error al crear recordatorio');
        }
    };

    const markComplete = async (id) => {
        try {
            await api.put(`/reminders/${id}/complete`);
            loadReminders();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteReminder = async (id) => {
        if (window.confirm('¿Eliminar este recordatorio?')) {
            try {
                await api.delete(`/reminders/${id}`);
                loadReminders();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const getTypeInfo = (type) => {
        switch(type) {
            case 'payment':
                return { icon: '💳', label: 'Pago', color: '#10B981', bg: '#D1FAE5' };
            case 'appointment':
                return { icon: '🏥', label: 'Cita', color: '#8B5CF6', bg: '#EDE9FE' };
            default:
                return { icon: '📌', label: 'Otro', color: '#3B82F6', bg: '#DBEAFE' };
        }
    };

    const isOverdue = (reminder) => {
        if (reminder.completed) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reminderDate = new Date(reminder.start_date + 'T' + (reminder.start_time || '23:59'));
        return reminderDate < today;
    };

    const isToday = (reminder) => {
        const today = new Date().toISOString().split('T')[0];
        return reminder.start_date === today;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.getTime() === today.getTime()) return 'Hoy';
        if (date.getTime() === tomorrow.getTime()) return 'Mañana';
        
        return date.toLocaleDateString('es-AR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    };

    const filteredReminders = reminders.filter(r => {
        if (filter === 'active') return !r.completed;
        if (filter === 'completed') return r.completed;
        return true;
    });

    const activeReminders = reminders.filter(r => !r.completed);
    const completedReminders = reminders.filter(r => r.completed);
    const overdueReminders = activeReminders.filter(r => isOverdue(r));

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            
            {/* CABECERA */}
            <div style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                borderRadius: '16px',
                padding: '28px 32px',
                marginBottom: '24px',
                color: 'white',
                boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ 
                            fontSize: '30px', 
                            fontWeight: 'bold', 
                            margin: '0 0 6px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span>🔔</span> Recordatorios
                        </h1>
                        <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
                            {activeReminders.length} pendientes · {completedReminders.length} completados
                            {overdueReminders.length > 0 && ` · ${overdueReminders.length} vencidos`}
                        </p>
                    </div>
                    
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            backgroundColor: 'white',
                            color: '#F59E0B',
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
                        Nuevo Recordatorio
                    </button>
                </div>
            </div>

            {/* ESTADÍSTICAS RÁPIDAS */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '24px'
            }}>
                {[
                    { label: 'Pendientes', value: activeReminders.length, icon: '⏳', color: '#F59E0B' },
                    { label: 'Vencidos', value: overdueReminders.length, icon: '⚠️', color: '#EF4444' },
                    { label: 'Completados', value: completedReminders.length, icon: '✅', color: '#10B981' },
                    { label: 'Total', value: reminders.length, icon: '📊', color: '#3B82F6' }
                ].map((stat, i) => (
                    <div key={i} style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        textAlign: 'center',
                        border: `2px solid ${stat.color}20`
                    }}>
                        <div style={{ fontSize: '28px', marginBottom: '4px' }}>{stat.icon}</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color }}>
                            {stat.value}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* FILTROS */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px'
            }}>
                {[
                    { value: 'all', label: 'Todos' },
                    { value: 'active', label: '⏳ Pendientes' },
                    { value: 'completed', label: '✅ Completados' }
                ].map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        style={{
                            padding: '8px 18px',
                            borderRadius: '20px',
                            border: filter === f.value ? '2px solid #F59E0B' : '2px solid #E5E7EB',
                            backgroundColor: filter === f.value ? '#FEF3C7' : 'white',
                            color: filter === f.value ? '#92400E' : '#6B7280',
                            cursor: 'pointer',
                            fontWeight: filter === f.value ? '600' : '400',
                            fontSize: '14px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* FORMULARIO */}
            {showForm && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '2px solid #F59E0B'
                }}>
                    <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        marginBottom: '20px',
                        color: '#1F2937'
                    }}>
                        ✨ Nuevo Recordatorio
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr 1fr', 
                            gap: '12px',
                            marginBottom: '16px'
                        }}>
                            <input
                                type="text"
                                placeholder="Título *"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                required
                                style={{
                                    padding: '12px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                            />
                            <select
                                value={formData.reminder_type}
                                onChange={(e) => setFormData({...formData, reminder_type: e.target.value})}
                                style={{
                                    padding: '12px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="payment">💳 Pago</option>
                                <option value="appointment">🏥 Cita</option>
                                <option value="other">📌 Otro</option>
                            </select>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                required
                                style={{
                                    padding: '12px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                            />
                        </div>

                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '12px',
                            marginBottom: '16px'
                        }}>
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
                                type="text"
                                placeholder="Descripción (opcional)"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                style={{
                                    padding: '12px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {/* Recurrencia */}
                        <div style={{
                            backgroundColor: '#FEF3C7',
                            borderRadius: '10px',
                            padding: '14px',
                            marginBottom: '16px'
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                color: '#92400E',
                                fontSize: '14px'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={formData.is_recurring}
                                    onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span>🔄 Es recurrente</span>
                            </label>
                            
                            {formData.is_recurring && (
                                <div style={{ marginTop: '10px' }}>
                                    <select
                                        value={formData.recurrence_type}
                                        onChange={(e) => setFormData({...formData, recurrence_type: e.target.value})}
                                        style={{
                                            padding: '8px 12px',
                                            border: '2px solid #F59E0B',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            outline: 'none',
                                            backgroundColor: 'white',
                                            width: '100%'
                                        }}
                                    >
                                        {Object.entries(RECURRENCE_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {RECURRENCE_EMOJIS[value]} {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
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
                                    backgroundColor: '#F59E0B',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px'
                                }}
                            >
                                💾 Guardar Recordatorio
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* LISTA DE RECORDATORIOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredReminders.length === 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '60px 40px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ fontSize: '60px', marginBottom: '16px' }}>
                            {filter === 'completed' ? '🎉' : '📭'}
                        </div>
                        <p style={{ fontSize: '18px', color: '#374151', fontWeight: '500' }}>
                            {filter === 'completed' 
                                ? 'No hay recordatorios completados' 
                                : filter === 'active'
                                    ? '¡Todo al día! No hay pendientes'
                                    : 'No hay recordatorios'}
                        </p>
                        <p style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '8px' }}>
                            {filter === 'all' && 'Crea tu primer recordatorio con el botón de arriba'}
                        </p>
                    </div>
                ) : (
                    filteredReminders.map((reminder) => {
                        const typeInfo = getTypeInfo(reminder.reminder_type);
                        const overdue = isOverdue(reminder);
                        const today = isToday(reminder);
                        
                        return (
                            <div
                                key={reminder.id}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '14px',
                                    padding: '18px 20px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    border: overdue ? '2px solid #FCA5A5' : 
                                            today ? '2px solid #FCD34D' : 
                                            '1px solid #E5E7EB',
                                    opacity: reminder.completed ? 0.6 : 1,
                                    transition: 'all 0.3s'
                                }}
                            >
                                {/* Icono del tipo */}
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '14px',
                                    backgroundColor: typeInfo.bg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '28px',
                                    flexShrink: 0
                                }}>
                                    {typeInfo.icon}
                                </div>

                                {/* Información */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <h3 style={{
                                            margin: 0,
                                            fontSize: '17px',
                                            fontWeight: '600',
                                            color: reminder.completed ? '#9CA3AF' : '#1F2937',
                                            textDecoration: reminder.completed ? 'line-through' : 'none'
                                        }}>
                                            {reminder.title}
                                        </h3>
                                        
                                        {/* Etiquetas */}
                                        <span style={{
                                            fontSize: '11px',
                                            padding: '3px 8px',
                                            borderRadius: '12px',
                                            backgroundColor: typeInfo.bg,
                                            color: typeInfo.color,
                                            fontWeight: '600'
                                        }}>
                                            {typeInfo.label}
                                        </span>
                                        
                                        {reminder.is_recurring && (
                                            <span style={{
                                                fontSize: '11px',
                                                padding: '3px 8px',
                                                borderRadius: '12px',
                                                backgroundColor: '#FEF3C7',
                                                color: '#92400E',
                                                fontWeight: '600'
                                            }}>
                                                {RECURRENCE_EMOJIS[reminder.recurrence_type]} {RECURRENCE_LABELS[reminder.recurrence_type]}
                                            </span>
                                        )}
                                        
                                        {overdue && (
                                            <span style={{
                                                fontSize: '11px',
                                                padding: '3px 8px',
                                                borderRadius: '12px',
                                                backgroundColor: '#FEE2E2',
                                                color: '#DC2626',
                                                fontWeight: '700'
                                            }}>
                                                ⚠️ VENCIDO
                                            </span>
                                        )}
                                        
                                        {today && !reminder.completed && (
                                            <span style={{
                                                fontSize: '11px',
                                                padding: '3px 8px',
                                                borderRadius: '12px',
                                                backgroundColor: '#FEF3C7',
                                                color: '#92400E',
                                                fontWeight: '700'
                                            }}>
                                                ⚡ HOY
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6B7280' }}>
                                        <span>📅 {formatDate(reminder.start_date)}</span>
                                        {reminder.start_time && (
                                            <span>🕐 {reminder.start_time.substring(0, 5)}</span>
                                        )}
                                        {reminder.completed && reminder.completed_at && (
                                            <span style={{ color: '#10B981' }}>
                                                ✅ {new Date(reminder.completed_at).toLocaleDateString('es-AR')}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {reminder.description && (
                                        <p style={{
                                            margin: '6px 0 0 0',
                                            fontSize: '13px',
                                            color: '#9CA3AF',
                                            fontStyle: 'italic'
                                        }}>
                                            {reminder.description}
                                        </p>
                                    )}
                                </div>

                                {/* Botones de acción */}
                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                    {!reminder.completed && (
                                        <button
                                            onClick={() => markComplete(reminder.id)}
                                            style={{
                                                backgroundColor: '#D1FAE5',
                                                color: '#065F46',
                                                border: 'none',
                                                padding: '10px 16px',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '13px',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#A7F3D0'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#D1FAE5'}
                                        >
                                            ✓ Completar
                                        </button>
                                    )}
                                    {reminder.completed && (
                                        <span style={{
                                            backgroundColor: '#D1FAE5',
                                            color: '#065F46',
                                            padding: '10px 16px',
                                            borderRadius: '10px',
                                            fontWeight: '600',
                                            fontSize: '13px'
                                        }}>
                                            ✅ Hecho
                                        </span>
                                    )}
                                    <button
                                        onClick={() => deleteReminder(reminder.id)}
                                        style={{
                                            backgroundColor: '#FEE2E2',
                                            color: '#DC2626',
                                            border: 'none',
                                            padding: '10px 12px',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#FECACA'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#FEE2E2'}
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}