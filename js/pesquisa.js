
'use strict';

const sugestoesBasePesquisa = [
    'Look feminino',
    'Inspiração de decoração',
    'Receita',
    'Inspiração de estilo',
    'Ideia de decoração',
    'Cachorro em fundo azul',
    'Cachorro em destaque',
    'Imagem de um cachorro para inspiração visual.',
    'Logotipo do Pinterest',
    'Identidade Pinterest',
    'Logotipo usado como referência visual.',
    'Ícone do Pinterest',
    'Ícone Pinterest',
    'Ícone gráfico disponível no projeto.',
    'Categoria: Animais',
    'Categoria: Design'
];

function normalizarTexto(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
        .trim();
}

function obterTextoPesquisavel(pin) {
    const textos = [pin.textContent];

    pin.querySelectorAll('img[alt]').forEach((imagem) => {
        textos.push(imagem.getAttribute('alt') || '');
    });

    return normalizarTexto(textos.join(' '));
}

function configurarSugestoesPesquisa(campoPesquisa, containerPesquisa, containerPins) {
    const listaSugestoes = document.createElement('ul');
    listaSugestoes.id = 'sugestoes-pesquisa';
    listaSugestoes.className = 'sugestoes-pesquisa';
    listaSugestoes.setAttribute('role', 'listbox');
    listaSugestoes.setAttribute('aria-label', 'Sugestões de pesquisa');
    listaSugestoes.hidden = true;
    containerPesquisa.appendChild(listaSugestoes);

    campoPesquisa.setAttribute('role', 'combobox');
    campoPesquisa.setAttribute('aria-autocomplete', 'list');
    campoPesquisa.setAttribute('aria-haspopup', 'listbox');
    campoPesquisa.setAttribute('aria-expanded', 'false');
    campoPesquisa.setAttribute('aria-controls', listaSugestoes.id);

    let sugestoesAtuais = [];
    let indiceAtivo = -1;
    let ignorarProximoFoco = false;

    function obterSugestoes(termo) {
        const sugestoesUnicas = new Map();

        sugestoesBasePesquisa.forEach((sugestao) => {
            const textoNormalizado = normalizarTexto(sugestao);
            if (
                (!termo || textoNormalizado.includes(termo)) &&
                !sugestoesUnicas.has(textoNormalizado)
            ) {
                sugestoesUnicas.set(textoNormalizado, sugestao);
            }
        });

        return Array.from(sugestoesUnicas.values()).slice(0, 8);
    }

    function atualizarOpcaoAtiva() {
        const opcoes = listaSugestoes.querySelectorAll('[role="option"]');

        opcoes.forEach((opcao, indice) => {
            const ativa = indice === indiceAtivo;
            opcao.setAttribute('aria-selected', String(ativa));
            opcao.classList.toggle('sugestao-ativa', ativa);
        });

        if (indiceAtivo >= 0 && opcoes[indiceAtivo]) {
            campoPesquisa.setAttribute(
                'aria-activedescendant',
                opcoes[indiceAtivo].id
            );
        } else {
            campoPesquisa.removeAttribute('aria-activedescendant');
        }
    }

    function selecionarSugestao(sugestao) {
        campoPesquisa.value = sugestao;
        campoPesquisa.dispatchEvent(new Event('input', { bubbles: true }));
        fecharSugestoes();
        ignorarProximoFoco = true;
        campoPesquisa.focus();
        ignorarProximoFoco = false;
    }

    function renderizarSugestoes() {
        const termo = normalizarTexto(campoPesquisa.value);
        sugestoesAtuais = obterSugestoes(termo);
        indiceAtivo = -1;
        listaSugestoes.replaceChildren();

        if (sugestoesAtuais.length === 0) {
            const mensagem = document.createElement('li');
            mensagem.className = 'sugestoes-vazias';
            mensagem.setAttribute('role', 'presentation');
            mensagem.textContent = termo
                ? 'Nenhuma sugestão encontrada.'
                : 'Nenhuma sugestão disponível.';
            listaSugestoes.appendChild(mensagem);
        } else {
            sugestoesAtuais.forEach((sugestao, indice) => {
                const opcao = document.createElement('li');
                opcao.id = `sugestao-pesquisa-${indice}`;
                opcao.className = 'sugestao-pesquisa-item';
                opcao.setAttribute('role', 'option');
                opcao.setAttribute('aria-selected', 'false');
                opcao.textContent = sugestao;
                listaSugestoes.appendChild(opcao);
            });
        }

        listaSugestoes.hidden = false;
        campoPesquisa.setAttribute('aria-expanded', 'true');
        atualizarOpcaoAtiva();
    }

    function fecharSugestoes() {
        listaSugestoes.hidden = true;
        campoPesquisa.setAttribute('aria-expanded', 'false');
        campoPesquisa.removeAttribute('aria-activedescendant');
        indiceAtivo = -1;
    }

    function moverSelecao(direcao) {
        if (listaSugestoes.hidden) {
            renderizarSugestoes();
        }

        if (sugestoesAtuais.length === 0) {
            return;
        }

        indiceAtivo =
            (indiceAtivo + direcao + sugestoesAtuais.length) %
            sugestoesAtuais.length;
        atualizarOpcaoAtiva();
    }

    campoPesquisa.addEventListener('focus', () => {
        if (!ignorarProximoFoco) {
            renderizarSugestoes();
        }
    });
    campoPesquisa.addEventListener('click', renderizarSugestoes);
    campoPesquisa.addEventListener('input', renderizarSugestoes);

    campoPesquisa.addEventListener('keydown', (evento) => {
        if (evento.key === 'ArrowDown') {
            evento.preventDefault();
            moverSelecao(1);
        } else if (evento.key === 'ArrowUp') {
            evento.preventDefault();
            moverSelecao(-1);
        } else if (
            evento.key === 'Enter' &&
            indiceAtivo >= 0 &&
            sugestoesAtuais[indiceAtivo]
        ) {
            evento.preventDefault();
            selecionarSugestao(sugestoesAtuais[indiceAtivo]);
        } else if (evento.key === 'Escape') {
            fecharSugestoes();
        }
    });

    listaSugestoes.addEventListener('mousedown', (evento) => {
        evento.preventDefault();
    });

    listaSugestoes.addEventListener('click', (evento) => {
        if (!(evento.target instanceof Element)) {
            return;
        }

        const opcao = evento.target.closest('[role="option"]');
        const indice = opcao
            ? Array.from(listaSugestoes.children).indexOf(opcao)
            : -1;

        if (indice >= 0 && sugestoesAtuais[indice]) {
            selecionarSugestao(sugestoesAtuais[indice]);
        }
    });

    document.addEventListener('click', (evento) => {
        if (
            evento.target instanceof Node &&
            !campoPesquisa.contains(evento.target) &&
            !listaSugestoes.contains(evento.target)
        ) {
            fecharSugestoes();
        }
    });

    campoPesquisa.addEventListener('search', () => {
        renderizarSugestoes();
    });
}

