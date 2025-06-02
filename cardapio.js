// Gerenciamento do cardápio online
document.addEventListener('DOMContentLoaded', () => {
    const cardapioItems = document.querySelector('.cardapio-items');
    const btnAtualizar = document.getElementById('btnAtualizarCardapio');
    const statusCardapio = document.getElementById('statusCardapio');
    const filtroCategoria = document.getElementById('filtroCategoria');
    const pesquisaInput = document.getElementById('pesquisaCardapio');

    // Função para carregar configurações
    function carregarConfiguracoes() {
        const configuracoes = JSON.parse(localStorage.getItem('configuracoes')) || {};
        return configuracoes;
    }

    // Função para carregar itens do cardápio
    function carregarItensCardapio() {
        return JSON.parse(localStorage.getItem('itensCardapio')) || [];
    }

    // Função para filtrar itens
    function filtrarItens(itens, categoria = 'todos', termoPesquisa = '') {
        return itens.filter(item => {
            const matchCategoria = categoria === 'todos' || item.categoria === categoria;
            const matchPesquisa = termoPesquisa === '' || 
                item.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                item.descricao.toLowerCase().includes(termoPesquisa.toLowerCase());
            return matchCategoria && matchPesquisa;
        });
    }

    // Função para avaliar um item
    function avaliarItem(itemId, nota) {
        const itens = carregarItensCardapio();
        const item = itens.find(i => i.id === itemId);
        if (item) {
            item.avaliacoes.push(nota);
            item.mediaAvaliacao = item.avaliacoes.reduce((a, b) => a + b) / item.avaliacoes.length;
            localStorage.setItem('itensCardapio', JSON.stringify(itens));
            atualizarCardapio();
        }
    }

    // Função para atualizar status do cardápio
    function atualizarStatusCardapio() {
        const configuracoes = carregarConfiguracoes();
        const modoManutencao = configuracoes.modoManutencao || false;
        
        if (modoManutencao) {
            statusCardapio.textContent = 'Status: Em Manutenção';
            statusCardapio.style.color = 'red';
            cardapioItems.innerHTML = '<p>Cardápio temporariamente indisponível para manutenção.</p>';
        } else {
            statusCardapio.textContent = 'Status: Online';
            statusCardapio.style.color = 'green';
            atualizarCardapio();
        }
    }

    // Função para atualizar o cardápio
    function atualizarCardapio() {
        const categoria = filtroCategoria ? filtroCategoria.value : 'todos';
        const termoPesquisa = pesquisaInput ? pesquisaInput.value : '';
        const itens = filtrarItens(carregarItensCardapio(), categoria, termoPesquisa);
        
        if (itens.length === 0) {
            cardapioItems.innerHTML = '<p>Nenhum item disponível no cardápio.</p>';
            return;
        }

        // Primeiro mostra os itens em destaque
        const itensDestaque = itens.filter(item => item.destaque);
        const itensRegulares = itens.filter(item => !item.destaque);

        // Gera o HTML do cardápio
        cardapioItems.innerHTML = `
            ${itensDestaque.length > 0 ? `
                <div class="categoria-section destaques">
                    <h2><i class="fas fa-star"></i> Destaques</h2>
                    <div class="items-grid">
                        ${gerarCardsItens(itensDestaque)}
                    </div>
                </div>
            ` : ''}
            ${Object.entries(agruparPorCategoria(itensRegulares)).map(([categoria, itens]) => `
                <div class="categoria-section" data-categoria="${categoria}">
                    <h2>${categoria.charAt(0).toUpperCase() + categoria.slice(1)}</h2>
                    <div class="items-grid">
                        ${gerarCardsItens(itens)}
                    </div>
                </div>
            `).join('')}
        `;

        // Adiciona os event listeners para avaliação
        document.querySelectorAll('.estrelas i').forEach(estrela => {
            estrela.addEventListener('click', function() {
                const itemId = parseInt(this.closest('.cardapio-item').dataset.id);
                const nota = parseInt(this.dataset.nota);
                avaliarItem(itemId, nota);
            });
        });

        // Adiciona animações de entrada
        animarEntradaItens();
    }

    // Função para gerar os cards dos itens
    function gerarCardsItens(itens) {
        return itens.map(item => `
            <div class="cardapio-item ${item.destaque ? 'destaque' : ''}" data-id="${item.id}">
                <div class="item-imagem">
                    <img src="${item.imagem}" alt="${item.nome}" onerror="this.src='placeholder.jpg'">
                    ${item.destaque ? '<span class="badge-destaque"><i class="fas fa-star"></i> Destaque</span>' : ''}
                    ${item.vegetariano ? '<span class="badge-vegetariano"><i class="fas fa-leaf"></i> Vegetariano</span>' : ''}
                </div>
                <div class="item-info">
                    <h3>${item.nome}</h3>
                    <p>${item.descricao}</p>
                    <div class="item-footer">
                        <span class="preco">R$ ${item.preco}</span>
                        <div class="avaliacao">
                            ${gerarEstrelasInterativas(item.mediaAvaliacao)}
                            <span class="num-avaliacoes">(${item.avaliacoes.length})</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Função para gerar estrelas interativas
    function gerarEstrelasInterativas(nota) {
        return `
            <div class="estrelas">
                ${[1,2,3,4,5].map(i => `
                    <i class="${i <= nota ? 'fas' : 'far'} fa-star" 
                       data-nota="${i}" 
                       title="Avaliar com ${i} estrelas"></i>
                `).join('')}
            </div>
        `;
    }

    // Função para agrupar itens por categoria
    function agruparPorCategoria(itens) {
        return itens.reduce((acc, item) => {
            if (!acc[item.categoria]) {
                acc[item.categoria] = [];
            }
            acc[item.categoria].push(item);
            return acc;
        }, {});
    }

    // Função para animar a entrada dos itens
    function animarEntradaItens() {
        const items = document.querySelectorAll('.cardapio-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
                item.style.transition = 'all 0.5s ease-out';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // Event Listeners
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', atualizarStatusCardapio);
    }

    if (filtroCategoria) {
        filtroCategoria.addEventListener('change', atualizarCardapio);
    }

    if (pesquisaInput) {
        pesquisaInput.addEventListener('input', debounce(atualizarCardapio, 300));
    }

    // Verificar mudanças nas configurações
    window.addEventListener('storage', (e) => {
        if (e.key === 'configuracoes' || e.key === 'itensCardapio') {
            atualizarStatusCardapio();
        }
    });

    // Ouvir evento personalizado para atualizações no mesmo documento
    window.addEventListener('itensCardapioAtualizados', atualizarStatusCardapio);

    // Função de debounce para otimizar a pesquisa
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Inicializar cardápio
    atualizarStatusCardapio();
});