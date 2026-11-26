<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

$usuarioId = exigirLoginNaPagina();
$busca = mb_substr(valorGet('q') !== '' ? valorGet('q') : valorGet('busca'), 0, 100, 'UTF-8');
$termoBuscaCabecalho = $busca;
$paginaExplorarAutenticada = true;
$categorias = [];
$pins = [];
$pinsDaConta = [];
$gruposCategoria = [];
$categoriaSelecionadaId = null;
$categoriaSelecionada = '';
$erroCarregamento = '';
$aviso = obterAviso();

try {
    $pdo = criarConexao();
    $categorias = listarCategorias($pdo);
    $categoriaRecebida = filter_var(
        valorGet('categoria_id'),
        FILTER_VALIDATE_INT,
        ['options' => ['min_range' => 1]]
    );
    if ($categoriaRecebida !== false) {
        foreach ($categorias as $categoria) {
            if ((int) $categoria['id'] === $categoriaRecebida) {
                $categoriaSelecionadaId = $categoriaRecebida;
                $categoriaSelecionada = (string) $categoria['nome'];
                break;
            }
        }
    }

    $pins = listarPins($pdo, null, $busca, $usuarioId);
    $gruposCategoria = agruparPinsPorCategoria($pins, $categoriaSelecionadaId);
    $pinsDaConta = array_slice(array_values(array_filter(
        $pins,
        static fn (array $pin): bool => (int) $pin['usuario_id'] === $usuarioId || (bool) $pin['salvo']
    )), 0, 4);
} catch (Throwable $erro) {
    error_log('Falha ao carregar Explorar autenticado: ' . $erro->getMessage());
    $categorias = [];
    $pins = [];
    $pinsDaConta = [];
    $gruposCategoria = [];
    $erroCarregamento = 'Não foi possível carregar as ideias agora. Tente novamente mais tarde.';
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Explore Pins, suas criações e ideias salvas.">
    <title>Explorar | Pinterest</title>
    <link rel="stylesheet" href="../../css/principal.css">
    <link rel="stylesheet" href="../../css/explore.css">
    <link rel="stylesheet" href="../../css/tema.css">
    <link rel="stylesheet" href="../../css/php.css">
    <link rel="icon" href="../../Imagens/Icone.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
</head>
<body class="explorar-autenticado">
    <?php require_once __DIR__ . '/../includes/menu.php'; ?>
    <?php require_once __DIR__ . '/../includes/cabecalho_principal.php'; ?>

    <main class="explorar-conta" id="conteudo-principal">
        <?= exibirAviso($aviso) ?>
        <header class="titulo-explorar">
            <h1>Explore suas próximas ideias</h1>
            <p>Descubra Pins e encontre novamente suas inspirações.</p>
        </header>

        <section class="explorar-suas-ideias" aria-labelledby="titulo-suas-ideias">
            <h2 id="titulo-suas-ideias">Suas ideias</h2>
            <p>Veja seus Pins criados e salvos<?= $busca !== '' ? ' entre os resultados da pesquisa' : '' ?>.</p>
            <?php if ($pinsDaConta): ?>
            <div class="explorar-suas-previas">
                <?php foreach ($pinsDaConta as $pinDaConta): ?>
                <?php $abaConta = (int) $pinDaConta['usuario_id'] === $usuarioId ? 'criados' : 'salvos'; ?>
                <a href="perfil.php?aba=<?= $abaConta ?>#pin-<?= (int) $pinDaConta['id'] ?>">
                    <img src="<?= e(urlArquivo($pinDaConta['caminho_imagem'])) ?>" alt="<?= e($pinDaConta['texto_alternativo'] ?: $pinDaConta['titulo']) ?>" loading="lazy">
                    <span><?= e($pinDaConta['titulo']) ?></span>
                </a>
                <?php endforeach; ?>
            </div>
            <?php elseif ($erroCarregamento === ''): ?>
            <p><?= $busca !== '' ? 'Nenhum Pin criado ou salvo corresponde a esta pesquisa.' : 'Crie ou salve Pins para encontrá-los aqui.' ?></p>
            <?php endif; ?>
            <div class="explorar-conta-links">
                <a href="perfil.php?aba=criados">Pins criados</a>
                <a href="perfil.php?aba=salvos">Pins salvos</a>
                <a href="criar_pin.php">Criar Pin</a>
            </div>
        </section>

        <nav class="explore-categories" aria-label="Categorias de descoberta">
            <div id="lista-categorias">
                <button class="categoria" type="button" data-categoria="" data-categoria-id="" data-categoria-label="Tudo" aria-pressed="<?= $categoriaSelecionadaId === null ? 'true' : 'false' ?>" aria-label="Mostrar Pins de todas as categorias">
                    <span class="categoria-titulo">Tudo</span>
                </button>
                <?php foreach ($categorias as $categoria): ?>
                <?php $selecionada = $categoriaSelecionadaId === (int) $categoria['id']; ?>
                <button class="categoria" type="button" data-categoria="<?= e((string) $categoria['nome']) ?>" data-categoria-id="<?= (int) $categoria['id'] ?>" data-categoria-label="<?= e((string) $categoria['nome']) ?>" aria-pressed="<?= $selecionada ? 'true' : 'false' ?>" aria-label="<?= $selecionada ? 'Categoria ' . e((string) $categoria['nome']) . ' selecionada' : 'Filtrar Pins pela categoria ' . e((string) $categoria['nome']) ?>">
                    <span class="categoria-titulo"><?= e((string) $categoria['nome']) ?></span>
                </button>
                <?php endforeach; ?>
            </div>
        </nav>

        <?php require __DIR__ . '/../includes/destaques_explorar.php'; ?>

        <section class="pins-explorar" aria-labelledby="titulo-pins">
            <h2 id="titulo-pins">Inspirações para você</h2>
            <?php if ($erroCarregamento !== ''): ?>
            <div class="estado-vazio" role="alert">
                <h2>Explorar indisponível</h2>
                <p><?= e($erroCarregamento) ?></p>
            </div>
            <?php elseif (!$pins && $busca === ''): ?>
            <div class="estado-vazio" role="status">
                <h2>Ainda não há Pins para explorar</h2>
                <p>As publicações aparecerão aqui quando forem compartilhadas.</p>
            </div>
            <?php elseif (!$pins): ?>
            <noscript><p role="status">Nenhum Pin encontrado. Tente outra pesquisa.</p></noscript>
            <?php endif; ?>
            <div id="grade-pins" data-categoria-selecionada="<?= e($categoriaSelecionada) ?>" data-erro-carregamento="<?= $erroCarregamento !== '' ? 'true' : 'false' ?>" aria-live="polite">
                <?php foreach ($pins as $pin): ?>
                    <?php require __DIR__ . '/../includes/card_pin.php'; ?>
                <?php endforeach; ?>
            </div>
        </section>
    </main>

    <?php require_once __DIR__ . '/../includes/rodape_principal.php'; ?>
    <script src="../../js/pesquisa.js" defer></script>
    <script src="../../js/explore.js" defer></script>
    <script src="../../js/menu.js" defer></script>
    <script src="../../js/acoes_php.js" defer></script>
    <script src="../../js/tema.js" defer></script>
</body>
</html>
