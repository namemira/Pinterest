<?php if ($gruposCategoria): ?>
<section class="pastas-destaque" aria-labelledby="titulo-pastas-destaque">
    <h2 id="titulo-pastas-destaque">Ideias por categoria</h2>
    <div id="lista-pastas-destaque">
        <?php foreach (array_slice($gruposCategoria, 0, 5, true) as $grupo): ?>
        <article class="pasta-destaque">
            <div class="pasta-destaque-imagens">
                <?php foreach ($grupo['imagens'] as $imagem): ?>
                <img src="<?= e(urlArquivo($imagem['caminho'])) ?>" alt="<?= e($imagem['alt']) ?>" loading="lazy">
                <?php endforeach; ?>
            </div>
            <h3><?= e($grupo['nome']) ?></h3>
            <p><?= e(contarPins((int) $grupo['total'])) ?></p>
        </article>
        <?php endforeach; ?>
    </div>
</section>

<section class="tendencias" aria-labelledby="titulo-tendencias">
    <h2 id="titulo-tendencias">Mais Pins por categoria</h2>
    <div id="lista-tendencias">
        <?php foreach (array_slice($gruposCategoria, 0, 3, true) as $grupo): ?>
        <?php $imagemDestaque = $grupo['imagens'][0] ?? null; ?>
        <?php if ($imagemDestaque !== null): ?>
        <article class="tendencia">
            <img src="<?= e(urlArquivo($imagemDestaque['caminho'])) ?>" alt="<?= e($imagemDestaque['alt']) ?>" loading="lazy">
            <h3><?= e($grupo['nome']) ?> · <?= e(contarPins((int) $grupo['total'])) ?></h3>
        </article>
        <?php endif; ?>
        <?php endforeach; ?>
    </div>
</section>
<?php endif; ?>
