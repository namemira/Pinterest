'use strict';

// Cria mensagens de validação associadas ao campo para leitores de tela.
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

// Exibe ou oculta uma mensagem sem inserir texto como HTML.
function exibirMensagem(mensagem, texto) {
  mensagem.textContent = texto;
  mensagem.hidden = texto.length === 0;
}

// Sincroniza o texto do erro com o estado aria-invalid do campo.
function definirErro(campo, mensagem, texto) {
  exibirMensagem(mensagem, texto ? `Erro: ${texto}` : '');
  campo.setAttribute('aria-invalid', texto ? 'true' : 'false');
  return Boolean(texto);
}

// Retorna a data local no formato usado pelo campo de nascimento.
function obterDataLocalISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// Configura validação do cadastro e feedback após o envio do formulário.
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

  // Faz a validação própria do formulário para apresentar mensagens acessíveis.
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

// Configura validação do login, alternância de senha e ações informativas.
function configurarLogin(formulario) {
  const email = formulario.querySelector('#email');
  const senha = formulario.querySelector('#senha');
  const botaoFechar = formulario.querySelector('#fechar-login');
  const botaoAlternarSenha = formulario.querySelector('#alternar-senha');
  const botaoRecuperacao = formulario.querySelector('#recuperar-senha');

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
  const mensagemSucesso =
    'Dados validados no navegador. A autenticação real será implementada posteriormente com PHP.';

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
      exibirMensagem(resultado, mensagemSucesso);
    }
  });

  // Revalida após o envio, sem mostrar resultado antes da primeira tentativa.
  function atualizarValidacao() {
    if (!formularioEnviado) {
      return;
    }

    exibirMensagem(resultado, '');
    if (validarCampos()) {
      exibirMensagem(resultado, mensagemSucesso);
    }
  }

  formulario.addEventListener('input', atualizarValidacao);
  formulario.addEventListener('change', atualizarValidacao);

  botaoAlternarSenha?.addEventListener('click', () => {
    const senhaVisivel = senha.type === 'password';
    senha.type = senhaVisivel ? 'text' : 'password';
    botaoAlternarSenha.setAttribute('aria-pressed', String(senhaVisivel));
    botaoAlternarSenha.setAttribute(
      'aria-label',
      senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'
    );
    botaoAlternarSenha.textContent = senhaVisivel ? 'Ocultar' : 'Mostrar';
  });

  botaoRecuperacao?.addEventListener('click', () => {
    exibirMensagem(
      resultado,
      'A recuperação de senha ainda não está disponível nesta versão.'
    );
  });

  botaoFechar?.addEventListener('click', () => {
    window.location.href = 'Inicial.html';
  });
}

// Inicializa apenas os formulários presentes na página atual.
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
