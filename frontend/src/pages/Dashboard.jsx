import { useState, useEffect } from 'react';
import api from '../services/api';
import ProgressBar from '../components/ProgressBar';
import TaskList from '../components/TaskList';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [progress, setProgress] = useState(0);
    const [progressBreakdown, setProgressBreakdown] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        task_name: '',
        scheduled_time: '',
        days_of_week: [1, 2, 3, 4, 5, 6, 7]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            
            const tasksRes = await api.get('/tasks/today');
            if (tasksRes.data.success) {
                const loadedTasks = tasksRes.data.tasks || [];
                setTasks(loadedTasks);
                
                // Calcular progreso
                const completed = loadedTasks.filter(t => t.completed).length;
                const total = loadedTasks.length;
                const pct = total > 0 ? (completed / total) * 100 : 0;
                setProgress(pct);
            }
            
            const progressRes = await api.get('/tasks/progress/today');
            if (progressRes.data.success?.progress) {
                setProgressBreakdown(progressRes.data.progress.breakdown || null);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (taskId, source) => {
        setTasks(prevTasks => {
            const newTasks = prevTasks.map(task => 
                task.id === taskId && task.source === source
                    ? { ...task, completed: !task.completed }
                    : task
            );
            const completed = newTasks.filter(t => t.completed).length;
            const total = newTasks.length;
            setProgress(total > 0 ? (completed / total) * 100 : 0);
            return newTasks;
        });
        
        try {
            await api.put(`/tasks/${taskId}/toggle`, { source: source || 'daily' });
        } catch (error) {
            console.error('Error:', error);
            loadData();
        }
    };

    // ELIMINAR TAREA
    const handleDelete = async (taskId, source) => {
        if (!window.confirm('¿Eliminar esta tarea?')) return;
        
        try {
            if (source === 'daily') {
                await api.delete(`/tasks/${taskId}`);
            } else if (source === 'weekly') {
                await api.delete(`/planner/weekly/${taskId}`);
            } else if (source === 'monthly') {
                await api.delete(`/planner/monthly/${taskId}`);
            }
            loadData();
        } catch (error) {
            console.error('Error eliminando:', error);
            alert('Error al eliminar la tarea');
        }
    };

    // CREAR PLANTILLA Y AUTO-GENERAR
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    
    // Evitar doble envío
    if (updating) return;
    setUpdating(true);
    
    try {
        // 1. Crear la plantilla (UNA SOLA VEZ)
        await api.post('/tasks/template', newTemplate);
        
        // 2. Generar tareas para hoy (UNA SOLA VEZ)
        await api.post('/tasks/generate-today');
        
        // 3. Limpiar formulario
        setShowForm(false);
        setNewTemplate({ task_name: '', scheduled_time: '', days_of_week: [1, 2, 3, 4, 5, 6, 7] });
        
        // 4. Recargar datos
        await loadData();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear la tarea');
    } finally {
        setUpdating(false);
    }
};
    const generateTodayTasks = async () => {
        try {
            const response = await api.post('/tasks/generate-today');
            if (response.data.success) {
                await loadData();
                alert('✅ ' + response.data.message);
            }
        } catch (error) {
            console.error('Error generando tareas:', error);
            alert('❌ Error al generar tareas');
        }
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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
                    <p style={{ fontSize: '16px', color: '#6B7280' }}>Cargando tareas...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '750px', margin: '0 auto', padding: '12px 16px' }}>
            
            {/* HEADER */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '16px'
            }}>
                <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>
                    📋 Mi Día
                </h1>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={generateTodayTasks}
                        style={{
                            backgroundColor: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            flex: '1 1 auto',
                            minWidth: '100px'
                        }}
                    >
                        🔄 Generar
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            backgroundColor: '#10B981',
                            color: 'white',
                            border: 'none',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            flex: '1 1 auto',
                            minWidth: '100px'
                        }}
                    >
                        + Nueva Tarea
                    </button>
                </div>
                
                <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>
                    {new Date().toLocaleDateString('es-AR', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </p>
            </div>

            {/* FORMULARIO */}
            {showForm && (
                <div style={{
                    backgroundColor: 'white', borderRadius: '12px', padding: '16px',
                    marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '2px solid #10B981'
                }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                        ✨ Nueva Tarea Diaria
                    </h3>
                    <form onSubmit={handleCreateTemplate}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                            <input type="text" required placeholder="Nombre de la tarea *"
                                value={newTemplate.task_name}
                                onChange={(e) => setNewTemplate({...newTemplate, task_name: e.target.value})}
                                style={{ padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none' }}
                            />
                            <input type="time"
                                value={newTemplate.scheduled_time}
                                onChange={(e) => setNewTemplate({...newTemplate, scheduled_time: e.target.value})}
                                style={{ padding: '12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none' }}
                            />
                        </div>
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                                Días de la semana:
                            </label>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {dayNames.map((name, index) => {
                                    const dayNumber = index === 0 ? 7 : index;
                                    const isSelected = newTemplate.days_of_week.includes(dayNumber);
                                    return (
                                        <button key={index} type="button" onClick={() => toggleDay(dayNumber)}
                                            style={{
                                                padding: '8px 12px', borderRadius: '6px',
                                                border: isSelected ? '2px solid #10B981' : '1px solid #E5E7EB',
                                                backgroundColor: isSelected ? '#10B981' : 'white',
                                                color: isSelected ? 'white' : '#374151',
                                                cursor: 'pointer', fontSize: '12px', fontWeight: '500'
                                            }}>
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="submit" style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flex: 1 }}>
                                💾 Guardar y Generar
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} style={{ backgroundColor: '#E5E7EB', color: '#374151', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', flex: 1 }}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* PROGRESO */}
            <ProgressBar progress={progress} breakdown={progressBreakdown} />

            {/* TAREAS */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', paddingBottom: '10px', borderBottom: '2px solid #F3F4F6', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tareas de hoy</span>
                    <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'normal' }}>
                        {completedCount}/{tasks.length} completadas
                    </span>
                </h2>
                
                {tasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                        <p style={{ fontSize: '40px', marginBottom: '8px' }}>📭</p>
                        <p style={{ fontSize: '16px', color: '#6B7280' }}>No hay tareas para hoy</p>
                        <button onClick={() => setShowForm(true)} style={{ marginTop: '12px', padding: '10px 20px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                            + Crear Tarea
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {tasks.map(task => (
                            <div key={`${task.source}-${task.id}`}
                                style={{
                                    display: 'flex', alignItems: 'center', padding: '12px',
                                    borderRadius: '10px', border: task.completed ? '2px solid #A7F3D0' : '1px solid #E5E7EB',
                                    backgroundColor: task.completed ? '#ECFDF5' : '#F9FAFB',
                                    flexWrap: 'wrap', gap: '8px', transition: 'all 0.2s'
                                }}
                            >
                                {/* Checkbox */}
                                <div onClick={() => handleToggle(task.id, task.source)}
                                    style={{
                                        width: '22px', height: '22px', borderRadius: '6px',
                                        border: task.completed ? '2px solid #10B981' : '2px solid #D1D5DB',
                                        backgroundColor: task.completed ? '#10B981' : 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, cursor: 'pointer'
                                    }}>
                                    {task.completed && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                                </div>
                                
                                {/* Nombre (click para toggle) */}
                                <span onClick={() => handleToggle(task.id, task.source)}
                                    style={{
                                        fontSize: '15px', fontWeight: '500', flex: 1, minWidth: '100px',
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                        color: task.completed ? '#9CA3AF' : '#1F2937', cursor: 'pointer'
                                    }}>
                                    {task.icon || '📋'} {task.task_name}
                                </span>
                                
                                {/* Hora */}
                                {task.scheduled_time && (
                                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                                        🕐 {task.scheduled_time.substring(0, 5)}
                                    </span>
                                )}
                                
                                {/* Botón ELIMINAR */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(task.id, task.source);
                                    }}
                                    style={{
                                        backgroundColor: '#FEE2E2', color: '#DC2626',
                                        border: 'none', padding: '6px 10px', borderRadius: '6px',
                                        cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                                        marginLeft: 'auto'
                                    }}
                                    title="Eliminar tarea"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}