<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

$usuarioId = exigirLoginNaPagina();
$aviso = obterAviso();

$abasValidas = ['pastas', 'criados', 'salvos'];
$aba = in_array(valorGet('aba'), $abasValidas, true) ? valorGet('aba') : 'pastas';

$usuario = null;
$pastas = $pinsCriados = $pinsSalvos = $semPasta = $pinsPasta = [];
$pastaAberta = null;

try {
    $pdo = criarConexao();
    $usuario = consultarUsuarioPorId($pdo, $usuarioId);
    $pastas = listarPastas($pdo, $usuarioId);

    if ($aba === 'criados') {
        $pinsCriados = listarPinsDoUsuario($pdo, $usuarioId, $usuarioId);
    } elseif ($aba === 'salvos') {
        $pinsSalvos = consultarPinsSalvos($pdo, $usuarioId);
    } else {
        if (valorGet('pasta') !== '') {
            try {
                $pastaAberta = consultarPasta($pdo, $usuarioId, inteiroPositivo(valorGet('pasta'), 'pasta'));
            } catch (InvalidArgumentException $erro) {
                $pastaAberta = null;
            }
            if ($pastaAberta === null) {
                $aviso = ['tipo' => 'erro', 'texto' => 'Pasta não encontrada.'];
            } else {
                $pinsPasta = listarPinsDaPasta($pdo, $usuarioId, (int) $pastaAberta['id']);
            }
        }
        $semPasta = listarSalvosSemPasta($pdo, $usuarioId);
    }
} catch (Throwable $erro) {
    error_log('Falha ao carregar perfil: ' . $erro->getMessage());
    $aviso = ['tipo' => 'erro', 'texto' => 'Não foi possível carregar seu perfil agora.'];
}

$nomePerfil = $usuario['nome'] ?? $_SESSION['usuario_nome'];
$fotoPerfil = urlFotoPerfil($usuario['foto'] ?? null);
$rotulosAbas = ['pastas' => 'Pastas', 'criados' => 'Pins criados', 'salvos' => 'Pins salvos'];
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($nomePerfil) ?> | Pinterest</title>
      <link rel="stylesheet" href="../../css/principal.css">
      <link rel="icon" href="../../Imagens/Icone.png">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link rel="stylesheet" href="../../css/tema.css">
      <link rel="stylesheet" href="../../css/php.css">
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
</head>
<body>
<!--Menu-->
<?php require_once __DIR__ . '/../includes/menu.php'; ?>
<!--Cabecalho-->
<?php require_once __DIR__ . '/../includes/cabecalho_principal.php'; ?>
        <main class="pagina-perfil">
    <section class="pagina-pastas" id="pagina-pastas" aria-labelledby="perfil-nome">
                <!-- Dados do perfil vindos da tabela usuarios -->
                <header class="perfil-pastas">
                    <?php if ($fotoPerfil !== null): ?>
                    <img class="perfil-pastas-foto" src="<?= e($fotoPerfil) ?>" alt="Foto do perfil">
                    <?php else: ?>
                    <span class="perfil-pastas-foto avatar-placeholder" aria-hidden="true"><?= e(inicialNome((string) $nomePerfil)) ?></span>
                    <?php endif; ?>
                    <div class="perfil-pastas-identidade">
                        <h1 id="perfil-nome"><?= e($nomePerfil) ?></h1>
                        <?php if (!empty($usuario['nome_usuario'])): ?>
                        <p>@<?= e($usuario['nome_usuario']) ?></p>
                        <?php endif; ?>
                        <?php if (!empty($usuario['sobre'])): ?>
                        <p><?= e($usuario['sobre']) ?></p>
                        <?php endif; ?>
                        <?php if (!empty($usuario['site'])): ?>
                        <p><a href="<?= e($usuario['site']) ?>" target="_blank" rel="noopener noreferrer"><?= e($usuario['site']) ?></a></p>
                        <?php endif; ?>
                    </div>
                    <a class="perfil-compartilhar" href="configuracao.php">Editar perfil</a>
                </header>
                <?= exibirAviso($aviso) ?>

                <nav class="perfil-abas perfil-abas-links" aria-label="Conteúdo do perfil">
                    <?php foreach ($rotulosAbas as $chave => $rotulo): ?>
                    <a href="perfil.php?aba=<?= $chave ?>"<?= $aba === $chave ? ' aria-current="page"' : '' ?>><?= $rotulo ?></a>
                    <?php endforeach; ?>
                </nav>

