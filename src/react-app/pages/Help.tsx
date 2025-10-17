import { useState } from 'react';
import { ArrowLeft, HelpCircle, Search, ChevronDown, ChevronRight, MessageCircle, Mail, Phone, Book } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const faqItems = [
    {
      id: 1,
      question: 'Como adicionar uma nova transação?',
      answer: 'Para adicionar uma nova transação, clique no botão "+" na navegação inferior ou vá para a página "Nova Transação". Preencha os campos obrigatórios: descrição, valor, categoria e data. Selecione se é uma receita ou despesa e clique em "Salvar".'
    },
    {
      id: 2,
      question: 'Como criar categorias personalizadas?',
      answer: 'Ao adicionar uma nova transação, você pode criar uma categoria personalizada clicando em "Nova Categoria" no seletor de categorias. Digite o nome da categoria e escolha uma cor para identificá-la facilmente.'
    },
    {
      id: 4,
      question: 'Como interpretar os gráficos de relatórios?',
      answer: 'Os gráficos mostram sua evolução financeira ao longo do tempo. O gráfico de linha mostra a evolução do saldo, enquanto o gráfico de pizza mostra a distribuição de gastos por categoria. Use os filtros para analisar períodos específicos.'
    },
    {
      id: 5,
      question: 'Como configurar alertas de orçamento?',
      answer: 'Vá para Perfil > Notificações e ative os "Alertas de Orçamento". Você receberá notificações quando atingir 80% do seu orçamento mensal em qualquer categoria. Configure limites específicos nas configurações avançadas.'
    },
    {
      id: 6,
      question: 'Como exportar meus dados financeiros?',
      answer: 'Acesse a página de Transações ou Relatórios e clique no botão "Exportar". Você pode baixar seus dados em formato CSV, JSON ou PDF para backup ou análise externa.'
    },
    {
      id: 7,
      question: 'O ZetaFin é seguro para meus dados financeiros?',
      answer: 'Sim! Utilizamos criptografia de ponta a ponta para proteger seus dados. Todas as informações são armazenadas de forma segura e nunca compartilhamos dados pessoais com terceiros. Você pode ativar autenticação em duas etapas para maior segurança.'
    },
    {
      id: 8,
      question: 'Como definir metas de economia?',
      answer: 'Vá para a seção de Relatórios e clique em "Definir Meta". Escolha o valor desejado, prazo e categoria. O sistema acompanhará automaticamente seu progresso e enviará notificações sobre o andamento da meta.'
    }
  ];

  const helpCategories = [
    {
      title: 'Primeiros Passos',
      icon: Book,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      topics: ['Como começar', 'Configuração inicial', 'Primeira transação']
    },
    {
      title: 'Transações',
      icon: MessageCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      topics: ['Adicionar receitas', 'Registrar despesas', 'Editar transações']
    },
    {
      title: 'Relatórios',
      icon: HelpCircle,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      topics: ['Interpretar gráficos', 'Filtros avançados', 'Exportar dados']
    }
  ];

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleCategoryClick = (categoryTitle: string) => {
    setSelectedCategory(selectedCategory === categoryTitle ? null : categoryTitle);
    
    // Filtrar FAQs relacionadas à categoria selecionada
    const categoryKeywords = {
      'Primeiros Passos': ['começar', 'configuração', 'primeira', 'inicial'],
      'Transações': ['transação', 'adicionar', 'receita', 'despesa', 'categoria'],
      'Relatórios': ['gráfico', 'relatório', 'exportar', 'dados', 'filtro']
    };

    const keywords = categoryKeywords[categoryTitle as keyof typeof categoryKeywords] || [];
    const relatedFaq = faqItems.find(faq => 
      keywords.some(keyword => 
        faq.question.toLowerCase().includes(keyword) || 
        faq.answer.toLowerCase().includes(keyword)
      )
    );

    if (relatedFaq) {
      setExpandedFaq(relatedFaq.id);
      // Scroll para a seção de FAQ
      setTimeout(() => {
        const faqSection = document.querySelector(`[data-faq-id="${relatedFaq.id}"]`);
        if (faqSection) {
          faqSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handleContactSupport = (type: 'chat' | 'email' | 'phone') => {
    switch (type) {
      case 'chat':
        // Simular abertura de chat
        alert('Chat ao vivo será aberto em breve! Nossa equipe está disponível de segunda a sexta, das 9h às 18h.');
        break;
      case 'email':
        // Abrir cliente de email
        window.location.href = 'mailto:suporte@zetafin.com?subject=Suporte ZetaFin&body=Olá, preciso de ajuda com...';
        break;
      case 'phone':
        // Simular ligação
        alert('Para falar conosco por telefone, ligue para (11) 9999-9999. Horário de atendimento: Segunda a Sexta, das 9h às 18h.');
        break;
    }
  };

  const filteredFaqs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/perfil" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ajuda e Suporte</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Encontre respostas e obtenha suporte</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por ajuda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {helpCategories.map((category, index) => (
          <div 
            key={index} 
            onClick={() => handleCategoryClick(category.title)}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border-2 ${
              selectedCategory === category.title 
                ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20' 
                : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 ${category.bgColor} rounded-lg flex items-center justify-center`}>
                <category.icon className={`w-5 h-5 ${category.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{category.title}</h3>
            </div>
            <ul className="space-y-2">
              {category.topics.map((topic, topicIndex) => (
                <li key={topicIndex} className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  • {topic}
                </li>
              ))}
            </ul>
            {selectedCategory === category.title && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  ✓ Clique expandiu a FAQ relacionada abaixo
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Perguntas Frequentes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Respostas para as dúvidas mais comuns</p>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="p-4" data-faq-id={faq.id}>
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">{faq.question}</span>
                {expandedFaq === faq.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              
              {expandedFaq === faq.id && (
                <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="p-8 text-center">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Nenhum resultado encontrado</h3>
            <p className="text-gray-500 dark:text-gray-400">Tente buscar com outras palavras-chave</p>
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Ainda precisa de ajuda?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Nossa equipe de suporte está pronta para ajudar você com qualquer dúvida.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleContactSupport('chat')}
            className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-gray-100">Chat ao Vivo</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Resposta imediata</p>
            </div>
          </button>

          <button 
            onClick={() => handleContactSupport('email')}
            className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-gray-100">Email</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">suporte@zetafin.com</p>
            </div>
          </button>

          <button 
            onClick={() => handleContactSupport('phone')}
            className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-gray-100">Telefone</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">(11) 9999-9999</p>
            </div>
          </button>
        </div>
      </div>

      {/* App Version */}
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400 text-sm">ZetaFin v1.0.0</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
}