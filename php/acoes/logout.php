<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/inicializacao.php';

// Logout só por POST com CSRF, para que um link externo não desconecte o usuário.
exigirPostComCsrf('../dados/principal.php');

encerrarSessao();

// Nova sessão vazia apenas para mostrar o aviso na tela de login.
iniciarSessaoSeguro();
definirAviso('sucesso', 'Você saiu da sua conta.');
redirecionar('../dados/login.php');
