'use strict';

/*
 * Comportamentos das páginas em PHP:
 * 1. Confirmação antes de enviar formulários de exclusão (data-confirmar),
 *    usando um <dialog> em vez de confirm()/alert().
 * 2. Prévia da imagem no formulário Criar/Editar Pin.
 * O envio e as validações definitivas continuam sendo feitos pelo PHP.
 */

// ---------- 1. Confirmação de exclusão ----------
function configurarConfirmacoes() {
  const formularios = document.querySelectorAll('form[data-confirmar]');
  if (formularios.length === 0) {
    return;
  }

  const dialogo = document.createElement('dialog');
  dialogo.className = 'dialogo-confirmacao';
  dialogo.setAttribute('aria-labelledby', 'dialogo-confirmacao-texto');
  dialogo.innerHTML =
    '<p id="dialogo-confirmacao-texto"></p>' +
    '<div class="dialogo-confirmacao-acoes">' +
    '<button type="button" class="botao-secundario" data-resposta="nao">Cancelar</button>' +
    '<button type="button" class="botao-perigo-cheio" data-resposta="sim">Excluir</button>' +
    '</div>';
  document.body.appendChild(dialogo);

  const texto = dialogo.querySelector('#dialogo-confirmacao-texto');
  let formularioPendente = null;

  formularios.forEach((formulario) => {
    formulario.addEventListener('submit', (evento) => {
      if (formulario.dataset.confirmado === 'sim') {
        return;
      }
      evento.preventDefault();
      formularioPendente = formulario;
      texto.textContent = formulario.dataset.confirmar;
      dialogo.showModal();
      dialogo.querySelector('[data-resposta="nao"]').focus();
    });
  });

  dialogo.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-resposta]');
    if (!botao && evento.target !== dialogo) {
      return;
    }
    dialogo.close();
    if (botao && botao.dataset.resposta === 'sim' && formularioPendente) {
      formularioPendente.dataset.confirmado = 'sim';
      formularioPendente.requestSubmit();
    }
    formularioPendente = null;
  });
}

// ---------- 2. Prévia da imagem do Pin ----------
function configurarPreviaImagemPin() {
  const formulario = document.querySelector('#formulario-criar-pin');
  const entrada = document.querySelector('#criar-pin-arquivo');
  const area = document.querySelector('#criar-pin-soltar');
  if (!formulario || !entrada || !area) {
    return;
  }

  const orientacao = document.querySelector('#criar-pin-orientacao');
  const previa = document.querySelector('#criar-pin-previa');
  const imagem = document.querySelector('#criar-pin-imagem');
  const acoes = document.querySelector('#criar-pin-imagem-acoes');
  const mensagem = document.querySelector('#criar-pin-mensagem');
  const imagemOriginal = imagem.getAttribute('src');
  const tiposAceitos = ['image/jpeg', 'image/png', 'image/webp'];
  let urlTemporaria = null;

  function mostrarMensagem(textoMensagem) {
    if (mensagem) {
      mensagem.textContent = textoMensagem;
      mensagem.className = 'criar-pin-mensagem' + (textoMensagem ? ' criar-pin-mensagem-erro' : '');
    }
  }

  function atualizarPrevia() {
    const arquivo = entrada.files[0];
    if (urlTemporaria) {
      URL.revokeObjectURL(urlTemporaria);
      urlTemporaria = null;
    }

    if (!arquivo) {
      const temOriginal = Boolean(imagemOriginal);
      if (temOriginal) {
        imagem.src = imagemOriginal;
      }
      previa.hidden = !temOriginal;
      orientacao.hidden = temOriginal;
      acoes.hidden = !temOriginal;
      return;
    }

    if (!tiposAceitos.includes(arquivo.type) || arquivo.size > 10 * 1024 * 1024) {
      mostrarMensagem('Selecione uma imagem JPG, PNG ou WEBP de até 10 MB.');
      entrada.value = '';
      atualizarPrevia();
      return;
    }

    mostrarMensagem('');
    urlTemporaria = URL.createObjectURL(arquivo);
    imagem.src = urlTemporaria;
    previa.hidden = false;
    orientacao.hidden = true;
    acoes.hidden = false;
  }

  area.addEventListener('click', () => entrada.click());
  area.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      entrada.click();
    }
  });
  entrada.addEventListener('change', atualizarPrevia);

  // Arrastar e soltar: o arquivo é colocado no próprio <input type="file">.
  ['dragenter', 'dragover'].forEach((tipo) => {
    area.addEventListener(tipo, (evento) => {
      evento.preventDefault();
      area.classList.add('arrastando');
    });
  });
  ['dragleave', 'drop'].forEach((tipo) => {
    area.addEventListener(tipo, () => area.classList.remove('arrastando'));
  });
  area.addEventListener('drop', (evento) => {
    evento.preventDefault();
    if (evento.dataTransfer && evento.dataTransfer.files.length > 0) {
      const transferencia = new DataTransfer();
      transferencia.items.add(evento.dataTransfer.files[0]);
      entrada.files = transferencia.files;
      atualizarPrevia();
    }
  });

  formulario.querySelector('.criar-pin-substituir')?.addEventListener('click', () => entrada.click());
  formulario.querySelector('.criar-pin-remover')?.addEventListener('click', () => {
    entrada.value = '';
    atualizarPrevia();
  });

  // Validação rápida no navegador; o PHP repete todas as validações.
  formulario.addEventListener('submit', (evento) => {
    const titulo = formulario.querySelector('#criar-pin-titulo');
    const categoria = formulario.querySelector('#criar-pin-categoria');
    const link = formulario.querySelector('#criar-pin-link');
    let erro = '';
    let campo = null;

    if (entrada.required && entrada.files.length === 0) {
      erro = 'Selecione uma imagem para o Pin.';
      campo = area;
    } else if (!titulo.value.trim()) {
      erro = 'Informe um título para o Pin.';
      campo = titulo;
    } else if (!categoria.value) {
      erro = 'Selecione uma categoria.';
      campo = categoria;
    } else if (link.value && !link.validity.valid) {
      erro = 'Informe um link válido, começando com http:// ou https://.';
      campo = link;
    }

    if (erro) {
      evento.preventDefault();
      mostrarMensagem(erro);
      campo.focus();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  configurarConfirmacoes();
  configurarPreviaImagemPin();
});
