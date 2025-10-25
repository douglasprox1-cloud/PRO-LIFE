import React from 'react';
import { Task, Category, Priority } from '../types';
import { FireIcon, EditIcon, TrashIcon, ClockIcon, LoopIcon, CoffeeIcon } from './Icons';

interface KanbanCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onClick: (task: Task) => void;
}

const categoryStyles: { [key in Category]: { border: string, bg: string } } = {
    'Rotina 1h': { border: 'border-l-sky-400', bg: 'bg-sky-400/10' },
    'Rotina 3h': { border: 'border-l-blue-500', bg: 'bg-blue-500/10' },
    'Saúde': { border: 'border-l-green-500', bg: 'bg-green-500/10' },
    'Pendências': { border: 'border-l-yellow-400', bg: 'bg-yellow-400/10' },
    'Expansão/Projetos': { border: 'border-l-orange-500', bg: 'bg-orange-500/10' },
    'Hábitos': { border: 'border-l-pink-500', bg: 'bg-pink-500/10' },
};

const priorityIcons: { [key in Priority]: React.ReactNode } = {
    'Urgente': <FireIcon className="w-5 h-5 text-red-500" />,
    'Quando Possível': <ClockIcon className="w-5 h-5 text-slate-400" />,
    'Rotina': <LoopIcon className="w-5 h-5 text-blue-400" />,
    'Pode Esperar': <CoffeeIcon className="w-5 h-5 text-amber-700" />,
};

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onToggleComplete, onDelete, onClick }) => {
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  const handleCheckboxClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleComplete(task.id);
  }
  
  const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(task.id);
  }

  const isRecurring = task.repetition && task.repetition !== 'Não repetir';

  return (
    <div 
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task.id);
        e.currentTarget.style.opacity = '0.4';
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      className={`bg-slate-800 rounded-lg p-3.5 mb-4 border-l-4 cursor-grab active:cursor-grabbing hover:bg-slate-700/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 ${categoryStyles[task.category].border}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-white">{task.title}</h4>
        <div className="flex items-center space-x-2">
            {isRecurring && <LoopIcon className="w-5 h-5 text-slate-400" title={`Repete ${task.repetition?.toLowerCase()}`} />}
            {priorityIcons[task.priority]}
        </div>
      </div>
      
      {task.imageUrl && (
        <div className="my-3 rounded-md overflow-hidden">
            <img src={task.imageUrl} alt={task.title} className="w-full h-auto object-cover" />
        </div>
      )}

      {totalSubtasks > 0 && (
        <div className="my-3">
          <span className="text-xs text-slate-400">{completedSubtasks} de {totalSubtasks} concluídas</span>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}></div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-4">
        <span className="text-yellow-400 font-bold text-sm">+{task.points} Pts</span>
        <div className="flex items-center space-x-2">
           <button onClick={(e) => { e.stopPropagation(); onClick(task); }} className="text-slate-500 hover:text-indigo-400 transition-colors p-1" aria-label="Editar subtarefas">
                <EditIcon className="w-4 h-4"/>
            </button>
          <button onClick={handleCheckboxClick} className="cursor-pointer p-1" aria-label="Completar tarefa">
            <input 
                type="checkbox" 
                checked={task.completed}
                readOnly
                className="form-checkbox h-5 w-5 bg-slate-700 border-slate-600 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer pointer-events-none" 
            />
          </button>
          <button onClick={handleDeleteClick} className="text-slate-500 hover:text-red-500 transition-colors p-1" aria-label="Excluir tarefa"><TrashIcon className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;