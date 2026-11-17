'use strict';

// Padroniza acentos e caixa para comparar termos digitados com as seções.
function normalizarBuscaInicial(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

// Liga a busca da página inicial às seções marcadas com termos pesquisáveis.
function configurarBuscaInicial() {
  const formulario = document.querySelector('#pesquisa-inicial');
  const campo = document.querySelector('#termo-pesquisa');
  const mensagem = document.querySelector('#resultado-pesquisa');

  if (!formulario || !campo || !mensagem) {
    return;
  }

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const termo = normalizarBuscaInicial(campo.value);
    if (!termo) {
      mensagem.textContent = 'Digite um tema para encontrar ideias nesta página.';
      mensagem.hidden = false;
      campo.focus();
      return;
    }

    const secaoEncontrada = Array.from(
      document.querySelectorAll('.story-section[data-search-terms]')
    ).find((secao) => {
      const conteudo = normalizarBuscaInicial(
        `${secao.dataset.searchTerms} ${secao.textContent}`
      );
      return conteudo.includes(termo);
    });

    if (!secaoEncontrada) {
      mensagem.textContent =
        'Não encontramos esse tema nesta página. Use Explorar para buscar mais ideias.';
      mensagem.hidden = false;
      return;
    }

    mensagem.hidden = true;
    secaoEncontrada.tabIndex = -1;
    secaoEncontrada.focus({ preventScroll: true });
    secaoEncontrada.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'center'
    });
  });

  // Limpa avisos antigos enquanto a pessoa corrige ou troca a pesquisa.
  campo.addEventListener('input', () => {
    mensagem.hidden = true;
  });
}

// Aguarda o formulário existir antes de registrar seus eventos.
document.addEventListener('DOMContentLoaded', configurarBuscaInicial);
