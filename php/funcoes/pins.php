<?php
declare(strict_types=1);

require_once __DIR__ . '/validacao.php';
require_once __DIR__ . '/../includes/autenticacao.php';

function cadastrarPin(
    PDO $pdo,
    int $usuarioId,
    int $categoriaId,
    string $titulo,
    ?string $descricao,
    ?string $linkDestino,
    string $caminhoImagem,
    ?string $textoAlternativo
): int {
    $usuarioAutenticado = exigirUsuarioAutenticado();
    if ($usuarioAutenticado !== $usuarioId) {
        throw new RuntimeException('O usuário autenticado não corresponde ao autor informado.');
    }

    $titulo = textoValidado($titulo, 100);
    $descricao = textoOpcional($descricao ?? '', 500);
    $linkDestino = urlOpcionalValidada($linkDestino ?? '');
    $textoAlternativo = textoOpcional($textoAlternativo ?? '', 255);
    $caminhoImagem = textoValidado($caminhoImagem, 255);

    $consultaUsuario = $pdo->prepare(
        'SELECT id FROM usuarios WHERE id = :id LIMIT 1'
    );
    $consultaUsuario->execute(['id' => $usuarioId]);
    if (!$consultaUsuario->fetch()) {
        throw new RuntimeException('Usuário não encontrado.');
    }

    $consultaCategoria = $pdo->prepare(
        'SELECT id FROM categorias WHERE id = :id LIMIT 1'
    );
    $consultaCategoria->execute(['id' => $categoriaId]);
    if (!$consultaCategoria->fetch()) {
        throw new InvalidArgumentException('Categoria inválida.');
    }

    $consulta = $pdo->prepare(
        'INSERT INTO pins
            (usuario_id, categoria_id, titulo, descricao, link_destino, caminho_imagem, texto_alternativo)
         VALUES
            (:usuario_id, :categoria_id, :titulo, :descricao, :link_destino, :caminho_imagem, :texto_alternativo)'
    );
    $consulta->execute([
        'usuario_id' => $usuarioId,
        'categoria_id' => $categoriaId,
        'titulo' => $titulo,
        'descricao' => $descricao,
        'link_destino' => $linkDestino,
        'caminho_imagem' => $caminhoImagem,
        'texto_alternativo' => $textoAlternativo,
    ]);

    return (int) $pdo->lastInsertId();
}

function listarPins(PDO $pdo): array
{
    $consulta = $pdo->query(
        'SELECT p.id, p.titulo, p.descricao, p.link_destino,
                p.caminho_imagem, p.texto_alternativo,
                p.data_criacao, p.data_atualizacao,
                u.id AS usuario_id, u.nome AS autor,
                c.id AS categoria_id, c.nome AS categoria
         FROM pins p
         INNER JOIN usuarios u ON u.id = p.usuario_id
         INNER JOIN categorias c ON c.id = p.categoria_id
         ORDER BY p.data_criacao DESC'
    );
    return $consulta->fetchAll();
}

function editarPin(
    PDO $pdo,
    int $usuarioId,
    int $pinId,
    int $categoriaId,
    string $titulo,
    ?string $descricao,
    ?string $linkDestino,
    ?string $caminhoImagem,
    ?string $textoAlternativo
): bool {
    $usuarioAutenticado = exigirUsuarioAutenticado();
    if ($usuarioAutenticado !== $usuarioId) {
        throw new RuntimeException('O usuário autenticado não corresponde ao autor informado.');
    }

    $titulo = textoValidado($titulo, 100);
    $descricao = textoOpcional($descricao ?? '', 500);
    $linkDestino = urlOpcionalValidada($linkDestino ?? '');
    $textoAlternativo = textoOpcional($textoAlternativo ?? '', 255);

    $consulta = $pdo->prepare(
        'UPDATE pins
         SET categoria_id = :categoria_id,
             titulo = :titulo,
             descricao = :descricao,
             link_destino = :link_destino,
             caminho_imagem = COALESCE(:caminho_imagem, caminho_imagem),
             texto_alternativo = :texto_alternativo
         WHERE id = :pin_id AND usuario_id = :usuario_id'
    );
    $consulta->execute([
        'categoria_id' => $categoriaId,
        'titulo' => $titulo,
        'descricao' => $descricao,
        'link_destino' => $linkDestino,
        'caminho_imagem' => $caminhoImagem,
        'texto_alternativo' => $textoAlternativo,
        'pin_id' => $pinId,
        'usuario_id' => $usuarioId,
    ]);

    return $consulta->rowCount() > 0;
}

function excluirPin(PDO $pdo, int $usuarioId, int $pinId): bool
{
    $usuarioAutenticado = exigirUsuarioAutenticado();
    if ($usuarioAutenticado !== $usuarioId) {
        throw new RuntimeException('O usuário autenticado não corresponde ao autor informado.');
    }

    $consulta = $pdo->prepare(
        'DELETE FROM pins WHERE id = :pin_id AND usuario_id = :usuario_id'
    );
    $consulta->execute([
        'pin_id' => $pinId,
        'usuario_id' => $usuarioId,
    ]);
    return $consulta->rowCount() > 0;
}

function salvarPin(PDO $pdo, int $usuarioId, int $pinId): bool
{
    $usuarioAutenticado = exigirUsuarioAutenticado();
    if ($usuarioAutenticado !== $usuarioId) {
        throw new RuntimeException('O usuário autenticado não corresponde ao usuário informado.');
    }

    $consulta = $pdo->prepare(
        'INSERT IGNORE INTO pins_salvos (usuario_id, pin_id)
         VALUES (:usuario_id, :pin_id)'
    );
    $consulta->execute([
        'usuario_id' => $usuarioId,
        'pin_id' => $pinId,
    ]);
    return $consulta->rowCount() === 1;
}

function consultarPinsSalvos(PDO $pdo, int $usuarioId): array
{
    $usuarioAutenticado = exigirUsuarioAutenticado();
    if ($usuarioAutenticado !== $usuarioId) {
        throw new RuntimeException('O usuário autenticado não corresponde ao usuário informado.');
    }

    $consulta = $pdo->prepare(
        'SELECT p.id, p.titulo, p.descricao, p.link_destino,
                p.caminho_imagem, p.texto_alternativo,
                ps.data_salvamento
         FROM pins_salvos ps
         INNER JOIN pins p ON p.id = ps.pin_id
         WHERE ps.usuario_id = :usuario_id
         ORDER BY ps.data_salvamento DESC'
    );
    $consulta->execute(['usuario_id' => $usuarioId]);
    return $consulta->fetchAll();
}
