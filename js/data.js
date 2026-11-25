/* =========================================================
   Missão Bit — dados do jogo (cartas, missões, perguntas)
   Para criar novas missões ou perguntas, edite este arquivo.
   ========================================================= */

/* Ícone de pedra em SVG (o emoji de pedra não aparece em todo Windows 10) */
const ICON_ROCK = '<svg class="ico-rock" viewBox="0 0 40 32" aria-label="pedra"><path d="M4 26 C2 18 8 8 17 6 C26 3 36 10 37 19 C38 27 30 30 20 30 C11 30 5 30 4 26Z" fill="#8a8f9c" stroke="#4b505c" stroke-width="2"/><path d="M12 14 C15 11 19 11 22 12" stroke="#c4c8d2" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';

/* Tipos de carta = conceitos de programação (cor de cada carta) */
const KINDS = {
  mover:    { label: 'MOVER',    concept: 'Comando' },
  acao:     { label: 'AÇÃO',     concept: 'Passo do algoritmo' },
  caixa:    { label: 'CAIXA',    concept: 'Variável' },
  se:       { label: 'SE',       concept: 'Condição' },
  repita:   { label: 'REPITA',   concept: 'Repetição' },
  coringa:  { label: 'CORINGA',  concept: 'Criatividade' },
  surpresa: { label: 'SURPRESA', concept: 'Sorteio na hora de rodar' }
};

