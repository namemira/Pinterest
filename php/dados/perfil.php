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
      <link rel="stylesheet" href="../../css/tema.css">  
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
</head>
<body>
<!--Menu-->
<?php require_once __DIR__ . '/../includes/menu.php'; ?>
<!--Cabecalho-->
<?php require_once __DIR__ . '/../includes/cabecalho_principal.php'; ?>
        <main class="pagina-perfil">
    <section class="pagina-pastas" id="pagina-pastas"  aria-labelledby="perfil-nome">
                <header class="perfil-pastas">
                    <img class="perfil-pastas-foto" src="../../Imagens/dog.jpg" alt="Foto do perfil">
                    <div class="perfil-pastas-identidade">
                        <h1 id="perfil-nome">Seu perfil</h1>
                        <p>Seguidores e pessoas seguindo ainda não disponíveis</p>
                    </div>
                    <button class="perfil-compartilhar" type="button">Compartilhar perfil</button>
                </header>
                <p class="perfil-pastas-status" role="status" aria-live="polite"></p>

                <div class="perfil-abas" role="tablist" aria-label="Conteúdo do perfil">
                    <button id="aba-perfil-pins" type="button" role="tab" aria-selected="false" aria-controls="conteudo-pins" tabindex="-1">Pins</button>
                    <button id="aba-perfil-pastas" type="button" role="tab" aria-selected="true" aria-controls="conteudo-pastas" tabindex="0">Pastas</button>
                </div>
<!-- Conteúdo da aba Pins -->
                <section id="conteudo-pins" role="tabpanel" aria-labelledby="aba-perfil-pins" hidden>

                    <!-- Grade que reúne os Pins do perfil -->
                    <div class="postagens">
                        <!-- Os cards dos Pins serão inseridos aqui pelo JavaScript -->
                    </div>

                </section>
<!--Area das Pastas-->
                <section class="organizacao-pastas" id="conteudo-pastas" role="tabpanel" aria-labelledby="aba-perfil-pastas">
                    <header class="pastas-pagina-cabecalho">
                        <div class="pastas-filtros">
                            <button class="botao-filtros" type="button" aria-expanded="false" aria-controls="opcoes-filtros-pastas">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10m-7 6h4"/></svg>
                                Filtros
                            </button>
                            <div class="opcoes-filtros-pastas" id="opcoes-filtros-pastas" hidden>
                                <button type="button" data-filtro-pastas="todas" aria-pressed="true">Todas as pastas</button>
                                <button type="button" data-filtro-pastas="compartilhadas" aria-pressed="false">Pastas compartilhadas</button>
                            </div>
                        </div>
                        <button class="pastas-criar-pagina" type="button">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                            Criar
                        </button>
                    </header>

                    <div class="pastas-vazio-pagina" id="pastas-vazio-pagina" hidden>
                        <div class="pastas-vazio-ilustracao" aria-hidden="true">
                            <svg viewBox="0 0 180 140"><rect x="34" y="34" width="92" height="76" rx="14"/><path d="M48 34V22a8 8 0 0 1 8-8h66a8 8 0 0 1 8 8v62"/><path d="M57 63h48M57 78h34"/><circle cx="127" cy="94" r="25"/><path d="M127 82v24m-12-12h24"/></svg>
                        </div>
                        <h2>Organize suas ideias</h2>
                        <p>Crie pastas para reunir e organizar os Pins que você salvou.</p>
                        <button class="pastas-criar-vazia" type="button">Criar uma pasta</button>
                    </div>

                    <p class="pastas-pagina-mensagem" id="pastas-pagina-mensagem" role="status" aria-live="polite" hidden></p>
                    <div class="pastas-grade" id="pastas-grade"></div>
                    <section class="pastas-detalhe-pagina" id="pastas-detalhe-pagina"  aria-live="polite"></section>

                    <section class="ideias-nao-organizadas" aria-labelledby="ideias-nao-organizadas-titulo">
                        <h2 id="ideias-nao-organizadas-titulo">Ideias não organizadas</h2>
                        <p class="ideias-nao-organizadas-vazio">Todos os Pins salvos estão organizados nas pastas correspondentes.</p>
                        <div class="ideias-nao-organizadas-grade" id="ideias-nao-organizadas-grade"></div>
                    </section>
                </section>
            </section>
        </main>
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