<?php if ($aba === 'criados'): ?>
                <!-- Pins publicados pelo usuário (CRUD: editar e excluir) -->
                <section id="conteudo-pins" aria-label="Pins criados">
                    <?php if (!$pinsCriados): ?>
                    <div class="estado-vazio">
                        <h2>Você ainda não publicou nenhum Pin</h2>
                        <a class="botao-primario" href="criar_pin.php">Criar Pin</a>
                    </div>
                    <?php endif; ?>
                    <div class="postagens">
                        <?php foreach ($pinsCriados as $pin): ?>
                            <?php require __DIR__ . '/../includes/card_pin.php'; ?>
                        <?php endforeach; ?>
                    </div>
                </section>

<?php elseif ($aba === 'salvos'): ?>
                <section id="conteudo-pins" aria-label="Pins salvos">
                    <?php if (!$pinsSalvos): ?>
                    <div class="estado-vazio">
                        <h2>Nenhum Pin salvo</h2>
                        <p>Use o botão Salvar nos Pins do feed ou do Explorar.</p>
                    </div>
                    <?php endif; ?>
                    <div class="postagens">
                        <?php $opcoesCard = ['pastas' => $pastas]; ?>
                        <?php foreach ($pinsSalvos as $pin): ?>
                            <?php require __DIR__ . '/../includes/card_pin.php'; ?>
                        <?php endforeach; ?>
                        <?php unset($opcoesCard); ?>
                    </div>
                </section>

