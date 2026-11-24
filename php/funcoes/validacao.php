<?php
declare(strict_types=1);

/**
 * Texto obrigatório. O nome do campo é usado na mensagem de erro.
 */
function textoValidado(string $valor, int $tamanhoMaximo, string $campo = 'texto'): string
{
    $valor = trim($valor);
    if ($valor === '') {
        throw new InvalidArgumentException('Preencha o campo ' . $campo . '.');
    }
    if (mb_strlen($valor, 'UTF-8') > $tamanhoMaximo) {
        throw new InvalidArgumentException('O campo ' . $campo . ' deve ter no máximo ' . $tamanhoMaximo . ' caracteres.');
    }
    return $valor;
}

function textoOpcional(string $valor, int $tamanhoMaximo, string $campo = 'texto'): ?string
{
    $valor = trim($valor);
    if ($valor === '') {
        return null;
    }
    if (mb_strlen($valor, 'UTF-8') > $tamanhoMaximo) {
        throw new InvalidArgumentException('O campo ' . $campo . ' deve ter no máximo ' . $tamanhoMaximo . ' caracteres.');
    }
    return $valor;
}

function emailValidado(string $email): string
{
    $email = trim($email);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email, 'UTF-8') > 180) {
        throw new InvalidArgumentException('E-mail inválido.');
    }
    return mb_strtolower($email, 'UTF-8');
}

function dataNascimentoValidada(string $nascimento): string
{
    $nascimento = trim($nascimento);
    $data = DateTimeImmutable::createFromFormat('!Y-m-d', $nascimento);
    $erros = DateTimeImmutable::getLastErrors();

    if (
        !$data
        || ($erros !== false && ($erros['warning_count'] > 0 || $erros['error_count'] > 0))
        || $data->format('Y-m-d') !== $nascimento
        || $data < new DateTimeImmutable('1900-01-01')
        || $data > new DateTimeImmutable('today')
    ) {
        throw new InvalidArgumentException('Informe uma data de nascimento válida.');
    }

    if ($data->diff(new DateTimeImmutable('today'))->y < 13) {
        throw new InvalidArgumentException('Você precisa ter pelo menos 13 anos.');
    }

    return $nascimento;
}

/**
 * Link opcional. Só aceita http:// e https:// para impedir links
 * como "javascript:", que executariam código ao serem clicados.
 */
function urlOpcionalValidada(string $url): ?string
{
    $url = trim($url);
    if ($url === '') {
        return null;
    }

    $protocolo = strtolower((string) parse_url($url, PHP_URL_SCHEME));
    if (
        !filter_var($url, FILTER_VALIDATE_URL)
        || !in_array($protocolo, ['http', 'https'], true)
        || mb_strlen($url, 'UTF-8') > 2048
    ) {
        throw new InvalidArgumentException('Informe um link válido, começando com http:// ou https://.');
    }
    return $url;
}

/**
 * Identificadores (ids) recebidos por formulários ou pela URL.
 */
function inteiroPositivo($valor, string $campo = 'identificador'): int
{
    if (is_int($valor)) {
        $valor = (string) $valor;
    }
    if (!is_string($valor) || !preg_match('/^[1-9][0-9]{0,9}$/', trim($valor)) || (int) $valor > 4294967295) {
        throw new InvalidArgumentException('Valor inválido para o campo ' . $campo . '.');
    }
    return (int) $valor;
}

/**
 * Nome de usuário com o mesmo padrão do formulário de Configurações.
 */
function nomeUsuarioOpcional(string $valor): ?string
{
    $valor = trim($valor);
    if ($valor === '') {
        return null;
    }
    if (!preg_match('/^[a-z0-9_.]{3,30}$/', $valor)) {
        throw new InvalidArgumentException('O nome de usuário deve ter de 3 a 30 caracteres: letras minúsculas, números, ponto ou _.');
    }
    return $valor;
}