function configurarPesquisaPins() {
    const campoPesquisa = document.querySelector(
        '.pesquisa input[type="search"]'
    );

    const containerPesquisa = campoPesquisa
        ? campoPesquisa.closest('.pesquisa')
        : null;
    const containerPins = document.querySelector('.postagens, #grade-pins');

    if (!campoPesquisa || !containerPesquisa || !containerPins) {
        console.warn('Campo de pesquisa ou área de Pins não encontrado.');
        return;
    }

    const mensagemResultados = document.createElement('p');

    mensagemResultados.className = 'mensagem-pesquisa';
    mensagemResultados.setAttribute('role', 'status');
    mensagemResultados.setAttribute('aria-live', 'polite');
    mensagemResultados.hidden = true;

    containerPins.insertAdjacentElement('beforebegin', mensagemResultados);

    function filtrarPins() {
        const termo = normalizarTexto(campoPesquisa.value);

        const pins = containerPins.querySelectorAll('.post');

        let quantidadeVisivel = 0;

        pins.forEach((pin) => {
            const textoPin = obterTextoPesquisavel(pin);

            const corresponde =
                termo === '' || textoPin.includes(termo);

            pin.style.display = corresponde ? '' : 'none';

            if (corresponde) {
                quantidadeVisivel++;
            }
        });

        const nenhumResultado =
            termo !== '' && quantidadeVisivel === 0;

        mensagemResultados.textContent = nenhumResultado
            ? 'Nenhum Pin encontrado. Tente outro termo.'
            : '';

        mensagemResultados.hidden = !nenhumResultado;
    }

    campoPesquisa.addEventListener('input', filtrarPins);
    campoPesquisa.addEventListener('search', filtrarPins);
    document.addEventListener('pins:updated', filtrarPins);
    configurarSugestoesPesquisa(
        campoPesquisa,
        containerPesquisa,
        containerPins
    );
}

document.addEventListener(
    'DOMContentLoaded',
    configurarPesquisaPins
);
