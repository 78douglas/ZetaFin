import { useState, useEffect, useCallback } from 'react';
import { Transacao, Categoria, TipoTransacao, FiltroTransacao, EstatisticasFinanceiras } from '@/shared/types';

// Dados iniciais fictícios
const categoriasIniciais: Categoria[] = [
  { id: '1', nome: 'Salário', tipoPadrao: 'RECEITA', icone: '💰' },
  { id: '2', nome: 'Freelances', tipoPadrao: 'RECEITA', icone: '💻' },
  { id: '3', nome: 'Investimentos', tipoPadrao: 'RECEITA', icone: '📈' },
  { id: '4', nome: 'Vendas', tipoPadrao: 'RECEITA', icone: '🛍️' },
  { id: '5', nome: 'Bônus', tipoPadrao: 'RECEITA', icone: '🎁' },
  { id: '6', nome: 'Alimentação', tipoPadrao: 'DESPESA', icone: '🍽️' },
  { id: '7', nome: 'Moradia', tipoPadrao: 'DESPESA', icone: '🏠' },
  { id: '8', nome: 'Transporte', tipoPadrao: 'DESPESA', icone: '🚗' },
  { id: '9', nome: 'Saúde', tipoPadrao: 'DESPESA', icone: '🏥' },
  { id: '10', nome: 'Lazer', tipoPadrao: 'DESPESA', icone: '🎬' },
  { id: '11', nome: 'Educação', tipoPadrao: 'DESPESA', icone: '📚' },
  { id: '12', nome: 'Vestuário', tipoPadrao: 'DESPESA', icone: '👕' },
  { id: '13', nome: 'Tecnologia', tipoPadrao: 'DESPESA', icone: '📱' },
  { id: '14', nome: 'Viagem', tipoPadrao: 'DESPESA', icone: '✈️' },
  { id: '15', nome: 'Casa e Jardim', tipoPadrao: 'DESPESA', icone: '🌱' },
  { id: '16', nome: 'Pets', tipoPadrao: 'DESPESA', icone: '🐕' },
  { id: '17', nome: 'Esportes', tipoPadrao: 'DESPESA', icone: '⚽' },
  { id: '18', nome: 'Beleza', tipoPadrao: 'DESPESA', icone: '💄' },
  { id: '19', nome: 'Outros', tipoPadrao: 'AMBOS', icone: '📝' },
];

