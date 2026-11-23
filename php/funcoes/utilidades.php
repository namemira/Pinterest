<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/autenticacao.php';

/**
 * Escapa texto antes de exibi-lo no HTML (proteção contra XSS).
 */
function e(?string $texto): string
{
    return htmlspecialchars($texto ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * Converte um caminho salvo no banco (relativo à raiz do projeto)
 * em um endereço usado pelas páginas de php/dados/ e php/admin/.
 */
function urlArquivo(?string $caminho, string $padrao = 'Imagens/dog.jpg'): string
{
    $caminho = trim((string) $caminho);
    if ($caminho === '' || !preg_match('#^(Imagens|uploads)/[A-Za-z0-9_./-]+$#', $caminho) || str_contains($caminho, '..')) {
        $caminho = $padrao;
    }

    return '../../' . $caminho;
}

function redirecionar(string $url): void
{
    header('Location: ' . $url, true, 303);
    exit;
}

/**
 * Mensagens exibidas uma única vez depois de um redirecionamento.
 */
function definirAviso(string $tipo, string $texto): void
{
    iniciarSessaoSeguro();
    $_SESSION['aviso'] = ['tipo' => $tipo, 'texto' => $texto];
}

function obterAviso(): ?array
{
    iniciarSessaoSeguro();
    $aviso = $_SESSION['aviso'] ?? null;
    unset($_SESSION['aviso']);

    return is_array($aviso) ? $aviso : null;
}

function exibirAviso(?array $aviso): string
{
    if ($aviso === null) {
        return '';
    }

    $tipo = $aviso['tipo'] === 'sucesso' ? 'sucesso' : 'erro';
    $papel = $tipo === 'sucesso' ? 'status' : 'alert';

    return '<p class="aviso-php aviso-php-' . $tipo . '" role="' . $papel . '">' . e((string) $aviso['texto']) . '</p>';
}

function campoCsrf(): string
{
    return '<input type="hidden" name="csrf_token" value="' . e(gerarTokenCsrf()) . '">';
}

/**
 * Lê um valor de texto de $_POST ou $_GET sem aceitar arrays.
 */
function valorPost(string $campo): string
{
    return is_string($_POST[$campo] ?? null) ? $_POST[$campo] : '';
}

function valorGet(string $campo): string
{
    return is_string($_GET[$campo] ?? null) ? trim($_GET[$campo]) : '';
}

/**
 * Usado pelos arquivos de php/acoes/: aceita apenas POST com token CSRF válido.
 */
function exigirPostComCsrf(string $destinoErro): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        header('Allow: POST');
        exit('Método não permitido.');
    }

    if (!validarTokenCsrf($_POST['csrf_token'] ?? null)) {
        definirAviso('erro', 'Sua sessão expirou. Atualize a página e tente novamente.');
        redirecionar($destinoErro);
    }
}

/**
 * Página para onde a ação volta. Só aceita páginas da pasta php/dados/,
 * evitando redirecionamentos para outros sites.
 */
function destinoRetorno(string $padrao = 'principal.php'): string
{
    $voltar = valorPost('voltar');
    if (preg_match('/^[a-z_]+\.php(\?[A-Za-z0-9_=&%.\-]*)?(#[A-Za-z0-9_\-]+)?$/', $voltar)) {
        return '../dados/' . $voltar;
    }

    return '../dados/' . $padrao;
}

/**
 * Endereço da página atual, usado no campo "voltar" dos formulários.
 */
function paginaAtual(): string
{
    $pagina = basename((string) ($_SERVER['SCRIPT_NAME'] ?? 'principal.php'));
    $consulta = (string) ($_SERVER['QUERY_STRING'] ?? '');

    return $consulta !== '' ? $pagina . '?' . $consulta : $pagina;
}

function formatarData(?string $data): string
{
    if (!$data) {
        return '';
    }

    $objeto = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $data);
    return $objeto ? $objeto->format('d/m/Y H:i') : $data;
}

/**
 * "1 Pin", "3 Pins".
 */
function contarPins(int $total): string
{
    return $total . ($total === 1 ? ' Pin' : ' Pins');
}
