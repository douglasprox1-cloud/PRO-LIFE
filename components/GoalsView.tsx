import React, { useState } from 'react';
import { Goal } from '../types';
import { StarIcon, TrashIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

interface GoalsViewProps {
    goals: Goal[];
    onAddGoal: (goalData: Omit<Goal, 'id' | 'progress'>) => void;
    onUpdateGoal: (goalId: string, newProgress: number) => void;
    onDeleteGoal: (goalId: string) => void;
}

const GoalCard: React.FC<{ goal: Goal; onUpdate: (id: string, progress: number) => void; onDelete: (id: string) => void; }> = ({ goal, onUpdate, onDelete }) => {
    const isCompleted = goal.progress === 100;
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-slate-800 p-4 rounded-lg border-l-4 ${isCompleted ? 'border-green-500' : 'border-indigo-500'}`}
        >
            <div className="flex justify-between items-start">
                <h4 className={`font-bold ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>{goal.title}</h4>
                <span className="text-yellow-400 font-bold text-sm flex items-center gap-1">
                    <StarIcon className="w-4 h-4" />
                    {goal.points}
                </span>
            </div>
            <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-400">Progresso</span>
                     <span className={`text-xs font-medium ${isCompleted ? 'text-green-400' : 'text-indigo-400'}`}>{goal.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div 
                       className={`${isCompleted ? 'bg-green-500' : 'bg-indigo-600'} h-2.5 rounded-full transition-all duration-500`} 
                       style={{ width: `${goal.progress}%`}}
                    ></div>
                </div>
            </div>
             <div className="flex justify-end items-center gap-2 mt-3">
                <button onClick={() => onDelete(goal.id)} className="text-slate-500 hover:text-red-500 transition-colors p-1" aria-label="Excluir meta">
                    <TrashIcon className="w-4 h-4" />
                </button>
                <button onClick={() => onUpdate(goal.id, goal.progress - 10)} className="bg-slate-700 hover:bg-slate-600 px-3 py-1 text-sm rounded-md font-bold">-</button>
                <button onClick={() => onUpdate(goal.id, goal.progress + 10)} className="bg-slate-700 hover:bg-slate-600 px-3 py-1 text-sm rounded-md font-bold">+</button>
            </div>
        </motion.div>
    );
};

const GoalsView: React.FC<GoalsViewProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalPoints, setNewGoalPoints] = useState('');
    const [newGoalType, setNewGoalType] = useState<'weekly' | 'monthly'>('weekly');

    const weeklyGoals = goals.filter(g => g.type === 'weekly');
    const monthlyGoals = goals.filter(g => g.type === 'monthly');

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        const points = parseInt(newGoalPoints, 10);
        if (!newGoalTitle.trim() || isNaN(points) || points <= 0) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        onAddGoal({
            title: newGoalTitle,
            points,
            type: newGoalType,
        });

        setNewGoalTitle('');
        setNewGoalPoints('');
    };

    return (
        <div className="p-4 text-white space-y-8">
            {/* Form to add new goal */}
            <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Adicionar Nova Meta</h3>
                <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Título da Meta</label>
                        <input 
                            type="text" 
                            placeholder="Ex: Ler 1 livro" 
                            className="w-full bg-slate-700 p-2 rounded-md" 
                            value={newGoalTitle}
                            onChange={(e) => setNewGoalTitle(e.target.value)}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Pontos</label>
                        <input 
                            type="number" 
                            placeholder="Ex: 50" 
                            className="w-full bg-slate-700 p-2 rounded-md" 
                            value={newGoalPoints}
                            onChange={(e) => setNewGoalPoints(e.target.value)}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Tipo</label>
                        <select 
                            className="w-full bg-slate-700 p-2 rounded-md"
                            value={newGoalType}
                            onChange={(e) => setNewGoalType(e.target.value as 'weekly' | 'monthly')}
                        >
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensal</option>
                        </select>
                    </div>
                    <button type="submit" className="md:col-start-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md h-10">Adicionar</button>
                </form>
            </div>

            {/* Goals display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Metas Semanais</h2>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {weeklyGoals.map(goal => <GoalCard key={goal.id} goal={goal} onUpdate={onUpdateGoal} onDelete={onDeleteGoal} />)}
                        </AnimatePresence>
                        {weeklyGoals.length === 0 && <p className="text-slate-500">Nenhuma meta semanal definida.</p>}
                    </div>
                </div>
                 <div>
                    <h2 className="text-2xl font-bold mb-4">Metas Mensais</h2>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {monthlyGoals.map(goal => <GoalCard key={goal.id} goal={goal} onUpdate={onUpdateGoal} onDelete={onDeleteGoal} />)}
                        </AnimatePresence>
                        {monthlyGoals.length === 0 && <p className="text-slate-500">Nenhuma meta mensal definida.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalsView;