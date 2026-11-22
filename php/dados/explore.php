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
<?php require_once __DIR__ . '/../includes/menu.php'; ?>
<!--Cabecalho-->
<?php require_once __DIR__ . '/../includes/cabecalho_principal.php'; ?>
    <main class="conteudo-explorar">

    <section class="titulo-explorar">
        <h1>Explore novas ideias</h1>
        <p>Descubra inspirações para você.</p>
    </section>

    <section class="categorias">
        <h2>Categorias</h2>
        <div id="lista-categorias"></div>
    </section>

    <section class="tendencias">
        <h2>Em alta</h2>
        <div id="lista-tendencias"></div>
    </section>

    <section class="pins-explorar">
        <h2>Inspirações para você</h2>
        <div id="grade-pins"></div>
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
<script src="../../js/explore.js" defer></script>
<script src="../../js/tema.js" defer></script>
</body>
</html>
