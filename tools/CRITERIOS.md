# Critérios editoriais do Painel (para quem atualiza, inclusive as rotinas automáticas)

## Regra de fonte
- Brasil: pelo menos uma fonte do grupo A (Folha, Estadão, O Globo, Valor, Correio Braziliense, g1, CNN Brasil, Band, UOL, SBT News, R7, Veja, piauí, Exame) ou das agências (Agência Brasil, Estadão Conteúdo, Folhapress, Agência O Globo, Reuters, AFP, AP, EFE, BBC, DW), ou fonte oficial (STF, TSE, PF, PGR, Senado, Câmara, Planalto, Portal da Transparência, ministérios, tribunais).
- Outros países: fonte verificável.
- Veículos de linha declarada (Gazeta do Povo, Oeste, Jovem Pan, Crusoé, CartaCapital, Brasil de Fato, Fórum, Metrópoles, Poder360) só como complemento.

## O que entra como Sinal
1. Fato, não opinião: ato, decisão, votação, documento ou declaração pública registrada.
2. Personagem com poder ou alcance: governante, parlamentar, candidato, dirigente partidário ou figura pública de grande alcance ligada aos governos observados. Nunca pessoas comuns nem familiares sem cargo.
3. Situação jurídica exata: investigado, denunciado, réu, condenado, com prisão decretada, foragido. "Criminoso" só para condenado.
4. Outro lado registrado (resposta da pessoa, da defesa ou do governo).
5. Fato em andamento: dizer o que está confirmado e por quem; usar "segundo aliados", "segundo a PF" até haver confirmação oficial.
6. Título pelo fato, não pela fala. Destaque com a contradição ou o dado. Argumento de bolso: sujeito com nome, verbo de ação, número ou fato verificável, sem adjetivo solto, sem rótulo ou xingamento.

## Métodos (aglutinadores)
Um método é um padrão de conduta descrito pela ciência política (régua: os quatro sinais de alerta de Levitsky e Ziblatt) que se repete em mais de um personagem ou país. Cada item pode ser marcado com um método e uma etapa.

### Método eleitoral: etapas
1. Duvidar das urnas (antes da eleição).
2. Atacar o árbitro (TSE, STF, autoridades eleitorais).
3. Não reconhecer a derrota.
4. Ruptura ou violência (golpe, invasões, ameaças de uso da força).
5. Pressão de fora (pedir ou celebrar sanções e tarifas estrangeiras contra o país).
6. Fugir e se dizer perseguido ("exílio").
7. Pedir anistia ou perdão.

No arquivo data/sinais.js, a etapa vai no campo `etapa` (número de 1 a 7). Ela escolhe o olho que ilustra a imagem do Sinal: 1 a 3 usam o olho de Regras do jogo, 4 o de Violência, 5 o de Pressão de fora, 6 o de Fuga e 7 o de Anistia. Sem etapa, vale o primeiro alerta; sem alerta, o olho padrão. As faixas ficam em img/olhos e saem da colagem de referência em tools/olhos-ref (tools/build-olhos-colagem.py; o muro azul antigo é tools/build-olhos.js).

### Para um item ganhar destaque (home, carrossel, topo)
- É novo (até 7 dias) ou é um marco: decisão judicial, condenação, prisão, fuga, votação.
- Mostra o padrão: liga-se a pelo menos outro item da mesma etapa, de outro personagem ou país.
- Tem argumento de bolso verificado contra a fonte.
- Tem alerta de "Regras do jogo" ou "Violência".

## Dossiês (em construção, ver tools/DOSSIES-classificacao.md e tools/DOSSIES-textos.md)
O painel tem duas frentes: Pautas de governo (ações que pioraram ou melhoraram) e Dossiês (provas). Os quatro dossiês seguem os sinais de alerta de Levitsky e Ziblatt: Regras do jogo, Adversário como inimigo, Violência e Liberdades.
- Prova é um Sinal ou uma ação que responde à pergunta de um dossiê. A mesma ação é um registro só: aparece na pauta e, se couber, no dossiê.
- Um Sinal só entra se responder à pergunta de pelo menos um dossiê. Notícia que não responde não entra, por mais relevante que seja. Sinais antigos que não se encaixam saem da linha principal, mas as páginas continuam no ar.
- Ampliações declaradas: Regras do jogo inclui o desprezo ao direito internacional; Adversário como inimigo inclui grupos desumanizados (orientação sexual, gênero, origem, raça, religião, deficiência); Violência inclui a força do Estado sem limite legal.
- Não há contraprova: o que não está no dossiê está fora. O "outro lado" de cada item continua obrigatório.
- Parlamentares, líderes e influenciadores entram por Sinais, com fonte do grupo A e situação jurídica exata. Atos coletivos (ex.: assédio eleitoral) exigem fonte institucional com números (MPT, TSE, tribunais).
- Desinformação só entra quando for sistemática (método), não uma fala isolada.
- "Se te disserem…" deixa de ser frente própria e vira o fecho de cada dossiê.
- Visual: Regras do jogo = raio na pupila; Adversário como inimigo = mira; Violência = olho vermelho com espinhos; Liberdades = risco cortando o olho.

