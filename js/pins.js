'use strict';

const pinsExemplo = [
  {
    imagem: '../Imagens/dog.jpg',
    alt: 'Cachorro em fundo azul',
    titulo: 'Cachorro em destaque',
    descricao: 'Imagem de um cachorro para inspiração visual.',
    categoria: 'Animais'
  },
  {
    imagem: '../Imagens/Pinterest.png',
    alt: 'Logotipo do Pinterest',
    titulo: 'Identidade Pinterest',
    descricao: 'Logotipo usado como referência visual.',
    categoria: 'Design'
  },
  {
    imagem: '../Imagens/Icone.png',
    alt: 'Ícone do Pinterest',
    titulo: 'Ícone Pinterest',
    descricao: 'Ícone gráfico disponível no projeto.',
    categoria: 'Design'
  }
];

const CHAVE_PINS_CRIADOS = 'pinterest:pins-criados:v1';
const CHAVE_PASTAS_CRIADAS = 'pinterest:pastas:v1';

function carregarPinsCriados() {
  const conteudo = window.localStorage.getItem(CHAVE_PINS_CRIADOS);
  const pins = conteudo === null ? [] : JSON.parse(conteudo);
  if (!Array.isArray(pins) || pins.some((pin) => !pinValido(pin))) {
    throw new TypeError('Os Pins criados têm um formato inválido.');
  }

  const conteudoPastas = window.localStorage.getItem(CHAVE_PASTAS_CRIADAS);
  if (conteudoPastas === null) {
    return pins;
  }

  const dadosPastas = JSON.parse(conteudoPastas);
  if (
    !dadosPastas ||
    dadosPastas.versao !== 1 ||
    !Array.isArray(dadosPastas.pastas) ||
    dadosPastas.pastas.some(
      (pasta) => !pasta || !Array.isArray(pasta.pins)
    )
  ) {
    throw new TypeError('Os dados das pastas têm um formato inválido.');
  }

  const pinsOrganizados = dadosPastas.pastas.flatMap((pasta) =>
    pasta.pins.filter(
      (pin) => pinValido(pin) && pin.id.startsWith('pin-demo-')
    )
  );
  return [
    ...pins,
    ...pinsOrganizados.filter(
      (pin) => !pins.some((pinSalvo) => pinSalvo.id === pin.id)
    )
  ];
}

function pinValido(pin) {
  return Boolean(
    pin &&
      typeof pin.id === 'string' &&
      typeof pin.imagem === 'string' &&
      typeof pin.titulo === 'string' &&
      typeof pin.descricao === 'string'
  );
}

const pinsCriados = carregarPinsCriados();
const TAMANHO_LOTE_PINS = 2;

function criarCardPin(pin) {
  const card = document.createElement('article');
  card.className = 'post';
  if (pin.id) {
    card.dataset.pinId = pin.id;
  }

  const imagem = document.createElement('img');
  imagem.src = pin.imagem;
  imagem.alt = pin.alt;
  imagem.loading = 'lazy';

  const titulo = document.createElement('h2');
  titulo.textContent = pin.titulo;

  const descricao = document.createElement('p');
  descricao.textContent = pin.descricao;

  card.appendChild(imagem);
  card.appendChild(titulo);
  card.appendChild(descricao);

  if (pin.categoria) {
    const categoria = document.createElement('p');
    categoria.textContent = `Categoria: ${pin.categoria}`;
    card.appendChild(categoria);
  }

  if (pin.link) {
    const link = document.createElement('a');
    link.href = pin.link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Abrir link';
    link.setAttribute('aria-label', `Abrir link de destino: ${pin.titulo}`);
    card.appendChild(link);
    card.dataset.pinLink = pin.link;
  }

  return card;
}

function obterChavePin(pin) {
  return [
    pin.id || '',
    pin.imagem,
    pin.alt,
    pin.titulo,
    pin.descricao,
    pin.categoria
  ].join('|');
}

function listarPins() {
  return [...pinsCriados, ...pinsExemplo];
}

function adicionarPin(pin) {
  if (!pin || typeof pin.id !== 'string' || typeof pin.imagem !== 'string') {
    throw new TypeError('Os dados do Pin são inválidos.');
  }

  const novosPins = [
    ...pinsCriados.filter((item) => item.id !== pin.id),
    pin
  ];
  window.localStorage.setItem(CHAVE_PINS_CRIADOS, JSON.stringify(novosPins));
  pinsCriados.splice(0, pinsCriados.length, ...novosPins);
}

