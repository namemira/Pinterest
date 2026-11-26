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
const LIMITE_CONSERVADOR_ARMAZENAMENTO = 1024 * 1024;

let armazenamentoLocal = null;
let pinsCriados = [];
let armazenamentoPinsCorrompido = false;
let armazenamentoPastasCorrompido = false;
let armazenamentoPinsSincronizado = true;
const errosArmazenamento = new Map();

try {
  armazenamentoLocal = window.localStorage;
} catch (erro) {
  armazenamentoPinsSincronizado = false;
  errosArmazenamento.set(
    'acesso',
    'O armazenamento local está indisponível. Não foi possível carregar ou salvar Pins.'
  );
  console.error('Não foi possível acessar o armazenamento local.', erro);
}

// Registra erros sem substituir nem remover os dados que já estão armazenados.
function registrarErroArmazenamento(chave, mensagem, erro) {
  errosArmazenamento.set(chave, mensagem);
  if (erro) {
    console.error(mensagem, erro);
  }
}

// Lê uma chave JSON distinguindo ausência, erro de acesso e JSON inválido.
function lerJsonArmazenado(chave) {
  if (!armazenamentoLocal) {
    return { valido: false, presente: false, dados: null };
  }

  try {
    const conteudo = armazenamentoLocal.getItem(chave);
    if (conteudo === null) {
      return { valido: true, presente: false, dados: null };
    }

    return {
      valido: true,
      presente: true,
      dados: JSON.parse(conteudo)
    };
  } catch (erro) {
    registrarErroArmazenamento(
      chave === CHAVE_PINS_CRIADOS ? 'pins' : 'pastas',
      'Não foi possível ler os dados salvos. O conteúdo original foi preservado.',
      erro
    );
    return { valido: false, presente: true, dados: null };
  }
}

// Normaliza registros antigos sem descartar campos adicionais do Pin.
function normalizarPin(pin) {
  if (
    !pin ||
    typeof pin !== 'object' ||
    Array.isArray(pin) ||
    typeof pin.id !== 'string' ||
    !pin.id.trim() ||
    (pin.imagem !== undefined && typeof pin.imagem !== 'string')
  ) {
    return null;
  }

  return {
    ...pin,
    id: pin.id,
    imagem: pin.imagem || '',
    alt: typeof pin.alt === 'string' ? pin.alt : '',
    titulo: typeof pin.titulo === 'string' ? pin.titulo : 'Pin salvo',
    descricao: typeof pin.descricao === 'string' ? pin.descricao : '',
    categoria: typeof pin.categoria === 'string' ? pin.categoria : '',
    link: typeof pin.link === 'string' ? pin.link : ''
  };
}

function pinValido(pin) {
  return normalizarPin(pin) !== null;
}

