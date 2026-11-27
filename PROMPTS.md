Registro de uso de Inteligência Artificial(ChatGPT (OpenAI))
Integrante: Jéssica Fernanda Rubas

-- Funcionalidades iniciais em JavaScript
Prompt: Analise os arquivos do meu projeto Pinterest e me ajude a implementar as funcionalidades em JavaScript puro, mantendo HTML, CSS e JavaScript separados. Preciso de validação dos formulários de cadastro e login, pesquisa com sugestões, menu lateral responsivo, criação e exibição dinâmica de Pins, detalhes dos Pins, ações de salvar e compartilhar, criação e organização de pastas com localStorage e conteúdos dinâmicos na página Explorar. Utilize addEventListener, manipulação do DOM e mensagens na própria página, sem usar alert() ou frameworks. Antes de alterar, confira o código existente, reaproveite o que já estiver pronto e explique como testar as funcionalidades.
Usei as orientações para desenvolver e ajustar as interações dos formulários, da pesquisa, dos menus, dos Pins e das pastas. Adaptei as sugestões à estrutura que já existia no projeto e mantive algumas funções como demonstrações no navegador, sem autenticação ou banco de dados nesta etapa.

--Reformulação da página de Login
Prompt:Analise a página de Login e as referências que enviei. Quero um formulário centralizado em um cartão branco, com imagens ao fundo, campos de e-mail e senha, opção para mostrar ou ocultar a senha, recuperação de senha, botão Entrar e link para cadastro. Mantenha a identidade visual do projeto, a responsividade e a separação entre HTML, CSS e JavaScript. Aproveite a validação existente e não implemente autenticação real nesta etapa.
Usei as orientações para ajustar a aparência e a organização do formulário. A validação continuou sendo feita no navegador, sem conexão com servidor.

--Menu de perfil e painel Criar
Prompt:Analise as referências do Pinterest e me ajude a implementar o menu suspenso do perfil e o painel lateral Criar. O menu de perfil deve apresentar opções relacionadas à conta. Ao clicar em Criar, quero abrir um painel com as opções Pin, Pasta, Colagem e Cartão. Reaproveite as funções existentes, mantenha o visual do projeto e utilize JavaScript externo com addEventListener. Não implemente autenticação ou banco de dados.
Usei as orientações para ajustar o menu do perfil e o painel de criação, aproveitando os arquivos e as funções que já existiam

--Avisos de Mensagens e Notificações
Prompt:Quando o usuário clicar em Mensagens ou Notificações, quero exibir uma janela modal no centro da tela, sobre o conteúdo atual, com o fundo escurecido. A mensagem deve informar que o recurso ainda não foi liberado nesta versão. Quero botão para fechar, fechamento pela tecla Esc e clique fora da janela. Mantenha o texto, o estilo do projeto e a separação entre HTML, CSS e JavaScript. Não implemente os sistemas reais de mensagens e notificações.
Utilizei a orientação para definir o comportamento esperado dos avisos modais. Os recursos reais de mensagens e notificações permaneceram fora do escopo.

--Padronização do botão Criar nas páginas
Prompt:Corrija o botão Criar para que tenha o mesmo comportamento em todas as páginas. Atualmente, na página Principal ele abre o painel com Pin, Pasta, Colagem e Cartão, mas em outras páginas leva diretamente para CriarPin.html. Quero que o clique abra o mesmo painel lateral em Principal, Explorar, Perfil e Criar Pin. Reaproveite as funções existentes, mantenha as quatro opções funcionando e não altere os outros itens da barra lateral.
[PREENCHER: como a resposta foi aproveitada ou modificada]

Registro de uso de Inteligência Artificial ([PREENCHER: ferramenta utilizada])
Integrante: Samira Vieira
Parte do trabalho: Parte 2 – Front-end
Prompt:

Item | Qtde mínima | Descrição
Páginas | 5 | Conforme o mapa do site da Parte 1
Tags semânticas | 4 | Uso de header, nav, main, section, article, footer
Formulários | 2 | Com label, tipos de input adequados (email, date, number, tel) e atributos de validação (required, min, max, pattern)
Tabela | 1 | Ex.: tabela de preços, horários ou agenda
Imagens e mídia | 1 | Todas as imagens com atributo alt descritivo

Navegação possível pelo teclado e foco visível nos elementos interativos;
Hierarquia correta de títulos (h1 a h6);
Organização de pastas (ex.: css/, js/, img/) e nomes de arquivos padronizados;
Código indentado e comentado nos trechos relevantes.

