-- Libera leitura pública só de configurações específicas e não-sensíveis
-- (mensagem do WhatsApp, ordem das categorias do cardápio, dados básicos da
-- empresa). Sem isso, o site público não consegue ler nada da tabela
-- settings — inclusive a mensagem de WhatsApp configurada nunca estava
-- sendo usada de verdade por causa disso, sempre caindo no texto padrão.
create policy "public read public settings" on public.settings
  for select using (key in ('whatsapp_message', 'menu_categories', 'company'));
