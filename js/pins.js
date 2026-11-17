'use strict';

// Pins de demonstração usados no feed e na página Explorar.
const pinsExemplo = [
  {
    imagem: '../Imagens/decoracao.jpg',
    alt: 'Sala de estar aconchegante com sofá claro, madeira natural e tapete xadrez',
    titulo: 'Um refúgio acolhedor em tons naturais',
    descricao:
      'Madeira, plantas e tecidos aconchegantes criam uma sala convidativa para descansar.',
    categoria: 'Decoração'
  },
  {
    imagem: '../Imagens/moda.jpg',
    alt: 'Vestido branco de noiva com renda, exposto em um manequim',
    titulo: 'Elegância clássica em um vestido de renda',
    descricao:
      'Uma silhueta romântica com detalhes delicados para inspirar looks de festa.',
    categoria: 'Moda'
  },
  {
    imagem: '../Imagens/receitas.jpg',
    alt: 'Receita ilustrada de pavê de limão com ingredientes e modo de preparo',
    titulo: 'Pavê de limão para compartilhar',
    descricao:
      'Uma sobremesa cítrica em camadas, com creme, biscoitos e raspas de limão.',
    categoria: 'Receitas'
  },
  {
    imagem: '../Imagens/viagens.jpg',
    alt: 'Praia de águas azul-turquesa cercada por areia clara e morros verdes',
    titulo: 'Um refúgio de águas turquesa',
    descricao:
      'Paisagem litorânea para guardar como inspiração para a próxima viagem.',
    categoria: 'Viagens'
  },
  {
    imagem: '../Imagens/arte.jpg',
    alt: 'Pintura de paisagem surreal em tons de azul e verde com uma lua crescente amarela',
    titulo: 'Uma paisagem para sonhar acordado',
    descricao:
      'Formas onduladas e cores profundas criam uma referência visual cheia de atmosfera.',
    categoria: 'Arte'
  },
  {
    imagem: '../Imagens/dog.jpg',
    alt: 'Filhote de cachorro sentado diante de um fundo azul vibrante',
    titulo: 'Um filhote curioso para alegrar o dia',
    descricao:
      'Retrato de um cachorrinho atento, fotografado sobre um fundo azul.',
    categoria: 'Animais'
  }
];

// Chaves compatíveis com os dados de Pins e pastas já salvos no navegador.
const CHAVE_PINS_CRIADOS = 'pinterest:pins-criados:v1';
const CHAVE_PASTAS_CRIADAS = 'pinterest:pastas:v1';

// Carrega Pins criados e inclui Pins demonstrativos que já foram organizados.
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

// Valida o formato mínimo esperado antes de usar um Pin salvo.
function pinValido(pin) {
  return Boolean(
    pin &&
      typeof pin.id === 'string' &&
      typeof pin.imagem === 'string' &&
      typeof pin.titulo === 'string' &&
      typeof pin.descricao === 'string'
  );
}

// Mantém Pins criados em memória para renderização e atualizações durante a sessão.
const pinsCriados = carregarPinsCriados();
const TAMANHO_LOTE_PINS = 2;

// Constrói um card de Pin a partir dos dados sem interpolar conteúdo como HTML.
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
  titulo.className = 'post-titulo';
  titulo.textContent = pin.titulo;

  const descricao = document.createElement('p');
  descricao.className = 'post-descricao';
  descricao.textContent = pin.descricao;

  card.appendChild(imagem);
  card.appendChild(titulo);
  card.appendChild(descricao);

  if (pin.categoria) {
    const categoria = document.createElement('p');
    categoria.className = 'post-categoria';
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

// Produz uma chave de conteúdo para evitar renderizar o mesmo Pin duas vezes.
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

// Retorna o conjunto de Pins criados pelo usuário e exemplos.
function listarPins() {
  return [...pinsCriados, ...pinsExemplo];
}

// Persiste um Pin criado e atualiza a coleção mantida em memória.
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

// Remove um Pin criado tanto do armazenamento quanto da coleção em memória.
function removerPin(pinId) {
  const novosPins = pinsCriados.filter((pin) => pin.id !== pinId);
  window.localStorage.setItem(CHAVE_PINS_CRIADOS, JSON.stringify(novosPins));
  pinsCriados.splice(0, pinsCriados.length, ...novosPins);
}

// Expõe a API compartilhada usada por busca, pastas, criação e outras páginas.
window.pinterestPins = Object.freeze({
  listarPins,
  criarCardPin,
  adicionarPin,
  removerPin
});

// Simula a leitura de um lote, preservando a interface assíncrona para futura API.
function obterLotePins(offset, quantidade) {
  // Mantém a paginação separada da fonte para facilitar a futura troca por uma API PHP.
  return Promise.resolve(listarPins().slice(offset, offset + quantidade));
}

// Renderiza o feed progressivamente conforme a sentinela se aproxima da tela.
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

  // Observa a sentinela para buscar o próximo lote; informa quando isso não é suportado.
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

// Monta o feed depois que o contêiner da página estiver disponível.
document.addEventListener('DOMContentLoaded', renderizarPinsExemplo);
