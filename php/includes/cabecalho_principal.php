        <header class="cabecalho-principal">
            <div class="pesquisa" role="search" aria-label="Pesquisa de Pins">
                <button class="pesquisa-icone" type="button" aria-label="Pesquisar">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>
                </button>
                <input type="search" placeholder="Pesquisar looks, refeições fáceis etc." aria-label="Pesquisar Pins">
                <button class="pesquisa-camera" type="button" aria-label="Pesquisar por imagem" aria-disabled="true" disabled>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11H3V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/></svg>
                </button>
            </div>
            <?php if (usuarioEstaAutenticado()): ?>
            <div class="perfil-conta">
                <!-- Nome e e-mail usados pelo menu do perfil (menu.js) -->
                <button class="perfil" type="button" aria-label="Abrir menu do perfil" id="abrir-perfil" aria-controls="menu-perfil" aria-expanded="false" data-menu-perfil
                        data-nome="<?= e($_SESSION['usuario_nome']) ?>"
                        data-email="<?= e($_SESSION['usuario_email'] ?? '') ?>"
                        data-tipo="<?= usuarioEhAdmin() ? 'Administrador' : 'Conta pessoal' ?>">
                    <img src="<?= e(urlArquivo($_SESSION['usuario_foto'] ?? '')) ?>" alt="">
                    <svg class="perfil-seta" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
                </button>
            </div>
            <!-- Logout por POST com token CSRF, acionado pelo botão Sair do menu do perfil -->
            <form id="formulario-logout" class="formulario-logout" method="post" action="../acoes/logout.php">
                <?= campoCsrf() ?>
                <button type="submit" class="botao-logout">Sair</button>
            </form>
            <?php else: ?>
            <div class="cabecalho-visitante">
                <a class="botao-visitante botao-visitante-entrar" href="login.php">Entrar</a>
                <a class="botao-visitante" href="cadastro.php">Criar conta</a>
            </div>
            <?php endif; ?>
        </header>