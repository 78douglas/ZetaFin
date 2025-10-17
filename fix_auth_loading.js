// Script para corrigir o problema de loading infinito
// Execute este script no console do navegador

console.log('🔧 Iniciando correção do loading infinito...');

// 1. Limpar localStorage
console.log('📦 Limpando localStorage...');
localStorage.clear();

// 2. Limpar sessionStorage
console.log('📦 Limpando sessionStorage...');
sessionStorage.clear();

// 3. Limpar cookies do Supabase
console.log('🍪 Limpando cookies...');
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// 4. Forçar logout do Supabase
console.log('🚪 Forçando logout...');
if (window.supabase) {
    window.supabase.auth.signOut().then(() => {
        console.log('✅ Logout realizado');
    }).catch(err => {
        console.log('⚠️ Erro no logout:', err);
    });
}

// 5. Recarregar a página
console.log('🔄 Recarregando página em 2 segundos...');
setTimeout(() => {
    window.location.reload();
}, 2000);

console.log('✅ Script executado! A página será recarregada automaticamente.');