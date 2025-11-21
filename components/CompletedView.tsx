import React from 'react';
import { Task } from '../types';
import { CheckCircleIcon } from './Icons';

interface CompletedViewProps {
    tasks: Task[];
}

const CompletedView: React.FC<CompletedViewProps> = ({ tasks }) => {
    const completedTasks = tasks
        .filter(task => task.completed)
        .sort((a, b) => new Date(b.completionDate || 0).getTime() - new Date(a.completionDate || 0).getTime());

    return (
        <div className="p-4 text-white">
            <h2 className="text-2xl font-bold mb-6">Tarefas Concluídas</h2>
            {completedTasks.length > 0 ? (
                <div className="space-y-3">
                    {completedTasks.map(task => (
                        <div key={task.id} className="bg-slate-800 rounded-md p-4 flex items-center justify-between opacity-80">
                            <div className="flex items-center">
                                <CheckCircleIcon className={`w-6 h-6 mr-4 ${task.resolution === 'defeated' ? 'text-red-500' : 'text-green-500'}`} />
                                <div>
                                    <p className="font-medium text-slate-400 line-through">{task.title}</p>
                                    <p className="text-sm text-slate-500">
                                        {`Concluída em ${task.completionDate ? new Date(task.completionDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'data desconhecida'} - `}
                                        {task.category === 'Padrão Paralelo' ? (
                                            <span className={task.resolution === 'winner' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                                                {task.resolution === 'winner' ? `+${task.points} pts (Vencedor)` : `${-task.points} pts (Derrotado)`}
                                            </span>
                                        ) : (
                                            <span>(+{task.points} pts)</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-slate-800 rounded-lg">
                    <p className="text-slate-400">Nenhuma tarefa foi concluída ainda.</p>
                    <p className="text-sm text-slate-500">Conclua tarefas no Kanban para vê-las aqui.</p>
                </div>
            )}
        </div>
    );
};

export default CompletedView;