<?php
declare(strict_types=1);

/**
 * Carregado no topo de todas as páginas e ações em PHP:
 * inicia a sessão segura e disponibiliza a conexão e as funções.
 */
require_once __DIR__ . '/autenticacao.php';
require_once __DIR__ . '/../config/conexao.php';
require_once __DIR__ . '/../funcoes/funcoes.php';

iniciarSessaoSeguro();
