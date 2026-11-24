<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

if (usuarioEstaAutenticado()) {
    redirecionar('principal.php');
}

$nome = '';
$email = '';
$nascimentoInformado = '';
$mensagem = '';
$tipoMensagem = 'erro';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = is_string($_POST['nome'] ?? null) ? trim($_POST['nome']) : '';
    $email = is_string($_POST['email'] ?? null) ? trim($_POST['email']) : '';

    if (!validarTokenCsrf($_POST['csrf_token'] ?? null)) {
        $mensagem = 'Sua sessão expirou. Atualize a página e tente novamente.';
    } else {
        try {
            $nome = textoValidado($nome, 60, 'nome');
            $email = emailValidado($email);
            $senha = is_string($_POST['senha'] ?? null) ? $_POST['senha'] : '';
            $confirmacaoSenha = is_string($_POST['confirmar_senha'] ?? null) ? $_POST['confirmar_senha'] : '';
            $nascimento = is_string($_POST['nascimento'] ?? null) ? trim($_POST['nascimento']) : '';
            $nascimentoInformado = $nascimento;
            $nascimento = dataNascimentoValidada($nascimento);

            if (mb_strlen($senha, 'UTF-8') < 8) {
                throw new InvalidArgumentException('A senha deve ter pelo menos 8 caracteres.');
            }
            if (!hash_equals($senha, $confirmacaoSenha)) {
                throw new InvalidArgumentException('As senhas informadas não são iguais.');
            }

            $pdo = criarConexao();
            criarUsuario($pdo, $nome, $email, $senha, $nascimento);
            definirAviso('sucesso', 'Cadastro realizado com sucesso. Agora você já pode entrar.');
            redirecionar('login.php');
        } catch (InvalidArgumentException $erro) {
            $mensagem = $erro->getMessage();
        } catch (PDOException $erro) {
            error_log('Falha ao cadastrar usuário: ' . $erro->getMessage());
            $mensagem = $erro->getCode() === '23000'
                ? 'Este e-mail já está cadastrado.'
                : 'Não foi possível concluir o cadastro. Tente novamente.';
        } catch (RuntimeException $erro) {
            $mensagem = 'Não foi possível concluir o cadastro. Tente novamente.';
        }
    }
}

$tokenCsrf = gerarTokenCsrf();
$papelMensagem = $tipoMensagem === 'sucesso' ? 'status' : 'alert';
?>
<!DOCTYPE html>
<!--Mesmo fundo do Login-->
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastre-se no Pinterest</title>
    <link rel="stylesheet" href="../../css/cadastro.css">
    <link rel="icon" href="../../Imagens/Icone.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
</head>
<body>
<!--Fundo: mesmo mosaico do Login-->
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

<!--Formulário do Cadastro-->
    <main id="overlay">
        <form id="tela-cadastro" method="post" action="cadastro.php" novalidate>
            <a href="Inicial.php" id="Fechar" aria-label="Fechar e voltar para a página inicial">X</a>
            <img src="../../Imagens/Pinterest.png" id="img-logo" alt="Pinterest">

            <h1>Que bom ter você no Pinterest</h1>
            <p>Entre no Pinterest gratuitamente para descobrir mais ideias</p>
            <?php if ($mensagem !== ''): ?>
                <p class="mensagem-resultado" role="<?= htmlspecialchars($papelMensagem, ENT_QUOTES, 'UTF-8') ?>" aria-live="<?= $papelMensagem === 'alert' ? 'assertive' : 'polite' ?>"><?= htmlspecialchars($mensagem, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></p>
            <?php endif; ?>
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($tokenCsrf, ENT_QUOTES, 'UTF-8') ?>">

            <!-- Campos com label, tipo adequado e atributos de validação -->
            <label for="nome" class="rotulo-cadastro">Nome</label>
            <input type="text" id="nome" name="nome" autocomplete="name" required maxlength="60" placeholder="Digite seu nome" class="Input-cadastro" value="<?= htmlspecialchars($nome, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?>">

            <label for="email" class="rotulo-cadastro">E-mail</label>
            <input type="email" id="email" name="email" autocomplete="email" required placeholder="Digite seu e-mail" class="Input-cadastro" value="<?= htmlspecialchars($email, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?>">

            <label for="senha" class="rotulo-cadastro">Senha</label>
            <input type="password" id="senha" name="senha" autocomplete="new-password" required minlength="8" placeholder="Crie uma senha" class="Input-cadastro">
            <p class="dica-cadastro">Use 8 ou mais letras, números e símbolos</p>

            <label for="confirmar-senha" class="rotulo-cadastro">Confirme sua senha</label>
            <input type="password" id="confirmar-senha" name="confirmar_senha" autocomplete="new-password" required placeholder="Digite sua senha novamente" class="Input-cadastro">

            <label for="nascimento" class="rotulo-cadastro">Data de nascimento</label>
            <input type="date" id="nascimento" name="nascimento" autocomplete="bday" required min="1900-01-01" class="Input-cadastro" value="<?= htmlspecialchars($nascimentoInformado, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?>">

            <button type="submit" id="continuar">Continuar</button>
            <p class="divisor-ou">OU</p>
            <button type="button" id="continuar-google" aria-describedby="google-cadastro-indisponivel" disabled>
                <svg class="icone-google" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.430 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continuar com o Google
            </button>
            <p class="dica-cadastro" id="google-cadastro-indisponivel">Integração com Google indisponível nesta demonstração.</p>
            <p class="link-conta">Já tem uma conta? <a href="login.php">Entrar</a></p>
            <p class="aviso-termos">
                Para usar o Pinterest, você precisa ter no mínimo 13 anos. Esta demonstração
                armazena seu nome, e-mail e senha protegida para permitir o login. Os termos
                e a política de privacidade não estão disponíveis nesta versão.
            </p>
        </form>
    </main>
<?php require_once __DIR__ . '/../includes/rodape_login_cadastro.php'; ?>

    <script src="../../js/validacao.js" defer></script>
</body>
</html>
