import TransactionForm from '@/react-app/components/TransactionForm';

export default function NewTransaction() {
  console.log('🔥 NewTransaction CARREGOU!');
  console.log('🔥 NewTransaction - Renderizando TransactionForm');
  
  // Teste simples primeiro
  return (
    <div style={{ padding: '20px', background: 'white', color: 'black' }}>
      <h1>🔥 TESTE - NewTransaction Carregou!</h1>
      <p>Se você está vendo isso, o componente NewTransaction está funcionando.</p>
      <TransactionForm />
    </div>
  );
}
