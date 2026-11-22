<?php
declare(strict_types=1);

require_once __DIR__ . '/validacao.php';

function criarUsuario(PDO $pdo, string $nome, string $email, string $senha): int
{
    $nome = textoValidado($nome, 60);
    $email = emailValidado($email);

    if (mb_strlen($senha, 'UTF-8') < 8) {
        throw new InvalidArgumentException('A senha deve ter pelo menos 8 caracteres.');
    }

    $consulta = $pdo->prepare(
        'INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario)
         VALUES (:nome, :email, :senha_hash, :tipo_usuario)'
    );
    $consulta->execute([
        'nome' => $nome,
        'email' => $email,
        'senha_hash' => password_hash($senha, PASSWORD_DEFAULT),
        'tipo_usuario' => 'usuario',
    ]);

    return (int) $pdo->lastInsertId();
}

function consultarUsuarioPorEmail(PDO $pdo, string $email): ?array
{
    $email = emailValidado($email);
    $consulta = $pdo->prepare(
        'SELECT id, nome, email, senha_hash, tipo_usuario, data_criacao
         FROM usuarios
         WHERE email = :email
         LIMIT 1'
    );
    $consulta->execute(['email' => $email]);
    $usuario = $consulta->fetch();

    return $usuario ?: null;
}
