# Painel Observatório da Direita Radical e Extrema

Observatório cívico, com fontes, sobre o que governos da direita radical e extrema fazem no poder (Bukele, Jair Bolsonaro, PiS, Kast, Milei, Orbán e Trump), com o governo Lula (2023 a 2025) como comparação. Nasceu em 2026 como o painel "Flávio e os Parças"; o endereço antigo `/eoflavio/` redireciona para cá.

- **Site:** https://destrava-conversas.com.br/observatoriodireitaradical/
- **E a Economia?:** https://destrava-conversas.com.br/observatoriodireitaradical/economia/

## Princípios

- Toda ação listada tem fonte.
- Linguagem neutra, sem previsões e sem vínculo partidário.

## Estrutura

- `index.html`: estrutura e estilos do painel.
- `js/app.js`: a lógica do painel (filtros, resumo, imagens, busca).
- `data/acoes.js`: ações do placar (`PD.A`) e contexto (`PD.R`), uma por linha.
- `data/sinais.js`: os Sinais (`PD.NEWS`), um por linha.
- `data/fontes.js`: catálogo de fontes e semáforo (`PD.SRC`, `PD.TRUST_G`).
- `data/rede.js`: Quem são os parças: espectro, pilares, rede e fichas (`PD.PX`).
- `data/base.js`: parças, pautas e critérios.
- `og-parcas.jpg` e `economia/og-economia.jpg`: imagens de pré-visualização para redes sociais.
- `economia/index.html`: a página E a Economia?, com dados oficiais governo por governo.

## Licença

[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.pt-br): pode copiar, adaptar e compartilhar, inclusive para fins comerciais, citando o painel e o link do site e indicando se houve mudanças. Detalhes em `LICENSE`.

## Páginas geradas

- `node tools/build-sinais.js`: gera `sinais/` (lista e uma página por Sinal) a partir de `data/sinais.js`.
- `node tools/render-sinais.js`: gera as imagens dos Sinais que faltam (`--todas` refaz tudo). Precisa do Playwright.
- `python3 tools/build-paginas.py`: gera `quem-sao-eles/`, `metodo/` e `data/flavio.js` a partir dos trechos em `tools/paginas/` e do topo da home. Rode depois de mudar o topo da home ou um trecho.
