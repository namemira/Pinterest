<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

// Formulário de contato: as mensagens ficam na tabela "mensagens"
// e são listadas no painel administrativo.
$nome = usuarioEstaAutenticado() ? (string) $_SESSION['usuario_nome'] : '';
$email = usuarioEstaAutenticado() ? (string) ($_SESSION['usuario_email'] ?? '') : '';
$texto = '';
$mensagem = '';
$tipoMensagem = 'erro';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim(valorPost('nome'));
    $email = trim(valorPost('email'));
    $texto = trim(valorPost('mensagem'));

    if (!validarTokenCsrf($_POST['csrf_token'] ?? null)) {
        $mensagem = 'Sua sessão expirou. Atualize a página e tente novamente.';
    } elseif (valorPost('site_empresa') !== '') {
        // Campo invisível (honeypot): só robôs o preenchem.
        $mensagem = 'Não foi possível enviar a mensagem.';
    } else {
        try {
            registrarMensagem(criarConexao(), $nome, $email, $texto);
            definirAviso('sucesso', 'Mensagem enviada. Obrigado pelo contato!');
            redirecionar('contato.php');
        } catch (InvalidArgumentException $erro) {
            $mensagem = $erro->getMessage();
        } catch (Throwable $erro) {
            error_log('Falha ao registrar mensagem: ' . $erro->getMessage());
            $mensagem = 'Não foi possível enviar a mensagem. Tente novamente.';
        }
    }
}

$aviso = $mensagem !== '' ? ['tipo' => $tipoMensagem, 'texto' => $mensagem] : obterAviso();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Fale com a equipe do Pinterest Clone.">
    <title>Fale conosco | Pinterest</title>
    <link rel="stylesheet" href="../../css/cadastro.css">
    <link rel="stylesheet" href="../../css/login.css">
    <link rel="stylesheet" href="../../css/php.css">
    <link rel="icon" href="../../Imagens/Icone.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="login-backdrop" role="img" aria-label="Colagem decorativa de imagens de viagens, moda, decoração, arte e ideias">
        <img class="backdrop-travel-left" src="../../Imagens/viagens.jpg" alt="">
        <img class="backdrop-decor-top" src="../../Imagens/decoracao.jpg" alt="">
        <img class="backdrop-art-left" src="../../Imagens/arte.jpg" alt="">
        <img class="backdrop-fashion-top" src="../../Imagens/moda.jpg" alt="">
        <img class="backdrop-recipe-bottom" src="../../Imagens/receitas.jpg" alt="">
        <img class="backdrop-dog-bottom" src="../../Imagens/dog.jpg" alt="">
        <img class="backdrop-travel-right" src="../../Imagens/viagens.jpg" alt="">
        <img class="backdrop-decor-right" src="../../Imagens/decoracao.jpg" alt="">
    </div>
    <main class="login-page">
        <form class="login-card formulario-contato" id="formulario-contato" method="post" action="contato.php" novalidate aria-labelledby="titulo-contato">
            <a href="<?= usuarioEstaAutenticado() ? 'principal.php' : 'Inicial.php' ?>" id="Fechar" aria-label="Fechar e voltar">X</a>
            <img class="login-logo" src="../../Imagens/Pinterest.png" alt="Pinterest">
            <h1 id="titulo-contato">Fale conosco</h1>
            <p class="login-intro">Envie dúvidas, sugestões ou problemas encontrados no site.</p>
            <?= exibirAviso($aviso) ?>
            <?= campoCsrf() ?>

            <div class="form-field">
                <label for="contato-nome">Nome</label>
                <input type="text" id="contato-nome" name="nome" autocomplete="name" maxlength="60" required value="<?= e($nome) ?>">
            </div>
            <div class="form-field">
                <label for="contato-email">E-mail</label>
                <input type="email" id="contato-email" name="email" autocomplete="email" maxlength="180" required value="<?= e($email) ?>">
            </div>
            <div class="form-field">
                <label for="contato-mensagem">Mensagem</label>
                <textarea id="contato-mensagem" name="mensagem" rows="5" minlength="10" maxlength="5000" required><?= e($texto) ?></textarea>
            </div>
            <!-- Honeypot: escondido de pessoas, preenchido apenas por robôs -->
            <div class="campo-armadilha" aria-hidden="true">
                <label for="site-empresa">Não preencha este campo</label>
                <input type="text" id="site-empresa" name="site_empresa" tabindex="-1" autocomplete="off">
            </div>
            <button class="button button-red login-submit" type="submit">Enviar mensagem</button>
        </form>
    </main>
<?php require_once __DIR__ . '/../includes/rodape_login_cadastro.php'; ?>
    <script src="../../js/acoes_php.js" defer></script>
</body>
</html>
