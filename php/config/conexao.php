<?php
declare(strict_types=1);

/**
 * Creates the PDO connection.
 *
 * Credentials can be supplied through environment variables or a local,
 * gitignored PHP file named php/config/conexao_local.php.
 */
function criarConexao(): PDO
{
    $configuracoes = [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => getenv('DB_PORT') ?: '3306',
        'dbname' => getenv('DB_NAME') ?: 'pinterest',
        'charset' => 'utf8mb4',
        'user' => getenv('DB_USER') ?: '',
        'pass' => getenv('DB_PASS') ?: '',
    ];

    $arquivoLocal = __DIR__ . '/conexao_local.php';
    if (is_file($arquivoLocal)) {
        $local = require $arquivoLocal;
        if (is_array($local)) {
            $configuracoes = array_replace($configuracoes, $local);
        }
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        $configuracoes['host'],
        $configuracoes['port'],
        $configuracoes['dbname'],
        $configuracoes['charset']
    );

    try {
        $pdo = new PDO($dsn, $configuracoes['user'], $configuracoes['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
        return $pdo;
    } catch (PDOException $erro) {
        error_log('Falha ao conectar ao banco de dados: ' . $erro->getMessage());
        throw new RuntimeException('Não foi possível conectar ao banco de dados.');
    }
}
