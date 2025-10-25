import React, { useState } from 'react';
import { Category, Priority, Repetition, Task } from '../types';

interface NewTaskFormProps {
    onAddTask: (taskData: Omit<Task, 'id' | 'subtasks' | 'completed' | 'day' | 'period'>) => void;
}

const NewTaskForm: React.FC<NewTaskFormProps> = ({ onAddTask }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<Category | ''>('');
    const [priority, setPriority] = useState<Priority | ''>('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [repetition, setRepetition] = useState<Repetition>('Não repetir');
    const [fileName, setFileName] = useState('Nenhum arquivo escolhido');
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

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
    
    const categories: Category[] = ['Rotina 1h', 'Rotina 3h', 'Saúde', 'Pendências', 'Expansão/Projetos', 'Hábitos'];
    const priorities: Priority[] = ['Urgente', 'Quando Possível', 'Rotina', 'Pode Esperar'];
    const repetitions: Repetition[] = ['Não repetir', 'Diariamente', 'Semanalmente', 'Mensalmente'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !category || !priority) {
            // Simple validation
            alert('Por favor, preencha a atividade, categoria e prioridade.');
            return;
        }

        onAddTask({
            title,
            category,
            priority,
            points: 10, // Default points, can be dynamic later
            date: date || undefined,
            time: time || undefined,
            repetition,
            imageUrl
        });
        
        // Reset form
        setTitle('');
        setCategory('');
        setPriority('');
        setDate('');
        setTime('');
        setRepetition('Não repetir');
        setFileName('Nenhum arquivo escolhido');
        setImageUrl(undefined);
    };

  return (
    <div className="bg-slate-800 p-6 rounded-lg mb-8 mx-4">
      <h2 className="text-xl font-bold mb-4">Criar Nova Atividade</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
            <input type="text" placeholder="Atividade - Ex: Estudar JavaScript por 1 hora" className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-6 bg-slate-700 p-2 rounded-md placeholder-slate-400" value={title} onChange={e => setTitle(e.target.value)} required />
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
             <select className="bg-slate-700 p-2 rounded-md text-white" value={repetition} onChange={e => setRepetition(e.target.value as Repetition)}>
                {repetitions.map(rep => <option key={rep} value={rep}>{rep}</option>)}
            </select>
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