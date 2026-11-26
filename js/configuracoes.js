
'use strict';

/* =================================
   NAVEGAÇÃO DAS CONFIGURAÇÕES
================================= */

function configurarNavegacaoConfiguracoes() {

    const botoes = document.querySelectorAll('.opcao-config');
    const secoes = document.querySelectorAll('.configuracao-secao');

    botoes.forEach((botao) => {

        botao.addEventListener('click', () => {

            const secaoSelecionada = botao.dataset.secao;

            botoes.forEach((item) => {
                item.classList.remove('ativa');
            });

            secoes.forEach((secao) => {
                secao.classList.remove('ativa');
            });

            botao.classList.add('ativa');

            const secao = document.getElementById(secaoSelecionada);

            if (secao) {
                secao.classList.add('ativa');
            }

        });

    });

}


/* =================================
   FORMULÁRIO DE PERFIL
================================= */

// Exibe uma mensagem de sucesso ou erro na própria página (sem alert)
function mostrarMensagemConfig(texto, erro) {

    const mensagem = document.querySelector('#mensagem-config');

    if (!mensagem) {
        return;
    }

    mensagem.textContent = texto;
    mensagem.classList.toggle('mensagem-config-erro', Boolean(erro));
}

function configurarFormularioPerfil() {

    const formulario = document.querySelector('#formulario-perfil');

    if (!formulario) {
        return;
    }

    formulario.addEventListener('submit', (evento) => {

        const nome = document.querySelector('#nome');
        const usuario = document.querySelector('#usuario');
        const site = document.querySelector('#site');
        let erro = '';
        let campoComErro = null;

        // Valida os campos usando os atributos required, pattern e type="url"
        if (!nome.value.trim()) {
            erro = 'Informe seu nome.';
            campoComErro = nome;
        } else if (usuario.value && usuario.validity.patternMismatch) {
            erro = 'O nome de usuário deve ter de 3 a 30 caracteres: letras minúsculas, números, ponto ou _.';
            campoComErro = usuario;
        } else if (site.value && site.validity.typeMismatch) {
            erro = 'Informe um site válido, começando com https://.';
            campoComErro = site;
        }

        [nome, usuario, site].forEach((campo) => {
            campo.setAttribute('aria-invalid', String(campo === campoComErro));
        });

        // Só bloqueia o envio quando há erro; sem erros, o formulário
        // segue para o PHP, que valida novamente e salva no banco.
        if (erro) {
            evento.preventDefault();
            mostrarMensagemConfig(erro, true);
            campoComErro.focus();
            return;
        }

        mostrarMensagemConfig('Salvando...', false);

    });

}


/* =================================
   CONFIGURAÇÕES DE EXIBIÇÃO
================================= */

function configurarExibicao() {

    const opcoesTema = document.querySelectorAll('input[name="tema"]');

    opcoesTema.forEach((opcao) => {

        opcao.addEventListener('change', () => {

            if (opcao.value === 'escuro') {
                document.body.classList.add('tema-escuro');
            } else {
                document.body.classList.remove('tema-escuro');
            }

        });

    });
}


/* =================================
   ALTERAR FOTO DE PERFIL
================================= */

function configurarAlteracaoFoto() {

    const botaoAlterar = document.querySelector('#alterar-foto');
    const botaoRemover = document.querySelector('#remover-foto');
    const inputFoto = document.querySelector('#foto-perfil-input');
    const imagemPerfil = document.querySelector('#imagem-perfil');
    const imagemNeutra = document.querySelector('#imagem-perfil-neutra');
    const removerFoto = document.querySelector('#remover-foto-valor');
    const botaoPerfil = document.querySelector('#abrir-perfil');

    if (!botaoAlterar || !inputFoto || !imagemPerfil) {
        return;
    }

    // Abrir seletor de arquivos
    botaoAlterar.addEventListener('click', () => {
        inputFoto.click();
    });

    function atualizarAvatarCabecalho(src) {
        if (!botaoPerfil) {
            return;
        }

        function substituirAvatar(atual, classe) {
            if (!atual) {
                return;
            }

            const avatar = src
                ? document.createElement('img')
                : document.createElement('span');
            avatar.className = src
                ? classe
                : `avatar-placeholder ${classe}`;
            if (src && avatar instanceof HTMLImageElement) {
                avatar.alt = '';
                avatar.src = src;
            } else {
                avatar.setAttribute('aria-hidden', 'true');
                avatar.textContent = botaoPerfil.dataset.inicial || '?';
            }
            atual.replaceWith(avatar);
        }

        substituirAvatar(botaoPerfil.querySelector('.avatar-header'), 'avatar-header');
        substituirAvatar(
            document.querySelector('#menu-perfil .menu-perfil-foto'),
            'menu-perfil-foto'
        );
    }

    botaoRemover?.addEventListener('click', () => {
        if (removerFoto) {
            removerFoto.value = '1';
        }
        imagemPerfil.removeAttribute('src');
        imagemPerfil.hidden = true;
        if (imagemNeutra) {
            imagemNeutra.hidden = false;
        }
        botaoRemover.hidden = true;
        atualizarAvatarCabecalho('');
    });

    // Selecionar imagem
    inputFoto.addEventListener('change', () => {

        const arquivo = inputFoto.files[0];

        if (!arquivo) {
            return;
        }

        // Verificar formato e tamanho (o PHP confere novamente no servidor)
        const tiposAceitos = ['image/jpeg', 'image/png', 'image/webp'];
        if (!tiposAceitos.includes(arquivo.type) || arquivo.size > 10 * 1024 * 1024) {

            mostrarMensagemConfig('Selecione uma imagem JPG, PNG ou WEBP de até 10 MB.', true);

            inputFoto.value = '';

            return;
        }

        // Ler arquivo selecionado
        const leitor = new FileReader();

        leitor.onload = () => {
            const imagem = leitor.result;
            if (typeof imagem !== 'string') {
                mostrarMensagemConfig('Não foi possível visualizar esta imagem.', true);
                return;
            }

            // Atualizar imagem do perfil
            imagemPerfil.src = imagem;
            imagemPerfil.hidden = false;
            if (imagemNeutra) {
                imagemNeutra.hidden = true;
            }
            if (removerFoto) {
                removerFoto.value = '0';
            }
            if (botaoRemover) {
                botaoRemover.hidden = false;
            }
            atualizarAvatarCabecalho(imagem);
        };

        leitor.onerror = () => {
            mostrarMensagemConfig('Não foi possível ler a imagem selecionada.', true);
        };

        leitor.readAsDataURL(arquivo);

    });

}
/* =================================
   INICIALIZAÇÃO
================================= */

document.addEventListener('DOMContentLoaded', () => {

    configurarNavegacaoConfiguracoes();

    configurarFormularioPerfil();

    configurarExibicao();

    configurarAlteracaoFoto();
});
