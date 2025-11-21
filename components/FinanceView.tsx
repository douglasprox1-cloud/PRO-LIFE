
import React, { useState, useMemo } from 'react';
import { TrendingUpIcon, TrendingDownIcon, PieChartIcon, UploadIcon, SparklesIcon, DownloadIcon, TrashIcon, CreditCardIcon, CalendarPlusIcon, ClockIcon, ClipboardListIcon } from './Icons';
import { IncomeCategory, ExpenseCategory, Transaction, PurchasePlanItem, TransportType, ForecastedExpense, ShoppingListItem } from '../types';
import { processTransactionsFromText, getShoppingItemPrice } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Notification from './Notification';

const incomeCategories: IncomeCategory[] = ['Hospital', '24 de Março', 'Eventos', 'Grau', 'Outros', 'Palestras', 'Vendas'];
const expenseCategories: ExpenseCategory[] = ['Moradia', 'Transporte', 'Dívidas', 'Lazer', 'Presentes', 'Alimentação', 'Reserva', 'Imprevisto', 'Estudo', 'Autocuidado', 'Farmácia', 'Cartão de Crédito', 'Comunicação', 'Cantina', 'Investir em negócio'];
const transportTypes: { value: TransportType; label: string }[] = [
    { value: 'onibus', label: 'Ônibus' },
    { value: 'metro', label: 'Metrô/Trem' },
    { value: 'uber', label: 'Uber / 99' },
    { value: 'moto-combustivel', label: 'Moto - Combustível' },
    { value: 'moto-manutencao', label: 'Moto - Manutenção' },
    { value: 'taxi', label: 'Táxi' },
    { value: 'outros', label: 'Outros' },
];

const COMMON_SHOPPING_ITEMS = [
  'Arroz', 'Feijão', 'Macarrão', 'Óleo', 'Sal', 'Açúcar', 'Café', 'Farinha', 'Leite', 'Ovos', 'Pão', 'Manteiga',
  'Frango', 'Carne', 'Cebola', 'Alho', 'Tomate', 'Batata', 'Cenoura', 'Alface', 'Banana', 'Maçã',
  'Sabonete', 'Shampoo', 'Papel Higiênico', 'Detergente', 'Lava-roupas', 'Amaciante'
];

const EXPENSE_CATEGORY_COLORS: { [key in ExpenseCategory]: string } = {
    'Moradia': '#1f77b4', 'Transporte': '#ff7f0e', 'Dívidas': '#d62728',
    'Lazer': '#9467bd', 'Presentes': '#8c564b', 'Alimentação': '#2ca02c',
    'Reserva': '#e377c2', 'Imprevisto': '#7f7f7f', 'Estudo': '#bcbd22',
    'Autocuidado': '#17becf', 'Farmácia': '#ff9896', 'Cartão de Crédito': '#9edae5',
    'Comunicação': '#dbdb8d', 'Cantina': '#c49c94', 'Investir em negócio': '#a16207',
};

