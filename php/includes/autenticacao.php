<?php
declare(strict_types=1);

function iniciarSessaoSeguro(): void
{
    if (session_status() === PHP_SESSION_NONE) {
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
    ];
}

function usuarioEstaAutenticado(): bool
{
    iniciarSessaoSeguro();
    return isset($_SESSION['usuario_id'], $_SESSION['usuario_nome'], $_SESSION['usuario_tipo']);
}

function obterIdUsuarioAutenticado(): ?int
{
    if (!usuarioEstaAutenticado()) {
        return null;
    }

    $id = (int) $_SESSION['usuario_id'];
    return $id > 0 ? $id : null;
}

function usuarioEhAdministrador(): bool
{
    iniciarSessaoSeguro();
    return usuarioEstaAutenticado()
        && isset($_SESSION['usuario_tipo'])
        && $_SESSION['usuario_tipo'] === 'admin';
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

function exigirAdministrador(): int
{
    $id = obterIdUsuarioAutenticado();
    if ($id === null) {
        header('Location: /Pinterest/php/dados/login.php', true, 303);
        exit;
    }

    if (!usuarioEhAdministrador()) {
        http_response_code(403);
        exit('Acesso administrativo negado.');
    }

    return $id;
}

function encerrarSessao(): void
{
    iniciarSessaoSeguro();

    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $parametros = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            [
                'expires' => time() - 42000,
                'path' => $parametros['path'],
                'domain' => $parametros['domain'],
                'secure' => $parametros['secure'],
                'httponly' => $parametros['httponly'],
                'samesite' => 'Lax',
            ]
        );
    }

    session_destroy();
}
