
'use strict';
// 1. DADOS DAS CATEGORIAS
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
// 2. DADOS DAS TENDÊNCIAS
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
// 3. CARREGAR CATEGORIAS
function carregarCategorias() {

    const container = document.querySelector('#lista-categorias');

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
// 4. CARREGAR TENDÊNCIAS
function carregarTendencias() {

    const container = document.querySelector('#lista-tendencias');

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

// 5. CARREGAR PINS
function carregarPinsExplorar() {

    const container = document.querySelector('#grade-pins');

    // Posteriormente vamos integrar os Pins
    // cadastrados no restante do projeto.

}
// 6. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {

    carregarCategorias();

    carregarTendencias();

    carregarPinsExplorar();

});
