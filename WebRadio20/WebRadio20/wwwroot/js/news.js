// news.js - Versão Corrigida

(function () {
    // Configurações
    const API_URL = '/api/YoutubeVideo';
    const containerId = 'news-list-container'; // ID EXATO do HTML
    const detailOverlayId = 'news-detail-overlay';
    const detailBodyId = 'news-detail-body';
    let allNewsData = [];

    // Elementos DOM (Iniciados como null)
    let container = null;
    let overlay = null;
    let detailBody = null;
    let closeBtn = null;
    let categoryButtons = null;
    // Inicia o intervalo de atualização a cada 3 minutos
    myVar = setInterval(fetchNews, 180000);

    // Função Principal: Buscar Notícias (Corrigida para a estrutura da API)
    async function fetchNews() {
        container = document.getElementById(containerId);

        if (!container) {
            console.error('ERRO CRÍTICO: Container de notícias não encontrado!');
            return;
        }

        container.innerHTML = '<div class="loading-spinner">Carregando últimas notícias...</div>';

        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Erro na API: ' + response.status);

            const rawData = await response.json();

            // Verifica se o status é true e se data existe
            if (!rawData.status || !rawData.data) {
                throw new Error('Resposta inválida da API');
            }

            const dataObj = rawData.data;
            let allItems = [];

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

            if (allNewsData.length === 0) {
                container.innerHTML = '<p class="empty-msg">Nenhuma notícia encontrada.</p>';
            } else {
                renderNews(allNewsData);
                console.log('Notícias carregadas:', allNewsData.length);
            }

        } catch (error) {
            console.error('Erro ao carregar notícias:', error);
            container.innerHTML = '<p class="error-msg">Não foi possível carregar as notícias. Erro: ' + error.message + '</p>';
        }
    }

    // Função para Renderizar os Cards (Corrigida para os campos da API)
    function renderNews(newsList) {
        if (!container) return;

        if (!newsList || newsList.length === 0) {
            container.innerHTML = '<p class="empty-msg">Nenhuma notícia encontrada.</p>';
            return;
        }

        let html = '';
        newsList.forEach(item => {
            // Mapeamento dos campos da API para o HTML
            const title = item.title || 'Sem título';
            const channel = item.canal || 'Canal';
            const dateStr = item.publicado_em || '';
            const thumbnail = item.thumbnail || item.canal_thumbnail || 'https://via.placeholder.com/320x180?text=Sem+Imagem';
            const category = item.segmento || 'Geral';
            const videoId = item.videoId || item.id; // Usa videoId se existir, senão id

            html += `
        <article class="news-card">
          <div class="news-thumb">
            <img src="${thumbnail}" alt="${title}">
            <span class="news-cat-badge">${category}</span>
          </div>
          <div class="news-content">
            <h3 class="news-title">${title}</h3>
            <p class="news-source">${channel}</p>
            <span class="news-date">${dateStr}</span>
            <button class="read-more-btn" onclick="openNewsDetail(${item.id})">Ler mais</button>
          </div>
        </article>
      `;
        });

        container.innerHTML = html;
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

    // Função para Abrir o Detalhe (Modal) - SOLUÇÃO COM PLACEHOLDER (Lazy Load)
    window.openNewsDetail = async function (id) {
        const overlay = $('#news-detail-overlay');
        const detailBody = $('#news-detail-body');

        if (!overlay.length || !detailBody.length) {
            console.error('Elementos do modal não encontrados!');
            return;
        }

        // 1. Limpa e abre o modal
        detailBody.empty();
        overlay.css('display', 'flex');

        try {
            const item = allNewsData.find(n => n.id === id);
            if (!item) throw new Error('Notícia não encontrada.');

            let videoId = item.videoId;
            if (!videoId) throw new Error('ID do vídeo não encontrado.');

            videoId = String(videoId).trim().replace(/[^\w-]/g, '');
            if (videoId.length < 11) throw new Error('ID inválido.');

            const videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            const thumbnailUrl = item.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

            // 2. Cria o Placeholder (Thumbnail com botão de Play)
            // Isso evita o carregamento imediato dos scripts do YouTube
            const placeholderHtml = `
        <div class="video-placeholder" style="position:relative; width:100%; max-width:800px; margin:0 auto; cursor:pointer; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.2);">
          <img src="${thumbnailUrl}" alt="Assistir ${item.title}" style="width:100%; display:block;">
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:80px; height:80px; background:rgba(200,0,0,0.9); border-radius:50%; display:flex; align-items:center; justify-content:center; transition:transform 0.2s;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <div style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.7); color:white; padding:4px 8px; font-size:12px; border-radius:4px;">
            Clique para assistir
          </div>
        </div>
      `;

            detailBody.html(`
        ${placeholderHtml}
        <h2 class="detail-title" style="margin-top:15px;">${item.title}</h2>
        <div class="detail-meta">
          <span class="detail-source">${item.canal}</span>
          <span class="detail-date">${item.publicado_em}</span>
        </div>
        <div class="detail-desc">${item.description || 'Sem descrição disponível.'}</div>
      `);

            // 3. Adiciona o evento de clique para carregar o iframe REAL
            $('.video-placeholder').on('click', function () {
                const placeholder = $(this);

                // Substitui o placeholder pelo iframe
                placeholder.replaceWith(`
          <div class="video-wrapper">
            <iframe width="100%" height="400" 
                    src="${videoUrl}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
            </iframe>
          </div>
        `);

                //console.log('Vídeo carregado via clique (evitando bloqueio inicial).');
            });

        } catch (error) {
            console.error('Erro:', error);
            detailBody.html(`
        <div class="error-msg" style="text-align:center; padding:20px; background:#fff3f3; border:1px solid #ffcccc; border-radius:8px;">
          <h3 style="color:#d32f2f;">Erro ao carregar notícia</h3>
          <p>${error.message}</p>
          <button onclick="$('#news-detail-overlay').hide()" style="margin-top:10px; padding:8px 16px; background:#d32f2f; color:white; border:none; border-radius:4px; cursor:pointer;">Fechar</button>
        </div>
      `);
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

        // Verifica se o container existe antes de tudo
        if (!container) {
            console.error('Inicialização falhou: Container de notícias não encontrado.');
            return;
        }

        fetchNews();

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


