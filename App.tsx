

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Scoreboard from './components/Scoreboard';
import NewTaskForm from './components/NewTaskForm';
import Tabs from './components/Tabs';
import KanbanBoard from './components/KanbanBoard';
import AiAssistant from './components/AiAssistant';
import SubtaskModal from './components/SubtaskModal';
import AgendaView from './components/AgendaView';
import BackupView from './components/PlaceholderView'; // Renamed for clarity, using PlaceholderView file
import FinanceView from './components/FinanceView';
import GoalsView from './components/GoalsView';
import RewardsView from './components/RewardsView';
import CitationsView from './components/CitationsView';
import CompletedView from './components/CompletedView';
import ChangelogModal from './components/ChangelogModal';
import PDAView from './components/PDAView';
import FocusView from './components/FocusView';
import BacklogView from './components/BacklogView';
import HealthView from './components/HealthView';
import PlannerView from './components/PlannerView';
import { Task, DayKey, Period, Goal, Reward, Transaction, Repetition, Citation, PdaEntry, DailyNote, Attachment, PendingItem, PendingItemStatus, WeightEntry, WaterLog, SleepLog, Supplement, SupplementLog, DietLog, DietPlanItem, PurchasePlanItem, ForecastedExpense, ShoppingListItem, ExpenseCategory, DayOfWeek, Category, ProhibitedFoodItem, ProhibitedFoodLog } from './types';

