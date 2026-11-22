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

function exigirUsuarioAutenticado(): int
{
    if (!usuarioEstaAutenticado()) {
        throw new RuntimeException('Autenticação necessária.');
    }

    return (int) $_SESSION['usuario_id'];
}
