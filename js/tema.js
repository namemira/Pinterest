// Recupera o tema salvo
function aplicarTema() {
    const temaSalvo = localStorage.getItem('tema') || 'claro';

    document.body.classList.toggle(
        'tema-escuro',
        temaSalvo === 'escuro'
    );
}

// Aplica o tema ao abrir qualquer página
aplicarTema();

// Troca o tema quando selecionar uma opção
document.querySelectorAll('input[name="tema"]').forEach((opcao) => {

    opcao.addEventListener('change', () => {
        localStorage.setItem('tema', opcao.value);
        aplicarTema();
    });

    opcao.checked = opcao.value === localStorage.getItem('tema');
});
