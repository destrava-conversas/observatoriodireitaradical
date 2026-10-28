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

No arquivo data/sinais.js, a etapa vai no campo `etapa` (número de 1 a 7). Ela escolhe o olho que ilustra a imagem do Sinal: 1 a 3 usam o olho de Regras do jogo, 4 o de Violência, 5 o de Pressão de fora, 6 o de Fuga e 7 o de Anistia. Sem etapa, vale o primeiro alerta; sem alerta, o olho padrão. As faixas ficam em img/olhos (tools/build-olhos.js).

### Para um item ganhar destaque (home, carrossel, topo)
- É novo (até 7 dias) ou é um marco: decisão judicial, condenação, prisão, fuga, votação.
- Mostra o padrão: liga-se a pelo menos outro item da mesma etapa, de outro personagem ou país.
- Tem argumento de bolso verificado contra a fonte.
- Tem alerta de "Regras do jogo" ou "Violência".

## O que não entra
Boato, post sem confirmação, vida pessoal, previsão, ataque pessoal, conteúdo que só reproduz a provocação sem o fato que a contradiz.

## Ações (placar)
Ação de governo observado com fonte, classificada como "piorou" ou "melhorou" pelo critério da pauta (data/base.js, PD.CRITERIA), com o outro lado. Ações do Brasil ganham argumento de bolso.

## Se te disserem…
Frase que circula de fato (repetida por figuras públicas ou em redes), com resposta curta que se sustenta em dado e fonte já registrados ou novos do grupo A.
