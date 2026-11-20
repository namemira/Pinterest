<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Encontre inspiração e descubra ideias para criar uma vida que você ama no Pinterest.">
    <title>Pinterest — ideias para uma vida que você ama</title>
    <link rel="stylesheet" href="../css/inicial.css">
    <link rel="icon" href="../Imagens/Icone.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
</head>
<body>
    <a class="skip-link" href="#conteudo-principal">Pular para o conteúdo</a>
<?php require_once __DIR__ . '/includes/cabecalho.php'; ?>

    <main id="conteudo-principal">
        <section class="hero" aria-labelledby="titulo-principal">
            <div class="hero-copy">
                <p class="eyebrow">Inspiração para a vida real</p>
                <h1 id="titulo-principal">Crie a vida que você ama no <span>Pinterest</span></h1>
                <p class="hero-description">Descubra ideias, salve suas inspirações favoritas e transforme planos em projetos do seu jeito.</p>
                <div class="hero-actions">
                    <a class="button button-red" href="Cadastro.html">Entre no Pinterest gratuitamente</a>
                    <a class="button button-outline" href="Login.html">Já tenho uma conta</a>
                </div>
            </div>

            <div class="hero-collage" role="group" aria-label="Ideias de moda, decoração, arte e viagens">
                <figure class="collage-card collage-travel">
                    <img src="../Imagens/viagens.jpg" alt="Praia de águas azuis cercada por montanhas">
                    <figcaption>Um lugar para sonhar</figcaption>
                </figure>
                <figure class="collage-card collage-fashion">
                    <img src="../Imagens/moda.jpg" alt="Vestido de noiva branco em um ambiente elegante">
                    <figcaption>Seu estilo, suas ideias</figcaption>
                </figure>
                <figure class="collage-card collage-home">
                    <img src="../Imagens/decoracao.jpg" alt="Sala aconchegante com decoração em tons naturais">
                    <figcaption>Um espaço com a sua cara</figcaption>
                </figure>
                <figure class="collage-card collage-art">
                    <img src="../Imagens/arte.jpg" alt="Pintura abstrata em tons de azul e verde">
                </figure>
                <span class="collage-note">Inspiração para todos os dias</span>
            </div>
        </section>

        <section class="story-section story-ideas" id="ideias-favoritas" data-search-terms="ideias favoritas receitas arte decoração inspiração">
            <div class="story-copy">
                <p class="eyebrow">Salve o que faz sentido para você</p>
                <h2>Dê vida às suas ideias favoritas</h2>
                <p>Reúna referências de receitas, decoração e arte em um só lugar. Suas próximas ideias começam com uma inspiração.</p>
                <a class="text-link" href="Explore.html">Explore novas ideias <span aria-hidden="true">→</span></a>
            </div>
            <div class="idea-gallery" aria-label="Inspirações para criar">
                <figure class="idea-image idea-art">
                    <img src="../Imagens/arte.jpg" alt="Pintura abstrata para inspirar novas criações">
                    <figcaption>Arte para descobrir</figcaption>
                </figure>
                <figure class="idea-image idea-recipe">
                    <img src="../Imagens/receitas.jpg" alt="Receita ilustrada de pavê de limão">
                    <figcaption>Uma receita para experimentar</figcaption>
                </figure>
                <figure class="idea-image idea-home">
                    <img src="../Imagens/decoracao.jpg" alt="Sala decorada com cores quentes e plantas">
                    <figcaption>Detalhes para sua casa</figcaption>
                </figure>
            </div>
        </section>

        <section class="story-section story-tone" id="tons-de-pele" data-search-terms="tom tons pele moda beleza">
            <div class="tone-visual" role="img" aria-label="Paleta ilustrativa com uma variedade de tons de pele">
                <div class="tone-swatch tone-one"></div>
                <div class="tone-swatch tone-two"></div>
                <div class="tone-swatch tone-three"></div>
                <div class="tone-swatch tone-four"></div>
                <div class="tone-swatch tone-five"></div>
                <div class="tone-caption">Paleta ilustrativa. Fotos específicas de referência não estão disponíveis neste projeto.</div>
            </div>
            <div class="story-copy">
                <p class="eyebrow">Inspiração que representa você</p>
                <h2>Pesquise por tom de pele</h2>
                <p>Explore referências de beleza e estilo com mais intenção. Use a busca para encontrar ideias que conversem com você.</p>
                <a class="text-link" href="Explore.html">Descubra referências <span aria-hidden="true">→</span></a>
            </div>
        </section>

        <section class="story-section story-boards" id="pastas-compartilhadas" data-search-terms="pastas compartilhadas colaborar organizar ideias">
            <div class="story-copy">
                <p class="eyebrow">Planejem juntos</p>
                <h2>Colabore com pastas compartilhadas</h2>
                <p>Organize referências para uma viagem, uma receita ou um novo espaço e convide outras pessoas para construir a ideia com você.</p>
                <a class="text-link" href="Cadastro.html">Comece a salvar ideias <span aria-hidden="true">→</span></a>
            </div>
            <div class="board-preview">
                <div class="board-preview-heading">
                    <span class="board-avatar" aria-hidden="true">I</span>
                    <div><strong>Ideias para o fim de semana</strong><small>Uma pasta para compartilhar</small></div>
                    <span class="board-more" aria-hidden="true">•••</span>
                </div>
                <div class="board-preview-grid">
                    <img src="../Imagens/decoracao.jpg" alt="Ideia de decoração para compartilhar">
                    <img src="../Imagens/viagens.jpg" alt="Destino de viagem salvo na pasta">
                    <img src="../Imagens/receitas.jpg" alt="Receita para preparar com outras pessoas">
                </div>
                <div class="board-collaborators" aria-label="Pasta colaborativa">
                    <span class="collaborator-avatar collaborator-one">A</span>
                    <span class="collaborator-avatar collaborator-two">M</span>
                    <span class="collaborator-avatar collaborator-three">L</span>
                    <span>Ideias melhores juntas</span>
                </div>
            </div>
        </section>

        <section class="story-section story-visual-search" id="pesquisa-visual" data-search-terms="pesquisar visualmente imagens busca fotografia">
            <div class="visual-search-art">
                <img class="visual-search-photo" src="../Imagens/viagens.jpg" alt="Praia usada como exemplo de inspiração visual">
                <span class="visual-search-lens" aria-hidden="true">
                    <img src="../Imagens/lupa.png" alt="">
                </span>
                <div class="visual-search-label">Encontre ideias parecidas com o que você gosta</div>
            </div>
            <div class="story-copy">
                <p class="eyebrow">Uma imagem pode levar a muitas ideias</p>
                <h2>Pesquise visualmente com imagens</h2>
                <p>Parta de uma referência visual e encontre outras inspirações para completar seu próximo projeto.</p>
                <a class="text-link" href="Explore.html">Continue explorando <span aria-hidden="true">→</span></a>
            </div>
        </section>

        <section class="signup-section" id="cadastro" aria-labelledby="titulo-cadastro">
            <div class="signup-intro">
                <img src="../Imagens/Icone.png" alt="Ícone do Pinterest" class="signup-logo">
                <p class="eyebrow">Um mundo de ideias espera por você</p>
                <h2 id="titulo-cadastro">Que bom ter você no Pinterest</h2>
                <p>Crie sua conta para guardar inspirações e encontrar ideias para tudo o que você ama.</p>
            </div>

            <form class="signup-card" id="tela-cadastro" novalidate>
                <h3>Cadastre-se</h3>
                <p class="signup-card-intro">Preencha seus dados para continuar.</p>

                <div class="form-field">
                    <label for="nome">Nome</label>
                    <input type="text" id="nome" name="nome" autocomplete="name" maxlength="60" placeholder="Seu nome" required>
                </div>
                <div class="form-field">
                    <label for="email">E-mail</label>
                    <input type="email" id="email" name="email" autocomplete="email" placeholder="Seu e-mail" required>
                </div>
                <div class="form-field">
                    <label for="senha">Senha</label>
                    <input type="password" id="senha" name="senha" autocomplete="new-password" minlength="8" placeholder="Crie uma senha" required>
                    <small>Use pelo menos 8 caracteres.</small>
                </div>
                <div class="form-field">
                    <label for="nascimento">Data de nascimento</label>
                    <input type="date" id="nascimento" name="nascimento" autocomplete="bday" required min="1900-01-01">
                </div>

                <button class="button button-red signup-submit" type="submit">Continuar</button>
                <div class="signup-divider"><span>ou</span></div>
                <button class="button google-button" type="button" disabled>
                    <svg class="icone-google" viewBox="0 0 48 48" aria-hidden="true">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.430 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Continuar com Google
                </button>
                <small class="google-note">Integração com Google indisponível nesta demonstração.</small>

                <p class="terms-copy">Ao continuar, você concorda com os <a href="#termos">Termos de Serviço</a> e confirma que leu a <a href="#privacidade">Política de Privacidade</a>.</p>
                <p class="existing-account">Já tem uma conta? <a href="Login.html">Entrar</a></p>
            </form>
        </section>
    </main>

    <footer class="site-footer">
        <div class="footer-brand">
            <a class="brand" href="Inicial.html" aria-label="Pinterest, voltar ao início">
                <img src="../Imagens/Pinterest.png" alt="Pinterest">
            </a>
            <p>Descubra ideias para criar uma vida que você ama.</p>
        </div>
        <div class="footer-column">
            <h2>Descubra</h2>
            <a href="Explore.html">Explorar ideias</a>
            <a href="Principal.html">Ver Pins</a>
            <a href="#pesquisa-inicial">Pesquisar</a>
        </div>
        <div class="footer-column">
            <h2>Sobre</h2>
            <p id="sobre-pinterest">O Pinterest é um espaço para encontrar e guardar inspiração.</p>
            <p id="empresas-pinterest">Informações para empresas ainda não disponíveis neste projeto.</p>
            <p id="noticias-pinterest">Notícias institucionais ainda não disponíveis neste projeto.</p>
        </div>
        <div class="footer-column footer-legal">
            <h2>Termos e privacidade</h2>
            <p id="termos">Esta demonstração não cria uma conta real nem envia seus dados.</p>
            <p id="privacidade">Os dados informados são validados apenas no navegador.</p>
            <a href="Cadastro.html">Criar conta</a>
            <a href="Login.html">Entrar</a>
        </div>
        <p class="footer-note">Clone do Pinterest feito para fins educacionais (Desenvolvimento Web I – IFC Concórdia). Sem vínculo com a Pinterest, Inc. Todos os dados exibidos são fictícios.</p>
    </footer>

    <script src="../js/validacao.js" defer></script>
    <script src="../js/inicial.js" defer></script>
</body>
</html>
