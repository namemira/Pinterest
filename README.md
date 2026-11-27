# Pinterest — Desenvolvimento Web I

Projeto acadêmico desenvolvido para o Trabalho III da disciplina Desenvolvimento Web I, ministrada pelo professor Alisson Borges Zanetti no Instituto Federal Catarinense (IFC), Campus Concórdia.
O projeto consiste no desenvolvimento de uma aplicação web inspirada no Pinterest, permitindo o cadastro de usuários, publicação de Pins, organização de conteúdos e gerenciamento de informações.
Este projeto possui finalidade exclusivamente educacional e não possui vínculo com a Pinterest, Inc.

Integrantes
- Jéssica Rubas
- Nicole Bonassi Bet
- Samira Vieira

Tecnologias utilizadas
- HTML5
- CSS3
- JavaScript
- PHP
- MariaDB
- PDO
- XAMPP

Funcionalidades
- Cadastro e login de usuários;
- Página inicial e exploração de conteúdos;
- Criação, visualização, edição e exclusão de Pins;
- Envio e pré-visualização de imagens;
- Organização de Pins em pastas;
- Salvamento de Pins;
- Perfil e configurações de usuário;
- Sistema de mensagens;
- Painel administrativo;
- Gerenciamento de denúncias de Pins.

Estrutura do projeto

```text
Pinterest/
├── css/                  # Arquivos de estilização
├── html/                 # Páginas HTML
├── Imagens/              # Imagens utilizadas no projeto
├── js/                   # Arquivos JavaScript
├── php/
│   ├── acoes/             # Ações do sistema
│   ├── admin/             # Administração
│   ├── config/            # Configurações e conexão
│   ├── dados/             # Páginas e processamento
│   ├── funcoes/           # Funções do sistema
│   └── includes/          # Arquivos compartilhados
├── sql/
│   └── banco.sql          # Estrutura do banco de dados
├── uploads/
│   ├── pins/              # Imagens dos Pins
│   └── perfil/            # Fotos de perfil
├── index.php
└── README.md
```

Como executar localmente

1. Requisitos
- XAMPP instalado;
- PHP;
- MariaDB ou MySQL;
- Navegador web.

2. Baixar o projeto
Clone o repositório dentro da pasta `htdocs` do XAMPP:

```bash
git clone https://github.com/namemira/Pinterest.git
```

O projeto ficará localizado em:

```text
C:\xampp\htdocs\Pinterest
```

3. Iniciar o XAMPP
Abra o XAMPP Control Panel e inicie os serviços:
- Apache;
- MySQL.

4. Configurar o banco de dados
Acesse o phpMyAdmin:
http://localhost/phpmyadmin
Selecione a opção Importar e escolha o arquivo:

```text
sql/banco.sql
```

Execute a importação para criar o banco `pinterest` e suas tabelas.
Essa etapa deve ser realizada na instalação inicial, em um banco vazio. Evite importar novamente sobre um banco que já contenha dados.

5. Configurar a conexão local
Na pasta `php/config/`, crie o arquivo `conexao_local.php` com as configurações do banco local:
```php
<?php

return [
    'host' => '127.0.0.1',
    'port' => '3306',
    'dbname' => 'pinterest',
    'charset' => 'utf8mb4',
    'user' => 'root',
    'pass' => ''
];
```
Os valores devem corresponder à configuração do MySQL ou MariaDB instalado no computador.

6. Acessar o sistema

Após iniciar o Apache e o MySQL e configurar o banco de dados, acesse:
http://localhost/Pinterest/
O sistema será direcionado para a página inicial.

Criar administrador

Para criar uma conta administradora, abra o PowerShell e execute:

```powershell
cd C:\xampp\htdocs\Pinterest

C:\xampp\php\php.exe php\admin\criar_admin.php
```

Informe os dados solicitados pelo terminal.

O acesso ao painel administrativo é permitido somente para usuários autenticados com perfil de administrador.

Acesso à hospedagem
O projeto também está disponível na hospedagem:

Site: https://pinterestifcconcordia.kesug.com/

Página inicial: https://pinterestifcconcordia.kesug.com/php/dados/Inicial.php

Banco de dados

O projeto utiliza MariaDB para armazenar informações de usuários, Pins, categorias, pastas, mensagens e denúncias.
A comunicação entre o PHP e o banco de dados é realizada por meio do PDO.
A estrutura do banco está disponível em `sql/banco.sql`.

**Observação: Projeto desenvolvido para fins acadêmicos na disciplina Desenvolvimento Web I — IFC Campus Concórdia.**
