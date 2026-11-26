<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

$usuarioId = exigirLoginNaPagina('../dados/login.php');
$destino = destinoRetorno('principal.php');
exigirPostComCsrf($destino);

try {
    $pinId = inteiroPositivo(valorPost('pin_id'), 'Pin');
    $motivo = valorPost('motivo');
    $motivosPermitidos = [
        'conteudo_inadequado',
        'spam',
        'direitos_autorais',
        'outro',
    ];
    if (!in_array($motivo, $motivosPermitidos, true)) {
        throw new InvalidArgumentException('Selecione um motivo válido para a denúncia.');
    }

    $detalhes = textoOpcional(valorPost('detalhes'), 500, 'detalhes');
    $pdo = criarConexao();
    if (consultarPinPorId($pdo, $pinId, $usuarioId) === null) {
        throw new InvalidArgumentException('Este Pin não está mais disponível.');
    }

    $consulta = $pdo->prepare(
        'INSERT INTO denuncias_pins (usuario_id, pin_id, motivo, detalhes)
         VALUES (:usuario_id, :pin_id, :motivo, :detalhes)'
    );
    $consulta->execute([
        'usuario_id' => $usuarioId,
        'pin_id' => $pinId,
        'motivo' => $motivo,
        'detalhes' => $detalhes,
    ]);
    definirAviso('sucesso', 'Denúncia registrada e enviada para análise.');
} catch (InvalidArgumentException $erro) {
    definirAviso('erro', $erro->getMessage());
} catch (PDOException $erro) {
    error_log('Falha ao registrar denúncia de Pin: ' . $erro->getMessage());
    if ($erro->getCode() === '23000' && (int) ($erro->errorInfo[1] ?? 0) === 1062) {
        definirAviso('erro', 'Você já registrou uma denúncia para este Pin.');
    } elseif (
        $erro->getCode() === '42S02'
        || (int) ($erro->errorInfo[1] ?? 0) === 1146
    ) {
        definirAviso('erro', 'A denúncia ainda não está disponível. Aplique a migration SQL para ativar o registro.');
    } else {
        definirAviso('erro', 'Não foi possível registrar a denúncia. Tente novamente.');
    }
} catch (Throwable $erro) {
    error_log('Falha ao registrar denúncia de Pin: ' . $erro->getMessage());
    definirAviso('erro', 'Não foi possível registrar a denúncia. Tente novamente.');
}

redirecionar($destino);
