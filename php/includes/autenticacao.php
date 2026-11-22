<?php
declare(strict_types=1);

function iniciarSessaoSeguro(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start([
            'cookie_httponly' => true,
            'cookie_samesite' => 'Lax',
            'use_strict_mode' => true,
        ]);
    }
}

function usuarioEstaAutenticado(): bool
{
    iniciarSessaoSeguro();
    return isset($_SESSION['usuario_id'], $_SESSION['usuario_tipo']);
}

function exigirUsuarioAutenticado(): int
{
    if (!usuarioEstaAutenticado()) {
        throw new RuntimeException('Autenticação necessária.');
    }

    return (int) $_SESSION['usuario_id'];
}
