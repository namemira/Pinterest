<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

// Explorar é público: visitantes veem os Pins; salvar exige login.
$usuarioId = usuarioLogadoId();
$aviso = obterAviso();

// A busca chega como ?q= (página Inicial) ou ?busca= (pesquisa do cabeçalho).
$busca = mb_substr(valorGet('q') !== '' ? valorGet('q') : valorGet('busca'), 0, 100, 'UTF-8');
$categoriaId = null;
$categoriaAtual = null;

try {
    $pdo = criarConexao();
    $categorias = listarCategorias($pdo);

    if (valorGet('categoria') !== '') {
        try {
            $categoriaId = inteiroPositivo(valorGet('categoria'), 'categoria');
        } catch (InvalidArgumentException $erro) {
            $categoriaId = null;
        }
        foreach ($categorias as $categoria) {
            if ((int) $categoria['id'] === $categoriaId) {
                $categoriaAtual = $categoria;
            }
        }
        if ($categoriaAtual === null) {
            $categoriaId = null;
        }
    }

    $emAlta = listarPinsEmAlta($pdo, 3, $usuarioId);
    $pins = listarPins($pdo, $categoriaId, $busca, $usuarioId);
} catch (Throwable $erro) {
    error_log('Falha ao carregar Explorar: ' . $erro->getMessage());
    $categorias = $emAlta = $pins = [];
    $aviso = ['tipo' => 'erro', 'texto' => 'Não foi possível carregar as ideias agora.'];
}

$tituloGrade = 'Inspirações para você';
if ($categoriaAtual !== null) {
    $tituloGrade = 'Categoria: ' . $categoriaAtual['nome'];
}
if ($busca !== '') {
    $tituloGrade = 'Resultados para "' . $busca . '"';
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Explorar | Pinterest</title>
      <link rel="stylesheet" href="../../css/principal.css">
      <link rel="stylesheet" href="../../css/tema.css">
      <link rel="stylesheet" href="../../css/php.css">
      <link rel="icon" href="../../Imagens/Icone.png">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
</head>
<body>
<!--Menu-->
<?php require_once __DIR__ . '/../includes/menu.php'; ?>
<!--Cabecalho-->
<?php require_once __DIR__ . '/../includes/cabecalho_principal.php'; ?>
    <main class="conteudo-explorar">

    <section class="titulo-explorar">
        <h1>Explore novas ideias</h1>
        <p>Descubra inspirações para você.</p>
        <?= exibirAviso($aviso) ?>
    </section>

    <!-- Categorias vindas da tabela categorias -->
    <section class="categorias">
        <h2>Categorias</h2>
        <div id="lista-categorias">
            <?php foreach ($categorias as $categoria): ?>
            <a class="categoria<?= $categoriaId === (int) $categoria['id'] ? ' categoria-ativa' : '' ?>"
               href="explore.php?categoria=<?= (int) $categoria['id'] ?>"
               <?= $categoriaId === (int) $categoria['id'] ? 'aria-current="true"' : '' ?>>
                <img src="<?= e(urlArquivo($categoria['imagem_referencia'], 'Imagens/Icone.png')) ?>" alt="">
                <span class="categoria-titulo"><?= e($categoria['nome']) ?></span>
                <span class="categoria-total"><?= contarPins((int) $categoria['total_pins']) ?></span>
            </a>
            <?php endforeach; ?>
        </div>
        <?php if ($categoriaId !== null || $busca !== ''): ?>
        <p><a class="botao-texto" href="explore.php">Limpar filtros</a></p>
        <?php endif; ?>
    </section>

    <!-- Em alta: Pins mais salvos pelos usuários -->
    <?php if ($emAlta && $categoriaId === null && $busca === ''): ?>
    <section class="tendencias">
        <h2>Em alta</h2>
        <div id="lista-tendencias">
            <?php foreach ($emAlta as $pinAlta): ?>
            <a class="tendencia" href="#pin-<?= (int) $pinAlta['id'] ?>">
                <img src="<?= e(urlArquivo($pinAlta['caminho_imagem'])) ?>" alt="">
                <h3><?= e($pinAlta['titulo']) ?></h3>
            </a>
            <?php endforeach; ?>
        </div>
    </section>
    <?php endif; ?>

    <section class="pins-explorar">
        <h2><?= e($tituloGrade) ?></h2>
        <?php if (!$pins): ?>
        <p class="estado-vazio-texto">Nenhum Pin encontrado.</p>
        <?php endif; ?>
        <div id="grade-pins">
            <?php foreach ($pins as $pin): ?>
                <?php require __DIR__ . '/../includes/card_pin.php'; ?>
            <?php endforeach; ?>
        </div>
    </section>
</main>
<!--Rodapé com aviso de projeto acadêmico-->
<?php require_once __DIR__ . '/../includes/rodape_principal.php'; ?>
<script src="../../js/pesquisa.js" defer></script>
<script src="../../js/menu.js" defer></script>
<script src="../../js/acoes_php.js" defer></script>
<script src="../../js/tema.js" defer></script>
</body>
</html>
