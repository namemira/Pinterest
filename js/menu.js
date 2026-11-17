'use strict';

// Mostra os avisos temporários dos itens Mensagens e Notificações.
function configurarAvisosDisponibilidade(menu) {
  const botoes = menu.querySelectorAll('[data-aviso-disponibilidade]');
  if (botoes.length === 0) {
    return;
  }

  const aviso = document.createElement('dialog');
  aviso.className = 'principal-dialogo aviso-disponibilidade';
  aviso.setAttribute('aria-labelledby', 'aviso-disponibilidade-titulo');
  aviso.setAttribute('aria-describedby', 'aviso-disponibilidade-texto');

  const icone = document.createElement('span');
  icone.className = 'aviso-disponibilidade-icone';
  icone.setAttribute('aria-hidden', 'true');
  icone.textContent = 'i';

  const cabecalho = document.createElement('header');
  cabecalho.className = 'aviso-disponibilidade-cabecalho';
  const titulo = document.createElement('h2');
  titulo.id = 'aviso-disponibilidade-titulo';

  const botaoFechar = document.createElement('button');
  botaoFechar.className = 'principal-dialogo-fechar';
  botaoFechar.type = 'button';
  botaoFechar.setAttribute('aria-label', 'Fechar aviso');
  botaoFechar.textContent = '×';
  cabecalho.append(icone, titulo, botaoFechar);

  const texto = document.createElement('p');
  texto.id = 'aviso-disponibilidade-texto';
  texto.textContent =
    'Este recurso ainda não foi liberado nesta versão do sistema. Estamos trabalhando para disponibilizá-lo em breve. Agradecemos pela compreensão!';
  aviso.append(cabecalho, texto);
  document.body.appendChild(aviso);

  let temporizadorFechamento;

  function fecharAviso() {
    window.clearTimeout(temporizadorFechamento);
    if (!aviso.open) {
      return;
    }

    aviso.classList.remove('visivel');
    aviso.close();
  }

  function mostrarAviso(tituloAviso) {
    window.clearTimeout(temporizadorFechamento);
    titulo.textContent = tituloAviso;
    if (!aviso.open) {
      aviso.showModal();
    }
    window.requestAnimationFrame(() => {
      aviso.classList.add('visivel');
    });
    temporizadorFechamento = window.setTimeout(fecharAviso, 6000);
  }

  aviso.addEventListener('click', (evento) => {
    if (evento.target === aviso) {
      fecharAviso();
    }
  });
  aviso.addEventListener('cancel', (evento) => {
    evento.preventDefault();
    fecharAviso();
  });
  menu.addEventListener('click', (evento) => {
    if (!(evento.target instanceof Element)) {
      return;
    }

    const botao = evento.target.closest('[data-aviso-disponibilidade]');
    if (!botao) {
      return;
    }

    const recurso = botao.dataset.avisoDisponibilidade;
    const tituloAviso =
      recurso === 'mensagens'
        ? 'Mensagens ainda não disponíveis'
        : 'Notificações ainda não disponíveis';
    mostrarAviso(tituloAviso);
  });

  botaoFechar.addEventListener('click', fecharAviso);
}

// Controla o painel Criar e encaminha cada opção para o recurso existente.
function configurarPainelCriar(menu) {
  const botaoCriar = menu.querySelector('#abrir-painel-criar');
  const painelCriar = document.querySelector('#painel-criar');
  if (!botaoCriar || !painelCriar) {
    return null;
  }

  const deslocarConteudo = Boolean(
    document.querySelector('#dialogo-criacao')
  );

  // Em telas estreitas, ao fechar o painel o foco volta ao controle de navegação.
  function obterDestinoFoco() {
    const botaoMenu = document.querySelector('.menu-responsivo-toggle');
    if (
      botaoMenu &&
      !window.matchMedia('(min-width: 768px)').matches &&
      !menu.classList.contains('menu-aberto')
    ) {
      return botaoMenu;
    }

    return botaoCriar;
  }

  // Mantém visibilidade, deslocamento da página e atributos de acessibilidade sincronizados.
  function definirPainel(aberto, devolverFoco = false) {
    painelCriar.hidden = !aberto;
    document.body.classList.toggle(
      'criar-painel-aberto',
      aberto && deslocarConteudo
    );
    botaoCriar.setAttribute('aria-expanded', String(aberto));
    botaoCriar.setAttribute(
      'aria-label',
      aberto ? 'Fechar painel Criar' : 'Criar'
    );

    if (aberto) {
      const menuPerfil = document.querySelector('#menu-perfil');
      const botaoPerfil = document.querySelector(
        '#abrir-perfil[data-menu-perfil]'
      );
      if (menuPerfil && !menuPerfil.hidden) {
        menuPerfil.hidden = true;
        botaoPerfil?.setAttribute('aria-expanded', 'false');
        botaoPerfil?.setAttribute('aria-label', 'Abrir menu do perfil');
      }
      painelCriar.querySelector('[data-criacao-opcao]')?.focus();
    } else if (devolverFoco) {
      obterDestinoFoco().focus({ preventScroll: true });
    }
  }

  // Reutiliza eventos do sistema ou encaminha para a página que contém a interface.
  function executarOpcaoCriacao(opcao) {
    definirPainel(false);
    if (opcao === 'pin') {
      if (document.querySelector('#formulario-criar-pin')) {
        document.dispatchEvent(new CustomEvent('pins:create-open'));
      } else {
        window.location.href = 'CriarPin.html';
      }
    } else if (opcao === 'pasta') {
      document.dispatchEvent(
        new CustomEvent('boards:create-request', {
          detail: { returnFocus: obterDestinoFoco() }
        })
      );
    } else if (opcao === 'colagem' || opcao === 'cartao') {
      if (document.querySelector('#dialogo-criacao')) {
        document.dispatchEvent(
          new CustomEvent('composicao:abrir', {
            detail: { tipo: opcao }
          })
        );
      } else {
        window.location.href = `Principal.html?criar=${encodeURIComponent(
          opcao
        )}`;
      }
    }
  }

  // Registra abertura, fechamento, seleção das opções e devolução do foco.
  botaoCriar.addEventListener('click', () => {
    definirPainel(painelCriar.hidden);
  });
  document
    .querySelector('#fechar-painel-criar')
    ?.addEventListener('click', () => definirPainel(false, true));

  painelCriar.addEventListener('click', (evento) => {
    if (!(evento.target instanceof Element)) {
      return;
    }

    const botao = evento.target.closest('[data-criacao-opcao]');
    if (botao) {
      executarOpcaoCriacao(botao.dataset.criacaoOpcao);
    }
  });

  document.addEventListener('painel-criar:fechar', () => {
    definirPainel(false);
  });
  document.addEventListener('pins:create-closed', () => {
    obterDestinoFoco().focus({ preventScroll: true });
  });
  document
    .querySelector('#dialogo-criacao')
    ?.addEventListener('close', () => {
      obterDestinoFoco().focus({ preventScroll: true });
    });

  return {
    estaAberto: () => !painelCriar.hidden,
    fechar: (devolverFoco = false) =>
      definirPainel(false, devolverFoco)
  };
}

