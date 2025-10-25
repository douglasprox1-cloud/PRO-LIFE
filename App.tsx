import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Scoreboard from './components/Scoreboard';
import NewTaskForm from './components/NewTaskForm';
import Tabs from './components/Tabs';
import KanbanBoard from './components/KanbanBoard';
import AiAssistant from './components/AiAssistant';
import SubtaskModal from './components/SubtaskModal';
import AgendaView from './components/AgendaView';
import PlaceholderView from './components/PlaceholderView';
import FinanceView from './components/FinanceView';
import GoalsView from './components/GoalsView';
import RewardsView from './components/RewardsView';
import CitationsView from './components/CitationsView';
import CompletedView from './components/CompletedView';
import { Task, DayKey, Period, Goal, Reward, Transaction } from './types';

const initialTasks: Task[] = [
    { id: '1', title: 'Testar zap voice', category: 'Expansão/Projetos', priority: 'Urgente', points: 20, subtasks: [], day: 'inbox', period: null, completed: false, date: '2025-10-24', time: '09:00', repetition: 'Não repetir' },
    { id: '2', title: 'Revisar Contrato', category: 'Pendências', priority: 'Urgente', points: 10, subtasks: [{id: 's1', text: 'Ler cláusulas', completed: true}], day: 'inbox', period: null, completed: true, date: '2025-10-23', repetition: 'Não repetir' },
    { id: '3', title: 'Iniciar projeto de posicionamento', category: 'Expansão/Projetos', priority: 'Urgente', points: 20, subtasks: [{id: 's2', text: 'Definir escopo', completed: false}], day: 'inbox', period: null, completed: false, repetition: 'Não repetir' },
    { id: '4', title: 'Atualizar Finanças', category: 'Pendências', priority: 'Quando Possível', points: 10, subtasks: [], day: 'inbox', period: null, completed: true, repetition: 'Semanalmente' },
    { id: '5', title: 'PALESTRA EMPRESA', category: 'Expansão/Projetos', priority: 'Quando Possível', points: 20, subtasks: [{id: 's3', text: 'sub1', completed: true}, {id: 's4', text: 'sub2', completed: true}, {id: 's5', text: 'sub3', completed: true}, {id: 's6', text: 'sub4', completed: false}, {id: 's7', text: 'sub5', completed: false}], day: 'friday', period: 'Manhã', completed: false, imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80', date: '2025-10-24', time: '10:00', repetition: 'Não repetir' },
    { id: '6', title: 'Audio Divergente', category: 'Hábitos', priority: 'Rotina', points: 5, subtasks: [], day: 'saturday', period: 'Tarde', completed: false, date: '2025-10-25', repetition: 'Diariamente' },
    { id: '7', title: 'Respiração Técnica', category: 'Saúde', priority: 'Rotina', points: 10, subtasks: [], day: 'saturday', period: 'Manhã', completed: true, date: '2025-10-25', time: '07:30', repetition: 'Diariamente' },
    { id: '8', title: 'Leitura', category: 'Rotina 1h', priority: 'Rotina', points: 2, subtasks: [], day: 'saturday', period: 'Noite', completed: false, date: '2025-10-25', repetition: 'Não repetir' },
    { id: '9', title: 'Plantão Hospital', category: 'Rotina 3h', priority: 'Pode Esperar', points: 5, subtasks: [], day: 'saturday', period: 'Manhã', completed: true, date: '2025-10-25', time: '08:00', repetition: 'Não repetir' },
];

const initialGoals: Goal[] = [
    { id: 'g1', title: 'Concluir 5 projetos de expansão', type: 'monthly', progress: 40, points: 100 },
    { id: 'g2', title: 'Ler 1 livro', type: 'monthly', progress: 80, points: 50 },
    { id: 'g3', title: 'Fazer 3 treinos de musculação', type: 'weekly', progress: 66, points: 25 },
    { id: 'g4', title: 'Não comer doces por 5 dias', type: 'weekly', progress: 20, points: 30 },
];

const initialRewards: Reward[] = [
    { id: 'r1', name: '1 hora de Lazer Livre', cost: 50 },
    { id: 'r2', name: 'Comprar um livro novo', cost: 150 },
    { id: 'r3', name: 'Jantar especial fora', cost: 300 },
];


const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [goals, setGoals] = useState<Goal[]>(initialGoals);
    const [rewards, setRewards] = useState<Reward[]>(initialRewards);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalPoints, setTotalPoints] = useState(0);

    const [activeTab, setActiveTab] = useState('Kanban');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Calculate scores and progress
    useEffect(() => {
        const completedTaskPoints = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
        // Assuming goal points are awarded at 100% completion
        const completedGoalPoints = goals.filter(g => g.progress === 100).reduce((sum, g) => sum + g.points, 0);
        setTotalPoints(completedTaskPoints + completedGoalPoints);
    }, [tasks, goals]);

    const handleOpenModal = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const handleUpdateTask = (updatedTask: Task) => {
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const handleToggleComplete = (taskId: string) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    };

    const handleDeleteTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    const handleAddTask = (taskData: Omit<Task, 'id' | 'subtasks' | 'completed' | 'day' | 'period'>) => {
        const newTask: Task = {
            ...taskData,
            id: `task_${Date.now()}`,
            subtasks: [],
            completed: false,
            day: 'inbox',
            period: null
        };
        setTasks(prevTasks => [newTask, ...prevTasks]);
    };

    const handleTaskDrop = (taskId: string, newDay: DayKey, newPeriod: Period | null) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, day: newDay, period: newPeriod } : task
            )
        );
    };
    
    const handleAddGoal = (goalData: Omit<Goal, 'id' | 'progress'>) => {
        const newGoal: Goal = {
            ...goalData,
            id: `goal_${Date.now()}`,
            progress: 0,
        };
        setGoals(prevGoals => [newGoal, ...prevGoals]);
    };

    const handleUpdateGoal = (goalId: string, newProgress: number) => {
        setGoals(prevGoals => prevGoals.map(goal => 
            goal.id === goalId 
            ? { ...goal, progress: Math.max(0, Math.min(100, newProgress)) } 
            : goal
        ));
    };

    const handleDeleteGoal = (goalId: string) => {
        setGoals(prevGoals => prevGoals.filter(g => g.id !== goalId));
    };
    
    const handleAddReward = (rewardData: Omit<Reward, 'id'>) => {
        const newReward: Reward = {
            ...rewardData,
            id: `reward_${Date.now()}`,
        };
        setRewards(prevRewards => [newReward, ...prevRewards]);
    };

    const handleRedeemReward = (rewardId: string) => {
        const reward = rewards.find(r => r.id === rewardId);
        if (reward && totalPoints >= reward.cost) {
            setTotalPoints(currentPoints => currentPoints - reward.cost);
            alert(`Recompensa "${reward.name}" resgatada com sucesso!`);
        } else {
            alert("Pontos insuficientes para resgatar esta recompensa.");
        }
    };
    
    const handleAddTransaction = (transactionData: Omit<Transaction, 'id'>) => {
        const newTransaction: Transaction = {
            ...transactionData,
            id: `trans_${Date.now()}`,
        };
        setTransactions(prev => [...prev, newTransaction]);
    };

    // Placeholder calculations for scoreboard
    const getDailyPoints = () => {
      return tasks.filter(t => t.completed).reduce((sum, task) => sum + task.points, 0);
    }
    
    const getDailyTaskProgress = () => {
        const todayTasks = tasks.filter(t => t.date === new Date().toISOString().split('T')[0]);
        if (todayTasks.length === 0) return 0;
        const completedToday = todayTasks.filter(t => t.completed).length;
        return (completedToday / todayTasks.length) * 100;
    };

    const getGoalsProgress = () => {
        if (goals.length === 0) return 0;
        const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
        return totalProgress / goals.length;
    };


    const renderActiveTab = () => {
        switch(activeTab) {
            case 'Kanban':
                return <KanbanBoard tasks={tasks} onToggleComplete={handleToggleComplete} onDelete={handleDeleteTask} onCardClick={handleOpenModal} onTaskDrop={handleTaskDrop} />;
            case 'Agenda':
                return <AgendaView tasks={tasks} />;
            case 'Orçamento':
                return <FinanceView transactions={transactions} onAddTransaction={handleAddTransaction} />;
            case 'Metas':
                return <GoalsView goals={goals} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal} />;
            case 'Citações':
                return <CitationsView />;
            case 'Recompensas':
                 return <RewardsView rewards={rewards} totalPoints={totalPoints} onAddReward={handleAddReward} onRedeemReward={handleRedeemReward} />;
            case 'Concluídos':
                return <CompletedView tasks={tasks} />;
            case 'Backup':
                return <PlaceholderView title={activeTab} />;
            default:
                return <KanbanBoard tasks={tasks} onToggleComplete={handleToggleComplete} onDelete={handleDeleteTask} onCardClick={handleOpenModal} onTaskDrop={handleTaskDrop} />;
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 font-sans p-4 md:p-8">
            <Header />
            <main>
                <Scoreboard 
                    dailyPoints={getDailyPoints()}
                    totalPoints={totalPoints}
                    dailyTaskProgress={getDailyTaskProgress()}
                    goalsProgress={getGoalsProgress()}
                />
                <NewTaskForm onAddTask={handleAddTask} />
                <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                {renderActiveTab()}
            </main>
            <AiAssistant />
            {selectedTask && (
                <SubtaskModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    task={selectedTask}
                    onUpdateTask={handleUpdateTask}
                />
            )}
        </div>
    );
};

export default App;