// Reúne Pins criados e cópias legadas armazenadas dentro das pastas.
function carregarPinsCriados() {
  const leituraPins = lerJsonArmazenado(CHAVE_PINS_CRIADOS);
  const leituraPastas = lerJsonArmazenado(CHAVE_PASTAS_CRIADAS);
  const pinsPorId = new Map();
  let precisaPersistirPins = false;
  let precisaMigrarPastas = false;
  let pastasValidas = true;

  if (!leituraPins.valido) {
    armazenamentoPinsCorrompido = true;
  } else if (leituraPins.presente) {
    if (!Array.isArray(leituraPins.dados)) {
      armazenamentoPinsCorrompido = true;
      registrarErroArmazenamento(
        'pins',
        'Os Pins salvos têm um formato inválido. Os dados originais foram preservados.'
      );
    } else {
      leituraPins.dados.forEach((pin) => {
        const normalizado = normalizarPin(pin);
        if (!normalizado) {
          armazenamentoPinsCorrompido = true;
          registrarErroArmazenamento(
            'pins',
            'Há Pins com formato inválido. Os dados originais foram preservados.'
          );
          return;
        }

        if (!pinsPorId.has(normalizado.id)) {
          pinsPorId.set(normalizado.id, normalizado);
        } else {
          precisaPersistirPins = true;
        }
      });
    }
  }

  if (leituraPastas.valido && leituraPastas.presente) {
    const dadosPastas = leituraPastas.dados;
    if (
      !dadosPastas ||
      dadosPastas.versao !== 1 ||
      !Array.isArray(dadosPastas.pastas) ||
      dadosPastas.pastas.some(
        (pasta) =>
          !pasta ||
          typeof pasta.id !== 'string' ||
          typeof pasta.nome !== 'string' ||
          typeof pasta.descricao !== 'string' ||
          !Array.isArray(pasta.pins)
      )
    ) {
      pastasValidas = false;
      armazenamentoPastasCorrompido = true;
      registrarErroArmazenamento(
        'pastas',
        'As pastas salvas têm um formato inválido. Os dados originais foram preservados.'
      );
    } else {
      dadosPastas.pastas.forEach((pasta) => {
        const idsVistos = new Set();
        pasta.pins.forEach((pinArmazenado) => {
          if (typeof pinArmazenado === 'string') {
            if (idsVistos.has(pinArmazenado)) {
              precisaMigrarPastas = true;
            }
            idsVistos.add(pinArmazenado);
            return;
          }

          if (pinArmazenado && pinArmazenado.temporario === true) {
            return;
          }

          const pin = normalizarPin(pinArmazenado);
          if (!pin) {
            pastasValidas = false;
            armazenamentoPastasCorrompido = true;
            registrarErroArmazenamento(
              'pastas',
              'Há Pins com formato inválido nas pastas. Os dados originais foram preservados.'
            );
            return;
          }

          if (!pinsPorId.has(pin.id)) {
            pinsPorId.set(pin.id, pin);
            precisaPersistirPins = true;
          }
          precisaMigrarPastas = true;
        });
      });
    }
  } else if (!leituraPastas.valido) {
    armazenamentoPastasCorrompido = true;
  }

  pinsCriados = Array.from(pinsPorId.values());

  if (
    precisaPersistirPins &&
    !armazenamentoPinsCorrompido &&
    armazenamentoLocal
  ) {
    try {
      armazenamentoLocal.setItem(
        CHAVE_PINS_CRIADOS,
        JSON.stringify(pinsCriados)
      );
      errosArmazenamento.delete('pins');
    } catch (erro) {
      armazenamentoPinsSincronizado = false;
      registrarErroArmazenamento(
        'pins',
        'Não foi possível centralizar os Pins no armazenamento local. Os dados antigos foram mantidos.',
        erro
      );
    }
  }

  if (
    precisaMigrarPastas &&
    pastasValidas &&
    !armazenamentoPinsCorrompido &&
    !errosArmazenamento.has('pins') &&
    armazenamentoLocal
  ) {
    const pastasComReferencias = {
      versao: 1,
      pastas: leituraPastas.dados.pastas.map((pasta) => ({
        ...pasta,
        pins: Array.from(
          new Set(
            pasta.pins
              .filter(
                (pin) => !(pin && typeof pin === 'object' && pin.temporario === true)
              )
              .map((pin) => (typeof pin === 'string' ? pin : pin.id))
              .filter((id) => typeof id === 'string' && id.length > 0)
          )
        )
      }))
    };

    try {
      armazenamentoLocal.setItem(
        CHAVE_PASTAS_CRIADAS,
        JSON.stringify(pastasComReferencias)
      );
      errosArmazenamento.delete('pastas');
    } catch (erro) {
      registrarErroArmazenamento(
        'migracao',
        'Não foi possível atualizar as referências das pastas. As cópias antigas foram mantidas.',
        erro
      );
    }
  }

  return pinsCriados;
}

// Mantém Pins criados em memória, com os dados carregados antes da inicialização da página.
carregarPinsCriados();
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
  const pinsCriadosVisiveis = pinsCriados.filter(
    (pin) =>
      !pinsExemplo.some(
        (exemplo) =>
          pin.imagem === exemplo.imagem &&
          pin.alt === exemplo.alt &&
          pin.titulo === exemplo.titulo &&
          pin.descricao === exemplo.descricao &&
          pin.categoria === exemplo.categoria
      )
  );
  return [...pinsCriadosVisiveis, ...pinsExemplo];
}

function listarPinsCriados() {
  return pinsCriados.map((pin) => ({ ...pin }));
}

function obterPin(pinId) {
  const pin = pinsCriados.find((item) => item.id === pinId);
  return pin ? { ...pin } : null;
}

function contemPin(pinId) {
  return pinsCriados.some((pin) => pin.id === pinId);
}

function obterErroArmazenamento() {
  return Array.from(new Set(errosArmazenamento.values())).join(' ');
}

function podePersistirPins() {
  return Boolean(
    armazenamentoLocal &&
      !armazenamentoPinsCorrompido &&
      armazenamentoPinsSincronizado
  );
}

// Estima o espaço necessário para uma imagem em Data URL antes de convertê-la.
function verificarEspacoImagem(tamanhoBytes) {
  if (!Number.isFinite(tamanhoBytes) || tamanhoBytes < 0) {
    return {
      ok: false,
      mensagem: 'Não foi possível verificar o tamanho da imagem.'
    };
  }

  if (!podePersistirPins()) {
    return {
      ok: false,
      mensagem:
        obterErroArmazenamento() ||
        'O armazenamento local não está disponível para salvar Pins.'
    };
  }

  try {
    let caracteresArmazenados = 0;
    for (let indice = 0; indice < armazenamentoLocal.length; indice += 1) {
      const chave = armazenamentoLocal.key(indice);
      if (chave !== null) {
        caracteresArmazenados +=
          chave.length + (armazenamentoLocal.getItem(chave) || '').length;
      }
    }

    const caracteresImagem = Math.ceil(tamanhoBytes / 3) * 4 + 128;
    if (
      caracteresArmazenados + caracteresImagem + 1024 >
      LIMITE_CONSERVADOR_ARMAZENAMENTO
    ) {
      return {
        ok: false,
        mensagem:
          'A imagem é grande demais para o espaço local estimado. Escolha um arquivo menor.'
      };
    }
  } catch (erro) {
    registrarErroArmazenamento(
      'acesso',
      'Não foi possível verificar o espaço do armazenamento local.',
      erro
    );
    return {
      ok: false,
      mensagem: obterErroArmazenamento()
    };
  }

  return { ok: true, mensagem: '' };
}

