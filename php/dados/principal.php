<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

// Feed disponível apenas para usuários autenticados.
$usuarioId = exigirLoginNaPagina();
$aviso = obterAviso();
$paginaFeed = true;

try {
    $pins = listarPins(criarConexao(), null, '', $usuarioId);
} catch (Throwable $erro) {
    error_log('Falha ao carregar o feed: ' . $erro->getMessage());
    $pins = [];
    $aviso = ['tipo' => 'erro', 'texto' => 'Não foi possível carregar os Pins agora.'];
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pinterest</title>
      <link rel="stylesheet" href="../../css/principal.css">
    <link rel="stylesheet" href="../../css/tema.css">
    <link rel="stylesheet" href="../../css/php.css">
      <link rel="icon" href="../../Imagens/Icone.png">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
</head>
<body class="pagina-feed">
<!--Menu-->
<?php require_once __DIR__ . '/../includes/menu.php'; ?>
      <!--Cabecalho-->
<?php require_once __DIR__ . '/../includes/cabecalho_principal.php'; ?>

        <dialog class="principal-dialogo" id="dialogo-informativo" aria-labelledby="dialogo-informativo-titulo">
            <form method="dialog">
                <h2 id="dialogo-informativo-titulo"></h2>
                <p id="dialogo-informativo-texto"></p>
                <button class="principal-dialogo-primario" type="submit">Entendi</button>
            </form>
        </dialog>

<!--Feed Principal: Pins carregados do banco de dados-->
        <section id="conteudo-pins">
        <h1 class="visualmente-oculto">Pins para você</h1>
        <div class="area-avisos"><?= exibirAviso($aviso) ?></div>
        <?php if (!$pins): ?>
        <div class="estado-vazio" id="estado-vazio-feed">
            <h2>Ainda não há Pins por aqui</h2>
            <p>Seja a primeira pessoa a compartilhar uma ideia.</p>
            <a class="botao-primario" href="criar_pin.php">Criar Pin</a>
        </div>
        <?php endif; ?>
        <main class="postagens" id="feed" aria-label="Pins" data-usuario-id="<?= $usuarioId ?>" data-total-pins="<?= count($pins) ?>">
            <?php foreach ($pins as $pin): ?>
                <?php require __DIR__ . '/../includes/card_pin.php'; ?>
            <?php endforeach; ?>
        </main>
        <p class="pin-mural-vazio" id="pin-mural-vazio" role="status" hidden>Você ocultou todos os Pins deste mural.</p>
        </section>
        <dialog class="principal-dialogo pin-denuncia-dialogo" id="dialogo-denuncia-pin" aria-labelledby="titulo-denuncia-pin">
            <form method="post" action="../acoes/pin_denunciar.php">
                <?= campoCsrf() ?>
                <input type="hidden" name="pin_id" id="denuncia-pin-id">
                <input type="hidden" name="voltar" id="denuncia-voltar" value="principal.php#feed">
                <h2 id="titulo-denuncia-pin">Denunciar Pin</h2>
                <p>Selecione o motivo. A denúncia será enviada para análise.</p>
                <label for="denuncia-motivo">Motivo</label>
                <select id="denuncia-motivo" name="motivo" required>
                    <option value="">Selecione um motivo</option>
                    <option value="conteudo_inadequado">Conteúdo inadequado</option>
                    <option value="spam">Spam ou conteúdo enganoso</option>
                    <option value="direitos_autorais">Violação de direitos autorais</option>
                    <option value="outro">Outro</option>
                </select>
                <label for="denuncia-detalhes">Detalhes (opcional)</label>
                <textarea id="denuncia-detalhes" name="detalhes" maxlength="500" rows="4"></textarea>
                <div class="pin-denuncia-acoes">
                    <button class="botao-secundario" type="button" data-fechar-denuncia>Cancelar</button>
                    <button class="botao-primario" type="submit">Enviar denúncia</button>
                </div>
            </form>
        </dialog>
<!--Rodapé com aviso de projeto acadêmico-->
 <?php require_once __DIR__ . '/../includes/rodape_principal.php'; ?>
<!--Scripts Javascript-->
<script src="../../js/pesquisa.js" defer></script>
<script src="../../js/menu.js" defer></script>
<script src="../../js/acoes_php.js" defer></script>
<script src="../../js/interacoes_pins.js" defer></script>
<script src="../../js/detalhes_pin.js" defer></script>
<script src="../../js/pin_mural.js" defer></script>
<script src="../../js/tema.js" defer></script>
</body>
</html>
