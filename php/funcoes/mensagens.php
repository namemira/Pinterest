<?php
declare(strict_types=1);

require_once __DIR__ . '/validacao.php';

/**
 * Registra a mensagem enviada pelo formulário de contato.
 */
function registrarMensagem(PDO $pdo, string $nome, string $email, string $mensagem): int
{
    $nome = textoValidado($nome, 60, 'nome');
    $email = emailValidado($email);
    $mensagem = textoValidado($mensagem, 5000, 'mensagem');

    if (mb_strlen($mensagem, 'UTF-8') < 10) {
        throw new InvalidArgumentException('A mensagem deve ter pelo menos 10 caracteres.');
    }

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

/**
 * Listagem do painel administrativo, das mais recentes para as mais antigas.
 */
function listarMensagens(PDO $pdo): array
{
    return $pdo->query(
        'SELECT id, nome, email, mensagem, data_envio
         FROM mensagens
         ORDER BY data_envio DESC, id DESC'
    )->fetchAll();
}

function excluirMensagem(PDO $pdo, int $mensagemId): bool
{
    $consulta = $pdo->prepare('DELETE FROM mensagens WHERE id = :id');
    $consulta->execute(['id' => $mensagemId]);
    return $consulta->rowCount() > 0;
}
