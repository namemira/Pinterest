<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

// RN01: somente usuários autenticados podem publicar.
$usuarioId = exigirLoginNaPagina();

$modoEdicao = false;
$imagemAtual = null;
$mensagem = '';
$tipoMensagem = 'erro';
$dados = [
    'titulo' => '',
    'descricao' => '',
    'categoria_id' => '',
    'texto_alternativo' => '',
    'link' => '',
    'pasta' => '',
];

try {
    $pdo = criarConexao();
    $categorias = listarCategorias($pdo);
    $pastas = listarPastas($pdo, $usuarioId);
} catch (Throwable $erro) {
    error_log('Falha ao abrir Criar Pin: ' . $erro->getMessage());
    $categorias = $pastas = [];
    $mensagem = 'Não foi possível carregar o formulário agora.';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($pdo)) {
    foreach (array_keys($dados) as $campo) {
        $dados[$campo] = trim(valorPost($campo));
    }

    // Formulário maior que o post_max_size do php.ini chega vazio.
    if ($_POST === [] && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
        $mensagem = 'A imagem ultrapassa o tamanho máximo permitido pelo servidor.';
    } elseif (!validarTokenCsrf($_POST['csrf_token'] ?? null)) {
        $mensagem = 'Sua sessão expirou. Atualize a página e tente novamente.';
    } else {
        $caminhoImagem = null;
        try {
            // Validações antes de gravar a imagem no servidor.
            textoValidado($dados['titulo'], 100, 'título');
            textoOpcional($dados['descricao'], 500, 'descrição');
            textoOpcional($dados['texto_alternativo'], 255, 'texto alternativo');
            urlOpcionalValidada($dados['link']);
            if ($dados['categoria_id'] === '') {
                throw new InvalidArgumentException('Selecione uma categoria.');
            }
            $categoriaId = inteiroPositivo($dados['categoria_id'], 'categoria');
            $pastaId = $dados['pasta'] !== '' ? inteiroPositivo($dados['pasta'], 'pasta') : null;
            if ($pastaId !== null && consultarPasta($pdo, $usuarioId, $pastaId) === null) {
                throw new InvalidArgumentException('Pasta não encontrada.');
            }

            $caminhoImagem = salvarImagemEnviada('imagem', 'pins');

            $pdo->beginTransaction();
            try {
                $pinId = cadastrarPin(
                    $pdo,
                    $usuarioId,
                    $categoriaId,
                    $dados['titulo'],
                    $dados['descricao'],
                    $dados['link'],
                    $caminhoImagem,
                    $dados['texto_alternativo']
                );

                if ($pastaId !== null) {
                    adicionarPinNaPasta($pdo, $usuarioId, $pastaId, $pinId);
                }

                $pdo->commit();
            } catch (Throwable $erro) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                throw $erro;
            }

            definirAviso('sucesso', 'Pin publicado com sucesso.');
            redirecionar('perfil.php?aba=criados#pin-' . $pinId);
        } catch (InvalidArgumentException $erro) {
            removerImagemEnviada($caminhoImagem ?? null);
            $mensagem = $erro->getMessage();
        } catch (Throwable $erro) {
            removerImagemEnviada($caminhoImagem ?? null);
            error_log('Falha ao publicar Pin: ' . $erro->getMessage());
            $mensagem = 'Não foi possível publicar o Pin. Tente novamente.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Criar Pin | Pinterest</title>
    <link rel="stylesheet" href="../../css/principal.css">
      <link rel="icon" href="../../Imagens/Icone.png">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="../../css/tema.css">
      <link rel="stylesheet" href="../../css/php.css">
</head>
<body>
    <!--Menu-->
    <?php require_once __DIR__ . '/../includes/menu.php'; ?>
<!--Cabecalho-->
<?php require_once __DIR__ . '/../includes/cabecalho_principal.php'; ?>
    <!--Criacao do Pin-->
    <main>
<?php require __DIR__ . '/../includes/formulario_pin.php'; ?>
    </main>
<!--Rodapé com aviso de projeto acadêmico-->
<?php require_once __DIR__ . '/../includes/rodape_principal.php'; ?>
<script src="../../js/pesquisa.js" defer></script>
<script src="../../js/menu.js" defer></script>
<script src="../../js/acoes_php.js" defer></script>
<script src="../../js/criar_pin_preview.js" defer></script>
<script src="../../js/tema.js" defer></script>
</body>
</html>
