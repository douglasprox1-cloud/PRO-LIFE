import React from 'react';
import { motion } from 'framer-motion';
import { PendingItem } from '../types';
import { CalendarPlusIcon, TrashIcon } from './Icons';

interface BacklogCardProps {
    item: PendingItem;
    onMoveToKanban: (itemId: string) => void;
    onDelete: (itemId: string) => void;
}

// Simple hash function to get a color from a string
const getTagColor = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 40%)`;
    return color;
};

const BacklogCard: React.FC<BacklogCardProps> = ({ item, onMoveToKanban, onDelete }) => {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ itemId: item.id, currentStatus: item.status }));
        e.currentTarget.style.opacity = '0.5';
    };
    
    const handleDragEnd = (e: React.DragEvent) => {
        e.currentTarget.style.opacity = '1';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            draggable="true"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="bg-slate-800 p-4 rounded-lg shadow-md cursor-grab active:cursor-grabbing"
        >
            <h4 className="font-bold text-white mb-2">{item.title}</h4>
            <p className="text-sm text-slate-400 mb-3">{item.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
                {item.tags.map(tag => (
                    <span key={tag} className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: getTagColor(tag), color: 'white' }}>
                        {tag}
                    </span>
                ))}
            </div>
            <div className="flex justify-end items-center gap-2 border-t border-slate-700 pt-2">
                <button onClick={() => onDelete(item.id)} title="Excluir Pendência" className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                </button>
                <button onClick={() => onMoveToKanban(item.id)} title="Mover para o Kanban" className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded-md transition-colors">
                    <CalendarPlusIcon className="w-4 h-4" />
                    <span>Kanban</span>
                </button>
            </div>
        </motion.div>
    );
};

export default BacklogCard;
