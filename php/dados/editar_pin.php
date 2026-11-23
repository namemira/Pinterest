<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

$usuarioId = exigirLoginNaPagina();

$modoEdicao = true;
$mensagem = '';
$tipoMensagem = 'erro';
$pastas = [];

try {
    $pinId = inteiroPositivo(valorGet('id'), 'Pin');
    $pdo = criarConexao();
    $pin = consultarPinPorId($pdo, $pinId);
    $categorias = listarCategorias($pdo);
} catch (Throwable $erro) {
    $pin = null;
}

// Somente o autor edita. Para os outros, o Pin "não existe".
if ($pin === null || (int) $pin['usuario_id'] !== $usuarioId) {
    definirAviso('erro', 'Pin não encontrado ou você não tem permissão para editá-lo.');
    redirecionar('perfil.php?aba=criados');
}

$imagemAtual = urlArquivo($pin['caminho_imagem']);
$dados = [
    'titulo' => $pin['titulo'],
    'descricao' => $pin['descricao'] ?? '',
    'categoria_id' => (string) $pin['categoria_id'],
    'texto_alternativo' => $pin['texto_alternativo'] ?? '',
    'link' => $pin['link_destino'] ?? '',
    'pasta' => '',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach (['titulo', 'descricao', 'categoria_id', 'texto_alternativo', 'link'] as $campo) {
        $dados[$campo] = trim(valorPost($campo));
    }

    if ($_POST === [] && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
        $mensagem = 'A imagem ultrapassa o tamanho máximo permitido pelo servidor.';
    } elseif (!validarTokenCsrf($_POST['csrf_token'] ?? null)) {
        $mensagem = 'Sua sessão expirou. Atualize a página e tente novamente.';
    } else {
        $novaImagem = null;
        try {
            textoValidado($dados['titulo'], 100, 'título');
            urlOpcionalValidada($dados['link']);
            if ($dados['categoria_id'] === '') {
                throw new InvalidArgumentException('Selecione uma categoria.');
            }
            $categoriaId = inteiroPositivo($dados['categoria_id'], 'categoria');

            // A imagem só é trocada se uma nova for enviada.
            if (arquivoFoiEnviado('imagem')) {
                $novaImagem = salvarImagemEnviada('imagem', 'pins');
            }

            editarPin(
                $pdo,
                $usuarioId,
                $pinId,
                $categoriaId,
                $dados['titulo'],
                $dados['descricao'],
                $dados['link'],
                $novaImagem,
                $dados['texto_alternativo']
            );

            definirAviso('sucesso', 'Pin atualizado.');
            redirecionar('perfil.php?aba=criados#pin-' . $pinId);
        } catch (InvalidArgumentException $erro) {
            removerImagemEnviada($novaImagem);
            $mensagem = $erro->getMessage();
        } catch (Throwable $erro) {
            removerImagemEnviada($novaImagem);
            error_log('Falha ao editar Pin: ' . $erro->getMessage());
            $mensagem = 'Não foi possível salvar as alterações. Tente novamente.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Pin | Pinterest</title>
    <link rel="stylesheet" href="../../css/principal.css">
    <link rel="icon" href="../../Imagens/Icone.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../css/tema.css">
    <link rel="stylesheet" href="../../css/php.css">
</head>
<body>
<?php require_once __DIR__ . '/../includes/menu.php'; ?>
<?php require_once __DIR__ . '/../includes/cabecalho_principal.php'; ?>
    <main>
<?php require __DIR__ . '/../includes/formulario_pin.php'; ?>
        <!-- Exclusão do Pin (D do CRUD) -->
        <form class="excluir-pin-edicao" method="post" action="../acoes/pin_excluir.php" data-confirmar="Excluir este Pin? Esta ação não pode ser desfeita.">
            <?= campoCsrf() ?>
            <input type="hidden" name="pin_id" value="<?= (int) $pinId ?>">
            <input type="hidden" name="voltar" value="perfil.php?aba=criados">
            <button class="botao-texto botao-perigo" type="submit">Excluir Pin</button>
        </form>
    </main>
<?php require_once __DIR__ . '/../includes/rodape_principal.php'; ?>
<script src="../../js/pesquisa.js" defer></script>
<script src="../../js/menu.js" defer></script>
<script src="../../js/acoes_php.js" defer></script>
<script src="../../js/tema.js" defer></script>
</body>
</html>
