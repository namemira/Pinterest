'use strict';

function configurarFiltroCategorias() {
    const listaCategorias = document.querySelector('#lista-categorias');
    const containerPins = document.querySelector('#grade-pins');
    const campoPesquisa = document.querySelector(
        '.pesquisa input[type="search"], .site-search input[type="search"]'
    );
    if (!listaCategorias || !containerPins) {
        return;
    }

    const categoriaInicial = listaCategorias.querySelector(
        '.categoria[aria-pressed="true"]'
    );
    let categoriaAtiva = categoriaInicial?.dataset.categoria || '';
    containerPins.dataset.categoriaSelecionada = categoriaAtiva;
    const campoCategoria = document.querySelector('#explore-category-filter');

    const mensagemFiltro = document.createElement('p');
    mensagemFiltro.className = 'mensagem-categoria';
    mensagemFiltro.setAttribute('role', 'status');
    mensagemFiltro.setAttribute('aria-live', 'polite');
    mensagemFiltro.hidden = true;
    listaCategorias.insertAdjacentElement('afterend', mensagemFiltro);

    function selecionarCategoria(elemento) {
        const categoria = elemento.dataset.categoria;
        categoriaAtiva =
            !categoria ||
            normalizarTexto(categoriaAtiva) === normalizarTexto(categoria)
                ? ''
                : categoria;
        containerPins.dataset.categoriaSelecionada = categoriaAtiva;
        if (campoCategoria) {
            campoCategoria.value = categoriaAtiva
                ? elemento.dataset.categoriaId
                : '';
        }

        const url = new URL(window.location.href);
        if (categoriaAtiva) {
            url.searchParams.set('categoria_id', elemento.dataset.categoriaId);
        } else {
            url.searchParams.delete('categoria_id');
        }
        if (campoPesquisa?.value.trim()) {
            url.searchParams.set('q', campoPesquisa.value.trim());
        } else {
            url.searchParams.delete('q');
        }
        url.searchParams.delete('busca');
        window.history.replaceState(null, '', url);
        containerPins.querySelectorAll('input[name="voltar"]').forEach((campo) => {
            const ancora = campo.value.includes('#')
                ? `#${campo.value.split('#')[1]}`
                : '';
            campo.value = `${url.pathname.split('/').pop()}${url.search}${ancora}`;
        });

        listaCategorias.querySelectorAll('.categoria').forEach((item) => {
            const selecionada = item.dataset.categoria === categoriaAtiva;
            item.setAttribute('aria-pressed', String(selecionada));
            item.setAttribute(
                'aria-label',
                selecionada
                    ? `Categoria ${item.dataset.categoriaLabel} selecionada. Ative novamente para mostrar todas as categorias.`
                    : item.dataset.categoria
                        ? `Filtrar Pins pela categoria ${item.dataset.categoriaLabel}`
                        : 'Mostrar Pins de todas as categorias'
            );
        });

        if (categoriaAtiva) {
            mensagemFiltro.textContent =
                `Exibindo Pins da categoria ${elemento.dataset.categoriaLabel}. Selecione novamente para mostrar todos.`;
        } else if (campoPesquisa?.value.trim()) {
            mensagemFiltro.textContent =
                'Filtro de categoria removido. A pesquisa atual continua aplicada.';
        } else {
            mensagemFiltro.textContent = 'Exibindo Pins de todas as categorias.';
        }
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

document.addEventListener('DOMContentLoaded', configurarFiltroCategorias);
