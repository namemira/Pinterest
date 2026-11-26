'use strict';

(() => {
  function configurarMuralPins() {
    const mural = document.querySelector('#feed[data-usuario-id]');
    const dialogoDenuncia = document.querySelector('#dialogo-denuncia-pin');
    if (!mural || !dialogoDenuncia) {
      return;
    }

    const chaveOcultos = `pinterest:pins-ocultos:${mural.dataset.usuarioId}:v1`;
    const estadoVazio = document.querySelector('#pin-mural-vazio');
    const estadoVazioInicial = document.querySelector('#estado-vazio-feed');
    const totalPins = Number(mural.dataset.totalPins) || 0;
    const campoPinDenunciado = dialogoDenuncia.querySelector('#denuncia-pin-id');
    const campoVoltar = dialogoDenuncia.querySelector('#denuncia-voltar');
    let pinsOcultos = new Set();
    let cartaoAtivo = null;
    let botaoMenuAtivo = null;
    let botaoDenunciaOrigem = null;
    let menuAberto = false;

    let status = document.querySelector('.pin-interaction-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'pin-interaction-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      mural.before(status);
    }

    function definirStatus(texto) {
      status.textContent = texto;
    }

    let quadroMasonry = 0;

    function medirAlturaMasonry() {
      if (quadroMasonry) {
        window.cancelAnimationFrame(quadroMasonry);
        quadroMasonry = 0;
      }

      const estilosMural = window.getComputedStyle(mural);
      const alturaLinha = Number.parseFloat(estilosMural.gridAutoRows);
      const espacoLinha = Number.parseFloat(estilosMural.rowGap) || 0;
      if (!Number.isFinite(alturaLinha) || alturaLinha <= 0) {
        return;
      }

      mural.querySelectorAll('.post[data-pin-id]').forEach((card) => {
        if (card.hidden) {
          card.style.gridRowEnd = 'span 1';
          return;
        }

        const alturaCard = card.offsetHeight || card.clientWidth || 1;
        const linhas = Math.max(
          1,
          Math.ceil((alturaCard + 1 + espacoLinha) / (alturaLinha + espacoLinha))
        );
        const fimLinha = `span ${linhas}`;
        if (card.style.gridRowEnd !== fimLinha) {
          card.style.gridRowEnd = fimLinha;
        }
      });
    }

    function atualizarAlturaMasonry() {
      if (quadroMasonry) {
        window.cancelAnimationFrame(quadroMasonry);
      }

      quadroMasonry = window.requestAnimationFrame(medirAlturaMasonry);
    }

    try {
      const dadosOcultos = window.localStorage.getItem(chaveOcultos);
      if (dadosOcultos !== null) {
        const ids = JSON.parse(dadosOcultos);
        if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
          throw new TypeError('A lista de Pins ocultos tem formato inválido.');
        }
        pinsOcultos = new Set(ids);
      }
    } catch (erro) {
      console.error('Não foi possível carregar os Pins ocultos.', erro);
      definirStatus('Não foi possível carregar a lista de Pins ocultos.');
    }

    function atualizarEstadoVazio() {
      const existePinVisivel = mural.querySelector('.post:not([hidden])') !== null;
      if (estadoVazioInicial) {
        estadoVazioInicial.hidden = totalPins > 0;
      }
      if (estadoVazio) {
        estadoVazio.hidden = totalPins === 0 || existePinVisivel;
      }
    }

    function aplicarPinsOcultos() {
      mural.querySelectorAll('.post[data-pin-id]').forEach((card) => {
        if (pinsOcultos.has(card.dataset.pinId)) {
          card.hidden = true;
        }
      });
      atualizarEstadoVazio();
      atualizarAlturaMasonry();
    }

    const menu = document.createElement('div');
    menu.className = 'pin-context-menu';
    menu.id = 'menu-opcoes-pin';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Mais opções para este Pin');
    menu.hidden = true;

    const botaoDenunciar = document.createElement('button');
    botaoDenunciar.type = 'button';
    botaoDenunciar.dataset.acaoMenuPin = 'denunciar';
    botaoDenunciar.setAttribute('role', 'menuitem');
    botaoDenunciar.textContent = 'Denunciar Pin';

    const botaoOcultar = document.createElement('button');
    botaoOcultar.type = 'button';
    botaoOcultar.dataset.acaoMenuPin = 'ocultar';
    botaoOcultar.setAttribute('role', 'menuitem');
    botaoOcultar.textContent = 'Ocultar Pin';

    const linkBaixar = document.createElement('a');
    linkBaixar.setAttribute('role', 'menuitem');
    linkBaixar.textContent = 'Baixar imagem';

    menu.append(botaoDenunciar, botaoOcultar, linkBaixar);
    document.body.appendChild(menu);

    function fecharMenu(devolverFoco = false) {
      if (menu.hidden) {
        return;
      }
      menu.hidden = true;
      menuAberto = false;
      botaoMenuAtivo?.setAttribute('aria-expanded', 'false');
      const botaoAnterior = botaoMenuAtivo;
      botaoMenuAtivo = null;
      cartaoAtivo = null;
      if (devolverFoco && botaoAnterior?.isConnected) {
        botaoAnterior.focus({ preventScroll: true });
      }
    }

    function abrirMenu(botao, card) {
      if (botaoMenuAtivo === botao && menuAberto) {
        fecharMenu();
        return;
      }
      fecharMenu();

      cartaoAtivo = card;
      botaoMenuAtivo = botao;
      botao.setAttribute('aria-expanded', 'true');
      linkBaixar.href = card.dataset.pinImagem;

      const urlImagem = new URL(linkBaixar.href, document.baseURI);
      const extensao = urlImagem.pathname.match(/\.([a-z0-9]+)$/i)?.[1] || 'jpg';
      linkBaixar.download = `pin-${card.dataset.pinId}.${extensao}`;

      menu.hidden = false;
      menuAberto = true;
      const botaoRect = botao.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const margem = 12;
      const left = Math.max(
        margem,
        Math.min(
          botaoRect.left,
          window.innerWidth - menuRect.width - margem
        )
      );
      let top = botaoRect.bottom + 8;
      if (top + menuRect.height > window.innerHeight - margem) {
        top = botaoRect.top - menuRect.height - 8;
      }
      top = Math.max(margem, Math.min(top, window.innerHeight - menuRect.height - margem));
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      botaoDenunciar.focus({ preventScroll: true });
    }

    function ocultarPin() {
      if (!cartaoAtivo) {
        fecharMenu();
        return;
      }

      const idPin = cartaoAtivo.dataset.pinId;
      pinsOcultos.add(idPin);
      let armazenamentoDisponivel = true;
      try {
        window.localStorage.setItem(chaveOcultos, JSON.stringify([...pinsOcultos]));
      } catch (erro) {
        armazenamentoDisponivel = false;
        console.error('Não foi possível salvar o estado dos Pins ocultos.', erro);
      }
      cartaoAtivo.remove();
      fecharMenu();
      atualizarEstadoVazio();
      atualizarAlturaMasonry();
      definirStatus(
        armazenamentoDisponivel
          ? 'Pin ocultado.'
          : 'Pin ocultado nesta página, mas não foi possível guardar essa preferência.'
      );
    }

    function abrirFormularioDenuncia() {
      if (!cartaoAtivo || !campoPinDenunciado || !campoVoltar) {
        fecharMenu();
        return;
      }

      campoPinDenunciado.value = cartaoAtivo.dataset.pinId;
      campoVoltar.value = `principal.php#pin-${cartaoAtivo.dataset.pinId}`;
      botaoDenunciaOrigem = botaoMenuAtivo;
      fecharMenu();
      dialogoDenuncia.showModal();
      dialogoDenuncia.querySelector('#denuncia-motivo')?.focus();
    }

    aplicarPinsOcultos();

    mural.querySelectorAll('.post img').forEach((imagem) => {
      imagem.addEventListener('load', atualizarAlturaMasonry);
      imagem.addEventListener('error', atualizarAlturaMasonry);
    });

    let larguraMural = mural.clientWidth;
    if ('ResizeObserver' in window) {
      const observadorMasonry = new ResizeObserver((entradas) => {
        let atualizarMasonry = false;
        entradas.forEach((entrada) => {
          if (entrada.target === mural) {
            const novaLargura = entrada.contentRect.width;
            if (Math.abs(novaLargura - larguraMural) > 1) {
              larguraMural = novaLargura;
              atualizarMasonry = true;
            }
          } else {
            atualizarMasonry = true;
          }
        });
        if (atualizarMasonry) {
          medirAlturaMasonry();
        }
      });
      observadorMasonry.observe(mural);
      mural.querySelectorAll('.post[data-pin-id]').forEach((card) => {
        observadorMasonry.observe(card);
      });
    }
    window.addEventListener('resize', atualizarAlturaMasonry, { passive: true });

    mural.addEventListener('click', (evento) => {
      if (!(evento.target instanceof Element)) {
        return;
      }

      const botaoMenu = evento.target.closest('[data-menu-pin]');
      const card = botaoMenu?.closest('.post');
      if (botaoMenu && card && mural.contains(card)) {
        abrirMenu(botaoMenu, card);
      }
    });

    menu.addEventListener('click', (evento) => {
      if (!(evento.target instanceof Element)) {
        return;
      }
      const acao = evento.target.closest('[data-acao-menu-pin]')?.dataset.acaoMenuPin;
      if (acao === 'denunciar') {
        abrirFormularioDenuncia();
      } else if (acao === 'ocultar') {
        ocultarPin();
      } else if (evento.target.closest('a[role="menuitem"]')) {
        fecharMenu();
      }
    });

    document.addEventListener('click', (evento) => {
      if (
        menuAberto &&
        evento.target instanceof Node &&
        !menu.contains(evento.target) &&
        !botaoMenuAtivo?.contains(evento.target)
      ) {
        fecharMenu();
      }
    });

    document.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape' && menuAberto) {
        evento.preventDefault();
        fecharMenu(true);
      }
    });

    document
      .querySelector('[data-fechar-denuncia]')
      ?.addEventListener('click', () => dialogoDenuncia.close());

    dialogoDenuncia.addEventListener('click', (evento) => {
      if (evento.target === dialogoDenuncia) {
        dialogoDenuncia.close();
      }
    });

    dialogoDenuncia.addEventListener('close', () => {
      if (botaoDenunciaOrigem?.isConnected) {
        botaoDenunciaOrigem.focus({ preventScroll: true });
      }
      botaoDenunciaOrigem = null;
    });

    window.addEventListener('resize', () => fecharMenu());
    window.addEventListener('scroll', () => fecharMenu(), true);
  }

  document.addEventListener('DOMContentLoaded', configurarMuralPins);
})();
