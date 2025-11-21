
import React, { useState, useMemo } from 'react';
import { Citation } from '../types';
import { TrashIcon } from './Icons';
import Notification from './Notification';

interface CitationsViewProps {
    citations: Citation[];
    onAddCitation: (citation: Omit<Citation, 'id'>) => void;
    onDeleteCitation: (id: number) => void;
}

const CitationsView: React.FC<CitationsViewProps> = ({ citations, onAddCitation, onDeleteCitation }) => {
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCitations, setSelectedCitations] = useState<Set<number>>(new Set());
    const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'error' as 'error' | 'success' });


    // Form state
    const [quote, setQuote] = useState('');
    const [book, setBook] = useState('');
    const [author, setAuthor] = useState('');
    const [theme, setTheme] = useState('');
    const [page, setPage] = useState('');
    const [tags, setTags] = useState('Importante');

    const handleAddCitation = (e: React.FormEvent) => {
        e.preventDefault();
        if (!quote.trim() || !book.trim() || !author.trim() || !theme.trim()) {
            setNotification({ isOpen: true, title: 'Campos Obrigatórios', message: "Por favor, preencha todos os campos obrigatórios.", type: 'error' });
            return;
        }

        onAddCitation({
            quote,
            book,
            author,
            theme,
            page: page || 'N/A',
            tags,
        });

        // Reset form
        setQuote('');
        setBook('');
        setAuthor('');
        setTheme('');
        setPage('');
        setTags('Importante');
    };

    const handleDeleteCitation = (id: number) => {
        onDeleteCitation(id);
        setSelectedCitations(prev => {
            const newSelection = new Set(prev);
            newSelection.delete(id);
            return newSelection;
        });
    };
    
    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !(window as any).XLSX) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = (window as any).XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = (window as any).XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    setNotification({ isOpen: true, title: 'Arquivo Vazio', message: "O arquivo parece estar vazio.", type: 'error' });
                    return;
                }
                
                 const importedCitationsData = jsonData.map((row: any) => ({
                    book: row['Livro'] || row['book'] || 'N/A',
                    author: row['Autor'] || row['author'] || 'N/A',
                    page: String(row['Página'] || row['Pagina'] || row['page'] || 'N/A'),
                    theme: row['Tema'] || row['theme'] || 'N/A',
                    quote: row['Citação Significativa'] || row['Citação'] || row['quote'] || '',
                    tags: row['Tag'] || row['tags'] || 'Importante'
                })).filter((c: Omit<Citation, 'id'>) => c.quote.trim() !== '');

                if (importedCitationsData.length > 0) {
                    importedCitationsData.forEach(citationData => onAddCitation(citationData));
                    setNotification({ isOpen: true, title: 'Sucesso', message: `${importedCitationsData.length} citações importadas com sucesso!`, type: 'success' });
                } else {
                    setNotification({ isOpen: true, title: 'Nenhuma Citação Válida', message: "Nenhuma citação válida encontrada no arquivo. Verifique os nomes das colunas (ex: Livro, Autor, Citação, etc).", type: 'error' });
                }
            } catch (error) {
                console.error("Error importing Excel file:", error);
                setNotification({ isOpen: true, title: 'Erro de Importação', message: "Ocorreu um erro ao importar o arquivo.", type: 'error' });
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = ''; // Reset file input
    };

    const handleExportPDF = () => {
        const citationsToExport = selectedCitations.size > 0
            ? citations.filter(c => selectedCitations.has(c.id))
            : filteredCitations;
            
        if (citationsToExport.length === 0) {
            setNotification({ isOpen: true, title: 'Sem Dados', message: "Não há citações selecionadas ou filtradas para exportar.", type: 'error' });
            return;
        }
        if (!(window as any).jspdf?.jsPDF) {
            setNotification({ isOpen: true, title: 'Erro', message: "A biblioteca para gerar PDF (jsPDF) não foi carregada. Verifique sua conexão com a internet.", type: 'error' });
            return;
        }
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF();

        if (typeof (doc as any).autoTable !== 'function') {
            setNotification({ isOpen: true, title: 'Erro de Plugin', message: "A função para gerar tabelas no PDF (autoTable) não foi encontrada. O plugin pode não ter sido carregado corretamente.", type: 'error' });
            return;
        }
        
        const tableColumn = ["Livro", "Autor", "Página", "Tema", "Citação", "Tag"];
        const tableRows = citationsToExport.map(c => [c.book, c.author, c.page, c.theme, c.quote, c.tags]);

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            styles: { font: "helvetica", fontSize: 8 },
            headStyles: { fillColor: [79, 70, 229] }, // indigo-600
        });
        doc.text("Relatório de Citações", 14, 15);
        doc.save("citacoes.pdf");
    };

    const handleExportExcel = () => {
         const citationsToExport = selectedCitations.size > 0
            ? citations.filter(c => selectedCitations.has(c.id))
            : filteredCitations;

        if (citationsToExport.length === 0) {
            setNotification({ isOpen: true, title: 'Sem Dados', message: "Não há citações selecionadas ou filtradas para exportar.", type: 'error' });
            return;
        }
        if (!(window as any).XLSX) {
            setNotification({ isOpen: true, title: 'Erro', message: "A biblioteca para gerar Excel (XLSX) não foi carregada. Verifique sua conexão com a internet.", type: 'error' });
            return;
        }
        const dataForSheet = citationsToExport.map(c => ({
            'Livro': c.book,
            'Autor': c.author,
            'Página': c.page,
            'Tema': c.theme,
            'Citação Significativa': c.quote,
            'Tag': c.tags
        }));
        const worksheet = (window as any).XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = (window as any).XLSX.utils.book_new();
        (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, "Citações");
        (window as any).XLSX.writeFile(workbook, "citacoes.xlsx");
    };
    
    const filteredCitations = useMemo(() => {
        if (!searchTerm.trim()) {
            return citations;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return citations.filter(c =>
            c.book.toLowerCase().includes(lowercasedFilter) ||
            c.author.toLowerCase().includes(lowercasedFilter) ||
            c.theme.toLowerCase().includes(lowercasedFilter) ||
            c.quote.toLowerCase().includes(lowercasedFilter) ||
            c.tags.toLowerCase().includes(lowercasedFilter)
        );
    }, [citations, searchTerm]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchTerm(searchInput);
    };

    const handleSelectCitation = (id: number) => {
        setSelectedCitations(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(id)) {
                newSelection.delete(id);
            } else {
                newSelection.add(id);
            }
            return newSelection;
        });
    };

    const handleSelectAll = () => {
        const allFilteredIds = filteredCitations.map(c => c.id);
        const areAllFilteredSelected = filteredCitations.length > 0 && filteredCitations.every(c => selectedCitations.has(c.id));
    
        setSelectedCitations(prevSelection => {
            const newSelection = new Set(prevSelection);
            if (areAllFilteredSelected) {
                // Deselect all visible
                allFilteredIds.forEach(id => newSelection.delete(id));
            } else {
                // Select all visible
                allFilteredIds.forEach(id => newSelection.add(id));
            }
            return newSelection;
        });
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
            <div className="p-4 sm:p-6 lg:p-8 text-white">
                <header className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">Laboratório dos Livros</h1>
                    <p className="text-md text-slate-400 mt-2">Um lugar para organizar e pesquisar suas citações.</p>
                </header>

                <main>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-2xl font-semibold mb-4 border-b border-slate-700 pb-3">Adicionar Nova Citação</h2>
                        <form onSubmit={handleAddCitation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="quote" className="block text-sm font-medium text-slate-300 mb-1">Citação Significativa</label>
                                <textarea id="quote" rows={3} value={quote} onChange={e => setQuote(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Digite a citação aqui..." required></textarea>
                            </div>
                            <div>
                                <label htmlFor="book" className="block text-sm font-medium text-slate-300 mb-1">Livro</label>
                                <input type="text" id="book" value={book} onChange={e => setBook(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Nome do livro" required />
                            </div>
                            <div>
                                <label htmlFor="author" className="block text-sm font-medium text-slate-300 mb-1">Autor</label>
                                <input type="text" id="author" value={author} onChange={e => setAuthor(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Nome do autor" required />
                            </div>
                            <div>
                                <label htmlFor="theme" className="block text-sm font-medium text-slate-300 mb-1">Tema</label>
                                <input type="text" id="theme" value={theme} onChange={e => setTheme(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Ex: Filosofia, Romance" required />
                            </div>
                            <div>
                                <label htmlFor="page" className="block text-sm font-medium text-slate-300 mb-1">Página</label>
                                <input type="text" id="page" value={page} onChange={e => setPage(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Ex: 42, 10-12" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="tags" className="block text-sm font-medium text-slate-300 mb-1">Tag</label>
                                <select id="tags" value={tags} onChange={e => setTags(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required>
                                    <option value="Importante">Importante</option>
                                    <option value="Dados">Dados</option>
                                    <option value="Destaque">Destaque</option>
                                    <option value="Devo fazer">Devo fazer</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 text-right">
                                <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                                    Salvar Citação
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-lg shadow-md">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-slate-700 pb-4 gap-4">
                            <h2 className="text-2xl font-semibold whitespace-nowrap">Minhas Citações</h2>
                            <div className="flex flex-wrap gap-2 justify-start sm:justify-end w-full">
                                {selectedCitations.size > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-700 px-3 py-1 rounded-md">
                                        <span>{selectedCitations.size} selecionada(s)</span>
                                        <button onClick={() => setSelectedCitations(new Set())} className="text-indigo-400 hover:underline">Limpar</button>
                                    </div>
                                )}
                                <label htmlFor="upload-excel" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out flex items-center shadow-sm cursor-pointer">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                    Importar
                                </label>
                                <input type="file" id="upload-excel" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleImportExcel} />
                                <button onClick={handleExportPDF} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition duration-150 ease-in-out flex items-center shadow-sm">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Exportar PDF
                                </button>
                                <button onClick={handleExportExcel} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition duration-150 ease-in-out flex items-center shadow-sm">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Exportar Excel
                                </button>
                            </div>
                        </div>
                         <form onSubmit={handleSearch} className="mb-4 flex flex-col sm:flex-row gap-2">
                            <label htmlFor="search" className="sr-only">Pesquisar Citações</label>
                            <input
                                type="text"
                                id="search"
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Busque por palavra-chave ou tema..."
                            />
                            <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out flex items-center justify-center shadow-sm">
                                <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                Pesquisar
                            </button>
                        </form>
                        <div className="max-h-[60vh] overflow-auto border border-slate-700 rounded-lg">
                            <table className="min-w-full divide-y divide-slate-700">
                                <thead className="bg-slate-800 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 bg-slate-700 border-slate-600 rounded text-indigo-500 focus:ring-indigo-600"
                                                checked={filteredCitations.length > 0 && filteredCitations.every(c => selectedCitations.has(c.id))}
                                                onChange={handleSelectAll}
                                                aria-label="Selecionar todas as citações visíveis"
                                            />
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Livro</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Autor</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Página</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tema</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-2/5">Citação</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tag</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800 divide-y divide-slate-700">
                                    {filteredCitations.length > 0 ? filteredCitations.map(citation => (
                                        <tr key={citation.id} className={`hover:bg-slate-700/50 transition-colors ${selectedCitations.has(citation.id) ? 'bg-slate-700' : ''}`}>
                                            <td className="px-4 py-4">
                                                 <input
                                                    type="checkbox"
                                                    className="form-checkbox h-4 w-4 bg-slate-700 border-slate-600 rounded text-indigo-500 focus:ring-indigo-600"
                                                    checked={selectedCitations.has(citation.id)}
                                                    onChange={() => handleSelectCitation(citation.id)}
                                                    aria-labelledby={`citation-quote-${citation.id}`}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{citation.book}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{citation.author}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{citation.page}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{citation.theme}</td>
                                            <td id={`citation-quote-${citation.id}`} className="px-6 py-4 whitespace-normal text-sm text-slate-200 w-2/5 break-words">{citation.quote}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-500/20 text-indigo-300">{citation.tags}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleDeleteCitation(citation.id)} className="text-slate-500 hover:text-red-500 transition-colors p-1" aria-label="Excluir citação">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={8} className="text-center py-10 text-slate-500">Nenhuma citação encontrada.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default CitationsView;
