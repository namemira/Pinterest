<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pinterest</title>
      <link rel="stylesheet" href="../../css/principal.css">
    <link rel="stylesheet" href="../../css/tema.css">  
      <link rel="icon" href="../../Imagens/Icone.png">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
</head>
<body>
<!--Menu-->
<?php require_once __DIR__ . '../../includes/menu.php'; ?>
      <!--Cabecalho-->
<?php require_once __DIR__ . '../../includes/cabecalho_principal.php'; ?>

        <dialog class="principal-dialogo" id="dialogo-informativo" aria-labelledby="dialogo-informativo-titulo">
            <form method="dialog">
                <h2 id="dialogo-informativo-titulo"></h2>
                <p id="dialogo-informativo-texto"></p>
                <button class="principal-dialogo-primario" type="submit">Entendi</button>
            </form>
        </dialog>

        <dialog class="principal-dialogo principal-dialogo-criacao" id="dialogo-criacao" aria-labelledby="dialogo-criacao-titulo">
            <form id="formulario-composicao" novalidate>
                <header class="principal-dialogo-cabecalho">
                    <div>
                        <h2 id="dialogo-criacao-titulo">Criar colagem</h2>
                        <p id="dialogo-criacao-instrucao">Escolha Pins disponíveis para montar sua composição.</p>
                    </div>
                    <button class="principal-dialogo-fechar" type="button" data-fechar-composicao aria-label="Fechar interface de criação">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
                    </button>
                </header>
                <label class="composicao-campo" for="composicao-pins">Pins disponíveis</label>
                <div class="composicao-selecao">
                    <select id="composicao-pins" aria-describedby="composicao-ajuda"></select>
                    <button class="composicao-adicionar" type="button" id="composicao-adicionar">Adicionar</button>
                </div>
                <small id="composicao-ajuda">Selecione um Pin; em colagens, use Ctrl/Command+clique para selecionar vários. A criação fica salva neste navegador.</small>
                <label class="composicao-campo composicao-mensagem-campo" for="composicao-mensagem" hidden>Mensagem do cartão</label>
                <textarea id="composicao-mensagem" rows="3" maxlength="300" placeholder="Escreva uma mensagem..." hidden></textarea>
                <section class="composicao-previa" aria-labelledby="composicao-previa-titulo">
                    <h3 id="composicao-previa-titulo">Pré-visualização</h3>
                    <div class="composicao-previa-grade" id="composicao-previa-grade"></div>
                </section>
                <p class="composicao-status" id="composicao-status" role="status" aria-live="polite"></p>
                <footer class="principal-dialogo-acoes">
                    <button class="principal-dialogo-secundario" type="button" data-fechar-composicao>Cancelar</button>
                    <button class="principal-dialogo-primario" type="submit" id="composicao-finalizar">Finalizar criação</button>
                </footer>
            </form>
        </dialog>

<!--Feed Principal-->
        <section id="conteudo-pins">
        <h1 class="visualmente-oculto">Pins para você</h1>
        <main class="postagens" id="feed" aria-label="Pins">
        </main>
        </section>
        <section class="pagina-criar-pin" id="pagina-criar-pin" aria-labelledby="titulo-criar-pin" hidden>
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
                        <div class="criar-pin-previa" id="criar-pin-previa" hidden><img id="criar-pin-imagem" alt="Prévia da imagem do Pin"></div>
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
                    <select id="criar-pin-pasta" name="pasta"><option value="">Não organizar em uma pasta</option></select>
                    <p class="criar-pin-mensagem" id="criar-pin-mensagem" role="status" aria-live="polite"></p>
                    <button class="criar-pin-publicar" type="submit" disabled>Publicar Pin</button>
                    <button class="criar-pin-cancelar" type="button">Cancelar</button>
                </section>
            </form>
        </section>
<!--Rodapé com aviso de projeto acadêmico-->
 <?php require_once __DIR__ . '../../includes/rodape_principal.php'; ?>
<!--Scripts Javascript-->
<script src="../../js/pesquisa.js" defer></script>
<script src="../../js/menu.js" defer></script>
<script src="../../js/pins.js" defer></script>
<script src="../../js/interacoes_pins.js" defer></script>
<script src="../../js/pastas.js" defer></script>
<script src="../../js/detalhes_pin.js" defer></script>
<script src="../../js/criar_pin.js" defer></script>
<script src="../../js/menus_principal.js" defer></script>
<script src="../../js/tema.js" defer></script>
</body>
</html>
