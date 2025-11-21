
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, Category, Goal, Transaction, DayKey } from '../types';
import { motion } from 'framer-motion';
import { PlayIcon, PauseIcon, ArrowPathIcon, StarIcon, CalendarPlusIcon, TrendingDownIcon } from './Icons';

interface FocusViewProps {
    tasks: Task[];
    onToggleComplete: (taskId: string) => void;
    goals: Goal[];
    transactions: Transaction[];
}

const categoryStyles: { [key in Category]: { text: string, bg: string } } = {
    'Rotina 1h': { text: 'text-sky-300', bg: 'bg-sky-500/20' },
    'Rotina 3h': { text: 'text-blue-300', bg: 'bg-blue-500/20' },
    'Saúde': { text: 'text-green-300', bg: 'bg-green-500/20' },
    'Pendências': { text: 'text-yellow-300', bg: 'bg-yellow-500/20' },
    'Expansão/Projetos': { text: 'text-orange-300', bg: 'bg-orange-500/20' },
    'Hábitos': { text: 'text-pink-300', bg: 'bg-pink-500/20' },
    'Padrão Paralelo': { text: 'text-purple-300', bg: 'bg-purple-500/20' },
};

const MODES = {
    work: { time: 25, label: 'Foco' },
    shortBreak: { time: 5, label: 'Pausa Curta' },
    longBreak: { time: 15, label: 'Pausa Longa' },
};

