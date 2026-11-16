'use strict';

function configurarMenuResponsivo() {
  const menu = document.querySelector('.menu');
  if (!menu) {
    return;
  }

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

  menu.addEventListener('click', (evento) => {
    if (!(evento.target instanceof Element)) {
      return;
    }

    const opcao = evento.target.closest('.menu-item');
    if (opcao && opcao.getAttribute('aria-disabled') !== 'true') {
      fecharMenu();
    }
  });

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

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && menu.classList.contains('menu-aberto')) {
      fecharMenu(true);
    }
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      fecharMenu();
    }
  });

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

document.addEventListener('DOMContentLoaded', configurarMenuResponsivo);
