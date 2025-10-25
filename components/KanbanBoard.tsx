
import React from 'react';
import { Task, DayKey, Period } from '../types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onCardClick: (task: Task) => void;
  onTaskDrop: (taskId: string, newDay: DayKey, newPeriod: Period | null) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onToggleComplete, onDelete, onCardClick, onTaskDrop }) => {
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
            />
            <KanbanColumn 
                title="Sexta-Feira" 
                date="24/10" 
                day="friday"
                tasks={tasks.filter(t => t.day === 'friday' && !t.completed)} 
                onToggleComplete={onToggleComplete} 
                onDelete={onDelete} 
                onCardClick={onCardClick} 
                onTaskDrop={onTaskDrop}
            />
            <KanbanColumn 
                title="Sábado" 
                date="25/10" 
                day="saturday"
                tasks={tasks.filter(t => t.day === 'saturday' && !t.completed)} 
                onToggleComplete={onToggleComplete} 
                onDelete={onDelete} 
                onCardClick={onCardClick}
                onTaskDrop={onTaskDrop}
            />
        </div>
    </div>
  );
};

export default KanbanBoard;
