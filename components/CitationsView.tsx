
import React, { useState, useEffect, useMemo } from 'react';

// Define the Citation type
interface Citation {
    id: number;
    book: string;
    author: string;
    page: string;
    theme: string;
    quote: string;
    tags: string;
}

const CitationsView: React.FC = () => {
    const [citations, setCitations] = useState<Citation[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [quote, setQuote] = useState('');
    const [book, setBook] = useState('');
    const [author, setAuthor] = useState('');
    const [theme, setTheme] = useState('');
    const [page, setPage] = useState('');
    const [tags, setTags] = useState('Importante');

    useEffect(() => {
        try {
            const savedCitations = localStorage.getItem('citations');
            if (savedCitations) {
                setCitations(JSON.parse(savedCitations));
            }
        } catch (error) {
            console.error("Failed to load citations from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('citations', JSON.stringify(citations));
        } catch (error) {
            console.error("Failed to save citations to localStorage", error);
        }
    }, [citations]);

    const handleAddCitation = (e: React.FormEvent) => {
        e.preventDefault();
        if (!quote.trim() || !book.trim() || !author.trim() || !theme.trim()) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const newCitation: Citation = {
            id: Date.now(),
            quote,
            book,
            author,
            theme,
            page: page || 'N/A',
            tags,
        };

        setCitations(prev => [newCitation, ...prev]);

        // Reset form
        setQuote('');
        setBook('');
        setAuthor('');
        setTheme('');
        setPage('');
        setTags('Importante');
    };

    const handleDeleteCitation = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta citação?')) {
            setCitations(prev => prev.filter(c => c.id !== id));
        }
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
                    alert("O arquivo parece estar vazio.");
                    return;
                }
                
                const newCitations: Citation[] = jsonData.map((row: any, index: number) => ({
                    id: Date.now() + index,
                    book: row['Livro'] || row['book'] || 'N/A',
                    author: row['Autor'] || row['author'] || 'N/A',
                    page: String(row['Página'] || row['Pagina'] || row['page'] || 'N/A'),
                    theme: row['Tema'] || row['theme'] || 'N/A',
                    quote: row['Citação Significativa'] || row['Citação'] || row['quote'] || '',
                    tags: row['Tag'] || row['tags'] || 'Importante'
                })).filter((c: Citation) => c.quote.trim() !== '');

                if (newCitations.length > 0) {
                    setCitations(prev => [...prev, ...newCitations]);
                    alert(`${newCitations.length} citações importadas com sucesso!`);
                } else {
                    alert("Nenhuma citação válida encontrada no arquivo. Verifique os nomes das colunas (ex: Livro, Autor, Citação, etc).");
                }
            } catch (error) {
                console.error("Error importing Excel file:", error);
                alert("Ocorreu um erro ao importar o arquivo.");
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = ''; // Reset file input
    };

    const handleExportPDF = () => {
        if (citations.length === 0 || !(window as any).jspdf) {
            alert("Não há citações para exportar.");
            return;
        }
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF();
        const tableColumn = ["Livro", "Autor", "Página", "Tema", "Citação", "Tag"];
        const tableRows = filteredCitations.map(c => [c.book, c.author, c.page, c.theme, c.quote, c.tags]);

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
        if (citations.length === 0 || !(window as any).XLSX) {
            alert("Não há citações para exportar.");
            return;
        }
        const dataForSheet = filteredCitations.map(c => ({
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
        const lowercasedFilter = searchTerm.toLowerCase();
        return citations.filter(c =>
            c.book.toLowerCase().includes(lowercasedFilter) ||
            c.author.toLowerCase().includes(lowercasedFilter) ||
            c.theme.toLowerCase().includes(lowercasedFilter) ||
            c.quote.toLowerCase().includes(lowercasedFilter) ||
            c.tags.toLowerCase().includes(lowercasedFilter)
        );
    }, [citations, searchTerm]);

    return (
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
                            <label htmlFor="upload-excel" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out flex items-center shadow-sm cursor-pointer">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                Importar Excel
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
                    <div className="mb-4">
                        <label htmlFor="search" className="block text-sm font-medium text-slate-300 mb-1">Pesquisar Citações</label>
                        <input type="text" id="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Busque por livro, autor, tema, citação ou tag..." />
                    </div>
                    <div className="max-h-[60vh] overflow-auto border border-slate-700 rounded-lg">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-slate-800 sticky top-0">
                                <tr>
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
                                    <tr key={citation.id} className="hover:bg-slate-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{citation.book}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{citation.author}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{citation.page}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{citation.theme}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-slate-200 w-2/5 break-words">{citation.quote}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-500/20 text-indigo-300">{citation.tags}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleDeleteCitation(citation.id)} className="text-red-500 hover:text-red-700">Excluir</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            Nenhuma citação encontrada. Adicione uma para começar!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CitationsView;
