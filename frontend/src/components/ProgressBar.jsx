export default function ProgressBar({ progress }) {
    // Asegurar que progress sea un número
    const progressValue = typeof progress === 'number' ? progress : parseFloat(progress) || 0;
    
    const getColor = () => {
        if (progressValue >= 80) return 'bg-green-500';
        if (progressValue >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                    Progreso del día
                </span>
                <span className="text-sm font-bold text-gray-700">
                    {progressValue.toFixed(1)}%
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                    className={`${getColor()} h-4 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(progressValue, 100)}%` }}
                />
            </div>
            {progressValue === 100 && (
                <p className="text-green-600 font-semibold mt-2 text-center">
                    🎉 ¡Todas las tareas completadas!
                </p>
            )}
        </div>
    );
}