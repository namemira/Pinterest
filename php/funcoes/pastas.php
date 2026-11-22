<?php
declare(strict_types=1);

require_once __DIR__ . '/validacao.php';
require_once __DIR__ . '/../includes/autenticacao.php';

function criarPasta(PDO $pdo, int $usuarioId, string $nome, ?string $descricao = null): int
{
    $usuarioAutenticado = exigirUsuarioAutenticado();
    if ($usuarioAutenticado !== $usuarioId) {
        throw new RuntimeException('O usuário autenticado não corresponde ao usuário informado.');
    }

    $nome = textoValidado($nome, 100);
    $descricao = textoOpcional($descricao ?? '', 500);

    $consulta = $pdo->prepare(
        'INSERT INTO pastas (usuario_id, nome, descricao)
         VALUES (:usuario_id, :nome, :descricao)'
    );
    $consulta->execute([
        'usuario_id' => $usuarioId,
        'nome' => $nome,
        'descricao' => $descricao,
    ]);
    return (int) $pdo->lastInsertId();
}
