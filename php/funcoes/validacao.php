<?php
declare(strict_types=1);

function textoValidado(string $valor, int $tamanhoMaximo): string
{
    $valor = trim($valor);
    if ($valor === '' || mb_strlen($valor, 'UTF-8') > $tamanhoMaximo) {
        throw new InvalidArgumentException('Texto inválido.');
    }
    return $valor;
}

function textoOpcional(string $valor, int $tamanhoMaximo): ?string
{
    $valor = trim($valor);
    if ($valor === '') {
        return null;
    }
    if (mb_strlen($valor, 'UTF-8') > $tamanhoMaximo) {
        throw new InvalidArgumentException('Texto inválido.');
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

function urlOpcionalValidada(string $url): ?string
{
    $url = trim($url);
    if ($url === '') {
        return null;
    }
    if (!filter_var($url, FILTER_VALIDATE_URL) || mb_strlen($url, 'UTF-8') > 2048) {
        throw new InvalidArgumentException('Link inválido.');
    }
    return $url;
}
