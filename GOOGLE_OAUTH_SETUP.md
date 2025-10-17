# Configuração do Google OAuth no Supabase

Este guia explica como configurar o login com Google no ZetaFin usando o Supabase.

## Pré-requisitos

- Projeto Supabase ativo
- Conta Google Developer Console

## Passo 1: Configurar Google Developer Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google+ API** (se ainda não estiver ativa)

### Criar Credenciais OAuth 2.0

1. Vá para **APIs & Services** > **Credentials**
2. Clique em **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Selecione **Web application**
4. Configure:
   - **Name**: ZetaFin
   - **Authorized JavaScript origins**: 
     - `https://your-project-ref.supabase.co`
   - **Authorized redirect URIs**:
     - `https://your-project-ref.supabase.co/auth/v1/callback`

5. Anote o **Client ID** e **Client Secret**

## Passo 2: Configurar Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto ZetaFin
3. Vá para **Authentication** > **Providers**
4. Encontre **Google** na lista de provedores
5. Configure:
   - **Enable Google provider**: ✅ Ativado
   - **Client ID**: Cole o Client ID do Google
   - **Client Secret**: Cole o Client Secret do Google
6. Clique em **Save**

## Passo 3: Configurar URLs de Redirecionamento

### No Google Console:
- Adicione: `https://your-project-ref.supabase.co/auth/v1/callback`
- Substitua `your-project-ref` pela referência do seu projeto Supabase

### No Supabase:
- Vá para **Authentication** > **URL Configuration**
- **Site URL**: `http://localhost:5173` (desenvolvimento) ou sua URL de produção
- **Redirect URLs**: Adicione as URLs onde os usuários podem ser redirecionados após login

## Passo 4: Testar a Configuração

1. Execute o projeto ZetaFin
2. Acesse a tela de login
3. Clique em "Continuar com Google"
4. Deve abrir a tela de autorização do Google

## Solução de Problemas

### Erro: "provider is not enabled"
- Verifique se o provedor Google está ativado no Supabase
- Confirme se Client ID e Client Secret estão corretos

### Erro: "redirect_uri_mismatch"
- Verifique se as URLs de redirecionamento estão corretas no Google Console
- Certifique-se de que a URL do Supabase está correta

### Erro: "invalid_client"
- Verifique se o Client ID e Client Secret estão corretos
- Confirme se a API Google+ está ativada

## URLs Importantes

- **Google Cloud Console**: https://console.cloud.google.com/
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Documentação Supabase Auth**: https://supabase.com/docs/guides/auth/social-login/auth-google

## Notas de Segurança

- Nunca exponha o Client Secret no código frontend
- Use HTTPS em produção
- Configure domínios autorizados corretamente
- Revise periodicamente as permissões e acessos

---

**Importante**: Após configurar o Google OAuth, o botão "Continuar com Google" funcionará normalmente. Enquanto isso, os usuários podem usar o login com email e senha que já está funcionando.