## Formato do Sinal (desde 1/11/2026)
Cada Sinal em data/sinais.js tem, além dos campos antigos (t, s, why, src, bolso, bf, destaque, alerta, etapa, tags):
- `dossie`: lista com um ou mais de "regras", "inimigo", "violencia", "liberdades". Obrigatório: sem dossiê, o Sinal não entra.
- `tc`: título curto e objetivo, dizendo o comportamento e não a notícia (ex.: "Descumpre o STF e foge"). Pode ser ácido, mas exato: "criminoso" só para quem foi condenado; não afirmar o que a Justiça não confirmou.
- `r`: "o que é", em uma ou duas frases.
- `ol` e `olk`: uma linha de outro lado (`olk`: "Outro lado") ou, em fato já resolvido, a situação (`olk`: "Situação", ex.: "barrada", "concretizada", "condenação"). Se não houver resposta pública, deixar sem `ol`.
- `rsp` (opcional): id de uma resposta de "Se te disserem…" (tools/paginas/_respostas.html) que esse Sinal justifica.
- `pais`: lista dos países envolvidos, por extenso ("Brasil", "EUA", "Argentina"…). Alimenta o selo de país e o filtro "Brasil / Outros países" da lista de Sinais.
- `selo` (opcional): situação em destaque ao lado do número ("Em curso", "Barrada", "Contida"). "Barrada" e "Contida" ficam verdes: é a evidência de que as defesas funcionam.
- `quem` (opcional, recomendado em casos internacionais ou com vários personagens): lista de [nome, quem é, link opcional, rótulo do link]. Dizer o cargo exato (presidente, primeiro-ministro, chefe de Estado ou de governo), desde quando e a ligação com o grupo observado. Link "~/" é relativo à raiz do painel (ex.: "~/quem-sao-eles/#px-quem").
- `conv` (opcional): bloco "Para destravar a conversa", que substitui o argumento de bolso solto e o `rsp` naquele Sinal. Campos: `obj` (a objeção que circula de fato, entre aspas), `resp` (resposta curta, que caiba num comentário, de preferência pela sequência dos fatos), `fatos` ("Fatos que costumam aparecer na conversa": os fatos verdadeiros que o outro lado costuma citar, com fonte, recolocados na ordem dos acontecimentos; nunca "os dois lados têm razão", nunca contraprova) e `perg` (uma pergunta para abrir, que leve a pessoa a avaliar a regra, não o lado). Mesmo critério de fonte dos Sinais.
O texto longo (`t`, `s`, `why`) continua obrigatório: aparece recolhido em "Detalhes e atualizações" e guarda o histórico. Atualizações entram no fim de `s` ("Atualização (data): …"), sem apagar o que havia; `tc`, `r` e `ol` são revistos se o quadro mudar.
Imagens: tools/render-sinais.js gera sinal-NNN.png (escura) e sinal-NNN-claro.png (clara) com `tc` e `r`, além do og.jpg com `tc`.

## O que não entra
Boato, post sem confirmação, vida pessoal, previsão, ataque pessoal, conteúdo que só reproduz a provocação sem o fato que a contradiz.

## Ações (placar)
Ação de governo observado com fonte, classificada como "piorou" ou "melhorou" pelo critério da pauta (data/base.js, PD.CRITERIA), com o outro lado. Ações do Brasil ganham argumento de bolso.

## Se te disserem…
Frase que circula de fato (repetida por figuras públicas ou em redes), com resposta curta que se sustenta em dado e fonte já registrados ou novos do grupo A.

## Esperança (desde 4/11/2026)
Vitórias democráticas documentadas sobre a direita radical e extrema ou sobre governos que atacam as regras do jogo: eleição perdida e reconhecida, tentativa barrada de forma definitiva, poder recuperado pelo voto. Ficam em data/sinais.js com `esp` (numeração própria, "01", "02"…), `n` = "E" + número (ex.: "E01", que também é o endereço sinais/E01/), `tipo` "Esperança" e sem `dossie`. Aparecem na lista de Sinais com o filtro "★ Esperança", cartão amarelado e o rótulo "*01". Mesmo critério de fonte e de outro lado ("Situação") dos Sinais, e o bloco de conversa (`conv`) é recomendado. Descrever cada governo derrotado com o que as fontes dizem dele, sem rótulo que elas não usem.
