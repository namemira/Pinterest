<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/autenticacao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit('Método não permitido.');
}

iniciarSessaoSeguro();

if (!validarTokenCsrf($_POST['csrf_token'] ?? null)) {
    http_response_code(403);
    exit('Solicitação inválida.');
}

encerrarSessao();
header('Location: ../dados/login.php', true, 303);
exit;
