
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

function configurarFormularioPerfil() {

    const formulario = document.querySelector('.formulario-perfil');

    if (!formulario) {
        return;
    }

    formulario.addEventListener('submit', (evento) => {

        evento.preventDefault();

        const nome = document.querySelector('#nome').value;
        const usuario = document.querySelector('#usuario').value;
        const descricao = document.querySelector('#descricao').value;
        const site = document.querySelector('#site').value;

        console.log({
            nome,
            usuario,
            descricao,
            site
        });

        alert('Informações do perfil recebidas!');

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

            alert('Selecione um arquivo de imagem válido.');

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