/* ---------------- Cartas de resposta ---------------- */
const CARDS = {
  /* Comandos de movimento (genéricos — podem ser duplicados) */
  dir_r: { kind: 'mover', icon: '➡️', text: 'Andar para a direita', code: 'direita()', dir: [0, 1], word: 'para a direita' },
  dir_l: { kind: 'mover', icon: '⬅️', text: 'Andar para a esquerda', code: 'esquerda()', dir: [0, -1], word: 'para a esquerda' },
  dir_u: { kind: 'mover', icon: '⬆️', text: 'Andar para cima', code: 'cima()', dir: [-1, 0], word: 'para cima' },
  dir_d: { kind: 'mover', icon: '⬇️', text: 'Andar para baixo', code: 'baixo()', dir: [1, 0], word: 'para baixo' },

  /* Missão: Ligar o carro */
  car_porta:  { kind: 'acao', task: 'carro', icon: '🚪', text: 'Abrir a porta', code: 'abrirPorta()', say: 'Bit abriu a porta do carro.',
                wrong: 'Bit já estava dentro do carro e abriu a porta de novo! 😅' },
  car_sentar: { kind: 'acao', task: 'carro', icon: '💺', text: 'Sentar no banco', code: 'sentar()', say: 'Bit sentou no banco do motorista.',
                wrong: 'Bit tentou sentar com a porta fechada e bateu o nariz no vidro! 🤕' },
  car_cinto:  { kind: 'acao', task: 'carro', icon: '🔒', text: 'Colocar o cinto', code: 'colocarCinto()', say: 'Clique! Cinto colocado.',
                wrong: 'Bit tentou colocar o cinto... do lado de fora do carro! 😂' },
  car_chave:  { kind: 'acao', task: 'carro', icon: '🔑', text: 'Girar a chave', code: 'girarChave()', say: 'VRUUUM! O carro ligou! 🚗',
                wrong: 'Opa! Sem estar sentado e de cinto, o carro não pode ligar! 🚨' },

  /* Missão: Juntar figurinhas (variáveis) */
  var_a:     { kind: 'caixa', task: 'figurinhas', icon: '📦', text: 'Caixa A recebe 2', code: 'A = 2',
               op: v => { v.A = 2; }, say: 'Guardou 2 figurinhas na caixa A.' },
  var_b:     { kind: 'caixa', task: 'figurinhas', icon: '📦', text: 'Caixa B recebe 3', code: 'B = 3',
               op: v => { v.B = 3; }, say: 'Guardou 3 figurinhas na caixa B.' },
  var_total: { kind: 'caixa', task: 'figurinhas', icon: '🧮', text: 'Caixa TOTAL recebe A + B', code: 'TOTAL = A + B',
               op: v => { v.TOTAL = v.A + v.B; }, say: v => `Somou A + B = ${v.TOTAL} e guardou na caixa TOTAL.`,
               wrong: 'A caixa A ou a caixa B ainda está vazia! O Computador não sabe quanto somar. 🤔' },
  var_show:  { kind: 'acao', task: 'figurinhas', icon: '🖥️', text: 'Mostrar a caixa TOTAL', code: 'mostrar(TOTAL)',
               say: v => `A tela mostrou: ${v.TOTAL}`,
               wrong: 'A caixa TOTAL está vazia! Apareceu... nada na tela. 😶' },

  /* Missão: Sol ou chuva? */
  cl_olhar:  { kind: 'acao', task: 'clima', icon: '👀', text: 'Olhar pela janela', code: 'olharJanela()',
               say: w => w.chuva ? 'Bit olhou pela janela: está chovendo! 🌧️' : 'Bit olhou pela janela: está fazendo sol! ☀️',
               wrong: 'Bit decidiu sem olhar pela janela! Como ele sabe se está chovendo? 🙈' },
  se_chuva:  { kind: 'se', task: 'clima', icon: '🌧️', text: 'SE estiver chovendo', code: 'se (chovendo)', q: 'Está chovendo?',
               cond: w => !!w.chuva, wrong: 'Esse SE apareceu na hora errada. Primeiro Bit precisa olhar o tempo! 🤔' },
  cl_guarda: { kind: 'acao', task: 'clima', icon: '☂️', text: 'Pegar o guarda-chuva', code: 'pegarGuardaChuva()', say: 'Bit pegou o guarda-chuva.',
               wrong: 'Bit pegou o guarda-chuva com um sol de rachar! 🥵' },
  senao:     { kind: 'se', icon: '↪️', text: 'SENÃO', code: 'senão', q: 'SENÃO',
               wrong: 'O SENÃO precisa vir depois de um SE e da ação dele.' },
  cl_bone:   { kind: 'acao', task: 'clima', icon: '🧢', text: 'Colocar o boné', code: 'colocarBone()', say: 'Bit colocou o boné.',
               wrong: 'Bit saiu na chuva só de boné e ficou encharcado! 💦' },

  /* Missão: Pedra no caminho (robô) */
  se_pedra: { kind: 'se', task: 'pedra', icon: ICON_ROCK, text: 'SE tiver pedra na frente', code: 'se (pedraNaFrente)', q: 'Tem pedra na frente?' },
  rb_tirar: { kind: 'acao', task: 'pedra', icon: '💪', text: 'Tirar a pedra', code: 'tirarPedra()' },

  /* Missão: Acender a luz */
  lz_ir:      { kind: 'acao', task: 'luz', icon: '🚶', text: 'Ir até o interruptor', code: 'irAteInterruptor()', say: 'Bit foi até o interruptor.',
                wrong: 'Bit já estava no interruptor e saiu andando de novo! 🚶' },
  lz_apertar: { kind: 'acao', task: 'luz', icon: '👆', text: 'Apertar o interruptor', code: 'apertarInterruptor()',
                say: w => w.queimada ? 'Click! ... A luz não acendeu. 🌑' : 'Click! A luz acendeu! 💡',
                wrong: 'Bit apertou o ar! Ele ainda não chegou no interruptor. 😅' },
  se_apagada: { kind: 'se', task: 'luz', icon: '🌑', text: 'SE a luz não acender', code: 'se (luzApagada)', q: 'A luz ficou apagada?',
                cond: w => !!w.queimada, wrong: 'Como saber se a luz acendeu antes de apertar o interruptor? 🤔' },
  lz_trocar:  { kind: 'acao', task: 'luz', icon: '💡', text: 'Trocar a lâmpada', code: 'trocarLampada()', say: 'Bit trocou a lâmpada. Agora a luz acendeu! 💡',
                wrong: 'Bit trocou a lâmpada sem nem testar se ela funcionava! 🤷' },

  /* Missão: Até a porta (repetição) */
  rep3:     { kind: 'repita', task: 'porta', icon: '🔁', text: 'REPITA 3 vezes', code: 'repita 3 vezes', times: 3 },
  rb_bater: { kind: 'acao', task: 'porta', icon: '✊', text: 'Bater na porta', code: 'baterNaPorta()' },

  /* Cartas pegadinha: parecem válidas, mas geram bugs engraçados */
  x_dormir:  { kind: 'acao', icon: '😴', text: 'Dormir de novo', code: 'dormir()', bug: 'Bit dormiu no meio do programa! Zzzz... 😴' },
  x_dancar:  { kind: 'acao', icon: '💃', text: 'Dançar', code: 'dancar()', bug: 'Bit começou a dançar no meio da missão! 💃' },
  x_buzinar: { kind: 'acao', icon: '📯', text: 'Buzinar', code: 'buzinar()', bug: 'BIII-BIII! Bit buzinou sem motivo e assustou o gato! 🐱' },
  x_latir:   { kind: 'acao', icon: '🐶', text: 'Latir como cachorro', code: 'latir()', bug: 'AU AU! O Computador fez exatamente o que mandaram... 🐶' },
  x_pular:   { kind: 'acao', icon: '🦶', text: 'Pular num pé só', code: 'pularNumPe()', bug: 'Bit ficou pulando num pé só e esqueceu a missão! 🦶' },
  x_bocejar: { kind: 'acao', icon: '😪', text: 'Bocejar', code: 'bocejar()', bug: 'Bit bocejou bem alto: AAAAHHH! E não fez a missão. 😪' },

  /* Coringa */
  coringa: { kind: 'coringa', icon: '⭐', text: 'Invente uma instrução!', code: '???' }
};
Object.keys(CARDS).forEach(id => { CARDS[id].id = id; });

