<?php
/**
 * Card de um Pin. Antes de incluir este arquivo, defina:
 *   $pin          linha retornada pelas funções de pins.php
 *   $opcoesCard   (opcional) ['pastas' => [...], 'pastaAtual' => id]
 *
 * Usa as mesmas classes (.post, .pin-actions...) do protótipo em JavaScript,
 * então o visual e a pesquisa (pesquisa.js) continuam funcionando.
 */
$opcoesCard = $opcoesCard ?? [];
$usuarioCard = usuarioLogadoId();
$tituloCard = (string) $pin['titulo'];
$voltarCard = paginaAtual();
$ehDonoCard = $usuarioCard !== null && (int) $pin['usuario_id'] === $usuarioCard;
$salvoCard = (bool) ($pin['salvo'] ?? false);
$imagemCard = urlArquivo($pin['caminho_imagem']);
?>
<article class="post" id="pin-<?= (int) $pin['id'] ?>" data-pin-id="<?= (int) $pin['id'] ?>"
         aria-label="Pin: <?= e($tituloCard) ?>"
         data-pin-titulo="<?= e($tituloCard) ?>"
         data-pin-descricao="<?= e((string) ($pin['descricao'] ?? '')) ?>"
         data-pin-categoria="<?= e((string) $pin['categoria']) ?>"
         data-pin-link="<?= e((string) ($pin['link_destino'] ?? '')) ?>"
         data-pin-autor="<?= e((string) $pin['autor']) ?>"
         data-pin-autor-foto="<?= e(urlFotoPerfil($pin['autor_foto'] ?? null) ?? '') ?>"
         data-pin-imagem="<?= e($imagemCard) ?>">
    <div class="post-image">
        <img src="<?= e($imagemCard) ?>" alt="<?= e($pin['texto_alternativo'] ?: $tituloCard) ?>" loading="lazy">
        <?php if ($usuarioCard !== null): ?>
        <div class="pin-actions" role="group" aria-label="Ações para <?= e($tituloCard) ?>">
            <!-- RN02: o botão alterna entre Salvar e Salvo; o servidor impede duplicatas -->
            <form method="post" action="../acoes/pin_salvar.php">
                <?= campoCsrf() ?>
                <input type="hidden" name="pin_id" value="<?= (int) $pin['id'] ?>">
                <input type="hidden" name="acao" value="<?= $salvoCard ? 'remover' : 'salvar' ?>">
                <input type="hidden" name="voltar" value="<?= e($voltarCard . '#pin-' . (int) $pin['id']) ?>">
                <button class="pin-action pin-action-salvar<?= $salvoCard ? ' pin-salvo' : '' ?>" type="submit"
                        data-label="<?= $salvoCard ? 'Salvo' : 'Salvar' ?>"
                        data-label-salvo="Salvo"
                        aria-pressed="<?= $salvoCard ? 'true' : 'false' ?>"
                        aria-label="<?= $salvoCard ? 'Remover dos salvos' : 'Salvar Pin' ?>: <?= e($tituloCard) ?>"></button>
            </form>
            <?php if (!empty($paginaFeed)): ?>
            <button class="pin-action pin-action-compartilhar" type="button" data-acao-pin="compartilhar" data-label="Compartilhar"
                    aria-label="Compartilhar Pin: <?= e($tituloCard) ?>"></button>
            <button class="pin-action pin-action-mais" type="button" data-menu-pin
                    aria-haspopup="menu" aria-controls="menu-opcoes-pin" aria-expanded="false"
                    aria-label="Mais opções para <?= e($tituloCard) ?>"></button>
            <?php endif; ?>
        </div>
        <?php endif; ?>
    </div>
    <div class="post-informacoes"<?= !empty($paginaFeed) ? ' hidden' : '' ?>>
    <h2 class="post-titulo"><?= e($tituloCard) ?></h2>
    <?php if (!empty($pin['descricao'])): ?>
    <p class="post-descricao"><?= e($pin['descricao']) ?></p>
    <?php endif; ?>
    <p class="post-categoria">Categoria: <?= e($pin['categoria']) ?></p>
    <p class="post-autor">Por <?= e($pin['autor']) ?></p>
    <?php if (!empty($pin['link_destino'])): ?>
    <a href="<?= e($pin['link_destino']) ?>" target="_blank" rel="noopener noreferrer" aria-label="Abrir link de destino: <?= e($tituloCard) ?>">Abrir link</a>
    <?php endif; ?>

    <?php if (!empty($opcoesCard['pastas'])): ?>
    <!-- Organizar o Pin em uma pasta do usuário -->
    <form class="post-pasta-form" method="post" action="../acoes/pasta.php">
        <?= campoCsrf() ?>
        <input type="hidden" name="acao" value="adicionar_pin">
        <input type="hidden" name="pin_id" value="<?= (int) $pin['id'] ?>">
        <input type="hidden" name="voltar" value="<?= e($voltarCard) ?>">
        <label class="visualmente-oculto" for="pasta-pin-<?= (int) $pin['id'] ?>">Pasta para <?= e($tituloCard) ?></label>
        <select id="pasta-pin-<?= (int) $pin['id'] ?>" name="pasta_id" required>
            <option value="">Mover para pasta…</option>
            <?php foreach ($opcoesCard['pastas'] as $pastaOpcao): ?>
            <option value="<?= (int) $pastaOpcao['id'] ?>"><?= e($pastaOpcao['nome']) ?></option>
            <?php endforeach; ?>
        </select>
        <button type="submit">Adicionar</button>
    </form>
    <?php endif; ?>

    <?php if (!empty($opcoesCard['pastaAtual'])): ?>
    <form class="post-dono-acoes" method="post" action="../acoes/pasta.php">
        <?= campoCsrf() ?>
        <input type="hidden" name="acao" value="remover_pin">
        <input type="hidden" name="pasta_id" value="<?= (int) $opcoesCard['pastaAtual'] ?>">
        <input type="hidden" name="pin_id" value="<?= (int) $pin['id'] ?>">
        <input type="hidden" name="voltar" value="<?= e($voltarCard) ?>">
        <button type="submit" class="botao-texto">Remover da pasta</button>
    </form>
    <?php endif; ?>

    <?php if ($ehDonoCard): ?>
    <!-- Editar e excluir aparecem só para o autor (o servidor também confere) -->
    <div class="post-dono-acoes">
        <a class="botao-texto" href="editar_pin.php?id=<?= (int) $pin['id'] ?>">Editar</a>
        <form method="post" action="../acoes/pin_excluir.php" data-confirmar="Excluir o Pin &quot;<?= e($tituloCard) ?>&quot;? Esta ação não pode ser desfeita.">
            <?= campoCsrf() ?>
            <input type="hidden" name="pin_id" value="<?= (int) $pin['id'] ?>">
            <input type="hidden" name="voltar" value="<?= e($voltarCard) ?>">
            <button type="submit" class="botao-texto botao-perigo">Excluir</button>
        </form>
    </div>
    <?php endif; ?>
    </div>
</article>
