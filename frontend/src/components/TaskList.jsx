export default function TaskList({ tasks, onToggle }) {
    if (tasks.length === 0) {
        return (
            <p className="text-gray-500 text-center py-4">
                No hay tareas para hoy. ¡Agrega algunas!
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {tasks.map(task => (
                <div
                    key={task.id}
                    className={`flex items-center p-3 rounded-lg border transition-all ${
                        task.completed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                >
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onToggle(task.id, task.completed)}
                        className="w-5 h-5 mr-3 cursor-pointer"
                    />
                    <div className="flex-grow">
                        <span
                            className={`text-lg ${
                                task.completed
                                    ? 'line-through text-gray-400'
                                    : 'text-gray-700'
                            }`}
                        >
                            {task.task_name}
                        </span>
                        {task.scheduled_time && (
                            <span className="text-sm text-gray-500 ml-2">
                                🕐 {task.scheduled_time.substring(0, 5)}
                            </span>
                        )}
                    </div>
                    {task.completed && (
                        <span className="text-green-500 ml-2">✅</span>
                    )}
                </div>
            ))}
        </div>
    );
}