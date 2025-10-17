import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://auzxgatnowthemvddgpg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1enhnYXRub3d0aGVtdmRkZ3BnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAxMDgzOSwiZXhwIjoyMDc1NTg2ODM5fQ.pbfILDyA2DiBiA2-18pZpQLXJVZZFHVVieAseX3bbNA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function getData() {
  try {
    console.log('Iniciando consulta ao Supabase...')
    
    // Buscar user_id do usuário 78douglas@gmail.com
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', '78douglas@gmail.com')
      .single()

    if (userError) {
      console.error('Erro ao buscar usuário:', userError)
      return
    }

    console.log('Usuário encontrado:', userData)

    // Buscar todas as categorias
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, icon, color')
      .order('name')

    if (categoriesError) {
      console.error('Erro ao buscar categorias:', categoriesError)
      return
    }

    console.log('Categorias encontradas:', categoriesData)

    return {
      user: userData,
      categories: categoriesData
    }
  } catch (error) {
    console.error('Erro geral:', error)
  }
}

getData().then(result => {
  if (result) {
    console.log('Dados obtidos com sucesso!')
  }
})