const transacoesIniciais: Transacao[] = [
  // OUTUBRO 2024
  { id: '1', descricao: 'Salário João', valor: 4500, tipo: TipoTransacao.RECEITA, data: '2024-10-01', categoriaId: '1', registradoPor: 'João', createdAt: '2024-10-01T09:00:00Z' },
  { id: '2', descricao: 'Salário Maria', valor: 3800, tipo: TipoTransacao.RECEITA, data: '2024-10-01', categoriaId: '1', registradoPor: 'Maria', createdAt: '2024-10-01T09:00:00Z' },
  { id: '3', descricao: 'Aluguel', valor: 1200, tipo: TipoTransacao.DESPESA, data: '2024-10-05', categoriaId: '7', registradoPor: 'João', createdAt: '2024-10-05T10:00:00Z' },
  { id: '4', descricao: 'Supermercado Pão de Açúcar', valor: 450, tipo: TipoTransacao.DESPESA, data: '2024-10-02', categoriaId: '6', registradoPor: 'Maria', createdAt: '2024-10-02T18:30:00Z' },
  { id: '5', descricao: 'Netflix', valor: 35, tipo: TipoTransacao.DESPESA, data: '2024-10-03', categoriaId: '10', registradoPor: 'João', createdAt: '2024-10-03T14:20:00Z' },
  { id: '6', descricao: 'Uber', valor: 25, tipo: TipoTransacao.DESPESA, data: '2024-10-04', categoriaId: '8', registradoPor: 'Maria', createdAt: '2024-10-04T20:15:00Z' },
  { id: '7', descricao: 'Academia', valor: 89, tipo: TipoTransacao.DESPESA, data: '2024-10-06', categoriaId: '17', registradoPor: 'João', createdAt: '2024-10-06T08:30:00Z' },
  { id: '8', descricao: 'Freelance Site', valor: 800, tipo: TipoTransacao.RECEITA, data: '2024-10-07', categoriaId: '2', registradoPor: 'Maria', createdAt: '2024-10-07T16:45:00Z' },
  { id: '9', descricao: 'Combustível', valor: 180, tipo: TipoTransacao.DESPESA, data: '2024-10-07', categoriaId: '8', registradoPor: 'João', createdAt: '2024-10-07T16:20:00Z' },
  { id: '10', descricao: 'Cinema', valor: 80, tipo: TipoTransacao.DESPESA, data: '2024-10-08', categoriaId: '10', registradoPor: 'Maria', createdAt: '2024-10-08T20:15:00Z' },
  { id: '11', descricao: 'Farmácia', valor: 120, tipo: TipoTransacao.DESPESA, data: '2024-10-09', categoriaId: '9', registradoPor: 'Maria', createdAt: '2024-10-09T11:30:00Z' },
  { id: '12', descricao: 'Restaurante', valor: 150, tipo: TipoTransacao.DESPESA, data: '2024-10-10', categoriaId: '6', registradoPor: 'João', createdAt: '2024-10-10T19:45:00Z' },
  
  // SETEMBRO 2024
  { id: '13', descricao: 'Salário João', valor: 4500, tipo: TipoTransacao.RECEITA, data: '2024-09-01', categoriaId: '1', registradoPor: 'João', createdAt: '2024-09-01T09:00:00Z' },
  { id: '14', descricao: 'Salário Maria', valor: 3800, tipo: TipoTransacao.RECEITA, data: '2024-09-01', categoriaId: '1', registradoPor: 'Maria', createdAt: '2024-09-01T09:00:00Z' },
  { id: '15', descricao: 'Bônus Performance', valor: 1200, tipo: TipoTransacao.RECEITA, data: '2024-09-15', categoriaId: '5', registradoPor: 'João', createdAt: '2024-09-15T14:00:00Z' },
  { id: '16', descricao: 'Aluguel', valor: 1200, tipo: TipoTransacao.DESPESA, data: '2024-09-05', categoriaId: '7', registradoPor: 'João', createdAt: '2024-09-05T10:00:00Z' },
  { id: '17', descricao: 'Conta de Luz', valor: 195, tipo: TipoTransacao.DESPESA, data: '2024-09-10', categoriaId: '7', registradoPor: 'Maria', createdAt: '2024-09-10T16:30:00Z' },
  { id: '18', descricao: 'Supermercado Extra', valor: 380, tipo: TipoTransacao.DESPESA, data: '2024-09-12', categoriaId: '6', registradoPor: 'Maria', createdAt: '2024-09-12T18:20:00Z' },
  { id: '19', descricao: 'Shopping Roupas', valor: 350, tipo: TipoTransacao.DESPESA, data: '2024-09-18', categoriaId: '12', registradoPor: 'Maria', createdAt: '2024-09-18T15:45:00Z' },
  { id: '20', descricao: 'Consultório Dentista', valor: 280, tipo: TipoTransacao.DESPESA, data: '2024-09-20', categoriaId: '9', registradoPor: 'João', createdAt: '2024-09-20T14:30:00Z' },
  { id: '21', descricao: 'Viagem Final de Semana', valor: 650, tipo: TipoTransacao.DESPESA, data: '2024-09-25', categoriaId: '14', registradoPor: 'João', createdAt: '2024-09-25T08:00:00Z' },
  
  // AGOSTO 2024
  { id: '22', descricao: 'Salário João', valor: 4500, tipo: TipoTransacao.RECEITA, data: '2024-08-01', categoriaId: '1', registradoPor: 'João', createdAt: '2024-08-01T09:00:00Z' },
  { id: '23', descricao: 'Salário Maria', valor: 3800, tipo: TipoTransacao.RECEITA, data: '2024-08-01', categoriaId: '1', registradoPor: 'Maria', createdAt: '2024-08-01T09:00:00Z' },
  { id: '24', descricao: 'Venda Mesa Antiga', valor: 300, tipo: TipoTransacao.RECEITA, data: '2024-08-12', categoriaId: '4', registradoPor: 'Maria', createdAt: '2024-08-12T16:20:00Z' },
  { id: '25', descricao: 'Aluguel', valor: 1200, tipo: TipoTransacao.DESPESA, data: '2024-08-05', categoriaId: '7', registradoPor: 'João', createdAt: '2024-08-05T10:00:00Z' },
  { id: '26', descricao: 'Seguro do Carro', valor: 450, tipo: TipoTransacao.DESPESA, data: '2024-08-08', categoriaId: '8', registradoPor: 'João', createdAt: '2024-08-08T11:15:00Z' },
  { id: '27', descricao: 'Curso Online', valor: 199, tipo: TipoTransacao.DESPESA, data: '2024-08-14', categoriaId: '11', registradoPor: 'Maria', createdAt: '2024-08-14T20:30:00Z' },
  { id: '28', descricao: 'Veterinário', valor: 180, tipo: TipoTransacao.DESPESA, data: '2024-08-16', categoriaId: '16', registradoPor: 'Maria', createdAt: '2024-08-16T09:45:00Z' },
  { id: '29', descricao: 'iPhone 15', valor: 4200, tipo: TipoTransacao.DESPESA, data: '2024-08-22', categoriaId: '13', registradoPor: 'João', createdAt: '2024-08-22T14:20:00Z' },
  
  // JULHO 2024
  { id: '30', descricao: 'Salário João', valor: 4500, tipo: TipoTransacao.RECEITA, data: '2024-07-01', categoriaId: '1', registradoPor: 'João', createdAt: '2024-07-01T09:00:00Z' },
  { id: '31', descricao: 'Salário Maria', valor: 3800, tipo: TipoTransacao.RECEITA, data: '2024-07-01', categoriaId: '1', registradoPor: 'Maria', createdAt: '2024-07-01T09:00:00Z' },
  { id: '32', descricao: 'Dividendos Ações', valor: 850, tipo: TipoTransacao.RECEITA, data: '2024-07-10', categoriaId: '3', registradoPor: 'João', createdAt: '2024-07-10T15:30:00Z' },
  { id: '33', descricao: 'Freelance Logo', valor: 1200, tipo: TipoTransacao.RECEITA, data: '2024-07-18', categoriaId: '2', registradoPor: 'Maria', createdAt: '2024-07-18T11:45:00Z' },
  { id: '34', descricao: 'Aluguel', valor: 1200, tipo: TipoTransacao.DESPESA, data: '2024-07-05', categoriaId: '7', registradoPor: 'João', createdAt: '2024-07-05T10:00:00Z' },
  { id: '35', descricao: 'Férias - Hotel', valor: 1800, tipo: TipoTransacao.DESPESA, data: '2024-07-15', categoriaId: '14', registradoPor: 'Maria', createdAt: '2024-07-15T08:00:00Z' },
  { id: '36', descricao: 'Férias - Restaurantes', valor: 890, tipo: TipoTransacao.DESPESA, data: '2024-07-16', categoriaId: '6', registradoPor: 'João', createdAt: '2024-07-16T12:30:00Z' },
  { id: '37', descricao: 'Férias - Passeios', valor: 620, tipo: TipoTransacao.DESPESA, data: '2024-07-17', categoriaId: '10', registradoPor: 'Maria', createdAt: '2024-07-17T14:15:00Z' },
  { id: '38', descricao: 'Plantas para Casa', valor: 150, tipo: TipoTransacao.DESPESA, data: '2024-07-25', categoriaId: '15', registradoPor: 'Maria', createdAt: '2024-07-25T16:20:00Z' },
  
  // JUNHO 2024
  { id: '39', descricao: 'Salário João', valor: 4500, tipo: TipoTransacao.RECEITA, data: '2024-06-01', categoriaId: '1', registradoPor: 'João', createdAt: '2024-06-01T09:00:00Z' },
  { id: '40', descricao: 'Salário Maria', valor: 3800, tipo: TipoTransacao.RECEITA, data: '2024-06-01', categoriaId: '1', registradoPor: 'Maria', createdAt: '2024-06-01T09:00:00Z' },
  { id: '41', descricao: 'Aluguel', valor: 1200, tipo: TipoTransacao.DESPESA, data: '2024-06-05', categoriaId: '7', registradoPor: 'João', createdAt: '2024-06-05T10:00:00Z' },
  { id: '42', descricao: 'Aniversário João - Festa', valor: 800, tipo: TipoTransacao.DESPESA, data: '2024-06-12', categoriaId: '10', registradoPor: 'Maria', createdAt: '2024-06-12T19:30:00Z' },
  { id: '43', descricao: 'Presente Aniversário', valor: 350, tipo: TipoTransacao.DESPESA, data: '2024-06-11', categoriaId: '19', registradoPor: 'Maria', createdAt: '2024-06-11T15:45:00Z' },
  { id: '44', descricao: 'Salão de Beleza', valor: 180, tipo: TipoTransacao.DESPESA, data: '2024-06-20', categoriaId: '18', registradoPor: 'Maria', createdAt: '2024-06-20T14:30:00Z' },
  { id: '45', descricao: 'Equipamentos Academia Casa', valor: 450, tipo: TipoTransacao.DESPESA, data: '2024-06-25', categoriaId: '17', registradoPor: 'João', createdAt: '2024-06-25T10:15:00Z' },
  
  // MAIO 2024
  { id: '46', descricao: 'Salário João', valor: 4500, tipo: TipoTransacao.RECEITA, data: '2024-05-01', categoriaId: '1', registradoPor: 'João', createdAt: '2024-05-01T09:00:00Z' },
  { id: '47', descricao: 'Salário Maria', valor: 3800, tipo: TipoTransacao.RECEITA, data: '2024-05-01', categoriaId: '1', registradoPor: 'Maria', createdAt: '2024-05-01T09:00:00Z' },
  { id: '48', descricao: 'Consultoria IT', valor: 2500, tipo: TipoTransacao.RECEITA, data: '2024-05-15', categoriaId: '2', registradoPor: 'João', createdAt: '2024-05-15T16:30:00Z' },
  { id: '49', descricao: 'Aluguel', valor: 1200, tipo: TipoTransacao.DESPESA, data: '2024-05-05', categoriaId: '7', registradoPor: 'João', createdAt: '2024-05-05T10:00:00Z' },
  { id: '50', descricao: 'Reforma Banheiro', valor: 3200, tipo: TipoTransacao.DESPESA, data: '2024-05-18', categoriaId: '15', registradoPor: 'Maria', createdAt: '2024-05-18T09:00:00Z' },
  
  // NOVEMBRO 2024
  { id: '51', descricao: 'Salário João', valor: 4500, tipo: TipoTransacao.RECEITA, data: '2024-11-01', categoriaId: '1', registradoPor: 'João', createdAt: '2024-11-01T09:00:00Z' },
  { id: '52', descricao: 'Salário Maria', valor: 3800, tipo: TipoTransacao.RECEITA, data: '2024-11-01', categoriaId: '1', registradoPor: 'Maria', createdAt: '2024-11-01T09:00:00Z' },
  { id: '53', descricao: 'Aluguel', valor: 1200, tipo: TipoTransacao.DESPESA, data: '2024-11-05', categoriaId: '7', registradoPor: 'João', createdAt: '2024-11-05T10:00:00Z' },
  { id: '54', descricao: 'Black Friday - Eletrônicos', valor: 850, tipo: TipoTransacao.DESPESA, data: '2024-11-29', categoriaId: '13', registradoPor: 'Maria', createdAt: '2024-11-29T15:30:00Z' },
  { id: '55', descricao: 'Black Friday - Roupas', valor: 420, tipo: TipoTransacao.DESPESA, data: '2024-11-29', categoriaId: '12', registradoPor: 'João', createdAt: '2024-11-29T16:45:00Z' },
  { id: '56', descricao: 'Conta de Água', valor: 85, tipo: TipoTransacao.DESPESA, data: '2024-11-15', categoriaId: '7', registradoPor: 'Maria', createdAt: '2024-11-15T14:20:00Z' },
  { id: '57', descricao: 'Supermercado Carrefour', valor: 520, tipo: TipoTransacao.DESPESA, data: '2024-11-08', categoriaId: '6', registradoPor: 'Maria', createdAt: '2024-11-08T18:15:00Z' },
  { id: '58', descricao: 'Freelance App Mobile', valor: 1800, tipo: TipoTransacao.RECEITA, data: '2024-11-12', categoriaId: '2', registradoPor: 'João', createdAt: '2024-11-12T10:30:00Z' },
  { id: '59', descricao: 'Jantar Romântico', valor: 180, tipo: TipoTransacao.DESPESA, data: '2024-11-20', categoriaId: '6', registradoPor: 'João', createdAt: '2024-11-20T20:30:00Z' },
  { id: '60', descricao: 'Presente Amigo Secreto', valor: 120, tipo: TipoTransacao.DESPESA, data: '2024-11-25', categoriaId: '19', registradoPor: 'Maria', createdAt: '2024-11-25T16:00:00Z' },
  
  // DEZEMBRO 2024
  { id: '61', descricao: 'Salário João', valor: 4500, tipo: TipoTransacao.RECEITA, data: '2024-12-01', categoriaId: '1', registradoPor: 'João', createdAt: '2024-12-01T09:00:00Z' },
  { id: '62', descricao: 'Salário Maria', valor: 3800, tipo: TipoTransacao.RECEITA, data: '2024-12-01', categoriaId: '1', registradoPor: 'Maria', createdAt: '2024-12-01T09:00:00Z' },
  { id: '63', descricao: '13º Salário João', valor: 4500, tipo: TipoTransacao.RECEITA, data: '2024-12-20', categoriaId: '5', registradoPor: 'João', createdAt: '2024-12-20T09:00:00Z' },
  { id: '64', descricao: '13º Salário Maria', valor: 3800, tipo: TipoTransacao.RECEITA, data: '2024-12-20', categoriaId: '5', registradoPor: 'Maria', createdAt: '2024-12-20T09:00:00Z' },
  { id: '65', descricao: 'Aluguel', valor: 1200, tipo: TipoTransacao.DESPESA, data: '2024-12-05', categoriaId: '7', registradoPor: 'João', createdAt: '2024-12-05T10:00:00Z' },
  { id: '66', descricao: 'Ceia de Natal', valor: 380, tipo: TipoTransacao.DESPESA, data: '2024-12-23', categoriaId: '6', registradoPor: 'Maria', createdAt: '2024-12-23T16:30:00Z' },
  { id: '67', descricao: 'Presentes de Natal', valor: 950, tipo: TipoTransacao.DESPESA, data: '2024-12-22', categoriaId: '19', registradoPor: 'João', createdAt: '2024-12-22T14:45:00Z' },
  { id: '68', descricao: 'Viagem Ano Novo', valor: 1200, tipo: TipoTransacao.DESPESA, data: '2024-12-28', categoriaId: '14', registradoPor: 'Maria', createdAt: '2024-12-28T08:00:00Z' },
  { id: '69', descricao: 'Conta de Luz Dezembro', valor: 220, tipo: TipoTransacao.DESPESA, data: '2024-12-10', categoriaId: '7', registradoPor: 'Maria', createdAt: '2024-12-10T15:20:00Z' },
  { id: '70', descricao: 'Dividendos Fim de Ano', valor: 1200, tipo: TipoTransacao.RECEITA, data: '2024-12-15', categoriaId: '3', registradoPor: 'João', createdAt: '2024-12-15T11:30:00Z' },
  
  // JANEIRO 2025 (dados mais recentes)
  { id: '71', descricao: 'Salário João', valor: 4650, tipo: TipoTransacao.RECEITA, data: '2025-01-01', categoriaId: '1', registradoPor: 'João', createdAt: '2025-01-01T09:00:00Z' },
  { id: '72', descricao: 'Salário Maria', valor: 3950, tipo: TipoTransacao.RECEITA, data: '2025-01-01', categoriaId: '1', registradoPor: 'Maria', createdAt: '2025-01-01T09:00:00Z' },
  { id: '73', descricao: 'Aluguel', valor: 1250, tipo: TipoTransacao.DESPESA, data: '2025-01-05', categoriaId: '7', registradoPor: 'João', createdAt: '2025-01-05T10:00:00Z' },
  { id: '74', descricao: 'Academia - Matrícula Anual', valor: 890, tipo: TipoTransacao.DESPESA, data: '2025-01-03', categoriaId: '17', registradoPor: 'Maria', createdAt: '2025-01-03T09:15:00Z' },
  { id: '75', descricao: 'Supermercado Janeiro', valor: 480, tipo: TipoTransacao.DESPESA, data: '2025-01-08', categoriaId: '6', registradoPor: 'Maria', createdAt: '2025-01-08T18:45:00Z' },
  { id: '76', descricao: 'Consulta Médica', valor: 250, tipo: TipoTransacao.DESPESA, data: '2025-01-10', categoriaId: '9', registradoPor: 'João', createdAt: '2025-01-10T14:30:00Z' },
  { id: '77', descricao: 'Freelance Janeiro', valor: 1500, tipo: TipoTransacao.RECEITA, data: '2025-01-12', categoriaId: '2', registradoPor: 'Maria', createdAt: '2025-01-12T16:20:00Z' },
  { id: '78', descricao: 'Combustível', valor: 200, tipo: TipoTransacao.DESPESA, data: '2025-01-14', categoriaId: '8', registradoPor: 'João', createdAt: '2025-01-14T17:10:00Z' },
  { id: '79', descricao: 'Streaming Disney+', valor: 45, tipo: TipoTransacao.DESPESA, data: '2025-01-15', categoriaId: '10', registradoPor: 'Maria', createdAt: '2025-01-15T12:00:00Z' },
  { id: '80', descricao: 'Livros Técnicos', valor: 180, tipo: TipoTransacao.DESPESA, data: '2025-01-16', categoriaId: '11', registradoPor: 'João', createdAt: '2025-01-16T20:30:00Z' },
];

