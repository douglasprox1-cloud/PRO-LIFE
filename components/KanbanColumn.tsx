import React, { useState, useRef } from 'react';
import { Task, DayKey, Period, DailyNote, Attachment } from '../types';
import KanbanCard from './KanbanCard';
import { AnimatePresence } from 'framer-motion';
import { MicrophoneIcon, PaperClipIcon, DownloadIcon, FileTextIcon, TrashIcon } from './Icons';
import Notification from './Notification';


interface KanbanColumnProps {
  title: string;
  date: string;
  tasks: Task[];
  day: DayKey;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onCardClick: (task: Task) => void;
  onTaskDrop: (taskId: string, day: DayKey, period: Period | null) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDuplicate: (taskId: string) => void;
  onResolveParallelTask: (taskId: string, resolution: 'winner' | 'defeated') => void;
  note: DailyNote | undefined;
  onUpdateNote: (day: DayKey, content: string) => void;
  onAddAttachment: (day: DayKey, file: File) => void;
  onDeleteAttachment: (day: DayKey, attachmentId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, date, tasks, day, onToggleComplete, onDelete, onCardClick, onTaskDrop, onToggleSubtask, onDuplicate, onResolveParallelTask, note, onUpdateNote, onAddAttachment, onDeleteAttachment }) => {
  const morningTasks = tasks.filter(t => t.period === 'Manhã');
  const afternoonTasks = tasks.filter(t => t.period === 'Tarde');
  const nightTasks = tasks.filter(t => t.period === 'Noite');
  const unscheduledTasks = tasks.filter(t => !t.period);

  const [dragOver, setDragOver] = useState<Period | 'unscheduled' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'error' as 'error' | 'success' });


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, period: Period | null) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
        onTaskDrop(taskId, day, period);
    }
    setDragOver(null);
  };
  
  const getDropZoneClasses = (zone: Period | 'unscheduled') => {
      return dragOver === zone ? 'bg-indigo-900/50 border-indigo-500 ring-2 ring-indigo-400' : 'border-slate-700';
  }
  
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateNote(day, e.target.value);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAddAttachment(day, e.target.files[0]);
    }
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };

  const handleVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setNotification({ isOpen: true, title: 'Erro de Compatibilidade', message: "Seu navegador não suporta o reconhecimento de voz.", type: 'error' });
      return;
    }

    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'pt-BR';
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };
    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };
    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      onUpdateNote(day, (note?.content || '') + ' ' + transcript);
    };

    recognitionRef.current.start();
  };

  const handleDownloadPdf = () => {
    if (!(window as any).jspdf?.jsPDF) {
      setNotification({ isOpen: true, title: 'Erro', message: "A biblioteca para gerar PDF (jsPDF) não foi carregada.", type: 'error' });
      return;
    }
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    
    doc.text(`Anotações - ${title || 'Caixa de Entrada'}`, 14, 15);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(note?.content || "Nenhuma anotação.", 180);
    doc.text(splitText, 14, 25);
    let lastY = 25 + (splitText.length * 5); // Approximate height

    if (note?.attachments && note.attachments.length > 0) {
        lastY += 10;
        doc.setFontSize(14);
        doc.text("Anexos", 14, lastY);
        lastY += 8;
        doc.setFontSize(11);
        note.attachments.forEach(att => {
            if (lastY > 280) { // New page if content overflows
                doc.addPage();
                lastY = 15;
            }
            doc.text(`- ${att.name}`, 14, lastY);
            lastY += 7;
        });
    }

    doc.save(`anotacoes-${day}.pdf`);
  };

  const handleDownloadDoc = () => {
    let contentHtml = `
      <html>
        <head><meta charset='UTF-8'></head>
        <body>
          <h1>Anotações - ${title || 'Caixa de Entrada'}</h1>
          <p>${(note?.content || '').replace(/\n/g, '<br />')}</p>
    `;

    if (note?.attachments && note.attachments.length > 0) {
        contentHtml += '<h2>Anexos:</h2><ul>';
        note.attachments.forEach(att => {
            contentHtml += `<li>${att.name}</li>`;
        });
        contentHtml += '</ul>';
    }

    contentHtml += '</body></html>';

    const blob = new Blob([contentHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anotacoes-${day}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const renderTaskList = (tasksToRender: Task[]) => (
    <div className="space-y-3">
        <AnimatePresence>
            {tasksToRender.map(task => (
                <KanbanCard key={task.id} task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} onClick={onCardClick} onToggleSubtask={onToggleSubtask} onDuplicate={onDuplicate} onResolveParallelTask={onResolveParallelTask} />
            ))}
        </AnimatePresence>
    </div>
  );

  return (
    <>
      <Notification 
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
      <div className="flex-shrink-0 w-80 lg:w-96 bg-slate-800/50 rounded-lg p-4 flex flex-col h-[calc(100vh-18rem)]">
        <div className="flex-shrink-0 flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-white">{title}</h3>
          <span className="text-sm text-slate-400">{date}</span>
        </div>
        
        <div className="flex-grow overflow-y-auto space-y-4 pr-2 -mr-2">
          {/* Unscheduled */}
          <div 
            className={`min-h-[6rem] rounded-lg p-3 border-2 border-dashed transition-all duration-200 bg-slate-700/20 ${getDropZoneClasses('unscheduled')}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, null)}
            onDragEnter={(e) => { e.preventDefault(); setDragOver('unscheduled'); }}
            onDragLeave={() => setDragOver(null)}
          >
            {unscheduledTasks.length > 0
              ? renderTaskList(unscheduledTasks)
              : <div className="flex justify-center items-center h-16 text-slate-500 text-sm pointer-events-none">Arraste tarefas aqui</div>
            }
          </div>
          
          {/* Manhã */}
          <div 
            className={`min-h-[6rem] rounded-lg bg-blue-900/30 p-3 border-2 border-dashed transition-all duration-200 ${getDropZoneClasses('Manhã')}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Manhã')}
            onDragEnter={(e) => { e.preventDefault(); setDragOver('Manhã'); }}
            onDragLeave={() => setDragOver(null)}
          >
            <h4 className="font-semibold text-sm text-blue-300 mb-2 pointer-events-none">☀️ Manhã</h4>
            {morningTasks.length > 0
              ? renderTaskList(morningTasks)
              : <div className="flex justify-center items-center h-16 text-blue-400/50 text-sm pointer-events-none">Arraste tarefas aqui</div>
            }
          </div>

          {/* Tarde */}
          <div 
            className={`min-h-[6rem] rounded-lg bg-orange-900/30 p-3 border-2 border-dashed transition-all duration-200 ${getDropZoneClasses('Tarde')}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Tarde')}
            onDragEnter={(e) => { e.preventDefault(); setDragOver('Tarde'); }}
            onDragLeave={() => setDragOver(null)}
          >
            <h4 className="font-semibold text-sm text-orange-300 mb-2 pointer-events-none">🌤️ Tarde</h4>
            {afternoonTasks.length > 0
              ? renderTaskList(afternoonTasks)
              : <div className="flex justify-center items-center h-16 text-orange-400/50 text-sm pointer-events-none">Arraste tarefas aqui</div>
            }
          </div>

          {/* Noite */}
          <div 
            className={`min-h-[6rem] rounded-lg bg-purple-900/30 p-3 border-2 border-dashed transition-all duration-200 ${getDropZoneClasses('Noite')}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Noite')}
            onDragEnter={(e) => { e.preventDefault(); setDragOver('Noite'); }}
            onDragLeave={() => setDragOver(null)}
          >
            <h4 className="font-semibold text-sm text-purple-300 mb-2 pointer-events-none">🌙 Noite</h4>
            {nightTasks.length > 0
              ? renderTaskList(nightTasks)
              : <div className="flex justify-center items-center h-16 text-purple-400/50 text-sm pointer-events-none">Arraste tarefas aqui</div>
            }
          </div>
        </div>

        <div className="flex-shrink-0 pt-4 border-t-2 border-slate-700/50 mt-4">
          <h4 className="font-semibold text-sm text-slate-300 mb-2">Bloco de Anotações</h4>
          <div className="bg-slate-900/50 p-2 rounded-md">
              <textarea 
                  className="w-full bg-transparent text-sm text-slate-300 p-1 resize-none focus:outline-none"
                  rows={4}
                  placeholder="Digite suas anotações aqui..."
                  value={note?.content || ''}
                  onChange={handleNoteChange}
              />
              {note?.attachments && note.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 p-1 max-h-20 overflow-y-auto">
                      {note.attachments.map(att => (
                          <div key={att.id} className="bg-slate-700 px-2 py-1 rounded-full text-xs flex items-center gap-2">
                              <span className="truncate max-w-28">{att.name}</span>
                              <button onClick={() => onDeleteAttachment(day, att.id)} className="flex-shrink-0">
                                  <TrashIcon className="w-3 h-3 text-slate-400 hover:text-red-500" />
                              </button>
                          </div>
                      ))}
                  </div>
              )}
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700">
                  <div className="flex gap-2">
                      <button onClick={handleVoiceRecognition} title={isRecording ? "Parar Gravação" : "Gravar anotação por voz"} className="p-1 rounded-full hover:bg-slate-700">
                          <MicrophoneIcon className={`w-5 h-5 ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-white'}`} />
                      </button>
                      <button onClick={handleAttachmentClick} title="Anexar arquivo" className="p-1 rounded-full hover:bg-slate-700">
                          <PaperClipIcon className="w-5 h-5 text-slate-400 hover:text-white" />
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                      </button>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={handleDownloadPdf} title="Baixar como PDF" className="p-1 rounded-full hover:bg-slate-700">
                          <DownloadIcon className="w-5 h-5 text-slate-400 hover:text-white" />
                      </button>
                      <button onClick={handleDownloadDoc} title="Baixar como DOC" className="p-1 rounded-full hover:bg-slate-700">
                          <FileTextIcon className="w-5 h-5 text-slate-400 hover:text-white" />
                      </button>
                  </div>
              </div>
          </div>
      </div>
      </div>
    </>
  );
};

export default KanbanColumn;