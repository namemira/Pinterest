'use strict';

(() => {
  const TAMANHO_MAXIMO = 10 * 1024 * 1024;
  const TIPOS_PERMITIDOS = new Map([
    ['jpg', 'image/jpeg'],
    ['jpeg', 'image/jpeg'],
    ['png', 'image/png'],
    ['webp', 'image/webp']
  ]);
  function configurarCriacaoPin() {
    const paginaCriacao = document.querySelector('#pagina-criar-pin');
    const paginaPastas = document.querySelector('#pagina-pastas');
    const conteudoPins = document.querySelector('#conteudo-pins');
    const feed = document.querySelector('.postagens');
    const formulario = document.querySelector('#formulario-criar-pin');
    const dropzone = document.querySelector('#criar-pin-soltar');
    const campoArquivo = document.querySelector('#criar-pin-arquivo');
    const previa = document.querySelector('#criar-pin-previa');
    const imagemPrevia = document.querySelector('#criar-pin-imagem');
    const acoesImagem = document.querySelector('#criar-pin-imagem-acoes');
    const campoTitulo = document.querySelector('#criar-pin-titulo');
    const campoDescricao = document.querySelector('#criar-pin-descricao');
    const campoLink = document.querySelector('#criar-pin-link');
    const campoPasta = document.querySelector('#criar-pin-pasta');
    const mensagem = document.querySelector('#criar-pin-mensagem');
    const botoesPublicar = Array.from(
      document.querySelectorAll('.criar-pin-publicar, .criar-pin-publicar-topo')
    );

    if (
      !paginaCriacao ||
      !feed ||
      !formulario ||
      !dropzone ||
      !campoArquivo ||
      !previa ||
      !imagemPrevia ||
      !acoesImagem ||
      !campoTitulo ||
      !campoDescricao ||
      !campoLink ||
      !campoPasta ||
      !mensagem
    ) {
      return;
    }

    let arquivoSelecionado = null;
    let urlPrevia = '';
    let feedbackFeed = document.querySelector('.criar-pin-feedback-feed');
    if (!feedbackFeed) {
      feedbackFeed = document.createElement('p');
      feedbackFeed.className = 'criar-pin-feedback-feed';
      feedbackFeed.setAttribute('role', 'status');
      feedbackFeed.setAttribute('aria-live', 'polite');
      feed.before(feedbackFeed);
    }

    function definirMensagem(texto, tipo = '') {
      mensagem.textContent = texto;
      mensagem.classList.toggle('criar-pin-mensagem-erro', tipo === 'erro');
      mensagem.classList.toggle('criar-pin-mensagem-sucesso', tipo === 'sucesso');
    }

    function formularioValido() {
      return Boolean(
        arquivoSelecionado &&
          campoTitulo.value.trim() &&
          campoTitulo.validity.valid &&
          (!campoLink.value.trim() || campoLink.validity.valid)
      );
    }

    function atualizarBotaoPublicar() {
      const desabilitado = !formularioValido();
      botoesPublicar.forEach((botao) => {
        botao.disabled = desabilitado;
      });
    }

    function limparPrevia(revogarUrl = true) {
      if (revogarUrl && urlPrevia) {
        URL.revokeObjectURL(urlPrevia);
      }
      urlPrevia = '';
      arquivoSelecionado = null;
      imagemPrevia.removeAttribute('src');
      previa.hidden = true;
      acoesImagem.hidden = true;
      dropzone.classList.remove('criar-pin-soltar-com-imagem');
      atualizarBotaoPublicar();
    }

    function validarArquivo(arquivo) {
      const extensao = arquivo.name.split('.').pop().toLowerCase();
      const tipoEsperado = TIPOS_PERMITIDOS.get(extensao);
      if (
        !tipoEsperado ||
        (arquivo.type && arquivo.type !== tipoEsperado)
      ) {
        definirMensagem(
          'Formato inválido. Escolha um arquivo JPG, JPEG, PNG ou WEBP.',
          'erro'
        );
        return false;
      }

      if (arquivo.size > TAMANHO_MAXIMO) {
        definirMensagem('A imagem deve ter no máximo 10 MB.', 'erro');
        return false;
      }

      return true;
    }

    function selecionarArquivo(arquivo) {
      if (!arquivo) {
        return;
      }
      if (!validarArquivo(arquivo)) {
        atualizarBotaoPublicar();
        return;
      }

      if (urlPrevia) {
        URL.revokeObjectURL(urlPrevia);
      }
      arquivoSelecionado = arquivo;
      urlPrevia = URL.createObjectURL(arquivo);
      imagemPrevia.src = urlPrevia;
      previa.hidden = false;
      acoesImagem.hidden = false;
      dropzone.classList.add('criar-pin-soltar-com-imagem');
      definirMensagem('');
      atualizarBotaoPublicar();
    }

    function atualizarOpcoesPastas() {
      const pastaSelecionada = campoPasta.value;
      campoPasta.replaceChildren();

      const opcaoSemPasta = document.createElement('option');
      opcaoSemPasta.value = '';
      opcaoSemPasta.textContent = 'Não organizar em uma pasta';
      campoPasta.appendChild(opcaoSemPasta);

      const pastas = window.pinterestBoards?.listarPastas();
      if (!pastas) {
        return;
      }

      pastas.forEach((pasta) => {
        const opcao = document.createElement('option');
        opcao.value = pasta.id;
        opcao.textContent = pasta.nome;
        campoPasta.appendChild(opcao);
      });

      if (pastas.some((pasta) => pasta.id === pastaSelecionada)) {
        campoPasta.value = pastaSelecionada;
      }
    }

    function abrirTelaCriacao() {
      paginaCriacao.hidden = false;
      if (paginaPastas) {
        paginaPastas.hidden = true;
      }
      if (conteudoPins) {
        conteudoPins.hidden = true;
      } else {
        feed.hidden = true;
      }
      atualizarOpcoesPastas();
      campoTitulo.focus();
    }

    function voltarAoFeed() {
      paginaCriacao.hidden = true;
      document.dispatchEvent(new CustomEvent('boards:home'));
      document.dispatchEvent(new CustomEvent('pins:create-closed'));
    }

    function limparFormulario(revogarUrlPrevia = true) {
      formulario.reset();
      limparPrevia(revogarUrlPrevia);
      atualizarOpcoesPastas();
      definirMensagem('');
      atualizarBotaoPublicar();
    }

    function obterIdPin() {
      const aleatorio =
        window.crypto && typeof window.crypto.randomUUID === 'function'
          ? window.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      return `pin-demo-${aleatorio}`;
    }

    function converterArquivoParaDataUrl(arquivo) {
      return new Promise((resolver, rejeitar) => {
        const leitor = new FileReader();
        leitor.addEventListener('load', () => {
          if (typeof leitor.result === 'string') {
            resolver(leitor.result);
          } else {
            rejeitar(new TypeError('Não foi possível ler a imagem selecionada.'));
          }
        });
        leitor.addEventListener('error', () => {
          rejeitar(leitor.error || new Error('Não foi possível ler a imagem selecionada.'));
        });
        leitor.readAsDataURL(arquivo);
      });
    }

    dropzone.addEventListener('click', (evento) => {
      if (evento.target instanceof Element && evento.target.closest('button')) {
        return;
      }
      campoArquivo.click();
    });

    dropzone.addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter' || evento.key === ' ') {
        evento.preventDefault();
        campoArquivo.click();
      }
    });

    campoArquivo.addEventListener('change', () => {
      selecionarArquivo(campoArquivo.files[0]);
      campoArquivo.value = '';
    });

    dropzone.addEventListener('dragover', (evento) => {
      evento.preventDefault();
      dropzone.classList.add('criar-pin-soltar-destacado');
    });

    dropzone.addEventListener('dragleave', (evento) => {
      if (!dropzone.contains(evento.relatedTarget)) {
        dropzone.classList.remove('criar-pin-soltar-destacado');
      }
    });

    dropzone.addEventListener('drop', (evento) => {
      evento.preventDefault();
      dropzone.classList.remove('criar-pin-soltar-destacado');
      selecionarArquivo(evento.dataTransfer.files[0]);
    });

    document
      .querySelector('.criar-pin-substituir')
      ?.addEventListener('click', () => campoArquivo.click());

    document
      .querySelector('.criar-pin-remover')
      ?.addEventListener('click', () => {
        limparPrevia();
        definirMensagem('Imagem removida.');
      });

    formulario.addEventListener('input', () => {
      if (mensagem.textContent) {
        definirMensagem('');
      }
      atualizarBotaoPublicar();
    });

    formulario.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      if (!arquivoSelecionado) {
        definirMensagem('Selecione uma imagem para o Pin.', 'erro');
        dropzone.focus();
        return;
      }
      if (!campoTitulo.value.trim()) {
        definirMensagem('Informe um título para o Pin.', 'erro');
        campoTitulo.focus();
        return;
      }
      if (!campoLink.validity.valid) {
        definirMensagem('Informe um link de destino válido.', 'erro');
        campoLink.focus();
        return;
      }

      const link = campoLink.value.trim();
      if (link) {
        try {
          const url = new URL(link);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            throw new TypeError('Protocolo de link inválido.');
          }
        } catch (erro) {
          definirMensagem('Use um endereço iniciado por http:// ou https://.', 'erro');
          campoLink.focus();
          return;
        }
      }

      const sistemaPins = window.pinterestPins;
      if (
        !sistemaPins ||
        typeof sistemaPins.criarCardPin !== 'function' ||
        typeof sistemaPins.adicionarPin !== 'function'
      ) {
        definirMensagem(
          'Não foi possível preparar o Pin. Recarregue a página e tente novamente.',
          'erro'
        );
        return;
      }

      const pin = {
        id: obterIdPin(),
        imagem: '',
        alt: campoTitulo.value.trim(),
        titulo: campoTitulo.value.trim(),
        descricao: campoDescricao.value.trim(),
        categoria: '',
        link
      };
      const pastaId = campoPasta.value;
      const sistemaPastas = window.pinterestBoards;
      try {
        pin.imagem = await converterArquivoParaDataUrl(arquivoSelecionado);
        if (!pastaId) {
          sistemaPins.adicionarPin(pin);
        }
      } catch (erro) {
        console.error('Não foi possível salvar o Pin no navegador.', erro);
        definirMensagem(
          'Não foi possível salvar o Pin neste navegador. Verifique o espaço disponível e tente novamente.',
          'erro'
        );
        return;
      }

      if (
        (pastaId && !sistemaPastas) ||
        (sistemaPastas &&
          !sistemaPastas.adicionarPinDemonstrativo(pin, pastaId))
      ) {
        try {
          sistemaPins.removerPin(pin.id);
        } catch (erro) {
          console.error('Não foi possível desfazer o salvamento do Pin.', erro);
        }
        definirMensagem(
          'Não foi possível organizar este Pin na pasta selecionada.',
          'erro'
        );
        return;
      }

      const card = sistemaPins.criarCardPin(pin);
      feed.prepend(card);
      document.dispatchEvent(new CustomEvent('pins:updated'));
      const resultado = pastaId
        ? 'Pin publicado e adicionado à pasta selecionada.'
        : 'Pin publicado. Ele está salvo neste navegador.';
      definirMensagem(resultado, 'sucesso');
      feedbackFeed.textContent = resultado;
      limparFormulario();
      voltarAoFeed();
    });

    document
      .querySelector('.criar-pin-cancelar')
      ?.addEventListener('click', () => {
        limparFormulario();
        voltarAoFeed();
      });

    document.addEventListener('pins:create-open', abrirTelaCriacao);
    document.addEventListener('boards:home', () => {
      paginaCriacao.hidden = true;
    });
    document.addEventListener('boards:state-changed', atualizarOpcoesPastas);
    window.addEventListener('beforeunload', () => {
      if (urlPrevia) {
        URL.revokeObjectURL(urlPrevia);
      }
    });

    atualizarOpcoesPastas();
    atualizarBotaoPublicar();
  }

  document.addEventListener('DOMContentLoaded', configurarCriacaoPin);
})();
