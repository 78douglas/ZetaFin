import z from "zod";

// Enum para tipos de transação
export enum TipoTransacao {
  RECEITA = 'RECEITA',
  DESPESA = 'DESPESA'
}

// Schema para Categoria
export const CategoriaSchema = z.object({
  id: z.string(),
  nome: z.string(),
  tipoPadrao: z.enum(['RECEITA', 'DESPESA', 'AMBOS']).optional(),
  icone: z.string().optional(),
});

// Schema para Transação
export const TransacaoSchema = z.object({
  id: z.string(),
  descricao: z.string(),
  descricaoAdicional: z.string().optional(),
  valor: z.number().positive(),
  tipo: z.enum(['RECEITA', 'DESPESA']),
  data: z.string(), // ISO date string
  categoria_id: z.string().optional(),
  categoriaId: z.string().optional(), // Compatibilidade
  categoria: z.object({
    id: z.string(),
    nome: z.string(),
    icone: z.string().optional(),
    cor: z.string().optional(),
    is_default: z.boolean().optional()
  }).optional(),
  registradoPor: z.string(),
  tags: z.array(z.string()).optional(), // Campo para tags
  created_at: z.string().optional(), // ISO date string
  updated_at: z.string().optional(), // ISO date string
  createdAt: z.string().optional(), // Compatibilidade
  // Campos para transações compartilhadas
  isPartnerTransaction: z.boolean().optional(),
  partnerName: z.string().optional(),
});

// Schema para filtros de transação
export const FiltroTransacaoSchema = z.object({
  categoria: z.string().optional(),
  tipo: z.enum(['RECEITA', 'DESPESA']).optional(),
  busca: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

// Types derivados dos schemas
export type Categoria = z.infer<typeof CategoriaSchema>;
export type Transacao = z.infer<typeof TransacaoSchema>;
export type FiltroTransacao = z.infer<typeof FiltroTransacaoSchema>;

// Interface para estatísticas
export interface EstatisticasFinanceiras {
  saldoTotal: number;
  totalReceitas: number;
  totalDespesas: number;
  transacoesCount: number;
}

// Interface para dados do casal
export interface DadosCasal {
  id: string;
  nomeCasal: string;
  saldoAtual: number;
}