Organize os tópicos para eu poder desenvolver as páginas sem deixar de seguir o que foi solicitado.

Resposta:

Checklist geral para conferir antes da entrega
Utilize esta lista durante o desenvolvimento.
Progresso do projeto: 0/18

1. Estrutura

[ ] Desenvolver pelo menos 5 páginas HTML
[ ] Seguir o mapa do site da Parte 1
[ ] Utilizar pelo menos 4 tags semânticas
[ ] Manter a navegação entre as páginas funcionando

2. Conteúdo

[ ] Criar pelo menos 2 formulários
[ ] Utilizar labels nos campos
[ ] Utilizar inputs adequados (email, date, number e tel)
[ ] Adicionar validações (required, min, max e pattern)
[ ] Criar pelo menos 1 tabela
[ ] Adicionar pelo menos 1 imagem com alt descritivo

3. Acessibilidade

[ ] Permitir navegação pelo teclado
[ ] Adicionar foco visível nos elementos interativos
[ ] Manter hierarquia correta de títulos h1 até h6
[ ] Garantir identificação dos campos dos formulários

4. Organização

[ ] Criar pastas css/, js/ e img/
[ ] Padronizar os nomes dos arquivos
[ ] Manter o código indentado
[ ] Adicionar comentários nos trechos relevantes

Foi usado este checklist para desenvolver as páginas index.

Como fazer uma barra de pesquisa?

<input type="search"> – campo onde o usuário digita.
<button> – botão para executar a pesquisa.
Ícone de lupa – representa visualmente a pesquisa.

Exemplo HTML

html
<div class="pesquisa">
    <input type="search" placeholder="Pesquisar">
    <button type="submit">🔍</button>
</div>

Exemplo CSS

css
.pesquisa {
    display: flex;
    align-items: center;
    background-color: #EFEFEF;
    border-radius: 25px;
    padding: 5px 15px;
}

.pesquisa input {
    border: none;
    outline: none;
    background: transparent;
    padding: 10px;
    flex: 1;
}

.pesquisa button {
    border: none;
    background: transparent;
    cursor: pointer;
}

Usado no código na página index.

Como criar aquele efeito que deixa os elementos do fundo cinza, trazendo destaque pro forms?

Esse efeito é chamado de Overlay (sobreposição) ou fundo escurecido. É muito utilizado em telas de login e cadastro para destacar o formulário enquanto o restante da página fica cinza ou escurecido.

Você consegue fazer isso usando CSS com position: fixed e background.

Utilizado em login.html.

E ajude a organizar a criação desta página em HTML.

Resposta:

1. Entendendo a estrutura da página

A imagem pode ser dividida em 6 partes principais:

Menu lateral de ícones
Logo do Pinterest.
Página inicial.
Explorar.
Criar publicação.
Notificações.
Configurações.
Painel de atividades
Título Atividade.
Notificações.
Pequenas imagens.
Mensagens e datas.
Cabeçalho
Barra de pesquisa.
Ícone de câmera.
Foto do perfil.
Banner informativo
Título.
Texto explicativo.
Botões de ação.
Botão para fechar.
Categorias
Todos.
Referências de coloração.
Dinossauros.
Poses.
Outras categorias.
Mural de imagens
Imagens de tamanhos diferentes.
Organização em colunas.
Bordas arredondadas.
Espaçamento entre imagens.

Utilizado para criar a página principal.

Como fazer a parte das postagens?

html
<!-- Postagens -->
<main class="postagens">

    <div class="post">
        <img src="Imagens/look1.jpg" alt="Look feminino">
    </div>

    <div class="post">
        <img src="Imagens/look2.jpg" alt="Inspiração de decoração">
    </div>

    <div class="post">
        <img src="Imagens/look3.jpg" alt="Receita">
    </div>

    <div class="post">
        <img src="Imagens/look4.jpg" alt="Inspiração de estilo">
    </div>

    <div class="post">
        <img src="Imagens/look5.jpg" alt="Ideia de decoração">
    </div>

</main>

CSS

css
/* Postagens */
.postagens {
    margin-left: 70px;
    padding: 20px;
    columns: 5;
    column-gap: 15px;
}

.post {
    break-inside: avoid;
    margin-bottom: 15px;
    border-radius: 15px;
    overflow: hidden;
}

.post img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 15px;
}

Usado na criação das postagens.

Organize o perfil.

Foi adicionada a tag Header com a class=cabecalho.

css
/* Tela de perfil */
.conteudo {
    margin-left: 50px;
    padding-top: 75px;
}

