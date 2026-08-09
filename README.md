# VESSEL — Gestão de Colaboradores

Sistema de gestão de colaboradores organizado por Gabinete, Casa, Vice-Presidência e PMBV.

## Arquitetura

Todo o ambiente de produção fica no Railway:

- Aplicação: Next.js.
- Banco de dados: PostgreSQL.
- Login: sessões persistentes e senhas protegidas por hash.
- Fotos: Railway Storage Bucket privado.
- Código-fonte: GitHub conectado ao Railway.

## Executar localmente

1. Instale o Node.js 20.9 ou superior.
2. Copie `.env.local.example` para `.env.local`.
3. Instale as dependências com `npm install`.
4. Execute `npm run db:migrate` para preparar o PostgreSQL.
5. Execute `npm run dev`.

Sem `DATABASE_URL`, o sistema usa o modo local apenas para desenvolvimento. Em produção, configure o PostgreSQL e o bucket.

## Variáveis do Railway

Na aplicação Next.js, adicione estas variáveis usando referências aos serviços PostgreSQL e Storage Bucket do mesmo projeto:

```env
DATABASE_URL=
ADMIN_NAME=Administrador
ADMIN_EMAIL=
ADMIN_PASSWORD=
BUCKET=
ENDPOINT=
ACCESS_KEY_ID=
SECRET_ACCESS_KEY=
REGION=auto
```

`ADMIN_PASSWORD` precisa ter no mínimo 8 caracteres. O administrador é criado somente na primeira migração; novos deploys não redefinem sua senha.

## Publicação no Railway

1. Crie um projeto a partir do repositório GitHub.
2. Adicione PostgreSQL e Storage Bucket ao mesmo projeto.
3. Vincule as variáveis acima por referência na aplicação.
4. Gere um domínio público para a aplicação.

O arquivo `railway.json` executa a migração antes de cada versão entrar no ar e valida `/api/health` antes de trocar o tráfego.
