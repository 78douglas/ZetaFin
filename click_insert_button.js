// Script para simular clique no botão de inserir dados fictícios
console.log('🔍 Procurando botão de inserir dados...');

// Procurar pelo botão que contém o texto "Inserir"
const buttons = document.querySelectorAll('button');
let insertButton = null;

for (let button of buttons) {
  if (button.textContent.includes('Inserir') && !button.textContent.includes('Inserindo')) {
    insertButton = button;
    break;
  }
}

if (insertButton) {
  console.log('✅ Botão encontrado! Clicando...');
  insertButton.click();
  console.log('🎯 Clique executado no botão de inserir dados');
} else {
  console.log('❌ Botão de inserir não encontrado');
  console.log('Botões disponíveis:', Array.from(buttons).map(b => b.textContent));