interface FinanceViewProps {
    transactions: Transaction[];
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    onUpdateTransaction: (transaction: Transaction) => void;
    onDeleteTransaction: (transactionId: string) => void;
    onBatchUpdateTransactions: (transactions: Transaction[]) => void;
    purchasePlans: PurchasePlanItem[];
    onAddPurchasePlan: (plan: Omit<PurchasePlanItem, 'id' | 'savedAmount'>) => void;
    onAddFundsToPurchasePlan: (planId: string, amount: number) => void;
    onDeletePurchasePlan: (planId: string) => void;
    onExecutePurchase: (planId: string) => void;
    forecastedExpenses: ForecastedExpense[];
    onAddForecastedExpense: (forecast: Omit<ForecastedExpense, 'id'>) => void;
    onDeleteForecastedExpense: (forecastId: string) => void;
    onConvertForecast: (forecastId: string, action: 'launch' | 'schedule') => void;
    shoppingList: ShoppingListItem[];
    onAddShoppingListItem: (item: Omit<ShoppingListItem, 'id' | 'foundValue' | 'foundLink'>) => void;
    onDeleteShoppingListItem: (itemId: string) => void;
    onUpdateShoppingListItem: (itemId: string, data: Partial<Omit<ShoppingListItem, 'id'>>) => void;
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


const FinanceView: React.FC<FinanceViewProps> = (props) => {
  const { 
      transactions, onAddTransaction, onUpdateTransaction, onDeleteTransaction, onBatchUpdateTransactions, purchasePlans, onAddPurchasePlan, onAddFundsToPurchasePlan, onDeletePurchasePlan, onExecutePurchase,
      forecastedExpenses, onAddForecastedExpense, onDeleteForecastedExpense, onConvertForecast,
      shoppingList, onAddShoppingListItem, onDeleteShoppingListItem, onUpdateShoppingListItem
  } = props;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formType, setFormType] = useState<'expense' | 'income' | 'schedule'>('expense');
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'error' as 'error' | 'success' });
  
  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory | IncomeCategory | ''>('');
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [paymentType, setPaymentType] = useState<'A Vista' | 'Parcelado'>('A Vista');
  const [installments, setInstallments] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repetition, setRepetition] = useState<'Não repetir' | 'Semanal' | 'Mensal' | 'Anual'>('Não repetir');
  const [repetitionEndDate, setRepetitionEndDate] = useState('');
  const [scheduledType, setScheduledType] = useState<'expense' | 'income'>('expense');
  const [paymentMethod, setPaymentMethod] = useState<'default' | 'ticketRestaurante' | 'ticketAlimentacao'>('default');
  
  // Transport-specific form state
  const [transportType, setTransportType] = useState<TransportType | ''>('');
  const [km, setKm] = useState('');
  const [maintenancePayment, setMaintenancePayment] = useState<'A Vista' | 'Parcelado'>('A Vista');

  // Purchase Plan Form State
  const [planItemName, setPlanItemName] = useState('');
  const [planTargetAmount, setPlanTargetAmount] = useState('');
  const [planTargetDate, setPlanTargetDate] = useState('');
  const [fundsToAdd, setFundsToAdd] = useState<{ [planId: string]: string }>({});
  
  // Forecast Form State
  const [forecastDesc, setForecastDesc] = useState('');
  const [forecastAmount, setForecastAmount] = useState('');
  const [forecastCategory, setForecastCategory] = useState<ExpenseCategory | ''>('');
  
  // Shopping List Form State
  const [shoppingItemName, setShoppingItemName] = useState('');
  const [shoppingItemValue, setShoppingItemValue] = useState('');
  const [searchingPriceId, setSearchingPriceId] = useState<string | null>(null);

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
        const transactionDate = new Date(t.date + 'T00:00:00'); // Ensure local timezone
        return transactionDate.getFullYear() === currentDate.getFullYear() &&
               transactionDate.getMonth() === currentDate.getMonth();
    });
  }, [transactions, currentDate]);

  const { totalIncome, totalExpenses, balance, creditCardBillTotal } = useMemo(() => {
    const income = monthlyTransactions
        .filter(t => t.type === 'income' && !(t.dueDate && !t.isPaid))
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const directExpenses = monthlyTransactions
        .filter(t => t.type === 'expense' && !t.isCreditCard && !(t.dueDate && !t.isPaid))
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const creditCardPayments = monthlyTransactions
        .filter(t => t.type === 'expense' && t.category === 'Cartão de Crédito' && !(t.dueDate && !t.isPaid))
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    
    const finalExpenses = directExpenses + creditCardPayments;
    
    const creditCardBillTotal = monthlyTransactions
        .filter(t => t.isCreditCard && t.category !== 'Cartão de Crédito')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    
    return {
        totalIncome: income,
        totalExpenses: finalExpenses,
        balance: income - finalExpenses,
        creditCardBillTotal,
    };
  }, [monthlyTransactions]);

  const expenseByCategory = useMemo(() => {
    const expensesToCategorize = monthlyTransactions.filter(t => 
        t.type === 'expense' && 
        !(t.dueDate && !t.isPaid) &&
        (!t.isCreditCard || t.category === 'Cartão de Crédito')
    );
    
    const categoryMap = expensesToCategorize.reduce((acc: Record<string, number>, transaction: Transaction) => {
        const category = transaction.category;
        // FIX: Ensure transaction.amount is treated as a number to prevent type errors during arithmetic operations, especially with inconsistent data from localStorage.
        const currentVal = acc[category] || 0;
        const amountVal = Number(transaction.amount || 0);
        acc[category] = currentVal + amountVal;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value: value || 0 }))
        .sort((a,b) => b.value - a.value);
  }, [monthlyTransactions]);
  
    const expensePercentageData = useMemo(() => {
        if (totalIncome <= 0) {
            return [];
        }
        const balance = totalIncome - totalExpenses;
        return [
            { name: 'Gasto', value: totalExpenses },
            { name: 'Restante', value: Math.max(0, balance) }
        ];
    }, [totalIncome, totalExpenses]);

    const PIE_COLORS = ['#f87171', '#4ade80']; // Gasto, Restante

  const sortedMonthlyTransactions = useMemo(() => {
    return [...monthlyTransactions].sort((a, b) => new Date(b.date + 'T00:00:00').getTime() - new Date(a.date + 'T00:00:00').getTime());
  }, [monthlyTransactions]);

  const totalForecasted = useMemo(() => {
    return forecastedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [forecastedExpenses]);

  // Group Credit Card Transactions by Due Date for the Invoice View
  const creditCardBills = useMemo(() => {
    const bills: Record<string, Transaction[]> = {};
    
    // Filter for expenses that are marked as Credit Card and have a Due Date (Scheduled)
    const ccTransactions = transactions.filter(t => t.type === 'expense' && t.isCreditCard && t.dueDate);

    ccTransactions.forEach(t => {
        if (t.dueDate) {
            const dateKey = t.dueDate;
            if (!bills[dateKey]) {
                bills[dateKey] = [];
            }
            bills[dateKey].push(t);
        }
    });

    // Sort bills by date
    return Object.entries(bills).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
  }, [transactions]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setDate(1); // Avoids issues with different month lengths
        newDate.setMonth(newDate.getMonth() + offset);
        return newDate;
    });
  };

  const handleExportMonthlyPdf = () => {
    if (!(window as any).jspdf?.jsPDF) {
        setNotification({ isOpen: true, title: 'Erro', message: "A biblioteca para gerar PDF (jsPDF) não foi carregada.", type: 'error' });
        return;
    }
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    
    if (typeof (doc as any).autoTable !== 'function') {
        setNotification({ isOpen: true, title: 'Erro de Plugin', message: "A função para gerar tabelas no PDF (autoTable) não foi encontrada. O plugin pode não ter sido carregado corretamente.", type: 'error' });
        return;
    }

    const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    doc.setFontSize(18);
    doc.text(`Relatório Financeiro - ${monthName}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Entradas: ${totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, 32);
    doc.text(`Saídas: ${totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, 38);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Saldo do Mês: ${balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, 46);

    const tableColumn = ["Data", "Descrição", "Categoria", "Tipo", "Valor"];
    const tableRows = sortedMonthlyTransactions.map(t => [
        new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR'),
        t.description,
        t.category,
        t.type === 'income' ? 'Entrada' : 'Saída',
        (t.type === 'income' ? '+ ' : '- ') + t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    ]);

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        headStyles: { fillColor: [79, 70, 229] }, // indigo-600
    });
    
    doc.save(`relatorio-financeiro-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2,'0')}.pdf`);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
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

  const handleProcessFile = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    try {
        const csvText = await fileToCsvText(selectedFile);
        const extractedTransactions = await processTransactionsFromText(csvText);
        
        extractedTransactions.forEach(t => {
            if (t.description && t.amount && t.date && t.type && t.category) {
                 onAddTransaction(t as Omit<Transaction, 'id'>);
            }
        });
        setNotification({ isOpen: true, title: 'Sucesso', message: `${extractedTransactions.length} transações importadas com sucesso!`, type: 'success' });
    } catch (error) {
         const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
         setNotification({ isOpen: true, title: 'Erro de Importação', message, type: 'error' });
    } finally {
         setIsProcessing(false);
         setSelectedFile(null);
         const fileInput = document.getElementById('file-upload-finance') as HTMLInputElement;
         if (fileInput) fileInput.value = '';
    }
  };

  const resetForm = () => {
      setDescription(''); setAmount(''); setCategory(''); setIsCreditCard(false);
      setDueDate(''); setDate(new Date().toISOString().split('T')[0]);
      setRepetition('Não repetir'); setRepetitionEndDate('');
      setScheduledType('expense'); setPaymentMethod('default');
      setPaymentType('A Vista'); setInstallments('');
      setTransportType(''); setKm(''); setMaintenancePayment('A Vista');
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const numAmount = parseFloat(amount);
      if (!description || isNaN(numAmount) || numAmount <= 0 || !category) {
          setNotification({ isOpen: true, title: 'Dados Inválidos', message: "Por favor, preencha todos os campos corretamente.", type: 'error' });
          return;
      }
      
      let transactionData: Omit<Transaction, 'id'>;

      if (formType === 'schedule') {
          if (!dueDate) {
              setNotification({ isOpen: true, title: 'Dados Inválidos', message: "Por favor, insira a data de vencimento.", type: 'error' });
              return;
          }
           transactionData = {
              description, amount: numAmount, date: new Date().toISOString().split('T')[0],
              type: scheduledType, category: category as any,
              isCreditCard: scheduledType === 'expense' ? isCreditCard : undefined,
              dueDate,
              repetition: repetition === 'Não repetir' ? undefined : repetition,
              repetitionEndDate: repetition !== 'Não repetir' ? repetitionEndDate : undefined,
              isPaid: false,
          };
      } else {
           transactionData = {
              description, amount: numAmount, date, type: formType,
              category: category as any,
              paymentMethod: paymentMethod === 'default' ? undefined : paymentMethod,
              isCreditCard: formType === 'expense' ? isCreditCard : undefined,
              paymentType: isCreditCard ? paymentType : undefined,
              installments: isCreditCard && paymentType === 'Parcelado' ? parseInt(installments, 10) : undefined,
          };
           if (formType === 'expense' && category === 'Transporte') {
                transactionData.transportType = transportType || undefined;
                const numKm = parseFloat(km);
                transactionData.km = !isNaN(numKm) ? numKm : undefined;
                if (transportType === 'moto-manutencao') {
                    transactionData.maintenancePayment = maintenancePayment;
                }
            }
      }
      
      onAddTransaction(transactionData);
      resetForm();
  };
  
  const handleNewPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseFloat(planTargetAmount);
    if (!planItemName.trim() || isNaN(targetAmount) || targetAmount <= 0 || !planTargetDate) {
        setNotification({ isOpen: true, title: 'Dados Inválidos', message: "Preencha todos os campos do plano.", type: 'error' });
        return;
    }
    onAddPurchasePlan({ itemName: planItemName, targetAmount, targetDate: planTargetDate });
    setPlanItemName('');
    setPlanTargetAmount('');
    setPlanTargetDate('');
  };

  const handleAddFunds = (planId: string, amountStr: string) => {
    const amount = parseFloat(amountStr);
    if (!isNaN(amount) && amount > 0) {
        onAddFundsToPurchasePlan(planId, amount);
        setFundsToAdd(prev => ({ ...prev, [planId]: '' }));
    } else {
        setNotification({ isOpen: true, title: 'Valor Inválido', message: "Por favor, insira um valor válido para adicionar à reserva.", type: 'error' });
    }
  };

  const handleAddForecast = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(forecastAmount);
    if (!forecastDesc.trim() || isNaN(numAmount) || numAmount <= 0 || !forecastCategory) {
        setNotification({ isOpen: true, title: 'Dados Inválidos', message: "Preencha todos os campos da previsão.", type: 'error' });
        return;
    }
    onAddForecastedExpense({ description: forecastDesc, amount: numAmount, category: forecastCategory });
    setForecastDesc(''); setForecastAmount(''); setForecastCategory('');
  };

  const handleAddShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(shoppingItemValue);
    if (!shoppingItemName.trim() || isNaN(numValue) || numValue <= 0) {
        setNotification({ isOpen: true, title: 'Dados Inválidos', message: "Preencha o nome e o valor estimado do item.", type: 'error' });
        return;
    }
    onAddShoppingListItem({ name: shoppingItemName, estimatedValue: numValue });
    setShoppingItemName(''); setShoppingItemValue('');
  };

  const handleSearchPrice = async (itemId: string, itemName: string) => {
    setSearchingPriceId(itemId);
    try {
        const result = await getShoppingItemPrice(itemName);
        onUpdateShoppingListItem(itemId, { foundValue: result.price ?? undefined, foundLink: result.link ?? undefined });
        setNotification({ isOpen: true, title: 'Pesquisa Concluída', message: `Pesquisa de preço para "${itemName}" finalizada.`, type: 'success' });
    } catch (error) {
        setNotification({ isOpen: true, title: 'Erro na Pesquisa', message: 'Não foi possível buscar o preço do item.', type: 'error' });
    } finally {
        setSearchingPriceId(null);
    }
  };
  
  const handlePayBill = (items: Transaction[]) => {
      if (window.confirm("Deseja pagar todos os itens desta fatura?")) {
        const updates = items
            .filter(t => !t.isPaid)
            .map(t => ({ ...t, isPaid: true }));
        
        if (updates.length > 0) {
            onBatchUpdateTransactions(updates);
            setNotification({ isOpen: true, title: 'Fatura Paga', message: `${updates.length} itens marcados como pagos.`, type: 'success' });
        }
      }
  }

  const handleDownloadShoppingListPdf = () => {
    if (shoppingList.length === 0) {
        setNotification({isOpen: true, title: 'Lista Vazia', message: 'Adicione itens à lista antes de exportar.', type: 'error'});
        return;
    }
    if (!(window as any).jspdf?.jsPDF || typeof (window as any).jspdf.jsPDF.autoTable !== 'function') {
        setNotification({ isOpen: true, title: 'Erro', message: "A biblioteca para gerar PDF (jsPDF com autoTable) não foi carregada.", type: 'error' });
        return;
    }
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    doc.text("Lista de Compras", 14, 15);
    const tableColumn = ["", "Item", "Valor Estimado", "Valor Encontrado"];
    const tableRows = shoppingList.map(item => [
        '', // Placeholder for checkbox
        item.name,
        formatCurrency(item.estimatedValue),
        item.foundValue ? formatCurrency(item.foundValue) : 'N/A'
    ]);

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        headStyles: { fillColor: [79, 70, 229] },
        columnStyles: { 0: { cellWidth: 8 } },
        didDrawCell: (data: any) => {
          if (data.section === 'body' && data.column.index === 0) {
            const squareSize = 4;
            const x = data.cell.x + (data.cell.width / 2) - (squareSize / 2);
            const y = data.cell.y + (data.cell.height / 2) - (squareSize / 2);
            doc.setDrawColor(150, 150, 150);
            doc.rect(x, y, squareSize, squareSize, 'S');
          }
        },
    });
    doc.save("lista-de-compras.pdf");
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
      if (percent === 0) return null;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-sm">
              {`${(percent * 100).toFixed(0)}%`}
          </text>
      );
  };

  return (
    <>
    <Notification 
      isOpen={notification.isOpen}
      onClose={() => setNotification({ ...notification, isOpen: false })}
      title={notification.title}
      message={notification.message}
      type={notification.type}
    />
    <div className="p-4 space-y-6">
        <div className="bg-slate-800 p-6 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors">&lt;</button>
                    <h2 className="text-2xl font-bold capitalize text-center w-48">
                        {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={() => changeMonth(1)} className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors">&gt;</button>
                </div>
                <button onClick={handleExportMonthlyPdf} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors w-full sm:w-auto">
                    <DownloadIcon className="w-5 h-5" />
                    Baixar Relatório PDF
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <FinanceStatCard title="Entradas" value={totalIncome.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} icon={<TrendingUpIcon className="w-6 h-6"/>} colorClass="text-green-400"/>
                <FinanceStatCard title="Saídas" value={totalExpenses.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} icon={<TrendingDownIcon className="w-6 h-6"/>} colorClass="text-red-400"/>
                <FinanceStatCard title="Fatura do Cartão" value={creditCardBillTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} icon={<CreditCardIcon className="w-6 h-6"/>} colorClass="text-cyan-400"/>
                <FinanceStatCard title="Saldo do Mês" value={balance.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} icon={<PieChartIcon className="w-6 h-6"/>} colorClass={balance >= 0 ? "text-green-400" : "text-red-400"}/>
            </div>
        </div>

        {/* Credit Card Invoices Section */}
        {creditCardBills.length > 0 && (
             <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CreditCardIcon className="w-6 h-6 text-cyan-400" />
                    Faturas de Cartão de Crédito (Agendadas)
                </h3>
                <div className="grid grid-cols-1 gap-6">
                    {creditCardBills.map(([dueDate, items]) => {
                         const totalBill = items.reduce((acc, curr) => acc + curr.amount, 0);
                         const paidAmount = items.filter(i => i.isPaid).reduce((acc, curr) => acc + curr.amount, 0);
                         const isFullyPaid = items.every(i => i.isPaid);
                         const percentPaid = totalBill > 0 ? (paidAmount / totalBill) * 100 : 0;
                         
                         return (
                             <div key={dueDate} className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
                                 <div className="p-4 bg-slate-700/30 border-b border-slate-700 flex flex-wrap justify-between items-center gap-4">
                                     <div>
                                         <p className="text-slate-400 text-xs uppercase font-bold">Vencimento</p>
                                         <p className="text-lg font-bold text-white">{new Date(dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                     </div>
                                     <div className="flex-grow max-w-xs hidden sm:block">
                                         <div className="flex justify-between text-xs mb-1">
                                             <span className="text-slate-400">Pago: {formatCurrency(paidAmount)}</span>
                                             <span className="text-white font-bold">Total: {formatCurrency(totalBill)}</span>
                                         </div>
                                         <div className="w-full bg-slate-700 rounded-full h-2">
                                            <div className={`h-2 rounded-full ${isFullyPaid ? 'bg-green-500' : 'bg-cyan-500'}`} style={{ width: `${percentPaid}%` }}></div>
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-3">
                                         <div className="text-right sm:hidden">
                                             <p className="text-sm font-bold">{formatCurrency(totalBill)}</p>
                                             <p className="text-xs text-slate-400">{isFullyPaid ? 'Pago' : 'Aberto'}</p>
                                         </div>
                                         {isFullyPaid ? (
                                             <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-full">Fatura Paga</span>
                                         ) : (
                                            <button 
                                                onClick={() => handlePayBill(items)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
                                            >
                                                Pagar Fatura
                                            </button>
                                         )}
                                     </div>
                                 </div>
                                 <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                                     {items.map(item => (
                                         <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded-md transition-colors">
                                             <div className="flex items-center gap-3 overflow-hidden">
                                                 <input 
                                                    type="checkbox" 
                                                    checked={!!item.isPaid} 
                                                    onChange={() => onUpdateTransaction({...item, isPaid: !item.isPaid})}
                                                    className="form-checkbox h-4 w-4 bg-slate-700 border-slate-600 rounded text-cyan-500 focus:ring-cyan-600 flex-shrink-0"
                                                 />
                                                 <div className="truncate">
                                                     <p className={`text-sm ${item.isPaid ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{item.description}</p>
                                                     <p className="text-xs text-slate-500">{item.category}</p>
                                                 </div>
                                             </div>
                                             <span className={`text-sm font-bold whitespace-nowrap ${item.isPaid ? 'text-slate-500' : 'text-white'}`}>
                                                 {formatCurrency(item.amount)}
                                             </span>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )
                    })}
                </div>
             </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-slate-800 p-6 rounded-lg min-h-[400px]">
                        <h3 className="text-xl font-bold mb-4">Despesas por Categoria</h3>
                        {expenseByCategory.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + (radius + 20) * Math.cos(-midAngle * (Math.PI / 180));
                                        const y = cy + (radius + 20) * Math.sin(-midAngle * (Math.PI / 180));
                                        return (percent * 100) > 5 ? (<text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>{`${(percent * 100).toFixed(0)}%`}</text>) : null;
                                    }}>
                                        {expenseByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={EXPENSE_CATEGORY_COLORS[entry.name as ExpenseCategory]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Valor']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">Nenhuma despesa registrada este mês.</div>
                        )}
                    </div>
                    <div className="bg-slate-800 p-6 rounded-lg min-h-[400px]">
                        <h3 className="text-xl font-bold mb-4">Balanço do Mês</h3>
                        {totalIncome > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={expensePercentageData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {expensePercentageData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="flex items-center justify-center h-full text-slate-500 text-center p-4">
                                Nenhuma entrada registrada este mês para exibir o balanço percentual.
                            </div>
                        )}
                    </div>
                 </div>
                <div className="bg-slate-800 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Transações do Mês</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {sortedMonthlyTransactions.map(t => {
                            const isScheduled = !!t.dueDate;
                            const isPaid = !!t.isPaid;

                            return (
                                <div key={t.id} className={`flex justify-between items-center bg-slate-700/50 p-3 rounded-md transition-opacity group ${isScheduled && !isPaid ? 'opacity-60' : ''}`}>
                                    <div className="flex items-center flex-grow mr-2 overflow-hidden">
                                        {isScheduled && (
                                            <div className="mr-3 flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={isPaid}
                                                    onChange={() => onUpdateTransaction({ ...t, isPaid: !isPaid })}
                                                    className="form-checkbox h-5 w-5 bg-slate-600 border-slate-500 rounded text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                                                    title={isPaid ? "Marcar como não pago/recebido" : "Marcar como pago/recebido"}
                                                />
                                            </div>
                                        )}
                                        <div className="flex-grow truncate">
                                            <p className={`font-semibold truncate ${isScheduled && !isPaid ? 'line-through' : ''} flex items-center gap-2`}>
                                                {t.isCreditCard && t.category !== 'Cartão de Crédito' && <CreditCardIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" title="Compra no Cartão de Crédito" />}
                                                {t.description}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {isScheduled 
                                                    ? `Vencimento: ${new Date(t.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}`
                                                    : new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')
                                                } &bull; {t.category}
                                                {t.category === 'Transporte' && t.transportType && (
                                                    <span className="text-indigo-400"> &bull; {t.transportType} {t.km ? `(${t.km}km)` : ''}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <p className={`font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                            {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </p>
                                        <button onClick={() => onDeleteTransaction(t.id)} className="text-slate-500 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100" title="Excluir Transação">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                         {sortedMonthlyTransactions.length === 0 && <p className="text-center text-slate-500 py-4">Nenhuma transação este mês.</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Collapsible Form Section */}
                <div className="bg-slate-800 rounded-lg">
                    <button onClick={() => setIsFormVisible(!isFormVisible)} className="w-full p-4 text-left text-lg font-bold flex justify-between items-center hover:bg-slate-700/50 rounded-lg transition-colors">
                        <span>{isFormVisible ? 'Ocultar Formulário' : 'Adicionar Transação ou Importar Arquivo'}</span>
                        <span className={`transform transition-transform ${isFormVisible ? 'rotate-180' : 'rotate-0'}`}>▼</span>
                    </button>
                    <AnimatePresence>
                        {isFormVisible && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                            <div className="p-6 border-t border-slate-700">
                                 {/* Form Tabs */}
                                 <div className="flex border-b border-slate-600 mb-6">
                                    <button onClick={() => { setFormType('expense'); resetForm(); }} className={`py-2 px-4 font-semibold ${formType === 'expense' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400'}`}>Despesa</button>
                                    <button onClick={() => { setFormType('income'); resetForm(); }} className={`py-2 px-4 font-semibold ${formType === 'income' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400'}`}>Receita</button>
                                    <button onClick={() => { setFormType('schedule'); resetForm(); }} className={`py-2 px-4 font-semibold ${formType === 'schedule' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-400'}`}>Agendar</button>
                                </div>
                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                    <input type="text" placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md" required />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="number" placeholder="Valor (R$)" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md" required />
                                        <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full bg-slate-700 p-2 rounded-md" required>
                                            <option value="">Selecione a Categoria</option>
                                            { (formType === 'income' || (formType === 'schedule' && scheduledType === 'income')) 
                                                ? incomeCategories.map(c => <option key={c} value={c}>{c}</option>) 
                                                : expenseCategories
                                                    .filter(c => !(isCreditCard && c === 'Cartão de Crédito'))
                                                    .map(c => <option key={c} value={c}>{c}</option>) 
                                            }
                                        </select>
                                    </div>
                                    {formType === 'expense' && (
                                        <div className="flex items-center gap-4 flex-wrap bg-slate-900/50 p-2 rounded-md">
                                            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                                                <input type="checkbox" checked={isCreditCard} onChange={e => setIsCreditCard(e.target.checked)} className="form-checkbox bg-slate-600 border-slate-500 rounded text-indigo-500 focus:ring-indigo-500" />
                                                Cartão de Crédito
                                            </label>
                                            {isCreditCard && (
                                                <div className="flex items-center gap-3 text-sm text-slate-300 border-l border-slate-600 pl-4">
                                                    <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" value="A Vista" name="paymentType" checked={paymentType === 'A Vista'} onChange={() => setPaymentType('A Vista')} className="form-radio bg-slate-600 border-slate-500 text-indigo-500 focus:ring-indigo-500" /> À Vista</label>
                                                    <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" value="Parcelado" name="paymentType" checked={paymentType === 'Parcelado'} onChange={() => setPaymentType('Parcelado')} className="form-radio bg-slate-600 border-slate-500 text-indigo-500 focus:ring-indigo-500" /> Parcelado</label>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                     {formType === 'expense' && isCreditCard && paymentType === 'Parcelado' && (
                                        <input type="number" placeholder="Nº de Parcelas" value={installments} onChange={e => setInstallments(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md" min="2" />
                                    )}
                                     {formType === 'expense' && category === 'Transporte' && (
                                        <div className="bg-slate-900/50 p-3 rounded-md space-y-3">
                                            <h4 className="text-sm font-semibold text-slate-300">Detalhes do Transporte</h4>
                                            <select value={transportType} onChange={(e) => setTransportType(e.target.value as TransportType)} className="w-full bg-slate-700 p-2 rounded-md">
                                                <option value="">Tipo de Transporte</option>
                                                {transportTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                            {transportType === 'moto-combustivel' && (
                                                <input type="number" value={km} onChange={e => setKm(e.target.value)} placeholder="KM Rodados (Opcional)" className="w-full bg-slate-700 p-2 rounded-md" />
                                            )}
                                            {transportType === 'moto-manutencao' && (
                                                <select value={maintenancePayment} onChange={e => setMaintenancePayment(e.target.value as any)} className="w-full bg-slate-700 p-2 rounded-md">
                                                    <option value="A Vista">Pagamento à Vista</option>
                                                    <option value="Parcelado">Pagamento Parcelado</option>
                                                </select>
                                            )}
                                        </div>
                                    )}
                                    {formType !== 'schedule' ? (
                                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md text-slate-400" />
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-slate-400">Vencimento</label>
                                                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md text-slate-400" title="Data de Vencimento"/>
                                            </div>
                                            <select value={scheduledType} onChange={e => setScheduledType(e.target.value as any)} className="w-full bg-slate-700 p-2 rounded-md self-end">
                                                <option value="expense">É uma Despesa</option>
                                                <option value="income">É uma Receita</option>
                                            </select>
                                            <div>
                                                 <label className="text-xs text-slate-400">Repetição</label>
                                                 <select value={repetition} onChange={e => setRepetition(e.target.value as any)} className="w-full bg-slate-700 p-2 rounded-md" title="Repetição">
                                                    <option value="Não repetir">Não repetir</option>
                                                    <option value="Semanal">Semanal</option>
                                                    <option value="Mensal">Mensal</option>
                                                    <option value="Anual">Anual</option>
                                                </select>
                                            </div>
                                             {repetition !== 'Não repetir' && (
                                                <div>
                                                    <label className="text-xs text-slate-400">Data Final da Repetição (Opcional)</label>
                                                    <input type="date" value={repetitionEndDate} onChange={e => setRepetitionEndDate(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md text-slate-400" title="Data Final da Repetição"/>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors">{formType === 'schedule' ? 'Agendar Transação' : 'Adicionar Transação'}</button>
                                </form>
                                 <div className="mt-8 pt-6 border-t border-slate-600">
                                     <h3 className="text-lg font-bold mb-4">Importar Transações com IA</h3>
                                     <p className="text-sm text-slate-400 mb-4">Envie um arquivo .xlsx ou .csv do seu extrato bancário ou planilha e a IA irá extrair e categorizar as transações para você.</p>
                                     <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <label htmlFor="file-upload-finance" className="flex-shrink-0 cursor-pointer bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors">
                                            Escolher Arquivo
                                        </label>
                                        <input id="file-upload-finance" type="file" accept=".csv, .xlsx" className="hidden" onChange={handleFileChange} />
                                        <span className="text-slate-500 text-sm truncate flex-grow">{selectedFile ? selectedFile.name : 'Nenhum arquivo selecionado'}</span>
                                        <button onClick={handleProcessFile} disabled={!selectedFile || isProcessing} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                            {isProcessing ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    Analisando...
                                                </>
                                            ) : (
                                                <> <SparklesIcon className="w-5 h-5"/> Processar com IA </>
                                            )}
                                        </button>
                                     </div>
                                 </div>
                            </div>
                        </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {/* Purchase Plans Section */}
                <div className="bg-slate-800 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Planos de Compra</h3>
                    <div className="space-y-4">
                        <AnimatePresence>
                        {purchasePlans.map(plan => (
                             <motion.div layout key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold">{plan.itemName}</h4>
                                        <p className="text-xs text-slate-400">Meta: {new Date(plan.targetDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <button onClick={() => onDeletePurchasePlan(plan.id)}><TrashIcon className="w-4 h-4 text-slate-500 hover:text-red-500"/></button>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2.5 my-2">
                                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(plan.savedAmount / plan.targetAmount) * 100}%` }}></div>
                                </div>
                                <p className="text-sm text-slate-300 mb-3 text-right">{formatCurrency(plan.savedAmount)} / {formatCurrency(plan.targetAmount)}</p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input type="number" placeholder="Valor (R$)" value={fundsToAdd[plan.id] || ''} onChange={e => setFundsToAdd(prev => ({ ...prev, [plan.id]: e.target.value }))} className="flex-grow bg-slate-700 p-2 rounded-md" />
                                    <button onClick={() => handleAddFunds(plan.id, fundsToAdd[plan.id] || '0')} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md">Reservar</button>
                                    <button onClick={() => onExecutePurchase(plan.id)} disabled={plan.savedAmount < plan.targetAmount} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed">Comprar</button>
                                </div>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                     <form onSubmit={handleNewPlanSubmit} className="mt-6 pt-4 border-t border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <input value={planItemName} onChange={e => setPlanItemName(e.target.value)} placeholder="Nome do Item" className="md:col-span-2 w-full bg-slate-700 p-2 rounded-md" />
                        <input type="number" value={planTargetAmount} onChange={e => setPlanTargetAmount(e.target.value)} placeholder="Valor Alvo (R$)" className="w-full bg-slate-700 p-2 rounded-md" />
                        <input type="date" value={planTargetDate} onChange={e => setPlanTargetDate(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md text-slate-400" />
                        <button type="submit" className="md:col-span-4 bg-indigo-600/50 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md">Adicionar Plano de Compra</button>
                    </form>
                </div>
                {/* Forecast & Shopping List */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-slate-800 p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2"><ClockIcon className="w-5 h-5 text-slate-400"/> Previsão de Despesas</h3>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Total Previsto</p>
                                <p className="text-2xl font-bold text-red-400">{formatCurrency(totalForecasted)}</p>
                            </div>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            <AnimatePresence>
                            {forecastedExpenses.map(f => (
                                <motion.div layout key={f.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-slate-900/70 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p>{f.description}</p>
                                        <p className="text-xs text-slate-400">{f.category}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-red-400">{formatCurrency(f.amount)}</span>
                                        <button onClick={() => onConvertForecast(f.id, 'schedule')} title="Agendar para o Próximo Mês" className="p-1.5 text-slate-400 hover:text-indigo-400"><CalendarPlusIcon className="w-4 h-4"/></button>
                                        <button onClick={() => onDeleteForecastedExpense(f.id)} title="Excluir" className="p-1.5 text-slate-400 hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                        </div>
                         <form onSubmit={handleAddForecast} className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input value={forecastDesc} onChange={e => setForecastDesc(e.target.value)} placeholder="Descrição" className="md:col-span-3 bg-slate-700 p-2 rounded-md" />
                            <input type="number" value={forecastAmount} onChange={e => setForecastAmount(e.target.value)} placeholder="Valor (R$)" className="bg-slate-700 p-2 rounded-md" />
                            <select value={forecastCategory} onChange={e => setForecastCategory(e.target.value as any)} className="bg-slate-700 p-2 rounded-md" />
                        </form>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2"><ClipboardListIcon className="w-5 h-5 text-slate-400"/> Lista de Compras</h3>
                            <div className="flex-shrink-0">
                                <button onClick={handleDownloadShoppingListPdf} className="p-2 text-slate-400 hover:text-indigo-400" title="Baixar Lista como PDF">
                                    <DownloadIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {shoppingList.map(item => (
                                <motion.div layout key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-slate-900/70 p-3 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p>{item.name}</p>
                                            <p className="text-xs text-slate-400">Estimado: {formatCurrency(item.estimatedValue)}</p>
                                            {item.foundValue && (
                                                <p className="text-xs text-green-400">Encontrado: <a href={item.foundLink || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">{formatCurrency(item.foundValue)}</a></p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => handleSearchPrice(item.id, item.name)} 
                                                disabled={searchingPriceId === item.id}
                                                className="p-1.5 text-slate-400 hover:text-indigo-400 disabled:text-slate-600 disabled:cursor-wait"
                                                title="Pesquisar Preço Online com IA"
                                            >
                                                {searchingPriceId === item.id 
                                                    ? <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    : <SparklesIcon className="w-4 h-4" />
                                                }
                                            </button>
                                            <button onClick={() => onDeleteShoppingListItem(item.id)} title="Excluir" className="p-1.5 text-slate-400 hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                         <form onSubmit={handleAddShoppingItem} className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                             <select value={shoppingItemName} onChange={e => setShoppingItemName(e.target.value)} className="md:col-span-2 bg-slate-700 p-2 rounded-md">
                                 <option value="">Selecione um item ou digite</option>
                                 {COMMON_SHOPPING_ITEMS.map(item => <option key={item} value={item}>{item}</option>)}
                             </select>
                             <input value={shoppingItemName} onChange={e => setShoppingItemName(e.target.value)} placeholder="Ou digite o nome do item" className="md:col-span-2 bg-slate-700 p-2 rounded-md" />
                             <input type="number" value={shoppingItemValue} onChange={e => setShoppingItemValue(e.target.value)} placeholder="Valor Estimado (R$)" className="bg-slate-700 p-2 rounded-md"/>
                             <button type="submit" className="md:col-span-3 bg-indigo-600/50 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md">Adicionar à Lista</button>
                         </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
  );
};

export default FinanceView;
