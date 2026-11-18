'use strict';

(() => {
  // Armazena colagens e cartões em chaves distintas no localStorage.
  const CHAVES_CRIACOES = {
    colagem: 'pinterest:colagens:v1',
    cartao: 'pinterest:cartoes:v1'
  };

  // Configura a interface de composição exclusiva da página Principal.
  function configurarMenusPrincipal() {
    const dialogoCriacao = document.querySelector('#dialogo-criacao');

    if (!dialogoCriacao) {
      return;
    }

    const formularioComposicao = document.querySelector(
      '#formulario-composicao'
    );
    const tituloComposicao = document.querySelector('#dialogo-criacao-titulo');
    const instrucaoComposicao = document.querySelector(
      '#dialogo-criacao-instrucao'
    );
    const seletorPins = document.querySelector('#composicao-pins');
    const botaoAdicionar = document.querySelector('#composicao-adicionar');
    const campoMensagem = document.querySelector('#composicao-mensagem');
    const rotuloMensagem = document.querySelector(
      '.composicao-mensagem-campo'
    );
    const gradePrevia = document.querySelector('#composicao-previa-grade');
    const statusComposicao = document.querySelector('#composicao-status');
    const botaoFinalizar = document.querySelector('#composicao-finalizar');

    let tipoComposicao = 'colagem';
    let pinIdsSelecionados = [];
    let composicaoFinalizada = false;

    // Obtém os Pins atuais pela API compartilhada e garante IDs para exemplos.
    function obterPinsDisponiveis() {
      const pins = window.pinterestPins?.listarPins();
      if (!Array.isArray(pins)) {
        return [];
      }

      return pins
        .filter((pin) => pin && pin.imagem)
        .map((pin) => ({
          ...pin,
          id:
            pin.id ||
            `pin-exemplo-${encodeURIComponent(
              `${pin.imagem}|${pin.titulo || pin.alt || 'pin'}`
            )}`
        }));
    }

    function obterPinPorId(id) {
      return obterPinsDisponiveis().find((pin) => pin.id === id);
    }

    // Atualiza a mensagem e o estilo de estado da interface de composição.
    function definirStatusComposicao(texto, erro = false) {
      statusComposicao.textContent = texto;
      statusComposicao.classList.toggle('composicao-status-erro', erro);
      statusComposicao.classList.toggle('composicao-status-sucesso', !erro && Boolean(texto));
    }

    // Preenche o seletor de Pins e bloqueia ações quando não há itens disponíveis.
    function renderizarPinsDisponiveis() {
      seletorPins.replaceChildren();
      const pins = obterPinsDisponiveis();
      pins.forEach((pin) => {
        const opcao = document.createElement('option');
        opcao.value = pin.id;
        opcao.textContent = pin.titulo || pin.alt || 'Pin';
        seletorPins.appendChild(opcao);
      });

      botaoAdicionar.disabled = pins.length === 0;
      botaoFinalizar.disabled = pins.length === 0;
      if (pins.length === 0) {
        definirStatusComposicao(
          'Não há Pins disponíveis para compor. Adicione um Pin primeiro.',
          true
        );
      }
    }

    // Desenha a prévia selecionada; cartões também mostram a mensagem digitada.
    function renderizarPrevia() {
      gradePrevia.replaceChildren();
      if (pinIdsSelecionados.length === 0) {
        const vazio = document.createElement('p');
        vazio.className = 'composicao-vazia';
        vazio.textContent =
          tipoComposicao === 'cartao'
            ? 'Escolha um Pin para pré-visualizar seu cartão.'
            : 'Adicione Pins para visualizar sua colagem.';
        gradePrevia.appendChild(vazio);
        return;
      }

      pinIdsSelecionados.forEach((id) => {
        const pin = obterPinPorId(id);
        if (!pin) {
          return;
        }

        const item = document.createElement('article');
        item.className =
          tipoComposicao === 'cartao'
            ? 'composicao-item composicao-item-cartao'
            : 'composicao-item';
        const imagem = document.createElement('img');
        imagem.src = pin.imagem;
        imagem.alt = pin.alt || pin.titulo || 'Pin selecionado';
        const titulo = document.createElement('span');
        titulo.textContent = pin.titulo || pin.alt || 'Pin';
        item.append(imagem, titulo);

        if (tipoComposicao === 'cartao') {
          const mensagem = document.createElement('p');
          mensagem.className = 'composicao-cartao-mensagem';
          mensagem.textContent =
            campoMensagem.value.trim() || 'Sua mensagem aparecerá aqui.';
          item.appendChild(mensagem);
        }

        const remover = document.createElement('button');
        remover.type = 'button';
        remover.className = 'composicao-remover';
        remover.textContent = 'Remover';
        remover.setAttribute(
          'aria-label',
          `Remover ${pin.titulo || pin.alt || 'Pin'} da pré-visualização`
        );
        remover.addEventListener('click', () => {
          pinIdsSelecionados = pinIdsSelecionados.filter(
            (pinId) => pinId !== id
          );
          composicaoFinalizada = false;
          botaoFinalizar.disabled = false;
          botaoFinalizar.textContent =
            tipoComposicao === 'cartao'
              ? 'Finalizar cartão'
              : 'Finalizar colagem';
          renderizarPrevia();
          definirStatusComposicao('');
        });
        item.appendChild(remover);
        gradePrevia.appendChild(item);
      });
    }

    // Prepara a mesma interface para os modos Colagem e Cartão.
    function abrirComposicao(tipo) {
      tipoComposicao = tipo;
      pinIdsSelecionados = [];
      composicaoFinalizada = false;
      formularioComposicao.reset();
      seletorPins.disabled = false;
      campoMensagem.disabled = false;
      tituloComposicao.textContent =
        tipo === 'cartao' ? 'Criar cartão' : 'Criar colagem';
      instrucaoComposicao.textContent =
        tipo === 'cartao'
          ? 'Escolha um Pin e escreva uma mensagem para a pré-visualização.'
          : 'Escolha Pins disponíveis para montar sua composição.';
      seletorPins.multiple = tipo === 'colagem';
      seletorPins.size = tipo === 'colagem' ? 4 : 1;
      campoMensagem.hidden = tipo !== 'cartao';
      rotuloMensagem.hidden = tipo !== 'cartao';
      botaoAdicionar.textContent =
        tipo === 'cartao' ? 'Usar este Pin' : 'Adicionar à colagem';
      botaoFinalizar.textContent =
        tipo === 'cartao' ? 'Finalizar cartão' : 'Finalizar colagem';
      definirStatusComposicao('');
      renderizarPinsDisponiveis();
      renderizarPrevia();
      dialogoCriacao.showModal();
      seletorPins.focus();
    }

    botaoAdicionar.addEventListener('click', () => {
      const ids = Array.from(seletorPins.selectedOptions, (opcao) => opcao.value);
      if (ids.length === 0) {
        definirStatusComposicao('Selecione pelo menos um Pin.', true);
        seletorPins.focus();
        return;
      }

      if (tipoComposicao === 'cartao') {
        pinIdsSelecionados = [ids[0]];
      } else {
        pinIdsSelecionados = [
          ...new Set([...pinIdsSelecionados, ...ids])
        ];
      }
      composicaoFinalizada = false;
      botaoFinalizar.disabled = false;
      botaoFinalizar.textContent =
        tipoComposicao === 'cartao'
          ? 'Finalizar cartão'
          : 'Finalizar colagem';
      renderizarPrevia();
      definirStatusComposicao(
        tipoComposicao === 'cartao'
          ? 'Pin adicionado à pré-visualização do cartão.'
          : `${pinIdsSelecionados.length} Pin(s) na pré-visualização.`
      );
    });

    campoMensagem.addEventListener('input', () => {
      if (tipoComposicao === 'cartao') {
        renderizarPrevia();
      }
    });

    // Salva uma composição no navegador sem publicá-la nem enviá-la a terceiros.
    function salvarComposicao() {
      if (pinIdsSelecionados.length === 0) {
        definirStatusComposicao(
          tipoComposicao === 'cartao'
            ? 'Escolha um Pin para o cartão.'
            : 'Adicione pelo menos um Pin à colagem.',
          true
        );
        seletorPins.focus();
        return;
      }

      if (composicaoFinalizada) {
        return;
      }

      const chave = CHAVES_CRIACOES[tipoComposicao];
      try {
        const conteudo = window.localStorage.getItem(chave);
        const salvos = conteudo === null ? [] : JSON.parse(conteudo);
        if (!Array.isArray(salvos)) {
          throw new TypeError('Os dados salvos têm um formato inválido.');
        }

        const item = {
          id: `${tipoComposicao}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`,
          criadaEm: new Date().toISOString(),
          pinIds: [...pinIdsSelecionados]
        };
        if (tipoComposicao === 'cartao') {
          item.mensagem = campoMensagem.value.trim();
        }

        window.localStorage.setItem(chave, JSON.stringify([...salvos, item]));
        composicaoFinalizada = true;
        seletorPins.disabled = true;
        botaoAdicionar.disabled = true;
        campoMensagem.disabled = true;
        gradePrevia
          .querySelectorAll('.composicao-remover')
          .forEach((botao) => {
            botao.disabled = true;
          });
        botaoFinalizar.disabled = true;
        botaoFinalizar.textContent = 'Criada';
        definirStatusComposicao(
          tipoComposicao === 'cartao'
            ? 'Cartão salvo neste navegador. Ele não foi enviado a ninguém.'
            : 'Colagem salva neste navegador. Ela não foi publicada.'
        );
      } catch (erro) {
        console.error('Não foi possível salvar a criação no navegador.', erro);
        definirStatusComposicao(
          'Não foi possível salvar. Verifique o espaço e as permissões do navegador.',
          true
        );
      }
    }

    formularioComposicao.addEventListener('submit', (evento) => {
      evento.preventDefault();
      salvarComposicao();
    });

    // Fecha a interface de composição quando o usuário cancela ou conclui.
    function fecharComposicao() {
      if (dialogoCriacao.open) {
        dialogoCriacao.close();
      }
    }

    // Conecta fechamento, clique no fundo e o evento compartilhado do painel Criar.
    dialogoCriacao
      .querySelectorAll('[data-fechar-composicao]')
      .forEach((botao) => botao.addEventListener('click', fecharComposicao));
    dialogoCriacao.addEventListener('click', (evento) => {
      if (evento.target === dialogoCriacao) {
        fecharComposicao();
      }
    });
    document.addEventListener('composicao:abrir', (evento) => {
      const tipo = evento.detail?.tipo;
      if (tipo === 'colagem' || tipo === 'cartao') {
        abrirComposicao(tipo);
      }
    });

    // Permite abrir diretamente uma composição após o encaminhamento entre páginas.
    const tipoCriacaoInicial = new URLSearchParams(
      window.location.search
    ).get('criar');
    if (tipoCriacaoInicial === 'colagem' || tipoCriacaoInicial === 'cartao') {
      abrirComposicao(tipoCriacaoInicial);
    }
  }

  document.addEventListener('DOMContentLoaded', configurarMenusPrincipal);
})();
