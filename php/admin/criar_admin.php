<?php
declare(strict_types=1);

/**
 * Cria a conta de administrador. Execute pelo terminal, na raiz do projeto:
 *
 *     php php/admin/criar_admin.php
 *
 * No XAMPP (Windows): C:\xampp\php\php.exe php\admin\criar_admin.php
 * Se o e-mail já estiver cadastrado, a conta existente vira administradora.
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Este procedimento deve ser executado apenas pelo terminal.');
}

require_once __DIR__ . '/../config/conexao.php';
require_once __DIR__ . '/../funcoes/validacao.php';

// readline nem sempre está disponível (ex.: algumas instalações no Windows).
function perguntar(string $texto): string
{
    if (function_exists('readline')) {
        return trim((string) readline($texto));
    }

    echo $texto;
    return trim((string) fgets(STDIN));
}

echo "Criação da conta administradora\n";
$nome = perguntar('Nome: ');
$email = perguntar('E-mail: ');
$senha = perguntar('Senha (mínimo 8 caracteres): ');

try {
    $nome = textoValidado($nome, 60, 'nome');
    $email = emailValidado($email);

    $pdo = criarConexao();
    $consulta = $pdo->prepare('SELECT id FROM usuarios WHERE email = :email LIMIT 1');
    $consulta->execute(['email' => $email]);
    $idExistente = $consulta->fetchColumn();

    if ($idExistente !== false) {
        $resposta = strtolower(perguntar('Este e-mail já está cadastrado. Tornar essa conta administradora? (s/n): '));
        if ($resposta !== 's') {
            echo "Nenhuma alteração foi feita.\n";
            exit(0);
        }
        $pdo->prepare("UPDATE usuarios SET tipo_usuario = 'admin' WHERE id = :id")
            ->execute(['id' => $idExistente]);
        echo "A conta agora é administradora.\n";
        exit(0);
    }

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
        'tipo_usuario' => 'admin',
    ]);

    echo "Administrador criado com sucesso. Entre pelo login normal e acesse o Painel no menu.\n";
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
