<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

$usuarioId = exigirLoginNaPagina('../dados/login.php');
$destino = destinoRetorno('perfil.php?aba=criados');
exigirPostComCsrf($destino);

try {
    $pinId = inteiroPositivo(valorPost('pin_id'), 'Pin');

    // A função só exclui se o usuário for o autor do Pin.
    if (excluirPin(criarConexao(), $usuarioId, $pinId)) {
        definirAviso('sucesso', 'Pin excluído.');
    } else {
        definirAviso('erro', 'Pin não encontrado ou você não tem permissão para excluí-lo.');
    }
} catch (InvalidArgumentException $erro) {
    definirAviso('erro', $erro->getMessage());
} catch (Throwable $erro) {
    error_log('Falha ao excluir Pin: ' . $erro->getMessage());
    definirAviso('erro', 'Não foi possível excluir o Pin. Tente novamente.');
}

// Depois de excluir, a página de edição do Pin não existe mais.
if (str_contains($destino, 'editar_pin.php')) {
    $destino = '../dados/perfil.php?aba=criados';
}
redirecionar($destino);