/* ---------------- Cartas surpresa (sorteadas ao rodar) ---------------- */
const SURPRISES = {
  s_sol:      { icon: '☀️', text: 'Está fazendo SOL', group: 'Clima' },
  s_chuva:    { icon: '🌧️', text: 'Está CHOVENDO', group: 'Clima' },
  s_pedra:    { icon: ICON_ROCK, text: 'Caiu uma PEDRA no caminho', group: 'Caminho' },
  s_livre:    { icon: '✅', text: 'Caminho LIVRE', group: 'Caminho' },
  s_boa:      { icon: '💡', text: 'Lâmpada FUNCIONANDO', group: 'Lâmpada' },
  s_queimada: { icon: '🌑', text: 'Lâmpada QUEIMADA', group: 'Lâmpada' }
};

/* ---------------- Missões (baralho do professor) ---------------- */
const TASKS = [
  {
    id: 'labirinto', n: 1, icon: '🤖', title: 'Labirinto do Bit', concept: 'Algoritmo', ckind: 'mover',
    story: 'Bit está sem energia! Leve o Bit até a bateria sem bater na parede.',
    type: 'robot',
    grid: { rows: 3, cols: 3, start: [2, 0], goal: [0, 2], walls: [[1, 1]] },
    slots: 4,
    solutions: [['dir_u', 'dir_u', 'dir_r', 'dir_r'], ['dir_r', 'dir_r', 'dir_u', 'dir_u']],
    pool: ['dir_u', 'dir_u', 'dir_r', 'dir_r', 'dir_l', 'dir_d', 'x_dancar'],
    learn: 'Algoritmo é uma sequência de passos em ordem. E aqui existem DOIS caminhos certos!',
    tip: 'Ande de verdade pela sala como o Bit. Se baterem na parede, faça um "BUM!" bem dramático.',
    win: () => 'Bit chegou na bateria e recarregou! 🔋⚡'
  },
  {
    id: 'carro', n: 2, icon: '🚗', title: 'Ligar o carro', concept: 'Algoritmo', ckind: 'acao',
    story: 'A família vai passear! Ajude o Bit a ligar o carro, um passo de cada vez.',
    type: 'seq',
    solutions: [['car_porta', 'car_sentar', 'car_cinto', 'car_chave']],
    pool: ['car_porta', 'car_sentar', 'car_cinto', 'car_chave', 'x_buzinar', 'x_dormir'],
    learn: 'A ordem dos passos importa! Se trocar a ordem, o programa dá bug.',
    tip: 'Use uma cadeira como carro. Se vestirem o cinto antes de sentar, tente colocar o cinto em pé, no ar.',
    win: () => 'O carro ligou e a família foi passear! 🚗💨'
  },
  {
    id: 'figurinhas', n: 3, icon: '➕', title: 'Juntar figurinhas', concept: 'Variável', ckind: 'caixa',
    story: 'Ana tinha 2 figurinhas e ganhou 3 do amigo. Use as CAIXAS para o Computador contar quantas ela tem agora!',
    type: 'seq', vars: true,
    solutions: [['var_a', 'var_b', 'var_total', 'var_show'], ['var_b', 'var_a', 'var_total', 'var_show']],
    pool: ['var_a', 'var_b', 'var_total', 'var_show', 'x_pular', 'x_bocejar'],
    learn: 'Variável é uma caixa com nome que guarda um valor. O valor pode mudar!',
    tip: 'Leve 3 caixinhas com etiquetas A, B e TOTAL e coloque figurinhas de papel dentro.',
    win: v => `Ana tem ${v.TOTAL} figurinhas! 🎉`
  },
  {
    id: 'clima', n: 4, icon: '☀️', title: 'Sol ou chuva?', concept: 'Condição', ckind: 'se',
    story: 'Bit vai brincar no parque. Antes de sair, ele precisa ver como está o tempo!',
    type: 'seq',
    worlds: [{ chuva: true }, { chuva: false }],
    surprise: w => w.chuva ? 's_chuva' : 's_sol',
    solutions: [['cl_olhar', 'se_chuva', 'cl_guarda', 'senao', 'cl_bone']],
    pool: ['cl_olhar', 'se_chuva', 'cl_guarda', 'senao', 'cl_bone', 'x_dancar'],
    learn: 'O SE faz o programa tomar decisões. O mesmo programa funciona com sol E com chuva!',
    tip: 'Rode o programa duas vezes: vire a carta Surpresa de Sol e depois a de Chuva.',
    win: w => w.chuva ? 'Bit foi ao parque com guarda-chuva e ficou sequinho! ☂️' : 'Bit foi ao parque de boné, protegido do sol! 🧢'
  },
  {
    id: 'pedra', n: 5, icon: '🔋', title: 'Pedra no caminho', concept: 'Condição', ckind: 'se',
    story: 'A bateria está no fim do caminho. Às vezes cai uma pedra no meio! O programa precisa funcionar nos dois casos.',
    type: 'robot',
    grid: { rows: 1, cols: 4, start: [0, 0], goal: [0, 3], rockAt: [0, 2] },
    worlds: [{ rock: true }, { rock: false }],
    surprise: w => w.rock ? 's_pedra' : 's_livre',
    slots: 5,
    solutions: [['dir_r', 'se_pedra', 'rb_tirar', 'dir_r', 'dir_r']],
    pool: ['dir_r', 'dir_r', 'dir_r', 'se_pedra', 'rb_tirar', 'dir_l', 'x_latir'],
    learn: 'O SE só faz a ação quando a condição é verdadeira. Sem pedra, Bit pula o "Tirar a pedra".',
    tip: 'Coloque um estojo no chão como pedra. Rode com e sem a pedra.',
    win: () => 'Bit chegou na bateria! 🔋⚡'
  },
  {
    id: 'luz', n: 6, icon: '💡', title: 'Acender a luz', concept: 'Condição', ckind: 'se',
    story: 'O quarto está escuro! Ajude o Bit a acender a luz. Cuidado: a lâmpada pode estar queimada.',
    type: 'seq',
    worlds: [{ queimada: true }, { queimada: false }],
    surprise: w => w.queimada ? 's_queimada' : 's_boa',
    solutions: [['lz_ir', 'lz_apertar', 'se_apagada', 'lz_trocar']],
    pool: ['lz_ir', 'lz_apertar', 'se_apagada', 'lz_trocar', 'x_bocejar', 'x_dormir'],
    learn: 'Primeiro testamos (apertar), depois decidimos (SE). É assim que o computador pensa!',
    tip: 'Apague e acenda a luz da sala de verdade quando o programa rodar.',
    win: () => 'O quarto ficou iluminado! 💡'
  },
  {
    id: 'porta', n: 7, icon: '🚪', title: 'Até a porta', concept: 'Repetição', ckind: 'repita',
    story: 'Bit precisa andar 3 casas e bater na porta. Mas só cabem 3 cartas no programa! Como fazer?',
    type: 'robot',
    grid: { rows: 1, cols: 4, start: [0, 0], goal: [0, 3], door: true },
    needKnock: true,
    slots: 3,
    solutions: [['rep3', 'dir_r', 'rb_bater']],
    pool: ['rep3', 'dir_r', 'dir_r', 'dir_r', 'rb_bater', 'x_pular'],
    learn: 'REPITA faz a mesma coisa várias vezes. Com ele, o programa fica bem menor!',
    tip: 'Pergunte à turma: sem o REPITA, quantas cartas seriam necessárias?',
    win: () => 'TOC TOC! Abriram a porta para o Bit! 🚪😄'
  }
];