/* Cabeçalho */
.cabecalho {
    position: fixed;
    top: 0;
    left: 50px;
    width: calc(100% - 50px);
    height: 60px;
    background-color: white;
    display: flex;
    align-items: center;
    z-index: 1000;
    box-sizing: border-box;
}

Esse foi o CSS utilizado.

Me ajude a organizar a criação do explore, em separando HTML, JS e CSS. Foi usado a organização dos arquivos a construção da pagina  Configurações foi usada da mesma forma

Registro de uso de Inteligência Artificial (Claude (Anthropic) – Claude Code)
Integrante: Nicole Bet
Parte do trabalho: Parte 2 – Front-end

--Fundo da tela de Cadastro igual ao do Login
Prompt: o que preciso alterar na tela de cadastro (css e html) para ficar no mesmo fundo que a a tela de login
Prompt: me mostre exatamente o que preecisa ajustar em ambos
Usei a resposta para trocar o menu antigo do Cadastro.html pelo mosaico de imagens do Login e copiar o CSS do fundo (.login-backdrop e media queries) para o cadastro.css. Também corrigi um comentário quebrado no CSS que fazia a regra .link-conta ser ignorada.

--Ícone do Google nas telas de Login e Inicial
Prompt: preciso que mostre onde altera na tela de login, o g do google, e faça igual o de cadastro
Prompt: essa tela tb tem que mudar o g (enviando print do formulário da página Inicial)
Troquei a letra "G" pelo mesmo SVG colorido do Cadastro no Login.html e no Inicial.html e criei a classe .icone-google no login.css e no inicial.css, encaminhado o trecho a ser alterado.

--Revisão dos critérios da Parte 2
Prompt: verifica o que falta para estar de acordo com todos os criterios da parte dois, me encaminha o que precisa alterar, a linha de cada coisa que deve ser editada
A IA comparou o projeto com o PDF do trabalho e mostrou as correções necessárias: rodapé com aviso de clone em todas as páginas, variáveis CSS no principal.css e no cadastro.css, labels e atributos de validação no Cadastro.html, formulário de perfil validado sem alert() em Configuracao.html/configuracoes.js, links de Configurações no menu, títulos h1, remoção de id duplicado, alt descritivo nas imagens do Explorar, README.md preenchido e remoção de arquivos CSS vazios.

