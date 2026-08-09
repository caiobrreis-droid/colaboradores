# VESSEL — Gestão de Colaboradores

Sistema de gestão de colaboradores organizado por Gabinete, Casa, Vice-Presidência e PMBV.

## Executar localmente

1. Instale o Node.js 20 ou superior.
2. Copie `.env.local.example` para `.env.local`.
3. Instale as dependências com `npm install`.
4. Execute `npm run dev` para desenvolvimento.
5. Para testar com desempenho de produção, execute `npm run build` e depois `npm start`.

O endereço padrão é `http://localhost:3000`.

## Banco de dados e autenticação

O projeto está preparado para Supabase. Configure estas variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Nunca envie a chave `SUPABASE_SERVICE_ROLE_KEY` ao GitHub. Ela deve ser cadastrada somente no ambiente de hospedagem.

As migrações estão em `supabase/migrations` e devem ser aplicadas em ordem. Enquanto o Supabase não estiver configurado, a área de usuários usa armazenamento local do navegador para não perder os testes feitos no mesmo computador.

## Publicação

- Código: GitHub.
- Banco e autenticação: Supabase.
- Aplicação Next.js: Vercel.

Na Vercel, cadastre as três variáveis de ambiente e faça o primeiro deploy após aplicar as migrações no Supabase.