/* ---------------- Perguntas da área de estudo ---------------- */
const QCATS = ['Algoritmo', 'Variável', 'Condição', 'Repetição', 'Bugs', 'Jogo das cartas'];

/* v = visual opcional: { grid: {rows, cols, cells: {"r,c": "conteúdo"}} } */
const QUESTIONS = [
  /* Algoritmo */
  { cat: 'Algoritmo', q: 'O que é um algoritmo?', o: ['Uma sequência de passos para resolver um problema', 'Um tipo de robô', 'Um jogo de videogame', 'Uma conta de matemática difícil'], a: 0,
    e: 'Algoritmo é como uma receita: passos em ordem para chegar a um resultado.' },
  { cat: 'Algoritmo', q: 'Qual é a ordem certa para escovar os dentes?', o: ['Pegar a escova → Colocar pasta → Escovar → Enxaguar', 'Escovar → Pegar a escova → Enxaguar → Colocar pasta', 'Enxaguar → Escovar → Colocar pasta → Pegar a escova'], a: 0,
    e: 'Cada passo depende do anterior. Não dá para escovar sem pegar a escova!' },
  { cat: 'Algoritmo', q: 'Bit quer comer um sanduíche. Qual passo vem PRIMEIRO?', o: ['Pegar o pão', 'Dar uma mordida', 'Lavar o prato'], a: 0,
    e: 'Primeiro pegamos o pão. Lavar o prato fica para o final!' },
  { cat: 'Algoritmo', q: 'O computador faz o quê?', o: ['Exatamente o que a gente manda', 'O que ele acha melhor', 'O que a gente pensa, sem precisar falar'], a: 0,
    e: 'O computador segue as instruções ao pé da letra. Por isso a ordem e os detalhes importam.' },
  { cat: 'Algoritmo', q: 'Bit está no 🟦 e a bateria está 3 casas à direita. Qual programa leva Bit até a bateria?',
    v: { grid: { rows: 1, cols: 4, cells: { '0,0': 'BIT', '0,3': '🔋' } } },
    o: ['➡️ ➡️ ➡️', '⬅️ ⬅️ ⬅️', '⬆️ ⬆️ ⬆️', '➡️ ⬇️ ➡️'], a: 0, e: 'São 3 passos para a direita: ➡️ ➡️ ➡️.' },
  { cat: 'Algoritmo', q: 'Bit segue o programa ➡️ ➡️ ⬆️. Em qual letra ele para?',
    v: { grid: { rows: 3, cols: 3, cells: { '2,0': 'BIT', '0,2': 'A', '1,2': 'B', '2,2': 'C' } } },
    o: ['A', 'B', 'C'], a: 1, e: 'Duas casas para a direita (chega no C) e uma para cima: B!' },
  { cat: 'Algoritmo', q: 'Existe só UM jeito certo de resolver um problema?', o: ['Não! Podem existir vários algoritmos certos', 'Sim, sempre só um'], a: 0,
    e: 'No Labirinto do Bit, dá para ir por cima ou pela direita. Os dois funcionam!' },

  /* Variável */
  { cat: 'Variável', q: 'O que é uma variável?', o: ['Uma caixa com nome que guarda um valor', 'Um erro no programa', 'Um botão do teclado', 'Um tipo de robô'], a: 0,
    e: 'Variável é uma caixa com etiqueta (o nome) e algo guardado dentro (o valor).' },
  { cat: 'Variável', q: 'A caixa PONTOS tem 5. Você ganhou +2. Quanto tem na caixa agora?', v: { box: { name: 'PONTOS', value: '5 + 2' } }, o: ['7', '5', '2', '52'], a: 0,
    e: '5 + 2 = 7. O valor da caixa mudou! Por isso se chama VARIÁVEL.' },
  { cat: 'Variável', q: 'A = 2, B = 3, TOTAL = A + B. Quanto vale TOTAL?', o: ['5', '23', '6', '1'], a: 0,
    e: 'O Computador abre as caixas: 2 + 3 = 5.' },
  { cat: 'Variável', q: 'Qual o melhor nome para a caixa que guarda a sua idade?', o: ['IDADE', 'XYZ', 'BANANA', 'CAIXA1'], a: 0,
    e: 'Um bom nome explica o que está guardado dentro da caixa.' },
  { cat: 'Variável', q: 'A caixa VIDAS tinha 3. Bit perdeu 1 vida. Quanto tem agora?', v: { box: { name: 'VIDAS', value: '3 − 1' } }, o: ['2', '3', '4', '0'], a: 0,
    e: '3 − 1 = 2 vidas.' },
  { cat: 'Variável', q: 'Uma variável pode mudar de valor?', o: ['Sim! Por isso se chama VARIÁVEL', 'Não, nunca muda'], a: 0,
    e: 'Variável vem de "variar", que quer dizer mudar.' },

  /* Condição */
  { cat: 'Condição', q: 'SE estiver chovendo, Bit pega o guarda-chuva. Hoje está sol ☀️. O que Bit faz?', o: ['Não pega o guarda-chuva', 'Pega o guarda-chuva', 'Fica em casa chorando'], a: 0,
    e: 'A condição "está chovendo" é FALSA, então Bit pula a ação.' },
  { cat: 'Condição', q: 'SE o semáforo estiver vermelho 🔴, ENTÃO...', o: ['Pare', 'Acelere', 'Buzine'], a: 0, e: 'Vermelho significa PARE!' },
  { cat: 'Condição', q: 'SE tiver pedra, tire a pedra. Não tem pedra. O que Bit faz?', o: ['Segue o programa sem tirar nada', 'Tira a pedra mesmo assim', 'Para tudo'], a: 0,
    e: 'Sem pedra, a condição é falsa e Bit pula o "Tirar a pedra".' },
  { cat: 'Condição', q: 'Para que serve o SE em um programa?', o: ['Para o programa tomar decisões', 'Para repetir coisas', 'Para guardar números'], a: 0,
    e: 'O SE testa uma pergunta (sim ou não) e escolhe o que fazer.' },
  { cat: 'Condição', q: 'SE a nota for maior que 7, mostre "Parabéns!". A nota foi 9. O que aparece?', o: ['Parabéns!', 'Nada', 'Erro'], a: 0,
    e: '9 é maior que 7, então a condição é verdadeira.' },
  { cat: 'Condição', q: 'SE estiver chovendo, pegue o guarda-chuva. SENÃO, coloque o boné. Está chovendo 🌧️. O que Bit faz?', o: ['Pega o guarda-chuva', 'Coloca o boné', 'Os dois'], a: 0,
    e: 'Com a condição verdadeira, faz o SE. O SENÃO só roda quando a condição é falsa.' },

  /* Repetição */
  { cat: 'Repetição', q: 'REPITA 3 vezes: bater palmas 👏. Quantas palmas Bit bate?', o: ['3', '1', '6', '0'], a: 0, e: 'O REPITA faz a mesma ação 3 vezes.' },
  { cat: 'Repetição', q: 'Qual é o jeito mais curto de mandar Bit pular 10 vezes?', o: ['REPITA 10 vezes: pular', 'Escrever "pular" 10 vezes', 'Pular 1 vez'], a: 0,
    e: 'Com o REPITA, uma carta faz o trabalho de 10!' },
  { cat: 'Repetição', q: 'REPITA 2 vezes: ➡️. Quantas casas Bit anda?', o: ['2', '1', '4'], a: 0, e: 'Duas vezes para a direita = 2 casas.' },
  { cat: 'Repetição', q: 'REPITA 4 vezes: comer 1 biscoito 🍪. Quantos biscoitos Bit come?', o: ['4', '1', '5'], a: 0, e: '4 repetições = 4 biscoitos. Que fome!' },

  /* Bugs */
  { cat: 'Bugs', q: 'O que é um bug?', o: ['Um erro no programa', 'Um inseto de verdade', 'Um botão do computador'], a: 0,
    e: 'Bug é um erro no programa. Achar e consertar faz parte do trabalho de quem programa.' },
  { cat: 'Bugs', q: 'Bit devia: Abrir a porta → Sair → Fechar a porta. Ele fez: Sair → Abrir a porta → Fechar. Onde está o bug?', o: ['Sair veio antes de abrir a porta', 'Fechar a porta está errado', 'Não tem bug'], a: 0,
    e: 'Bit tentou sair com a porta fechada! A ordem está trocada.' },
  { cat: 'Bugs', q: 'Quando achamos um bug, o que fazemos?', o: ['Procuramos o erro e consertamos', 'Desligamos o computador para sempre', 'Fingimos que não vimos'], a: 0,
    e: 'Consertar bugs se chama DEPURAR. Todo programador faz isso!' },
  { cat: 'Bugs', q: 'O programa do Bit tem uma carta "Dançar" no meio da missão. O que acontece?', o: ['Bit dança no meio da missão, porque o Computador faz o que mandam', 'O Computador ignora a carta', 'Bit escolhe não dançar'], a: 0,
    e: 'O Computador não pensa sozinho: se está no programa, ele faz!' },

  /* Jogo das cartas */
  { cat: 'Jogo das cartas', q: 'No Missão Bit, qual é a cor das cartas de CAIXA (variável)?', o: ['Amarela', 'Verde', 'Vermelha', 'Azul'], a: 0,
    e: 'Amarela = CAIXA, Verde = SE, Vermelha = REPITA, Azul = AÇÃO e MOVER.' },
  { cat: 'Jogo das cartas', q: 'No jogo, quem faz o papel do Computador?', o: ['O professor', 'O aluno mais alto', 'Ninguém'], a: 0,
    e: 'O professor roda o programa e faz exatamente o que as cartas mandam.' },
  { cat: 'Jogo das cartas', q: 'Qual carta usamos quando Bit precisa fazer a mesma coisa várias vezes?', o: ['REPITA (vermelha)', 'SE (verde)', 'CAIXA (amarela)'], a: 0,
    e: 'A carta REPITA repete a carta que vem logo depois dela.' },
  { cat: 'Jogo das cartas', q: 'A carta verde SE serve para...', o: ['Tomar decisões', 'Andar para a direita', 'Guardar números'], a: 0,
    e: 'SE testa uma condição, como "está chovendo?".' },
  { cat: 'Jogo das cartas', q: 'Para ligar o carro, qual carta vem DEPOIS de "Sentar no banco"?', o: ['Colocar o cinto', 'Abrir a porta', 'Buzinar'], a: 0,
    e: 'Abrir a porta → Sentar no banco → Colocar o cinto → Girar a chave.' },
  { cat: 'Jogo das cartas', q: 'O que faz a carta SURPRESA?', o: ['Decide na hora se tem chuva, pedra ou lâmpada queimada', 'Faz o Bit dançar', 'Termina o jogo'], a: 0,
    e: 'Ela mostra por que precisamos do SE: o programa não sabe antes o que vai acontecer.' },
  { cat: 'Jogo das cartas', q: 'Na missão "Até a porta" só cabem 3 cartas. Como Bit anda 3 casas e ainda bate na porta?', o: ['REPITA 3 vezes ➡️ e depois Bater na porta', '➡️ ➡️ ➡️ e pronto', 'Bater na porta 3 vezes'], a: 0,
    e: 'O REPITA economiza cartas e sobra espaço para bater na porta.' }
];
