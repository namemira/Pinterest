Clone do Pinterest – Desenvolvimento Web I

Projeto acadêmico desenvolvido para o Trabalho III da disciplina Desenvolvimento Web I, ministrada pelo professor Alisson Borges Zanetti no Instituto Federal Catarinense, Campus Concórdia.

Este projeto tem finalidade exclusivamente educacional e não possui vínculo com a Pinterest, Inc. Os usuários, Pins e mensagens apresentados são fictícios.

## Sobre o site de referência

[Pinterest](https://br.pinterest.com) é uma rede social que permite descobrir, salvar e organizar ideias em Pins e pastas.

## Integrantes

- Jéssica Rubas
- Nicole Bet
- Samira Vieira

## Descrição do projeto

Protótipo funcional de interface, desenvolvido com HTML5, CSS3 e JavaScript, sem o uso de frameworks.

### Páginas

| Página | Arquivo | Descrição |
|---|---|---|
| Inicial | `html/Inicial.html` | Apresentação do site, busca entre seções e formulário de cadastro |
| Login | `html/Login.html` | Formulário de acesso com validação e opção para exibir ou ocultar a senha |
| Cadastro | `html/Cadastro.html` | Formulário de cadastro com validação |
| Página principal | `html/Principal.html` | Feed de Pins, menu do perfil e painel de criação |
| Explorar | `html/Explore.html` | Categorias, tendências e Pins gerados por JavaScript |
| Perfil e pastas | `html/Perfil.html` | Pins salvos e pastas, com opções de filtragem |
| Criação de Pin | `html/CriarPin.html` | Formulário para publicar um Pin com imagem |
| Configurações | `html/Configuracao.html` | Edição do perfil e seleção entre os temas claro e escuro |

### Funcionalidades em JavaScript

- Validação de formulários com mensagens exibidas na própria página
- Menu lateral responsivo, com controles de abertura e fechamento em dispositivos móveis
- Busca com sugestões e filtragem de Pins
- Geração de Pins e categorias a partir de arrays de objetos
- Armazenamento de pastas e Pins no `localStorage`
- Janelas modais para detalhes de Pins, avisos e criação de colagens e cartões
- Alternância entre os temas claro e escuro

### Organização das pastas

```
index.html      Página de entrada, que direciona para html/Inicial.html
html/           Páginas do site
css/            Folhas de estilo
js/             Scripts
Imagens/        Imagens utilizadas no site
PROMPTS.md      Registro do uso de inteligência artificial
```

## Como usar

- Acesse a versão on-line pelo [GitHub Pages](https://namemira.github.io/Pinterest/).
- Para executar localmente, baixe ou clone o repositório e abra o arquivo `index.html` em um navegador. Não é necessário instalar dependências.

Nesta etapa, a validação dos formulários é realizada no navegador. A implementação do cadastro, do login e do armazenamento de dados em banco de dados está prevista para a Parte 3, com PHP e MySQL.

## Painel administrativo

O painel administrativo fica em `php/admin/painel.php` e só pode ser acessado por uma sessão autenticada cujo tipo seja `admin`.

### Criar a primeira conta administradora

No Windows, com o XAMPP configurado e o banco `pinterest` disponível, execute no terminal a partir da raiz do projeto:

```powershell
php php\admin\criar_admin.php
```

O procedimento solicita nome, e-mail e senha interativamente. Não existem usuário ou senha padrão. Ele usa `password_hash()`, PDO e consultas preparadas. Se já existir um administrador, o procedimento encerra sem criar outra conta. Ele também é bloqueado quando acessado pela internet.
