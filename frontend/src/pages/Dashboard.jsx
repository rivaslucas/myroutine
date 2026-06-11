import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [progress, setProgress] = useState(0);
    const [progressBreakdown, setProgressBreakdown] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
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
            
            // Cargar tareas
            const tasksRes = await api.get('/tasks/today');
            if (tasksRes.data.success) {
                setTasks(tasksRes.data.tasks || []);
            }
            
            // Cargar progreso
            const progressRes = await api.get('/tasks/progress/today');
            if (progressRes.data.success && progressRes.data.progress) {
                setProgress(parseFloat(progressRes.data.progress.progress_percentage) || 0);
                setProgressBreakdown(progressRes.data.progress.breakdown || null);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (taskId, source) => {
        try {
            await api.put(`/tasks/${taskId}/toggle`, { source: source || 'daily' });
            loadData();
        } catch (error) {
            console.error('Error al marcar tarea:', error);
        }
    };

    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks/template', newTemplate);
            setShowForm(false);
            setNewTemplate({ task_name: '', scheduled_time: '', days_of_week: [1,2,3,4,5,6,7] });
            alert('✅ Plantilla creada correctamente');
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
                loadData();
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

    // Colores de progreso
    const getProgressColor = () => {
        if (progress >= 80) return '#10B981';
        if (progress >= 50) return '#F59E0B';
        return '#EF4444';
    };

    // Obtener etiqueta según fuente
    const getSourceLabel = (source) => {
        switch(source) {
            case 'daily': return 'Diaria';
            case 'weekly': return 'Semanal';
            case 'monthly': return 'Mensual';
            default: return '';
        }
    };

    const getSourceColor = (source) => {
        switch(source) {
            case 'daily': return '#3B82F6';
            case 'weekly': return '#8B5CF6';
            case 'monthly': return '#EC4899';
            default: return '#6B7280';
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
                    <p style={{ fontSize: '18px', color: '#6B7280' }}>Cargando tareas...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '750px', margin: '0 auto', padding: '20px' }}>
            
            {/* TÍTULO Y BOTONES */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <h1 style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#1F2937',
                    margin: 0
                }}>
                    📋 Mi Día
                </h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={generateTodayTasks}
                        style={{
                            backgroundColor: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2563EB'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3B82F6'}
                    >
                        🔄 Generar
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            backgroundColor: '#10B981',
                            color: 'white',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#10B981'}
                    >
                        + Nueva Tarea
                    </button>
                </div>
            </div>

            <p style={{ color: '#6B7280', marginBottom: '24px', fontSize: '15px' }}>
                {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            {/* FORMULARIO NUEVA TAREA */}
            {showForm && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #E5E7EB'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1F2937' }}>
                        ✨ Crear Nueva Tarea Diaria
                    </h3>
                    <form onSubmit={handleCreateTemplate}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                                    Nombre de la tarea *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Tender la cama"
                                    value={newTemplate.task_name}
                                    onChange={(e) => setNewTemplate({...newTemplate, task_name: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                                    Hora
                                </label>
                                <input
                                    type="time"
                                    value={newTemplate.scheduled_time}
                                    onChange={(e) => setNewTemplate({...newTemplate, scheduled_time: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                                Días de la semana
                            </label>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {dayNames.map((name, index) => {
                                    const dayNumber = index === 0 ? 7 : index;
                                    const isSelected = newTemplate.days_of_week.includes(dayNumber);
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => toggleDay(dayNumber)}
                                            style={{
                                                padding: '8px 14px',
                                                borderRadius: '8px',
                                                border: isSelected ? '2px solid #3B82F6' : '2px solid #E5E7EB',
                                                backgroundColor: isSelected ? '#3B82F6' : 'white',
                                                color: isSelected ? 'white' : '#374151',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                fontSize: '13px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="submit"
                                style={{
                                    backgroundColor: '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#10B981'}
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
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#D1D5DB'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#E5E7EB'}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* BARRA DE PROGRESO */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #E5E7EB'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '600', color: '#374151', fontSize: '16px' }}>
                        Progreso del día
                    </span>
                    <span style={{ fontWeight: '700', fontSize: '26px', color: getProgressColor() }}>
                        {progress.toFixed(1)}%
                    </span>
                </div>
                
                {/* Barra de progreso */}
                <div style={{ width: '100%', height: '22px', backgroundColor: '#E5E7EB', borderRadius: '11px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{
                        width: `${Math.min(progress, 100)}%`,
                        height: '100%',
                        backgroundColor: getProgressColor(),
                        borderRadius: '11px',
                        transition: 'width 0.6s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        minWidth: progress > 15 ? '40px' : '0'
                    }}>
                        {progress > 15 && `${Math.round(progress)}%`}
                    </div>
                </div>

                {/* Desglose por tipo */}
                {progressBreakdown && (
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#6B7280' }}>
                        <span>📋 {progressBreakdown.daily.completed}/{progressBreakdown.daily.total} diarias</span>
                        <span>📊 {progressBreakdown.weekly.completed}/{progressBreakdown.weekly.total} semanales</span>
                        <span>📆 {progressBreakdown.monthly.completed}/{progressBreakdown.monthly.total} mensuales</span>
                    </div>
                )}

                {progress === 100 && (
                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                        <span style={{ fontSize: '24px' }}>🎉</span>
                        <p style={{ color: '#10B981', fontWeight: '600', margin: '4px 0 0 0' }}>
                            ¡Todas las tareas completadas!
                        </p>
                    </div>
                )}
            </div>

            {/* LISTA DE TAREAS */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #E5E7EB'
            }}>
                <h2 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#1F2937',
                    marginBottom: '20px',
                    paddingBottom: '12px',
                    borderBottom: '2px solid #F3F4F6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>Tareas de hoy</span>
                    <span style={{ 
                        fontSize: '14px', 
                        color: '#6B7280',
                        fontWeight: 'normal'
                    }}>
                        {completedCount}/{tasks.length} completadas
                    </span>
                </h2>

                {tasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                        <div style={{ fontSize: '60px', marginBottom: '16px' }}>📭</div>
                        <p style={{ fontSize: '18px', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
                            No hay tareas para hoy
                        </p>
                        <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '20px' }}>
                            Crea plantillas diarias, planes semanales o mensuales
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowForm(true)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                + Tarea Diaria
                            </button>
                            <button
                                onClick={generateTodayTasks}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#3B82F6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                🔄 Generar Tareas
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {tasks.map((task) => (
                            <div
                                key={`${task.source}-${task.id}`}
                                onClick={() => handleToggle(task.id, task.source)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '14px 16px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    border: task.completed ? '2px solid #A7F3D0' : '2px solid #E5E7EB',
                                    backgroundColor: task.completed ? '#ECFDF5' : '#F9FAFB',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    if (!task.completed) {
                                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                                        e.currentTarget.style.borderColor = '#D1D5DB';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!task.completed) {
                                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                    }
                                }}
                            >
                                {/* Checkbox personalizado */}
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '7px',
                                    border: task.completed ? '2px solid #10B981' : '2px solid #D1D5DB',
                                    backgroundColor: task.completed ? '#10B981' : 'white',
                                    marginRight: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    transition: 'all 0.2s'
                                }}>
                                    {task.completed && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </div>
                                
                                {/* Icono y nombre */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '18px' }}>{task.icon || '📋'}</span>
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            color: task.completed ? '#9CA3AF' : '#1F2937',
                                            textDecoration: task.completed ? 'line-through' : 'none'
                                        }}>
                                            {task.task_name}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Etiqueta de origen */}
                                <span style={{
                                    fontSize: '11px',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    backgroundColor: task.completed ? '#E5E7EB' : `${getSourceColor(task.source)}15`,
                                    color: task.completed ? '#9CA3AF' : getSourceColor(task.source),
                                    fontWeight: '600',
                                    marginRight: '10px'
                                }}>
                                    {getSourceLabel(task.source)}
                                </span>
                                
                                {/* Hora */}
                                {task.scheduled_time && (
                                    <span style={{
                                        fontSize: '13px',
                                        color: task.completed ? '#D1D5DB' : '#6B7280',
                                        marginRight: '8px'
                                    }}>
                                        🕐 {task.scheduled_time.substring(0, 5)}
                                    </span>
                                )}
                                
                                {/* Check de completado */}
                                {task.completed && (
                                    <span style={{ fontSize: '20px' }}>✅</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Leyenda */}
            {tasks.length > 0 && (
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    justifyContent: 'center',
                    marginTop: '16px',
                    fontSize: '12px',
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