<?php
/**
 * Formulário usado em criar_pin.php e editar_pin.php. Variáveis esperadas:
 *   $modoEdicao (bool), $dados (array com os valores), $categorias, $pastas,
 *   $imagemAtual (string|null), $mensagem, $tipoMensagem
 */
$tituloPagina = $modoEdicao ? 'Editar Pin' : 'Criar Pin';
$textoBotao = $modoEdicao ? 'Salvar alterações' : 'Publicar Pin';
?>
        <section class="pagina-criar-pin" id="pagina-criar-pin" aria-labelledby="titulo-criar-pin">
            <header class="criar-pin-cabecalho">
                <div>
                    <h1 id="titulo-criar-pin"><?= $tituloPagina ?></h1>
                    <p><?= $modoEdicao ? 'Altere as informações do seu Pin.' : 'Adicione uma imagem e alguns detalhes para compartilhar sua ideia.' ?></p>
                </div>
                <button class="criar-pin-publicar-topo" type="submit" form="formulario-criar-pin"><?= $modoEdicao ? 'Salvar' : 'Publicar' ?></button>
            </header>

            <!-- enctype multipart: necessário para enviar a imagem ao PHP -->
            <form class="criar-pin-formulario" id="formulario-criar-pin" method="post" enctype="multipart/form-data" novalidate data-imagem-obrigatoria="<?= $modoEdicao ? 'false' : 'true' ?>">
                <?= campoCsrf() ?>
                <input type="hidden" name="MAX_FILE_SIZE" value="<?= TAMANHO_MAXIMO_IMAGEM ?>">
                <section class="criar-pin-imagem" aria-label="Imagem do Pin">
                    <div class="criar-pin-soltar" id="criar-pin-soltar" role="button" tabindex="0" aria-describedby="criar-pin-orientacao">
                        <div class="criar-pin-orientacao" id="criar-pin-orientacao"<?= $imagemAtual ? ' hidden' : '' ?>>
                            <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 8v22m-9-9 9 9 9-9"/><path d="M10 31v8a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2v-8"/></svg>
                            <strong>Escolha uma imagem</strong>
                            <span>ou arraste e solte aqui</span>
                            <small>JPG, PNG ou WEBP · até 10 MB</small>
                        </div>
                        <input class="criar-pin-arquivo" id="criar-pin-arquivo" name="imagem" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" data-tamanho-maximo="<?= TAMANHO_MAXIMO_IMAGEM ?>" hidden>
                        <div class="criar-pin-previa" id="criar-pin-previa"<?= $imagemAtual ? '' : ' hidden' ?>>
                            <img id="criar-pin-imagem" alt="Prévia da imagem do Pin"<?= $imagemAtual ? ' src="' . e($imagemAtual) . '"' : '' ?>>
                        </div>
                    </div>
                    <div class="criar-pin-imagem-acoes" id="criar-pin-imagem-acoes"<?= $imagemAtual ? '' : ' hidden' ?>>
                        <button class="criar-pin-substituir" type="button">Substituir imagem</button>
                        <?php if (!$modoEdicao): ?>
                        <button class="criar-pin-remover" type="button">Remover imagem</button>
                        <?php endif; ?>
                    </div>
                </section>

                <section class="criar-pin-informacoes" aria-label="Informações do Pin">
                    <label for="criar-pin-titulo">Título <span aria-hidden="true">*</span></label>
                    <input id="criar-pin-titulo" name="titulo" type="text" maxlength="100" placeholder="Adicione um título" required value="<?= e($dados['titulo']) ?>">

                    <label for="criar-pin-descricao">Descrição</label>
                    <textarea id="criar-pin-descricao" name="descricao" rows="5" maxlength="500" placeholder="Conte às pessoas sobre sua ideia"><?= e($dados['descricao']) ?></textarea>

                    <label for="criar-pin-categoria">Categoria <span aria-hidden="true">*</span></label>
                    <select id="criar-pin-categoria" name="categoria_id" required>
                        <option value="">Selecione uma categoria</option>
                        <?php foreach ($categorias as $categoria): ?>
                        <option value="<?= (int) $categoria['id'] ?>"<?= (string) $categoria['id'] === (string) $dados['categoria_id'] ? ' selected' : '' ?>><?= e($categoria['nome']) ?></option>
                        <?php endforeach; ?>
                    </select>

                    <label for="criar-pin-alt">Texto alternativo <span class="criar-pin-opcional">(opcional)</span></label>
                    <input id="criar-pin-alt" name="texto_alternativo" type="text" maxlength="255" placeholder="Descreva a imagem para quem usa leitor de tela" value="<?= e($dados['texto_alternativo']) ?>">

                    <label for="criar-pin-link">Link de destino <span class="criar-pin-opcional">(opcional)</span></label>
                    <input id="criar-pin-link" name="link" type="url" inputmode="url" placeholder="https://exemplo.com" value="<?= e($dados['link']) ?>">

                    <?php if (!$modoEdicao): ?>
                    <label for="criar-pin-pasta">Pasta <span class="criar-pin-opcional">(opcional)</span></label>
                    <select id="criar-pin-pasta" name="pasta">
                        <option value="">Não organizar em uma pasta</option>
                        <?php foreach ($pastas as $pasta): ?>
                        <option value="<?= (int) $pasta['id'] ?>"<?= (string) $pasta['id'] === (string) $dados['pasta'] ? ' selected' : '' ?>><?= e($pasta['nome']) ?></option>
                        <?php endforeach; ?>
                    </select>
                    <?php endif; ?>

                    <p class="criar-pin-mensagem<?= $mensagem !== '' ? ' criar-pin-mensagem-' . e($tipoMensagem) : '' ?>" id="criar-pin-mensagem" role="<?= $tipoMensagem === 'erro' ? 'alert' : 'status' ?>" aria-live="polite"><?= e($mensagem) ?></p>
                    <button class="criar-pin-publicar" type="submit"><?= $textoBotao ?></button>
                    <a class="criar-pin-cancelar" href="<?= $modoEdicao ? 'perfil.php?aba=criados' : 'principal.php' ?>">Cancelar</a>
                </section>
            </form>
        </section>
