'use strict';

(() => {
  // Mantém a lista local sincronizada com as pastas para atualizar os botões Salvar.
  let pinsSalvos = new Set();

  // Cria ou reutiliza a região acessível que anuncia o resultado das ações.
  function criarMensagemStatus(containerPins) {
    let mensagem = document.querySelector('.pin-interaction-status');

    if (!mensagem) {
      mensagem = document.createElement('p');
      mensagem.className = 'pin-interaction-status';
      mensagem.setAttribute('role', 'status');
      mensagem.setAttribute('aria-live', 'polite');
      containerPins.insertAdjacentElement('beforebegin', mensagem);
    }

    return mensagem;
  }

  // Gera uma chave estável a partir do conteúdo quando um Pin ainda não tem ID.
  function hashConteudo(texto) {
    let hash = 2166136261;

    for (let indice = 0; indice < texto.length; indice += 1) {
      hash ^= texto.charCodeAt(indice);
      hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0).toString(36);
  }

  // Reúne os campos visíveis do card usados para construir essa chave.
  function obterAssinatura(card) {
    const imagem = card.querySelector('img');
    const caminhoImagem = imagem
      ? imagem.getAttribute('src') || ''
      : '';
    const textoAlternativo = imagem ? imagem.alt : '';
    const textoCard = card.textContent.trim();

    return [caminhoImagem, textoAlternativo, textoCard].join('|');
  }

  // Garante que cada card tenha um identificador único para salvar e compartilhar.
  function garantirIdPin(card, idsUtilizados) {
    if (card.dataset.pinId) {
      idsUtilizados.add(card.dataset.pinId);
      return card.dataset.pinId;
    }

    const baseId = `pin-${hashConteudo(obterAssinatura(card))}`;
    let id = baseId;
    let indiceDuplicado = 2;

    while (idsUtilizados.has(id)) {
      id = `${baseId}-${indiceDuplicado}`;
      indiceDuplicado += 1;
    }

    card.dataset.pinId = id;
    idsUtilizados.add(id);
    return id;
  }

  // Obtém o título acessível do Pin, com alternativa para cards sem título.
  function obterTituloPin(card) {
    const titulo = card.querySelector('h2, h3, [data-pin-titulo]');
    if (titulo && titulo.textContent.trim()) {
      return titulo.textContent.trim();
    }

    const imagem = card.querySelector('img[alt]');
    return imagem && imagem.alt.trim() ? imagem.alt.trim() : 'Pin';
  }

  // Monta os botões de ação, incluindo rótulos acessíveis para cada Pin.
  function criarBotaoAcao(
    tipo,
    rotuloVisual,
    rotuloAcessivel,
    rotuloVisualSalvo
  ) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = `pin-action pin-action-${tipo}`;
    botao.dataset.acaoPin = tipo;
    botao.dataset.label = rotuloVisual;
    botao.setAttribute('aria-label', rotuloAcessivel);

    if (tipo === 'salvar') {
      botao.setAttribute('aria-pressed', 'false');
      botao.dataset.labelSalvo = rotuloVisualSalvo;
    }

    return botao;
  }

  // Prepara um card novo com área de imagem e ações, sem duplicar controles.
  function prepararCard(card, idsUtilizados) {
    garantirIdPin(card, idsUtilizados);
    const titulo = obterTituloPin(card);
    const imagem = card.querySelector('img');

    if (imagem && !imagem.parentElement.matches('.post-image')) {
      const areaImagem = document.createElement('div');
      areaImagem.className = 'post-image';
      imagem.before(areaImagem);
      areaImagem.appendChild(imagem);
    }

    const areaImagem = card.querySelector('.post-image') || card;

    if (!areaImagem.querySelector('.pin-actions')) {
      const acoes = document.createElement('div');
      acoes.className = 'pin-actions';
      acoes.setAttribute('role', 'group');
      acoes.setAttribute('aria-label', `Ações para ${titulo}`);

      acoes.appendChild(
        criarBotaoAcao(
          'salvar',
          'Salvar',
          `Salvar Pin: ${titulo}`,
          'Salvo'
        )
      );
      acoes.appendChild(
        criarBotaoAcao(
          'compartilhar',
          'Compartilhar',
          `Compartilhar Pin: ${titulo}`
        )
      );
      areaImagem.appendChild(acoes);
    }

    atualizarBotaoSalvar(card, pinsSalvos);
  }

  // Reflete no botão se o Pin está salvo, incluindo rótulos e estado acessível.
  function atualizarBotaoSalvar(card, pinsSalvos) {
    const botao = card.querySelector('.pin-action-salvar');
    if (!botao) {
      return;
    }

    const salvo = Boolean(pinsSalvos && pinsSalvos.has(card.dataset.pinId));
    botao.setAttribute('aria-pressed', String(salvo));
    botao.dataset.label = salvo
      ? botao.dataset.labelSalvo
      : 'Salvar';
    botao.setAttribute(
      'aria-label',
      salvo
        ? `Pin salvo: ${obterTituloPin(card)}`
        : `Salvar Pin: ${obterTituloPin(card)}`
    );
    botao.classList.toggle('pin-salvo', salvo);
  }

  // Cria o endereço compartilhável que aponta para o Pin específico.
  function criarUrlCompartilhamento(card) {
    const url = new URL(window.location.href);
    url.hash = `pin=${encodeURIComponent(card.dataset.pinId)}`;
    return url.href;
  }

  // Compartilha pela API do navegador ou copia o link quando ela não existe.
  async function compartilharPin(card, mensagemStatus) {
    const titulo = obterTituloPin(card);
    const descricao = card.querySelector('p');
    const url = criarUrlCompartilhamento(card);

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: titulo,
          text: descricao ? descricao.textContent.trim() : titulo,
          url
        });
        mensagemStatus.textContent = 'Pin compartilhado.';
      } catch (erro) {
        if (erro.name === 'AbortError') {
          mensagemStatus.textContent = 'Compartilhamento cancelado.';
          return;
        }

        console.error('Não foi possível compartilhar o Pin.', erro);
        mensagemStatus.textContent = 'Não foi possível compartilhar este Pin.';
      }

      return;
    }

    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      mensagemStatus.textContent =
        'O compartilhamento e a cópia de links não estão disponíveis neste navegador.';
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      mensagemStatus.textContent = 'Link do Pin copiado.';
    } catch (erro) {
      console.error('Não foi possível copiar o link do Pin.', erro);
      mensagemStatus.textContent =
        'Não foi possível copiar o link. Verifique as permissões do navegador.';
    }
  }

  // Registra interações uma vez no contêiner e observa cards inseridos depois.
  function configurarInteracoesPins() {
    const containerPins = document.querySelector('.postagens, #grade-pins');
    if (!containerPins) {
      return;
    }

    criarMensagemStatus(containerPins);
    const idsUtilizados = new Set();

    function prepararPins(elementos) {
      elementos.forEach((elemento) => {
        if (elemento instanceof Element && elemento.matches('.post')) {
          prepararCard(elemento, idsUtilizados);
        }
      });
    }

    prepararPins(Array.from(containerPins.querySelectorAll('.post')));

    const observador = new MutationObserver((mutacoes) => {
      mutacoes.forEach((mutacao) => {
        const novosCards = [];
        mutacao.addedNodes.forEach((no) => {
          if (no instanceof Element) {
            if (no.matches('.post')) {
              novosCards.push(no);
            }
            novosCards.push(...no.querySelectorAll('.post'));
          }
        });
        prepararPins(novosCards);
      });
    });

    observador.observe(containerPins, { childList: true, subtree: true });

    containerPins.addEventListener('click', (evento) => {
      if (!(evento.target instanceof Element)) {
        return;
      }

      const botao = evento.target.closest('button[data-acao-pin]');
      const card = botao && botao.closest('.post');
      if (!botao || !card || !containerPins.contains(card)) {
        return;
      }

      if (botao.dataset.acaoPin === 'salvar') {
        document.dispatchEvent(
          new CustomEvent('boards:save-request', {
            detail: { card }
          })
        );
        return;
      }

      if (botao.dataset.acaoPin === 'compartilhar') {
        compartilharPin(card, obterMensagemStatus(containerPins));
      }
    });

    document.addEventListener('boards:state-changed', (evento) => {
      pinsSalvos = new Set(evento.detail?.pinIds || []);
      Array.from(containerPins.querySelectorAll('.post')).forEach((card) => {
        atualizarBotaoSalvar(card, pinsSalvos);
      });
    });
  }

  // Usa a mesma região de status para confirmar o compartilhamento ao usuário.
  function obterMensagemStatus(containerPins) {
    return criarMensagemStatus(containerPins);
  }

  // Inicializa os controles após o HTML da página ser carregado.
  document.addEventListener('DOMContentLoaded', configurarInteracoesPins);
})();