// Configura o menu responsivo, Escape e o item ativo conforme a página atual.
function configurarMenuResponsivo() {
  const menu = document.querySelector('.menu');
  if (!menu) {
    return;
  }

  configurarAvisosDisponibilidade(menu);

  if (!menu.id) {
    menu.id = 'menu-navegacao-principal';
  }

  const botaoMenu = document.createElement('button');
  botaoMenu.className = 'menu-responsivo-toggle';
  botaoMenu.type = 'button';
  botaoMenu.setAttribute('aria-controls', menu.id);
  botaoMenu.setAttribute('aria-expanded', 'false');
  botaoMenu.setAttribute('aria-label', 'Abrir menu de navegação');
  botaoMenu.innerHTML =
    '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';
  menu.before(botaoMenu);
  const painelCriar = configurarPainelCriar(menu);

  // Fecha o menu móvel e, quando solicitado, devolve o foco ao botão que o abriu.
  function fecharMenu(devolverFoco = false) {
    menu.classList.remove('menu-aberto');
    botaoMenu.setAttribute('aria-expanded', 'false');
    botaoMenu.setAttribute('aria-label', 'Abrir menu de navegação');
    if (devolverFoco) {
      botaoMenu.focus();
    }
  }

  botaoMenu.addEventListener('click', () => {
    const aberto = menu.classList.toggle('menu-aberto');
    botaoMenu.setAttribute('aria-expanded', String(aberto));
    botaoMenu.setAttribute(
      'aria-label',
      aberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação'
    );
  });

  // Fecha o menu móvel ao interagir com um item de navegação.
  menu.addEventListener('click', (evento) => {
    if (!(evento.target instanceof Element)) {
      return;
    }

    const opcao = evento.target.closest('.menu-item');
    if (opcao && opcao.getAttribute('aria-disabled') !== 'true') {
      fecharMenu();
    }
  });

  // Fecha menus abertos ao clicar fora deles.
  document.addEventListener('click', (evento) => {
    if (
      menu.classList.contains('menu-aberto') &&
      evento.target instanceof Node &&
      !menu.contains(evento.target) &&
      !botaoMenu.contains(evento.target)
    ) {
      fecharMenu();
    }
  });

  // Escape fecha o painel Criar e/ou o menu móvel aberto.
  document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') {
      return;
    }

    if (painelCriar?.estaAberto()) {
      painelCriar.fechar(!menu.classList.contains('menu-aberto'));
    }
    if (menu.classList.contains('menu-aberto')) {
      fecharMenu(true);
    }
  });

  // Evita manter o menu móvel aberto ao voltar para o layout amplo.
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      fecharMenu();
    }
  });

  // Marca o link correspondente à página atual e trata o retorno ao feed.
  const caminhoAtual = window.location.pathname.split('/').pop();
  menu.querySelectorAll('a.menu-item[href]').forEach((link) => {
    const caminhoLink = new URL(link.href, document.baseURI).pathname.split('/').pop();
    if (caminhoLink === caminhoAtual) {
      atualizarOpcaoAtiva(menu, link);
    }
  });

  document.addEventListener('boards:home', () => {
    const inicio = menu.querySelector('a.menu-item[href="Principal.html"]');
    if (inicio) {
      atualizarOpcaoAtiva(menu, inicio);
    }
  });

  const botaoPerfil = document.querySelector('#abrir-perfil');
  if (botaoPerfil && !botaoPerfil.hasAttribute('data-menu-perfil')) {
    botaoPerfil.addEventListener('click', () => {
      window.location.href = 'Perfil.html';
    });
  }
}

// Atualiza classe visual e semântica do item ativo da navegação.
function atualizarOpcaoAtiva(menu, opcaoAtiva) {
  menu.querySelectorAll('.menu-item').forEach((item) => {
    const ativo = item === opcaoAtiva;
    item.classList.toggle('ativo', ativo);
    if (ativo) {
      item.setAttribute('aria-current', 'page');
    } else {
      item.removeAttribute('aria-current');
    }
  });
}

// Inicializa os comportamentos compartilhados da barra lateral.
document.addEventListener('DOMContentLoaded', configurarMenuResponsivo);