const initialTasks: Task[] = [
    { id: '1', title: 'Testar zap voice', category: 'Expansão/Projetos', priority: 'Urgente', points: 20, subtasks: [], day: 'friday', period: null, completed: false, date: '2025-10-24', time: '09:00', repetition: 'Não repetir' },
    { id: '2', title: 'Revisar Contrato', category: 'Pendências', priority: 'Urgente', points: 15, subtasks: [{id: 's1', text: 'Ler cláusulas', completed: true}], day: 'inbox', period: null, completed: true, date: '2025-10-23', repetition: 'Não repetir', completionDate: '2025-10-23' },
    { id: '3', title: 'Iniciar projeto de posicionamento', category: 'Expansão/Projetos', priority: 'Urgente', points: 20, subtasks: [{id: 's2', text: 'Definir escopo', completed: false}], day: 'inbox', period: null, completed: false, repetition: 'Não repetir' },
    { id: '4', title: 'Atualizar Finanças', category: 'Pendências', priority: 'Quando Possível', points: 15, subtasks: [], day: 'friday', period: null, completed: true, repetition: 'Friday', completionDate: '2025-10-20' },
    { id: '5', title: 'PALESTRA EMPRESA', category: 'Expansão/Projetos', priority: 'Quando Possível', points: 20, subtasks: [{id: 's3', text: 'sub1', completed: true}, {id: 's4', text: 'sub2', completed: true}, {id: 's5', text: 'sub3', completed: true}, {id: 's6', text: 'sub4', completed: false}, {id: 's7', text: 'sub5', completed: false}], day: 'friday', period: 'Manhã', completed: false, imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80', date: '2025-10-24', time: '10:00', repetition: 'Não repetir' },
    { id: '6', title: 'Audio Divergente', category: 'Hábitos', priority: 'Rotina', points: 5, subtasks: [], day: 'saturday', period: 'Tarde', completed: false, date: '2025-10-25', repetition: 'Não repetir' },
    { id: '7', title: 'Respiração Técnica', category: 'Saúde', priority: 'Rotina', points: 10, subtasks: [], day: 'saturday', period: 'Manhã', completed: true, date: '2025-10-25', time: '07:30', repetition: 'Não repetir', completionDate: '2025-10-25' },
    { id: '8', title: 'Leitura', category: 'Rotina 1h', priority: 'Rotina', points: 3, subtasks: [], day: 'saturday', period: 'Noite', completed: false, date: '2025-10-25', repetition: 'Não repetir' },
    { id: '9', title: 'Plantão Hospital', category: 'Rotina 3h', priority: 'Pode Esperar', points: 5, subtasks: [], day: 'saturday', period: 'Manhã', completed: true, date: '2025-10-25', time: '08:00', repetition: 'Não repetir', completionDate: '2025-10-25' },
    { id: '10', title: 'Planejamento Semanal', category: 'Pendências', priority: 'Urgente', points: 15, subtasks: [], day: 'sunday', period: 'Noite', completed: false, repetition: 'Sunday' },
    { id: '11', title: 'Academia', category: 'Saúde', priority: 'Rotina', points: 10, subtasks: [], day: 'monday', period: 'Manhã', completed: false, repetition: 'Monday' },
    { id: '12', title: 'Meditação Guiada', category: 'Hábitos', priority: 'Rotina', points: 5, subtasks: [], day: 'tuesday', period: 'Manhã', completed: false, repetition: 'Tuesday' },
    { id: '13', title: 'Estudar Alemão', category: 'Expansão/Projetos', priority: 'Quando Possível', points: 20, subtasks: [], day: 'wednesday', period: 'Tarde', completed: false, repetition: 'Wednesday' },
    { id: '14', title: 'Limpar a caixa de entrada de e-mails', category: 'Rotina 1h', priority: 'Pode Esperar', points: 3, subtasks: [], day: 'thursday', period: 'Tarde', completed: false, repetition: 'Thursday' },
    { id: '15', title: 'Reunião de alinhamento semanal', category: 'Pendências', priority: 'Rotina', points: 15, subtasks: [], day: 'monday', period: 'Manhã', completed: false, repetition: 'Monday' },
];

const initialGoals: Goal[] = [
    { id: 'g1', title: 'Concluir 5 projetos de expansão', type: 'monthly', progress: 40, points: 100 },
    { id: 'g2', title: 'Ler 1 livro', type: 'monthly', progress: 80, points: 50 },
    { id: 'g3', title: 'Fazer 3 treinos de musculação', type: 'weekly', progress: 66, points: 25 },
    { id: 'g4', title: 'Não comer doces por 5 dias', type: 'weekly', progress: 20, points: 30 },
    { id: 'g5', title: 'Economizar R$ 500', type: 'monthly', progress: 75, points: 80 },
    { id: 'g6', title: 'Completar curso online de React', type: 'monthly', progress: 10, points: 150 },
    { id: 'g7', title: 'Beber 2L de água por dia', type: 'weekly', progress: 80, points: 20 },
    { id: 'g8', title: 'Fazer 15 minutos de meditação por dia', type: 'weekly', progress: 50, points: 20 },
];

const initialRewards: Reward[] = [
    { id: 'r1', name: '1 hora de Lazer Livre', cost: 50 },
    { id: 'r2', name: 'Comprar um livro novo', cost: 150 },
    { id: 'r3', name: 'Jantar especial fora', cost: 300 },
    { id: 'r4', name: 'Noite de cinema em casa', cost: 75 },
    { id: 'r5', name: 'Comprar um gadget novo', cost: 500 },
    { id: 'r6', name: 'Um dia sem cozinhar (pedir delivery)', cost: 200 },
];

const initialCitations: Citation[] = [
    { id: 1, book: "Sapiens: Uma Breve História da Humanidade", author: "Yuval Noah Harari", page: "102", theme: "História", quote: "A ficção nos permitiu não apenas imaginar coisas, mas fazê-lo coletivamente.", tags: "Importante" },
    { id: 2, book: "O Poder do Hábito", author: "Charles Duhigg", page: "58", theme: "Produtividade", quote: "A deixa, a rotina, a recompensa. É assim que os hábitos funcionam.", tags: "Destaque" },
    { id: 3, book: "A coragem de ser imperfeito", author: "Brené Brown", page: "45", theme: "Autoconhecimento", quote: "A vulnerabilidade não é conhecer vitória ou derrota, é compreender a necessidade de ambas.", tags: "Destaque" },
    { id: 4, book: "Mindset", author: "Carol S. Dweck", page: "23", theme: "Psicologia", quote: "O mindset de crescimento se baseia na crença de que suas qualidades básicas são coisas que você pode cultivar através de seus esforços.", tags: "Devo fazer" },
];

const initialTransactions: Transaction[] = [
    { id: 't1', description: 'Salário', amount: 5000, date: '2024-07-01', type: 'income', category: 'Hospital' },
    { id: 't2', description: 'Aluguel', amount: 1500, date: '2024-07-05', type: 'expense', category: 'Moradia' },
    { id: 't3', description: 'Supermercado', amount: 450, date: '2024-07-06', type: 'expense', category: 'Alimentação' },
    { id: 't4', description: 'Palestra XYZ', amount: 800, date: '2024-07-10', type: 'income', category: 'Palestras' },
    { id: 't5', description: 'Conta de luz', amount: 120, date: '2024-07-15', type: 'expense', category: 'Moradia' },
];

const initialPdaEntries: PdaEntry[] = [
    {
        date: '2024-07-20',
        perception: 'Percebi que estou procrastinando em tarefas importantes do projeto X.',
        decision: 'Decidi que vou usar a técnica Pomodoro para focar por 25 minutos sem interrupções.',
        action: 'Ação: Amanhã, a primeira tarefa do dia será uma sessão de Pomodoro no projeto X.',
        event: 'Reunião produtiva com a equipe',
        mood: 'happy',
        attachments: [],
    },
    {
        date: '2024-07-21',
        perception: 'Estou me sentindo sobrecarregado com a quantidade de pendências.',
        decision: 'Decidi reavaliar minhas prioridades e delegar o que for possível.',
        action: 'Ação: Fazer uma lista de todas as pendências e marcar 3 como prioridade máxima para amanhã.',
        event: 'Prazo apertado no trabalho',
        mood: 'sad',
        attachments: [],
    },
];

const initialPendingItems: PendingItem[] = [
    { id: 'p1', title: 'Definir nova estratégia de marketing', description: 'Pesquisar concorrentes e definir os próximos passos para a campanha do Q4.', status: 'A iniciar', tags: ['marketing', 'estratégia'], createdAt: '2024-07-25T10:00:00Z' },
    { id: 'p2', title: 'Desenvolver layout do novo site', description: 'Criar wireframes e mockups no Figma. Focar na experiência do usuário mobile.', status: 'Executando', tags: ['design', 'website', 'ux'], createdAt: '2024-07-24T14:30:00Z' },
    { id: 'p3', title: 'Entrevista com candidato para vaga de dev', description: 'Preparar perguntas técnicas e comportamentais.', status: 'Concluído', tags: ['rh', 'contratação'], createdAt: '2024-07-22T09:00:00Z' },
    { id: 'p4', title: 'Revisar feedback dos usuários', description: 'Analisar os últimos feedbacks recebidos pela plataforma e categorizar os principais pontos de melhoria.', status: 'A iniciar', tags: ['produto', 'feedback'], createdAt: '2024-07-25T11:00:00Z' },
];

const initialWeightHistory: WeightEntry[] = [
    { date: '2024-07-01', weight: 80.5 },
    { date: '2024-07-08', weight: 80.2 },
    { date: '2024-07-15', weight: 79.8 },
    { date: '2024-07-22', weight: 79.9 },
];

const initialSupplements: Supplement[] = [
    { id: 'sup1', name: 'Vitamina D' },
    { id: 'sup2', name: 'Ômega 3' },
];

const initialProhibitedFood: ProhibitedFoodItem[] = [
    { id: 'prohibit1', name: 'Refrigerante' },
    { id: 'prohibit2', name: 'Fast Food' },
];


const getDayKeyFromDate = (dateString: string): DayKey => {
    // Adding T00:00:00 ensures the date is parsed in the local timezone, avoiding UTC conversion issues.
    const dayIndex = new Date(dateString + 'T00:00:00').getDay();
    const days: DayKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayIndex];
};

const repetitionToDayKeyMap: { [key in Repetition]?: DayKey } = {
    'Sunday': 'sunday',
    'Monday': 'monday',
    'Tuesday': 'tuesday',
    'Wednesday': 'wednesday',
    'Thursday': 'thursday',
    'Friday': 'friday',
    'Saturday': 'saturday',
};

const APP_VERSION = '1.2.0';
const LAST_SEEN_VERSION_KEY = 'lifeboardProLastSeenVersion';
const LAST_RENEWAL_KEY = 'lifeboardProLastRenewal';

// Helper to check if weekly task renewal should run
const shouldRunWeeklyRenewal = (lastRenewalStr: string | null, today: Date): boolean => {
    if (!lastRenewalStr) {
        return true; // First time running
    }
    const lastRenewalDate = new Date(lastRenewalStr);
    const todayDay = today.getDay(); // 0 = Sunday
    const mostRecentSunday = new Date(today);
    mostRecentSunday.setDate(today.getDate() - todayDay);
    mostRecentSunday.setHours(0, 0, 0, 0); // Start of day
    return lastRenewalDate < mostRecentSunday;
};

