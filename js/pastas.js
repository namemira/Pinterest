'use strict';

(() => {
  const CHAVE_PASTAS = 'pinterest:pastas:v1';
  const CHAVE_PINS_ANTIGOS = 'pinterest:pins-salvos:v1';
  const NOME_PASTA_ANTIGA = 'Salvos';
  let pinsTemporariosNaoOrganizados = [];

  function criarId(prefixo) {
    const aleatorio =
      window.crypto && typeof window.crypto.randomUUID === 'function'
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return `${prefixo}-${aleatorio}`;
  }

  function criarRepositorio() {
    return {
      carregar() {
        const conteudo = window.localStorage.getItem(CHAVE_PASTAS);
        if (conteudo === null) {
          return [];
        }

        const dados = JSON.parse(conteudo);
        if (
          !dados ||
          dados.versao !== 1 ||
          !Array.isArray(dados.pastas) ||
          dados.pastas.some(
            (pasta) =>
              !pasta ||
              typeof pasta.id !== 'string' ||
              typeof pasta.nome !== 'string' ||
              typeof pasta.descricao !== 'string' ||
              !Array.isArray(pasta.pins) ||
              pasta.pins.some(
                (pin) => !pin || typeof pin.id !== 'string'
              )
          )
        ) {
          throw new TypeError('Os dados das pastas têm um formato inválido.');
        }

        return dados.pastas;
      },
      salvar(pastas) {
        window.localStorage.setItem(
          CHAVE_PASTAS,
          JSON.stringify({
            versao: 1,
            pastas: pastas.map((pasta) => ({
              ...pasta,
              pins: pasta.pins.filter((pin) => pin.temporario !== true)
            }))
          })
        );
      }
    };
  }

  function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) {
      elemento.className = classe;
    }
    if (texto !== undefined) {
      elemento.textContent = texto;
    }
    return elemento;
  }

  function obterDadosPin(card) {
    const imagem = card.querySelector('img');
    const titulo = card.querySelector('h2, h3, [data-pin-titulo]');
    const paragrafos = Array.from(card.querySelectorAll('p'));
    const paragrafoCategoria = paragrafos.find((paragrafo) =>
      /^categoria\s*:/i.test(paragrafo.textContent.trim())
    );
    const descricao = paragrafos.find(
      (paragrafo) => paragrafo !== paragrafoCategoria
    );

    return {
      id: card.dataset.pinId,
      imagem: imagem ? imagem.getAttribute('src') || '' : '',
      alt: imagem ? imagem.alt : '',
      titulo: titulo
        ? titulo.textContent.trim()
        : imagem && imagem.alt.trim()
          ? imagem.alt.trim()
          : 'Pin',
      descricao: descricao ? descricao.textContent.trim() : '',
      categoria: paragrafoCategoria
        ? paragrafoCategoria.textContent
            .trim()
            .replace(/^categoria\s*:\s*/i, '')
        : '',
      link: card.dataset.pinLink || ''
    };
  }

  function configurarPastas() {
    const containerPins = document.querySelector('.postagens');
    if (!containerPins) {
      return;
    }

    const repositorio = criarRepositorio();
    let pastas = [];
    let pinParaSalvar = null;
    let pastaAbertaId = null;
    let pastaAExcluirId = null;
    let pastaPaginaAbertaId = null;
    let pastaPaginaExcluirId = null;
    let filtroPastas = 'todas';
    let modoDialogo = 'salvar';
    let erroArmazenamento = '';

    const paginaPastas = document.querySelector('#pagina-pastas');
    const feedPins = containerPins;
    const conteudoPins = document.querySelector('#conteudo-pins');
    const gradePastas = document.querySelector('#pastas-grade');
    const detalhePaginaPastas = document.querySelector('#pastas-detalhe-pagina');
    const estadoVazioPastas = document.querySelector('#pastas-vazio-pagina');
    const mensagemPaginaPastas = document.querySelector(
      '#pastas-pagina-mensagem'
    );
    const abaPins = document.querySelector('#aba-perfil-pins');
    const abaPastas = document.querySelector('#aba-perfil-pastas');
    const conteudoPastas = document.querySelector('#conteudo-pastas');
    const statusPerfil = document.querySelector('.perfil-pastas-status');

    const dialogo = document.createElement('dialog');
    dialogo.className = 'pastas-dialogo';
    dialogo.setAttribute('aria-labelledby', 'pastas-titulo');

    const conteudo = criarElemento('div', 'pastas-conteudo');
    const cabecalho = criarElemento('header', 'pastas-cabecalho');
    const titulo = criarElemento('h2', '', 'Minhas pastas');
    titulo.id = 'pastas-titulo';
    const botaoFechar = criarElemento('button', 'pastas-fechar', 'Fechar');
    botaoFechar.type = 'button';
    botaoFechar.setAttribute('aria-label', 'Fechar pastas');
    cabecalho.append(titulo, botaoFechar);
    const botaoCancelar = criarElemento('button', '', 'Cancelar');
    botaoCancelar.type = 'button';
    botaoCancelar.className = 'pastas-cancelar';

    const status = criarElemento('p', 'pastas-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    const formulario = document.createElement('form');
    formulario.className = 'pastas-formulario';
    const rotuloNome = criarElemento('label', '', 'Nome da pasta');
    const campoNome = document.createElement('input');
    campoNome.type = 'text';
    campoNome.name = 'nome';
    campoNome.maxLength = 80;
    campoNome.required = true;
    campoNome.autocomplete = 'off';
    rotuloNome.appendChild(campoNome);

    const rotuloDescricao = criarElemento('label', '', 'Descrição (opcional)');
    const campoDescricao = document.createElement('textarea');
    campoDescricao.name = 'descricao';
    campoDescricao.maxLength = 300;
    rotuloDescricao.appendChild(campoDescricao);

    const botaoCriar = criarElemento('button', 'pastas-criar', 'Criar pasta');
    botaoCriar.type = 'submit';
    formulario.append(
      rotuloNome,
      rotuloDescricao,
      criarElemento('div', 'pastas-formulario-acoes')
    );
    formulario.querySelector('.pastas-formulario-acoes').append(
      botaoCancelar,
      botaoCriar
    );

    const listaPastas = criarElemento('ul', 'pastas-lista');
    const detalhePasta = criarElemento('section', 'pastas-detalhe');
    detalhePasta.hidden = true;

    const confirmacao = criarElemento('section', 'pastas-confirmacao');
    confirmacao.hidden = true;
    confirmacao.setAttribute('aria-labelledby', 'pastas-confirmacao-titulo');
    const tituloConfirmacao = criarElemento(
      'h3',
      '',
      'Excluir esta pasta?'
    );
    tituloConfirmacao.id = 'pastas-confirmacao-titulo';
    const textoConfirmacao = criarElemento(
      'p',
      '',
      'Os Pins associados também serão removidos desta pasta.'
    );
    const botaoCancelarExclusao = criarElemento(
      'button',
      '',
      'Cancelar'
    );
    botaoCancelarExclusao.type = 'button';
    botaoCancelarExclusao.dataset.acaoPasta = 'cancelar-exclusao';
    const botaoConfirmarExclusao = criarElemento(
      'button',
      'pastas-excluir-confirmar',
      'Excluir pasta'
    );
    botaoConfirmarExclusao.type = 'button';
    botaoConfirmarExclusao.dataset.acaoPasta = 'confirmar-exclusao';
    confirmacao.append(
      tituloConfirmacao,
      textoConfirmacao,
      botaoCancelarExclusao,
      botaoConfirmarExclusao
    );

    conteudo.append(
      cabecalho,
      status,
      formulario,
      listaPastas,
      detalhePasta,
      confirmacao
    );
    dialogo.appendChild(conteudo);
    document.body.appendChild(dialogo);

    function definirStatus(mensagem, erro = false) {
      status.textContent = mensagem;
      status.classList.toggle('pastas-status-erro', erro);
    }

    function listarIdsSalvos() {
      return [
        ...new Set(
          pastas.flatMap((pasta) => pasta.pins.map((pin) => pin.id))
        )
      ];
    }

    function notificarEstado() {
      document.dispatchEvent(
        new CustomEvent('boards:state-changed', {
          detail: { pinIds: listarIdsSalvos() }
        })
      );
    }

    function persistir() {
      try {
        repositorio.salvar(pastas);
        erroArmazenamento = '';
        notificarEstado();
        renderizarPaginaPastas();
        return true;
      } catch (erro) {
        console.error('Não foi possível salvar as pastas.', erro);
        erroArmazenamento =
          'Não foi possível salvar no navegador. Verifique o espaço e as permissões de armazenamento.';
        definirStatus(erroArmazenamento, true);
        return false;
      }
    }

    function localizarPasta(id) {
      return pastas.find((pasta) => pasta.id === id);
    }

    function definirAbaPerfil(aba) {
      if (!paginaPastas || !abaPins || !abaPastas || !conteudoPastas) {
        return;
      }

      const mostrarPastas = aba === 'pastas';
      paginaPastas.classList.toggle('perfil-mostrando-pins', !mostrarPastas);
      abaPastas.setAttribute('aria-selected', String(mostrarPastas));
      abaPins.setAttribute('aria-selected', String(!mostrarPastas));
      abaPastas.tabIndex = mostrarPastas ? 0 : -1;
      abaPins.tabIndex = mostrarPastas ? -1 : 0;
      conteudoPastas.hidden = !mostrarPastas;
      if (conteudoPins) {
        conteudoPins.hidden = mostrarPastas;
        if (paginaPastas.hidden) {
          conteudoPins.removeAttribute('role');
          conteudoPins.removeAttribute('aria-labelledby');
        } else {
          conteudoPins.setAttribute('role', 'tabpanel');
          conteudoPins.setAttribute('aria-labelledby', 'aba-perfil-pins');
        }
      } else {
        feedPins.hidden = mostrarPastas;
      }
      if (mostrarPastas) {
        renderizarPaginaPastas();
      }
    }

    function criarCapaPasta(pasta) {
      const capa = criarElemento('div', 'pasta-capa');
      const pinsComImagem = pasta.pins.filter((pin) => pin.imagem).slice(0, 4);

      if (pinsComImagem.length === 0) {
        const icone = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'svg'
        );
        icone.setAttribute('viewBox', '0 0 24 24');
        icone.setAttribute('aria-hidden', 'true');
        [
          ['3', '3', '8', '8'],
          ['13', '3', '8', '5'],
          ['13', '10', '8', '11'],
          ['3', '13', '8', '8']
        ].forEach(([x, y, width, height]) => {
          const retangulo = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'rect'
          );
          retangulo.setAttribute('x', x);
          retangulo.setAttribute('y', y);
          retangulo.setAttribute('width', width);
          retangulo.setAttribute('height', height);
          retangulo.setAttribute('rx', '1.5');
          icone.appendChild(retangulo);
        });
        capa.appendChild(icone);
        return capa;
      }

      capa.classList.add(`pasta-capa-${pinsComImagem.length}`);
      pinsComImagem.forEach((pin) => {
        const imagem = document.createElement('img');
        imagem.src = new URL(pin.imagem, document.baseURI).href;
        imagem.alt = '';
        imagem.loading = 'lazy';
        capa.appendChild(imagem);
      });
      return capa;
    }

    function desenharPastaAberta(pasta) {
      if (!detalhePaginaPastas) {
        return;
      }

      detalhePaginaPastas.replaceChildren();
      detalhePaginaPastas.hidden = false;
      if (gradePastas) {
        gradePastas.hidden = true;
      }
      if (estadoVazioPastas) {
        estadoVazioPastas.hidden = true;
      }

      const voltar = criarElemento(
        'button',
        'pastas-voltar',
        '‹  Voltar às pastas'
      );
      voltar.type = 'button';
      voltar.dataset.acaoPaginaPasta = 'voltar';
      detalhePaginaPastas.append(voltar, criarElemento('h2', '', pasta.nome));
      if (pasta.descricao) {
        detalhePaginaPastas.appendChild(
          criarElemento('p', 'pasta-descricao', pasta.descricao)
        );
      }

      const acoes = criarElemento('div', 'pasta-detalhe-acoes');
      const botaoExcluir = criarElemento(
        'button',
        'pasta-excluir',
        'Excluir pasta'
      );
      botaoExcluir.type = 'button';
      botaoExcluir.dataset.acaoPaginaPasta = 'pedir-exclusao';
      botaoExcluir.dataset.pastaId = pasta.id;
      acoes.appendChild(botaoExcluir);
      detalhePaginaPastas.appendChild(acoes);

      if (pastaPaginaExcluirId === pasta.id) {
        const confirmacao = criarElemento('div', 'pasta-confirmacao-pagina');
        confirmacao.setAttribute('role', 'group');
        confirmacao.setAttribute('aria-label', `Confirmação para excluir ${pasta.nome}`);
        confirmacao.appendChild(
          criarElemento(
            'p',
            '',
            `Excluir "${pasta.nome}" e os Pins associados?`
          )
        );
        const cancelar = criarElemento('button', '', 'Cancelar');
        cancelar.type = 'button';
        cancelar.dataset.acaoPaginaPasta = 'cancelar-exclusao';
        const confirmar = criarElemento('button', 'botao-excluir', 'Excluir');
        confirmar.type = 'button';
        confirmar.dataset.acaoPaginaPasta = 'confirmar-exclusao';
        confirmar.dataset.pastaId = pasta.id;
        confirmacao.append(cancelar, confirmar);
        detalhePaginaPastas.appendChild(confirmacao);
      }

      const listaPins = criarElemento('div', 'pastas-pins-pagina');
      if (pasta.pins.length === 0) {
        listaPins.appendChild(
          criarElemento(
            'p',
            'pastas-vazio-pagina-mensagem',
            'Esta pasta ainda não tem Pins salvos.'
          )
        );
      } else {
        pasta.pins.forEach((pin) => {
          const item = criarElemento('article', 'pasta-pin-pagina');
          if (pin.imagem) {
            const imagem = document.createElement('img');
            imagem.src = new URL(pin.imagem, document.baseURI).href;
            imagem.alt = pin.alt || pin.titulo || 'Pin salvo';
            imagem.loading = 'lazy';
            item.appendChild(imagem);
          }
          const informacoes = criarElemento('div', 'pasta-pin-informacoes');
          informacoes.appendChild(
            criarElemento('h3', '', pin.titulo || 'Pin salvo')
          );
          if (pin.descricao) {
            informacoes.appendChild(criarElemento('p', '', pin.descricao));
          }
          if (pin.categoria) {
            informacoes.appendChild(
              criarElemento('p', '', `Categoria: ${pin.categoria}`)
            );
          }
          item.appendChild(informacoes);

          const remover = criarElemento('button', '', 'Remover');
          remover.type = 'button';
          remover.dataset.acaoPaginaPasta = 'remover-pin';
          remover.dataset.pinId = pin.id;
          remover.dataset.pastaId = pasta.id;
          remover.setAttribute(
            'aria-label',
            `Remover ${pin.titulo || 'Pin'} desta pasta`
          );
          item.appendChild(remover);
          listaPins.appendChild(item);
        });
      }
      detalhePaginaPastas.appendChild(listaPins);
    }

    function renderizarPaginaPastas() {
      if (!paginaPastas || !gradePastas || !estadoVazioPastas) {
        return;
      }

      gradePastas.replaceChildren();
      if (mensagemPaginaPastas) {
        mensagemPaginaPastas.hidden = !erroArmazenamento;
        mensagemPaginaPastas.textContent = erroArmazenamento;
      }

      const pastaAberta = localizarPasta(pastaPaginaAbertaId);
      if (pastaAberta) {
        desenharPastaAberta(pastaAberta);
        return;
      }

      pastaPaginaAbertaId = null;
      if (detalhePaginaPastas) {
        detalhePaginaPastas.hidden = true;
        detalhePaginaPastas.replaceChildren();
      }

      const pastasVisiveis =
        filtroPastas === 'compartilhadas'
          ? pastas.filter((pasta) => pasta.compartilhada === true)
          : pastas;
      const estadoTitulo = estadoVazioPastas.querySelector('h2');
      const estadoTexto = estadoVazioPastas.querySelector('p');
      const estadoBotao = estadoVazioPastas.querySelector('button');
      const vazioGeral = pastas.length === 0 && filtroPastas === 'todas';
      const mostrarVazio = pastasVisiveis.length === 0;
      const quantidadePinsSalvos = pastas.reduce(
        (total, pasta) => total + pasta.pins.length,
        0
      );
      const mensagemNaoOrganizadas = document.querySelector(
        '.ideias-nao-organizadas-vazio'
      );
      if (mensagemNaoOrganizadas) {
        const quantidadeNaoOrganizada = pinsTemporariosNaoOrganizados.length;
        mensagemNaoOrganizadas.textContent = quantidadeNaoOrganizada
          ? `${quantidadeNaoOrganizada} ${quantidadeNaoOrganizada === 1 ? 'Pin está' : 'Pins estão'} sem uma pasta. Publicações demonstrativas ficam disponíveis apenas nesta sessão.`
          : quantidadePinsSalvos > 0
            ? `Seus ${quantidadePinsSalvos} Pins salvos já estão organizados em pastas.`
            : 'Não há Pins salvos fora de pastas para exibir.';
      }

      const gradeNaoOrganizada = document.querySelector(
        '#ideias-nao-organizadas-grade'
      );
      if (gradeNaoOrganizada) {
        gradeNaoOrganizada.replaceChildren();
        pinsTemporariosNaoOrganizados.forEach((pin) => {
          const item = criarElemento('article', 'ideia-nao-organizada');
          const imagem = document.createElement('img');
          imagem.src = new URL(pin.imagem, document.baseURI).href;
          imagem.alt = pin.alt || pin.titulo;
          imagem.loading = 'lazy';
          item.append(imagem, criarElemento('h3', '', pin.titulo));
          if (pin.descricao) {
            item.appendChild(criarElemento('p', '', pin.descricao));
          }
          gradeNaoOrganizada.appendChild(item);
        });
      }

      estadoVazioPastas.hidden = !mostrarVazio;
      gradePastas.hidden = mostrarVazio;
      if (estadoTitulo && estadoTexto && estadoBotao) {
        estadoTitulo.textContent = vazioGeral
          ? 'Organize suas ideias'
          : 'Nenhuma pasta compartilhada';
        estadoTexto.textContent = vazioGeral
          ? 'Crie pastas para reunir e organizar os Pins que você salvou.'
          : 'As pastas compartilhadas aparecerão aqui quando estiverem disponíveis.';
        estadoBotao.hidden = !vazioGeral;
      }

      pastasVisiveis.forEach((pasta) => {
        const cartao = criarElemento('article', 'pasta-cartao');
        const abrir = criarElemento('button', 'pasta-abrir-cartao');
        abrir.type = 'button';
        abrir.dataset.acaoPaginaPasta = 'abrir';
        abrir.dataset.pastaId = pasta.id;
        abrir.setAttribute('aria-label', `Abrir pasta ${pasta.nome}`);
        abrir.appendChild(criarCapaPasta(pasta));
        const descricao = criarElemento('span', 'pasta-cartao-nome', pasta.nome);
        const quantidade = criarElemento(
          'span',
          'pasta-cartao-quantidade',
          `${pasta.pins.length} ${pasta.pins.length === 1 ? 'Pin' : 'Pins'}`
        );
        abrir.append(descricao, quantidade);
        cartao.appendChild(abrir);

        const botaoExcluir = criarElemento(
          'button',
          'pasta-cartao-excluir',
          'Excluir'
        );
        botaoExcluir.type = 'button';
        botaoExcluir.dataset.acaoPaginaPasta = 'pedir-exclusao';
        botaoExcluir.dataset.pastaId = pasta.id;
        botaoExcluir.setAttribute('aria-label', `Excluir pasta ${pasta.nome}`);
        cartao.appendChild(botaoExcluir);

        if (pastaPaginaExcluirId === pasta.id) {
          const confirmacao = criarElemento('div', 'pasta-confirmacao-pagina');
          confirmacao.setAttribute('role', 'group');
          confirmacao.setAttribute('aria-label', `Confirmação para excluir ${pasta.nome}`);
          confirmacao.appendChild(
            criarElemento(
              'p',
              '',
              `Excluir "${pasta.nome}" e os Pins associados?`
            )
          );
          const cancelar = criarElemento('button', '', 'Cancelar');
          cancelar.type = 'button';
          cancelar.dataset.acaoPaginaPasta = 'cancelar-exclusao';
          const confirmar = criarElemento('button', 'botao-excluir', 'Excluir');
          confirmar.type = 'button';
          confirmar.dataset.acaoPaginaPasta = 'confirmar-exclusao';
          confirmar.dataset.pastaId = pasta.id;
          confirmacao.append(cancelar, confirmar);
          cartao.appendChild(confirmacao);
        }

        gradePastas.appendChild(cartao);
      });
    }

    function desenharDetalhePasta(pasta) {
      detalhePasta.replaceChildren();
      detalhePasta.hidden = false;
      formulario.hidden = true;
      listaPastas.hidden = true;
      confirmacao.hidden = true;

      const botaoVoltar = criarElemento('button', '', 'Voltar às pastas');
      botaoVoltar.type = 'button';
      botaoVoltar.dataset.acaoPasta = 'voltar';
      const tituloPasta = criarElemento('h3', '', pasta.nome);
      detalhePasta.append(botaoVoltar, tituloPasta);

      if (pasta.descricao) {
        detalhePasta.appendChild(criarElemento('p', '', pasta.descricao));
      }

      if (pasta.pins.length === 0) {
        detalhePasta.appendChild(
          criarElemento('p', 'pastas-vazio', 'Esta pasta ainda não tem Pins.')
        );
        return;
      }

      const listaPins = criarElemento('ul', 'pastas-pins');
      pasta.pins.forEach((pin) => {
        const item = criarElemento('li', 'pastas-pin');
        if (pin.imagem) {
          const imagem = document.createElement('img');
          imagem.src = new URL(pin.imagem, document.baseURI).href;
          imagem.alt = pin.alt || pin.titulo || 'Pin salvo';
          imagem.loading = 'lazy';
          item.appendChild(imagem);
        }

        const informacoes = criarElemento('div', 'pastas-pin-informacoes');
        informacoes.appendChild(criarElemento('h4', '', pin.titulo || 'Pin'));
        if (pin.descricao) {
          informacoes.appendChild(criarElemento('p', '', pin.descricao));
        }
        if (pin.categoria) {
          informacoes.appendChild(
            criarElemento('p', '', `Categoria: ${pin.categoria}`)
          );
        }
        item.appendChild(informacoes);

        const botaoRemover = criarElemento('button', '', 'Remover Pin');
        botaoRemover.type = 'button';
        botaoRemover.dataset.acaoPasta = 'remover-pin';
        botaoRemover.dataset.pinId = pin.id;
        botaoRemover.setAttribute(
          'aria-label',
          `Remover ${pin.titulo || 'Pin'} desta pasta`
        );
        item.appendChild(botaoRemover);
        listaPins.appendChild(item);
      });
      detalhePasta.appendChild(listaPins);
    }

    function desenharPastas(modo) {
      pastaAbertaId = null;
      detalhePasta.hidden = true;
      detalhePasta.replaceChildren();
      formulario.hidden = false;
      listaPastas.hidden = modo === 'criar';
      confirmacao.hidden = true;
      listaPastas.replaceChildren();
      titulo.textContent =
        modo === 'criar' ? 'Criar uma pasta' : 'Escolha uma pasta';
      botaoCriar.textContent =
        modo === 'criar' ? 'Criar pasta' : 'Criar e salvar';

      if (modo !== 'criar' && pastas.length === 0) {
        listaPastas.appendChild(
          criarElemento('li', 'pastas-vazio', 'Crie sua primeira pasta abaixo.')
        );
      }

      pastas.forEach((pasta) => {
        const item = criarElemento('li', 'pastas-item');
        const informacoes = criarElemento('div', 'pastas-item-informacoes');
        informacoes.appendChild(criarElemento('strong', '', pasta.nome));
        informacoes.appendChild(
          criarElemento('span', '', `${pasta.pins.length} Pins`)
        );
        if (pasta.descricao) {
          informacoes.appendChild(criarElemento('p', '', pasta.descricao));
        }
        item.appendChild(informacoes);

        const botaoPasta = criarElemento(
          'button',
          'pastas-acao-principal',
          modo === 'salvar' ? 'Salvar nesta pasta' : 'Abrir pasta'
        );
        botaoPasta.type = 'button';
        botaoPasta.dataset.acaoPasta =
          modo === 'salvar' ? 'salvar-pin' : 'abrir-pasta';
        botaoPasta.dataset.pastaId = pasta.id;
        item.appendChild(botaoPasta);

        if (modo === 'gerenciar') {
          const botaoExcluir = criarElemento('button', '', 'Excluir');
          botaoExcluir.type = 'button';
          botaoExcluir.dataset.acaoPasta = 'pedir-exclusao';
          botaoExcluir.dataset.pastaId = pasta.id;
          botaoExcluir.setAttribute(
            'aria-label',
            `Excluir pasta ${pasta.nome}`
          );
          item.appendChild(botaoExcluir);
        }
        listaPastas.appendChild(item);
      });
    }

    function abrirDialogo(modo, card = null) {
      modoDialogo = modo;
      if (erroArmazenamento) {
        definirStatus(erroArmazenamento, true);
      } else {
        definirStatus(
          modo === 'salvar'
            ? 'Escolha uma pasta para salvar este Pin.'
            : 'Informe um nome e, se desejar, uma descrição.'
        );
      }
      pinParaSalvar = card;
      desenharPastas(modo);
      formulario.reset();
      if (!dialogo.open) {
        dialogo.showModal();
      }
      if (modo === 'salvar' && pastas.length > 0) {
        listaPastas.querySelector('button')?.focus();
      } else {
        campoNome.focus();
      }
    }

    function abrirPaginaPastas() {
      if (!paginaPastas) {
        return;
      }

      paginaPastas.hidden = false;
      conteudoPins?.setAttribute('role', 'tabpanel');
      conteudoPins?.setAttribute('aria-labelledby', 'aba-perfil-pins');
      definirAbaPerfil('pastas');
      renderizarPaginaPastas();
    }

    function abrirInicio() {
      if (paginaPastas) {
        paginaPastas.hidden = true;
      }
      if (conteudoPins) {
        conteudoPins.hidden = false;
        conteudoPins.removeAttribute('role');
        conteudoPins.removeAttribute('aria-labelledby');
      } else {
        feedPins.hidden = false;
      }
      document.querySelectorAll('.menu-item').forEach((item) => {
        item.classList.toggle(
          'ativo',
          item.matches('a[href="#feed"]')
        );
        if (item.matches('a[href="#feed"]')) {
          item.setAttribute('aria-current', 'page');
        } else {
          item.removeAttribute('aria-current');
        }
      });
    }

    function migrarPinsAntigos() {
      const conteudoAntigo = window.localStorage.getItem(CHAVE_PINS_ANTIGOS);
      if (conteudoAntigo === null) {
        return;
      }

      const idsAntigos = JSON.parse(conteudoAntigo);
      if (
        !Array.isArray(idsAntigos) ||
        idsAntigos.some((id) => typeof id !== 'string')
      ) {
        throw new TypeError('A lista antiga de Pins salvos é inválida.');
      }
      if (idsAntigos.length === 0) {
        window.localStorage.removeItem(CHAVE_PINS_ANTIGOS);
        return;
      }

      let pastaSalvos = pastas.find(
        (pasta) => pasta.nome.toLocaleLowerCase() === 'salvos'
      );
      if (!pastaSalvos) {
        pastaSalvos = {
          id: criarId('pasta'),
          nome: NOME_PASTA_ANTIGA,
          descricao: 'Pins que já estavam salvos neste navegador.',
          criadaEm: new Date().toISOString(),
          pins: []
        };
        pastas.push(pastaSalvos);
      }

      idsAntigos.forEach((id) => {
        if (!pastaSalvos.pins.some((pin) => pin.id === id)) {
          const card = Array.from(
            containerPins.querySelectorAll('.post')
          ).find((elemento) => elemento.dataset.pinId === id);
          pastaSalvos.pins.push(
            card
              ? obterDadosPin(card)
              : {
                  id,
                  imagem: '',
                  alt: '',
                  titulo: 'Pin salvo anteriormente',
                  descricao: '',
                  categoria: ''
                }
          );
        }
      });

      repositorio.salvar(pastas);
      window.localStorage.removeItem(CHAVE_PINS_ANTIGOS);
    }

    formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();
      if (erroArmazenamento) {
        definirStatus(erroArmazenamento, true);
        return;
      }

      const nome = campoNome.value.trim();
      const descricao = campoDescricao.value.trim();
      if (!nome) {
        definirStatus('Informe um nome para a pasta.', true);
        campoNome.focus();
        return;
      }
      if (
        pastas.some(
          (pasta) => pasta.nome.toLocaleLowerCase() === nome.toLocaleLowerCase()
        )
      ) {
        definirStatus('Já existe uma pasta com esse nome.', true);
        campoNome.focus();
        return;
      }

      const novaPasta = {
        id: criarId('pasta'),
        nome,
        descricao,
        criadaEm: new Date().toISOString(),
        pins: []
      };
      pastas.push(novaPasta);

      if (pinParaSalvar) {
        novaPasta.pins.push(obterDadosPin(pinParaSalvar));
      }

      if (!persistir()) {
        pastas.pop();
        return;
      }

      formulario.reset();
      if (modoDialogo === 'criar') {
        dialogo.close();
        pinParaSalvar = null;
        filtroPastas = 'todas';
        paginaPastas?.querySelectorAll('[data-filtro-pastas]').forEach((opcao) => {
          opcao.setAttribute(
            'aria-pressed',
            String(opcao.dataset.filtroPastas === 'todas')
          );
        });
        if (statusPerfil) {
          statusPerfil.textContent = `Pasta "${nome}" criada.`;
        }
        renderizarPaginaPastas();
        return;
      }

      desenharPastas(pinParaSalvar ? 'salvar' : 'gerenciar');
      definirStatus(
        pinParaSalvar
          ? `Pasta criada e Pin salvo em "${nome}".`
          : `Pasta "${nome}" criada.`
      );
    });

    dialogo.addEventListener('click', (evento) => {
      if (!(evento.target instanceof Element)) {
        return;
      }
      const botao = evento.target.closest('button[data-acao-pasta]');
      if (!botao) {
        return;
      }

      const pasta = localizarPasta(botao.dataset.pastaId);
      switch (botao.dataset.acaoPasta) {
        case 'salvar-pin': {
          if (erroArmazenamento) {
            definirStatus(erroArmazenamento, true);
            return;
          }
          if (!pasta || !pinParaSalvar) {
            return;
          }
          const dadosPin = obterDadosPin(pinParaSalvar);
          if (pasta.pins.some((pin) => pin.id === dadosPin.id)) {
            definirStatus(`Este Pin já está salvo em "${pasta.nome}".`, true);
            return;
          }
          pasta.pins.push(dadosPin);
          if (persistir()) {
            desenharPastas('salvar');
            definirStatus(`Pin salvo em "${pasta.nome}".`);
          } else {
            pasta.pins.pop();
          }
          break;
        }
        case 'abrir-pasta':
          if (pasta) {
            pastaAbertaId = pasta.id;
            desenharDetalhePasta(pasta);
          }
          break;
        case 'voltar':
          desenharPastas('gerenciar');
          break;
        case 'remover-pin': {
          const pastaAtual = localizarPasta(pastaAbertaId);
          if (!pastaAtual) {
            return;
          }
          const indicePin = pastaAtual.pins.findIndex(
            (pin) => pin.id === botao.dataset.pinId
          );
          if (indicePin < 0) {
            return;
          }
          const [pinRemovido] = pastaAtual.pins.splice(indicePin, 1);
          if (persistir()) {
            desenharDetalhePasta(pastaAtual);
            definirStatus(`Pin removido de "${pastaAtual.nome}".`);
          } else {
            pastaAtual.pins.splice(indicePin, 0, pinRemovido);
          }
          break;
        }
        case 'pedir-exclusao':
          if (pasta) {
            pastaAExcluirId = pasta.id;
            textoConfirmacao.textContent =
              `A pasta "${pasta.nome}" e os Pins associados serão removidos.`;
            confirmacao.hidden = false;
            botaoCancelarExclusao.focus();
          }
          break;
        case 'cancelar-exclusao':
          pastaAExcluirId = null;
          confirmacao.hidden = true;
          definirStatus('Exclusão cancelada.');
          break;
        case 'confirmar-exclusao': {
          const indicePasta = pastas.findIndex(
            (item) => item.id === pastaAExcluirId
          );
          if (indicePasta < 0) {
            return;
          }
          const [pastaRemovida] = pastas.splice(indicePasta, 1);
          if (persistir()) {
            pastaAExcluirId = null;
            desenharPastas('gerenciar');
            definirStatus(`Pasta "${pastaRemovida.nome}" excluída.`);
          } else {
            pastas.splice(indicePasta, 0, pastaRemovida);
          }
          break;
        }
      }
    });

    botaoFechar.addEventListener('click', () => dialogo.close());
    botaoCancelar.addEventListener('click', () => dialogo.close());
    dialogo.addEventListener('close', () => {
      pinParaSalvar = null;
      formulario.reset();
      if (paginaPastas && !paginaPastas.hidden) {
        document
          .querySelector('.pastas-criar-pagina')
          ?.focus({ preventScroll: true });
      }
    });
    dialogo.addEventListener('click', (evento) => {
      if (evento.target === dialogo) {
        dialogo.close();
      }
    });

    document.addEventListener('boards:save-request', (evento) => {
      if (evento.detail?.card instanceof Element) {
        abrirDialogo('salvar', evento.detail.card);
      }
    });
    document.addEventListener('boards:open', abrirPaginaPastas);
    document.addEventListener('boards:home', abrirInicio);

    if (paginaPastas) {
      paginaPastas.addEventListener('click', (evento) => {
        if (!(evento.target instanceof Element)) {
          return;
        }

        const botao = evento.target.closest('button');
        if (!botao) {
          return;
        }

        if (botao.matches('.pastas-criar-pagina, .pastas-criar-vazia')) {
          abrirDialogo('criar');
          return;
        }

        if (botao.matches('#aba-perfil-pins')) {
          definirAbaPerfil('pins');
          return;
        }

        if (botao.matches('#aba-perfil-pastas')) {
          definirAbaPerfil('pastas');
          return;
        }

        if (botao.matches('.botao-filtros')) {
          const opcoes = document.querySelector('#opcoes-filtros-pastas');
          if (opcoes) {
            opcoes.hidden = !opcoes.hidden;
            botao.setAttribute('aria-expanded', String(!opcoes.hidden));
          }
          return;
        }

        if (botao.dataset.filtroPastas) {
          filtroPastas = botao.dataset.filtroPastas;
          paginaPastas.querySelectorAll('[data-filtro-pastas]').forEach((opcao) => {
            opcao.setAttribute(
              'aria-pressed',
              String(opcao === botao)
            );
          });
          renderizarPaginaPastas();
          return;
        }

        const acao = botao.dataset.acaoPaginaPasta;
        const pasta = localizarPasta(botao.dataset.pastaId);
        if (acao === 'abrir' && pasta) {
          pastaPaginaAbertaId = pasta.id;
          pastaPaginaExcluirId = null;
          renderizarPaginaPastas();
          return;
        }

        if (acao === 'voltar') {
          pastaPaginaAbertaId = null;
          pastaPaginaExcluirId = null;
          renderizarPaginaPastas();
          return;
        }

        if (acao === 'pedir-exclusao' && pasta) {
          pastaPaginaExcluirId = pasta.id;
          renderizarPaginaPastas();
          paginaPastas
            .querySelector('.pasta-confirmacao-pagina button')
            ?.focus();
          return;
        }

        if (acao === 'cancelar-exclusao') {
          pastaPaginaExcluirId = null;
          renderizarPaginaPastas();
          return;
        }

        if (acao === 'confirmar-exclusao') {
          const indice = pastas.findIndex(
            (item) => item.id === pastaPaginaExcluirId
          );
          if (indice < 0) {
            return;
          }
          const [removida] = pastas.splice(indice, 1);
          if (persistir()) {
            pastaPaginaExcluirId = null;
            pastaPaginaAbertaId = null;
            if (statusPerfil) {
              statusPerfil.textContent = `Pasta "${removida.nome}" excluída.`;
            }
            renderizarPaginaPastas();
          } else {
            pastas.splice(indice, 0, removida);
          }
          return;
        }

        if (acao === 'remover-pin') {
          const pastaAtual = localizarPasta(botao.dataset.pastaId);
          const indicePin = pastaAtual?.pins.findIndex(
            (pin) => pin.id === botao.dataset.pinId
          );
          if (!pastaAtual || indicePin < 0) {
            return;
          }
          const [removido] = pastaAtual.pins.splice(indicePin, 1);
          if (persistir()) {
            if (statusPerfil) {
              statusPerfil.textContent = `Pin removido de "${pastaAtual.nome}".`;
            }
            renderizarPaginaPastas();
          } else {
            pastaAtual.pins.splice(indicePin, 0, removido);
          }
        }
      });

      paginaPastas.addEventListener('keydown', (evento) => {
        if (
          evento.key !== 'ArrowLeft' &&
          evento.key !== 'ArrowRight' &&
          !(evento.target instanceof Element && evento.target.matches('[role="tab"]'))
        ) {
          return;
        }

        if (!(evento.target instanceof Element) || !evento.target.matches('[role="tab"]')) {
          return;
        }

        evento.preventDefault();
        const proximaAba =
          evento.target === abaPins ? abaPastas : abaPins;
        proximaAba.focus();
        proximaAba.click();
      });

      document
        .querySelector('.perfil-compartilhar')
        ?.addEventListener('click', async () => {
          const url = window.location.href.split('#')[0];
          try {
            if (typeof navigator.share === 'function') {
              await navigator.share({
                title: 'Meu perfil',
                url
              });
              statusPerfil.textContent = 'Perfil compartilhado.';
            } else if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(url);
              statusPerfil.textContent = 'Link do perfil copiado.';
            } else {
              statusPerfil.textContent =
                'O compartilhamento não está disponível neste navegador.';
            }
          } catch (erro) {
            if (erro.name === 'AbortError') {
              statusPerfil.textContent = 'Compartilhamento cancelado.';
              return;
            }
            console.error('Não foi possível compartilhar o perfil.', erro);
            statusPerfil.textContent = 'Não foi possível compartilhar o perfil.';
          }
        });
    }

    window.pinterestBoards = Object.freeze({
      listarPastas() {
        return pastas.map(({ id, nome }) => ({ id, nome }));
      },
      adicionarPinDemonstrativo(pin, pastaId = '') {
        if (!pin || typeof pin.id !== 'string' || typeof pin.imagem !== 'string') {
          return false;
        }

        if (pastaId) {
          const pasta = localizarPasta(pastaId);
          if (!pasta || pasta.pins.some((item) => item.id === pin.id)) {
            return false;
          }
          pasta.pins.push({ ...pin, temporario: true });
        } else {
          pinsTemporariosNaoOrganizados = [
            ...pinsTemporariosNaoOrganizados.filter((item) => item.id !== pin.id),
            { ...pin, temporario: true }
          ];
        }

        notificarEstado();
        renderizarPaginaPastas();
        return true;
      }
    });

    function atualizarPinsConhecidos() {
      let alterado = false;
      const cards = Array.from(containerPins.querySelectorAll('.post'));
      pastas.forEach((pasta) => {
        pasta.pins.forEach((pin, indice) => {
          if (pin.imagem || !pin.id) {
            return;
          }
          const card = cards.find(
            (elemento) => elemento.dataset.pinId === pin.id
          );
          if (card) {
            pasta.pins[indice] = obterDadosPin(card);
            alterado = true;
          }
        });
      });
      if (alterado) {
        persistir();
      }
    }

    document.addEventListener('pins:updated', atualizarPinsConhecidos);
    const observadorPins = new MutationObserver(atualizarPinsConhecidos);
    observadorPins.observe(containerPins, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-pin-id']
    });

    try {
      pastas = repositorio.carregar();
      migrarPinsAntigos();
      notificarEstado();
      atualizarPinsConhecidos();
      renderizarPaginaPastas();
    } catch (erro) {
      console.error('Não foi possível carregar as pastas.', erro);
      erroArmazenamento =
        'Não foi possível carregar as pastas salvas. Os dados armazenados podem estar inválidos ou indisponíveis.';
      definirStatus(erroArmazenamento, true);
      if (mensagemPaginaPastas) {
        mensagemPaginaPastas.textContent = erroArmazenamento;
        mensagemPaginaPastas.hidden = false;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', configurarPastas);
})();
