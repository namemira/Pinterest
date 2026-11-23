<?php
declare(strict_types=1);

require_once __DIR__ . '/validacao.php';
require_once __DIR__ . '/upload.php';
require_once __DIR__ . '/../includes/autenticacao.php';

/* =====================================================================
   CATEGORIAS
   ===================================================================== */

function listarCategorias(PDO $pdo): array
{
    return $pdo->query(
        'SELECT c.id, c.nome, c.imagem_referencia, COUNT(p.id) AS total_pins
         FROM categorias c
         LEFT JOIN pins p ON p.categoria_id = c.id
         GROUP BY c.id, c.nome, c.imagem_referencia
         ORDER BY c.nome'
    )->fetchAll();
}

function categoriaExiste(PDO $pdo, int $categoriaId): bool
{
    $consulta = $pdo->prepare('SELECT 1 FROM categorias WHERE id = :id LIMIT 1');
    $consulta->execute(['id' => $categoriaId]);
    return (bool) $consulta->fetchColumn();
}

/* =====================================================================
   CRUD DE PINS
   ===================================================================== */

// Colunas usadas em todas as listagens. "salvo" indica se o usuário
// logado já salvou o Pin (usado no botão Salvar/Salvo).
const SQL_COLUNAS_PIN = 'p.id, p.titulo, p.descricao, p.link_destino,
        p.caminho_imagem, p.texto_alternativo,
        p.data_criacao, p.data_atualizacao,
        u.id AS usuario_id, u.nome AS autor,
        c.id AS categoria_id, c.nome AS categoria,
        (ps.id IS NOT NULL) AS salvo';

const SQL_JUNCOES_PIN = 'FROM pins p
         INNER JOIN usuarios u ON u.id = p.usuario_id
         INNER JOIN categorias c ON c.id = p.categoria_id
         LEFT JOIN pins_salvos ps ON ps.pin_id = p.id AND ps.usuario_id = :usuario_logado';

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
    // RN01: somente usuários autenticados podem publicar.
    conferirUsuarioDaSessao($usuarioId);

    $titulo = textoValidado($titulo, 100, 'título');
    $descricao = textoOpcional($descricao ?? '', 500, 'descrição');
    $linkDestino = urlOpcionalValidada($linkDestino ?? '');
    $textoAlternativo = textoOpcional($textoAlternativo ?? '', 255, 'texto alternativo');
    $caminhoImagem = textoValidado($caminhoImagem, 255, 'imagem');

    $consultaUsuario = $pdo->prepare('SELECT id FROM usuarios WHERE id = :id LIMIT 1');
    $consultaUsuario->execute(['id' => $usuarioId]);
    if (!$consultaUsuario->fetch()) {
        throw new RuntimeException('Usuário não encontrado.');
    }

    if (!categoriaExiste($pdo, $categoriaId)) {
        throw new InvalidArgumentException('Selecione uma categoria válida.');
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

/**
 * Lista os Pins do feed, com filtro opcional por categoria e por texto.
 */
function listarPins(PDO $pdo, ?int $categoriaId = null, string $busca = '', ?int $usuarioLogado = null): array
{
    $condicoes = [];
    $parametros = ['usuario_logado' => $usuarioLogado ?? 0];

    if ($categoriaId !== null) {
        $condicoes[] = 'p.categoria_id = :categoria_id';
        $parametros['categoria_id'] = $categoriaId;
    }

    $busca = trim($busca);
    if ($busca !== '') {
        $termo = '%' . addcslashes(mb_substr($busca, 0, 100, 'UTF-8'), '%_\\') . '%';
        $condicoes[] = '(p.titulo LIKE :busca_titulo OR p.descricao LIKE :busca_descricao OR c.nome LIKE :busca_categoria)';
        $parametros['busca_titulo'] = $termo;
        $parametros['busca_descricao'] = $termo;
        $parametros['busca_categoria'] = $termo;
    }

    $sql = 'SELECT ' . SQL_COLUNAS_PIN . ' ' . SQL_JUNCOES_PIN;
    if ($condicoes) {
        $sql .= ' WHERE ' . implode(' AND ', $condicoes);
    }
    $sql .= ' ORDER BY p.data_criacao DESC, p.id DESC';

    $consulta = $pdo->prepare($sql);
    $consulta->execute($parametros);
    return $consulta->fetchAll();
}

/**
 * Pins mais salvos, usados na seção "Em alta" da página Explorar.
 */
function listarPinsEmAlta(PDO $pdo, int $limite = 3, ?int $usuarioLogado = null): array
{
    $consulta = $pdo->prepare(
        'SELECT ' . SQL_COLUNAS_PIN . ',
                (SELECT COUNT(*) FROM pins_salvos x WHERE x.pin_id = p.id) AS total_salvos
         ' . SQL_JUNCOES_PIN . '
         ORDER BY total_salvos DESC, p.data_criacao DESC
         LIMIT ' . max(1, min($limite, 12))
    );
    $consulta->execute(['usuario_logado' => $usuarioLogado ?? 0]);
    return $consulta->fetchAll();
}

function listarPinsDoUsuario(PDO $pdo, int $autorId, ?int $usuarioLogado = null): array
{
    $consulta = $pdo->prepare(
        'SELECT ' . SQL_COLUNAS_PIN . ' ' . SQL_JUNCOES_PIN . '
         WHERE p.usuario_id = :autor
         ORDER BY p.data_criacao DESC, p.id DESC'
    );
    $consulta->execute(['usuario_logado' => $usuarioLogado ?? 0, 'autor' => $autorId]);
    return $consulta->fetchAll();
}

function consultarPinPorId(PDO $pdo, int $pinId, ?int $usuarioLogado = null): ?array
{
    $consulta = $pdo->prepare(
        'SELECT ' . SQL_COLUNAS_PIN . ' ' . SQL_JUNCOES_PIN . '
         WHERE p.id = :pin_id
         LIMIT 1'
    );
    $consulta->execute(['usuario_logado' => $usuarioLogado ?? 0, 'pin_id' => $pinId]);
    $pin = $consulta->fetch();

    return $pin ?: null;
}

/**
 * Edita um Pin. Somente o autor pode editar.
 * $caminhoImagem = null mantém a imagem atual.
 */
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
    conferirUsuarioDaSessao($usuarioId);

    $titulo = textoValidado($titulo, 100, 'título');
    $descricao = textoOpcional($descricao ?? '', 500, 'descrição');
    $linkDestino = urlOpcionalValidada($linkDestino ?? '');
    $textoAlternativo = textoOpcional($textoAlternativo ?? '', 255, 'texto alternativo');

    if (!categoriaExiste($pdo, $categoriaId)) {
        throw new InvalidArgumentException('Selecione uma categoria válida.');
    }

    // A verificação de autoria é feita antes do UPDATE: o rowCount() do MySQL
    // retorna 0 quando nada mudou, o que não significa erro.
    $pin = consultarPinPorId($pdo, $pinId);
    if ($pin === null || (int) $pin['usuario_id'] !== $usuarioId) {
        return false;
    }

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

    if ($caminhoImagem !== null && $caminhoImagem !== $pin['caminho_imagem']) {
        removerImagemEnviada($pin['caminho_imagem']);
    }

    return true;
}

