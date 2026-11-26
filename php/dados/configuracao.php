<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

$usuarioId = exigirLoginNaPagina();
$aviso = obterAviso();

try {
    $pdo = criarConexao();
    $usuario = consultarUsuarioPorId($pdo, $usuarioId);
} catch (Throwable $erro) {
    error_log('Falha ao abrir Configurações: ' . $erro->getMessage());
    $usuario = null;
}

if ($usuario === null) {
    http_response_code(500);
    exit('Não foi possível carregar seus dados agora.');
}

$dados = [
    'nome' => $usuario['nome'],
    'usuario' => $usuario['nome_usuario'] ?? '',
    'descricao' => $usuario['sobre'] ?? '',
    'site' => $usuario['site'] ?? '',
];
$fotoPerfil = urlFotoPerfil($usuario['foto'] ?? null);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach (array_keys($dados) as $campo) {
        $dados[$campo] = trim(valorPost($campo));
    }

    if ($_POST === [] && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
        $aviso = ['tipo' => 'erro', 'texto' => 'A foto ultrapassa o tamanho máximo permitido pelo servidor.'];
    } elseif (!validarTokenCsrf($_POST['csrf_token'] ?? null)) {
        $aviso = ['tipo' => 'erro', 'texto' => 'Sua sessão expirou. Atualize a página e tente novamente.'];
    } else {
        $novaFoto = null;
        $removerFoto = valorPost('remover_foto') === '1';
        try {
            // Valida os campos de texto antes de gravar a foto.
            textoValidado($dados['nome'], 60, 'nome');
            nomeUsuarioOpcional($dados['usuario']);
            textoOpcional($dados['descricao'], 500, 'sobre você');
            urlOpcionalValidada($dados['site']);

            if (arquivoFoiEnviado('foto')) {
                $novaFoto = salvarImagemEnviada('foto', 'perfil');
            }

            atualizarPerfil($pdo, $usuarioId, $dados['nome'], $dados['usuario'], $dados['descricao'], $dados['site'], $novaFoto, $removerFoto);
            definirAviso('sucesso', 'Perfil atualizado.');
            redirecionar('configuracao.php');
        } catch (InvalidArgumentException $erro) {
            removerImagemEnviada($novaFoto);
            $aviso = ['tipo' => 'erro', 'texto' => $erro->getMessage()];
        } catch (Throwable $erro) {
            removerImagemEnviada($novaFoto);
            error_log('Falha ao atualizar perfil: ' . $erro->getMessage());
            $aviso = ['tipo' => 'erro', 'texto' => 'Não foi possível salvar as alterações. Tente novamente.'];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurações | Pinterest</title>

    <link rel="stylesheet" href="../../css/principal.css">
    <link rel="stylesheet" href="../../css/configuracoes.css">
    <link rel="stylesheet" href="../../css/tema.css">
    <link rel="stylesheet" href="../../css/php.css">
    <link rel="icon" href="../../Imagens/Icone.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
</head>

<body>

<!-- Menu lateral completo, incluindo o painel Criar -->
<?php require_once __DIR__ . '/../includes/menu.php'; ?>

<!-- Cabeçalho principal -->
<?php require_once __DIR__ . '/../includes/cabecalho_principal.php'; ?>

<!--Configurações-->
<main class="configuracoes">

    <!-- Menu interno -->
    <aside class="navegacao-configuracoes">

        <h1>Configurações</h1>

        <button class="opcao-config ativa" type="button" data-secao="editar-perfil">
            Editar perfil
        </button>
        <button class="opcao-config" type="button" data-secao="exibicao">
            Configurações de exibição
        </button>

    </aside>

<!-- Conteúdo -->
    <section class="conteudo-configuracoes">
 <!-- Editar perfil: salvo no banco pelo PHP acima -->
    <div id="editar-perfil" class="configuracao-secao ativa">
        <h2>Editar perfil</h2>
        <p>Personalize as informações do seu perfil.</p>
        <?= exibirAviso($aviso) ?>

        <form class="formulario-perfil" id="formulario-perfil" method="post" action="configuracao.php" enctype="multipart/form-data" novalidate>
        <?= campoCsrf() ?>
        <input type="hidden" name="MAX_FILE_SIZE" value="<?= TAMANHO_MAXIMO_IMAGEM ?>">
        <input type="hidden" name="remover_foto" id="remover-foto-valor" value="0">
        <div class="foto-perfil-config">

            <?php if ($fotoPerfil !== null): ?>
            <img src="<?= e($fotoPerfil) ?>" alt="Foto de perfil" id="imagem-perfil">
            <span class="avatar-placeholder" id="imagem-perfil-neutra" aria-hidden="true" hidden><?= e(inicialNome((string) $dados['nome'])) ?></span>
            <?php else: ?>
            <img alt="Foto de perfil" id="imagem-perfil" hidden>
            <span class="avatar-placeholder" id="imagem-perfil-neutra" aria-hidden="true"><?= e(inicialNome((string) $dados['nome'])) ?></span>
            <?php endif; ?>
            <div>
                <button type="button" id="alterar-foto">
                    Alterar foto
                </button>
                <button type="button" id="remover-foto"<?= $fotoPerfil === null ? ' hidden' : '' ?>>
                    Remover foto
                </button>
                <input type="file" id="foto-perfil-input" name="foto" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" hidden>
                <small class="dica-config">JPG, PNG ou WEBP, até 10 MB. A foto é salva ao clicar em Salvar alterações.</small>
            </div>
        </div>
        <table class="tabela-perfil">
            <caption class="legenda-tabela">Dados do perfil</caption>
            <tbody>
                <tr>
                    <th scope="row">
                        <label for="nome">Nome</label>
                    </th>
                    <td>
                        <input type="text" id="nome" name="nome" placeholder="Seu nome" required maxlength="60" value="<?= e($dados['nome']) ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="usuario">Nome de usuário</label>
                    </th>
                    <td>
                        <input type="text" id="usuario" name="usuario" placeholder="Nome de usuário" pattern="[a-z0-9_.]{3,30}" aria-describedby="usuario-dica" value="<?= e($dados['usuario']) ?>">
                        <small id="usuario-dica" class="dica-config">De 3 a 30 caracteres: letras minúsculas, números, ponto ou _.</small>
                    </td>
                </tr>

                <tr>
                    <th scope="row">
                        <label for="descricao">Sobre você</label>
                    </th>
                    <td>
                        <textarea id="descricao" name="descricao" maxlength="500" placeholder="Conte um pouco sobre você"><?= e($dados['descricao']) ?></textarea>
                    </td>
                </tr>

                <tr>
                    <th scope="row">
                        <label for="site">Site</label>
                    </th>
                    <td>
                        <input type="url" id="site" name="site" placeholder="https://" value="<?= e($dados['site']) ?>">
                    </td>
                </tr>

                <tr>
                    <th scope="row">E-mail</th>
                    <td><?= e($usuario['email']) ?></td>
                </tr>

            </tbody>

        </table>
        <button type="submit" class="botao-salvar" id="salvar-perfil">
            Salvar alterações
        </button>
        <p class="mensagem-config" id="mensagem-config" role="status" aria-live="polite"></p>
        </form>
    </div>
<!-- Configurações de exibição (tema guardado no navegador) -->
        <div id="exibicao" class="configuracao-secao">

            <h2>Configurações de exibição</h2>
            <p>Personalize a aparência da sua experiência.</p>

            <div class="opcao-exibicao">
                <div>
                    <h3>Tema</h3>
                    <p>Escolha a aparência da plataforma.</p>
                </div>

                <div class="opcoes-tema">
                    <label>
                        <input type="radio" name="tema" value="claro" checked>
                        Claro
                    </label>

                    <label>
                        <input type="radio" name="tema" value="escuro">
                        Escuro
                    </label>
                </div>
            </div>
            </div>
    </section>
</main>
<?php require_once __DIR__ . '/../includes/rodape_principal.php'; ?>
<script src="../../js/pesquisa.js" defer></script>
<script src="../../js/menu.js" defer></script>
<script src="../../js/configuracoes.js" defer></script>
<script src="../../js/tema.js" defer></script>
</body>
</html>
