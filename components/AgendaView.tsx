import React, { useState } from 'react';
import { Task } from '../types';
import { CalendarPlusIcon } from './Icons';

interface AgendaViewProps {
    tasks: Task[];
}

const AgendaView: React.FC<AgendaViewProps> = ({ tasks }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const generateGoogleCalendarLink = (task: Task) => {
        if (!task.date) return '#';
        
        const startDate = new Date(`${task.date}T${task.time || '00:00:00'}`);
        const endDate = new Date(startDate.getTime() + (task.time ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
        
        const toGCalTime = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
        
        const url = new URL('https://www.google.com/calendar/render');
        url.searchParams.append('action', 'TEMPLATE');
        url.searchParams.append('text', task.title);
        url.searchParams.append('dates', `${toGCalTime(startDate)}/${toGCalTime(endDate)}`);
        url.searchParams.append('details', `Tarefa do Lifeboard Pro.\nPontos: ${task.points}\nPrioridade: ${task.priority}`);
        
        return url.toString();
    };

    const changeMonth = (offset: number) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const calendarDays = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="border border-slate-800"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const tasksForDay = tasks.filter(task => task.date === dateStr);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            calendarDays.push(
                <div key={day} className={`border border-slate-800 p-2 flex flex-col min-h-[120px] ${isToday ? 'bg-indigo-900/30' : ''}`}>
                    <span className={`font-bold ${isToday ? 'text-indigo-400' : 'text-white'}`}>{day}</span>
                    <div className="mt-1 space-y-1 overflow-y-auto text-xs">
                        {tasksForDay.map(task => (
                            <div key={task.id} className={`p-1.5 rounded-md flex justify-between items-start ${task.completed ? 'bg-slate-700/50 opacity-60' : 'bg-slate-700'}`}>
                                <p className={`font-medium ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
                                <a 
                                   href={generateGoogleCalendarLink(task)}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-slate-400 hover:text-indigo-400 ml-1 flex-shrink-0"
                                   title="Adicionar ao Google Agenda"
                                   onClick={e => e.stopPropagation()}
                                >
                                   <CalendarPlusIcon className="w-4 h-4" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return calendarDays;
    };

    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="p-4 text-white bg-slate-800/50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-slate-700 rounded-md hover:bg-slate-600">&lt;</button>
                <h2 className="text-2xl font-bold capitalize">
                    {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-slate-700 rounded-md hover:bg-slate-600">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-800">
                {weekdays.map(day => (
                    <div key={day} className="text-center font-semibold text-slate-400 py-2 bg-slate-800">{day}</div>
                ))}
                {renderCalendar()}
            </div>
        </div>
    );
};

export default AgendaView;
