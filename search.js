document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const resultList = document.getElementById('results');

    const sourceNameMap = {
        'atop-games': 'Atop Games',
        'onlinefix': 'Online Fix',
        'steamrip': 'Steamrip',
        'shisuyssource': 'Shisuy Source',
        'fontekazumi': 'Kazumi'
    };

    function getHostName(url) {
        try {
            const hostname = new URL(url).hostname;
            return hostname.replace(/^www\./, '').split('.')[0];
        } catch {
            return 'download';
        }
    }

    searchBtn.addEventListener('click', async () => {
        const query = searchInput.value.trim().toLowerCase();
        resultList.innerHTML = '<p class="text-center">Carregando...</p>';

        if (!query) {
            resultList.innerHTML = '<p class="text-center">Digite algo para buscar.</p>';
            return;
        }

        const sources = getJsonSources();
        const results = [];

        for (const url of sources) {
            try {
                const res = await fetch(url);
                const data = await res.json();

                let jogos = [];

                if (!Array.isArray(data)) {
                    for (const key in data) {
                        if (Array.isArray(data[key])) {
                            jogos = data[key];
                            break;
                        }
                    }
                } else {
                    jogos = data;
                }

                const rawSourceName = url.split('/').pop().replace('.json', '').toLowerCase();

                const sourceName = sourceNameMap[rawSourceName] ||
                    rawSourceName.charAt(0).toUpperCase() + rawSourceName.slice(1);

                jogos.forEach(item => {
                    const title = (item.title || item.name || '').toLowerCase();
                    if (title.includes(query)) {
                        results.push({ ...item, _source: sourceName });
                    }
                });

            } catch (err) {
                console.warn(`Erro ao buscar de ${url}:`, err);
            }
        }

        resultList.innerHTML = '';

        if (results.length === 0) {
            resultList.innerHTML = '<li>Nenhum jogo encontrado.</li>';
            console.log("Nenhum jogo encontrado.");
        } else {
            results.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'list-group-item-action', 'bg-light', 'border', 'rounded', 'p-3', 'text-wrap'); //Bootstrap

                const title = item.title || item.name || 'Título não disponível';
                const size = item.fileSize || item.size || 'Tamanho desconhecido';
                const date = item.uploadDate || item.date || '';
                const dateStr = date ? new Date(date).toLocaleDateString() : 'Data não disponível';

                const uris = item.uris || item.download || [];
                let links = 'Link indisponível';

                if (Array.isArray(uris) && uris.length > 0) {
                    links = uris.map(link => {
                        let label;
                        if (link.startsWith('magnet:')) {
                            label = 'Torrent';
                        } else {
                            const hostName = getHostName(link);
                            label = `${hostName.charAt(0).toUpperCase() + hostName.slice(1)}`;
                        }
                        return `<a href="${link}" target="_blank" class="btn btn-lg btn-outline-success text-decoration-none d-block mb-2">${label} <i class="bi bi-arrow-right"></i></a>`; //Bootstrap
                    }).join(' '); //Bootstrap
                } else if (item.torrent) {
                    const torrentLink = item.torrent;
                    links = `<a href="${torrentLink}" target="_blank">Torrent</a>`;
                }

                const source = item._source || 'Desconhecida';

                li.innerHTML = `
        <strong>🎮 Jogo:</strong> ${title}<br>
        <strong>📦 Tamanho:</strong> ${size}<br>
        <strong>📅 Upload:</strong> ${dateStr}<br>
        <strong>🌐 Fonte:</strong> ${source}<br>
        <strong>⬇️ Download:</strong> ${links}
    `;

                resultList.appendChild(li);
            });
        }
    });
});