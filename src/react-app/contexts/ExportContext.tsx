import React, { createContext, useContext } from 'react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface ExportContextType {
  exportToCSV: (data: Transaction[], filename?: string) => void;
  exportToJSON: (data: Transaction[], filename?: string) => void;
  exportToPDF: (data: Transaction[], filename?: string) => void;
}

const ExportContext = createContext<ExportContextType | undefined>(undefined);

export const useExport = () => {
  const context = useContext(ExportContext);
  if (context === undefined) {
    throw new Error('useExport must be used within an ExportProvider');
  }
  return context;
};

interface ExportProviderProps {
  children: React.ReactNode;
}

export const ExportProvider: React.FC<ExportProviderProps> = ({ children }) => {
  const exportToCSV = (data: Transaction[], filename = 'transacoes') => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
    const csvContent = [
      headers.join(','),
      ...data.map(transaction => [
        transaction.date,
        `"${transaction.description}"`,
        `"${transaction.category}"`,
        transaction.type === 'income' ? 'Receita' : 'Despesa',
        transaction.amount.toFixed(2).replace('.', ',')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data: Transaction[], filename = 'transacoes') => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (data: Transaction[], filename = 'transacoes') => {
    // Implementação básica de PDF usando HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório de Transações</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .income { color: #10b981; }
          .expense { color: #ef4444; }
          .total { font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Relatório de Transações - ZetaFin</h1>
        <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(transaction => `
              <tr>
                <td>${new Date(transaction.date).toLocaleDateString('pt-BR')}</td>
                <td>${transaction.description}</td>
                <td>${transaction.category}</td>
                <td class="${transaction.type}">${transaction.type === 'income' ? 'Receita' : 'Despesa'}</td>
                <td class="${transaction.type}">R$ ${transaction.amount.toFixed(2).replace('.', ',')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          <p>Total de Receitas: R$ ${data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toFixed(2).replace('.', ',')}</p>
          <p>Total de Despesas: R$ ${data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toFixed(2).replace('.', ',')}</p>
          <p>Saldo: R$ ${(data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)).toFixed(2).replace('.', ',')}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const value = {
    exportToCSV,
    exportToJSON,
    exportToPDF,
  };

  return (
    <ExportContext.Provider value={value}>
      {children}
    </ExportContext.Provider>
  );
};