# Kanoa — Agendamento de Quadra

Página pública onde o cliente escolhe data, horário e pacote para agendar a
quadra de beach tennis. Feita em React + Vite, conectada de verdade ao
Supabase (banco de dados). Pronta para deploy no Netlify.

**Estado atual:** o site público (data → horário → pacote → dados do
cliente → confirmação) já lê e grava dados reais no Supabase — produtos,
turnos por dia da semana e agendamentos, com bloqueio de conflito de
horário de verdade. O painel em `/admin` ainda usa dados fictícios (mock) e
uma senha simples — essa é a próxima parte a conectar.

## Configurar as chaves do Supabase (obrigatório)

O projeto não funciona sem isso — nem localmente, nem publicado.

**Localmente:** copie `.env.example` para um novo arquivo chamado `.env` na
raiz do projeto, e preencha com os valores do seu projeto Supabase (em
Project Settings → API):

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

O `.env` já está no `.gitignore` — ele nunca é enviado ao GitHub.

**No Netlify:** vá em Site configuration → Environment variables → Add a
variable, e cadastre as duas mesmas variáveis (`VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY`) com os mesmos valores. Depois, em Deploys →
Trigger deploy → Deploy site, para o site publicado passar a usar essas
variáveis (elas só entram em builds novos, não nos já publicados).

A anon key é feita para ser pública — ela vai parar no código do site de
qualquer forma, protegida pelas regras de segurança (RLS) do banco. Nunca
use a `service_role key` aqui.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Colocar no GitHub

```bash
git init
git add .
git commit -m "Página pública de agendamento - Kanoa"
git branch -M main
git remote add origin <URL_DO_SEU_REPOSITORIO>
git push -u origin main
```

## Publicar no Netlify

1. Em [app.netlify.com](https://app.netlify.com), clique em **Add new site → Import an existing project**.
2. Conecte o repositório do GitHub que você acabou de criar.
3. O Netlify já vai detectar as configurações pelo arquivo `netlify.toml`
   (comando `npm run build`, pasta publicada `dist`). Não precisa mexer em nada.
4. Adicione as variáveis de ambiente do Supabase (veja a seção acima) antes
   ou depois do primeiro deploy — só lembre de disparar um novo deploy
   depois de adicioná-las.
5. Clique em **Deploy**. Toda vez que você der `git push`, o site atualiza sozinho.

## Banco de dados (Supabase)

O schema completo está em `supabase/schema.sql` — cole no SQL Editor do
Supabase e rode uma vez. Ele cria as tabelas, as regras de segurança (RLS)
e as duas funções que o site usa: `get_available_slots` (consulta horários
sem expor dados de cliente) e `create_booking` (cria o agendamento de forma
segura, impedindo conflito de horário e evitando cliente duplicado).

## Trocar nome, logo ou cores

Tudo fica em um único arquivo: `src/brand.js`. Trocar a logo é só substituir
o arquivo `src/assets/kanoa-logo.jpg` por outro com o mesmo nome (ou apontar
o `import` para o novo arquivo).

## Painel administrativo

O painel faz parte deste mesmo projeto, em `/admin` (ex.:
`https://seu-site.netlify.app/admin`). O login agora é real, via Supabase
Auth — não existe mais senha fixa no código.

**Já conectado ao banco de verdade:** Dashboard (indicadores reais),
Agenda (agendamentos reais, com cancelamento), Clientes/CRM (com clube de
mensalidade), Planos da Quadra, Produtos do Bar, Vendas, e Configurações
(turnos por dia da semana, dados da empresa, mensagem do WhatsApp e
funcionários).

**Ainda não conectado:** Mesas/Comandas — esse módulo precisa de tabelas
novas no banco (`tables`, `table_sessions`, `order_items`) que não fizeram
parte do schema inicial. Relatórios continua sendo só a estrutura (por
design — as regras de cada relatório ainda não foram definidas).

### Como cadastrar um funcionário

1. No Supabase, vá em **Authentication → Users → Add user** e crie o
   e-mail/senha da pessoa.
2. Copie o **User UID** dela.
3. No painel, entre como dono → **Configurações → Funcionários → Novo
   funcionário** → cole o UID, dê um nome, marque as abas permitidas.

O dono (`is_owner = true` na tabela `staff`) sempre tem acesso completo,
independente das permissões marcadas.

## Próximo passo: módulo de Mesas / Comandas

Quando quiser seguir com o bar: um novo pedaço de SQL cria as tabelas de
mesas e comandas, e a tela de Mesas passa a funcionar com dados reais do
mesmo jeito que o resto do painel já funciona hoje.
