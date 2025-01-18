document.getElementById('toggleFilterBtn').addEventListener('click', function() {
    const sourceFilterContainer = document.getElementById('sourceFilterContainer');
    const isHidden = sourceFilterContainer.style.display === 'none' || sourceFilterContainer.style.display === '';
    sourceFilterContainer.style.display = isHidden ? 'block' : 'none';
    sourceFilterContainer.classList.toggle('fadeIn', isHidden);
    sourceFilterContainer.classList.toggle('fadeOut', !isHidden);
});

function createSourceFilter() {
    const sourceFilterContainer = document.getElementById('sourceFilter');
    const jsonSources = getJsonSources();
    const allOption = document.createElement('label');
    allOption.classList.add('custom-checkbox');
    allOption.innerHTML = `
        <input type="checkbox" id="filterAll" value="all" checked> Todos
    `;
    sourceFilterContainer.appendChild(allOption);
    jsonSources.forEach((url, index) => {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const sourceOption = document.createElement('label');
                sourceOption.classList.add('custom-checkbox');
                sourceOption.innerHTML = `
                    <input type="checkbox" id="filter${index}" value="${url}">${data.name}
                `;
                sourceFilterContainer.appendChild(sourceOption);
            })
            .catch(error => console.error(`Erro ao carregar a fonte de ${url}:`, error));
    });
}

function getSelectedSources() {
    const selectedSources = [];
    if (document.getElementById('filterAll').checked) {
        getJsonSources().forEach(url => selectedSources.push(url));
    } else {
        const checkboxes = document.querySelectorAll('#sourceFilter input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            if (checkbox.id !== 'filterAll') selectedSources.push(checkbox.value);
        });
    }
    return selectedSources;
}

function fetchJsons(selectedSources) {
    const allData = [];
    const filteredSources = getJsonSources().filter(source => selectedSources.includes(source));
    return Promise.all(filteredSources.map(url =>
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Erro ao buscar dados de ${url}`);
                return response.json();
            })
            .then(data => {
                const sourceName = data.name;
                const downloadsWithSource = data.downloads.map(download => {
                    const isNewStructure = download.Console && download.Senha;

                    return {
                        ...download,
                        source: sourceName,
                        isTorrent: download.uris.some(uri => uri.includes('magnet:')),
                        uploadDate: new Date(download.uploadDate).toLocaleDateString('pt-BR'),
                        console: isNewStructure ? download.Console : null, 
                        senha: isNewStructure ? download.Senha : null     
                    };
                });
                allData.push(...downloadsWithSource);
            })
            .catch(error => console.error(`Erro ao buscar dados de ${url}:`, error))
    )).then(() => allData);
}

function searchGame() {
    const titleInput = document.getElementById('gameTitle');
    const title = titleInput.value.toLowerCase().trim();
    if (!title) {
        Swal.fire({
            icon: 'warning',
            title: 'Erro!',
            text: 'Por favor, digite o título de um jogo.',
            customClass: { confirmButton: 'swal2-confirm' },
            allowOutsideClick: false,
            showConfirmButton: true
        });
        return;
    }
    const selectedSources = getSelectedSources();
    if (selectedSources.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Erro!',
            text: 'Por favor, selecione ao menos uma fonte.',
            customClass: { confirmButton: 'swal2-confirm' },
            allowOutsideClick: false,
            showConfirmButton: true
        });
        return;
    }

    fetchJsons(selectedSources).then(allData => {
        const results = allData.filter(download => download.title.toLowerCase().includes(title));
        if (results.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Nenhum resultado',
                text: 'Não encontramos jogos com esse título. Tente verificar a ortografia ou testar outra fonte.',
                customClass: { confirmButton: 'swal2-confirm' }
            });
        }

        displayResults(results);
    });

    titleInput.value = '';
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    if (results.length === 0) return;

    results.forEach(result => {
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item flex-column align-items-start d-flex justify-content-between result-item';
        const isTorrent = result.isTorrent;

        const sizeText = result.fileSize ? `<p class="mb-1">Tamanho: ${result.fileSize}</p>` : '';

        const content = `
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${result.title}</h5>
                <small>${result.uploadDate}</small>
            </div>
            ${sizeText} <!-- Só exibe se o Tamanho estiver presente -->
            <p class="mb-1"><strong>Fonte:</strong> ${result.source}</p>
            ${result.console ? `<p class="mb-1"><strong>Console:</strong> ${result.console}</p>` : ''}
            ${result.senha ? `<p class="mb-1"><strong>Senha:</strong> ${result.senha}</p>` : ''}
            <div class="d-flex gap-2 mt-2">
                ${isTorrent
                    ? `<button class="custom-button" onclick="openMagnet('${result.uris[0]}')">Baixar Magnet</button>
                       <button class="custom-button" onclick="copyMagnet('${result.uris[0]}')">Copiar Magnet</button>`
                    : `<button class="custom-button" onclick="openLink('${result.uris[0]}')">Baixar Game</button>
                       <button class="custom-button" onclick="copyLink('${result.uris[0]}')">Copiar Link</button>`
                }
            </div>
        `;
        listItem.innerHTML = content;
        resultsContainer.appendChild(listItem);
    });
}

function copyMagnet(magnetLink) {
    const tempInput = document.createElement('input');
    tempInput.value = magnetLink;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); 
    try {
        document.execCommand('copy');
        Swal.fire({
            icon: 'success',
            title: 'Copiado!',
            text: 'O link Magnet foi copiado para a área de transferência.',
            customClass: { confirmButton: 'swal2-confirm' }
        });
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Não foi possível copiar o link Magnet.',
            customClass: { confirmButton: 'swal2-confirm' }
        });
        console.error('Failed to copy text:', err);
    }
    document.body.removeChild(tempInput);
}

function copyLink(downloadLink) {
    const tempInput = document.createElement('input');
    tempInput.value = downloadLink;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999);
    try {
        document.execCommand('copy');
        Swal.fire({
            icon: 'success',
            title: 'Copiado!',
            text: 'O link foi copiado para a área de transferência.',
            customClass: { confirmButton: 'swal2-confirm' }
        });
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Não foi possível copiar o link.',
            customClass: { confirmButton: 'swal2-confirm' }
        });
        console.error('Failed to copy text:', err);
    }
    document.body.removeChild(tempInput);
}

function openMagnet(magnetLink) {
    window.open(magnetLink, '_blank');
}

function openLink(downloadLink) {
    window.open(downloadLink, '_blank');
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchGame();
    }
}

createSourceFilter();
document.getElementById('gameTitle').addEventListener('keypress', handleKeyPress);
const backToTopButton = document.getElementById("backToTop");

window.onscroll = function() {
    backToTopButton.style.display = (document.body.scrollTop > 100 || document.documentElement.scrollTop > 20) ? 'block' : 'none';
};

backToTopButton.onclick = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function waitForVideo() {
    const video = document.querySelector('.video-bg');
    return new Promise((resolve) => {
        if (video.readyState >= 3) {
            resolve();
        } else {
            video.addEventListener('canplaythrough', resolve);
        }
    });
}

Pace.on('done', () => {
    waitForVideo().then(() => {
        document.getElementById('loading-container').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    });
});

document.getElementById('main-content').style.display = 'none';

Pace.options = {
    ajax: false,
    document: false,
    eventLag: false,
    elements: {
        selectors: ['body']
    }
};