import { useState, useEffect } from 'react';
import api from '../services/api';

const DAYS = [
    { name: 'Lun', number: 1, emoji: '📅' },
    { name: 'Mar', number: 2, emoji: '📅' },
    { name: 'Mié', number: 3, emoji: '📅' },
    { name: 'Jue', number: 4, emoji: '📅' },
    { name: 'Vie', number: 5, emoji: '🎉' },
    { name: 'Sáb', number: 6, emoji: '🌟' },
    { name: 'Dom', number: 7, emoji: '☀️' }
];

export default function WeeklyPlanner() {
    const [plans, setPlans] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ day_of_week: new Date().getDay() || 7, task_name: '', start_time: '', end_time: '' });

    useEffect(() => { loadPlans(); }, []);

    const loadPlans = async () => {
        try {
            const weekStart = getMonday();
            const response = await api.get(`/planner/weekly?week_start=${weekStart}`);
            if (response.data.success) setPlans(response.data.plans || []);
        } catch (error) { console.error('Error:', error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.task_name.trim()) { alert('Nombre obligatorio'); return; }
        try {
            await api.post('/planner/weekly', { week_start: getMonday(), ...formData });
            setShowForm(false);
            setFormData({ day_of_week: new Date().getDay() || 7, task_name: '', start_time: '', end_time: '' });
            loadPlans();
        } catch (error) { alert('Error al crear'); }
    };

    const toggleComplete = async (id) => {
        try { await api.put(`/tasks/${id}/toggle`, { source: 'weekly' }); loadPlans(); }
        catch (error) { console.error('Error:', error); }
    };

    const deletePlan = async (id) => {
        if (window.confirm('¿Eliminar?')) {
            try { await api.delete(`/planner/weekly/${id}`); loadPlans(); }
            catch (error) { console.error('Error:', error); }
        }
    };

    const getMonday = () => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(now.getFullYear(), now.getMonth(), diff).toISOString().split('T')[0];
    };

    const getPlansForDay = (dayNumber) => plans.filter(p => p.day_of_week === dayNumber);
    const today = new Date();
    const todayDayNumber = today.getDay() === 0 ? 7 : today.getDay();
    const totalPlans = plans.length;
    const completedPlans = plans.filter(p => p.completed).length;
    const progressPercent = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

    return (
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '12px 16px' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #667EEA, #764BA2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>📊 Plan Semanal</h1>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', opacity: 0.9 }}>Semana del {new Date(getMonday()).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} style={{ backgroundColor: 'white', color: '#667EEA', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                        + Agregar
                    </button>
                </div>
            </div>

            {/* Formulario */}
            {showForm && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                            <select value={formData.day_of_week} onChange={(e) => setFormData({...formData, day_of_week: parseInt(e.target.value)})}
                                style={{ padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }}>
                                {DAYS.map(day => <option key={day.number} value={day.number}>{day.emoji} {day.name}</option>)}
                            </select>
                            <input type="text" placeholder="Actividad *" value={formData.task_name} onChange={(e) => setFormData({...formData, task_name: e.target.value})} required
                                style={{ padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <input type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                    style={{ padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                                <input type="time" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                    style={{ padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#667EEA', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600' }}>Guardar</button>
                            <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#E5E7EB', border: 'none', borderRadius: '8px' }}>Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Días - Scroll horizontal en móvil */}
            <div className="scroll-container" style={{ overflowX: 'auto', margin: '0 -16px', padding: '0 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))', gap: '8px', minWidth: '910px' }}>
                    {DAYS.map(day => {
                        const dayPlans = getPlansForDay(day.number);
                        const isToday = day.number === todayDayNumber;
                        const completedCount = dayPlans.filter(p => p.completed).length;
                        return (
                            <div key={day.number} style={{
                                backgroundColor: isToday ? '#EEF2FF' : 'white', borderRadius: '10px', padding: '10px',
                                minHeight: '200px', border: isToday ? '2px solid #667EEA' : '1px solid #E5E7EB',
                                boxShadow: isToday ? '0 2px 8px rgba(102,126,234,0.2)' : '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ textAlign: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #F3F4F6' }}>
                                    <div style={{ fontSize: '18px' }}>{day.emoji}</div>
                                    <div style={{ fontWeight: '700', fontSize: '13px', color: isToday ? '#667EEA' : '#374151' }}>{day.name}</div>
                                    {isToday && <div style={{ fontSize: '9px', color: '#667EEA', fontWeight: '600', backgroundColor: '#C7D2FE', borderRadius: '8px', padding: '1px 6px', display: 'inline-block', marginTop: '2px' }}>HOY</div>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {dayPlans.map(plan => (
                                        <div key={plan.id} style={{ backgroundColor: plan.completed ? '#D1FAE5' : '#F9FAFB', borderRadius: '6px', padding: '6px 8px', border: plan.completed ? '1px solid #A7F3D0' : '1px solid #E5E7EB', fontSize: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '500', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: plan.completed ? 'line-through' : 'none', color: plan.completed ? '#6B7280' : '#1F2937' }}>{plan.task_name}</span>
                                                <div style={{ display: 'flex', gap: '2px', marginLeft: '4px' }}>
                                                    <button onClick={(e) => { e.stopPropagation(); toggleComplete(plan.id); }}
                                                        style={{ width: '20px', height: '20px', borderRadius: '4px', border: 'none', backgroundColor: plan.completed ? '#10B981' : '#E5E7EB', color: plan.completed ? 'white' : '#6B7280', cursor: 'pointer', fontSize: '10px' }}>
                                                        {plan.completed ? '✓' : '○'}
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); deletePlan(plan.id); }}
                                                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1 }}>×</button>
                                                </div>
                                            </div>
                                            {(plan.start_time || plan.end_time) && (
                                                <div style={{ fontSize: '9px', color: '#9CA3AF', marginTop: '2px' }}>
                                                    🕐 {plan.start_time?.substring(0,5) || '--:--'}{plan.end_time && ` - ${plan.end_time.substring(0,5)}`}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {dayPlans.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0', color: '#D1D5DB', fontSize: '11px' }}>Sin actividades</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}