const STORAGE_KEY = 'zetafin_data';

interface StorageData {
  transacoes: Transacao[];
  categorias: Categoria[];
}

export function useFinanceData() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const { transacoes: savedTransacoes, categorias: savedCategorias }: StorageData = JSON.parse(savedData);
        setTransacoes(savedTransacoes || transacoesIniciais);
        setCategorias(savedCategorias || categoriasIniciais);
      } else {
        // Primeira vez - usar dados iniciais
        setTransacoes(transacoesIniciais);
        setCategorias(categoriasIniciais);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setTransacoes(transacoesIniciais);
      setCategorias(categoriasIniciais);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar dados no localStorage sempre que mudarem
  const salvarDados = useCallback((novasTransacoes: Transacao[], novasCategorias: Categoria[]) => {
    const data: StorageData = {
      transacoes: novasTransacoes,
      categorias: novasCategorias
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  // Calcular estatísticas
  const calcularEstatisticas = useCallback((): EstatisticasFinanceiras => {
    const totalReceitas = transacoes
      .filter(t => t.tipo === TipoTransacao.RECEITA)
      .reduce((sum, t) => sum + t.valor, 0);
    
    const totalDespesas = transacoes
      .filter(t => t.tipo === TipoTransacao.DESPESA)
      .reduce((sum, t) => sum + t.valor, 0);

    return {
      saldoTotal: totalReceitas - totalDespesas,
      totalReceitas,
      totalDespesas,
      transacoesCount: transacoes.length
    };
  }, [transacoes]);

  // Filtrar transações
  const filtrarTransacoes = useCallback((filtros: FiltroTransacao): Transacao[] => {
    return transacoes.filter(transacao => {
      // Filtro por categoria
      if (filtros.categoria && transacao.categoriaId !== filtros.categoria) {
        return false;
      }

      // Filtro por tipo
      if (filtros.tipo && transacao.tipo !== filtros.tipo) {
        return false;
      }

      // Filtro por busca (descrição)
      if (filtros.busca && !transacao.descricao.toLowerCase().includes(filtros.busca.toLowerCase())) {
        return false;
      }

      // Filtro por data
      if (filtros.dataInicio && transacao.data < filtros.dataInicio) {
        return false;
      }

      if (filtros.dataFim && transacao.data > filtros.dataFim) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [transacoes]);

  // Adicionar transação
  const adicionarTransacao = useCallback((novaTransacao: Omit<Transacao, 'id' | 'createdAt'>) => {
    const transacao: Transacao = {
      ...novaTransacao,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      registradoPor: 'Usuário'
    };

    const novasTransacoes = [...transacoes, transacao];
    setTransacoes(novasTransacoes);
    salvarDados(novasTransacoes, categorias);
    return transacao;
  }, [transacoes, categorias, salvarDados]);

  // Editar transação
  const editarTransacao = useCallback((id: string, dadosAtualizados: Partial<Omit<Transacao, 'id' | 'createdAt'>>) => {
    const novasTransacoes = transacoes.map(transacao =>
      transacao.id === id
        ? { ...transacao, ...dadosAtualizados }
        : transacao
    );
    setTransacoes(novasTransacoes);
    salvarDados(novasTransacoes, categorias);
  }, [transacoes, categorias, salvarDados]);

  // Excluir transação
  const excluirTransacao = useCallback((id: string) => {
    const novasTransacoes = transacoes.filter(transacao => transacao.id !== id);
    setTransacoes(novasTransacoes);
    salvarDados(novasTransacoes, categorias);
  }, [transacoes, categorias, salvarDados]);

  // Obter transação por ID
  const obterTransacao = useCallback((id: string): Transacao | undefined => {
    return transacoes.find(transacao => transacao.id === id);
  }, [transacoes]);

  // Adicionar categoria
  const adicionarCategoria = useCallback((novaCategoria: Omit<Categoria, 'id'>) => {
    const categoria: Categoria = {
      ...novaCategoria,
      id: Date.now().toString()
    };

    const novasCategorias = [...categorias, categoria];
    setCategorias(novasCategorias);
    salvarDados(transacoes, novasCategorias);
    return categoria;
  }, [categorias, transacoes, salvarDados]);

  // Obter categoria por ID
  const obterCategoria = useCallback((id: string): Categoria | undefined => {
    return categorias.find(categoria => categoria.id === id);
  }, [categorias]);

  return {
    transacoes,
    categorias,
    loading,
    estatisticas: calcularEstatisticas(),
    adicionarTransacao,
    editarTransacao,
    excluirTransacao,
    filtrarTransacoes,
    obterTransacao,
    obterCategoria,
    adicionarCategoria
  };
}
