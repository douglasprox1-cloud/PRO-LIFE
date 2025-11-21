

import React from 'react';
import { Task, DayKey, Period, DailyNote, Attachment } from '../types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onCardClick: (task: Task) => void;
  onTaskDrop: (taskId: string, newDay: DayKey, newPeriod: Period | null) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDuplicate: (taskId: string) => void;
  onResolveParallelTask: (taskId: string, resolution: 'winner' | 'defeated') => void;
  dailyNotes: DailyNote[];
  onUpdateNote: (day: DayKey, content: string) => void;
  onAddAttachment: (day: DayKey, file: File) => void;
  onDeleteAttachment: (day: DayKey, attachmentId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onToggleComplete, onDelete, onCardClick, onTaskDrop, onToggleSubtask, onDuplicate, onResolveParallelTask, dailyNotes, onUpdateNote, onAddAttachment, onDeleteAttachment }) => {
  const today = new Date();
  const currentDayIndex = today.getDay(); // 0 = Sunday, 6 = Saturday

  const daysOfWeek = [
    { key: 'sunday' as DayKey, label: 'Domingo' },
    { key: 'monday' as DayKey, label: 'Segunda-Feira' },
    { key: 'tuesday' as DayKey, label: 'Terça-Feira' },
    { key: 'wednesday' as DayKey, label: 'Quarta-Feira' },
    { key: 'thursday' as DayKey, label: 'Quinta-Feira' },
    { key: 'friday' as DayKey, label: 'Sexta-Feira' },
    { key: 'saturday' as DayKey, label: 'Sábado' },
  ];
  
  const getDayDate = (dayIndex: number) => {
      const date = new Date(today);
      const diff = dayIndex - currentDayIndex;
      date.setDate(today.getDate() + diff);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const visibleDays = daysOfWeek.filter((_, index) => index >= currentDayIndex);
  const inboxNote = dailyNotes.find(n => n.day === 'inbox');

  return (
    <div className="px-4 pb-4">
        <div className="flex space-x-4 overflow-x-auto pb-4">
            <KanbanColumn 
                title="Caixa De Entrada" 
                date=""
                day="inbox"
                tasks={tasks.filter(t => t.day === 'inbox' && !t.completed)} 
                onToggleComplete={onToggleComplete} 
                onDelete={onDelete} 
                onCardClick={onCardClick} 
                onTaskDrop={onTaskDrop}
                onToggleSubtask={onToggleSubtask}
                onDuplicate={onDuplicate}
                onResolveParallelTask={onResolveParallelTask}
                note={inboxNote}
                onUpdateNote={onUpdateNote}
                onAddAttachment={onAddAttachment}
                onDeleteAttachment={onDeleteAttachment}
            />
            {visibleDays.map(day => {
                const columnNote = dailyNotes.find(n => n.day === day.key);
                return (
                 <KanbanColumn 
                    key={day.key}
                    title={day.label} 
                    date={getDayDate(daysOfWeek.findIndex(d => d.key === day.key))}
                    day={day.key}
                    tasks={tasks.filter(t => t.day === day.key && !t.completed)} 
                    onToggleComplete={onToggleComplete} 
                    onDelete={onDelete} 
                    onCardClick={onCardClick} 
                    onTaskDrop={onTaskDrop}
                    onToggleSubtask={onToggleSubtask}
                    onDuplicate={onDuplicate}
                    onResolveParallelTask={onResolveParallelTask}
                    note={columnNote}
                    onUpdateNote={onUpdateNote}
                    onAddAttachment={onAddAttachment}
                    onDeleteAttachment={onDeleteAttachment}
                />
            )})}
        </div>
    </div>
  );
};

export default KanbanBoard;