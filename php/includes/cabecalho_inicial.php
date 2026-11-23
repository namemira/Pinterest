    <header class="site-header">
        <a class="brand" href="Inicial.php" aria-label="Pinterest, página inicial">
            <img src="../../Imagens/Pinterest.png" alt="Pinterest">
        </a>

        <nav class="nav-explore" aria-label="Descoberta">
            <a href="explore.php">Explorar</a>
        </nav>

        <form class="site-search" id="pesquisa-inicial" role="search" action="explore.php" method="get">
            <button type="submit" aria-label="Pesquisar ideias">
                <img src="../../Imagens/lupa.png" alt="">
            </button>
            <input id="termo-pesquisa" name="q" type="search" placeholder="Pesquise ideias para sua próxima criação" aria-label="Pesquisar ideias">
            <p class="search-status" id="resultado-pesquisa" role="status" aria-live="polite" hidden></p>
        </form>

        <nav class="nav-info" aria-label="Informações">
            <a href="#sobre-pinterest">Sobre</a>
            <a href="#empresas-pinterest">Empresas</a>
            <a href="#noticias-pinterest">Notícias</a>
            <a href="contato.php">Contato</a>
        </nav>

        <div class="header-actions">
            <?php if (usuarioEstaAutenticado()): ?>
            <a class="button button-red button-small" href="principal.php">Ir para o feed</a>
            <?php else: ?>
            <a class="button button-red button-small" href="login.php">Entrar</a>
            <a class="button button-light button-small" href="cadastro.php">Criar conta</a>
            <?php endif; ?>
        </div>
    </header>