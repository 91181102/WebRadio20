// news.js - Versão Corrigida

(function () {
    // Configurações
    const API_URL = '/api/YoutubeVideo';
    const containerId = 'news-list-container'; // ID EXATO do HTML
    const detailOverlayId = 'news-detail-overlay';
    const detailBodyId = 'news-detail-body';
    let allNewsData = [];
    let hasLoadedNews = false;

    // Elementos DOM (Iniciados como null)
    let container = null;
    let overlay = null;
    let detailBody = null;
    let closeBtn = null;
    let categoryButtons = null;
    let updateStatus = null;

    // Inicia o intervalo de atualização a cada 3 minutos
    //myVar = setInterval(fetchNews, 180000);
    // Intervalo entre atualizações: 3 minutos
    const UPDATE_INTERVAL = 180000;
    let updateTimer = null;

    // Função Principal: Buscar Notícias (Corrigida para a estrutura da API)
    async function fetchNews() {
        container = document.getElementById(containerId);

        if (!container) {
            console.error('ERRO CRÍTICO: Container de notícias não encontrado!');
            return;
        }

        //container.innerHTML = '<div class="loading-spinner">Carregando últimas notícias...</div>';

        if (!hasLoadedNews) {
            const loading = document.createElement('div');
            loading.className = 'loading-spinner';
            loading.textContent = 'Carregando últimas notícias...';

            container.replaceChildren(loading);
        }


        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Erro na API: ' + response.status);

            const rawData = await response.json();
            hideUpdateError();

            // Verifica se o status é true e se data existe
            if (!rawData.status || !rawData.data) {
                throw new Error('Resposta inválida da API');
            }

            const dataObj = rawData.data;
            let allItems = [];
            hasLoadedNews = true;

            // Extrai todas as listas de categorias e adiciona a propriedade 'category'
            for (const key in dataObj) {
                if (Array.isArray(dataObj[key]) && dataObj[key].length > 0) {
                    // Para cada item na lista, adicionamos a categoria atual (key)
                    dataObj[key].forEach(item => {
                        // Garante que a propriedade 'category' exista e tenha o valor correto
                        // (Usamos 'segmento' se existir, senão usamos a chave da categoria)
                        item.category = item.segmento || key.toUpperCase();

                        // Adiciona à lista global
                        allItems.push(item);
                    });
                }
            }

            // Ordena por data (mais recente primeiro) se houver campo 'publicado_em'
            allItems.sort((a, b) => {
                // Converte a data string "01:08:2026 09:00:30" para objeto Date
                // Formato esperado: DD:MM:YYYY HH:MM:SS
                const parseDate = (str) => {
                    if (!str) return new Date(0);
                    const parts = str.split(' ');
                    const dateParts = parts[0].split(':'); // DD:MM:YYYY
                    const timeParts = parts[1].split(':'); // HH:MM:SS
                    return new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1], timeParts[2]);
                };
                return parseDate(b.publicado_em) - parseDate(a.publicado_em);
            });

            allNewsData = allItems;

            /*if (allNewsData.length === 0) {
                container.innerHTML = '<p class="empty-msg">Nenhuma notícia encontrada.</p>';
            } else {
                renderNews(allNewsData);
                console.log('Notícias carregadas:', allNewsData.length);
            }*/

            if (allNewsData.length === 0) {
                console.info('Nenhuma notícia encontrada na API.');
            } else {
                console.log('Notícias carregadas:', allNewsData.length);
            }

            renderNews(allNewsData);

        } catch (error) { // alterado em 08/11/2026 para capturar erros de fetch e JSON.
            console.error('Erro ao carregar notícias:', error);
            showUpdateError();

            if (!hasLoadedNews) {
                const errorMessage = document.createElement('p');
                errorMessage.className = 'error-msg';
                errorMessage.textContent =
                    'Não foi possível carregar as notícias. Erro: ' + error.message;

                container.replaceChildren(errorMessage);
            }
        }
    }

    // Exibe aviso de falha na atualização
    function showUpdateError() {
        if (!updateStatus) return;

        updateStatus.textContent =
            'Não foi possível atualizar as notícias. Exibindo os últimos dados disponíveis.';

        updateStatus.style.display = 'block';
    }

    // Oculta aviso após atualização bem-sucedida
    function hideUpdateError() {
        if (!updateStatus) return;

        updateStatus.textContent = '';
        updateStatus.style.display = 'none';
    }

    // Agenda a próxima atualização somente após a consulta anterior terminar
    function scheduleNextUpdate() {
        updateTimer = setTimeout(async () => {
            await fetchNews();
            scheduleNextUpdate();
        }, UPDATE_INTERVAL);
    }

    // Função para Renderizar os Cards (08/11/2026)
    function renderNews(newsList) {
        if (!container) return;

        if (!newsList || newsList.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-msg';
            emptyMessage.textContent = 'Nenhuma notícia encontrada.';

            container.replaceChildren(emptyMessage);
            return;
        }

        const fragment = document.createDocumentFragment();

        newsList.forEach(item => {

            const title = String(item.title || 'Sem título');
            const channel = String(item.canal || 'Canal');
            const dateStr = String(item.publicado_em || '');
            const category = String(item.segmento || 'Geral');

            const fallbackImage =
                'https://via.placeholder.com/320x180?text=Sem+Imagem';

            let thumbnail = fallbackImage;

            try {
                const imageUrl = new URL(
                    String(item.thumbnail || item.canal_thumbnail || ''),
                    window.location.href
                );

                if (imageUrl.protocol === 'https:') {
                    thumbnail = imageUrl.href;
                }
            } catch {
                // Mantém a imagem padrão.
            }

            // Card
            const article = document.createElement('article');
            article.className = 'news-card';

            // Thumbnail
            const thumbDiv = document.createElement('div');
            thumbDiv.className = 'news-thumb';

            const img = document.createElement('img');
            img.src = thumbnail;
            img.alt = title;

            const badge = document.createElement('span');
            badge.className = 'news-cat-badge';
            badge.textContent = category;

            thumbDiv.append(img, badge);

            // Conteúdo
            const content = document.createElement('div');
            content.className = 'news-content';

            const heading = document.createElement('h3');
            heading.className = 'news-title';
            heading.textContent = title;

            const source = document.createElement('p');
            source.className = 'news-source';
            source.textContent = channel;

            const date = document.createElement('span');
            date.className = 'news-date';
            date.textContent = dateStr;

            const button = document.createElement('button');
            button.className = 'read-more-btn';
            button.textContent = 'Ler mais';

            button.addEventListener('click', () => {
                window.openNewsDetail(item.id);
            });

            content.append(heading, source, date, button);

            article.append(thumbDiv, content);

            fragment.appendChild(article);
        });

        container.replaceChildren(fragment);
    }

    // Função para Filtrar por Categoria (Corrigida)
    function filterNews(category) {
        if (!container) return;

        if (category === 'all') {
            renderNews(allNewsData);
        } else {
            // Filtra usando a propriedade 'category' que acabamos de criar
            // E converte para maiúsculas para garantir match (já que a API pode vir com maiúsculas ou minúsculas)
            const filtered = allNewsData.filter(item => {
                const itemCat = (item.category || '').toUpperCase();
                const filterCat = category.toUpperCase();
                return itemCat === filterCat;
            });

            renderNews(filtered);
        }
    }

    // Função para Abrir o Detalhe (Modal) - SOLUÇÃO COM PLACEHOLDER (Lazy Load) 08/11/2026.
    window.openNewsDetail = async function (id) {

        const overlayElement = document.getElementById(detailOverlayId);
        const detailBodyElement = document.getElementById(detailBodyId);

        if (!overlayElement || !detailBodyElement) {
            console.error('Elementos do modal não encontrados!');
            return;
        }

        detailBodyElement.replaceChildren();
        overlayElement.style.display = 'flex';

        try {
            const item = allNewsData.find(n => String(n.id) === String(id));

            if (!item) {
                throw new Error('Notícia não encontrada.');
            }

            // Valida o identificador do vídeo
            const videoId = String(item.videoId || '').trim();

            if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
                throw new Error('ID do vídeo inválido.');
            }

            // Valida a thumbnail
            let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

            try {
                const imageUrl = new URL(
                    String(item.thumbnail || ''),
                    window.location.href
                );

                if (imageUrl.protocol === 'https:') {
                    thumbnailUrl = imageUrl.href;
                }
            } catch {
                // Mantém a thumbnail padrão do YouTube.
            }

            const title = String(item.title || 'Sem título');
            const channel = String(item.canal || 'Canal');
            const date = String(item.publicado_em || '');
            const description = String(
                item.description || 'Sem descrição disponível.'
            );

            // Placeholder do vídeo
            const placeholder = document.createElement('div');

            placeholder.className = 'video-placeholder';

            placeholder.style.cssText =
                'position:relative; width:100%; max-width:800px; ' +
                'margin:0 auto; cursor:pointer; border-radius:12px; ' +
                'overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.2);';

            placeholder.setAttribute('role', 'button');
            placeholder.setAttribute('tabindex', '0');
            placeholder.setAttribute('aria-label', 'Assistir vídeo: ' + title);

            const img = document.createElement('img');
            img.src = thumbnailUrl;
            img.alt = 'Assistir ' + title;
            img.style.cssText = 'width:100%; display:block;';

            // Botão Play
            const playButton = document.createElement('div');

            playButton.style.cssText =
                'position:absolute; top:50%; left:50%; ' +
                'transform:translate(-50%,-50%); width:80px; height:80px; ' +
                'background:rgba(200,0,0,0.9); border-radius:50%; ' +
                'display:flex; align-items:center; justify-content:center;';

            const svgNS = 'http://www.w3.org/2000/svg';

            const svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('width', '40');
            svg.setAttribute('height', '40');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'white');

            const path = document.createElementNS(svgNS, 'path');
            path.setAttribute('d', 'M8 5v14l11-7z');

            svg.appendChild(path);
            playButton.appendChild(svg);

            // Instrução
            const instruction = document.createElement('div');

            instruction.textContent = 'Clique para assistir';

            instruction.style.cssText =
                'position:absolute; bottom:10px; left:10px; ' +
                'background:rgba(0,0,0,0.7); color:white; ' +
                'padding:4px 8px; font-size:12px; border-radius:4px;';

            placeholder.append(img, playButton, instruction);

            // Título
            const heading = document.createElement('h2');
            heading.className = 'detail-title';
            heading.style.marginTop = '15px';
            heading.textContent = title;

            // Metadados
            const meta = document.createElement('div');
            meta.className = 'detail-meta';

            const source = document.createElement('span');
            source.className = 'detail-source';
            source.textContent = channel;

            const dateElement = document.createElement('span');
            dateElement.className = 'detail-date';
            dateElement.textContent = date;

            meta.append(source, dateElement);

            // Descrição
            const desc = document.createElement('div');
            desc.className = 'detail-desc';
            desc.textContent = description;

            detailBodyElement.append(
                placeholder,
                heading,
                meta,
                desc
            );

            // Carrega o vídeo somente após o clique
            function loadVideo() {

                const wrapper = document.createElement('div');
                wrapper.className = 'video-wrapper';

                const iframe = document.createElement('iframe');

                iframe.width = '100%';
                iframe.height = '400';
                iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                iframe.title = title;
                iframe.setAttribute('frameborder', '0');

                iframe.setAttribute(
                    'allow',
                    'accelerometer; autoplay; clipboard-write; ' +
                    'encrypted-media; gyroscope; picture-in-picture'
                );

                iframe.setAttribute('allowfullscreen', '');

                wrapper.appendChild(iframe);
                placeholder.replaceWith(wrapper);
            }

            placeholder.addEventListener('click', loadVideo);

            placeholder.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    loadVideo();
                }
            });

        } catch (error) {

            console.error('Erro ao carregar notícia:', error);

            const errorContainer = document.createElement('div');
            errorContainer.className = 'error-msg';

            errorContainer.style.cssText =
                'text-align:center; padding:20px; background:#fff3f3; ' +
                'border:1px solid #ffcccc; border-radius:8px;';

            const heading = document.createElement('h3');
            heading.style.color = '#d32f2f';
            heading.textContent = 'Erro ao carregar notícia';

            const message = document.createElement('p');
            message.textContent = error.message;

            const closeButton = document.createElement('button');

            closeButton.textContent = 'Fechar';

            closeButton.style.cssText =
                'margin-top:10px; padding:8px 16px; ' +
                'background:#d32f2f; color:white; border:none; ' +
                'border-radius:4px; cursor:pointer;';

            closeButton.addEventListener('click', () => {
                overlayElement.style.display = 'none';
                detailBodyElement.replaceChildren();
            });

            errorContainer.append(heading, message, closeButton);

            detailBodyElement.replaceChildren(errorContainer);
        }
    };



    // Inicialização
    document.addEventListener('DOMContentLoaded', () => {
        // Recarrega os elementos caso tenham mudado
        container = document.getElementById(containerId);
        overlay = document.getElementById(detailOverlayId);
        detailBody = document.getElementById(detailBodyId);
        closeBtn = document.getElementById('close-news-btn');
        categoryButtons = document.querySelectorAll('.news-tabs button');
        updateStatus = document.getElementById('news-update-status');

        // Verifica se o container existe antes de tudo
        if (!container) {
            console.error('Inicialização falhou: Container de notícias não encontrado.');
            return;
        }

        //fetchNews();
        fetchNews().finally(scheduleNextUpdate); // atualizado 08/11/2026.

        // Filtros de Categoria
        if (categoryButtons && categoryButtons.length > 0) {
            categoryButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    categoryButtons.forEach(b => b.classList.remove('active'));
                    // Garante que o alvo é um botão
                    if (e.target.tagName === 'BUTTON') {
                        e.target.classList.add('active');
                        filterNews(e.target.dataset.category);
                    }
                });
            });
        }

        // Fechar Modal
        if (closeBtn && overlay) {
            closeBtn.addEventListener('click', () => {
                overlay.style.display = 'none';
                if (detailBody) detailBody.innerHTML = '';
            });
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.style.display = 'none';
                    if (detailBody) detailBody.innerHTML = '';
                }
            });
        }
    });

})();