// Helper to get the date of the next occurrence of a given weekday
const getNextDateForDay = (dayOfWeek: DayOfWeek, today: Date): string => {
    const dayMap: { [key in DayOfWeek]: number } = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    const targetDayIndex = dayMap[dayOfWeek];
    const newDate = new Date(today);
    const currentDayIndex = newDate.getDay();
    let diff = targetDayIndex - currentDayIndex;
    if (diff <= 0) {
         diff += 7;
    }
    newDate.setDate(today.getDate() + diff);
    return newDate.toISOString().split('T')[0];
};

// Renews uncompleted recurring tasks for special categories
const renewUncompletedWeeklyTasks = (tasks: Task[]): Task[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const specialCategories: Category[] = ['Hábitos', 'Padrão Paralelo', 'Saúde'];
    const recurringDayRepetitions: Repetition[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return tasks.map(task => {
        const isSpecialRecurring = specialCategories.includes(task.category) && 
                                   task.repetition && 
                                   recurringDayRepetitions.includes(task.repetition);

        if (!isSpecialRecurring || task.completed) {
            return task;
        }

        const taskDate = task.date ? new Date(task.date + 'T00:00:00') : null;

        if (taskDate && taskDate < today) {
            const newDateStr = getNextDateForDay(task.repetition as DayOfWeek, today);
            
            return {
                ...task,
                date: newDateStr,
                day: getDayKeyFromDate(newDateStr),
                subtasks: task.subtasks.map(st => ({ ...st, completed: false })),
            };
        }

        return task;
    });
};

const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [citations, setCitations] = useState<Citation[]>([]);
    const [pdaEntries, setPdaEntries] = useState<PdaEntry[]>([]);
    const [dailyNotes, setDailyNotes] = useState<DailyNote[]>([]);
    const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [purchasePlans, setPurchasePlans] = useState<PurchasePlanItem[]>([]);
    const [forecastedExpenses, setForecastedExpenses] = useState<ForecastedExpense[]>([]);
    const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

    // Health State
    const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
    const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
    const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
    const [supplements, setSupplements] = useState<Supplement[]>([]);
    const [supplementLogs, setSupplementLogs] = useState<SupplementLog[]>([]);
    const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
    const [dietPlan, setDietPlan] = useState<DietPlanItem[]>([]);
    const [prohibitedFoodPlan, setProhibitedFoodPlan] = useState<ProhibitedFoodItem[]>([]);
    const [prohibitedFoodLogs, setProhibitedFoodLogs] = useState<ProhibitedFoodLog[]>([]);
    const [waterGoalMode, setWaterGoalMode] = useState<'fixed' | 'dynamic'>('fixed');


    const [activeTab, setActiveTab] = useState('Foco');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isChangelogOpen, setIsChangelogOpen] = useState(false);


    // Load from localStorage on initial render
    useEffect(() => {
        const loadData = (key: string) => {
            try {
                const data = localStorage.getItem(key);
                if (!data) return null;
                const parsed = JSON.parse(data);
                // A simple validation to check if data is likely intact
                if (typeof parsed.totalPoints !== 'number' || !Array.isArray(parsed.tasks)) {
                    console.warn(`Data from ${key} seems corrupted.`);
                    return null;
                }
                return parsed;
            } catch (error) {
                console.error(`Error parsing data from ${key}:`, error);
                return null;
            }
        };

        const lastSeenVersion = localStorage.getItem(LAST_SEEN_VERSION_KEY);
        if (lastSeenVersion !== APP_VERSION) {
            // setIsChangelogOpen(true); // Temporarily disable for easier testing of new features
        }

        let data = loadData('lifeboardProData');
        if (!data) {
            console.log("No valid primary data found, trying backup.");
            data = loadData('lifeboardProData_backup');
        }
        
        let loadedTasks: Task[] = initialTasks;
        
        if (data) {
            console.log("Data loaded successfully from localStorage.");
            loadedTasks = data.tasks || initialTasks;
            setGoals(data.goals || initialGoals);
            setRewards(data.rewards || initialRewards);
            setTransactions(data.transactions || initialTransactions);
            setCitations(data.citations || initialCitations);
            setPdaEntries(data.pdaEntries || initialPdaEntries);
            setDailyNotes(data.dailyNotes || []);
            setPendingItems(data.pendingItems || initialPendingItems);
            setTotalPoints(data.totalPoints || 0);
            setPurchasePlans(data.purchasePlans || []);
            setForecastedExpenses(data.forecastedExpenses || []);
            setShoppingList(data.shoppingList || []);
            // Load health data
            setWeightHistory(data.weightHistory || initialWeightHistory);
            setWaterLogs(data.waterLogs || []);
            setSleepLogs(data.sleepLogs || []);
            setSupplements(data.supplements || initialSupplements);
            setSupplementLogs(data.supplementLogs || []);
            setDietLogs(data.dietLogs || []);
            setDietPlan(data.dietPlan || []);
            setProhibitedFoodPlan(data.prohibitedFoodPlan || initialProhibitedFood);
            setProhibitedFoodLogs(data.prohibitedFoodLogs || []);
            setWaterGoalMode(data.waterGoalMode || 'fixed');
        } else {
            console.log("No valid data in localStorage, initializing with default data.");
            // Set initial data if nothing is saved
            loadedTasks = initialTasks;
            setGoals(initialGoals);
            setRewards(initialRewards);
            setTransactions(initialTransactions);
            setCitations(initialCitations);
            setPdaEntries(initialPdaEntries);
            setDailyNotes([]);
            setPendingItems(initialPendingItems);
            setWeightHistory(initialWeightHistory);
            setSupplements(initialSupplements);
            setDietPlan([]);
            setProhibitedFoodPlan(initialProhibitedFood);
            setProhibitedFoodLogs([]);
            setPurchasePlans([]);
            setForecastedExpenses([]);
            setShoppingList([]);
            // Calculate initial points
            const initialTaskPoints = initialTasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
            const initialGoalPoints = initialGoals.filter(g => g.progress === 100).reduce((sum, g) => sum + g.points, 0);
            setTotalPoints(initialTaskPoints + initialGoalPoints);
        }

        // --- Weekly Task Renewal Logic ---
        const lastRenewalStr = localStorage.getItem(LAST_RENEWAL_KEY);
        const today = new Date();
        
        if (shouldRunWeeklyRenewal(lastRenewalStr, today)) {
            console.log("Running weekly task renewal for 'Hábito', 'Saúde', 'Padrão Paralelo'...");
            loadedTasks = renewUncompletedWeeklyTasks(loadedTasks);
            localStorage.setItem(LAST_RENEWAL_KEY, today.toISOString());
        }
        
        setTasks(loadedTasks);

    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        try {
            // Create a backup of the last known good state before overwriting
            const currentData = localStorage.getItem('lifeboardProData');
            if (currentData) {
                try {
                    // Quick check to avoid backing up corrupted data
                    JSON.parse(currentData);
                    localStorage.setItem('lifeboardProData_backup', currentData);
                } catch (e) {
                    console.warn('Skipping backup of corrupted data.');
                }
            }

            const appData = {
                tasks,
                goals,
                rewards,
                transactions,
                citations,
                pdaEntries,
                dailyNotes,
                pendingItems,
                totalPoints,
                weightHistory,
                waterLogs,
                sleepLogs,
                supplements,
                supplementLogs,
                dietLogs,
                dietPlan,
                prohibitedFoodPlan,
                prohibitedFoodLogs,
                waterGoalMode,
                purchasePlans,
                forecastedExpenses,
                shoppingList,
            };
            localStorage.setItem('lifeboardProData', JSON.stringify(appData));
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
        }
    }, [tasks, goals, rewards, transactions, citations, pdaEntries, dailyNotes, pendingItems, totalPoints, weightHistory, waterLogs, sleepLogs, supplements, supplementLogs, dietLogs, dietPlan, prohibitedFoodPlan, prohibitedFoodLogs, waterGoalMode, purchasePlans, forecastedExpenses, shoppingList]);


    const handleOpenModal = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };
    
    const handleCloseChangelog = () => {
        setIsChangelogOpen(false);
        try {
            localStorage.setItem(LAST_SEEN_VERSION_KEY, APP_VERSION);
        } catch (error) {
            console.error("Failed to save version to localStorage", error);
        }
    };

    const handleUpdateTask = (updatedTask: Task) => {
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    };
    
    const handleToggleSubtask = (taskId: string, subtaskId: string) => {
        setTasks(prevTasks =>
            prevTasks.map(task => {
                if (task.id === taskId) {
                    const updatedSubtasks = task.subtasks.map(subtask => {
                        if (subtask.id === subtaskId) {
                            return { ...subtask, completed: !subtask.completed };
                        }
                        return subtask;
                    });
                    return { ...task, subtasks: updatedSubtasks };
                }
                return task;
            })
        );
    };

    const renewTask = (task: Task, currentTasks: Task[]): Task[] => {
        const baseDate = new Date(task.date ? task.date + 'T00:00:00' : Date.now());

        if (task.repetition === 'Mensalmente') {
            baseDate.setMonth(baseDate.getMonth() + 1);
        } else { // Weekly repetition
            baseDate.setDate(baseDate.getDate() + 7);
        }

        const newDateStr = baseDate.toISOString().split('T')[0];
        const newDayKey = repetitionToDayKeyMap[task.repetition as Repetition] || getDayKeyFromDate(newDateStr);

        const renewedTask: Task = {
            ...task,
            id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            completed: false,
            completionDate: undefined,
            resolution: undefined,
            subtasks: task.subtasks.map(st => ({
                ...st,
                id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                completed: false
            })),
            date: newDateStr,
            day: newDayKey,
        };

        return [...currentTasks, renewedTask];
    };

    const handleToggleComplete = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const wasCompleted = task.completed;
        const isNowCompleted = !wasCompleted;
        const todayStr = new Date().toISOString().split('T')[0];
        const isRecurring = task.repetition && task.repetition !== 'Não repetir';

        if (isNowCompleted) { // Completing a task
            setTotalPoints(prevPoints => prevPoints + task.points);

            let updatedTasks = tasks.map(t =>
                t.id === taskId
                ? { ...t, completed: true, completionDate: todayStr }
                : t
            );

            if (isRecurring) {
                updatedTasks = renewTask(task, updatedTasks);
            }
            
            setTasks(updatedTasks);
        } else { // Un-completing a task
            setTotalPoints(prevPoints => prevPoints - task.points);
            setTasks(tasks.map(t =>
                t.id === taskId
                ? { ...t, completed: false, completionDate: undefined }
                : t
            ));
        }
    };

    const handleResolveParallelTask = (taskId: string, resolution: 'winner' | 'defeated') => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.category !== 'Padrão Paralelo' || task.completed) return;

        const pointsChange = resolution === 'winner' ? task.points : -task.points;
        setTotalPoints(prevPoints => prevPoints + pointsChange);
        
        const todayStr = new Date().toISOString().split('T')[0];
        const isRecurring = task.repetition && task.repetition !== 'Não repetir';

        let updatedTasks = tasks.map(t => 
            t.id === taskId 
            ? { ...t, completed: true, completionDate: todayStr, resolution: resolution } 
            : t
        );
        
        if (isRecurring) {
            updatedTasks = renewTask(task, updatedTasks);
        }

        setTasks(updatedTasks);
    };


    const handleDeleteTask = (taskId: string) => {
        const taskToDelete = tasks.find(t => t.id === taskId);
        if (taskToDelete && taskToDelete.completed) {
            setTotalPoints(prevPoints => prevPoints - taskToDelete.points);
        }
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    const handleAddTask = (taskData: Omit<Task, 'id' | 'subtasks' | 'completed' | 'day' | 'period'>) => {
        let day: DayKey = 'inbox';
        const repetitionDay = taskData.repetition ? repetitionToDayKeyMap[taskData.repetition] : undefined;

        if (repetitionDay) {
            day = repetitionDay;
        } else if (taskData.date) {
            day = getDayKeyFromDate(taskData.date);
        }

        const newTask: Task = {
            ...taskData,
            id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            subtasks: [],
            completed: false,
            day: day,
            period: null
        };
        setTasks(prevTasks => [newTask, ...prevTasks]);
    };
    
    const handleDuplicateTask = (taskId: string) => {
        const originalTask = tasks.find(t => t.id === taskId);
        if (!originalTask) return;

        const newTask: Task = {
            ...originalTask,
            id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            title: `${originalTask.title} (Cópia)`,
            completed: false,
            day: 'inbox',
            period: null,
            completionDate: undefined,
            resolution: undefined,
            subtasks: originalTask.subtasks.map(st => ({
                ...st,
                id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                completed: false,
            })),
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
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const sanitizedProgress = Math.max(0, Math.min(100, newProgress));
        const wasCompleted = goal.progress === 100;
        const isNowCompleted = sanitizedProgress === 100;

        if (isNowCompleted && !wasCompleted) {
            setTotalPoints(prevPoints => prevPoints + goal.points);
        } else if (!isNowCompleted && wasCompleted) {
            setTotalPoints(prevPoints => prevPoints - goal.points);
        }

        setGoals(prevGoals => prevGoals.map(g => 
            g.id === goalId 
            ? { ...g, progress: sanitizedProgress } 
            : g
        ));
    };

    const handleDeleteGoal = (goalId: string) => {
        const goalToDelete = goals.find(g => g.id === goalId);
        if (goalToDelete && goalToDelete.progress === 100) {
            setTotalPoints(prevPoints => prevPoints - goalToDelete.points);
        }
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
        setTotalPoints(p => p + 1); // GAMIFICATION
        if (
            transactionData.type === 'expense' &&
            transactionData.isCreditCard &&
            transactionData.paymentType === 'Parcelado' &&
            transactionData.installments &&
            transactionData.installments > 1
        ) {
            const totalAmount = transactionData.amount;
            const installments = transactionData.installments;
            const installmentAmount = parseFloat((totalAmount / installments).toFixed(2));
            const purchaseId = `purchase_${Date.now()}`;
            const purchaseDate = new Date(transactionData.date + 'T00:00:00');
    
            const newTransactions: Transaction[] = [];
            for (let i = 1; i <= installments; i++) {
                const dueDate = new Date(purchaseDate);
                dueDate.setMonth(purchaseDate.getMonth() + i);
    
                const newTransaction: Transaction = {
                    ...transactionData,
                    id: `trans_${Date.now()}_${i}`,
                    amount: installmentAmount,
                    description: `${transactionData.description} (${i}/${installments})`,
                    date: transactionData.date,
                    dueDate: dueDate.toISOString().split('T')[0],
                    isPaid: false,
                    category: transactionData.category || 'Cartão de Crédito',
                    currentInstallment: i,
                    installments,
                    purchaseId,
                };
                newTransactions.push(newTransaction);
            }
            setTransactions(prev => [...prev, ...newTransactions]);
        } else {
            const newTransaction: Transaction = {
                ...transactionData,
                id: `trans_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            };
            setTransactions(prev => [newTransaction, ...prev]);
        }
    };
    
    const handleDeleteTransaction = (transactionId: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.')) {
            setTransactions(prev => prev.filter(t => t.id !== transactionId));
            // Retract the gamification point
            setTotalPoints(p => p - 1);
        }
    };

    const handleUpdateTransaction = (updatedTransaction: Transaction) => {
        setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    };

    const handleBatchUpdateTransactions = (updates: Transaction[]) => {
        setTransactions(prev => {
            const newTransactions = [...prev];
            updates.forEach(update => {
                const index = newTransactions.findIndex(t => t.id === update.id);
                if (index > -1) {
                    newTransactions[index] = update;
                }
            });
            return newTransactions;
        });
    };

    const handleAddCitation = (citationData: Omit<Citation, 'id'>) => {
        const newCitation: Citation = {
            ...citationData,
            id: Date.now(),
        };
        setCitations(prevCitations => [newCitation, ...prevCitations]);
    };

    const handleDeleteCitation = (citationId: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta citação?')) {
            setCitations(prevCitations => prevCitations.filter(c => c.id !== citationId));
        }
    };
    
    const handleSavePdaEntry = (entry: PdaEntry) => {
        setPdaEntries(prev => {
            const existingIndex = prev.findIndex(e => e.date === entry.date);
            if (existingIndex > -1) {
                const newEntries = [...prev];
                newEntries[existingIndex] = entry;
                return newEntries;
            } else {
                return [...prev, entry];
            }
        });
    };
    
    const handleUpdateNote = (day: DayKey, content: string) => {
        setDailyNotes(prev => {
            const noteExists = prev.some(n => n.day === day);
            if (noteExists) {
                return prev.map(n => n.day === day ? { ...n, content } : n);
            } else {
                return [...prev, { day, content, attachments: [] }];
            }
        });
    };

    const handleAddAttachment = (day: DayKey, file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            if (dataUrl) {
                const newAttachment: Attachment = {
                    id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    name: file.name,
                    type: file.type,
                    dataUrl,
                };

                setDailyNotes(prev => {
                    const noteExists = prev.some(n => n.day === day);
                    if (noteExists) {
                        return prev.map(n => 
                            n.day === day 
                            ? { ...n, attachments: [...n.attachments, newAttachment] } 
                            : n
                        );
                    } else {
                        return [...prev, { day, content: '', attachments: [newAttachment] }];
                    }
                });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteAttachment = (day: DayKey, attachmentId: string) => {
        setDailyNotes(prev => {
            return prev.map(n => 
                n.day === day 
                ? { ...n, attachments: n.attachments.filter(a => a.id !== attachmentId) } 
                : n
            );
        });
    };

    const handleRestoreData = (data: any) => {
        setTasks(data.tasks || []);
        setGoals(data.goals || []);
        setRewards(data.rewards || []);
        setTransactions(data.transactions || []);
        setCitations(data.citations || []);
        setPdaEntries(data.pdaEntries || []);
        setDailyNotes(data.dailyNotes || []);
        setPendingItems(data.pendingItems || []);
        setTotalPoints(data.totalPoints || 0);
        setWeightHistory(data.weightHistory || []);
        setWaterLogs(data.waterLogs || []);
        setSleepLogs(data.sleepLogs || []);
        setSupplements(data.supplements || []);
        setSupplementLogs(data.supplementLogs || []);
        setDietLogs(data.dietLogs || []);
        setDietPlan(data.dietPlan || []);
        setProhibitedFoodPlan(data.prohibitedFoodPlan || []);
        setProhibitedFoodLogs(data.prohibitedFoodLogs || []);
        setWaterGoalMode(data.waterGoalMode || 'fixed');
        setPurchasePlans(data.purchasePlans || []);
        setForecastedExpenses(data.forecastedExpenses || []);
        setShoppingList(data.shoppingList || []);
    };

    const handleAddPendingItem = (itemData: Omit<PendingItem, 'id' | 'createdAt' | 'status'>) => {
        const newItem: PendingItem = {
            ...itemData,
            id: `pending_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            createdAt: new Date().toISOString(),
            status: 'A iniciar',
        };
        setPendingItems(prev => [newItem, ...prev]);
    };

    const handleUpdatePendingItemStatus = (itemId: string, newStatus: PendingItemStatus) => {
        setPendingItems(prev => prev.map(item => 
            item.id === itemId ? { ...item, status: newStatus } : item
        ));
    };

    const handleDeletePendingItem = (itemId: string) => {
        setPendingItems(prev => prev.filter(item => item.id !== itemId));
    };

    const handleMoveToKanban = (itemId: string) => {
        const itemToMove = pendingItems.find(item => item.id === itemId);
        if (!itemToMove) return;

        const newTask: Task = {
            id: `task_from_pending_${itemToMove.id}`,
            title: itemToMove.title,
            category: 'Pendências',
            priority: 'Quando Possível',
            points: 15, // Default points for 'Pendências'
            subtasks: [],
            day: 'inbox',
            period: null,
            completed: false,
            repetition: 'Não repetir',
        };

        setTasks(prev => [newTask, ...prev]);
        handleDeletePendingItem(itemId);
    };

    // Purchase Plan Handlers
    const handleAddPurchasePlan = (planData: Omit<PurchasePlanItem, 'id' | 'savedAmount'>) => {
        const newPlan: PurchasePlanItem = {
            ...planData,
            id: `plan_${Date.now()}`,
            savedAmount: 0,
        };
        setPurchasePlans(prev => [newPlan, ...prev]);
    };

    const handleAddFundsToPurchasePlan = (planId: string, amount: number) => {
        const plan = purchasePlans.find(p => p.id === planId);
        if (!plan) return;

        const fundTransaction: Omit<Transaction, 'id'> = {
            description: `Reserva para: ${plan.itemName}`,
            amount,
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            category: 'Reserva',
        };
        handleAddTransaction(fundTransaction);

        setPurchasePlans(prev => prev.map(p => 
            p.id === planId 
            ? { ...p, savedAmount: Math.min(p.savedAmount + amount, p.targetAmount) } 
            : p
        ));
    };

    const handleDeletePurchasePlan = (planId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este plano? O valor reservado não será estornado automaticamente.')) {
            setPurchasePlans(prev => prev.filter(p => p.id !== planId));
        }
    };

    const handleExecutePurchase = (planId: string) => {
        const plan = purchasePlans.find(p => p.id === planId);
        if (!plan) return;
        if (plan.savedAmount < plan.targetAmount) {
            alert("Saldo insuficiente na reserva para realizar esta compra.");
            return;
        }

        const purchaseTransaction: Omit<Transaction, 'id'> = {
            description: `Compra: ${plan.itemName}`,
            amount: plan.targetAmount,
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            category: 'Imprevisto',
        };
        handleAddTransaction(purchaseTransaction);

        setPurchasePlans(prev => prev.filter(p => p.id !== planId));
        alert(`Compra de "${plan.itemName}" realizada com sucesso!`);
    };

    // Forecast Handlers
    const handleAddForecastedExpense = (forecastData: Omit<ForecastedExpense, 'id'>) => {
        const newForecast: ForecastedExpense = {
            ...forecastData,
            id: `forecast_${Date.now()}`
        };
        setForecastedExpenses(prev => [newForecast, ...prev]);
    };

    const handleDeleteForecastedExpense = (forecastId: string) => {
        setForecastedExpenses(prev => prev.filter(f => f.id !== forecastId));
    };

    const handleConvertForecast = (forecastId: string, action: 'launch' | 'schedule') => {
        const forecast = forecastedExpenses.find(f => f.id === forecastId);
        if (!forecast) return;

        if (action === 'launch') {
            handleAddTransaction({
                ...forecast,
                date: new Date().toISOString().split('T')[0],
                type: 'expense'
            });
        } else { // schedule
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            nextMonth.setDate(5); // Default to 5th of next month
            
            handleAddTransaction({
                ...forecast,
                date: new Date().toISOString().split('T')[0], // creation date
                type: 'expense',
                dueDate: nextMonth.toISOString().split('T')[0],
                isPaid: false
            });
        }
        handleDeleteForecastedExpense(forecastId);
    };

    // Shopping List Handlers
    const handleAddShoppingListItem = (itemData: Omit<ShoppingListItem, 'id'>) => {
        const newItem: ShoppingListItem = {
            ...itemData,
            id: `shop_${Date.now()}`
        };
        setShoppingList(prev => [...prev, newItem]);
    };

    const handleDeleteShoppingListItem = (itemId: string) => {
        setShoppingList(prev => prev.filter(item => item.id !== itemId));
    };

    const handleUpdateShoppingListItem = (itemId: string, updateData: Partial<Omit<ShoppingListItem, 'id'>>) => {
        setShoppingList(prev => prev.map(item =>
            item.id === itemId ? { ...item, ...updateData } : item
        ));
    };


    // Health Handlers
    const handleAddWeightEntry = (weight: number) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const newEntry: WeightEntry = { date: todayStr, weight };
        
        setWeightHistory(prev => {
            const existingIndex = prev.findIndex(e => e.date === todayStr);
            if (existingIndex > -1) {
                const updatedHistory = [...prev];
                updatedHistory[existingIndex] = newEntry;
                return updatedHistory;
            }
            return [...prev, newEntry].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        });
        setTotalPoints(p => p + 10);
    };

    const handleLogWater = (glasses: number, goalInGlasses: number) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const newLog: WaterLog = { date: todayStr, glasses };
        
        setWaterLogs(prev => {
            const existingIndex = prev.findIndex(l => l.date === todayStr);
            if (existingIndex > -1) {
                const oldGlasses = prev[existingIndex].glasses;
                if (oldGlasses < goalInGlasses && newLog.glasses >= goalInGlasses) {
                    setTotalPoints(p => p + 15); // Award points on reaching goal
                } else if (oldGlasses >= goalInGlasses && newLog.glasses < goalInGlasses) {
                    setTotalPoints(p => p - 15); // Retract points if goal is un-reached
                }
                const updatedLogs = [...prev];
                updatedLogs[existingIndex] = newLog;
                return updatedLogs;
            }
            if (newLog.glasses >= goalInGlasses) {
                 setTotalPoints(p => p + 15);
            }
            return [...prev, newLog];
        });
    };

    const handleLogSleep = (hours: number) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const newLog: SleepLog = { date: todayStr, hours };

        setSleepLogs(prev => {
            const existingIndex = prev.findIndex(l => l.date === todayStr);
            if (existingIndex > -1) {
                const updatedLogs = [...prev];
                updatedLogs[existingIndex] = newLog;
                return updatedLogs;
            }
            setTotalPoints(p => p + 10);
            return [...prev, newLog];
        });
    };

    const handleLogDiet = (log: DietLog) => {
         setDietLogs(prev => {
            const existingIndex = prev.findIndex(l => l.date === log.date);
            if (existingIndex > -1) {
                const oldLog = prev[existingIndex];
                const pointMapping = { good: 10, medium: 5, bad: 0 };
                const oldPoints = pointMapping[oldLog.adherence] || 0;
                const newPoints = pointMapping[log.adherence];
                setTotalPoints(p => p - oldPoints + newPoints);
                
                const updatedLogs = [...prev];
                updatedLogs[existingIndex] = { ...updatedLogs[existingIndex], ...log };
                return updatedLogs;
            }
            const pointMapping = { good: 10, medium: 5, bad: 0 };
            setTotalPoints(p => p + pointMapping[log.adherence]);
            return [...prev, log];
        });
    };
    
    const handleAddDietPlanItem = (name: string) => {
      const newItem: DietPlanItem = { id: `diet_${Date.now()}`, name };
      setDietPlan(prev => [...prev, newItem]);
    };

    const handleDeleteDietPlanItem = (itemId: string) => {
        setDietPlan(prev => prev.filter(item => item.id !== itemId));
        // Also remove from any logs
        setDietLogs(prevLogs => prevLogs.map(log => ({
            ...log,
            consumedItemIds: log.consumedItemIds?.filter(id => id !== itemId)
        })));
    };

    const handleToggleDietLogItem = (itemId: string, consumed: boolean) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayLog = dietLogs.find(l => l.date === todayStr);
        const logExists = todayLog?.consumedItemIds?.includes(itemId) || false;

        if (consumed && !logExists) {
            setTotalPoints(p => p + 1);
        } else if (!consumed && logExists) {
            setTotalPoints(p => p - 1);
        }

        setDietLogs(prev => {
            const todayLogIndex = prev.findIndex(l => l.date === todayStr);
            if (todayLogIndex > -1) {
                const updatedLogs = [...prev];
                const currentLog = { ...updatedLogs[todayLogIndex] };
                const consumedIds = new Set(currentLog.consumedItemIds || []);
                if (consumed) {
                    consumedIds.add(itemId);
                } else {
                    consumedIds.delete(itemId);
                }
                currentLog.consumedItemIds = Array.from(consumedIds);
                updatedLogs[todayLogIndex] = currentLog;
                return updatedLogs;
            } else {
                const newLog: DietLog = {
                    date: todayStr,
                    notes: '',
                    adherence: 'medium',
                    consumedItemIds: consumed ? [itemId] : []
                };
                return [...prev, newLog];
            }
        });
    };

    const handleAddSupplement = (name: string) => {
        const newSupplement: Supplement = { id: `sup_${Date.now()}`, name };
        setSupplements(prev => [...prev, newSupplement]);
    };

    const handleDeleteSupplement = (id: string) => {
        setSupplements(prev => prev.filter(s => s.id !== id));
        setSupplementLogs(prev => prev.filter(l => l.supplementId !== id));
    };

    const handleToggleSupplementLog = (supplementId: string, taken: boolean) => {
        const todayStr = new Date().toISOString().split('T')[0];
        setSupplementLogs(prev => {
            const logExists = prev.some(l => l.date === todayStr && l.supplementId === supplementId);
            if (logExists && !taken) {
                setTotalPoints(p => p - 10);
                return prev.filter(l => !(l.date === todayStr && l.supplementId === supplementId));
            } else if (!logExists && taken) {
                setTotalPoints(p => p + 10);
                return [...prev, { date: todayStr, supplementId }];
            }
            return prev;
        });
    };
    
    const handleAddProhibitedFoodItem = (name: string) => {
        const newItem: ProhibitedFoodItem = { id: `prohibit_${Date.now()}`, name };
        setProhibitedFoodPlan(prev => [...prev, newItem]);
    };

    const handleDeleteProhibitedFoodItem = (itemId: string) => {
        const wasConsumedToday = prohibitedFoodLogs.some(log => log.date === new Date().toISOString().split('T')[0] && log.foodId === itemId);
        if (wasConsumedToday) {
            setTotalPoints(p => p + 10); // Give back points if a consumed item is deleted
        }
        setProhibitedFoodPlan(prev => prev.filter(item => item.id !== itemId));
        setProhibitedFoodLogs(prev => prev.filter(log => log.foodId !== itemId));
    };

    const handleToggleProhibitedFoodLog = (foodId: string, consumed: boolean) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const logExists = prohibitedFoodLogs.some(l => l.date === todayStr && l.foodId === foodId);

        if (consumed && !logExists) {
            setTotalPoints(p => p - 10);
            setProhibitedFoodLogs(prev => [...prev, { date: todayStr, foodId }]);
        } else if (!consumed && logExists) {
            setTotalPoints(p => p + 10);
            setProhibitedFoodLogs(prev => prev.filter(l => !(l.date === todayStr && l.foodId === foodId)));
        }
    };

    // Planner Gamification
    const handlePlannerGoalCompleted = (points: number) => {
        setTotalPoints(p => p + points);
    };

    const handlePlannerGoalUncompleted = (points: number) => {
        setTotalPoints(p => p - points);
    };


    const getDailyPoints = () => {
      const todayStr = new Date().toISOString().split('T')[0];
      return tasks
        .filter(t => t.completed && t.completionDate === todayStr)
        .reduce((sum, task) => {
            if (task.category === 'Padrão Paralelo') {
                return sum + (task.resolution === 'winner' ? task.points : -task.points);
            }
            return sum + task.points;
        }, 0);
    }
    
    const getDailyTaskProgress = () => {
        const today = new Date();
        const todayDayIndex = today.getDay();
        const dayKeys: DayKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todayDayKey = dayKeys[todayDayIndex];

        const todayTasks = tasks.filter(t => t.day === todayDayKey);
        if (todayTasks.length === 0) return 0;
        
        const completedToday = todayTasks.filter(t => t.completed).length;
        return (completedToday / todayTasks.length) * 100;
    };

    const getWeeklyGoalsProgress = () => {
        const weeklyGoals = goals.filter(g => g.type === 'weekly');
        if (weeklyGoals.length === 0) return 0;
        const totalProgress = weeklyGoals.reduce((sum, goal) => sum + goal.progress, 0);
        return totalProgress / weeklyGoals.length;
    };

    const getMonthlyGoalsProgress = () => {
        const monthlyGoals = goals.filter(g => g.type === 'monthly');
        if (monthlyGoals.length === 0) return 0;
        const totalProgress = monthlyGoals.reduce((sum, goal) => sum + goal.progress, 0);
        return totalProgress / monthlyGoals.length;
    };

    const appData = { tasks, goals, rewards, transactions, citations, pdaEntries, dailyNotes, pendingItems, totalPoints, weightHistory, waterLogs, sleepLogs, supplements, supplementLogs, dietLogs, dietPlan, prohibitedFoodPlan, prohibitedFoodLogs, waterGoalMode, purchasePlans, forecastedExpenses, shoppingList };

    const renderActiveTab = () => {
        switch(activeTab) {
            case 'Foco': {
                const nonCompletedTasks = tasks.filter(task => !task.completed);
                return <FocusView tasks={nonCompletedTasks} onToggleComplete={handleToggleComplete} goals={goals} transactions={transactions} />;
            }
            case 'Kanban':
                return <KanbanBoard 
                    tasks={tasks} 
                    onToggleComplete={handleToggleComplete} 
                    onDelete={handleDeleteTask} 
                    onCardClick={handleOpenModal} 
                    onTaskDrop={handleTaskDrop} 
                    onToggleSubtask={handleToggleSubtask} 
                    onDuplicate={handleDuplicateTask} 
                    onResolveParallelTask={handleResolveParallelTask}
                    dailyNotes={dailyNotes}
                    onUpdateNote={handleUpdateNote}
                    onAddAttachment={handleAddAttachment}
                    onDeleteAttachment={handleDeleteAttachment}
                 />;
            case 'Pendências':
                 return <BacklogView 
                     items={pendingItems} 
                     onAddItem={handleAddPendingItem}
                     onUpdateItemStatus={handleUpdatePendingItemStatus}
                     onDeleteItem={handleDeletePendingItem}
                     onMoveToKanban={handleMoveToKanban}
                 />;
            case 'Agenda':
                return <AgendaView tasks={tasks} />;
            case 'Metas':
                return <GoalsView goals={goals} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal} />;
            case 'Saúde':
                return <HealthView 
                    weightHistory={weightHistory}
                    waterLogs={waterLogs}
                    sleepLogs={sleepLogs}
                    dietLogs={dietLogs}
                    supplements={supplements}
                    supplementLogs={supplementLogs}
                    dietPlan={dietPlan}
                    prohibitedFoodPlan={prohibitedFoodPlan}
                    prohibitedFoodLogs={prohibitedFoodLogs}
                    waterGoalMode={waterGoalMode}
                    onAddWeightEntry={handleAddWeightEntry}
                    // FIX: Changed onLogWater to handleLogWater to fix typo.
                    onLogWater={handleLogWater}
                    onLogSleep={handleLogSleep}
                    onLogDiet={handleLogDiet}
                    onAddSupplement={handleAddSupplement}
                    onDeleteSupplement={handleDeleteSupplement}
                    onToggleSupplementLog={handleToggleSupplementLog}
                    onAddDietPlanItem={handleAddDietPlanItem}
                    onDeleteDietPlanItem={handleDeleteDietPlanItem}
                    onToggleDietLogItem={handleToggleDietLogItem}
                    onAddProhibitedFoodItem={handleAddProhibitedFoodItem}
                    onDeleteProhibitedFoodItem={handleDeleteProhibitedFoodItem}
                    onToggleProhibitedFoodLog={handleToggleProhibitedFoodLog}
                    onSetWaterGoalMode={setWaterGoalMode}
                />;
            case 'Orçamento':
                return <FinanceView 
                    transactions={transactions} 
                    onAddTransaction={handleAddTransaction} 
                    onUpdateTransaction={handleUpdateTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    onBatchUpdateTransactions={handleBatchUpdateTransactions}
                    purchasePlans={purchasePlans}
                    onAddPurchasePlan={handleAddPurchasePlan}
                    onAddFundsToPurchasePlan={handleAddFundsToPurchasePlan}
                    onDeletePurchasePlan={handleDeletePurchasePlan}
                    onExecutePurchase={handleExecutePurchase}
                    forecastedExpenses={forecastedExpenses}
                    onAddForecastedExpense={handleAddForecastedExpense}
                    onDeleteForecastedExpense={handleDeleteForecastedExpense}
                    onConvertForecast={handleConvertForecast}
                    shoppingList={shoppingList}
                    onAddShoppingListItem={handleAddShoppingListItem}
                    onDeleteShoppingListItem={handleDeleteShoppingListItem}
                    onUpdateShoppingListItem={handleUpdateShoppingListItem}
                />;
            case 'Citações':
                return <CitationsView citations={citations} onAddCitation={handleAddCitation} onDeleteCitation={handleDeleteCitation} />;
            case 'PDA':
                return <PDAView entries={pdaEntries} onSaveEntry={handleSavePdaEntry} />;
            case 'Planejamento':
                return <PlannerView onGoalCompleted={handlePlannerGoalCompleted} onGoalUncompleted={handlePlannerGoalUncompleted} />;
            case 'Recompensas':
                 return <RewardsView rewards={rewards} totalPoints={totalPoints} onAddReward={handleAddReward} onRedeemReward={handleRedeemReward} />;
            case 'Concluídos':
                return <CompletedView tasks={tasks} />;
            case 'Backup':
                return <BackupView appData={appData} onRestoreData={handleRestoreData} />;
            default:
                return <KanbanBoard 
                    tasks={tasks} 
                    onToggleComplete={handleToggleComplete} 
                    onDelete={handleDeleteTask} 
                    onCardClick={handleOpenModal} 
                    onTaskDrop={handleTaskDrop} 
                    onToggleSubtask={handleToggleSubtask} 
                    onDuplicate={handleDuplicateTask} 
                    onResolveParallelTask={handleResolveParallelTask}
                    dailyNotes={dailyNotes}
                    onUpdateNote={handleUpdateNote}
                    onAddAttachment={handleAddAttachment}
                    onDeleteAttachment={handleDeleteAttachment}
                />;
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
                    weeklyGoalsProgress={getWeeklyGoalsProgress()}
                    monthlyGoalsProgress={getMonthlyGoalsProgress()}
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
            <ChangelogModal
                isOpen={isChangelogOpen}
                onClose={handleCloseChangelog}
            />
        </div>
    );
};

export default App;
