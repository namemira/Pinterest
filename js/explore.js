
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

        const elemento = document.createElement('div');

        elemento.classList.add('categoria');

        elemento.innerHTML = `
            <img src="${categoria.imagem}" alt="${categoria.nome}">
            <h3>${categoria.nome}</h3>
        `;

        container.appendChild(elemento);
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
            <img src="${tendencia.imagem}" alt="">
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

    carregarTendencias();

    carregarPinsExplorar();

});
