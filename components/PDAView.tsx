import React, { useState, useEffect, useRef } from 'react';
import { PdaEntry, Attachment } from '../types';
import { DownloadIcon, PaperClipIcon, TrashIcon } from './Icons';
import Notification from './Notification';

interface PDAViewProps {
    entries: PdaEntry[];
    onSaveEntry: (entry: PdaEntry) => void;
}

const PDAView: React.FC<PDAViewProps> = ({ entries, onSaveEntry }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [perception, setPerception] = useState('');
    const [decision, setDecision] = useState('');
    const [action, setAction] = useState('');
    const [event, setEvent] = useState('');
    const [mood, setMood] = useState<'happy' | 'sad' | null>(null);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'error' as 'error' | 'success' });
    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        if (selectedDate) {
            const entry = entries.find(e => e.date === selectedDate);
            setPerception(entry?.perception || '');
            setDecision(entry?.decision || '');
            setAction(entry?.action || '');
            setEvent(entry?.event || '');
            setMood(entry?.mood || null);
            setAttachments(entry?.attachments || []);
        }
    }, [selectedDate, entries]);

    const handleDayClick = (day: number) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
    };

    const handleSave = () => {
        if (!selectedDate) return;
        onSaveEntry({
            date: selectedDate,
            perception,
            decision,
            action,
            event,
            mood,
            attachments,
        });
        setNotification({ isOpen: true, title: 'Sucesso', message: 'Entrada salva com sucesso!', type: 'success' });
    };

    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                if (dataUrl) {
                    const newAttachment: Attachment = {
                        id: `att_pda_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                        name: file.name,
                        type: file.type,
                        dataUrl,
                    };
                    setAttachments(prev => [...prev, newAttachment]);
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = ''; // Reset input to allow re-uploading the same file
    };

    const handleDeleteAttachment = (attachmentId: string) => {
        setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    };

    const handleExportPDF = () => {
        if (!(window as any).jspdf?.jsPDF) {
            setNotification({ isOpen: true, title: 'Erro', message: "A biblioteca para gerar PDF (jsPDF) não foi carregada.", type: 'error' });
            return;
        }

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long' });

        const monthEntries = entries
            .filter(e => {
                const entryDate = new Date(e.date + 'T00:00:00');
                return entryDate.getMonth() === month && entryDate.getFullYear() === year;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (monthEntries.length === 0) {
            setNotification({ isOpen: true, title: 'Sem Dados', message: `Nenhum registro encontrado para ${monthName} de ${year}.`, type: 'error' });
            return;
        }

        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF({ orientation: 'landscape' });
        
        if (typeof (doc as any).autoTable !== 'function') {
            setNotification({ isOpen: true, title: 'Erro de Plugin', message: "A função para gerar tabelas no PDF (autoTable) não foi encontrada. O plugin pode não ter sido carregado corretamente.", type: 'error' });
            return;
        }
        
        doc.text(`Diário PDA - ${monthName} de ${year}`, 14, 15);
        
        const tableData = monthEntries.map(entry => {
            const day = new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});
            const moodIcon = entry.mood === 'happy' ? 'Feliz :)' : entry.mood === 'sad' ? 'Triste :(' : 'Neutro';
            const eventText = entry.event ? `${entry.event} (${moodIcon})` : '';
            return [
                day,
                entry.perception,
                entry.decision,
                entry.action,
                eventText
            ];
        });

        (doc as any).autoTable({
            head: [['Data', 'Percepção', 'Decisão', 'Ação', 'Acontecimento']],
            body: tableData,
            startY: 20,
            styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
            headStyles: { fillColor: [79, 70, 229] }, // indigo-600
            columnStyles: {
                0: { cellWidth: 18 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 'auto' },
                4: { cellWidth: 40 },
            },
            didDrawPage: function (data: any) {
                // Footer
                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.text('Página ' + String(data.pageNumber) + ' de ' + pageCount, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        doc.save(`pda-relatorio-${monthName}-${year}.pdf`);
    };

    const changeMonth = (offset: number) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
        setSelectedDate(null);
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const calendarDays = [];
        
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="border border-slate-800"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEntry = entries.some(e => e.date === dateStr);
            const isSelected = selectedDate === dateStr;
            
            calendarDays.push(
                <div 
                    key={day} 
                    onClick={() => handleDayClick(day)}
                    className={`border border-slate-800 p-2 flex flex-col min-h-[100px] cursor-pointer hover:bg-slate-700/50 transition-colors relative ${isSelected ? 'bg-indigo-900 ring-2 ring-indigo-500' : ''}`}
                >
                    <span className={`font-bold ${isSelected ? 'text-indigo-300' : 'text-white'}`}>{day}</span>
                    {hasEntry && <div className="absolute bottom-2 right-2 w-2 h-2 bg-green-500 rounded-full" title="Registro existente"></div>}
                </div>
            );
        }

        return calendarDays;
    };

    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <>
        <Notification
            isOpen={notification.isOpen}
            onClose={() => setNotification({ ...notification, isOpen: false })}
            title={notification.title}
            message={notification.message}
            type={notification.type}
        />
        <div className="p-4 text-white">
            <h2 className="text-2xl font-bold mb-4">Diário PDA</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-800/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-slate-700 rounded-md hover:bg-slate-600">&lt;</button>
                        <h3 className="text-xl font-bold capitalize">
                            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h3>
                         <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-slate-700 rounded-md hover:bg-slate-600">&gt;</button>
                    </div>
                     <div className="flex justify-end mb-2">
                        <button onClick={handleExportPDF} className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded-md transition-colors">
                           <DownloadIcon className="w-4 h-4" /> Baixar PDF do Mês
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-px bg-slate-800">
                        {weekdays.map(day => (
                            <div key={day} className="text-center font-semibold text-slate-400 py-2 bg-slate-800">{day}</div>
                        ))}
                        {renderCalendar()}
                    </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                    {selectedDate ? (
                        <div className="max-h-[70vh] overflow-y-auto pr-2">
                            <h3 className="text-xl font-bold mb-4">
                                Registro de <span className="text-indigo-400">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Acontecimento do Dia</label>
                                    <div className="flex gap-2">
                                        <input value={event} onChange={e => setEvent(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md" placeholder="O que marcou o seu dia?" />
                                        <button onClick={() => setMood(mood === 'happy' ? null : 'happy')} className={`p-2 rounded-md transition-colors ${mood === 'happy' ? 'bg-green-500' : 'bg-slate-700 hover:bg-slate-600'}`}>😊</button>
                                        <button onClick={() => setMood(mood === 'sad' ? null : 'sad')} className={`p-2 rounded-md transition-colors ${mood === 'sad' ? 'bg-red-500' : 'bg-slate-700 hover:bg-slate-600'}`}>😔</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Percepção</label>
                                    <textarea value={perception} onChange={e => setPerception(e.target.value)} rows={3} className="w-full bg-slate-700 p-2 rounded-md" placeholder="O que você percebeu hoje?"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Decisão</label>
                                    <textarea value={decision} onChange={e => setDecision(e.target.value)} rows={3} className="w-full bg-slate-700 p-2 rounded-md" placeholder="Qual decisão você tomou a partir disso?"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Ação</label>
                                    <textarea value={action} onChange={e => setAction(e.target.value)} rows={3} className="w-full bg-slate-700 p-2 rounded-md" placeholder="Qual ação você irá tomar?"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Anexos</label>
                                    <div className="bg-slate-700 p-2 rounded-md">
                                        {attachments.length > 0 && (
                                            <div className="flex flex-col gap-2 mb-2 max-h-24 overflow-y-auto">
                                                {attachments.map(att => (
                                                    <div key={att.id} className="bg-slate-800 px-3 py-2 rounded-md text-sm flex items-center justify-between">
                                                        <a 
                                                          href={att.dataUrl} 
                                                          target="_blank" 
                                                          rel="noopener noreferrer" 
                                                          download={att.name}
                                                          className="truncate max-w-48 text-indigo-400 hover:underline" 
                                                          title={`Visualizar/Baixar ${att.name}`}
                                                        >
                                                            {att.name}
                                                        </a>
                                                        <button onClick={() => handleDeleteAttachment(att.id)}>
                                                            <TrashIcon className="w-4 h-4 text-slate-400 hover:text-red-500" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleAttachmentClick}
                                            className="w-full text-center py-2 text-sm text-slate-300 hover:bg-slate-600 rounded-md transition-colors flex items-center justify-center gap-2"
                                        >
                                            <PaperClipIcon className="w-4 h-4" />
                                            Adicionar Anexo
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*,.pdf"
                                        />
                                    </div>
                                </div>
                                <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md">Salvar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">
                            <p>Selecione um dia no calendário para fazer um registro.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
};

export default PDAView;