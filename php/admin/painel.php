<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/autenticacao.php';

iniciarSessaoSeguro();
$administradorId = exigirAdministrador();
$nomeAdministrador = (string) $_SESSION['usuario_nome'];
$tokenCsrf = gerarTokenCsrf();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel administrativo - Pinterest</title>
    <link rel="stylesheet" href="../../css/principal.css">
    <link rel="stylesheet" href="../../css/tema.css">
    <link rel="icon" href="../../Imagens/Icone.png">
</head>
<body>
<?php require_once __DIR__ . '/../includes/menu.php'; ?>

<main class="configuracoes" style="margin-left:84px; padding:32px;">
    <section class="conteudo-configuracoes" style="max-width:960px;">
        <h1>Painel administrativo</h1>
        <p>Administrador conectado: <strong><?= htmlspecialchars($nomeAdministrador, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') ?></strong> (ID <?= $administradorId ?>)</p>

        <div class="configuracao-secao ativa" style="margin-top:24px;">
            <h2>Administração</h2>
            <p>Esta área é exclusiva para administradores.</p>
            <p>O CRUD de Pins será disponibilizado em uma etapa posterior.</p>
        </div>

        <form method="post" action="logout.php" style="margin-top:24px;">
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($tokenCsrf, ENT_QUOTES, 'UTF-8') ?>">
            <button class="principal-dialogo-primario" type="submit">Sair da conta</button>
        </form>
    </section>
</main>
</body>
</html>
