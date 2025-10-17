import { supabase } from '../lib/supabase'

export const createTestDataForUser = async (userId: string) => {
  try {
    console.log('🔧 Criando dados de teste para usuário:', userId)

    // 1. Verificar se usuário já existe antes de tentar criar
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingUser) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: '78douglas@gmail.com',
          name: 'Douglas',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()

      if (userError) {
        console.error('❌ Erro ao criar usuário:', userError)
        return // Parar execução se não conseguir criar usuário
      } else {
        console.log('✅ Usuário criado com sucesso')
      }
    } else {
      console.log('ℹ️ Usuário já existe, pulando criação')
    }

    // 2. Criar categorias padrão
    const defaultCategories = [
      { name: 'Alimentação', icon: '🍽️', color: '#FF6B6B' },
      { name: 'Transporte', icon: '🚗', color: '#4ECDC4' },
      { name: 'Moradia', icon: '🏠', color: '#45B7D1' },
      { name: 'Saúde', icon: '🏥', color: '#96CEB4' },
      { name: 'Educação', icon: '📚', color: '#FFEAA7' },
      { name: 'Lazer', icon: '🎮', color: '#DDA0DD' },
      { name: 'Outros', icon: '📦', color: '#AED6F1' },
      { name: 'Salário', icon: '💰', color: '#90EE90' }
    ]

    const categoriesToInsert = defaultCategories.map(cat => ({
      user_id: userId,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      is_default: true,
      created_at: new Date().toISOString()
    }))

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .upsert(categoriesToInsert, { onConflict: 'user_id,name' })
      .select()

    if (categoriesError) {
      console.error('❌ Erro ao criar categorias:', categoriesError)
      return // Parar execução se não conseguir criar categorias
    } else {
      console.log('✅ Categorias criadas/atualizadas com sucesso:', categoriesData?.length)
    }

    // 3. Criar transações de teste
    if (categoriesData && categoriesData.length > 0) {
      const outrosCategory = categoriesData.find(cat => cat.name === 'Outros')
      const salarioCategory = categoriesData.find(cat => cat.name === 'Salário')

      const testTransactions = []

      if (outrosCategory) {
        testTransactions.push({
          user_id: userId,
          category_id: outrosCategory.id,
          description: 'Teste de despesa',
          amount: 1000.00,
          type: 'DESPESA',
          transaction_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

      if (salarioCategory) {
        testTransactions.push({
          user_id: userId,
          category_id: salarioCategory.id,
          description: 'Teste de receita',
          amount: 5000.00,
          type: 'RECEITA',
          transaction_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

      if (testTransactions.length > 0) {
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .insert(testTransactions)
          .select()

        if (transactionsError) {
          console.error('Erro ao criar transações:', transactionsError)
        } else {
          console.log('✅ Transações criadas com sucesso:', transactionsData?.length)
        }
      }
    }

    console.log('🎉 Dados de teste criados com sucesso!')
    return true

  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error)
    return false
  }
}