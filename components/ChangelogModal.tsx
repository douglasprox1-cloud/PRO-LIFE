
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiftIcon, SparklesIcon, FileTextIcon, TrendingUpIcon } from './Icons';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Feature: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-white">{title}</h4>
            <p className="text-sm text-slate-400">{children}</p>
        </div>
    </div>
);


const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                aria-modal="true"
                role="dialog"
            >
                <motion.div
                    initial={{ scale: 0.9, y: -20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: -20, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 border border-slate-700"
                >
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-indigo-500/20 rounded-full mx-auto flex items-center justify-center mb-4">
                             <GiftIcon className="w-9 h-9 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Novidades no Lifeboard Pro!</h2>
                        <p className="text-slate-400 mt-2">Confira as últimas atualizações que preparamos para você.</p>
                    </div>

                    <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-3 -mr-3">
                         <Feature icon={<SparklesIcon className="w-6 h-6 text-yellow-400" />} title="Finanças com IA">
                           Importe suas planilhas (.xlsx, .csv) e deixe nossa IA extrair e categorizar suas transações automaticamente. Mais tempo para você!
                         </Feature>
                         <Feature icon={<FileTextIcon className="w-6 h-6 text-sky-400" />} title="Laboratório dos Livros">
                           Uma nova aba dedicada para organizar todas as suas citações. Importe de planilhas e exporte para PDF ou Excel com facilidade.
                         </Feature>
                          <Feature icon={<TrendingUpIcon className="w-6 h-6 text-green-400" />} title="Integração com Google Agenda">
                           Nunca mais perca um compromisso! Adicione suas tarefas agendadas diretamente ao seu Google Agenda com apenas um clique na aba 'Agenda'.
                         </Feature>
                        <Feature icon={<GiftIcon className="w-6 h-6 text-pink-400" />} title="Backup e Restauração de Dados">
                           Agora você pode exportar todos os seus dados para um arquivo seguro e restaurá-los quando precisar. Perfeito para trocar de dispositivo!
                        </Feature>
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
                    >
                        Entendido!
                    </button>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );
};

export default ChangelogModal;
