
import React, { useState } from 'react';
import { Task, DayKey, Period } from '../types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  title: string;
  date: string;
  tasks: Task[];
  day: DayKey;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onCardClick: (task: Task) => void;
  onTaskDrop: (taskId: string, day: DayKey, period: Period | null) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, date, tasks, day, onToggleComplete, onDelete, onCardClick, onTaskDrop }) => {
  const morningTasks = tasks.filter(t => t.period === 'Manhã');
  const afternoonTasks = tasks.filter(t => t.period === 'Tarde');
  const nightTasks = tasks.filter(t => t.period === 'Noite');
  const unscheduledTasks = tasks.filter(t => !t.period);

  const [dragOver, setDragOver] = useState<Period | 'unscheduled' | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, period: Period | null) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
        onTaskDrop(taskId, day, period);
    }
    setDragOver(null);
  };
  
  const getDropZoneClasses = (zone: Period | 'unscheduled') => {
      return dragOver === zone ? 'bg-indigo-900/50 border-indigo-500' : 'border-transparent';
  }

  return (
    <div className="flex-shrink-0 w-80 lg:w-96 bg-slate-800/50 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-white">{title}</h3>
        <span className="text-sm text-slate-400">{date}</span>
      </div>
      
      <div 
        className={`min-h-[5rem] rounded-lg p-1 border-2 border-dashed transition-colors ${getDropZoneClasses('unscheduled')}`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, null)}
        onDragEnter={(e) => { e.preventDefault(); setDragOver('unscheduled'); }}
        onDragLeave={() => setDragOver(null)}
      >
        {unscheduledTasks.map(task => <KanbanCard key={task.id} task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} onClick={onCardClick} />)}
      </div>
      
      <div 
        className={`min-h-[5rem] rounded-lg bg-blue-500/10 p-3 border-2 border-dashed transition-colors ${getDropZoneClasses('Manhã')}`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'Manhã')}
        onDragEnter={(e) => { e.preventDefault(); setDragOver('Manhã'); }}
        onDragLeave={() => setDragOver(null)}
      >
        <h4 className="font-semibold text-sm text-blue-400 mb-2 pointer-events-none">☀️ Manhã</h4>
        {morningTasks.map(task => <KanbanCard key={task.id} task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} onClick={onCardClick} />)}
      </div>

      <div 
        className={`min-h-[5rem] rounded-lg bg-orange-500/10 p-3 border-2 border-dashed transition-colors ${getDropZoneClasses('Tarde')}`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'Tarde')}
        onDragEnter={(e) => { e.preventDefault(); setDragOver('Tarde'); }}
        onDragLeave={() => setDragOver(null)}
      >
        <h4 className="font-semibold text-sm text-orange-400 mb-2 pointer-events-none">🌤️ Tarde</h4>
        {afternoonTasks.map(task => <KanbanCard key={task.id} task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} onClick={onCardClick} />)}
      </div>

      <div 
         className={`min-h-[5rem] rounded-lg bg-purple-500/10 p-3 border-2 border-dashed transition-colors ${getDropZoneClasses('Noite')}`}
         onDragOver={handleDragOver}
         onDrop={(e) => handleDrop(e, 'Noite')}
         onDragEnter={(e) => { e.preventDefault(); setDragOver('Noite'); }}
         onDragLeave={() => setDragOver(null)}
      >
        <h4 className="font-semibold text-sm text-purple-400 mb-2 pointer-events-none">🌙 Noite</h4>
        {nightTasks.map(task => <KanbanCard key={task.id} task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} onClick={onCardClick} />)}
      </div>
    </div>
  );
};

export default KanbanColumn;
