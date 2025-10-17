import { supabase } from '../lib/supabase'

export const disableRLSTemporarily = async () => {
  try {
    console.log('🔧 Desabilitando RLS temporariamente...')

    // Executar SQL para desabilitar RLS
    const { error } = await supabase.rpc('disable_rls_temporarily')

    if (error) {
      console.error('Erro ao desabilitar RLS:', error)
      return false
    }

    console.log('✅ RLS desabilitado temporariamente')
    return true

  } catch (error) {
    console.error('❌ Erro ao desabilitar RLS:', error)
    return false
  }
}

// Função alternativa usando SQL direto
export const disableRLSDirectly = async () => {
  try {
    console.log('🔧 Tentando desabilitar RLS diretamente...')

    const queries = [
      'ALTER TABLE users DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE categories DISABLE ROW LEVEL SECURITY', 
      'ALTER TABLE transactions DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE goals DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE goal_progress DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY'
    ]

    for (const query of queries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.error(`Erro ao executar: ${query}`, error)
      } else {
        console.log(`✅ Executado: ${query}`)
      }
    }

    return true

  } catch (error) {
    console.error('❌ Erro ao desabilitar RLS diretamente:', error)
    return false
  }
}