<?php else: ?>
<!--Area das Pastas-->
                <section class="organizacao-pastas" id="conteudo-pastas" aria-label="Pastas">
                    <!-- Criar pasta -->
                    <form class="formulario-php formulario-pasta" id="nova-pasta" method="post" action="../acoes/pasta.php">
                        <h2>Criar pasta</h2>
                        <?= campoCsrf() ?>
                        <input type="hidden" name="acao" value="criar">
                        <label for="pasta-nome">Nome</label>
                        <input id="pasta-nome" name="nome" type="text" maxlength="100" required placeholder="Ex.: Receitas para o fim de semana">
                        <label for="pasta-descricao">Descrição <span class="opcional">(opcional)</span></label>
                        <textarea id="pasta-descricao" name="descricao" maxlength="500" rows="2"></textarea>
                        <button class="botao-primario" type="submit">Criar pasta</button>
                    </form>

                    <?php if (!$pastas): ?>
                    <div class="pastas-vazio-pagina">
                        <h2>Organize suas ideias</h2>
                        <p>Crie pastas para reunir e organizar os Pins que você salvou.</p>
                    </div>
                    <?php endif; ?>

                    <div class="pastas-grade" id="pastas-grade">
                        <?php foreach ($pastas as $pasta): ?>
                        <article class="pasta-cartao">
                            <a class="pasta-abrir-cartao" href="perfil.php?aba=pastas&amp;pasta=<?= (int) $pasta['id'] ?>#detalhe-pasta">
                                <div class="pasta-capa pasta-capa-<?= max(1, count($pasta['imagens'])) ?>">
                                    <?php foreach ($pasta['imagens'] as $imagemCapa): ?>
                                    <img src="<?= e(urlArquivo($imagemCapa)) ?>" alt="">
                                    <?php endforeach; ?>
                                </div>
                                <span class="pasta-cartao-nome"><?= e($pasta['nome']) ?></span>
                                <span class="pasta-cartao-quantidade"><?= contarPins((int) $pasta['total_pins']) ?></span>
                            </a>
                        </article>
                        <?php endforeach; ?>
                    </div>

                    <?php if ($pastaAberta !== null): ?>
                    <!-- Pasta aberta: editar, excluir e Pins da pasta -->
                    <section class="pastas-detalhe-pagina detalhe-pasta-php" id="detalhe-pasta" aria-labelledby="titulo-pasta-aberta">
                        <h2 id="titulo-pasta-aberta"><?= e($pastaAberta['nome']) ?></h2>
                        <?php if (!empty($pastaAberta['descricao'])): ?>
                        <p class="pasta-descricao"><?= e($pastaAberta['descricao']) ?></p>
                        <?php endif; ?>

                        <details class="detalhes-editar-pasta">
                            <summary>Editar ou excluir pasta</summary>
                            <form class="formulario-php" method="post" action="../acoes/pasta.php">
                                <?= campoCsrf() ?>
                                <input type="hidden" name="acao" value="editar">
                                <input type="hidden" name="pasta_id" value="<?= (int) $pastaAberta['id'] ?>">
                                <input type="hidden" name="voltar" value="perfil.php?aba=pastas&pasta=<?= (int) $pastaAberta['id'] ?>">
                                <label for="editar-pasta-nome">Nome</label>
                                <input id="editar-pasta-nome" name="nome" type="text" maxlength="100" required value="<?= e($pastaAberta['nome']) ?>">
                                <label for="editar-pasta-descricao">Descrição</label>
                                <textarea id="editar-pasta-descricao" name="descricao" maxlength="500" rows="2"><?= e($pastaAberta['descricao']) ?></textarea>
                                <button class="botao-primario" type="submit">Salvar alterações</button>
                            </form>
                            <form method="post" action="../acoes/pasta.php" data-confirmar="Excluir a pasta &quot;<?= e($pastaAberta['nome']) ?>&quot;? Os Pins continuam salvos no seu perfil.">
                                <?= campoCsrf() ?>
                                <input type="hidden" name="acao" value="excluir">
                                <input type="hidden" name="pasta_id" value="<?= (int) $pastaAberta['id'] ?>">
                                <button class="botao-texto botao-perigo" type="submit">Excluir pasta</button>
                            </form>
                        </details>

                        <?php if (!$pinsPasta): ?>
                        <p>Esta pasta ainda não tem Pins. Use "Mover para pasta" nos seus Pins salvos.</p>
                        <?php endif; ?>
                        <div class="postagens">
                            <?php $opcoesCard = ['pastaAtual' => (int) $pastaAberta['id']]; ?>
                            <?php foreach ($pinsPasta as $pin): ?>
                                <?php require __DIR__ . '/../includes/card_pin.php'; ?>
                            <?php endforeach; ?>
                            <?php unset($opcoesCard); ?>
                        </div>
                    </section>
                    <?php endif; ?>

                    <!-- Pins salvos que ainda não estão em nenhuma pasta -->
                    <section class="ideias-nao-organizadas" aria-labelledby="ideias-nao-organizadas-titulo">
                        <h2 id="ideias-nao-organizadas-titulo">Ideias não organizadas</h2>
                        <?php if (!$semPasta): ?>
                        <p class="ideias-nao-organizadas-vazio">Todos os Pins salvos estão organizados nas pastas correspondentes.</p>
                        <?php endif; ?>
                        <div class="postagens">
                            <?php $opcoesCard = ['pastas' => $pastas]; ?>
                            <?php foreach ($semPasta as $pin): ?>
                                <?php require __DIR__ . '/../includes/card_pin.php'; ?>
                            <?php endforeach; ?>
                            <?php unset($opcoesCard); ?>
                        </div>
                    </section>
                </section>
<?php endif; ?>
            </section>
        </main>
<!--Rodapé com aviso de projeto acadêmico-->
<?php require_once __DIR__ . '/../includes/rodape_principal.php'; ?>
<script src="../../js/pesquisa.js" defer></script>
<script src="../../js/menu.js" defer></script>
<script src="../../js/acoes_php.js" defer></script>
<script src="../../js/tema.js" defer></script>
</body>
</html>
