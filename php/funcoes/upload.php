<?php
declare(strict_types=1);

// Limite do sistema. O php.ini também precisa permitir esse tamanho
// (upload_max_filesize e post_max_size).
const TAMANHO_MAXIMO_IMAGEM = 10 * 1024 * 1024;

// Tipos aceitos e a extensão usada ao gravar o arquivo.
const TIPOS_IMAGEM_PERMITIDOS = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];

function diretorioUploads(): string
{
    return dirname(__DIR__, 2) . '/uploads';
}

/**
 * Indica se o formulário enviou algum arquivo no campo informado.
 */
function arquivoFoiEnviado(string $campo): bool
{
    return isset($_FILES[$campo]['error'])
        && is_int($_FILES[$campo]['error'])
        && $_FILES[$campo]['error'] !== UPLOAD_ERR_NO_FILE;
}

/**
 * Valida e grava uma imagem enviada. Retorna o caminho relativo à raiz do
 * projeto (ex.: uploads/pins/3f9a....jpg), que é o valor salvo no banco.
 *
 * - confere o tipo real do arquivo (não confia na extensão nem no navegador);
 * - confere se é uma imagem válida;
 * - gera um nome aleatório, para não sobrescrever arquivos nem usar o nome enviado.
 */
function salvarImagemEnviada(string $campo, string $subpasta): string
{
    if (!in_array($subpasta, ['pins', 'perfil'], true)) {
        throw new InvalidArgumentException('Destino de upload inválido.');
    }

    $arquivo = $_FILES[$campo] ?? null;
    if (!is_array($arquivo) || !isset($arquivo['error']) || !is_int($arquivo['error'])) {
        throw new InvalidArgumentException('Selecione uma imagem.');
    }

    switch ($arquivo['error']) {
        case UPLOAD_ERR_OK:
            break;
        case UPLOAD_ERR_NO_FILE:
            throw new InvalidArgumentException('Selecione uma imagem.');
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            throw new InvalidArgumentException('A imagem ultrapassa o tamanho máximo permitido.');
        default:
            throw new RuntimeException('Não foi possível receber a imagem. Tente novamente.');
    }

    if (!is_uploaded_file($arquivo['tmp_name'])) {
        throw new InvalidArgumentException('Arquivo de imagem inválido.');
    }
    if ($arquivo['size'] <= 0 || $arquivo['size'] > TAMANHO_MAXIMO_IMAGEM) {
        throw new InvalidArgumentException('A imagem deve ter no máximo 10 MB.');
    }

    $tipo = (new finfo(FILEINFO_MIME_TYPE))->file($arquivo['tmp_name']);
    if (!is_string($tipo) || !isset(TIPOS_IMAGEM_PERMITIDOS[$tipo])) {
        throw new InvalidArgumentException('Envie uma imagem JPG, PNG ou WEBP.');
    }

    $informacoes = @getimagesize($arquivo['tmp_name']);
    if ($informacoes === false || ($informacoes['mime'] ?? '') !== $tipo) {
        throw new InvalidArgumentException('O arquivo enviado não é uma imagem válida.');
    }

    $pasta = diretorioUploads() . '/' . $subpasta;
    if (!is_dir($pasta) && !mkdir($pasta, 0755, true) && !is_dir($pasta)) {
        throw new RuntimeException('Não foi possível preparar a pasta de imagens.');
    }

    $nome = bin2hex(random_bytes(16)) . '.' . TIPOS_IMAGEM_PERMITIDOS[$tipo];
    if (!move_uploaded_file($arquivo['tmp_name'], $pasta . '/' . $nome)) {
        throw new RuntimeException('Não foi possível salvar a imagem. Tente novamente.');
    }

    return 'uploads/' . $subpasta . '/' . $nome;
}

/**
 * Apaga uma imagem enviada. Imagens da pasta Imagens/ (exemplos) nunca são apagadas.
 */
function removerImagemEnviada(?string $caminho): void
{
    if ($caminho === null || !preg_match('#^uploads/(pins|perfil)/[a-f0-9]{32}\.(jpg|png|webp)$#', $caminho)) {
        return;
    }

    $arquivo = dirname(__DIR__, 2) . '/' . $caminho;
    if (is_file($arquivo)) {
        @unlink($arquivo);
    }
}
