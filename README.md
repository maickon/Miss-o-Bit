# Missão Bit

Jogo de cartas para ensinar lógica de programação a crianças (8 anos ou mais): algoritmo, variável, condição (SE/SENÃO) e repetição (REPITA).
O site é feito só com HTML, CSS e JavaScript, sem build, e pode ser hospedado no GitHub Pages.

## O que tem no app

- **Jogar**: 7 missões com o robô Bit. A turma monta o programa carta por carta e o "Computador" roda o programa passo a passo, parando na linha do bug.
- **Estudar**: quiz de múltipla escolha com 34 perguntas em 6 temas (10 por rodada, com pontos, sequência de acertos e medalha).
- **Professor**: área com senha para imprimir as cartas (63 × 88 mm, 9 por folha A4) e o gabarito.

Senha padrão do professor: **`bit2026`**. Dá para trocar dentro da área do professor; a nova senha fica salva só no navegador onde foi trocada.
> Em um site estático a senha só impede o acesso de curiosos. Não guarde nada secreto aqui.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (por exemplo `missao-bit`).
2. Envie o conteúdo desta pasta para a raiz do repositório:
   ```
   git init
   git add .
   git commit -m "Missão Bit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/missao-bit.git
   git push -u origin main
   ```
3. No GitHub, abra **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)` e salve.
4. Em 1 ou 2 minutos o site estará em `https://SEU-USUARIO.github.io/missao-bit/`.

Pelo endereço do GitHub Pages, o app pode ser **instalado** no celular ou no PC ("Adicionar à tela inicial" ou "Instalar app" no navegador) e funciona **offline** depois da primeira visita.

Ao alterar arquivos depois de publicado, aumente a versão em `sw.js` (ex.: `missao-bit-v2` → `missao-bit-v3`) para os aparelhos baixarem a versão nova.

## Testar no computador sem internet

Basta abrir o `index.html` com dois cliques. Tudo funciona, menos a instalação como app (isso precisa do endereço https).

## Imprimir as cartas

Entre em **Professor**, marque o que quer imprimir e clique em **Imprimir / salvar PDF**.
Na janela de impressão escolha papel **A4**, margens **Nenhuma** e marque **Gráficos de plano de fundo**.

## Estrutura

```
index.html            página única do app
css/style.css         visual (tema claro/escuro, celular, impressão)
js/data.js            cartas, missões e perguntas (edite aqui para criar novas)
js/app.js             lógica do jogo, quiz e área do professor
manifest.webmanifest  dados do app instalável
sw.js                 modo offline
icons/                ícones do app
```
