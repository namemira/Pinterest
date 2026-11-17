
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

        evento.preventDefault();

        const nome = document.querySelector('#nome');
        const usuario = document.querySelector('#usuario');
        const site = document.querySelector('#site');
        let erro = '';
        let campoComErro = null;

        // Valida os campos usando os atributos required, pattern e type="url"
        if (!nome.value.trim()) {
            erro = 'Informe seu nome.';
            campoComErro = nome;
        } else if (usuario.validity.valueMissing) {
            erro = 'Informe um nome de usuário.';
            campoComErro = usuario;
        } else if (usuario.validity.patternMismatch) {
            erro = 'O nome de usuário deve ter de 3 a 30 caracteres: letras minúsculas, números, ponto ou _.';
            campoComErro = usuario;
        } else if (site.value && site.validity.typeMismatch) {
            erro = 'Informe um site válido, começando com https://.';
            campoComErro = site;
        }

        [nome, usuario, site].forEach((campo) => {
            campo.setAttribute('aria-invalid', String(campo === campoComErro));
        });

        if (erro) {
            mostrarMensagemConfig(erro, true);
            campoComErro.focus();
            return;
        }

        mostrarMensagemConfig('Dados validados. O salvamento real será feito com PHP na Parte 3.', false);

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
    const inputFoto = document.querySelector('#foto-perfil-input');

    const imagemPerfil = document.querySelector('#imagem-perfil');
    const imagemCabecalho = document.querySelector('.perfil img');

    if (!botaoAlterar || !inputFoto || !imagemPerfil) {
        return;
    }

    // Abrir seletor de arquivos
    botaoAlterar.addEventListener('click', () => {

        inputFoto.click();

    });

    // Selecionar imagem
    inputFoto.addEventListener('change', () => {

        const arquivo = inputFoto.files[0];

        if (!arquivo) {
            return;
        }

        // Verificar formato da imagem
        if (!arquivo.type.startsWith('image/')) {

            mostrarMensagemConfig('Selecione um arquivo de imagem válido.', true);

            inputFoto.value = '';

            return;
        }

        // Ler arquivo selecionado
        const leitor = new FileReader();

        leitor.onload = () => {

            const imagem = leitor.result;

            // Atualizar imagem do perfil
            imagemPerfil.src = imagem;

            // Atualizar imagem do cabeçalho
            if (imagemCabecalho) {
                imagemCabecalho.src = imagem;
            }

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