function removerPin(pinId) {
  const novosPins = pinsCriados.filter((pin) => pin.id !== pinId);
  window.localStorage.setItem(CHAVE_PINS_CRIADOS, JSON.stringify(novosPins));
  pinsCriados.splice(0, pinsCriados.length, ...novosPins);
}

window.pinterestPins = Object.freeze({
  listarPins,
  criarCardPin,
  adicionarPin,
  removerPin
});

function obterLotePins(offset, quantidade) {
  // Mantém a paginação separada da fonte para facilitar a futura troca por uma API PHP.
  return Promise.resolve(listarPins().slice(offset, offset + quantidade));
}

function renderizarPinsExemplo() {
  const containerPins = document.querySelector('.postagens');

  if (!containerPins || containerPins.dataset.pinsExemploRenderizados === 'true') {
    return;
  }

  containerPins.dataset.pinsExemploRenderizados = 'true';

  const indicador = document.createElement('p');
  indicador.className = 'pins-carregamento';
  indicador.setAttribute('role', 'status');
  indicador.setAttribute('aria-live', 'polite');
  indicador.setAttribute('aria-busy', 'false');
  indicador.hidden = true;
  indicador.textContent = 'Carregando mais Pins...';
  containerPins.insertAdjacentElement('afterend', indicador);

  const sentinela = document.createElement('div');
  sentinela.className = 'pins-sentinela';
  sentinela.setAttribute('aria-hidden', 'true');
  indicador.insertAdjacentElement('afterend', sentinela);

  let indiceProximoPin = 0;
  let carregando = false;
  let observer = null;
  let carregarTodosDoLink = new URLSearchParams(
    window.location.hash.slice(1)
  ).has('pin');
  const chavesRenderizadas = new Set();

  // Evita chamadas simultâneas e deixa o indicador aparecer antes de inserir o lote.
  async function carregarProximoLote() {
    const quantidadeTotal = listarPins().length;
    if (carregando || indiceProximoPin >= quantidadeTotal) {
      return;
    }

    carregando = true;
    let loteCarregado = false;
    indicador.hidden = false;
    indicador.setAttribute('aria-busy', 'true');
    indicador.textContent = 'Carregando mais Pins...';

    try {
      if (!carregarTodosDoLink) {
        await new Promise((resolver) => window.requestAnimationFrame(resolver));
      }
      const inicioLote = indiceProximoPin;
      const lote = await obterLotePins(inicioLote, TAMANHO_LOTE_PINS);
      if (lote.length === 0) {
        indiceProximoPin = quantidadeTotal;
        indicador.textContent = 'Não há mais Pins de demonstração para carregar.';
        sentinela.hidden = true;
        observer?.disconnect();
        return;
      }

      indiceProximoPin += lote.length;
      loteCarregado = true;

      lote.forEach((pin) => {
        const chave = obterChavePin(pin);
        if (chavesRenderizadas.has(chave)) {
          return;
        }

        chavesRenderizadas.add(chave);
        containerPins.appendChild(criarCardPin(pin));
      });

      document.dispatchEvent(new CustomEvent('pins:updated'));

      if (indiceProximoPin >= listarPins().length) {
        indicador.textContent = 'Não há mais Pins de demonstração para carregar.';
        sentinela.hidden = true;
        observer?.disconnect();
      } else if (observer) {
        indicador.hidden = true;
        observer.unobserve(sentinela);
        observer.observe(sentinela);
      } else {
        indicador.textContent =
          'O carregamento automático não está disponível neste navegador.';
      }
    } catch (erro) {
      console.error('Não foi possível carregar mais Pins.', erro);
      indicador.textContent = 'Ocorreu um erro ao carregar os Pins.';
    } finally {
      carregando = false;
      indicador.setAttribute('aria-busy', 'false');
      if (
        carregarTodosDoLink &&
        indiceProximoPin < listarPins().length &&
        loteCarregado
      ) {
        window.setTimeout(carregarProximoLote, 0);
      } else {
        carregarTodosDoLink = false;
      }
    }
  }

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
          carregarProximoLote();
        }
      },
      { root: null, rootMargin: '300px 0px', threshold: 0 }
    );
    observer.observe(sentinela);
  } else {
    indicador.hidden = false;
    indicador.textContent =
      'O carregamento automático não está disponível neste navegador.';
  }

  carregarProximoLote();
}

document.addEventListener('DOMContentLoaded', renderizarPinsExemplo);
