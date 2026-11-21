<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pinterest</title>

    <link rel="stylesheet" href="../../css/principal.css">
    <link rel="stylesheet" href="../../css/configuracoes.css">
    <link rel="stylesheet" href="../../css/tema.css">
    <link rel="icon" href="../../Imagens/Icone.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
</head>

<body>

<!-- Menu lateral completo, incluindo o painel Criar -->
<?php require_once __DIR__ . '../../includes/menu.php'; ?>

<!-- Cabeçalho principal -->
<?php require_once __DIR__ . '../../includes/cabecalho_principal.php'; ?>

<!-- Configurações -->
<main class="configuracoes">
<!--Configurações-->
     
<main class="configuracoes">

    <!-- Menu interno -->
    <aside class="navegacao-configuracoes">

        <h1>Configurações</h1>

        <button class="opcao-config ativa" type="button" data-secao="editar-perfil">
            Editar perfil
        </button>
        <button class="opcao-config" type="button" data-secao="exibicao">
            Configurações de exibição
        </button>

    </aside>

<!-- Conteúdo -->
    <section class="conteudo-configuracoes">
 <!-- Editar perfil -->
    <div id="editar-perfil" class="configuracao-secao ativa">
        <h2>Editar perfil</h2>
        <p>Personalize as informações do seu perfil.</p>
        <div class="foto-perfil-config">

            <img src="../../Imagens/dog.jpg" alt="Foto de perfil" id="imagem-perfil">
            <div>
                <button type="button" id="alterar-foto">
                    Alterar foto
                </button>
                <input type="file" id="foto-perfil-input" accept="image/*" hidden>
            </div>
        </div>
        <!-- Formulário de perfil: validado pelo configuracoes.js -->
        <form class="formulario-perfil" id="formulario-perfil" novalidate>
        <table class="tabela-perfil">
            <caption class="legenda-tabela">Dados do perfil</caption>
            <tbody>
                <tr>
                    <th scope="row">
                        <label for="nome">Nome</label>
                    </th>
                    <td>
                        <input type="text" id="nome" name="nome" placeholder="Seu nome" required maxlength="60">
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="usuario">Nome de usuário</label>
                    </th>
                    <td>
                        <input type="text" id="usuario" name="usuario" placeholder="Nome de usuário" required pattern="[a-z0-9_.]{3,30}" aria-describedby="usuario-dica">
                        <small id="usuario-dica" class="dica-config">De 3 a 30 caracteres: letras minúsculas, números, ponto ou _.</small>
                    </td>
                </tr>

                <tr>
                    <th scope="row">
                        <label for="descricao">Sobre você</label>
                    </th>
                    <td>
                        <textarea id="descricao" name="descricao" maxlength="500" placeholder="Conte um pouco sobre você"></textarea>
                    </td>
                </tr>

                <tr>
                    <th scope="row">
                        <label for="site">Site</label>
                    </th>
                    <td>
                        <input type="url" id="site" name="site" placeholder="https://">
                    </td>
                </tr>

            </tbody>

        </table>
        <button type="submit" class="botao-salvar" id="salvar-perfil">
            Salvar alterações
        </button>
        <p class="mensagem-config" id="mensagem-config" role="status" aria-live="polite"></p>
        </form>
    </div>
<!-- Configurações de exibição -->
        <div id="exibicao" class="configuracao-secao">

            <h2>Configurações de exibição</h2>
            <p>Personalize a aparência da sua experiência.</p>

            <div class="opcao-exibicao">
                <div>
                    <h3>Tema</h3>
                    <p>Escolha a aparência da plataforma.</p>
                </div>

                <div class="opcoes-tema">
                    <label>
                        <input type="radio" name="tema" value="claro" checked>
                        Claro
                    </label>

                    <label>
                        <input type="radio" name="tema" value="escuro">
                        Escuro
                    </label>
                </div>
            </div>
            </div>
    </section>
</main>
<script src="../../js/pesquisa.js" defer></script>
<script src="../../js/menu.js" defer></script>
<script src="../../js/configuracoes.js" defer></script>
<script src="../../js/tema.js" defer></script>
</body>
</html>
