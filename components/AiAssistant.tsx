
import React, { useState } from 'react';
import { getAiSuggestions } from '../services/geminiService';
import { GroundingChunk } from '../types';
import { SparklesIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

const AiAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleGetSuggestions = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResult('');
    setSources([]);
    try {
      const { text, sources } = await getAiSuggestions(prompt);
      setResult(text);
      setSources(sources);
    } catch (error) {
      console.error(error);
      setResult('Ocorreu um erro ao buscar as sugestões.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
      {isOpen && (
         <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-800 border border-slate-700 shadow-2xl rounded-lg w-96 p-4 mb-2 origin-bottom-right"
         >
            <h3 className="font-bold text-lg mb-2 flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-indigo-400"/> Assistente IA</h3>
            <p className="text-sm text-slate-400 mb-4">Precisa de ideias? Obtenha sugestões atualizadas para tarefas ou metas.</p>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: ideias de café da manhã saudáveis"
                className="w-full bg-slate-700 p-2 rounded-md placeholder-slate-400 h-20 resize-none mb-2"
                disabled={isLoading}
            />
            <button
                onClick={handleGetSuggestions}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Pensando...
                    </>
                ) : 'Obter Sugestões'}
            </button>
            {result && (
                <div className="mt-4 p-3 bg-slate-900 rounded-md max-h-48 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{result}</p>
                    {sources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-700">
                            <h4 className="text-xs font-semibold text-slate-400 mb-1">Fontes:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {sources.map((source, index) => (
                                    <li key={index} className="text-xs truncate">
                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                                            {source.web.title || source.web.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
      )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-transform hover:scale-110"
        aria-label="Alternar Assistente IA"
      >
        <SparklesIcon className="w-8 h-8 text-white" />
      </button>
    </div>
  );
};

export default AiAssistant;
