'use strict';

function configurarMenuResponsivo() {
  const menu = document.querySelector('.menu');
const botaoPerfil = document.querySelector('#abrir-perfil');

if (botaoPerfil) {
    botaoPerfil.addEventListener('click', () => {
        window.location.href = '../html/perfil.html';
    });
}
  if (!menu) {
    return;
  }

  menu.addEventListener('click', (evento) => {
    if (!(evento.target instanceof Element)) {
      return;
    }

    const botaoPastas = evento.target.closest('[data-menu-action="boards"]');
    if (botaoPastas) {
      evento.preventDefault();
      document.dispatchEvent(new CustomEvent('boards:open'));
      atualizarOpcaoAtiva(menu, botaoPastas);
      return;
    }

    const botaoCriarPin = evento.target.closest(
      '[data-menu-action="create-pin"]'
    );
    if (botaoCriarPin) {
      evento.preventDefault();
      document.dispatchEvent(new CustomEvent('pins:create-open'));
      atualizarOpcaoAtiva(menu, botaoCriarPin);
      return;
    }

    const linkInicio = evento.target.closest('a[href="#feed"]');
    if (linkInicio) {
      evento.preventDefault();
      document.dispatchEvent(new CustomEvent('boards:home'));
      atualizarOpcaoAtiva(menu, menu.querySelector('.menu-item[href="#feed"]'));
    }
  });

  document.addEventListener('boards:home', () => {
    atualizarOpcaoAtiva(menu, menu.querySelector('.menu-item[href="#feed"]'));
  });
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
  document.addEventListener('profile:open', () => {
  const perfil = document.querySelector('#pagina-pastas');
  const feed = document.querySelector('#conteudo-pins');
  const criarPin = document.querySelector('#pagina-criar-pin');

  if (perfil) perfil.hidden = false;
  if (feed) feed.hidden = true;
  if (criarPin) criarPin.hidden = true;
});

document.addEventListener('DOMContentLoaded', configurarMenuResponsivo);
