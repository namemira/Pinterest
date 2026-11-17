# Clone do Pinterest – Desenvolvimento Web I

Projeto acadêmico do Instituto Federal Catarinense – Campus Concórdia (Trabalho III, disciplina Desenvolvimento Web I, prof. Alisson Borges Zanetti).

> Clone feito apenas para fins educacionais, **sem vínculo com a Pinterest, Inc.** Todos os usuários, Pins e mensagens exibidos são fictícios.

## Site reproduzido

[Pinterest](https://br.pinterest.com): rede social para descobrir, salvar e organizar ideias em Pins e pastas.

## Integrantes

- Jéssica Rubas
- Nicole Bet
- Samira Vieira

## Descrição

Mock funcional (front-end) feito com HTML5, CSS3 e JavaScript puro, sem frameworks.

### Páginas

| Página | Arquivo | O que tem |
|---|---|---|
| Inicial | `html/Inicial.html` | Apresentação do site, busca nas seções e formulário de cadastro |
| Login | `html/Login.html` | Formulário de login com validação e mostrar/ocultar senha |
| Cadastro | `html/Cadastro.html` | Formulário de cadastro com validação |
| Principal (feed) | `html/Principal.html` | Feed de Pins, menu do perfil e painel Criar |
| Explorar | `html/Explore.html` | Categorias, tendências e Pins gerados por JavaScript |
| Perfil / Pastas | `html/Perfil.html` | Pins salvos e pastas, com filtros |
| Criar Pin | `html/CriarPin.html` | Formulário para publicar um Pin com imagem |
| Configurações | `html/Configuracao.html` | Edição de perfil (tabela + formulário) e tema claro/escuro |

### Funcionalidades em JavaScript

- Validação dos formulários com mensagens na própria página (sem `alert`)
- Menu lateral responsivo, que abre e fecha no celular
- Busca com sugestões e filtro de Pins
- Pins e categorias gerados a partir de arrays de objetos
- Pastas e Pins salvos no `localStorage`
- Modais (detalhes do Pin, avisos, criação de colagem e cartão)
- Alternância entre tema claro e escuro

### Organização das pastas

```
index.html      → redireciona para html/Inicial.html
html/           → páginas
css/            → folhas de estilo
js/             → scripts
Imagens/        → imagens usadas no site
PROMPTS.md      → registro do uso de IA
```

## Como usar

- **Online (GitHub Pages):** https://namemira.github.io/Pinterest/
- **No computador:** baixe ou clone o repositório e abra o `index.html` no navegador. Não precisa instalar nada.

Nesta etapa os formulários são validados apenas no navegador. O cadastro, o login e o salvamento de dados no banco serão feitos com PHP e MySQL na Parte 3.
