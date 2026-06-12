export default function TaskList({ tasks, onToggle }) {
    const getSourceLabel = (s) => ({ daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensual' }[s] || '');
    const getSourceColor = (s) => ({ daily: '#3B82F6', weekly: '#8B5CF6', monthly: '#EC4899' }[s] || '#6B7280');

    if (tasks.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <p style={{ fontSize: '40px', marginBottom: '8px' }}>📭</p>
                <p style={{ fontSize: '16px', color: '#6B7280' }}>No hay tareas para hoy</p>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
                    Crea plantillas o genera tareas
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {tasks.map(task => (
                <div
                    key={`${task.source}-${task.id}`}
                    onClick={() => onToggle(task.id, task.source)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        border: task.completed ? '2px solid #A7F3D0' : '1px solid #E5E7EB',
                        backgroundColor: task.completed ? '#ECFDF5' : '#F9FAFB',
                        flexWrap: 'wrap',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    {/* Checkbox */}
                    <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        border: task.completed ? '2px solid #10B981' : '2px solid #D1D5DB',
                        backgroundColor: task.completed ? '#10B981' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        {task.completed && (
                            <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                        )}
                    </div>
                    
                    {/* Nombre */}
                    <span style={{
                        fontSize: '15px',
                        fontWeight: '500',
                        flex: 1,
                        minWidth: '100px',
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? '#9CA3AF' : '#1F2937'
                    }}>
                        {task.icon || '📋'} {task.task_name}
                    </span>
                    
                    {/* Etiqueta de tipo */}
                    <span style={{
                        fontSize: '10px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        backgroundColor: `${getSourceColor(task.source)}20`,
                        color: getSourceColor(task.source),
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                    }}>
                        {getSourceLabel(task.source)}
                    </span>
                    
                    {/* Hora */}
                    {task.scheduled_time && (
                        <span style={{ fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                            🕐 {task.scheduled_time.substring(0, 5)}
                        </span>
                    )}
                    
                    {task.completed && <span style={{ fontSize: '18px' }}>✅</span>}
                </div>
            ))}
        </div>
    );
}