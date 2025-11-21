import React, { useState, useMemo, useEffect } from 'react';
import { Category, Priority, Repetition, Task, DayOfWeek } from '../types';
import { SparklesIcon } from './Icons';
import { processTaskFromText } from '../services/geminiService';

interface NewTaskFormProps {
    onAddTask: (taskData: Omit<Task, 'id' | 'subtasks' | 'completed' | 'day' | 'period'>) => void;
}

const categoryPoints: Record<Category, number> = {
    'Rotina 1h': 3,
    'Rotina 3h': 5,
    'Saúde': 10,
    'Pendências': 15,
    'Expansão/Projetos': 20,
    'Hábitos': 5,
    'Padrão Paralelo': 30,
};

const weekDaysForRepetition: { value: DayOfWeek; label: string }[] = [
    { value: 'Sunday', label: 'Dom' },
    { value: 'Monday', label: 'Seg' },
    { value: 'Tuesday', label: 'Ter' },
    { value: 'Wednesday', label: 'Qua' },
    { value: 'Thursday', label: 'Qui' },
    { value: 'Friday', label: 'Sex' },
    { value: 'Saturday', label: 'Sáb' },
];

const NewTaskForm: React.FC<NewTaskFormProps> = ({ onAddTask }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<Category | ''>('');
    const [priority, setPriority] = useState<Priority | ''>('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [fileName, setFileName] = useState('Nenhum arquivo escolhido');
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const [isParsing, setIsParsing] = useState(false);
    const [repetitionMode, setRepetitionMode] = useState<'none' | 'weekly' | 'monthly'>('none');
    const [weeklyDays, setWeeklyDays] = useState<Set<DayOfWeek>>(new Set());

    const isRecurringCategory = useMemo(() => 
        category === 'Hábitos' || category === 'Padrão Paralelo' || category === 'Saúde',
        [category]
    );

    useEffect(() => {
        if (isRecurringCategory) {
            setRepetitionMode('weekly');
            const allDays: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            setWeeklyDays(new Set(allDays));
        }
    }, [isRecurringCategory]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setFileName('Nenhum arquivo escolhido');
            setImageUrl(undefined);
        }
    };
    
    const categories: Category[] = ['Rotina 1h', 'Rotina 3h', 'Saúde', 'Pendências', 'Expansão/Projetos', 'Hábitos', 'Padrão Paralelo'];
    const priorities: Priority[] = ['Urgente', 'O mais breve possível', 'Quando Possível', 'Rotina', 'Pode Esperar'];

    const handleWeeklyDayToggle = (day: DayOfWeek) => {
        setWeeklyDays(prev => {
            const newDays = new Set(prev);
            if (newDays.has(day)) {
                newDays.delete(day);
            } else {
                newDays.add(day);
            }
            return newDays;
        });
    };
    
    const handleRepetitionModeChange = (mode: 'none' | 'weekly' | 'monthly') => {
        setRepetitionMode(mode);
        if (mode !== 'weekly') {
            setWeeklyDays(new Set());
        }
    };

    const handleAiParse = async () => {
        if (!title.trim() || isParsing) return;
        
        setIsParsing(true);
        try {
            const parsedData = await processTaskFromText(title);
            
            if (parsedData.title) setTitle(parsedData.title);
            if (parsedData.category) setCategory(parsedData.category);
            if (parsedData.priority) setPriority(parsedData.priority);
            if (parsedData.date) setDate(parsedData.date);
            if (parsedData.time) setTime(parsedData.time);

        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Falha ao processar a tarefa com IA.");
        } finally {
            setIsParsing(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !category || !priority) {
            alert('Por favor, preencha a atividade, categoria e prioridade.');
            return;
        }

        const taskData: Omit<Task, 'id' | 'subtasks' | 'completed' | 'day' | 'period' | 'repetition'> = {
            title,
            category,
            priority,
            points: categoryPoints[category],
            date: date || undefined,
            time: time || undefined,
            imageUrl
        };
    
        if (repetitionMode === 'weekly' && weeklyDays.size > 0) {
            weeklyDays.forEach(day => {
                const repetitionForDay: Repetition = day;
                onAddTask({
                    ...taskData,
                    repetition: repetitionForDay,
                });
            });
        } else {
            const repetitionValue: Repetition = repetitionMode === 'monthly' ? 'Mensalmente' : 'Não repetir';
            onAddTask({
                ...taskData,
                repetition: repetitionValue,
            });
        }
        
        // Reset form
        setTitle('');
        setCategory('');
        setPriority('');
        setDate('');
        setTime('');
        setRepetitionMode('none');
        setWeeklyDays(new Set());
        setFileName('Nenhum arquivo escolhido');
        setImageUrl(undefined);
    };

  return (
    <div className="bg-slate-800 p-6 rounded-lg mb-8 mx-4">
      <h2 className="text-xl font-bold mb-4">Criar Nova Atividade</h2>
      <form onSubmit={handleSubmit}>
        <div className="relative mb-4">
            <input
                type="text"
                placeholder="Use a IA: 'Reunião com equipe amanhã às 10h, projeto urgente'"
                className="w-full bg-slate-700 p-3 rounded-md placeholder-slate-400 pr-12 text-base"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <button
                type="button"
                onClick={handleAiParse}
                disabled={isParsing || !title.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-400 disabled:text-slate-600 disabled:cursor-not-allowed rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Analisar com IA"
                title="Analisar com IA"
            >
                {isParsing ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ) : (
                <SparklesIcon className="w-5 h-5" />
                )}
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <select className="bg-slate-700 p-2 rounded-md text-white" value={category} onChange={e => setCategory(e.target.value as Category | '')} required>
            <option value="">Categoria</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select className="bg-slate-700 p-2 rounded-md text-white" value={priority} onChange={e => setPriority(e.target.value as Priority | '')} required>
                <option value="">Prioridade</option>
                {priorities.map(prio => <option key={prio} value={prio}>{prio}</option>)}
            </select>
            <input type="date" className="bg-slate-700 p-2 rounded-md text-slate-400" value={date} onChange={e => setDate(e.target.value)} />
            <input type="time" className="bg-slate-700 p-2 rounded-md text-slate-400" value={time} onChange={e => setTime(e.target.value)} />
             <div className={`bg-slate-700 p-2 rounded-md transition-opacity ${isRecurringCategory ? 'opacity-60 bg-slate-700/50' : ''}`}>
                <div className="flex justify-around items-center text-xs h-6">
                    <button type="button" onClick={() => handleRepetitionModeChange('none')} disabled={isRecurringCategory} className={`px-2 rounded transition-colors ${repetitionMode === 'none' ? 'text-indigo-300 font-bold' : 'text-slate-400 hover:text-slate-200'} disabled:cursor-not-allowed`}>Não Repetir</button>
                    <button type="button" onClick={() => handleRepetitionModeChange('weekly')} disabled={isRecurringCategory} className={`px-2 rounded transition-colors ${repetitionMode === 'weekly' ? 'text-indigo-300 font-bold' : 'text-slate-400 hover:text-slate-200'} disabled:cursor-not-allowed`}>Semanal</button>
                    <button type="button" onClick={() => handleRepetitionModeChange('monthly')} disabled={isRecurringCategory} className={`px-2 rounded transition-colors ${repetitionMode === 'monthly' ? 'text-indigo-300 font-bold' : 'text-slate-400 hover:text-slate-200'} disabled:cursor-not-allowed`}>Mensal</button>
                </div>
                {repetitionMode === 'weekly' && (
                    <div className="flex justify-around items-center mt-2 border-t border-slate-600 pt-2">
                        {weekDaysForRepetition.map(day => (
                            <button
                                type="button"
                                key={day.value}
                                onClick={() => handleWeeklyDayToggle(day.value)}
                                disabled={isRecurringCategory}
                                className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${weeklyDays.has(day.value) ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-600'} disabled:cursor-not-allowed`}
                                aria-label={`Repetir na ${day.label}`}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Anexar imagem (Opcional)</span>
                <label htmlFor="file-upload" className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                    Escolher arquivo
                </label>
                <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <span className="text-slate-500 text-sm truncate max-w-xs">{fileName}</span>
            </div>
            <button type="submit" className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors">
            Adicionar Tarefa
            </button>
        </div>
      </form>
    </div>
  );
};

export default NewTaskForm;
