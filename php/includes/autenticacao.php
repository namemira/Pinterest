<?php
declare(strict_types=1);

/**
 * Envia cabeçalhos HTTP básicos de proteção em todas as páginas.
 */
function enviarCabecalhosSeguranca(): void
{
    if (headers_sent()) {
        return;
    }

    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: same-origin');
}

function iniciarSessaoSeguro(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        enviarCabecalhosSeguranca();
        session_start([
            'cookie_httponly' => true,
            'cookie_secure' => isset($_SERVER['HTTPS'])
                && $_SERVER['HTTPS'] !== ''
                && strtolower((string) $_SERVER['HTTPS']) !== 'off',
            'cookie_samesite' => 'Lax',
            'use_only_cookies' => true,
            'use_strict_mode' => true,
        ]);
    }
}

function gerarTokenCsrf(): string
{
    iniciarSessaoSeguro();

    if (!isset($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function validarTokenCsrf($token): bool
{
    iniciarSessaoSeguro();

    return is_string($token)
        && isset($_SESSION['csrf_token'])
        && is_string($_SESSION['csrf_token'])
        && hash_equals($_SESSION['csrf_token'], $token);
}

function autenticarUsuario(array $usuario): void
{
    iniciarSessaoSeguro();
    if (!session_regenerate_id(true)) {
        throw new RuntimeException('Não foi possível iniciar uma sessão segura.');
    }

    $_SESSION = [
        'usuario_id' => (int) $usuario['id'],
        'usuario_nome' => (string) $usuario['nome'],
        'usuario_tipo' => (string) $usuario['tipo_usuario'],
        'usuario_email' => (string) ($usuario['email'] ?? ''),
        'usuario_foto' => isset($usuario['foto']) ? (string) $usuario['foto'] : '',
    ];
}

/**
 * Atualiza os dados exibidos no cabeçalho depois da edição do perfil.
 */
function atualizarDadosSessao(string $nome, ?string $foto): void
{
    iniciarSessaoSeguro();
    $_SESSION['usuario_nome'] = $nome;
    $_SESSION['usuario_foto'] = $foto ?? '';
}

function usuarioEstaAutenticado(): bool
{
    iniciarSessaoSeguro();
    return isset($_SESSION['usuario_id'], $_SESSION['usuario_nome'], $_SESSION['usuario_tipo']);
}

function usuarioLogadoId(): ?int
{
    return usuarioEstaAutenticado() ? (int) $_SESSION['usuario_id'] : null;
}

function usuarioEhAdmin(): bool
{
    return usuarioEstaAutenticado() && $_SESSION['usuario_tipo'] === 'admin';
}

function obterIdUsuarioAutenticado(): ?int
{
    if (!usuarioEstaAutenticado()) {
        return null;
    }

    $id = (int) $_SESSION['usuario_id'];
    return $id > 0 ? $id : null;
}

function exigirUsuarioAutenticado(): int
{
    $id = obterIdUsuarioAutenticado();
    if ($id === null) {
        header('Location: /Pinterest/php/dados/login.php', true, 303);
        exit;
    }

    return $id;
}

/**
 * Garante que o usuário informado nas funções é o mesmo da sessão.
 */
function conferirUsuarioDaSessao(int $usuarioId): void
{
    if (exigirUsuarioAutenticado() !== $usuarioId) {
        throw new RuntimeException('O usuário autenticado não corresponde ao usuário informado.');
    }
}

/**
 * Proteção das páginas: quem não estiver logado volta para o login.
 */
function exigirLoginNaPagina(string $urlLogin = 'login.php'): int
{
    if (!usuarioEstaAutenticado()) {
        $_SESSION['aviso'] = [
            'tipo' => 'erro',
            'texto' => 'Entre na sua conta para continuar.',
        ];
        header('Location: ' . $urlLogin, true, 303);
        exit;
    }

    return (int) $_SESSION['usuario_id'];
}

/**
 * Proteção do painel administrativo. O tipo do usuário é conferido no
 * banco a cada acesso, e não apenas na sessão.
 */
function exigirAdmin(PDO $pdo, string $urlLogin = '../dados/login.php'): int
{
    $usuarioId = exigirLoginNaPagina($urlLogin);

    $consulta = $pdo->prepare('SELECT tipo_usuario FROM usuarios WHERE id = :id LIMIT 1');
    $consulta->execute(['id' => $usuarioId]);
    $tipo = $consulta->fetchColumn();

    if ($tipo !== 'admin') {
        http_response_code(403);
        exit('Acesso negado. Esta área é restrita a administradores.');
    }

    return $usuarioId;
}

/**
 * Logout: apaga os dados da sessão, o cookie e a sessão no servidor.
 */
function encerrarSessao(): void
{
    iniciarSessaoSeguro();

    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $parametros = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $parametros['path'],
            'domain' => $parametros['domain'],
            'secure' => $parametros['secure'],
            'httponly' => $parametros['httponly'],
            'samesite' => $parametros['samesite'] ?: 'Lax',
        ]);
    }

    session_destroy();
}