const FocusView: React.FC<FocusViewProps> = ({ tasks, onToggleComplete, goals, transactions }) => {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
    const [timeLeft, setTimeLeft] = useState(MODES[mode].time * 60);
    const [isActive, setIsActive] = useState(false);
    const [pomodoros, setPomodoros] = useState(0);

    const alarmSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            alarmSoundRef.current = new Audio('data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaW5nIGNyZWF0ZWQgYnkgIm1wMy1vbmxpbmUuY29tIgpUUkNrAAAAAgAAAAAAAAAAADVTVk5JAAAAAQgAAAAAAEtleXNoaWZ0LmNvbQBUSUxFAAAAIAAAAFRCb2FyZCBNZWV0aW5nIEFsZXJ0IChzb3VuZCkNCgBGTEFYAAAA6QAAANIAAAAAAAD/8/v4ADkBz///yS//+9/00IAAABkIAAAGQAAAAAAAAD/85v4AFAG4Af/79/SgAAAAgAAAAgAAAA//Ob+ABQBuAH/+///pAAAAAYAAAAYAAAA//Ob+ABQBuAH/+///pAAAAAYAAAAYAAAA//Ob+ABQBuAH/+///pAAAAAYAAAAYAAAA//Ob+ABQBuAH//v/6UAAAAgAAAAQAAAA//Ob+ADsDcAP/7//lQAAAAgAAACAAAA//Ob+ADsDcAP//v/5UAAAAIAAAAEAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA//v/+VAAAAEAAAAEAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA//v/+VAAAAEAAAAEAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA//v/+VAAAAEAAAAEAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4A///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/85v4AOwNwA///8+VAAAAEAAAACAAAAD/8AIJCAARALAABAAAD/8AD/AAAAAAA=');
        }
    }, []);

    const selectedTask = useMemo(() => tasks.find(t => t.id === selectedTaskId), [tasks, selectedTaskId]);

    useEffect(() => {
        if (!isActive) return;

        if (timeLeft <= 0) {
            alarmSoundRef.current?.play();
            if (mode === 'work') {
                setPomodoros(prev => prev + 1);
                if (selectedTask && window.confirm(`Sessão de foco concluída! Você completou a tarefa "${selectedTask.title}"?`)) {
                    onToggleComplete(selectedTask.id);
                    setSelectedTaskId(null);
                }
                const nextMode = pomodoros > 0 && (pomodoros + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
                switchMode(nextMode);
            } else {
                switchMode('work');
            }
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);

    }, [isActive, timeLeft, mode, pomodoros, onToggleComplete, selectedTask]);

    const switchMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
        setIsActive(false);
        setMode(newMode);
        setTimeLeft(MODES[newMode].time * 60);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(MODES[mode].time * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const radius = 140;
    const circumference = 2 * Math.PI * radius;
    const totalDuration = MODES[mode].time * 60;
    const strokeDashoffset = circumference - (timeLeft / totalDuration) * circumference;
    
    // Logic for Task Lists & Reminders
    const today = useMemo(() => new Date(), []);
    const dayKeys: DayKey[] = useMemo(() => ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], []);
    const todayDayKey = useMemo(() => dayKeys[today.getDay()], [today, dayKeys]);

    // Group tasks for selection
    const inboxTasks = useMemo(() => tasks.filter(t => t.day === 'inbox'), [tasks]);
    const todayTasks = useMemo(() => tasks.filter(t => t.day === todayDayKey), [tasks, todayDayKey]);
    const upcomingTasks = useMemo(() => {
        const todayIndex = today.getDay();
        const sortedDayKeys = [...dayKeys.slice(todayIndex + 1), ...dayKeys.slice(0, todayIndex)];
        
        return tasks
            .filter(t => t.day !== 'inbox' && t.day !== todayDayKey)
            .sort((a, b) => {
                const dayAIndex = sortedDayKeys.indexOf(a.day);
                const dayBIndex = sortedDayKeys.indexOf(b.day);
                return dayAIndex - dayBIndex;
            });
    }, [tasks, todayDayKey, dayKeys, today]);

    const isWithinNext7Days = (dateStr: string) => {
        const todayF = new Date();
        todayF.setHours(0, 0, 0, 0);
        const targetDate = new Date(dateStr + 'T00:00:00');
        const sevenDaysFromNow = new Date(todayF);
        sevenDaysFromNow.setDate(todayF.getDate() + 7);
        return targetDate > todayF && targetDate <= sevenDaysFromNow;
    };
    
    const activeGoals = useMemo(() => goals.filter(g => g.progress < 100), [goals]);
    const upcomingBills = useMemo(() => transactions.filter(t => t.dueDate && isWithinNext7Days(t.dueDate) && t.isPaid !== true), [transactions]);

    const renderTaskList = (tasksToRender: Task[], title: string) => (
        <>
            {tasksToRender.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold text-slate-400 mb-2">{title}</h3>
                    <div className="space-y-2">
                        {tasksToRender.map(task => (
                            <button
                                key={task.id}
                                onClick={() => setSelectedTaskId(task.id)}
                                className={`w-full text-left p-3 rounded-md transition-all duration-200 border-2 ${selectedTaskId === task.id ? 'bg-indigo-500/30 border-indigo-500' : 'bg-slate-700/50 hover:bg-slate-700 border-transparent'}`}
                            >
                                <p className="font-semibold">{task.title}</p>
                                <div className="flex items-center justify-between text-xs mt-1">
                                    <span className={`${categoryStyles[task.category].text} ${categoryStyles[task.category].bg} px-2 py-0.5 rounded-full`}>{task.category}</span>
                                    <span className="text-yellow-400 font-bold flex items-center gap-1"><StarIcon className="w-3 h-3" /> {task.points} Pts</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-slate-800/50 p-6 rounded-lg">
                <div className="max-h-[80vh] overflow-y-auto pr-2">
                    <h2 className="text-xl font-bold">Escolha uma Atividade para Focar</h2>
                    
                    {renderTaskList(todayTasks, 'Para Hoje')}
                    {renderTaskList(inboxTasks, 'Caixa de Entrada')}
                    {renderTaskList(upcomingTasks, 'Próximas')}
                    
                    {(inboxTasks.length + todayTasks.length + upcomingTasks.length) === 0 && (
                        <p className="text-slate-500 text-center py-8">Nenhuma tarefa disponível. Adicione uma no Kanban!</p>
                    )}

                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">Lembretes</h2>
                        <div className="space-y-4">
                            {/* Active Goals */}
                            <div>
                                <h3 className="font-semibold text-indigo-300 mb-2 flex items-center"><StarIcon className="w-4 h-4 mr-2" /> Metas Ativas</h3>
                                <div className="space-y-1 text-sm">
                                    {activeGoals.length > 0 ? activeGoals.map(g => (
                                        <p key={g.id} className="text-slate-300 bg-slate-700/50 p-2 rounded-md">{g.title} ({g.type === 'weekly' ? 'Semanal' : 'Mensal'})</p>
                                    )) : <p className="text-slate-500 text-xs">Nenhuma meta ativa.</p>}
                                </div>
                            </div>
                            {/* Upcoming Bills */}
                             <div>
                                <h3 className="font-semibold text-orange-300 mb-2 flex items-center"><TrendingDownIcon className="w-4 h-4 mr-2" /> Contas a Vencer</h3>
                                 <div className="space-y-1 text-sm">
                                    {upcomingBills.length > 0 ? upcomingBills.map(b => (
                                        <p key={b.id} className="text-slate-300 bg-slate-700/50 p-2 rounded-md">{b.description} - {new Date(b.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                    )) : <p className="text-slate-500 text-xs">Nenhuma conta a vencer nos próximos 7 dias.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-lg flex flex-col items-center justify-center">
                <div className="flex gap-2 mb-6">
                    {Object.keys(MODES).map((key) => (
                        <button
                            key={key}
                            onClick={() => switchMode(key as 'work' | 'shortBreak' | 'longBreak')}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${mode === key ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                        >
                            {MODES[key as keyof typeof MODES].label}
                        </button>
                    ))}
                </div>

                <div className="relative w-80 h-80 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                        <circle cx="50%" cy="50%" r={radius} strokeWidth="12" stroke="#334155" fill="transparent" />
                        <motion.circle
                            cx="50%" cy="50%" r={radius} strokeWidth="12"
                            stroke="#6366f1"
                            fill="transparent"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1, ease: "linear" }}
                        />
                    </svg>
                    <div className="z-10 text-center">
                        <h3 className="text-6xl font-bold tracking-tighter">{formatTime(timeLeft)}</h3>
                        <p className="text-slate-400 mt-2 truncate max-w-xs">{selectedTask ? selectedTask.title : 'Selecione uma tarefa'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-6">
                    <button onClick={() => setIsActive(!isActive)} disabled={!selectedTask} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full w-20 h-20 flex items-center justify-center text-xl shadow-lg disabled:bg-slate-600 disabled:cursor-not-allowed">
                        {isActive ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                    </button>
                     <button onClick={resetTimer} className="text-slate-400 hover:text-white transition-colors p-4">
                        <ArrowPathIcon className="w-6 h-6" />
                    </button>
                </div>
                 <div className="mt-6 text-lg font-semibold text-slate-300">
                    Sessões de Foco: <span className="text-indigo-400">{pomodoros}</span>
                </div>
            </div>
        </div>
    );
};

export default FocusView;
