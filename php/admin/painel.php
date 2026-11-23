<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

// Acesso restrito: exige login e tipo_usuario = 'admin' (conferido no banco).
$pdo = criarConexao();
$adminId = exigirAdmin($pdo);

// Ações do painel (POST + CSRF)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validarTokenCsrf($_POST['csrf_token'] ?? null)) {
        definirAviso('erro', 'Sua sessão expirou. Atualize a página e tente novamente.');
        redirecionar('painel.php');
    }

    try {
        $acao = valorPost('acao');
        if ($acao === 'excluir_mensagem') {
            $id = inteiroPositivo(valorPost('id'), 'mensagem');
            if (excluirMensagem($pdo, $id)) {
                definirAviso('sucesso', 'Mensagem excluída.');
            } else {
                definirAviso('erro', 'Mensagem não encontrada.');
            }
        } elseif ($acao === 'excluir_pin') {
            $id = inteiroPositivo(valorPost('id'), 'Pin');
            if (excluirPin($pdo, $adminId, $id, true)) {
                definirAviso('sucesso', 'Pin excluído.');
            } else {
                definirAviso('erro', 'Pin não encontrado.');
            }
        } else {
            definirAviso('erro', 'Ação inválida.');
        }
    } catch (InvalidArgumentException $erro) {
        definirAviso('erro', $erro->getMessage());
    } catch (Throwable $erro) {
        error_log('Falha no painel administrativo: ' . $erro->getMessage());
        definirAviso('erro', 'Não foi possível concluir a ação.');
    }

    $ancora = valorPost('acao') === 'excluir_pin' ? '#pins' : '#mensagens';
    redirecionar('painel.php' . $ancora);
}

$aviso = obterAviso();
$mensagens = listarMensagens($pdo);
$pins = listarPins($pdo);
$usuarios = listarUsuarios($pdo);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel administrativo | Pinterest</title>
    <link rel="stylesheet" href="../../css/php.css">
    <link rel="stylesheet" href="../../css/admin.css">
    <link rel="icon" href="../../Imagens/Icone.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
</head>
<body class="pagina-admin">
    <header class="admin-cabecalho">
        <a class="admin-logo" href="../dados/principal.php"><img src="../../Imagens/Icone.png" alt="">Pinterest · Painel</a>
        <nav aria-label="Seções do painel">
            <a href="#mensagens">Mensagens (<?= count($mensagens) ?>)</a>
            <a href="#pins">Pins (<?= count($pins) ?>)</a>
            <a href="#usuarios">Usuários (<?= count($usuarios) ?>)</a>
        </nav>
        <div class="admin-conta">
            <span><?= e($_SESSION['usuario_nome']) ?></span>
            <a href="../dados/principal.php">Voltar ao site</a>
            <form method="post" action="../acoes/logout.php">
                <?= campoCsrf() ?>
                <button type="submit">Sair</button>
            </form>
        </div>
    </header>

    <main class="admin-conteudo">
        <h1>Painel administrativo</h1>
        <?= exibirAviso($aviso) ?>

        <section class="admin-resumo" aria-label="Resumo">
            <div><strong><?= count($usuarios) ?></strong><span>usuários</span></div>
            <div><strong><?= count($pins) ?></strong><span>Pins</span></div>
            <div><strong><?= count($mensagens) ?></strong><span>mensagens</span></div>
        </section>

        <!-- Mensagens enviadas pelo formulário de contato -->
        <section id="mensagens" aria-labelledby="titulo-mensagens">
            <h2 id="titulo-mensagens">Mensagens recebidas</h2>
            <?php if (!$mensagens): ?>
            <p>Nenhuma mensagem recebida.</p>
            <?php else: ?>
            <div class="admin-tabela-rolagem">
            <table class="admin-tabela">
                <caption class="visualmente-oculto">Mensagens do formulário de contato</caption>
                <thead>
                    <tr><th scope="col">Data</th><th scope="col">Nome</th><th scope="col">E-mail</th><th scope="col">Mensagem</th><th scope="col">Ações</th></tr>
                </thead>
                <tbody>
                <?php foreach ($mensagens as $item): ?>
                    <tr>
                        <td><?= e(formatarData($item['data_envio'])) ?></td>
                        <td><?= e($item['nome']) ?></td>
                        <td><a href="mailto:<?= e($item['email']) ?>"><?= e($item['email']) ?></a></td>
                        <td class="admin-texto-longo"><?= nl2br(e($item['mensagem'])) ?></td>
                        <td>
                            <form method="post" action="painel.php" data-confirmar="Excluir esta mensagem?">
                                <?= campoCsrf() ?>
                                <input type="hidden" name="acao" value="excluir_mensagem">
                                <input type="hidden" name="id" value="<?= (int) $item['id'] ?>">
                                <button class="botao-texto botao-perigo" type="submit">Excluir</button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
            </div>
            <?php endif; ?>
        </section>

        <!-- Moderação de Pins: o administrador pode excluir qualquer Pin -->
        <section id="pins" aria-labelledby="titulo-pins">
            <h2 id="titulo-pins">Pins publicados</h2>
            <div class="admin-tabela-rolagem">
            <table class="admin-tabela">
                <caption class="visualmente-oculto">Pins cadastrados</caption>
                <thead>
                    <tr><th scope="col">Imagem</th><th scope="col">Título</th><th scope="col">Autor</th><th scope="col">Categoria</th><th scope="col">Criado em</th><th scope="col">Ações</th></tr>
                </thead>
                <tbody>
                <?php foreach ($pins as $pin): ?>
                    <tr>
                        <td><img class="admin-miniatura" src="<?= e(urlArquivo($pin['caminho_imagem'])) ?>" alt=""></td>
                        <td><?= e($pin['titulo']) ?></td>
                        <td><?= e($pin['autor']) ?></td>
                        <td><?= e($pin['categoria']) ?></td>
                        <td><?= e(formatarData($pin['data_criacao'])) ?></td>
                        <td>
                            <form method="post" action="painel.php" data-confirmar="Excluir o Pin &quot;<?= e($pin['titulo']) ?>&quot;?">
                                <?= campoCsrf() ?>
                                <input type="hidden" name="acao" value="excluir_pin">
                                <input type="hidden" name="id" value="<?= (int) $pin['id'] ?>">
                                <button class="botao-texto botao-perigo" type="submit">Excluir</button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
            </div>
        </section>

        <section id="usuarios" aria-labelledby="titulo-usuarios">
            <h2 id="titulo-usuarios">Usuários cadastrados</h2>
            <div class="admin-tabela-rolagem">
            <table class="admin-tabela">
                <caption class="visualmente-oculto">Usuários</caption>
                <thead>
                    <tr><th scope="col">Nome</th><th scope="col">E-mail</th><th scope="col">Tipo</th><th scope="col">Pins</th><th scope="col">Cadastro</th></tr>
                </thead>
                <tbody>
                <?php foreach ($usuarios as $item): ?>
                    <tr>
                        <td><?= e($item['nome']) ?></td>
                        <td><?= e($item['email']) ?></td>
                        <td><span class="admin-etiqueta admin-etiqueta-<?= $item['tipo_usuario'] === 'admin' ? 'admin' : 'usuario' ?>"><?= $item['tipo_usuario'] === 'admin' ? 'Administrador' : 'Usuário' ?></span></td>
                        <td><?= (int) $item['total_pins'] ?></td>
                        <td><?= e(formatarData($item['data_criacao'])) ?></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
            </div>
        </section>
    </main>
    <script src="../../js/acoes_php.js" defer></script>
</body>
</html>
