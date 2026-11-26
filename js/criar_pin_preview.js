'use strict';

(() => {
  function configurarPreviaImagem() {
    const form = document.querySelector('#formulario-criar-pin');
    const arquivo = document.querySelector('#criar-pin-arquivo');
    const areaSoltar = document.querySelector('#criar-pin-soltar');
    const imagem = document.querySelector('#criar-pin-imagem');
    const previa = document.querySelector('#criar-pin-previa');
    const orientacao = document.querySelector('#criar-pin-orientacao');
    const acoes = document.querySelector('#criar-pin-imagem-acoes');
    const mensagem = document.querySelector('#criar-pin-mensagem');

    if (!form || !arquivo || !areaSoltar || !imagem || !previa || !orientacao || !acoes) {
      return;
    }

    let urlPreviaTemporaria = '';
    const tamanhoMaximo = Number(arquivo.dataset.tamanhoMaximo);

    function definirMensagem(texto, tipo = '') {
      if (!mensagem) {
        return;
      }
      mensagem.textContent = texto;
      mensagem.classList.toggle('criar-pin-mensagem-erro', tipo === 'erro');
      mensagem.classList.toggle('criar-pin-mensagem-sucesso', tipo === 'sucesso');
      mensagem.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');
    }

    function limparUrlTemporaria() {
      if (urlPreviaTemporaria) {
        URL.revokeObjectURL(urlPreviaTemporaria);
        urlPreviaTemporaria = '';
      }
    }

    function exibirArquivo(arquivoEscolhido) {
      if (!arquivoEscolhido) {
        return false;
      }

      if (arquivoEscolhido.size > tamanhoMaximo) {
        arquivo.value = '';
        definirMensagem('A imagem ultrapassa o limite de 10 MB.', 'erro');
        return false;
      }

      const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
      if (arquivoEscolhido.type && !tiposPermitidos.includes(arquivoEscolhido.type)) {
        arquivo.value = '';
        definirMensagem('Selecione uma imagem JPG, PNG ou WEBP.', 'erro');
        return false;
      }

      limparUrlTemporaria();
      urlPreviaTemporaria = URL.createObjectURL(arquivoEscolhido);
      imagem.src = urlPreviaTemporaria;
      previa.hidden = false;
      orientacao.hidden = true;
      acoes.hidden = false;
      areaSoltar.classList.add('criar-pin-soltar-com-imagem');
      definirMensagem('');
      return true;
    }

    arquivo.addEventListener('change', () => {
      exibirArquivo(arquivo.files?.[0]);
    });

    areaSoltar.addEventListener('click', (evento) => {
      if (evento.target !== arquivo) {
        arquivo.click();
      }
    });

    areaSoltar.addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter' || evento.key === ' ') {
        evento.preventDefault();
        arquivo.click();
      }
    });

    areaSoltar.addEventListener('dragover', (evento) => {
      evento.preventDefault();
      areaSoltar.classList.add('criar-pin-soltar-destacado');
    });

    areaSoltar.addEventListener('dragleave', (evento) => {
      if (!areaSoltar.contains(evento.relatedTarget)) {
        areaSoltar.classList.remove('criar-pin-soltar-destacado');
      }
    });

    areaSoltar.addEventListener('drop', (evento) => {
      evento.preventDefault();
      areaSoltar.classList.remove('criar-pin-soltar-destacado');
      const arquivoArrastado = evento.dataTransfer?.files?.[0];
      if (!arquivoArrastado) {
        return;
      }
      const transferencia = new DataTransfer();
      transferencia.items.add(arquivoArrastado);
      arquivo.files = transferencia.files;
      exibirArquivo(arquivoArrastado);
    });

    document
      .querySelector('.criar-pin-substituir')
      ?.addEventListener('click', () => arquivo.click());

    document.querySelector('.criar-pin-remover')?.addEventListener('click', () => {
      arquivo.value = '';
      limparUrlTemporaria();
      imagem.removeAttribute('src');
      previa.hidden = true;
      orientacao.hidden = false;
      acoes.hidden = true;
      areaSoltar.classList.remove('criar-pin-soltar-com-imagem');
      definirMensagem('');
    });

    form.addEventListener('submit', (evento) => {
      const arquivoSelecionado = arquivo.files?.[0];
      const imagemObrigatoria = form.dataset.imagemObrigatoria === 'true';
      if (imagemObrigatoria && !arquivoSelecionado) {
        evento.preventDefault();
        definirMensagem('Selecione uma imagem para publicar o Pin.', 'erro');
        areaSoltar.focus();
        return;
      }
      if (arquivoSelecionado && arquivoSelecionado.size > tamanhoMaximo) {
        evento.preventDefault();
        definirMensagem('A imagem ultrapassa o limite de 10 MB.', 'erro');
        areaSoltar.focus();
      }
    });

    window.addEventListener('pagehide', limparUrlTemporaria, { once: true });
  }

  document.addEventListener('DOMContentLoaded', configurarPreviaImagem);
})();