function persistirPins(novosPins) {
  if (!armazenamentoLocal) {
    throw new Error(
      obterErroArmazenamento() ||
        'O armazenamento local não está disponível para salvar Pins.'
    );
  }
  if (armazenamentoPinsCorrompido) {
    throw new Error(
      'Os Pins existentes têm dados inválidos. Eles foram preservados e não serão sobrescritos.'
    );
  }
  if (!armazenamentoPinsSincronizado) {
    throw new Error(
      'Os Pins existentes não foram sincronizados com segurança. Os dados originais foram preservados.'
    );
  }

  try {
    armazenamentoLocal.setItem(
      CHAVE_PINS_CRIADOS,
      JSON.stringify(novosPins)
    );
    armazenamentoPinsSincronizado = true;
    errosArmazenamento.delete('pins');
  } catch (erro) {
    registrarErroArmazenamento(
      'pins',
      'Não foi possível salvar os Pins. Verifique o espaço disponível no navegador.',
      erro
    );
    throw erro;
  }
}

// Persiste um Pin criado e atualiza a coleção mantida em memória.
function adicionarPin(pin) {
  const pinNormalizado = normalizarPin(pin);
  if (!pinNormalizado) {
    throw new TypeError('Os dados do Pin são inválidos.');
  }

  const novosPins = [
    ...pinsCriados.filter((item) => item.id !== pinNormalizado.id),
    pinNormalizado
  ];
  persistirPins(novosPins);
  pinsCriados.splice(0, pinsCriados.length, ...novosPins);
}

// Remove um Pin criado tanto do armazenamento quanto da coleção em memória.
function removerPin(pinId) {
  const novosPins = pinsCriados.filter((pin) => pin.id !== pinId);
  persistirPins(novosPins);
  pinsCriados.splice(0, pinsCriados.length, ...novosPins);
}

// Expõe a API compartilhada usada por busca, pastas, criação e outras páginas.
window.pinterestPins = Object.freeze({
  listarPins,
  listarPinsCriados,
  obterPin,
  contemPin,
  criarCardPin,
  adicionarPin,
  removerPin,
  verificarEspacoImagem,
  obterErroArmazenamento,
  podePersistirPins
});

// Simula a leitura de um lote, preservando a interface assíncrona para futura API.
function obterLotePins(quantidade, pinsJaRenderizados) {
  // Mantém a paginação separada da fonte para facilitar a futura troca por uma API PHP.
  return Promise.resolve(
    listarPins()
      .filter((pin) => !pinsJaRenderizados.has(obterChavePin(pin)))
      .slice(0, quantidade)
  );
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

  let carregando = false;
  let observer = null;
  let carregarTodosDoLink = new URLSearchParams(
    window.location.hash.slice(1)
  ).has('pin');
  const chavesRenderizadas = new Set();

  // Considera também cards publicados manualmente durante a sessão.
  function listarPinsPendentes() {
    const cardsExistentes = Array.from(
      containerPins.querySelectorAll('.post')
    );

    return listarPins().filter((pin) => {
      const chave = obterChavePin(pin);
      if (chavesRenderizadas.has(chave)) {
        return false;
      }

      if (
        pin.id &&
        cardsExistentes.some((card) => card.dataset.pinId === pin.id)
      ) {
        chavesRenderizadas.add(chave);
        return false;
      }

      return true;
    });
  }

  // Evita chamadas simultâneas e deixa o indicador aparecer antes de inserir o lote.
  async function carregarProximoLote() {
    if (carregando || listarPinsPendentes().length === 0) {
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
      const lote = await obterLotePins(
        TAMANHO_LOTE_PINS,
        chavesRenderizadas
      );
      if (lote.length === 0) {
        indicador.textContent = 'Não há mais Pins de demonstração para carregar.';
        sentinela.hidden = true;
        observer?.disconnect();
        return;
      }

      loteCarregado = true;

      lote.forEach((pin) => {
        const chave = obterChavePin(pin);
        if (chavesRenderizadas.has(chave)) {
          return;
        }

        chavesRenderizadas.add(chave);
        if (
          pin.id &&
          Array.from(containerPins.querySelectorAll('.post')).some(
            (card) => card.dataset.pinId === pin.id
          )
        ) {
          return;
        }
        containerPins.appendChild(criarCardPin(pin));
      });

      document.dispatchEvent(new CustomEvent('pins:updated'));

      if (listarPinsPendentes().length === 0) {
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
        listarPinsPendentes().length > 0 &&
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
console.log('Sistema de Pins:', window.pinterestPins);
console.log(
  'Função de espaço:',
  typeof window.pinterestPins?.verificarEspacoImagem
);