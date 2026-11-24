<?php
declare(strict_types=1);

require_once __DIR__ . '/validacao.php';
require_once __DIR__ . '/pins.php';
require_once __DIR__ . '/../includes/autenticacao.php';

function criarPasta(PDO $pdo, int $usuarioId, string $nome, ?string $descricao = null): int
{
    conferirUsuarioDaSessao($usuarioId);

    $nome = textoValidado($nome, 100, 'nome da pasta');
    $descricao = textoOpcional($descricao ?? '', 500, 'descrição');

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

/**
 * Pastas do usuário com a quantidade de Pins e até três imagens de capa.
 */
function listarPastas(PDO $pdo, int $usuarioId): array
{
    conferirUsuarioDaSessao($usuarioId);

    $consulta = $pdo->prepare(
        "SELECT pa.id, pa.nome, pa.descricao, pa.data_criacao,
                COUNT(pp.pin_id) AS total_pins,
                GROUP_CONCAT(p.caminho_imagem ORDER BY p.id DESC SEPARATOR '|') AS imagens
         FROM pastas pa
         LEFT JOIN pin_pasta pp ON pp.pasta_id = pa.id
         LEFT JOIN pins p ON p.id = pp.pin_id
         WHERE pa.usuario_id = :usuario_id
         GROUP BY pa.id, pa.nome, pa.descricao, pa.data_criacao
         ORDER BY pa.data_criacao DESC, pa.id DESC"
    );
    $consulta->execute(['usuario_id' => $usuarioId]);

    $pastas = $consulta->fetchAll();
    foreach ($pastas as &$pasta) {
        $pasta['imagens'] = $pasta['imagens'] ? array_slice(explode('|', $pasta['imagens']), 0, 3) : [];
    }
    unset($pasta);

    return $pastas;
}

/**
 * Retorna a pasta somente se ela pertencer ao usuário.
 */
function consultarPasta(PDO $pdo, int $usuarioId, int $pastaId): ?array
{
    conferirUsuarioDaSessao($usuarioId);

    $consulta = $pdo->prepare(
        'SELECT id, nome, descricao, data_criacao
         FROM pastas
         WHERE id = :pasta_id AND usuario_id = :usuario_id
         LIMIT 1'
    );
    $consulta->execute(['pasta_id' => $pastaId, 'usuario_id' => $usuarioId]);
    $pasta = $consulta->fetch();

    return $pasta ?: null;
}

function editarPasta(PDO $pdo, int $usuarioId, int $pastaId, string $nome, ?string $descricao): bool
{
    $nome = textoValidado($nome, 100, 'nome da pasta');
    $descricao = textoOpcional($descricao ?? '', 500, 'descrição');

    if (consultarPasta($pdo, $usuarioId, $pastaId) === null) {
        return false;
    }

    $consulta = $pdo->prepare(
        'UPDATE pastas SET nome = :nome, descricao = :descricao
         WHERE id = :pasta_id AND usuario_id = :usuario_id'
    );
    $consulta->execute([
        'nome' => $nome,
        'descricao' => $descricao,
        'pasta_id' => $pastaId,
        'usuario_id' => $usuarioId,
    ]);
    return true;
}

/**
 * Exclui a pasta. Os Pins continuam salvos no perfil.
 */
function excluirPasta(PDO $pdo, int $usuarioId, int $pastaId): bool
{
    conferirUsuarioDaSessao($usuarioId);

    $consulta = $pdo->prepare('DELETE FROM pastas WHERE id = :pasta_id AND usuario_id = :usuario_id');
    $consulta->execute(['pasta_id' => $pastaId, 'usuario_id' => $usuarioId]);
    return $consulta->rowCount() > 0;
}

function listarPinsDaPasta(PDO $pdo, int $usuarioId, int $pastaId): array
{
    conferirUsuarioDaSessao($usuarioId);

    $consulta = $pdo->prepare(
        'SELECT ' . SQL_COLUNAS_PIN . ' ' . SQL_JUNCOES_PIN . '
         INNER JOIN pin_pasta pp ON pp.pin_id = p.id
         INNER JOIN pastas pa ON pa.id = pp.pasta_id
         WHERE pa.id = :pasta_id AND pa.usuario_id = :dono
         ORDER BY p.data_criacao DESC'
    );
    $consulta->execute([
        'usuario_logado' => $usuarioId,
        'pasta_id' => $pastaId,
        'dono' => $usuarioId,
    ]);
    return $consulta->fetchAll();
}

/**
 * Adiciona um Pin a uma pasta do usuário. O Pin também é salvo no perfil
 * (respeitando a RN02, sem duplicar). Retorna false se ele já estava na pasta.
 */
function adicionarPinNaPasta(PDO $pdo, int $usuarioId, int $pastaId, int $pinId): bool
{
    if (consultarPasta($pdo, $usuarioId, $pastaId) === null) {
        throw new InvalidArgumentException('Pasta não encontrada.');
    }

    $iniciouTransacao = !$pdo->inTransaction();
    if ($iniciouTransacao) {
        $pdo->beginTransaction();
    }

    try {
        salvarPin($pdo, $usuarioId, $pinId);

        $consulta = $pdo->prepare(
            'INSERT IGNORE INTO pin_pasta (pasta_id, pin_id) VALUES (:pasta_id, :pin_id)'
        );
        $consulta->execute(['pasta_id' => $pastaId, 'pin_id' => $pinId]);
        if ($iniciouTransacao) {
            $pdo->commit();
        }
    } catch (Throwable $erro) {
        if ($iniciouTransacao && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $erro;
    }

    return $consulta->rowCount() === 1;
}

function removerPinDaPasta(PDO $pdo, int $usuarioId, int $pastaId, int $pinId): bool
{
    if (consultarPasta($pdo, $usuarioId, $pastaId) === null) {
        return false;
    }

    $consulta = $pdo->prepare('DELETE FROM pin_pasta WHERE pasta_id = :pasta_id AND pin_id = :pin_id');
    $consulta->execute(['pasta_id' => $pastaId, 'pin_id' => $pinId]);
    return $consulta->rowCount() > 0;
}

/**
 * Pins salvos que ainda não estão em nenhuma pasta do usuário
 * (seção "Ideias não organizadas" do perfil).
 */
function listarSalvosSemPasta(PDO $pdo, int $usuarioId): array
{
    conferirUsuarioDaSessao($usuarioId);

    $consulta = $pdo->prepare(
        'SELECT ' . SQL_COLUNAS_PIN . ' ' . SQL_JUNCOES_PIN . '
         WHERE ps.id IS NOT NULL
           AND NOT EXISTS (
               SELECT 1 FROM pin_pasta pp
               INNER JOIN pastas pa ON pa.id = pp.pasta_id
               WHERE pp.pin_id = p.id AND pa.usuario_id = :dono
           )
         ORDER BY ps.data_salvamento DESC'
    );
    $consulta->execute(['usuario_logado' => $usuarioId, 'dono' => $usuarioId]);
    return $consulta->fetchAll();
}
