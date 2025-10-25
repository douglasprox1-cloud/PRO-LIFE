import React, { useState, useMemo } from 'react';
import { TrendingUpIcon, TrendingDownIcon, PieChartIcon, UploadIcon, CalendarPlusIcon, SparklesIcon } from './Icons';
import { IncomeCategory, ExpenseCategory, Transaction } from '../types';
import { processTransactionsFromText } from '../services/geminiService';

const incomeCategories: IncomeCategory[] = ['Hospital', '24 de Março', 'Eventos', 'Grau', 'Outros', 'Palestras', 'Vendas'];
const expenseCategories: ExpenseCategory[] = ['Moradia', 'Transporte', 'Dívidas', 'Lazer', 'Presentes', 'Alimentação', 'Reserva', 'Imprevisto', 'Estudo', 'Autocuidado', 'Farmácia', 'Cartão de Crédito'];


interface FinanceViewProps {
    transactions: Transaction[];
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const FinanceStatCard: React.FC<{title: string, value: string, icon: React.ReactNode, colorClass: string}> = ({ title, value, icon, colorClass }) => (
    <div className="bg-slate-800 p-4 rounded-lg flex items-center">
        <div className={`p-3 bg-slate-700 rounded-lg mr-4 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-400 text-sm">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);


const FinanceView: React.FC<FinanceViewProps> = ({ transactions, onAddTransaction }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formType, setFormType] = useState<'expense' | 'income' | 'schedule'>('expense');
  
  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory | IncomeCategory | ''>('');
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [dueDate, setDueDate] = useState('');

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
  }, [transactions]);
  
  const scheduledExpenses = useMemo(() => {
    return transactions
      .filter(t => t.dueDate && new Date(t.dueDate) >= new Date())
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [transactions]);
  
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    try {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const csvText = await fileToCsvText(selectedFile);
                const extractedTransactions = await processTransactionsFromText(csvText);
                
                extractedTransactions.forEach(t => {
                    if (t.description && t.amount && t.date && t.type && t.category) {
                         onAddTransaction(t as Omit<Transaction, 'id'>);
                    }
                });
                alert(`${extractedTransactions.length} transações importadas com sucesso!`);
            } catch (error) {
                 alert(error instanceof Error ? error.message : "Ocorreu um erro desconhecido.");
            } finally {
                 setIsProcessing(false);
                 setSelectedFile(null);
                 if (document.getElementById('file-upload-finance')) {
                    (document.getElementById('file-upload-finance') as HTMLInputElement).value = '';
                 }
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
        alert(error instanceof Error ? error.message : "Erro ao ler o arquivo.");
        setIsProcessing(false);
    }
  };

  const fileToCsvText = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
              try {
                  const data = new Uint8Array(event.target?.result as ArrayBuffer);
                  const workbook = (window as any).XLSX.read(data, { type: 'array' });
                  const firstSheetName = workbook.SheetNames[0];
                  const worksheet = workbook.Sheets[firstSheetName];
                  const textData = (window as any).XLSX.utils.sheet_to_csv(worksheet);
                  resolve(textData);
              } catch (e) {
                  reject(e);
              }
          };
          reader.onerror = (error) => reject(error);
          reader.readAsArrayBuffer(file);
      });
  };

  const generateGoogleCalendarLink = (transaction: Transaction) => {
    if (!transaction.dueDate) return '#';
    const startDate = new Date(transaction.dueDate + 'T09:00:00'); // Assume 9 AM
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
    const toGCalTime = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
    const url = new URL('https://www.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', `Pagamento: ${transaction.description}`);
    url.searchParams.append('dates', `${toGCalTime(startDate)}/${toGCalTime(endDate)}`);
    url.searchParams.append('details', `Vencimento da despesa registrada no Lifeboard Pro.\nValor: R$ ${transaction.amount.toFixed(2)}`);
    return url.toString();
  };
  
  const resetForm = () => {
      setDescription('');
      setAmount('');
      setCategory('');
      setIsCreditCard(false);
      setDueDate('');
      // Keep today's date
      setDate(new Date().toISOString().split('T')[0]);
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const numAmount = parseFloat(amount);
      if (!description || isNaN(numAmount) || numAmount <= 0 || !category) {
          alert("Por favor, preencha todos os campos corretamente.");
          return;
      }
      
      let transactionData: Omit<Transaction, 'id'>;

      if (formType === 'schedule') {
          if (!dueDate) {
              alert("Por favor, insira a data de vencimento.");
              return;
          }
           transactionData = {
              description,
              amount: numAmount,
              date: new Date().toISOString().split('T')[0], // Record date is today
              type: 'expense',
              category: category as ExpenseCategory,
              isCreditCard,
              dueDate,
          };
      } else {
           transactionData = {
              description,
              amount: numAmount,
              date,
              type: formType,
              category: category as any, // Cast because it can be either type
              isCreditCard: formType === 'expense' ? isCreditCard : undefined,
          };
      }
      
      onAddTransaction(transactionData);
      resetForm();
  }

  const renderForm = () => {
      const isSchedule = formType === 'schedule';
      const isIncome = formType === 'income';
      const categories = isIncome ? incomeCategories : expenseCategories;
      
      return (
          <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-400">Descrição</label>
                      <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder={isIncome ? 'Ex: Venda de produto' : 'Ex: Aluguel'} className="w-full mt-1 bg-slate-700 p-2 rounded-md" required/>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-slate-400">Valor (R$)</label>
                      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="150.00" step="0.01" className="w-full mt-1 bg-slate-700 p-2 rounded-md" required/>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-slate-400">Categoria</label>
                      <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full mt-1 bg-slate-700 p-2 rounded-md" required>
                          <option value="">Selecione...</option>
                          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                  </div>
                  {isSchedule ? (
                       <div>
                          <label className="text-sm font-medium text-slate-400">Data de Vencimento</label>
                          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full mt-1 bg-slate-700 p-2 rounded-md text-slate-400" required/>
                      </div>
                  ) : (
                      <div>
                          <label className="text-sm font-medium text-slate-400">Data da Transação</label>
                          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full mt-1 bg-slate-700 p-2 rounded-md text-slate-400" required/>
                      </div>
                  )}
                  {!isIncome && (
                      <div className="flex items-center pt-6">
                           <input type="checkbox" id="creditCardCheck" checked={isCreditCard} onChange={e => setIsCreditCard(e.target.checked)} className="h-4 w-4 bg-slate-600 border-slate-500 rounded text-indigo-500 focus:ring-indigo-500"/>
                           <label htmlFor="creditCardCheck" className="ml-2 text-sm text-slate-300">É uma compra no cartão de crédito?</label>
                      </div>
                  )}
              </div>
              <div className="text-right">
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors">
                      {isSchedule ? 'Agendar' : (isIncome ? 'Adicionar Entrada' : 'Adicionar Saída')}
                  </button>
              </div>
          </form>
      )
  }

  return (
    <div className="p-4 text-white space-y-6">
        <h2 className="text-2xl font-bold">Orçamento e Finanças</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FinanceStatCard title="Saldo Atual" value={balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={<PieChartIcon className="w-6 h-6"/>} colorClass="text-sky-400" />
            <FinanceStatCard title="Total de Entradas" value={totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={<TrendingUpIcon className="w-6 h-6"/>} colorClass="text-green-400" />
            <FinanceStatCard title="Total de Saídas" value={totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={<TrendingDownIcon className="w-6 h-6"/>} colorClass="text-red-400" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-800 p-6 rounded-lg">
                    <div className="flex border-b border-slate-700">
                        <button onClick={() => { setFormType('expense'); resetForm(); }} className={`py-2 px-4 text-sm font-medium ${formType === 'expense' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400'}`}>Nova Saída</button>
                        <button onClick={() => { setFormType('income'); resetForm(); }} className={`py-2 px-4 text-sm font-medium ${formType === 'income' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400'}`}>Nova Entrada</button>
                        <button onClick={() => { setFormType('schedule'); resetForm(); }} className={`py-2 px-4 text-sm font-medium ${formType === 'schedule' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400'}`}>Agendar Gasto</button>
                    </div>
                    {renderForm()}
                </div>
                
                 <div className="bg-slate-800 p-6 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">Histórico de Transações</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {sortedTransactions.length > 0 ? sortedTransactions.map(t => (
                            <div key={t.id} className="bg-slate-700 p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{t.description}</p>
                                    <p className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString('pt-BR')} - {t.category}</p>
                                </div>
                                <p className={`font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                    {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                            </div>
                        )) : <p className="text-sm text-slate-500 text-center py-4">Nenhuma transação registrada.</p>}
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                <div className="bg-slate-800 p-6 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">Próximos Vencimentos</h3>
                    <div className="space-y-2">
                        {scheduledExpenses.length > 0 ? scheduledExpenses.map(t => (
                            <div key={t.id} className="bg-slate-700 p-2 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-sm">{t.description}</p>
                                    <p className="text-xs text-slate-400">{new Date(t.dueDate!).toLocaleDateString('pt-BR')} - {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                                <a href={generateGoogleCalendarLink(t)} target="_blank" rel="noopener noreferrer" title="Adicionar ao Google Agenda" className="p-2 hover:bg-slate-600 rounded-md">
                                    <CalendarPlusIcon className="w-5 h-5" />
                                </a>
                            </div>
                        )) : <p className="text-sm text-slate-500 text-center">Nenhum gasto agendado.</p>}
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg">
                    <h3 className="font-semibold flex items-center mb-4"><UploadIcon className="w-5 h-5 mr-2" /> Importar Planilha</h3>
                    <p className="text-sm text-slate-400 mb-4">Faça upload de uma planilha (.xlsx, .csv) para que a IA adicione as transações.</p>
                    <input type="file" id="file-upload-finance" className="hidden" onChange={handleFileChange} accept=".xlsx,.csv" />
                    <label htmlFor="file-upload-finance" className="w-full cursor-pointer flex justify-center items-center gap-2 bg-slate-700 hover:bg-slate-600 font-bold py-2 px-4 rounded-md">
                        <UploadIcon className="w-5 h-5" />
                        <span className="truncate max-w-xs">{selectedFile ? selectedFile.name : 'Escolher Arquivo'}</span>
                    </label>
                    {selectedFile && (
                        <button onClick={handleProcessFile} disabled={isProcessing} className="mt-4 w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 font-bold py-2 px-4 rounded-md disabled:bg-slate-600">
                            {isProcessing ? (
                                <>
                                 <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Processando...
                                </>
                            ) : (
                                <> <SparklesIcon className="w-5 h-5" /> Analisar com IA </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default FinanceView;