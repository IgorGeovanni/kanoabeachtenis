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

## Painel administrativo

O painel agora faz parte deste mesmo projeto, em `/admin` (ex.:
`https://seu-site.netlify.app/admin`). Ele pede uma senha simples antes de
entrar — está definida em `src/components/AdminGate.jsx` (senha padrão:
`kanoa2026`, troque antes de divulgar o link).

**Isso não é segurança de verdade.** É uma trava só para evitar acesso por
engano — como o código roda no navegador de quem acessa, dá para contornar.
O painel ainda funciona com dados fictícios (mock), então o risco hoje é
baixo, mas antes de ligar isso a dados reais de clientes (Supabase), troque
por autenticação de verdade — o cadastro de funcionários e permissões por
aba já está desenhado dentro do próprio painel, faltando só conectar a um
sistema de login real.

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
