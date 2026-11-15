'use strict';

(() => {
  function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) {
      elemento.className = classe;
    }
    if (texto) {
      elemento.textContent = texto;
    }
    return elemento;
  }

  function criarVisualizacaoDetalhes() {
    const overlay = criarElemento('div', 'detalhes-pin-overlay');
    overlay.hidden = true;
    overlay.setAttribute('role', 'presentation');

    const dialogo = criarElemento('section', 'detalhes-pin-dialogo');
    dialogo.setAttribute('role', 'dialog');
    dialogo.setAttribute('aria-modal', 'true');
    dialogo.setAttribute('aria-labelledby', 'detalhes-pin-titulo');
    dialogo.setAttribute('aria-describedby', 'detalhes-pin-descricao');

    const botaoVoltar = criarElemento(
      'button',
      'detalhes-pin-voltar',
      'Voltar ao feed'
    );
    botaoVoltar.type = 'button';

    const botaoFechar = criarElemento('button', 'detalhes-pin-fechar', 'Fechar');
    botaoFechar.type = 'button';
    botaoFechar.setAttribute('aria-label', 'Fechar detalhes do Pin');

    const imagem = document.createElement('img');
    imagem.className = 'detalhes-pin-imagem';

    const conteudo = criarElemento('div', 'detalhes-pin-conteudo');
    const titulo = criarElemento('h2', '', '');
    titulo.id = 'detalhes-pin-titulo';

    const autor = criarElemento('div', 'detalhes-pin-autor');
    const fotoAutor = document.createElement('img');
    fotoAutor.alt = '';
    const nomeAutor = criarElemento('span', '', '');
    autor.append(fotoAutor, nomeAutor);

    const descricao = criarElemento('p', 'detalhes-pin-descricao', '');
    descricao.id = 'detalhes-pin-descricao';

    const categoria = criarElemento('p', 'detalhes-pin-categoria', '');
    const link = criarElemento('a', 'detalhes-pin-link', 'Abrir link');
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.hidden = true;

    const acoes = criarElemento('div', 'detalhes-pin-acoes');
    const botaoSalvar = criarElemento('button', 'detalhes-pin-salvar', 'Salvar');
    botaoSalvar.type = 'button';
    botaoSalvar.setAttribute('aria-label', 'Salvar este Pin');
    botaoSalvar.setAttribute('aria-pressed', 'false');

    const botaoCompartilhar = criarElemento(
      'button',
      'detalhes-pin-compartilhar',
      'Compartilhar'
    );
    botaoCompartilhar.type = 'button';
    botaoCompartilhar.setAttribute('aria-label', 'Compartilhar este Pin');

    acoes.append(botaoSalvar, botaoCompartilhar);
    conteudo.append(titulo, autor, descricao, categoria, link, acoes);

    const relacionados = criarElemento('section', 'detalhes-pin-relacionados');
    relacionados.setAttribute('aria-labelledby', 'detalhes-pin-relacionados-titulo');
    relacionados.appendChild(
      criarElemento('h3', '', 'Mais ideias para você')
    ).id = 'detalhes-pin-relacionados-titulo';
    const listaRelacionados = criarElemento('div', 'detalhes-pin-grade-relacionados');
    relacionados.appendChild(listaRelacionados);

    dialogo.append(
      botaoVoltar,
      botaoFechar,
      imagem,
      conteudo,
      relacionados
    );
    overlay.appendChild(dialogo);
    document.body.appendChild(overlay);

    return {
      overlay,
      dialogo,
      botaoVoltar,
      botaoFechar,
      imagem,
      titulo,
      autor,
      fotoAutor,
      nomeAutor,
      descricao,
      categoria,
      link,
      botaoSalvar,
      botaoCompartilhar,
      listaRelacionados
    };
  }

  function lerDadosDoCard(card) {
    const imagem = card.querySelector('img');
    if (!imagem) {
      return null;
    }

    const tituloElemento = card.querySelector('h2, h3, [data-pin-titulo]');
    const titulo = tituloElemento
      ? tituloElemento.textContent.trim()
      : imagem.alt.trim();
    const paragrafos = Array.from(card.querySelectorAll('p'));
    const textoCategoria = paragrafos.find((paragrafo) =>
      /^categoria\s*:/i.test(paragrafo.textContent.trim())
    );
    const categoria = textoCategoria
      ? textoCategoria.textContent.trim().replace(/^categoria\s*:\s*/i, '')
      : '';
    const descricaoElemento = paragrafos.find(
      (paragrafo) => paragrafo !== textoCategoria
    );
    const link = card.querySelector('a[href]');

    return {
      id: card.dataset.pinId,
      src: imagem.getAttribute('src'),
      alt: imagem.alt,
      titulo: titulo || imagem.alt || 'Pin',
      descricao: descricaoElemento ? descricaoElemento.textContent.trim() : '',
      categoria,
      link: link ? link.href : '',
      autor: card.dataset.pinAutor || '',
      fotoAutor: card.dataset.pinAutorFoto || ''
    };
  }

  function configurarDetalhesPin() {
    const containerPins = document.querySelector('.postagens');
    if (!containerPins) {
      return;
    }

    const visualizacao = criarVisualizacaoDetalhes();
    let cardAtual = null;
    let focoAnterior = null;

    function prepararCardParaTeclado(card) {
      if (!(card instanceof Element) || !card.matches('.post')) {
        return;
      }

      const dados = lerDadosDoCard(card);
      if (!dados) {
        return;
      }

      card.tabIndex = 0;
      card.setAttribute('aria-label', `Abrir detalhes do Pin: ${dados.titulo}`);
    }

    function obterCardPorId(id) {
      if (!id) {
        return null;
      }

      return Array.from(containerPins.querySelectorAll('.post')).find(
        (card) => card.dataset.pinId === id
      ) || null;
    }

    function obterPinDaUrl() {
      const parametros = new URLSearchParams(window.location.hash.slice(1));
      return parametros.get('pin') || '';
    }

    function atualizarUrl(card, adicionarHistorico) {
      if (!card.dataset.pinId) {
        return;
      }

      const url = new URL(window.location.href);
      url.hash = `pin=${encodeURIComponent(card.dataset.pinId)}`;
      if (adicionarHistorico && url.href !== window.location.href) {
        const estadoAtual =
          window.history.state && typeof window.history.state === 'object'
            ? window.history.state
            : {};
        window.history.pushState(
          { ...estadoAtual, pinterestPinId: card.dataset.pinId },
          '',
          url.href
        );
      }
    }

    function criarCardRelacionado(card) {
      const dados = lerDadosDoCard(card);
      if (!dados) {
        return null;
      }

      const artigo = criarElemento('article', 'detalhes-pin-relacionado');
      artigo.dataset.pinId = dados.id;

      const abrir = document.createElement('button');
      abrir.type = 'button';
      abrir.className = 'detalhes-pin-relacionado-abrir';
      abrir.setAttribute('aria-label', `Abrir detalhes do Pin: ${dados.titulo}`);
      const imagem = document.createElement('img');
      imagem.src = dados.src;
      imagem.alt = dados.alt || dados.titulo;
      imagem.loading = 'lazy';
      const titulo = criarElemento('span', '', dados.titulo);
      abrir.append(imagem, titulo);

      const acoes = criarElemento('div', 'detalhes-pin-relacionado-acoes');
      const salvar = criarElemento('button', '', 'Salvar');
      salvar.type = 'button';
      salvar.dataset.acaoRelacionada = 'salvar';
      salvar.setAttribute('aria-label', `Salvar Pin: ${dados.titulo}`);
      const compartilhar = criarElemento('button', '', 'Compartilhar');
      compartilhar.type = 'button';
      compartilhar.dataset.acaoRelacionada = 'compartilhar';
      compartilhar.setAttribute(
        'aria-label',
        `Compartilhar Pin: ${dados.titulo}`
      );
      acoes.append(salvar, compartilhar);
      artigo.append(abrir, acoes);
      return artigo;
    }

    function renderizarRelacionados(cardAtualPin) {
      const dadosAtuais = lerDadosDoCard(cardAtualPin);
      const outrosCards = Array.from(containerPins.querySelectorAll('.post'))
        .filter((card) => card !== cardAtualPin)
        .map((card) => ({ card, dados: lerDadosDoCard(card) }))
        .filter((item) => item.dados);
      const daCategoria = dadosAtuais.categoria
        ? outrosCards.filter(
            (item) => item.dados.categoria === dadosAtuais.categoria
          )
        : [];
      const cardsRelacionados = (daCategoria.length ? daCategoria : outrosCards)
        .slice(0, 6);

      visualizacao.listaRelacionados.replaceChildren();
      if (cardsRelacionados.length === 0) {
        visualizacao.listaRelacionados.appendChild(
          criarElemento('p', 'detalhes-pin-sem-relacionados', 'Ainda não há outros Pins para exibir.')
        );
        return;
      }

      cardsRelacionados.forEach(({ card }) => {
        const relacionado = criarCardRelacionado(card);
        if (relacionado) {
          visualizacao.listaRelacionados.appendChild(relacionado);
        }
      });
    }

    function exibirDetalhes(card, adicionarHistorico = false) {
      const dados = lerDadosDoCard(card);
      if (!dados) {
        return;
      }

      const mesmoPin = cardAtual === card && !visualizacao.overlay.hidden;
      if (!mesmoPin) {
        if (!cardAtual) {
          focoAnterior = document.activeElement;
        }
        cardAtual = card;
      }

      atualizarUrl(card, adicionarHistorico);
      visualizacao.imagem.src = new URL(dados.src, document.baseURI).href;
      visualizacao.imagem.alt = dados.alt || dados.titulo;
      visualizacao.titulo.textContent = dados.titulo;

      const perfilNome =
        document.querySelector('.perfil-pastas-identidade h1') ||
        document.querySelector('.perfil');
      const perfilFoto = document.querySelector(
        '.perfil-pastas-foto, .perfil img'
      );
      visualizacao.nomeAutor.textContent =
        dados.autor ||
        (perfilNome instanceof HTMLElement
          ? perfilNome.textContent.trim()
          : 'Seu perfil');
      const fotoAutor = dados.fotoAutor || perfilFoto?.getAttribute('src') || '';
      visualizacao.fotoAutor.hidden = !fotoAutor;
      if (fotoAutor) {
        visualizacao.fotoAutor.src = new URL(fotoAutor, document.baseURI).href;
      }

      visualizacao.descricao.textContent = dados.descricao;
      visualizacao.descricao.hidden = !dados.descricao;
      if (dados.descricao) {
        visualizacao.dialogo.setAttribute(
          'aria-describedby',
          'detalhes-pin-descricao'
        );
      } else {
        visualizacao.dialogo.removeAttribute('aria-describedby');
      }
      visualizacao.categoria.textContent = dados.categoria
        ? `Categoria: ${dados.categoria}`
        : '';
      visualizacao.categoria.hidden = !dados.categoria;

      let linkValido = false;
      if (dados.link) {
        try {
          const urlLink = new URL(dados.link, document.baseURI);
          linkValido = urlLink.protocol === 'http:' || urlLink.protocol === 'https:';
          if (linkValido) {
            visualizacao.link.href = urlLink.href;
          }
        } catch (erro) {
          console.error('O link de destino do Pin é inválido.', erro);
        }
      }
      visualizacao.link.hidden = !linkValido;

      const botaoSalvarOriginal = card.querySelector('.pin-action-salvar');
      const pinSalvo =
        botaoSalvarOriginal?.getAttribute('aria-pressed') === 'true';
      visualizacao.botaoSalvar.setAttribute('aria-pressed', String(pinSalvo));
      visualizacao.botaoSalvar.textContent = pinSalvo ? 'Salvo' : 'Salvar';
      visualizacao.botaoSalvar.setAttribute(
        'aria-label',
        pinSalvo ? `Pin salvo: ${dados.titulo}` : `Salvar Pin: ${dados.titulo}`
      );
      visualizacao.botaoCompartilhar.setAttribute(
        'aria-label',
        `Compartilhar Pin: ${dados.titulo}`
      );
      renderizarRelacionados(card);

      visualizacao.overlay.hidden = false;
      document.body.classList.add('detalhes-pin-abertos');
      if (!mesmoPin) {
        visualizacao.botaoFechar.focus();
      }
    }

    function fecharDetalhes(restaurarFoco = true) {
      if (visualizacao.overlay.hidden) {
        return;
      }

      visualizacao.overlay.hidden = true;
      document.body.classList.remove('detalhes-pin-abertos');

      if (restaurarFoco && cardAtual instanceof HTMLElement && cardAtual.isConnected) {
        cardAtual.focus();
      } else if (restaurarFoco && focoAnterior instanceof HTMLElement) {
        focoAnterior.focus();
      }

      cardAtual = null;
    }

    function voltarAoFeed() {
      if (
        window.history.state?.pinterestPinId &&
        window.history.state.pinterestPinId === cardAtual?.dataset.pinId
      ) {
        window.history.back();
        return;
      }

      const url = new URL(window.location.href);
      url.hash = 'feed';
      window.history.replaceState(window.history.state, '', url.href);
      fecharDetalhes();
    }

    function sincronizarComUrl() {
      const id = obterPinDaUrl();
      if (!id) {
        fecharDetalhes();
        return;
      }

      const card = obterCardPorId(id);
      if (card) {
        exibirDetalhes(card);
      }
    }

    function acionarAcaoOriginal(botao, acao) {
      const artigo = botao.closest('.detalhes-pin-relacionado');
      const cardOriginal = obterCardPorId(artigo?.dataset.pinId || '');
      const seletor =
        acao === 'salvar'
          ? '.pin-action-salvar'
          : '.pin-action-compartilhar';
      cardOriginal?.querySelector(seletor)?.click();
    }

    containerPins.querySelectorAll('.post').forEach(prepararCardParaTeclado);

    const observadorCards = new MutationObserver((mutacoes) => {
      mutacoes.forEach((mutacao) => {
        mutacao.addedNodes.forEach((no) => {
          if (!(no instanceof Element)) {
            return;
          }

          prepararCardParaTeclado(no);
          no.querySelectorAll('.post').forEach(prepararCardParaTeclado);
        });
      });
      sincronizarComUrl();
    });
    observadorCards.observe(containerPins, { childList: true, subtree: true });

    containerPins.addEventListener('click', (evento) => {
      if (!(evento.target instanceof Element)) {
        return;
      }

      if (evento.target.closest('button, a, input, select, textarea, [data-acao-pin]')) {
        return;
      }

      const card = evento.target.closest('.post');
      if (card && containerPins.contains(card)) {
        exibirDetalhes(card, true);
      }
    });

    containerPins.addEventListener('keydown', (evento) => {
      if (
        (evento.key === 'Enter' || evento.key === ' ') &&
        evento.target instanceof Element &&
        evento.target.matches('.post')
      ) {
        evento.preventDefault();
        exibirDetalhes(evento.target, true);
      }
    });

    visualizacao.botaoFechar.addEventListener('click', voltarAoFeed);
    visualizacao.botaoVoltar.addEventListener('click', voltarAoFeed);
    visualizacao.overlay.addEventListener('click', (evento) => {
      if (evento.target === visualizacao.overlay) {
        voltarAoFeed();
      }
    });
    visualizacao.dialogo.addEventListener('click', (evento) => {
      evento.stopPropagation();
      if (!(evento.target instanceof Element)) {
        return;
      }

      const acaoRelacionada = evento.target.closest('[data-acao-relacionada]');
      if (acaoRelacionada) {
        acionarAcaoOriginal(
          acaoRelacionada,
          acaoRelacionada.dataset.acaoRelacionada
        );
        return;
      }

      const botaoAbrir = evento.target.closest('.detalhes-pin-relacionado-abrir');
      const artigo = botaoAbrir?.closest('.detalhes-pin-relacionado');
      const card = obterCardPorId(artigo?.dataset.pinId || '');
      if (card) {
        exibirDetalhes(card, true);
      }
    });

    visualizacao.botaoSalvar.addEventListener('click', () => {
      cardAtual?.querySelector('.pin-action-salvar')?.click();
    });
    visualizacao.botaoCompartilhar.addEventListener('click', () => {
      cardAtual?.querySelector('.pin-action-compartilhar')?.click();
    });

    document.addEventListener('boards:state-changed', (evento) => {
      if (!cardAtual) {
        return;
      }

      const salvo = (evento.detail?.pinIds || []).includes(cardAtual.dataset.pinId);
      const dados = lerDadosDoCard(cardAtual);
      visualizacao.botaoSalvar.setAttribute('aria-pressed', String(salvo));
      visualizacao.botaoSalvar.textContent = salvo ? 'Salvo' : 'Salvar';
      visualizacao.botaoSalvar.setAttribute(
        'aria-label',
        salvo ? `Pin salvo: ${dados.titulo}` : `Salvar Pin: ${dados.titulo}`
      );
    });

    visualizacao.dialogo.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        voltarAoFeed();
        return;
      }

      if (evento.key !== 'Tab') {
        return;
      }

      const focaveis = Array.from(
        visualizacao.dialogo.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((elemento) => !elemento.hidden);
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (!primeiro || !ultimo) {
        evento.preventDefault();
      } else if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    });

    window.addEventListener('popstate', sincronizarComUrl);
    window.addEventListener('hashchange', sincronizarComUrl);
    document.addEventListener('pins:updated', sincronizarComUrl);
    sincronizarComUrl();
  }

  document.addEventListener('DOMContentLoaded', configurarDetalhesPin);
})();
