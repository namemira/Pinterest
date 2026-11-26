<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

if (usuarioEstaAutenticado()) {
    $parametros = [];
    foreach (['q', 'busca', 'categoria_id'] as $campo) {
        if (valorGet($campo) !== '') {
            $parametros[$campo] = valorGet($campo);
        }
    }
    header('Location: explorar.php' . ($parametros ? '?' . http_build_query($parametros) : ''), true, 303);
    exit;
}

$busca = mb_substr(
    valorGet('q') !== '' ? valorGet('q') : valorGet('busca'),
    0,
    100,
    'UTF-8'
);
$termoBuscaCabecalho = $busca;
$categorias = [];
$pins = [];
$gruposCategoria = [];
$erroCarregamento = '';
$categoriaSelecionadaId = null;
$categoriaSelecionada = '';
$paginaExplorar = true;

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

    $pins = listarPins($pdo, null, $busca, null);

    $gruposCategoria = agruparPinsPorCategoria($pins, $categoriaSelecionadaId);
} catch (Throwable $erro) {
    error_log('Falha ao carregar Explorar: ' . $erro->getMessage());
    $categorias = [];
    $pins = [];
    $gruposCategoria = [];
    $erroCarregamento = 'Não foi possível carregar as ideias agora. Tente novamente mais tarde.';
}

$aviso = obterAviso();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Explore Pins e categorias para inspirar seus próximos projetos.">
    <title>Explorar | Pinterest</title>
    <link rel="stylesheet" href="../../css/inicial.css">
    <link rel="stylesheet" href="../../css/principal.css">
    <link rel="stylesheet" href="../../css/explore.css">
    <link rel="stylesheet" href="../../css/tema.css">
    <link rel="icon" href="../../Imagens/Icone.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
</head>
<body class="pagina-explorar">
    <a class="skip-link" href="#conteudo-principal">Pular para o conteúdo</a>
    <?php require_once __DIR__ . '/../includes/cabecalho_inicial.php'; ?>

    <nav class="explore-categories" aria-label="Categorias de descoberta">
        <div id="lista-categorias">
            <button class="categoria" type="button" data-categoria="" data-categoria-id="" data-categoria-label="Tudo" aria-pressed="<?= $categoriaSelecionadaId === null ? 'true' : 'false' ?>" aria-label="Mostrar Pins de todas as categorias">
                <span class="categoria-titulo">Tudo</span>
            </button>
            <?php foreach ($categorias as $categoria): ?>
            <?php $categoriaEstaSelecionada = $categoriaSelecionadaId === (int) $categoria['id']; ?>
            <button class="categoria" type="button" data-categoria="<?= e((string) $categoria['nome']) ?>" data-categoria-id="<?= (int) $categoria['id'] ?>" data-categoria-label="<?= e((string) $categoria['nome']) ?>" aria-pressed="<?= $categoriaEstaSelecionada ? 'true' : 'false' ?>" aria-label="<?= $categoriaEstaSelecionada ? 'Categoria ' . e((string) $categoria['nome']) . ' selecionada' : 'Filtrar Pins pela categoria ' . e((string) $categoria['nome']) ?>">
                <span class="categoria-titulo"><?= e((string) $categoria['nome']) ?></span>
            </button>
            <?php endforeach; ?>
        </div>
    </nav>

    <main class="conteudo-explorar" id="conteudo-principal">
        <?= exibirAviso($aviso) ?>
        <section class="explore-hero" aria-labelledby="titulo-explorar">
            <div class="explore-hero-copy">
                <span class="explore-label">Explorar</span>
                <h1 id="titulo-explorar">Encontre sua próxima ideia</h1>
                <p>Comece de qualquer lugar e descubra ideias que levam você a novos lugares.</p>
                <p class="explore-convite"><a href="cadastro.php">Crie uma conta</a> ou <a href="login.php">entre</a> para salvar suas ideias.</p>
            </div>
            <div class="explore-hero-mosaic" role="group" aria-label="Inspirações de arte, moda, decoração, receitas e viagens">
                <img class="mosaic-dog" src="../../Imagens/dog.jpg" alt="Filhote de cachorro diante de um fundo azul">
                <img class="mosaic-art" src="../../Imagens/arte.jpg" alt="Pintura de paisagem surreal em tons de azul e verde">
                <img class="mosaic-fashion" src="../../Imagens/moda.jpg" alt="Vestido branco de noiva com renda">
                <img class="mosaic-home" src="../../Imagens/decoracao.jpg" alt="Sala aconchegante com decoração em tons naturais">
                <img class="mosaic-travel" src="../../Imagens/viagens.jpg" alt="Praia de águas azul-turquesa cercada por areia clara e morros verdes">
            </div>
        </section>

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
            <noscript>
                <div class="estado-vazio" role="status">
                    <h2>Nenhum Pin encontrado</h2>
                    <p>Tente outra pesquisa para encontrar ideias.</p>
                </div>
            </noscript>
            <?php endif; ?>
            <div id="grade-pins" data-categoria-selecionada="<?= e($categoriaSelecionada) ?>" data-erro-carregamento="<?= $erroCarregamento !== '' ? 'true' : 'false' ?>" aria-live="polite">
                <?php foreach ($pins as $pin): ?>
                    <?php require __DIR__ . '/../includes/card_pin.php'; ?>
                <?php endforeach; ?>
            </div>
        </section>
    </main>

    <?php require_once __DIR__ . '/../includes/rodape_inicial.php'; ?>

    <script src="../../js/pesquisa.js" defer></script>
    <script src="../../js/explore.js" defer></script>
</body>
</html>