/**
 * Exclui um Pin e a imagem enviada. O autor pode excluir os próprios
 * Pins; o administrador pode excluir qualquer Pin.
 */
function excluirPin(PDO $pdo, int $usuarioId, int $pinId, bool $comoAdmin = false): bool
{
    conferirUsuarioDaSessao($usuarioId);

    $pin = consultarPinPorId($pdo, $pinId);
    if ($pin === null) {
        return false;
    }
    if (!$comoAdmin && (int) $pin['usuario_id'] !== $usuarioId) {
        return false;
    }

    $consulta = $pdo->prepare('DELETE FROM pins WHERE id = :pin_id');
    $consulta->execute(['pin_id' => $pinId]);

    if ($consulta->rowCount() > 0) {
        removerImagemEnviada($pin['caminho_imagem']);
        return true;
    }
    return false;
}

/* =====================================================================
   PINS SALVOS
   ===================================================================== */

/**
 * RN02: impede salvar o mesmo Pin duas vezes.
 * A chave única (usuario_id, pin_id) da tabela pins_salvos garante a regra
 * no banco; INSERT IGNORE não insere a duplicata e rowCount() fica 0.
 * Retorna true se salvou agora e false se o Pin já estava salvo.
 */
function salvarPin(PDO $pdo, int $usuarioId, int $pinId): bool
{
    conferirUsuarioDaSessao($usuarioId);

    // Sem esta conferência, o INSERT IGNORE também ignoraria um Pin inexistente.
    if (consultarPinPorId($pdo, $pinId) === null) {
        throw new InvalidArgumentException('Pin não encontrado.');
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

/**
 * Remove o Pin dos salvos e também das pastas do usuário.
 */
function removerPinSalvo(PDO $pdo, int $usuarioId, int $pinId): bool
{
    conferirUsuarioDaSessao($usuarioId);

    $pdo->beginTransaction();
    try {
        $removerDasPastas = $pdo->prepare(
            'DELETE pp FROM pin_pasta pp
             INNER JOIN pastas pa ON pa.id = pp.pasta_id
             WHERE pa.usuario_id = :usuario_id AND pp.pin_id = :pin_id'
        );
        $removerDasPastas->execute(['usuario_id' => $usuarioId, 'pin_id' => $pinId]);

        $consulta = $pdo->prepare(
            'DELETE FROM pins_salvos WHERE usuario_id = :usuario_id AND pin_id = :pin_id'
        );
        $consulta->execute(['usuario_id' => $usuarioId, 'pin_id' => $pinId]);
        $pdo->commit();
    } catch (Throwable $erro) {
        $pdo->rollBack();
        throw $erro;
    }

    return $consulta->rowCount() > 0;
}

function consultarPinsSalvos(PDO $pdo, int $usuarioId): array
{
    conferirUsuarioDaSessao($usuarioId);

    $consulta = $pdo->prepare(
        'SELECT ' . SQL_COLUNAS_PIN . ', ps.data_salvamento ' . SQL_JUNCOES_PIN . '
         WHERE ps.id IS NOT NULL
         ORDER BY ps.data_salvamento DESC'
    );
    $consulta->execute(['usuario_logado' => $usuarioId]);
    return $consulta->fetchAll();
}
