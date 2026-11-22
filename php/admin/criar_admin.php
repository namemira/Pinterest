<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Este procedimento deve ser executado apenas pelo terminal.');
}

require_once __DIR__ . '/../config/conexao.php';
require_once __DIR__ . '/../funcoes/validacao.php';

echo "Criação local da primeira conta administradora\n";
$nome = trim((string) readline('Nome: '));
$email = trim((string) readline('E-mail: '));
$senha = (string) readline('Senha (mínimo 8 caracteres): ');

try {
    $nome = textoValidado($nome, 60);
    $email = emailValidado($email);
    if (mb_strlen($senha, 'UTF-8') < 8) {
        throw new InvalidArgumentException('A senha deve ter pelo menos 8 caracteres.');
    }

    $pdo = criarConexao();
    $consulta = $pdo->prepare(
        'INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario)
         VALUES (:nome, :email, :senha_hash, :tipo_usuario)'
    );
    $consulta->execute([
        'nome' => $nome,
        'email' => $email,
        'senha_hash' => password_hash($senha, PASSWORD_DEFAULT),
        'tipo_usuario' => 'admin',
    ]);

    echo "Administrador criado com sucesso.\n";
} catch (Throwable $erro) {
    if ($erro instanceof InvalidArgumentException) {
        fwrite(STDERR, 'Dados inválidos: ' . $erro->getMessage() . PHP_EOL);
    } elseif ($erro instanceof RuntimeException) {
        fwrite(STDERR, $erro->getMessage() . PHP_EOL);
    } else {
        fwrite(STDERR, "Não foi possível criar o administrador.\n");
    }
    exit(1);
}
