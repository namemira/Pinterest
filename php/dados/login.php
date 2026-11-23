<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

// Quem já está logado vai direto para o feed.
if (usuarioEstaAutenticado()) {
    redirecionar('principal.php');
}

$email = '';
$mensagem = '';
$aviso = obterAviso();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = is_string($_POST['email'] ?? null) ? trim($_POST['email']) : '';
    $senha = is_string($_POST['senha'] ?? null) ? $_POST['senha'] : '';

    if (!validarTokenCsrf($_POST['csrf_token'] ?? null)) {
        $mensagem = 'Sua sessão expirou. Atualize a página e tente novamente.';
    } elseif ($email === '' || $senha === '') {
        $mensagem = 'Informe seu e-mail e sua senha.';
    } else {
        try {
            $emailValidado = emailValidado($email);
            $usuario = consultarUsuarioPorEmail(criarConexao(), $emailValidado);
            if ($usuario === null || !password_verify($senha, $usuario['senha_hash'])) {
                $mensagem = 'E-mail ou senha incorretos.';
            } else {
                autenticarUsuario($usuario);
                if ($usuario['tipo_usuario'] === 'admin') {
                    header('Location: ../admin/painel.php', true, 303);
                } else {
                    header('Location: principal.php', true, 303);
                }
                exit;
            }
        } catch (InvalidArgumentException $erro) {
            $mensagem = 'E-mail ou senha incorretos.';
        } catch (PDOException $erro) {
            error_log('Falha ao autenticar usuário: ' . $erro->getMessage());
            $mensagem = 'Não foi possível realizar o login. Tente novamente.';
        } catch (RuntimeException $erro) {
            $mensagem = 'Não foi possível realizar o login. Tente novamente.';
        }
    }
}

$tokenCsrf = gerarTokenCsrf();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Entre no Pinterest para descobrir mais ideias e inspirações.">
    <title>Entrar no Pinterest</title>
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
        <form class="login-card" id="tela-login" method="post" action="login.php" novalidate aria-labelledby="titulo-login">
            <a href="Inicial.php" id="Fechar" aria-label="Fechar e voltar para a página inicial">X</a>
            <img class="login-logo" src="../../Imagens/Pinterest.png" alt="Pinterest">
            <h1 id="titulo-login">Bem-vindo de volta</h1>
            <p class="login-intro">Entre para descobrir mais ideias e inspirações</p>
            <?php if ($mensagem !== ''): ?>
                <p class="mensagem-resultado" role="alert" aria-live="assertive"><?= htmlspecialchars($mensagem, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></p>
            <?php else: ?>
                <?= exibirAviso($aviso) ?>
            <?php endif; ?>
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($tokenCsrf, ENT_QUOTES, 'UTF-8') ?>">

            <div class="form-field">
                <label for="email">E-mail</label>
                <input type="email" id="email" name="email"  autocomplete="email" placeholder="Digite seu e-mail" value="<?= htmlspecialchars($email, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?>" required>
            </div>
            <div class="form-field">
                <label for="senha">Senha</label>
                <div class="password-control">
                    <input type="password" id="senha" name="senha" autocomplete="current-password" placeholder="Digite sua senha" required >
                    <button class="password-toggle" id="alternar-senha" type="button" aria-label="Mostrar senha" aria-pressed="false" >
                    Mostrar
                </button>
                </div>
            </div>
            <button class="forgot-password" id="recuperar-senha" type="button">Esqueceu sua senha?</button>
            <button class="button button-red login-submit" id="Entrar" type="submit">Entrar</button>
            <div class="login-divider" role="separator" aria-label="ou"><span>OU</span></div>
            <button class="button google-button" type="button" disabled>
                <svg class="icone-google" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.430 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continuar com Google
            </button>
            <p class="google-note">Integração com Google indisponível nesta demonstração.</p>

            <p class="signup-prompt">Ainda não tem uma conta? <a href="cadastro.php">Cadastre-se</a></p>
        </form>
</main>
<?php require_once __DIR__ . '/../includes/rodape_login_cadastro.php'; ?>
    <script src="../../js/validacao.js" defer></script>
</body>
</html>
