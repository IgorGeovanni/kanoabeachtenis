# Kanoa — Agendamento de Quadra

Página pública onde o cliente escolhe data, horário e pacote para agendar a
quadra de beach tennis. Feita em React + Vite, pronta para deploy no Netlify.

**Estado atual:** os horários e pacotes vêm de dados fictícios em
`src/data/courtData.js` — ainda não está conectada ao Supabase. O fluxo
completo (data → horário → pacote → dados do cliente → confirmação) já
funciona e pode ser publicado hoje mesmo.

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
4. Clique em **Deploy**. Toda vez que você der `git push`, o site atualiza sozinho.

## Trocar nome, logo ou cores

Tudo fica em um único arquivo: `src/brand.js`. Trocar a logo é só substituir
o arquivo `src/assets/kanoa-logo.jpg` por outro com o mesmo nome (ou apontar
o `import` para o novo arquivo).

## Próximo passo: conectar ao Supabase

Quando quiser que os horários e agendamentos sejam reais (e não mais mock):

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Rode o schema SQL do sistema (tabelas `customers`, `products`, `bookings`,
   `settings` etc. — a modelagem completa sai no próximo passo do projeto).
3. No Netlify, adicione as variáveis de ambiente `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY` (Site settings → Environment variables).
4. Troque as funções de `src/data/courtData.js` para consultar o Supabase
   em vez do mock — o resto da interface não muda.

Nada na estrutura atual impede essa troca; os componentes só recebem dados
prontos, não sabem de onde eles vêm.
