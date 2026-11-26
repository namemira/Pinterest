        <header class="cabecalho-principal">
            <?php if (!empty($paginaExplorarAutenticada)): ?>
            <form class="pesquisa" role="search" aria-label="Pesquisa de Pins" action="explorar.php" method="get" data-destino-explorar="explorar.php">
            <?php else: ?>
            <div class="pesquisa" role="search" aria-label="Pesquisa de Pins" data-destino-explorar="explorar.php">
            <?php endif; ?>
                <button class="pesquisa-icone" type="<?= !empty($paginaExplorarAutenticada) ? 'submit' : 'button' ?>" aria-label="Pesquisar">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>
                </button>
                <input type="search" name="q" value="<?= e((string) ($termoBuscaCabecalho ?? '')) ?>" placeholder="Pesquisar looks, refeições fáceis etc." aria-label="Pesquisar Pins">
                <?php if (!empty($paginaExplorarAutenticada)): ?>
                <input id="explore-category-filter" type="hidden" name="categoria_id" value="<?= e((string) ($categoriaSelecionadaId ?? '')) ?>">
                <?php endif; ?>
                <button class="pesquisa-camera" type="button" aria-label="Pesquisar por imagem" aria-disabled="true" disabled>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11H3V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/></svg>
                </button>
            <?php if (!empty($paginaExplorarAutenticada)): ?>
            </form>
            <?php else: ?>
            </div>
            <?php endif; ?>
            <?php if (usuarioEstaAutenticado()): ?>
            <?php $fotoCabecalho = urlFotoPerfil($_SESSION['usuario_foto'] ?? null); ?>
            <div class="perfil-conta">
                <!-- Nome e e-mail usados pelo menu do perfil (menu.js) -->
                <button class="perfil" type="button" aria-label="Abrir menu do perfil" id="abrir-perfil" aria-controls="menu-perfil" aria-expanded="false" data-menu-perfil
                        data-nome="<?= e($_SESSION['usuario_nome']) ?>"
                        data-inicial="<?= e(inicialNome((string) $_SESSION['usuario_nome'])) ?>"
                        data-email="<?= e($_SESSION['usuario_email'] ?? '') ?>"
                        data-tipo="<?= usuarioEhAdmin() ? 'Administrador' : 'Conta pessoal' ?>">
                    <?php if ($fotoCabecalho !== null): ?>
                    <img class="avatar-header" src="<?= e($fotoCabecalho) ?>" alt="">
                    <?php else: ?>
                    <span class="avatar-placeholder avatar-header" aria-hidden="true"><?= e(inicialNome((string) $_SESSION['usuario_nome'])) ?></span>
                    <?php endif; ?>
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