Registro de uso de Inteligência Artificial – ChatGPT
Integrante: Samira
Parte do trabalho: Parte 3
1. Criação da página Explore
Prompt: Me ajude a organizar a criação da página Explore, separando HTML, JavaScript e CSS.
Prompt: Analise a estrutura dos arquivos do projeto e me oriente sobre como separar o código da página Explore, mantendo as funcionalidades e a aparência.
Prompt: Organize o código da página Explore de acordo com a estrutura utilizada nas demais páginas do projeto, evitando deixar HTML, CSS e JavaScript misturados.
Prompt: Mostre quais trechos precisam ser movidos para arquivos separados e quais caminhos devem ser utilizados para importar os arquivos.
Como utilizei as respostas: Usei as orientações para organizar a página Explore em arquivos independentes, mantendo a estrutura HTML responsável pelo conteúdo, o CSS pela aparência e o JavaScript pelas funcionalidades e interações. Também ajustei as referências aos arquivos externos para que a página continuasse funcionando corretamente.
2. Organização da página Configurações
Prompt: Organize a página Configurações seguindo a mesma estrutura utilizada nas outras páginas do projeto, separando HTML, CSS e JavaScript.
Prompt: Ajude a identificar quais partes do código devem permanecer no arquivo HTML e quais devem ser transferidas para os arquivos CSS e JavaScript.
Prompt: Verifique se os arquivos estão corretamente conectados e se a separação mantém as funcionalidades existentes da página.
Como utilizei as respostas: Utilizei as orientações para estruturar a página Configurações seguindo o mesmo padrão adotado na página Explore. O HTML ficou responsável pela estrutura da página, o CSS pela estilização e o JavaScript pelo comportamento dos elementos e pelo processamento das interações.
3. Ajustes de estilização e organização do CSS
Código CSS utilizado:
background-color: white;
display: flex;
align-items: center;
z-index: 1000;
box-sizing: border-box;
Prompt: Explique a função das propriedades CSS utilizadas e como elas influenciam a organização e a aparência dos elementos da página.
Como utilizei as respostas: Usei as explicações para compreender a finalidade das propriedades CSS e manter a organização visual dos componentes, especialmente no posicionamento, alinhamento e sobreposição dos elementos da interface.
4. Padronização da estrutura das páginas
Prompt: Utilize a organização dos arquivos de uma página já desenvolvida como referência para estruturar as demais páginas do projeto.
Prompt: Ajude a manter um padrão de organização entre as páginas, separando os arquivos HTML, CSS e JavaScript e preservando as funcionalidades existentes.
Como utilizei as respostas: A organização adotada na página Explore serviu como referência para a construção da página Configurações. Dessa forma, as duas páginas seguiram o mesmo padrão de separação de responsabilidades, facilitando a manutenção e a compreensão do código.
5. Implementação e personalização do modo claro e escuro
Prompt: Ajude a alterar as cores dos elementos da interface quando o modo escuro estiver ativado, incluindo textos, fundos, bordas, ícones e botões.
Prompt: Explique como utilizar a classe tema-escuro para personalizar os elementos da página sem prejudicar a aparência do modo claro.
Como utilizei as respostas: Utilizei as orientações para criar e ajustar regras CSS específicas para o modo escuro, modificando as cores de fundo, textos, bordas e componentes da interface. Também preservei algumas cores específicas, como o vermelho utilizado nos botões.
6. Aplicação global do tema nas páginas
Prompt: Como posso utilizar as configurações de aparência já existentes para aplicar o modo claro e escuro em todo o site, mantendo a preferência do usuário ao mudar de página?
Prompt: Oriente como utilizar localStorage para salvar a escolha do tema e recuperá-la automaticamente quando outra página for aberta.
Prompt: Explique como organizar os arquivos CSS e JavaScript para que o tema funcione em todas as páginas do projeto.
Como utilizei as respostas: Recebi orientações para separar as regras globais de aparência em um arquivo CSS compartilhado e utilizar um arquivo JavaScript chamado tema.js para salvar e recuperar a preferência do usuário por meio do localStorage. Também foi discutida a inclusão desses arquivos nas diferentes páginas HTML.
7. Correção das cores dos ícones do menu lateral
Prompt: Identifique por que alguns ícones SVG do menu lateral permanecem brancos ou apresentam cores diferentes dos demais no modo escuro.
Prompt: Explique como alterar a cor dos contornos dos ícones SVG utilizando as propriedades stroke e fill.
Como utilizei as respostas: UtilizeI as orientações para ajustar as propriedades CSS dos ícones do menu lateral, utilizando seletores como .menu-item svg e .menu-configuracoes svg. O objetivo foi padronizar a aparência dos ícones nos diferentes temas.
8. Personalização do menu de perfil
Prompt: Ajude a identificar e alterar a cor de fundo do menu de perfil que aparece ao clicar na foto do usuário, mantendo o restante da interface sem alterações.
Prompt: Como adicionar um efeito hover aos itens do menu de perfil no modo escuro?
Como utilizei as respostas: Utilizei as orientações para identificar os seletores .menu-perfil e .menu-perfil-item, ajustando a cor de fundo do menu e o efeito de destaque ao passar o mouse sobre as opções.
9. Correção de bordas e efeitos de interação
Prompt: Ajude a identificar por que as bordas dos elementos não estavam sendo aplicadas corretamente no modo escuro.
Prompt: Explique como configurar corretamente a propriedade border, definindo espessura, estilo e cor.
Como utilizei as respostas: UtilizeI os exemplos fornecidos para revisar a aplicação das bordas no menu lateral e em outros componentes, além de ajustar os efeitos de interação utilizando :hover.
10. Personalização da tela de detalhes do Pin
Prompt: Como alterar a cor dos textos da tela de detalhes do Pin no modo escuro, mantendo o fundo branco do painel?
Prompt: Ajude a modificar as cores dos botões Fechar, Salvar e Compartilhar, incluindo seus efeitos ao passar o mouse.
Como utilizei as respostas: UtilizeI as orientações para trabalhar com seletores específicos dos componentes da tela de detalhes do Pin, como .detalhes-pin-conteudo, .detalhes-pin-fechar e .detalhes-pin-acoes. Dessa forma, foi possível definir cores específicas para textos e botões sem modificar os demais elementos do site.
Observação: As respostas da IA foram utilizadas como apoio durante o desenvolvimento, auxiliando na organização dos arquivos, na padronização da estrutura das páginas, na implementação do modo escuro e nos ajustes visuais dos componentes. As orientações também contribuíram para identificar problemas de estilização e compreender melhor a utilização de seletores CSS, propriedades de cores e efeitos de interação.

