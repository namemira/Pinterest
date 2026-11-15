'use strict';

function criarMensagem(campo, sufixo, papel) {
  const mensagem = document.createElement('p');
  mensagem.id = `${campo.id}-${sufixo}`;
  mensagem.className = `mensagem-validacao ${sufixo}`;
  mensagem.setAttribute('aria-live', papel === 'alert' ? 'assertive' : 'polite');
  mensagem.setAttribute('role', papel);
  mensagem.hidden = true;
  campo.insertAdjacentElement('afterend', mensagem);

  const descricoes = (campo.getAttribute('aria-describedby') || '')
    .split(/\s+/)
    .filter(Boolean);

  if (!descricoes.includes(mensagem.id)) {
    descricoes.push(mensagem.id);
  }

  campo.setAttribute('aria-describedby', descricoes.join(' '));
  return mensagem;
}

function exibirMensagem(mensagem, texto) {
  mensagem.textContent = texto;
  mensagem.hidden = texto.length === 0;
}

function definirErro(campo, mensagem, texto) {
  exibirMensagem(mensagem, texto ? `Erro: ${texto}` : '');
  campo.setAttribute('aria-invalid', texto ? 'true' : 'false');
  return Boolean(texto);
}

function obterDataLocalISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function configurarCadastro(formulario) {
  const email = formulario.querySelector('#email');
  const senha = formulario.querySelector('#senha');
  const nascimento = formulario.querySelector('#nascimento');

  if (!email || !senha || !nascimento) {
    return;
  }

  const mensagens = {
    email: criarMensagem(email, 'mensagem-erro', 'alert'),
    senha: criarMensagem(senha, 'mensagem-erro', 'alert'),
    nascimento: criarMensagem(nascimento, 'mensagem-erro', 'alert')
  };
  const resultado = document.createElement('p');
  resultado.className = 'mensagem-resultado';
  resultado.setAttribute('role', 'status');
  resultado.setAttribute('aria-live', 'polite');
  resultado.hidden = true;
  formulario.appendChild(resultado);

  let formularioEnviado = false;

  function validarCampos() {
    let possuiErros = false;
    const valorEmail = email.value.trim();
    const valorSenha = senha.value;
    const valorNascimento = nascimento.value;

    let erroEmail = '';
    if (!valorEmail) {
      erroEmail = 'Informe seu e-mail.';
    } else if (email.validity.typeMismatch) {
      erroEmail = 'Informe um endereço de e-mail válido.';
    }

    let erroSenha = '';
    if (!valorSenha) {
      erroSenha = 'Informe uma senha.';
    } else if (valorSenha.length < 8) {
      erroSenha = 'A senha deve ter pelo menos 8 caracteres.';
    }

    let erroNascimento = '';
    if (!valorNascimento) {
      erroNascimento = 'Informe sua data de nascimento.';
    } else if (nascimento.validity.badInput) {
      erroNascimento = 'Informe uma data de nascimento válida.';
    } else if (valorNascimento > obterDataLocalISO()) {
      erroNascimento = 'A data de nascimento não pode ser futura.';
    }

    possuiErros = definirErro(email, mensagens.email, erroEmail) || possuiErros;
    possuiErros = definirErro(senha, mensagens.senha, erroSenha) || possuiErros;
    possuiErros = definirErro(
      nascimento,
      mensagens.nascimento,
      erroNascimento
    ) || possuiErros;

    return !possuiErros;
  }

  formulario.noValidate = true;

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    formularioEnviado = true;
    exibirMensagem(resultado, '');

    if (validarCampos()) {
      exibirMensagem(
        resultado,
        'Dados validados no navegador. O cadastro real dependerá da integração com PHP.'
      );
    }
  });

  formulario.addEventListener('input', () => {
    if (!formularioEnviado) {
      return;
    }

    exibirMensagem(resultado, '');
    if (validarCampos()) {
      exibirMensagem(
        resultado,
        'Dados validados no navegador. O cadastro real dependerá da integração com PHP.'
      );
    }
  });

  formulario.addEventListener('change', () => {
    if (!formularioEnviado) {
      return;
    }

    exibirMensagem(resultado, '');
    if (validarCampos()) {
      exibirMensagem(
        resultado,
        'Dados validados no navegador. O cadastro real dependerá da integração com PHP.'
      );
    }
  });
}

function configurarLogin(formulario) {
  const email = formulario.querySelector('#email');
  const senha = formulario.querySelector('#senha');
  const botaoEntrar = formulario.querySelector('#Entrar');

  if (!email || !senha) {
    return;
  }

  const mensagens = {
    email: criarMensagem(email, 'mensagem-erro', 'alert'),
    senha: criarMensagem(senha, 'mensagem-erro', 'alert')
  };
  const resultado = document.createElement('p');
  resultado.className = 'mensagem-resultado';
  resultado.setAttribute('role', 'status');
  resultado.setAttribute('aria-live', 'polite');
  resultado.hidden = true;
  formulario.appendChild(resultado);

  let formularioEnviado = false;

  function validarCampos() {
    const valorEmail = email.value.trim();
    const valorSenha = senha.value;

    let erroEmail = '';
    if (!valorEmail) {
      erroEmail = 'Informe seu e-mail.';
    } else if (email.validity.typeMismatch) {
      erroEmail = 'Informe um endereço de e-mail válido.';
    }

    const erroSenha = valorSenha ? '' : 'Informe sua senha.';
    const possuiErroEmail = definirErro(email, mensagens.email, erroEmail);
    const possuiErroSenha = definirErro(senha, mensagens.senha, erroSenha);

    return !possuiErroEmail && !possuiErroSenha;
  }

  formulario.noValidate = true;

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    formularioEnviado = true;
    exibirMensagem(resultado, '');

    if (validarCampos()) {
      exibirMensagem(
        resultado,
        'Dados validados no navegador. A autenticação real depende da integração com PHP.'
      );
    }
  });

  function atualizarValidacao() {
    if (!formularioEnviado) {
      return;
    }

    exibirMensagem(resultado, '');
    if (validarCampos()) {
      exibirMensagem(
        resultado,
        'Dados validados no navegador. A autenticação real depende da integração com PHP.'
      );
    }
  }

  formulario.addEventListener('input', atualizarValidacao);
  formulario.addEventListener('change', atualizarValidacao);

  // Impede o onclick antigo do HTML de navegar e mantém o fluxo apenas no navegador.
  if (botaoEntrar) {
    formulario.addEventListener('click', (evento) => {
      if (!(evento.target instanceof Element)) {
        return;
      }

      const botaoClicado = evento.target.closest('#Entrar');
      if (!botaoClicado || !formulario.contains(botaoClicado)) {
        return;
      }

      evento.preventDefault();
      evento.stopImmediatePropagation();
      formulario.requestSubmit(botaoEntrar);
    }, true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const formularioCadastro = document.querySelector('#tela-cadastro');
  const formularioLogin = document.querySelector('#tela-login');

  if (formularioCadastro) {
    configurarCadastro(formularioCadastro);
  }

  if (formularioLogin) {
    configurarLogin(formularioLogin);
  }
});
