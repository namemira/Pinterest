<?php
// Marca no menu a página que está aberta.
$paginaMenu = basename((string) ($_SERVER['SCRIPT_NAME'] ?? ''));
$itemAtivo = static function (string $pagina) use ($paginaMenu): string {
    return $paginaMenu === $pagina ? ' ativo" aria-current="page' : '';
};
?>
 <nav class="menu" aria-label="Navegação principal">
            <a class="menu-logo" href="principal.php" aria-label="Pinterest, página inicial">
                <img src="../../Imagens/Icone.png" alt="">
            </a>
            <a class="menu-item<?= $itemAtivo('principal.php') ?>" href="principal.php" aria-label="Página inicial">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8v9.1a1.1 1.1 0 0 1-1.1 1.1h-5.3v-6.3H9.4V21H4.1A1.1 1.1 0 0 1 3 19.9z"/></svg>
                <span class="menu-tooltip">Página inicial</span>
            </a>
            <a class="menu-item<?= $itemAtivo('explore.php') ?>" href="explore.php" aria-label="Explorar">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.2 5.4-5.4 2.2 2.2-5.4z"/></svg>
                <span class="menu-tooltip">Explorar</span>
            </a>
            <a class="menu-item<?= $itemAtivo('perfil.php') ?>" href="perfil.php" aria-label="Perfil">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/></svg>
                <span class="menu-tooltip">Perfil</span>
            </a>
            <button class="menu-item" id="abrir-painel-criar" type="button" aria-label="Criar" aria-controls="painel-criar" aria-expanded="false">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 7v10M7 12h10"/></svg>
                <span class="menu-tooltip">Criar</span>
            </button>
            <button class="menu-item" type="button" aria-label="Notificações" data-aviso-disponibilidade="notificacoes">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>
                <span class="menu-tooltip">Notificações</span>
            </button>
            <button class="menu-item" type="button" aria-label="Mensagens" data-aviso-disponibilidade="mensagens">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 4a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></svg>
                <span class="menu-tooltip">Mensagens</span>
            </button>
            <?php if (function_exists('usuarioEhAdmin') && usuarioEhAdmin()): ?>
            <a class="menu-item" href="../admin/painel.php" aria-label="Painel administrativo">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>
                <span class="menu-tooltip">Painel administrativo</span>
            </a>
            <?php endif; ?>
            <a class="menu-item menu-configuracoes<?= $itemAtivo('configuracao.php') ?>" href="configuracao.php" aria-label="Configurações">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 2z"/></svg>
                <span class="menu-tooltip">Configurações</span>
            </a>
        </nav>
        <aside class="painel-criar" id="painel-criar" aria-labelledby="painel-criar-titulo" hidden>
            <header class="painel-criar-cabecalho">
                <h2 id="painel-criar-titulo">Criar</h2>
                <button class="painel-criar-fechar" id="fechar-painel-criar" type="button" aria-label="Fechar painel Criar">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
                </button>
            </header>
            <div class="painel-criar-opcoes">
                <button class="painel-criar-opcao" type="button" data-criacao-opcao="pin">
                    <span class="painel-criar-icone" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 3h6m-3 0v7m-6 0h12v3a6 6 0 0 1-12 0zm6 9v6"/></svg></span>
                    <span><strong>Pin</strong><small>Publique uma imagem com título, descrição e link.</small></span>
                </button>
                <button class="painel-criar-opcao" type="button" data-criacao-opcao="pasta">
                    <span class="painel-criar-icone" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3z"/></svg></span>
                    <span><strong>Pasta</strong><small>Organize seus Pins favoritos em uma coleção.</small></span>
                </button>
            </div>
        </aside>
