import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [progress, setProgress] = useState(0);
    const [progressBreakdown, setProgressBreakdown] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        task_name: '', scheduled_time: '', days_of_week: [1,2,3,4,5,6,7]
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const tasksRes = await api.get('/tasks/today');
            if (tasksRes.data.success) setTasks(tasksRes.data.tasks || []);
            const progressRes = await api.get('/tasks/progress/today');
            if (progressRes.data.success?.progress) {
                setProgress(parseFloat(progressRes.data.progress.progress_percentage) || 0);
                setProgressBreakdown(progressRes.data.progress.breakdown || null);
            }
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    const handleToggle = async (taskId, source) => {
        try { await api.put(`/tasks/${taskId}/toggle`, { source: source || 'daily' }); loadData(); }
        catch (error) { console.error('Error:', error); }
    };

    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks/template', newTemplate);
            setShowForm(false);
            setNewTemplate({ task_name: '', scheduled_time: '', days_of_week: [1,2,3,4,5,6,7] });
            alert('✅ Plantilla creada');
        } catch (error) { alert('Error al crear plantilla'); }
    };

    const generateTodayTasks = async () => {
        try {
            const response = await api.post('/tasks/generate-today');
            if (response.data.success) { alert('✅ ' + response.data.message); loadData(); }
        } catch (error) { alert('❌ Error al generar tareas'); }
    };

    const toggleDay = (day) => {
        setNewTemplate(prev => ({
            ...prev,
            days_of_week: prev.days_of_week.includes(day)
                ? prev.days_of_week.filter(d => d !== day)
                : [...prev.days_of_week, day].sort()
        }));
    };

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const completedCount = tasks.filter(t => t.completed).length;
    const getProgressColor = () => progress >= 80 ? '#10B981' : progress >= 50 ? '#F59E0B' : '#EF4444';
    const getSourceLabel = (s) => ({ daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensual' }[s] || '');
    const getSourceColor = (s) => ({ daily: '#3B82F6', weekly: '#8B5CF6', monthly: '#EC4899' }[s] || '#6B7280');

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}><p>⏳ Cargando...</p></div>;

    return (
        <div style={{ maxWidth: '750px', margin: '0 auto', padding: '12px 16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>📋 Mi Día</h1>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={generateTodayTasks} style={{ backgroundColor: '#3B82F6', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', flex: '1 1 auto', minWidth: '100px' }}>🔄 Generar</button>
                    <button onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', flex: '1 1 auto', minWidth: '100px' }}>+ Nueva Tarea</button>
                </div>
                <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>
                    {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Formulario */}
            {showForm && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>✨ Nueva Tarea Diaria</h3>
                    <form onSubmit={handleCreateTemplate}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                            <input type="text" required placeholder="Nombre de la tarea *" value={newTemplate.task_name}
                                onChange={(e) => setNewTemplate({...newTemplate, task_name: e.target.value})}
                                style={{ padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
                            <input type="time" value={newTemplate.scheduled_time}
                                onChange={(e) => setNewTemplate({...newTemplate, scheduled_time: e.target.value})}
                                style={{ padding: '10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Días:</label>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {dayNames.map((name, index) => {
                                    const dayNumber = index === 0 ? 7 : index;
                                    const isSelected = newTemplate.days_of_week.includes(dayNumber);
                                    return (
                                        <button key={index} type="button" onClick={() => toggleDay(dayNumber)}
                                            style={{ padding: '6px 10px', borderRadius: '6px', border: isSelected ? '2px solid #3B82F6' : '1px solid #E5E7EB', backgroundColor: isSelected ? '#3B82F6' : 'white', color: isSelected ? 'white' : '#374151', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="submit" style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', flex: 1 }}>💾 Guardar</button>
                            <button type="button" onClick={() => setShowForm(false)} style={{ backgroundColor: '#E5E7EB', color: '#374151', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '13px', flex: 1 }}>Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Progreso */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>Progreso del día</span>
                    <span style={{ fontWeight: '700', fontSize: '20px', color: getProgressColor() }}>{progress.toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', height: '18px', backgroundColor: '#E5E7EB', borderRadius: '9px', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', backgroundColor: getProgressColor(), borderRadius: '9px', transition: 'width 0.5s' }} />
                </div>
                {progressBreakdown && (
                    <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#6B7280', flexWrap: 'wrap' }}>
                        <span>📋 {progressBreakdown.daily.completed}/{progressBreakdown.daily.total}</span>
                        <span>📊 {progressBreakdown.weekly.completed}/{progressBreakdown.weekly.total}</span>
                        <span>📆 {progressBreakdown.monthly.completed}/{progressBreakdown.monthly.total}</span>
                    </div>
                )}
            </div>

            {/* Tareas */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tareas de hoy</span>
                    <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'normal' }}>{completedCount}/{tasks.length}</span>
                </h2>
                {tasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                        <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '10px' }}>📭 No hay tareas</p>
                        <button onClick={() => setShowForm(true)} style={{ padding: '8px 16px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>+ Tarea Diaria</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {tasks.map(task => (
                            <div key={`${task.source}-${task.id}`} onClick={() => handleToggle(task.id, task.source)}
                                style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', border: task.completed ? '1px solid #A7F3D0' : '1px solid #E5E7EB', backgroundColor: task.completed ? '#ECFDF5' : '#F9FAFB', flexWrap: 'wrap', gap: '6px' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '5px', border: task.completed ? '2px solid #10B981' : '2px solid #D1D5DB', backgroundColor: task.completed ? '#10B981' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {task.completed && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '500', flex: 1, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#9CA3AF' : '#1F2937', minWidth: '100px' }}>
                                    {task.icon} {task.task_name}
                                </span>
                                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', backgroundColor: `${getSourceColor(task.source)}20`, color: getSourceColor(task.source), fontWeight: '600' }}>{getSourceLabel(task.source)}</span>
                                {task.scheduled_time && <span style={{ fontSize: '11px', color: '#6B7280' }}>🕐 {task.scheduled_time.substring(0,5)}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}