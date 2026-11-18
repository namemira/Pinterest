
'use strict';

// Conteúdo estático usado para montar as categorias da página Explorar.
const categorias = [
    {
        nome: 'Moda',
        imagem: '../Imagens/moda.jpg'
    },
    {
        nome: 'Decoração',
        imagem: '../Imagens/decoracao.jpg'
    },
    {
        nome: 'Receitas',
        imagem: '../Imagens/receitas.jpg'
    },
    {
        nome: 'Viagens',
        imagem: '../Imagens/viagens.jpg'
    },
    {
        nome: 'Arte',
        imagem: '../Imagens/arte.jpg'
    }
];
// Sugestões em destaque exibidas abaixo das categorias.
const tendencias = [
    {
        titulo: 'Decoração minimalista',
        imagem: '../Imagens/decoracao.jpg'
    },
    {
        titulo: 'Looks casuais',
        imagem: '../Imagens/moda.jpg'
    },
    {
        titulo: 'Receitas fáceis',
        imagem: '../Imagens/receitas.jpg'
    }
];
// Cria os cartões de categoria dentro da lista prevista no HTML.
function carregarCategorias() {

    const container = document.querySelector('#lista-categorias');
    if (!container) {
        return;
    }

    categorias.forEach((categoria) => {

        const elemento = document.createElement('button');

        elemento.classList.add('categoria');
        elemento.type = 'button';
        elemento.setAttribute('aria-pressed', 'false');
        elemento.setAttribute(
            'aria-label',
            `Filtrar Pins pela categoria ${categoria.nome}`
        );
        elemento.dataset.categoria = categoria.nome;

        const imagem = document.createElement('img');
        imagem.src = categoria.imagem;
        imagem.alt = categoria.nome;
        const titulo = document.createElement('span');
        titulo.className = 'categoria-titulo';
        titulo.textContent = categoria.nome;
        elemento.append(imagem, titulo);

        container.appendChild(elemento);
    });
}

// Filtra Pins pela categoria sem substituir o termo atual da pesquisa.
function configurarFiltroCategorias() {
    const listaCategorias = document.querySelector('#lista-categorias');
    const containerPins = document.querySelector('#grade-pins');
    const campoPesquisa = document.querySelector(
        '.pesquisa input[type="search"]'
    );
    if (!listaCategorias || !containerPins) {
        return;
    }

    let categoriaAtiva = '';
    containerPins.dataset.categoriaSelecionada = '';

    const mensagemFiltro = document.createElement('p');
    mensagemFiltro.className = 'mensagem-categoria';
    mensagemFiltro.setAttribute('role', 'status');
    mensagemFiltro.setAttribute('aria-live', 'polite');
    mensagemFiltro.hidden = true;
    listaCategorias.insertAdjacentElement('afterend', mensagemFiltro);

    function selecionarCategoria(elemento) {
        const categoria = elemento.dataset.categoria;
        categoriaAtiva =
            normalizarTexto(categoriaAtiva) === normalizarTexto(categoria)
                ? ''
                : categoria;
        containerPins.dataset.categoriaSelecionada = categoriaAtiva;

        listaCategorias.querySelectorAll('.categoria').forEach((item) => {
            const selecionada = item.dataset.categoria === categoriaAtiva;
            item.setAttribute('aria-pressed', String(selecionada));
            item.setAttribute(
                'aria-label',
                selecionada
                    ? `Categoria ${item.dataset.categoria} selecionada. Ative novamente para mostrar todas as categorias.`
                    : `Filtrar Pins pela categoria ${item.dataset.categoria}`
            );
        });

        mensagemFiltro.textContent = categoriaAtiva
            ? `Exibindo Pins da categoria ${categoriaAtiva}. Selecione novamente para mostrar todos.`
            : campoPesquisa?.value.trim()
                ? 'Filtro de categoria removido. A pesquisa atual continua aplicada.'
                : 'Exibindo Pins de todas as categorias.';
        mensagemFiltro.hidden = false;
        document.dispatchEvent(new CustomEvent('pins:category-changed'));
    }

    listaCategorias.addEventListener('click', (evento) => {
        if (!(evento.target instanceof Element)) {
            return;
        }

        const elemento = evento.target.closest('.categoria[data-categoria]');
        if (elemento && listaCategorias.contains(elemento)) {
            selecionarCategoria(elemento);
        }
    });

}
// Cria os cartões de tendências dentro da lista prevista no HTML.
function carregarTendencias() {

    const container = document.querySelector('#lista-tendencias');
    if (!container) {
        return;
    }

    tendencias.forEach((tendencia) => {

        const elemento = document.createElement('div');

        elemento.classList.add('tendencia');

        elemento.innerHTML = `
            <img src="${tendencia.imagem}" alt="${tendencia.titulo}">
            <h3>${tendencia.titulo}</h3>
        `;

        container.appendChild(elemento);
    });
}

// Reaproveita o catálogo e a renderização de Pins compartilhados pelo feed.
function carregarPinsExplorar() {

    const container = document.querySelector('#grade-pins');
    const sistemaPins = window.pinterestPins;
    if (!container || !sistemaPins) {
        return;
    }

    sistemaPins.listarPins().forEach((pin) => {
        container.appendChild(sistemaPins.criarCardPin(pin));
    });

    document.dispatchEvent(new CustomEvent('pins:updated'));
}
// Preenche a página depois que sua estrutura HTML está pronta.
document.addEventListener('DOMContentLoaded', () => {

    carregarCategorias();

    configurarFiltroCategorias();

    carregarTendencias();

    carregarPinsExplorar();

});
