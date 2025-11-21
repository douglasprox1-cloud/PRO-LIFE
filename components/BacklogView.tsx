import React, { useState } from 'react';
import { PendingItem, PendingItemStatus } from '../types';
import BacklogCard from './BacklogCard';

interface BacklogViewProps {
    items: PendingItem[];
    onAddItem: (item: Omit<PendingItem, 'id' | 'createdAt' | 'status'>) => void;
    onUpdateItemStatus: (itemId: string, newStatus: PendingItemStatus) => void;
    onDeleteItem: (itemId: string) => void;
    onMoveToKanban: (itemId: string) => void;
}

const statuses: PendingItemStatus[] = ['A iniciar', 'Executando', 'Concluído'];

const BacklogView: React.FC<BacklogViewProps> = ({ items, onAddItem, onUpdateItemStatus, onDeleteItem, onMoveToKanban }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [dragOverColumn, setDragOverColumn] = useState<PendingItemStatus | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('O título é obrigatório.');
            return;
        }
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
        onAddItem({ title, description, tags: tagsArray });
        setTitle(''); setDescription(''); setTags('');
    };
    
    const handleDrop = (e: React.DragEvent, newStatus: PendingItemStatus) => {
        e.preventDefault();
        setDragOverColumn(null);
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;
        const { itemId, currentStatus } = JSON.parse(data);
        if (itemId && currentStatus !== newStatus) {
            onUpdateItemStatus(itemId, newStatus);
        }
    };

    return (
        <div className="p-4 text-white space-y-6">
             <div className="bg-slate-800 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Adicionar Nova Pendência</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Título da pendência" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-700 p-3 rounded-md placeholder-slate-400 text-base" required/>
                    <textarea placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-slate-700 p-3 rounded-md placeholder-slate-400 text-base resize-y"/>
                    <input type="text" placeholder="Etiquetas (separadas por vírgula)" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full bg-slate-700 p-3 rounded-md placeholder-slate-400 text-base" />
                    <div className="text-right"> <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors"> Adicionar </button> </div>
                </form>
             </div>
             
             <div className="flex flex-col lg:flex-row gap-6">
                {statuses.map(status => (
                    <div 
                        key={status}
                        onDragOver={(e) => { e.preventDefault(); setDragOverColumn(status); }}
                        onDragLeave={() => setDragOverColumn(null)}
                        onDrop={(e) => handleDrop(e, status)}
                        className={`flex-1 bg-slate-800/50 rounded-lg p-4 transition-all duration-200 ${dragOverColumn === status ? 'ring-2 ring-indigo-500 bg-slate-800' : ''}`}
                    >
                        <h3 className="font-bold text-lg text-white mb-4 border-b-2 border-slate-700 pb-2">{status}</h3>
                        <div className="space-y-4 min-h-[60vh] max-h-[60vh] overflow-y-auto pr-2">
                            {items.filter(item => item.status === status).map(item => (
                                <BacklogCard 
                                    key={item.id} 
                                    item={item} 
                                    onMoveToKanban={onMoveToKanban}
                                    onDelete={onDeleteItem}
                                />
                            ))}
                        </div>
                    </div>
                ))}
             </div>
        </div>
    );
};

export default BacklogView;
