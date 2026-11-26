<?php
declare(strict_types=1);

require_once __DIR__ . '/validacao.php';
require_once __DIR__ . '/upload.php';
require_once __DIR__ . '/../includes/autenticacao.php';

function criarUsuario(PDO $pdo, string $nome, string $email, string $senha, string $nascimento): int
{
    $nome = textoValidado($nome, 60, 'nome');
    $email = emailValidado($email);
    $nascimento = dataNascimentoValidada($nascimento);

    if (mb_strlen($senha, 'UTF-8') < 8) {
        throw new InvalidArgumentException('A senha deve ter pelo menos 8 caracteres.');
    }

    $consultaExistente = $pdo->prepare('SELECT 1 FROM usuarios WHERE email = :email LIMIT 1');
    $consultaExistente->execute(['email' => $email]);
    if ($consultaExistente->fetchColumn()) {
        throw new InvalidArgumentException('Este e-mail já está cadastrado.');
    }

    $consulta = $pdo->prepare(
        'INSERT INTO usuarios (nome, email, data_nascimento, senha_hash, tipo_usuario)
         VALUES (:nome, :email, :data_nascimento, :senha_hash, :tipo_usuario)'
    );
    $consulta->execute([
        'nome' => $nome,
        'email' => $email,
        'data_nascimento' => $nascimento,
        'senha_hash' => password_hash($senha, PASSWORD_DEFAULT),
        'tipo_usuario' => 'usuario',
    ]);

    return (int) $pdo->lastInsertId();
}

function consultarUsuarioPorEmail(PDO $pdo, string $email): ?array
{
    $email = emailValidado($email);
    $consulta = $pdo->prepare(
        'SELECT id, nome, email, senha_hash, tipo_usuario, foto, data_criacao
         FROM usuarios
         WHERE email = :email
         LIMIT 1'
    );
    $consulta->execute(['email' => $email]);
    $usuario = $consulta->fetch();

    return $usuario ?: null;
}

/**
 * Dados públicos do usuário (sem o hash da senha).
 */
function consultarUsuarioPorId(PDO $pdo, int $usuarioId): ?array
{
    $consulta = $pdo->prepare(
        'SELECT id, nome, email, tipo_usuario, nome_usuario, sobre, site, foto, data_nascimento, data_criacao
         FROM usuarios
         WHERE id = :id
         LIMIT 1'
    );
    $consulta->execute(['id' => $usuarioId]);
    $usuario = $consulta->fetch();

    return $usuario ?: null;
}

/**
 * Edição do perfil (página Configurações).
 * $novaFoto = null mantém a foto atual, salvo quando $removerFoto é true.
 */
function atualizarPerfil(
    PDO $pdo,
    int $usuarioId,
    string $nome,
    string $nomeUsuario,
    string $sobre,
    string $site,
    ?string $novaFoto = null,
    bool $removerFoto = false
): void {
    conferirUsuarioDaSessao($usuarioId);

    if ($removerFoto && $novaFoto !== null) {
        throw new InvalidArgumentException('Escolha uma foto nova ou remova a foto atual.');
    }

    $nome = textoValidado($nome, 60, 'nome');
    $nomeUsuario = nomeUsuarioOpcional($nomeUsuario);
    $sobre = textoOpcional($sobre, 500, 'sobre você');
    $site = urlOpcionalValidada($site);

    if ($nomeUsuario !== null) {
        $consulta = $pdo->prepare(
            'SELECT 1 FROM usuarios WHERE nome_usuario = :nome_usuario AND id <> :id LIMIT 1'
        );
        $consulta->execute(['nome_usuario' => $nomeUsuario, 'id' => $usuarioId]);
        if ($consulta->fetchColumn()) {
            throw new InvalidArgumentException('Este nome de usuário já está em uso.');
        }
    }

    $atual = consultarUsuarioPorId($pdo, $usuarioId);
    if ($atual === null) {
        throw new RuntimeException('Usuário não encontrado.');
    }

    $fotoAtualizada = $removerFoto ? null : ($novaFoto ?? $atual['foto']);

    try {
        $consulta = $pdo->prepare(
            'UPDATE usuarios
             SET nome = :nome,
                 nome_usuario = :nome_usuario,
                 sobre = :sobre,
                 site = :site,
                 foto = :foto
             WHERE id = :id'
        );
        $consulta->execute([
            'nome' => $nome,
            'nome_usuario' => $nomeUsuario,
            'sobre' => $sobre,
            'site' => $site,
            'foto' => $fotoAtualizada,
            'id' => $usuarioId,
        ]);
    } catch (PDOException $erro) {
        if ($erro->getCode() === '23000') {
            throw new InvalidArgumentException('Este nome de usuário já está em uso.');
        }
        throw $erro;
    }

    if (($novaFoto !== null || $removerFoto) && $fotoAtualizada !== $atual['foto']) {
        removerImagemEnviada($atual['foto']);
    }

    atualizarDadosSessao($nome, $fotoAtualizada);
}

/**
 * Listagem do painel administrativo.
 */
function listarUsuarios(PDO $pdo): array
{
    return $pdo->query(
        'SELECT u.id, u.nome, u.email, u.tipo_usuario, u.data_criacao,
                COUNT(p.id) AS total_pins
         FROM usuarios u
         LEFT JOIN pins p ON p.usuario_id = u.id
         GROUP BY u.id, u.nome, u.email, u.tipo_usuario, u.data_criacao
         ORDER BY u.data_criacao DESC'
    )->fetchAll();
}
