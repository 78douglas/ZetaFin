import { useParams } from 'react-router';
import TransactionForm from '@/react-app/components/TransactionForm';

export default function EditTransaction() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Transação não encontrada</h1>
          <p className="text-gray-600 dark:text-gray-400">A transação que você está tentando editar não foi encontrada.</p>
        </div>
      </div>
    );
  }

  return <TransactionForm transacaoId={id} />;
}
