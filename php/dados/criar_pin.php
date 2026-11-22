<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pinterest</title>
    <link rel="stylesheet" href="../../css/principal.css">
      <link rel="icon" href="../../Imagens/Icone.png">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="../../css/tema.css">  
</head>
<body>
    <!--Menu-->
    <?php require_once __DIR__ . '/../includes/menu.php'; ?>
<!--Cabecalho-->
<?php require_once __DIR__ . '/../includes/cabecalho_principal.php'; ?>
    <!--Criacao do Pin-->
    <main>
        <section class="pagina-criar-pin" id="pagina-criar-pin"  aria-labelledby="titulo-criar-pin">
            <header class="criar-pin-cabecalho">
                <div>
                    <h1 id="titulo-criar-pin">Criar Pin</h1>
                    <p>Adicione uma imagem e alguns detalhes para compartilhar sua ideia.</p>
                </div>
                <button class="criar-pin-publicar-topo" type="submit" form="formulario-criar-pin" disabled>Publicar</button>
            </header>

            <form class="criar-pin-formulario" id="formulario-criar-pin" novalidate>
                <section class="criar-pin-imagem" aria-label="Imagem do Pin">
                    <div class="criar-pin-soltar" id="criar-pin-soltar" role="button" tabindex="0" aria-describedby="criar-pin-orientacao">
                        <div class="criar-pin-orientacao" id="criar-pin-orientacao">
                            <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 8v22m-9-9 9 9 9-9"/><path d="M10 31v8a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2v-8"/></svg>
                            <strong>Escolha uma imagem</strong>
                            <span>ou arraste e solte aqui</span>
                            <small>JPG, PNG ou WEBP · até 10 MB</small>
                        </div>
                        <input class="criar-pin-arquivo" id="criar-pin-arquivo" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" hidden>
                        <div class="criar-pin-previa" id="criar-pin-previa" hidden>
                            <img id="criar-pin-imagem" alt="Prévia da imagem do Pin">
                        </div>
                    </div>
                    <div class="criar-pin-imagem-acoes" id="criar-pin-imagem-acoes" hidden>
                        <button class="criar-pin-substituir" type="button">Substituir imagem</button>
                        <button class="criar-pin-remover" type="button">Remover imagem</button>
                    </div>
                </section>

                <section class="criar-pin-informacoes" aria-label="Informações do Pin">
                    <label for="criar-pin-titulo">Título <span aria-hidden="true">*</span></label>
                    <input id="criar-pin-titulo" name="titulo" type="text" maxlength="100" placeholder="Adicione um título" required>

                    <label for="criar-pin-descricao">Descrição</label>
                    <textarea id="criar-pin-descricao" name="descricao" rows="5" maxlength="500" placeholder="Conte às pessoas sobre sua ideia"></textarea>

                    <label for="criar-pin-link">Link de destino <span class="criar-pin-opcional">(opcional)</span></label>
                    <input id="criar-pin-link" name="link" type="url" inputmode="url" placeholder="https://exemplo.com">

                    <label for="criar-pin-pasta">Pasta <span class="criar-pin-opcional">(opcional)</span></label>
                    <select id="criar-pin-pasta" name="pasta">
                        <option value="">Não organizar em uma pasta</option>
                    </select>

                    <p class="criar-pin-mensagem" id="criar-pin-mensagem" role="status" aria-live="polite"></p>
                    <button class="criar-pin-publicar" type="submit" disabled>Publicar Pin</button>
                    <button class="criar-pin-cancelar" type="button">Cancelar</button>
                </section>
            </form>
        </section>
    </main>
<section id="conteudo-pins" hidden aria-label="Pins do feed">
    <div class="postagens" id="feed"></div>
</section>
<!--Rodapé com aviso de projeto acadêmico-->
<?php require_once __DIR__ . '/../includes/rodape_principal.php'; ?>
<script src="../../js/pesquisa.js" defer></script>
<script src="../../js/menu.js" defer></script>
<script src="../../js/pins.js" defer></script>
<script src="../../js/interacoes_pins.js" defer></script>
<script src="../../js/pastas.js" defer></script>
<script src="../../js/detalhes_pin.js" defer></script>
<script src="../../js/criar_pin.js" defer></script>
<script src="../../js/tema.js" defer></script>
</body>
</html>
