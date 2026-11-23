<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

$usuarioId = exigirLoginNaPagina('../dados/login.php');
$destino = destinoRetorno('principal.php');
exigirPostComCsrf($destino);

try {
    $pinId = inteiroPositivo(valorPost('pin_id'), 'Pin');
    $pdo = criarConexao();

    if (valorPost('acao') === 'remover') {
        removerPinSalvo($pdo, $usuarioId, $pinId);
        definirAviso('sucesso', 'Pin removido dos seus salvos.');
    } elseif (salvarPin($pdo, $usuarioId, $pinId)) {
        definirAviso('sucesso', 'Pin salvo no seu perfil.');
    } else {
        // RN02: o Pin já estava salvo e não foi duplicado.
        definirAviso('erro', 'Este Pin já está salvo no seu perfil.');
    }
} catch (InvalidArgumentException $erro) {
    definirAviso('erro', $erro->getMessage());
} catch (Throwable $erro) {
    error_log('Falha ao salvar Pin: ' . $erro->getMessage());
    definirAviso('erro', 'Não foi possível concluir a ação. Tente novamente.');
}

redirecionar($destino);
