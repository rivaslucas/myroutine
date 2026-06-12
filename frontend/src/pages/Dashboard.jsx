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
        console.log('📋 Tareas cargadas:', tasksRes.data);
        
        if (tasksRes.data.success) {
            const loadedTasks = tasksRes.data.tasks || [];
            setTasks(loadedTasks);
            
            // Calcular progreso localmente también
            const completed = loadedTasks.filter(t => t.completed).length;
            const total = loadedTasks.length;
            const pct = total > 0 ? (completed / total) * 100 : 0;
            setProgress(pct);
        }
        
        // También obtener del servidor por si hay diferencias
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
    console.log('🔄 Toggle:', taskId, source);
    
    // Actualizar tareas visualmente
    setTasks(prevTasks => {
        const newTasks = prevTasks.map(task => 
            task.id === taskId && task.source === source
                ? { ...task, completed: !task.completed }
                : task
        );
        console.log('📋 Completadas:', newTasks.filter(t => t.completed).length, '/', newTasks.length);
        
        // Calcular progreso manualmente
        const completed = newTasks.filter(t => t.completed).length;
        const total = newTasks.length;
        const newProgress = total > 0 ? (completed / total) * 100 : 0;
        console.log('📊 Nuevo progreso:', newProgress);
        setProgress(newProgress);
        
        return newTasks;
    });
    
    try {
        const response = await api.put(`/tasks/${taskId}/toggle`, { source: source || 'daily' });
        console.log('✅ Server:', response.data);
    } catch (error) {
        console.error('❌ Error:', error);
        loadData();
    }
};
    const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
        await api.post('/tasks/template', newTemplate);
        setShowForm(false);
        setNewTemplate({ task_name: '', scheduled_time: '', days_of_week: [1, 2, 3, 4, 5, 6, 7] });
        alert('✅ Plantilla creada correctamente');
        await loadData(); // Recargar para actualizar progreso
    } catch (error) {
        console.error('Error creando plantilla:', error);
        alert('Error al crear plantilla');
    }
};
  const generateTodayTasks = async () => {
    try {
        const response = await api.post('/tasks/generate-today');
        if (response.data.success) {
            alert('✅ ' + response.data.message);
            await loadData(); // Recargar todo del servidor
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
                        disabled={updating}
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
                            minWidth: '100px',
                            opacity: updating ? 0.7 : 1
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
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            {/* FORMULARIO NUEVA TAREA */}
            {showForm && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '2px solid #10B981'
                }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1F2937' }}>
                        ✨ Nueva Tarea Diaria
                    </h3>
                    <form onSubmit={handleCreateTemplate}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                            <input
                                type="text"
                                required
                                placeholder="Nombre de la tarea *"
                                value={newTemplate.task_name}
                                onChange={(e) => setNewTemplate({...newTemplate, task_name: e.target.value})}
                                style={{
                                    padding: '12px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#10B981'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                            />
                            <input
                                type="time"
                                value={newTemplate.scheduled_time}
                                onChange={(e) => setNewTemplate({...newTemplate, scheduled_time: e.target.value})}
                                style={{
                                    padding: '12px',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px', color: '#374151' }}>
                                Días de la semana:
                            </label>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {dayNames.map((name, index) => {
                                    const dayNumber = index === 0 ? 7 : index;
                                    const isSelected = newTemplate.days_of_week.includes(dayNumber);
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => toggleDay(dayNumber)}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                border: isSelected ? '2px solid #10B981' : '1px solid #E5E7EB',
                                                backgroundColor: isSelected ? '#10B981' : 'white',
                                                color: isSelected ? 'white' : '#374151',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="submit"
                                style={{
                                    backgroundColor: '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    flex: 1
                                }}
                            >
                                💾 Guardar Plantilla
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                style={{
                                    backgroundColor: '#E5E7EB',
                                    color: '#374151',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    flex: 1
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* BARRA DE PROGRESO */}
            <ProgressBar progress={progress} breakdown={progressBreakdown} />

            {/* LISTA DE TAREAS */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}>
                <h2 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1F2937',
                    marginBottom: '12px',
                    paddingBottom: '10px',
                    borderBottom: '2px solid #F3F4F6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>Tareas de hoy</span>
                    <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'normal' }}>
                        {completedCount}/{tasks.length} completadas
                    </span>
                </h2>
                
                <TaskList tasks={tasks} onToggle={handleToggle} />
            </div>

            {/* Leyenda */}
            {tasks.length > 0 && (
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    justifyContent: 'center',
                    marginTop: '12px',
                    fontSize: '11px',
                    color: '#9CA3AF'
                }}>
                    <span>📋 Diaria</span>
                    <span>📊 Semanal</span>
                    <span>📆 Mensual</span>
                </div>
            )}
        </div>
    );
}