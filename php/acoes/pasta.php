<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

$usuarioId = exigirLoginNaPagina('../dados/login.php');
$destino = destinoRetorno('perfil.php?aba=pastas');
exigirPostComCsrf($destino);

try {
    $pdo = criarConexao();

    switch (valorPost('acao')) {
        case 'criar':
            $pastaId = criarPasta($pdo, $usuarioId, valorPost('nome'), valorPost('descricao'));
            definirAviso('sucesso', 'Pasta criada.');
            $destino = '../dados/perfil.php?aba=pastas&pasta=' . $pastaId;
            break;

        case 'editar':
            $pastaId = inteiroPositivo(valorPost('pasta_id'), 'pasta');
            if (editarPasta($pdo, $usuarioId, $pastaId, valorPost('nome'), valorPost('descricao'))) {
                definirAviso('sucesso', 'Pasta atualizada.');
            } else {
                definirAviso('erro', 'Pasta não encontrada.');
            }
            break;

        case 'excluir':
            $pastaId = inteiroPositivo(valorPost('pasta_id'), 'pasta');
            if (excluirPasta($pdo, $usuarioId, $pastaId)) {
                definirAviso('sucesso', 'Pasta excluída. Os Pins continuam salvos no seu perfil.');
            } else {
                definirAviso('erro', 'Pasta não encontrada.');
            }
            $destino = '../dados/perfil.php?aba=pastas';
            break;

        case 'adicionar_pin':
            $pastaId = inteiroPositivo(valorPost('pasta_id'), 'pasta');
            $pinId = inteiroPositivo(valorPost('pin_id'), 'Pin');
            if (adicionarPinNaPasta($pdo, $usuarioId, $pastaId, $pinId)) {
                definirAviso('sucesso', 'Pin adicionado à pasta.');
            } else {
                definirAviso('erro', 'Este Pin já está nessa pasta.');
            }
            break;

        case 'remover_pin':
            $pastaId = inteiroPositivo(valorPost('pasta_id'), 'pasta');
            $pinId = inteiroPositivo(valorPost('pin_id'), 'Pin');
            if (removerPinDaPasta($pdo, $usuarioId, $pastaId, $pinId)) {
                definirAviso('sucesso', 'Pin removido da pasta. Ele continua nos seus salvos.');
            } else {
                definirAviso('erro', 'O Pin não está nessa pasta.');
            }
            break;

        default:
            definirAviso('erro', 'Ação inválida.');
    }
} catch (InvalidArgumentException $erro) {
    definirAviso('erro', $erro->getMessage());
} catch (Throwable $erro) {
    error_log('Falha na ação de pasta: ' . $erro->getMessage());
    definirAviso('erro', 'Não foi possível concluir a ação. Tente novamente.');
}

redirecionar($destino);
