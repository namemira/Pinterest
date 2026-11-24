CREATE DATABASE IF NOT EXISTS pinterest
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE pinterest;

CREATE TABLE usuarios (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(60) NOT NULL,
    email VARCHAR(180) NOT NULL,
    data_nascimento DATE NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('usuario', 'admin') NOT NULL DEFAULT 'usuario',
    nome_usuario VARCHAR(30) NULL,
    sobre VARCHAR(500) NULL,
    site VARCHAR(2048) NULL,
    foto VARCHAR(255) NULL,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_usuarios_email (email),
    UNIQUE KEY uq_usuarios_nome_usuario (nome_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categorias (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    imagem_referencia VARCHAR(255) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_categorias_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categorias (nome) VALUES
    ('Moda'),
    ('Decoração'),
    ('Receitas'),
    ('Viagens'),
    ('Arte'),
    ('Animais')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

CREATE TABLE pins (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id INT UNSIGNED NOT NULL,
    categoria_id INT UNSIGNED NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descricao VARCHAR(500) NULL,
    link_destino VARCHAR(2048) NULL,
    caminho_imagem VARCHAR(255) NOT NULL,
    texto_alternativo VARCHAR(255) NULL,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_pins_usuario (usuario_id),
    KEY idx_pins_categoria (categoria_id),
    CONSTRAINT fk_pins_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_pins_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pins_salvos (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id INT UNSIGNED NOT NULL,
    pin_id INT UNSIGNED NOT NULL,
    data_salvamento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_pins_salvos_usuario_pin (usuario_id, pin_id),
    KEY idx_pins_salvos_pin (pin_id),
    CONSTRAINT fk_pins_salvos_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_pins_salvos_pin
        FOREIGN KEY (pin_id) REFERENCES pins (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pastas (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id INT UNSIGNED NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(500) NULL,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_pastas_usuario (usuario_id),
    CONSTRAINT fk_pastas_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pin_pasta (
    pasta_id INT UNSIGNED NOT NULL,
    pin_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (pasta_id, pin_id),
    KEY idx_pin_pasta_pin (pin_id),
    CONSTRAINT fk_pin_pasta_pasta
        FOREIGN KEY (pasta_id) REFERENCES pastas (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_pin_pasta_pin
        FOREIGN KEY (pin_id) REFERENCES pins (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE mensagens (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(60) NOT NULL,
    email VARCHAR(180) NOT NULL,
    mensagem TEXT NOT NULL,
    data_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
