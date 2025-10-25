import React from 'react';
import { Task } from '../types';
import { CalendarPlusIcon } from './Icons';

interface AgendaViewProps {
    tasks: Task[];
}

const AgendaView: React.FC<AgendaViewProps> = ({ tasks }) => {
    // Filter tasks that have a date, sort them, and group by date
    const scheduledTasks = tasks
        .filter(task => !!task.date)
        .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

    const groupedTasks = scheduledTasks.reduce((acc, task) => {
        const date = new Date(task.date!).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    const generateGoogleCalendarLink = (task: Task) => {
        if (!task.date) return '#';
        
        const startDate = new Date(`${task.date}T${task.time || '00:00:00'}`);
        // Default to a 1-hour duration if no time is specified
        const endDate = new Date(startDate.getTime() + (task.time ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
        
        const toGCalTime = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
        
        const url = new URL('https://www.google.com/calendar/render');
        url.searchParams.append('action', 'TEMPLATE');
        url.searchParams.append('text', task.title);
        url.searchParams.append('dates', `${toGCalTime(startDate)}/${toGCalTime(endDate)}`);
        url.searchParams.append('details', `Tarefa do Lifeboard Pro.\nPontos: ${task.points}\nPrioridade: ${task.priority}`);
        
        return url.toString();
    };


    return (
        <div className="p-4 text-white">
            <h2 className="text-2xl font-bold mb-6">Agenda</h2>
            {Object.keys(groupedTasks).length > 0 ? (
                <div className="space-y-6">
                    {/* FIX: Replaced Object.entries with Object.keys to prevent type inference issues on the mapped value. */}
                    {Object.keys(groupedTasks).map((date) => (
                        <div key={date}>
                            <h3 className="text-lg font-semibold text-indigo-400 mb-2 capitalize">{date}</h3>
                            <div className="space-y-2">
                                {groupedTasks[date].map(task => (
                                    <div key={task.id} className="bg-slate-800 rounded-md p-3 flex justify-between items-center">
                                        <div>
                                            <p className={`font-medium ${task.completed ? 'line-through text-slate-500' : ''}`}>{task.title}</p>
                                            <p className="text-sm text-slate-400">
                                                {task.time ? `Às ${task.time}` : 'Dia todo'} - Categoria: {task.category}
                                            </p>
                                        </div>
                                        <a 
                                           href={generateGoogleCalendarLink(task)}
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-sm py-1 px-3 rounded-md transition-colors"
                                           title="Adicionar ao Google Agenda"
                                        >
                                           <CalendarPlusIcon className="w-4 h-4" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-slate-400">Nenhuma tarefa agendada.</p>
                    <p className="text-sm text-slate-500">Adicione uma data às suas tarefas para vê-las aqui.</p>
                </div>
            )}
        </div>
    );
};

export default AgendaView;