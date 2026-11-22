<?php
declare(strict_types=1);

require_once __DIR__ . '/validacao.php';

function registrarMensagem(PDO $pdo, string $nome, string $email, string $mensagem): int
{
    $nome = textoValidado($nome, 60);
    $email = emailValidado($email);
    $mensagem = textoValidado($mensagem, 5000);

    $consulta = $pdo->prepare(
        'INSERT INTO mensagens (nome, email, mensagem)
         VALUES (:nome, :email, :mensagem)'
    );
    $consulta->execute([
        'nome' => $nome,
        'email' => $email,
        'mensagem' => $mensagem,
    ]);
    return (int) $pdo->lastInsertId();
}
