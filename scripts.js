// ==================== FUNÇÕES PRINCIPAIS ====================

/*
 * Sistema de Gerenciamento de Restaurante
 * * Funcionalidades:
 * - Sistema de login com diferentes níveis de acesso (admin, garçom, caixa)
 * - Gerenciamento de mesas e pedidos
 * - Sistema de estoque com controle de quantidade
 * - Relatórios financeiros
 * - Configurações do sistema
 * - Backup e restauração de dados
 * * Novidades:
 * - Sistema de login integrado com localStorage
 * - Restrição de acesso baseada no tipo de usuário
 * - Sistema de mesas com atribuição a garçons
 * - Feedback visual aprimorado
 */

//
// < ------- Login  ------- >
//

// Verifica se existe o usuário admin padrão
function verificarUsuarioAdmin() {
    let configs = JSON.parse(localStorage.getItem('configSistema')) || {};
    if (!configs.usuarios || !configs.usuarios.length || !configs.usuarios.some(u => u.tipo === 'admin')) {
        configs.usuarios = configs.usuarios || [];
        configs.usuarios = configs.usuarios.filter(u => u.tipo !== 'admin');
        configs.usuarios.push({
            username: "admin",
            password: "1234",
            tipo: "admin"
        });
        localStorage.setItem('configSistema', JSON.stringify(configs));
    }
}

function garantirUsuarioAdmin() {
    verificarUsuarioAdmin();
    let configs = JSON.parse(localStorage.getItem('configSistema')) || {};
    if (!configs.usuarios || !configs.usuarios.some(u => u.tipo === 'admin')) {
        localStorage.clear();
        configs = {
            nomeRestaurante: "Meu Restaurante",
            horarioFuncionamento: "08:00 - 22:00",
            taxaServico: 10,
            modoManutencao: false,
            notificacoes: true,
            intervaloBackup: 7,
            usuarios: [{ username: "admin", password: "1234", tipo: "admin" }]
        };
        localStorage.setItem('configSistema', JSON.stringify(configs));
    }
}

function validarLogin(usuario, senha) {
    garantirUsuarioAdmin();
    const configs = JSON.parse(localStorage.getItem('configSistema')) || {};
    const usuarioEncontrado = configs.usuarios?.find(u => u.username === usuario && u.password === senha);
    if (usuarioEncontrado) {
        localStorage.setItem('usuarioLogado', JSON.stringify({
            username: usuarioEncontrado.username,
            tipo: usuarioEncontrado.tipo
        }));
        return usuarioEncontrado;
    }
    return null;
}

function ajustarInterface() {
    garantirUsuarioAdmin();
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) return;
    const sidebar = document.querySelector('.sidebar ul');
    if (!sidebar) return;
    sidebar.innerHTML = '';
    switch (usuarioLogado.tipo) {
        case 'garcom':
            sidebar.innerHTML = `
                <li><a href="garcom.html"><i class="fas fa-utensils"></i> Área do Garçom</a></li>
                <li><a href="index.html"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
            `;
            if (!window.location.pathname.includes("garcom.html") && !window.location.pathname.includes("index.html")) {
                window.location.href = "garcom.html";
            }
            break;
        case 'caixa':
            sidebar.innerHTML = `
                <li><a href="caixa.html"><i class="fas fa-cash-register"></i> Área do Caixa</a></li>
                <li><a href="index.html"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
            `;
            if (!window.location.pathname.includes("caixa.html") && !window.location.pathname.includes("index.html")) {
                window.location.href = "caixa.html";
            }
            break;
        case 'gerente':
            sidebar.innerHTML = `
                <li><a href="relatorio.html"><i class="fas fa-chart-line"></i> Relatórios</a></li>
                <li><a href="estoque.html"><i class="fas fa-boxes"></i> Estoque</a></li>
                <li><a href="index.html"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
            `;
            if (!window.location.pathname.includes("relatorio.html") && !window.location.pathname.includes("estoque.html") && !window.location.pathname.includes("index.html")) {
                window.location.href = "relatorio.html";
            }
            break;
        case 'admin':
            sidebar.innerHTML = `
                <li><a href="garcom.html"><i class="fas fa-utensils"></i> Área do Garçom</a></li>
                <li><a href="caixa.html"><i class="fas fa-cash-register"></i> Área do Caixa</a></li>
                <li><a href="relatorio.html"><i class="fas fa-chart-line"></i> Relatórios</a></li>
                <li><a href="estoque.html"><i class="fas fa-boxes"></i> Estoque</a></li>
                <li><a href="configuracoes.html"><i class="fas fa-cog"></i> Configurações</a></li>
                <li><a href="index.html"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
            `;
            break;
        default:
            window.location.href = "index.html";
            break;
    }
    const currentPage = window.location.pathname.split('/').pop();
    const activeLink = sidebar.querySelector(`a[href="${currentPage}"]`);
    if (activeLink) activeLink.classList.add('active');
}

if (window.location.pathname.includes("index.html")) {
    garantirUsuarioAdmin();
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const usuario = document.getElementById("usuario").value;
            const senha = document.getElementById("senha").value;
            const usuarioValidado = validarLogin(usuario, senha);
            if (usuarioValidado) {
                switch (usuarioValidado.tipo) {
                    case 'garcom': window.location.href = "garcom.html"; break;
                    case 'caixa': window.location.href = "caixa.html"; break;
                    case 'gerente': window.location.href = "relatorio.html"; break;
                    case 'admin': window.location.href = "garcom.html"; break;
                    default: window.location.href = "index.html";
                }
            } else {
                const mensagemErro = document.getElementById("mensagemErro");
                if (mensagemErro) mensagemErro.style.display = "block";
            }
        });
    }
} else {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        window.location.href = "index.html";
    } else {
        ajustarInterface();
        const nomeGarcom = document.getElementById('nomeGarcom');
        if (nomeGarcom) {
            const dadosUsuario = JSON.parse(usuarioLogado);
            nomeGarcom.textContent = dadosUsuario.username;
        }
    }
}

//
// < -------------------------------- >
//

//
// < -------  Tela do Garçom  ------- > 
//
let mesasData = JSON.parse(localStorage.getItem('mesasData')) || { mesas: {}, atribuicoes: {} };

function inicializarMesas() {
    const gridMesas = document.querySelector('.grid-mesas');
    if (!gridMesas) return;
    gridMesas.innerHTML = '';
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) return;

    for (let i = 1; i <= 6; i++) {
        const mesaId = `Mesa ${i}`;
        const mesaData = mesasData.mesas[mesaId] || { status: 'disponivel', pedidos: [] };
        const atribuidaA = mesasData.atribuicoes[mesaId];
        const ehMinhaMesa = atribuidaA === usuarioLogado.username;
        const mesaButton = document.createElement('button');
        mesaButton.className = `mesa-button ${mesaData.status} ${ehMinhaMesa ? 'minha-mesa' : ''}`;
        mesaButton.onclick = () => selecionarMesa(mesaId);
        let statusTexto = '', statusClasse = '';
        if (mesaData.status === 'ocupada') { statusTexto = 'Ocupada'; statusClasse = 'status-ocupada'; }
        else if (mesaData.status === 'aguardando_pagamento') { statusTexto = 'Aguardando Pagamento'; statusClasse = 'status-aguardando'; }
        else { statusTexto = 'Disponível'; statusClasse = 'status-disponivel'; }
        let garcomInfoHtml = atribuidaA ? `<span class="garcom-nome">Garçom: ${atribuidaA}</span>` : '';
        let actionButtonHtml = '';
        if (mesaData.status === 'disponivel' || ehMinhaMesa) {
            actionButtonHtml = `
                <div class="mesa-actions">
                    <button class="mesa-action-btn" onclick="event.stopPropagation(); atribuirMesa('${mesaId}')">
                        <i class="fas fa-user-plus"></i> Atribuir
                    </button>
                </div>`;
        }
        mesaButton.innerHTML = `
            <i class="fas fa-table"></i>
            ${mesaId}
            <div class="mesa-info">
                <span class="${statusClasse}">${statusTexto}</span>
                ${garcomInfoHtml}
            </div>
            ${actionButtonHtml}`;
        gridMesas.appendChild(mesaButton);
    }
}

function atribuirMesa(mesaId) {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) return;
    if (mesasData.atribuicoes[mesaId] && mesasData.atribuicoes[mesaId] !== usuarioLogado.username) {
        mostrarFeedback('Esta mesa já está atribuída a outro garçom!', 'erro');
        return;
    }
    if (mesasData.atribuicoes[mesaId] === usuarioLogado.username) {
        delete mesasData.atribuicoes[mesaId];
        if (mesasData.mesas[mesaId] && (!mesasData.mesas[mesaId].pedidos || mesasData.mesas[mesaId].pedidos.length === 0)) {
            mesasData.mesas[mesaId].status = 'disponivel';
        }
        mostrarFeedback('Mesa desatribuída com sucesso!');
    } else {
        mesasData.atribuicoes[mesaId] = usuarioLogado.username;
        mostrarFeedback('Mesa atribuída com sucesso!');
    }
    localStorage.setItem('mesasData', JSON.stringify(mesasData));
    inicializarMesas();
}

function selecionarMesa(mesa) {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) return;
    if (mesasData.atribuicoes[mesa] && mesasData.atribuicoes[mesa] !== usuarioLogado.username && usuarioLogado.tipo !== 'admin') {
        mostrarFeedback('Esta mesa está atribuída a outro garçom!', 'erro');
        return;
    }
    if (!mesasData.mesas[mesa]) {
        mesasData.mesas[mesa] = { status: 'disponivel', pedidos: [] };
    }
    mesaSelecionada = mesa;
    const mesaSelecionadaTitulo = document.getElementById("mesaSelecionadaTitulo");
    if (mesaSelecionadaTitulo) mesaSelecionadaTitulo.textContent = mesa;
    atualizarListaPedidos();
    const abaPedidos = document.getElementById("abaPedidos");
    if (abaPedidos && !abaPedidos.classList.contains("open")) toggleAbaPedidos();
    inicializarMesas();
}

if (window.location.pathname.includes("garcom.html")) {
    document.addEventListener('DOMContentLoaded', function() {
        inicializarMesas();
        carregarCardapio();
        document.querySelectorAll('.filtro-botao').forEach(botao => {
            botao.addEventListener('click', function() {
                document.querySelectorAll('.filtro-botao').forEach(b => b.classList.remove('ativo'));
                this.classList.add('ativo');
                carregarCardapio(this.getAttribute('data-categoria'));
            });
        });
        const fecharAbaButton = document.getElementById('fecharAba');
        if (fecharAbaButton) {
            fecharAbaButton.addEventListener('click', () => {
                const abaPedidos = document.getElementById("abaPedidos");
                if (abaPedidos && abaPedidos.classList.contains("open")) toggleAbaPedidos();
                mesaSelecionada = null;
                const mesaSelecionadaTitulo = document.getElementById("mesaSelecionadaTitulo");
                if (mesaSelecionadaTitulo) mesaSelecionadaTitulo.textContent = "Nenhuma Mesa Selecionada";
                atualizarListaPedidos();
            });
        }
    });
}

function mostrarFeedback(mensagem, tipo = "sucesso") {
    const feedback = document.createElement("div");
    feedback.className = `feedback-mensagem ${tipo}`;
    feedback.innerHTML = `<i class="fas ${tipo === "sucesso" ? "fa-check-circle" : "fa-exclamation-circle"}"></i> ${mensagem}`;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000);
}

const menuButton = document.getElementById("menuButton");
if (menuButton) menuButton.addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("open");
});

const closeButton = document.getElementById("closeButton");
if (closeButton) closeButton.addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("open");
});

function toggleAbaPedidos() {
    const abaPedidos = document.getElementById("abaPedidos");
    if (abaPedidos) abaPedidos.classList.toggle("open");
}

let mesaSelecionada = null;

function atualizarListaPedidos() {
    const listaPedidos = document.getElementById("listaPedidos");
    const totalPedido = document.getElementById("totalPedido");
    if (!listaPedidos || !totalPedido) return;
    listaPedidos.innerHTML = "";
    let total = 0;
    if (mesaSelecionada && mesasData.mesas[mesaSelecionada]?.pedidos) {
        mesasData.mesas[mesaSelecionada].pedidos.forEach((pedido, index) => {
            const li = document.createElement("li");
            li.innerHTML = `<span>${pedido.nome} - R$ ${pedido.preco.toFixed(2)}</span> <button onclick="removerItemPedido(${index})"><i class="fas fa-trash"></i></button>`;
            listaPedidos.appendChild(li);
            total += pedido.preco;
        });
    }
    totalPedido.textContent = total.toFixed(2);
}

function finalizarPedido() { // Garçom finaliza pedido para o caixa
    console.log("[finalizarPedido] Iniciando. Mesa selecionada:", mesaSelecionada);
    if (!mesaSelecionada) {
        mostrarFeedback('Nenhuma mesa selecionada para finalizar o pedido!', 'erro');
        return;
    }
    const mesa = mesasData.mesas[mesaSelecionada];
    if (!mesa) {
        mostrarFeedback('Dados da mesa selecionada não encontrados!', 'erro');
        console.error("[finalizarPedido] Objeto da mesa não encontrado para:", mesaSelecionada, mesasData.mesas);
        return;
    }
    if (!mesa.pedidos || mesa.pedidos.length === 0) {
        mostrarFeedback('Não há itens no pedido para finalizar!', 'erro');
        return;
    }
    if (mesa.status === 'aguardando_pagamento') {
        mostrarFeedback('Este pedido já foi enviado ao caixa!', 'erro');
        return;
    }
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (usuarioLogado && mesasData.mesas[mesaSelecionada]) {
        mesasData.mesas[mesaSelecionada].garcom = usuarioLogado.username;
        console.log(`[finalizarPedido] Garçom ${usuarioLogado.username} definido para mesa ${mesaSelecionada}`);
    } else {
        console.warn("[finalizarPedido] Não foi possível obter usuário logado para definir o garçom.");
    }
    mesasData.mesas[mesaSelecionada].status = 'aguardando_pagamento';
    console.log(`[finalizarPedido] Status da mesa ${mesaSelecionada} alterado para: aguardando_pagamento`);
    try {
        localStorage.setItem('mesasData', JSON.stringify(mesasData));
        console.log("[finalizarPedido] mesasData salvo no localStorage:", JSON.parse(localStorage.getItem('mesasData')));
    } catch (error) {
        console.error("[finalizarPedido] Erro ao salvar mesasData no localStorage:", error);
        mostrarFeedback('Erro ao salvar dados do pedido. Tente novamente.', 'erro');
        return;
    }
    const abaPedidos = document.getElementById("abaPedidos");
    if (abaPedidos && abaPedidos.classList.contains("open")) toggleAbaPedidos();
    inicializarMesas();
    const mesaSelecionadaTitulo = document.getElementById("mesaSelecionadaTitulo");
    if (mesaSelecionadaTitulo) mesaSelecionadaTitulo.textContent = "Nenhuma Mesa Selecionada";
    mesaSelecionada = null;
    mostrarFeedback('Pedido enviado ao caixa! Aguardando pagamento.', 'sucesso');
}

function filtrarItens() { // Chamada pelo input de busca na aba de pedidos
    const termo = document.getElementById("buscaItem").value.toLowerCase();
    const categoriaFiltroAtivo = document.querySelector('.filtro-botao.ativo')?.getAttribute('data-categoria') || 'todos';
    
    // Em vez de manipular display, vamos recarregar o cardápio que já tem a lógica de busca
    carregarCardapio(categoriaFiltroAtivo); 
}


// Funções para a Tela do Caixa
if (window.location.pathname.includes("caixa.html")) {
    document.addEventListener('DOMContentLoaded', function() {
        carregarPedidosCaixa();
        carregarHistorico('hoje');
        document.querySelectorAll('.filtros-historico .botao').forEach(botao => {
            botao.addEventListener('click', function() {
                document.querySelectorAll('.filtros-historico .botao').forEach(b => b.classList.remove('ativo'));
                this.classList.add('ativo');
                carregarHistorico(this.getAttribute('data-periodo'));
            });
        });
    });
}

function carregarPedidosCaixa() {
    const listaMesas = document.getElementById("listaMesas");
    if (!listaMesas) {
        console.error("[carregarPedidosCaixa] Elemento #listaMesas não encontrado.");
        return;
    }
    listaMesas.innerHTML = "";
    console.log("[carregarPedidosCaixa] mesasData no início da função:", JSON.parse(JSON.stringify(mesasData)));
    const mesasParaFiltrar = mesasData && mesasData.mesas ? mesasData.mesas : {};
    const mesasComPedidos = Object.entries(mesasParaFiltrar).filter(([mesaId, mesa]) => {
        return (mesa.status === 'ocupada' || mesa.status === 'aguardando_pagamento') &&
               mesa.pedidos && mesa.pedidos.length > 0;
    });
    console.log("[carregarPedidosCaixa] Mesas filtradas para exibição no caixa:", JSON.parse(JSON.stringify(mesasComPedidos)));
    if (mesasComPedidos.length === 0) {
        const mensagemVazia = document.createElement("div");
        mensagemVazia.className = "mensagem-sem-itens";
        mensagemVazia.innerHTML = `<i class="fas fa-receipt"></i><p>Nenhum pedido em aberto para o caixa.</p>`;
        listaMesas.appendChild(mensagemVazia);
        return;
    }
    mesasComPedidos.forEach(([mesaId, mesa]) => {
        const divMesa = document.createElement("div");
        divMesa.className = "mesa-caixa";
        if (mesa.status === 'aguardando_pagamento') divMesa.classList.add('aguardando-pagamento');
        const titulo = document.createElement("h2");
        let statusDisplay = '';
        if (mesa.status === 'aguardando_pagamento') statusDisplay = '<span class="status-pagamento">Aguardando Pagamento</span>';
        else if (mesa.status === 'ocupada') statusDisplay = '<span class="status-ocupada-caixa">Pedido Aberto</span>';
        titulo.innerHTML = `<i class="fas fa-table"></i> ${mesaId} ${statusDisplay}`;
        let garcomDisplay = 'Não informado';
        if (mesa.garcom) garcomDisplay = mesa.garcom;
        else if (mesasData.atribuicoes && mesasData.atribuicoes[mesaId]) garcomDisplay = mesasData.atribuicoes[mesaId];
        titulo.innerHTML += ` <span class="garcom-info-caixa">(Garçom: ${garcomDisplay})</span>`;
        divMesa.appendChild(titulo);
        const listaItens = document.createElement("ul");
        let total = 0;
        if (mesa.pedidos) {
            mesa.pedidos.forEach(pedido => {
                const li = document.createElement("li");
                li.setAttribute("data-categoria", pedido.categoria || 'outros');
                li.innerHTML = `<span class="item-nome">${pedido.nome}</span> <span class="item-preco">R$ ${pedido.preco.toFixed(2)}</span>`;
                listaItens.appendChild(li);
                total += pedido.preco;
            });
        }
        divMesa.appendChild(listaItens);
        const totalPedido = document.createElement("p");
        totalPedido.className = "total";
        totalPedido.innerHTML = `<span>Total:</span> <span class="valor">R$ ${total.toFixed(2)}</span>`;
        divMesa.appendChild(totalPedido);
        const divBotoes = document.createElement("div");
        divBotoes.className = "acoes-mesa";
        if (mesa.status === 'aguardando_pagamento') {
            const botaoFinalizar = document.createElement("button");
            botaoFinalizar.className = "botao-finalizar";
            botaoFinalizar.innerHTML = '<i class="fas fa-check-circle"></i> Registrar Pagamento';
            botaoFinalizar.onclick = () => finalizarPedidoCaixa(mesaId);
            divBotoes.appendChild(botaoFinalizar);
        }
        const botaoImprimir = document.createElement("button");
        botaoImprimir.className = "botao-imprimir";
        botaoImprimir.innerHTML = '<i class="fas fa-print"></i> Imprimir Conta';
        botaoImprimir.onclick = () => imprimirConta(mesaId, mesa);
        divBotoes.appendChild(botaoImprimir);
        divMesa.appendChild(divBotoes);
        listaMesas.appendChild(divMesa);
    });
}

function finalizarPedidoCaixa(mesaId) {
    const mesa = mesasData.mesas[mesaId];
    if (!mesa || !mesa.pedidos || mesa.pedidos.length === 0) {
        mostrarFeedback('Não há pedidos para finalizar nesta mesa!', 'erro');
        return;
    }
    const total = mesa.pedidos.reduce((sum, pedido) => sum + pedido.preco, 0);
    const modalHTML = `
        <div id="modalFinalizarPagamento" class="modal">
            <div class="modal-content">
                <div class="modal-header"><h2><i class="fas fa-cash-register"></i> Finalizar Pagamento</h2><span class="close">&times;</span></div>
                <div class="modal-body">
                    <div class="info-pagamento">
                        <p><strong>Mesa:</strong> ${mesaId}</p>
                        <p><strong>Garçom:</strong> ${mesa.garcom || mesasData.atribuicoes[mesaId] || 'Não informado'}</p>
                        <p><strong>Total a pagar:</strong> <span class="valor-destaque">R$ ${total.toFixed(2)}</span></p>
                    </div>
                    <div class="forma-pagamento">
                        <label for="formaPagamentoModal"><strong>Forma de Pagamento:</strong></label>
                        <select id="formaPagamentoModal" class="input-estilo">
                            <option value="dinheiro">Dinheiro</option>
                            <option value="cartao_credito">Cartão de Crédito</option>
                            <option value="cartao_debito">Cartão de Débito</option>
                            <option value="pix">PIX</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="btnConfirmarPagamento" class="botao-finalizar"><i class="fas fa-check"></i> Confirmar Pagamento</button>
                    <button id="btnCancelarPagamento" class="botao-cancelar"><i class="fas fa-times"></i> Cancelar</button>
                </div>
            </div>
        </div>`;
    const modalAnterior = document.getElementById('modalFinalizarPagamento');
    if (modalAnterior) modalAnterior.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('modalFinalizarPagamento');
    const btnFechar = modal.querySelector('.close');
    const btnConfirmar = document.getElementById('btnConfirmarPagamento');
    const btnCancelar = document.getElementById('btnCancelarPagamento');
    modal.style.display = 'block';
    const fecharModal = () => { modal.style.display = 'none'; modal.remove(); };
    btnFechar.onclick = fecharModal;
    btnCancelar.onclick = fecharModal;
    window.onclick = (event) => { if (event.target === modal) fecharModal(); };
    btnConfirmar.onclick = () => {
        const formaPagamento = document.getElementById('formaPagamentoModal').value;
        const vendas = JSON.parse(localStorage.getItem('historicoVendas')) || [];
        const venda = {
            mesa: mesaId,
            pedidos: mesa.pedidos,
            total: total,
            formaPagamento: formaPagamento,
            data: new Date().toISOString(),
            garcom: mesa.garcom || mesasData.atribuicoes[mesaId] || 'Não atribuído'
        };
        vendas.push(venda);
        localStorage.setItem('historicoVendas', JSON.stringify(vendas));
        mesasData.mesas[mesaId].pedidos = [];
        mesasData.mesas[mesaId].status = 'disponivel';
        delete mesasData.mesas[mesaId].garcom;
        delete mesasData.atribuicoes[mesaId];
        localStorage.setItem('mesasData', JSON.stringify(mesasData));
        fecharModal();
        carregarPedidosCaixa();
        carregarHistorico(document.querySelector('.filtros-historico .botao.ativo')?.getAttribute('data-periodo') || 'hoje');
        if(typeof inicializarMesas === "function") inicializarMesas(); // Se estiver na mesma página ou garçom/caixa compartilham script
        mostrarFeedback('Pagamento finalizado e mesa liberada!', 'sucesso');
    };
}

function imprimirConta(mesaId, mesa) {
    const configSistema = JSON.parse(localStorage.getItem('configSistema')) || {};
    const nomeRestaurante = configSistema.nomeRestaurante || 'Restaurante';
    const taxaServico = configSistema.taxaServico || 0;
    let conteudo = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 300px; margin: auto;">
            <h2 style="text-align: center; margin-bottom: 5px;">${nomeRestaurante}</h2>
            <p style="text-align: center; font-size: 0.8em; margin-top:0; margin-bottom: 15px;">Conta - Mesa ${mesaId}</p>
            <hr>
            <p style="font-size: 0.9em;">Data: ${new Date().toLocaleDateString('pt-BR')} - ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</p>
            ${(mesa.garcom || (mesasData.atribuicoes && mesasData.atribuicoes[mesaId])) ? `<p style="font-size: 0.9em;">Garçom: ${mesa.garcom || mesasData.atribuicoes[mesaId]}</p>` : ''}
            <hr>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
                <thead><tr><th style="text-align: left; padding: 5px 0;">Item</th><th style="text-align: right; padding: 5px 0;">Valor</th></tr></thead>
                <tbody>`;
    let subtotal = 0;
    if (mesa.pedidos) {
        mesa.pedidos.forEach(pedido => {
            conteudo += `<tr><td style="padding: 3px 0;">${pedido.nome}</td><td style="text-align: right; padding: 3px 0;">R$ ${pedido.preco.toFixed(2)}</td></tr>`;
            subtotal += pedido.preco;
        });
    }
    conteudo += `</tbody></table><hr>`;
    conteudo += `<div style="text-align: right; font-size: 1em; margin-top: 5px;">Subtotal: R$ ${subtotal.toFixed(2)}</div>`;
    if (taxaServico > 0) {
        const valorTaxa = subtotal * (taxaServico / 100);
        conteudo += `<div style="text-align: right; font-size: 0.8em; margin-top: 2px;">Taxa de Serviço (${taxaServico}%): R$ ${valorTaxa.toFixed(2)} (opcional)</div>`;
        conteudo += `<div style="text-align: right; font-size: 1em; margin-top: 5px; font-weight: bold;">Total com Taxa: R$ ${(subtotal + valorTaxa).toFixed(2)}</div>`;
    }
    conteudo += `<div style="text-align: right; font-size: 1em; margin-top: 10px; font-weight: bold;">Total: R$ ${subtotal.toFixed(2)}</div>`;
    conteudo += `<hr><p style="text-align: center; margin-top: 15px; font-size: 0.9em;">Obrigado pela preferência!</p></div>`;
    const janela = window.open('', '_blank');
    janela.document.write('<html><head><title>Conta</title></head><body>' + conteudo + '</body></html>');
    janela.document.close();
    setTimeout(() => { janela.print(); janela.close(); }, 250);
}


// ==================== FUNÇÕES DO ESTOQUE ====================
// (O código do estoque permanece o mesmo da sua última versão, pois não foi o foco da queixa)
// Se precisar de ajustes no estoque, me avise. Colei a versão que você me forneceu anteriormente.
if (window.location.pathname.includes("estoque.html")) {
    document.addEventListener('DOMContentLoaded', function() {
        let estoque = JSON.parse(localStorage.getItem('estoqueRestaurante')) || [];
        let editando = false;
        let itemEditandoId = null;
        let itemParaRemover = null;
        const form = document.getElementById('itemForm');
        const estoqueBody = document.getElementById('estoqueBody');
        const btnCancelar = document.getElementById('btnCancelar');
        const busca = document.getElementById('busca');
        const btnBaixoEstoque = document.getElementById('btnBaixoEstoque');
        const modalRemover = document.getElementById('modalRemover');
        const btnCloseModal = modalRemover?.querySelector('.close');
        const btnConfirmarRemocao = document.getElementById('btnConfirmarRemocao');
        const btnCancelarRemocao = document.getElementById('btnCancelarRemocao');
        const quantidadeRemoverInput = document.getElementById('quantidadeRemover');

        function verificarBaixoEstoque() {
            return estoque.some(item => (item.unidade === 'un' && item.quantidade < 5) || (item.unidade !== 'un' && item.quantidade < 0.5));
        }

        function atualizarBotaoBaixoEstoque() {
            if (btnBaixoEstoque) btnBaixoEstoque.style.display = verificarBaixoEstoque() ? 'inline-block' : 'none';
        }

        function carregarEstoque(filtroTermo = '', itensParaMostrar = estoque) {
            if(!estoqueBody) return;
            estoqueBody.innerHTML = '';
            let itensFiltrados = itensParaMostrar;
            if (filtroTermo) {
                const termo = filtroTermo.toLowerCase();
                itensFiltrados = itensParaMostrar.filter(item => item.nome.toLowerCase().includes(termo) || (item.fornecedor && item.fornecedor.toLowerCase().includes(termo)));
            }
            if (itensFiltrados.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 5; td.textContent = 'Nenhum item encontrado.'; td.style.textAlign = 'center';
                tr.appendChild(td); estoqueBody.appendChild(tr);
            } else {
                itensFiltrados.forEach(item => {
                    const tr = document.createElement('tr');
                    if ((item.unidade === 'un' && item.quantidade < 5) || (item.unidade !== 'un' && item.quantidade < 0.5)) tr.classList.add('baixo-estoque');
                    const valorTotal = item.quantidade * item.valor;
                    tr.innerHTML = `
                        <td>${item.nome}</td>
                        <td>${item.quantidade.toLocaleString('pt-BR')} ${item.unidade}</td>
                        <td>R$ ${item.valor.toFixed(2)}</td>
                        <td>R$ ${valorTotal.toFixed(2)}</td>
                        <td class="acoes">
                            <button class="btn-editar" data-id="${item.id}"><i class="fas fa-edit"></i> Editar</button>
                            <button class="btn-remover-qtd" data-id="${item.id}"><i class="fas fa-minus-circle"></i> Remover Qtd.</button>
                            <button class="btn-excluir" data-id="${item.id}"><i class="fas fa-trash"></i> Excluir</button>
                        </td>`;
                    estoqueBody.appendChild(tr);
                });
            }
            atualizarBotaoBaixoEstoque();
            document.querySelectorAll('.btn-editar').forEach(btn => btn.addEventListener('click', function() { editarItem(this.getAttribute('data-id')); }));
            document.querySelectorAll('.btn-excluir').forEach(btn => btn.addEventListener('click', function() { excluirItem(this.getAttribute('data-id')); }));
            document.querySelectorAll('.btn-remover-qtd').forEach(btn => btn.addEventListener('click', function() { abrirModalRemover(this.getAttribute('data-id')); }));
        }
        if(form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const nome = document.getElementById('nome').value.trim();
                const quantidade = parseFloat(document.getElementById('quantidade').value);
                const unidade = document.getElementById('unidade').value;
                const valor = parseFloat(document.getElementById('valor').value);
                const validade = document.getElementById('validade').value;
                const fornecedor = document.getElementById('fornecedor').value.trim();
                if (!nome || isNaN(quantidade) || quantidade < 0 || !unidade || isNaN(valor) || valor < 0) {
                    mostrarFeedback('Nome, quantidade, unidade e valor unitário são obrigatórios e devem ser válidos!', 'erro'); return;
                }
                if (editando) {
                    const index = estoque.findIndex(item => item.id == itemEditandoId);
                    if (index > -1) estoque[index] = { ...estoque[index], nome, quantidade, unidade, valor, validade, fornecedor };
                } else {
                    estoque.push({ id: Date.now().toString(), nome, quantidade, unidade, valor, validade, fornecedor });
                }
                localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
                carregarEstoque(busca?.value || '');
                limparFormulario();
                mostrarFeedback(editando ? 'Item atualizado!' : 'Item adicionado!');
                editando = false; itemEditandoId = null;
            });
        }
        if(btnCancelar) btnCancelar.addEventListener('click', limparFormulario);
        if(busca) busca.addEventListener('input', function() { carregarEstoque(this.value, estoque); });
        if (btnBaixoEstoque) btnBaixoEstoque.addEventListener('click', function() {
            const itensBaixo = estoque.filter(item => (item.unidade === 'un' && item.quantidade < 5) || (item.unidade !== 'un' && item.quantidade < 0.5));
            carregarEstoque(busca?.value || '', itensBaixo);
        });
        if(btnCloseModal) btnCloseModal.onclick = () => modalRemover.style.display = 'none';
        if(btnCancelarRemocao) btnCancelarRemocao.onclick = () => modalRemover.style.display = 'none';
        if(btnConfirmarRemocao) {
            btnConfirmarRemocao.addEventListener('click', function() {
                if (itemParaRemover && quantidadeRemoverInput.value) {
                    const qtdRemover = parseFloat(quantidadeRemoverInput.value);
                    const itemIndex = estoque.findIndex(item => item.id == itemParaRemover);
                    if (itemIndex > -1 && qtdRemover > 0) {
                        const item = estoque[itemIndex];
                        if (qtdRemover <= item.quantidade) {
                            item.quantidade -= qtdRemover; item.quantidade = parseFloat(item.quantidade.toFixed(2));
                            localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
                            carregarEstoque(busca?.value || ''); mostrarFeedback('Quantidade removida!');
                            if (item.quantidade <= 0) {
                                if (confirm(`"${item.nome}" zerado. Excluir do estoque?`)) {
                                    estoque.splice(itemIndex, 1); localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
                                    carregarEstoque(busca?.value || ''); mostrarFeedback('Item zerado removido.');
                                }
                            }
                        } else { mostrarFeedback('Quantidade a remover maior que o estoque!', 'erro'); }
                    }
                    modalRemover.style.display = 'none'; quantidadeRemoverInput.value = ''; itemParaRemover = null;
                } else { mostrarFeedback('Insira uma quantidade válida.', 'erro'); }
            });
        }
        function limparFormulario() {
            if(form) form.reset(); if(document.getElementById('itemId')) document.getElementById('itemId').value = '';
            editando = false; itemEditandoId = null; document.getElementById('nome')?.focus();
        }
        function abrirModalRemover(id) {
            itemParaRemover = id; const item = estoque.find(item => item.id == id);
            if (item && modalRemover && quantidadeRemoverInput) {
                quantidadeRemoverInput.value = ''; quantidadeRemoverInput.max = item.quantidade;
                quantidadeRemoverInput.step = (item.unidade === 'un' || item.unidade === 'unidades') ? '1' : '0.01';
                modalRemover.style.display = 'block'; quantidadeRemoverInput.focus();
            }
        }
        function editarItem(id) {
            const item = estoque.find(item => item.id == id);
            if (item && form) {
                editando = true; itemEditandoId = id;
                document.getElementById('itemId').value = item.id; document.getElementById('nome').value = item.nome;
                document.getElementById('quantidade').value = item.quantidade; document.getElementById('unidade').value = item.unidade;
                document.getElementById('valor').value = item.valor;
                if(document.getElementById('validade')) document.getElementById('validade').value = item.validade || '';
                if(document.getElementById('fornecedor')) document.getElementById('fornecedor').value = item.fornecedor || '';
                form.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.getElementById('nome').focus();
            }
        }
        function excluirItem(id) {
            if (confirm('Excluir este item permanentemente do estoque?')) {
                estoque = estoque.filter(item => item.id != id);
                localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
                carregarEstoque(busca?.value || ''); mostrarFeedback('Item excluído.');
            }
        }
        if (modalRemover) window.addEventListener('click', function(event) { if (event.target === modalRemover) modalRemover.style.display = 'none'; });
        carregarEstoque(); // Carga inicial
    });
}
// ==================== FUNÇÕES DO RELATÓRIO ====================
// (O código do relatório permanece o mesmo da sua última versão)
// ... (seu código de relatório existente) ...
if (window.location.pathname.includes("relatorio.html")) {
    document.addEventListener('DOMContentLoaded', function() {
        carregarDados(); 
        const btnAddVendas = document.querySelector('.relatorio-card .botao[onclick="adicionarVendas()"]');
        if (btnAddVendas) { btnAddVendas.removeAttribute('onclick'); btnAddVendas.addEventListener('click', adicionarVendas); }
        const btnAddFunc = document.querySelector('.relatorio-card .botao[onclick="adicionarFuncionario()"]');
        if (btnAddFunc) { btnAddFunc.removeAttribute('onclick'); btnAddFunc.addEventListener('click', adicionarFuncionario); }
        const btnAddDespesa = document.querySelector('.relatorio-card .botao[onclick="adicionarDespesa()"]');
        if (btnAddDespesa) { btnAddDespesa.removeAttribute('onclick'); btnAddDespesa.addEventListener('click', adicionarDespesa); }
    });
}
function carregarDados() {
    let relatorioData = JSON.parse(localStorage.getItem('relatorioData')) || { vendasManuais: [], funcionarios: [], despesas: [] };
    relatorioData.vendasManuais = relatorioData.vendasManuais || [];
    relatorioData.funcionarios = relatorioData.funcionarios || [];
    relatorioData.despesas = relatorioData.despesas || [];
    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));
    carregarDisplayVendasManuais(); 
    carregarFuncionarios();
    carregarDespesas();
    calcularResumoFinanceiro();
}
function adicionarFuncionario() {
    const nomeInput = document.getElementById('nome-funcionario');
    const salarioInput = document.getElementById('salario-funcionario');
    if (!nomeInput || !salarioInput) return;
    const nome = nomeInput.value.trim();
    const salario = parseFloat(salarioInput.value);
    if (!nome || isNaN(salario) || salario <= 0) {
        mostrarFeedback('Preencha nome e salário válido!', 'erro'); return;
    }
    let relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    relatorioData.funcionarios.push({ id: Date.now().toString(), nome, salario });
    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));
    carregarFuncionarios(); calcularResumoFinanceiro();
    nomeInput.value = ''; salarioInput.value = '';
    mostrarFeedback('Funcionário adicionado!');
}
function carregarFuncionarios() {
    const listaFuncionarios = document.getElementById('lista-funcionarios');
    if (!listaFuncionarios) return;
    let relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    listaFuncionarios.innerHTML = '';
    if (!relatorioData.funcionarios || relatorioData.funcionarios.length === 0) {
        listaFuncionarios.innerHTML = '<li class="item-vazio">Nenhum funcionário.</li>'; return;
    }
    relatorioData.funcionarios.forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `<div class="item-info"><span class="item-nome">${f.nome}</span><span class="item-valor">R$ ${f.salario.toFixed(2)}</span></div><button class="btn-remover" data-id="${f.id}" data-tipo="funcionario"><i class="fas fa-trash"></i></button>`;
        listaFuncionarios.appendChild(li);
    });
    listaFuncionarios.querySelectorAll('.btn-remover[data-tipo="funcionario"]').forEach(btn => {
        btn.onclick = () => removerItemRelatorio(btn.getAttribute('data-id'), 'funcionario');
    });
}
function adicionarDespesa() {
    const descricaoInput = document.getElementById('descricao-despesa');
    const valorInput = document.getElementById('valor-despesa');
    if(!descricaoInput || !valorInput) return;
    const descricao = descricaoInput.value.trim();
    const valor = parseFloat(valorInput.value);
    if (!descricao || isNaN(valor) || valor <= 0) {
        mostrarFeedback('Preencha descrição e valor válido!', 'erro'); return;
    }
    let relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    relatorioData.despesas.push({ id: Date.now().toString(), descricao, valor, data: new Date().toLocaleDateString('pt-BR') });
    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));
    carregarDespesas(); calcularResumoFinanceiro();
    descricaoInput.value = ''; valorInput.value = '';
    mostrarFeedback('Despesa adicionada!');
}
function carregarDespesas() {
    const listaDespesas = document.getElementById('lista-despesas');
    if (!listaDespesas) return;
    let relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    listaDespesas.innerHTML = '';
    if (!relatorioData.despesas || relatorioData.despesas.length === 0) {
        listaDespesas.innerHTML = '<li class="item-vazio">Nenhuma despesa.</li>'; return;
    }
    relatorioData.despesas.forEach(d => {
        const li = document.createElement('li');
        li.innerHTML = `<div class="item-info"><span class="item-nome">${d.descricao}</span><span class="item-data">${d.data}</span><span class="item-valor">R$ ${d.valor.toFixed(2)}</span></div><button class="btn-remover" data-id="${d.id}" data-tipo="despesa"><i class="fas fa-trash"></i></button>`;
        listaDespesas.appendChild(li);
    });
    listaDespesas.querySelectorAll('.btn-remover[data-tipo="despesa"]').forEach(btn => {
        btn.onclick = () => removerItemRelatorio(btn.getAttribute('data-id'), 'despesa');
    });
}
function removerItemRelatorio(id, tipo) {
    if (!confirm(`Remover este ${tipo}?`)) return;
    let relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    if (tipo === 'funcionario') { relatorioData.funcionarios = relatorioData.funcionarios.filter(f => f.id !== id); carregarFuncionarios(); }
    else if (tipo === 'despesa') { relatorioData.despesas = relatorioData.despesas.filter(d => d.id !== id); carregarDespesas(); }
    else if (tipo === 'vendaManual') { relatorioData.vendasManuais = relatorioData.vendasManuais.filter(v => v.id !== id); carregarDisplayVendasManuais(); }
    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));
    calcularResumoFinanceiro();
    mostrarFeedback(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} removido(a)!`);
}
function adicionarVendas() {
    const vendasDiaInput = document.getElementById('vendas-dia');
    if (!vendasDiaInput) return;
    const valorVenda = parseFloat(vendasDiaInput.value);
    if (isNaN(valorVenda) || valorVenda <= 0) {
        mostrarFeedback('Digite um valor válido!', 'erro'); return;
    }
    let relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    relatorioData.vendasManuais.push({ id: Date.now().toString(), valor: valorVenda, data: new Date().toISOString() });
    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));
    carregarDisplayVendasManuais(); calcularResumoFinanceiro();
    vendasDiaInput.value = '';
    mostrarFeedback('Venda manual adicionada!');
}
function carregarDisplayVendasManuais() { /* Esta função será integrada em calcularResumoFinanceiro */ }
function calcularResumoFinanceiro() {
    const relatorioData = JSON.parse(localStorage.getItem('relatorioData')) || { vendasManuais: [], funcionarios: [], despesas: [] };
    const vendasPedidos = JSON.parse(localStorage.getItem('historicoVendas')) || [];
    const hoje = new Date(); const mesAtual = hoje.getMonth(); const anoAtual = hoje.getFullYear();
    const totalVendasPedidosMes = vendasPedidos.filter(v => { const d = new Date(v.data); return d.getMonth() === mesAtual && d.getFullYear() === anoAtual; }).reduce((t, v) => t + v.total, 0);
    const totalVendasManuaisMes = (relatorioData.vendasManuais || []).filter(v => { const d = new Date(v.data); return d.getMonth() === mesAtual && d.getFullYear() === anoAtual; }).reduce((t, v) => t + v.valor, 0);
    const vendasTotaisDoMes = totalVendasPedidosMes + totalVendasManuaisMes;
    const totalVendasMesEl = document.getElementById('total-vendas-mes');
    if (totalVendasMesEl) totalVendasMesEl.textContent = `R$ ${vendasTotaisDoMes.toFixed(2)}`;
    const totalDespesas = (relatorioData.despesas || []).reduce((t, d) => t + d.valor, 0);
    const totalFolhaPagamento = (relatorioData.funcionarios || []).reduce((t, f) => t + f.salario, 0);
    const lucroTotalMes = vendasTotaisDoMes - totalDespesas - totalFolhaPagamento;
    const resumoVendasEl = document.getElementById('resumo-vendas'); if(resumoVendasEl) resumoVendasEl.textContent = `R$ ${vendasTotaisDoMes.toFixed(2)}`;
    const resumoDespesasEl = document.getElementById('resumo-despesas'); if(resumoDespesasEl) resumoDespesasEl.textContent = `R$ ${totalDespesas.toFixed(2)}`;
    const resumoFuncionariosEl = document.getElementById('resumo-funcionarios'); if(resumoFuncionariosEl) resumoFuncionariosEl.textContent = `R$ ${totalFolhaPagamento.toFixed(2)}`;
    const lucroTotalEl = document.getElementById('lucro-total');
    if(lucroTotalEl) { lucroTotalEl.textContent = `R$ ${lucroTotalMes.toFixed(2)}`; lucroTotalEl.className = lucroTotalMes >= 0 ? 'valor-positivo' : 'valor-negativo'; }
}

// ==================== FUNÇÕES DE CONFIGURAÇÕES ====================
// (O código de configurações permanece o mesmo da sua última versão)
// ... (seu código de configurações existente) ...
if (window.location.pathname.includes("configuracoes.html")) {
    garantirUsuarioAdmin(); 
    let configs = JSON.parse(localStorage.getItem('configSistema'));
    document.addEventListener('DOMContentLoaded', function() {
        carregarConfiguracoesNaTela(); 
        carregarUsuariosNaTela();
        const formConfigGerais = document.getElementById('formConfigGerais'); if(formConfigGerais) formConfigGerais.addEventListener('submit', salvarConfigGerais);
        const btnAdicionarUsuario = document.getElementById('btnAdicionarUsuario'); if(btnAdicionarUsuario) btnAdicionarUsuario.addEventListener('click', adicionarNovoUsuario);
        const btnGerarBackup = document.getElementById('btnGerarBackup'); if(btnGerarBackup) btnGerarBackup.addEventListener('click', gerarBackupSistema);
        const btnRestaurarBackup = document.getElementById('btnRestaurarBackup'); if(btnRestaurarBackup) btnRestaurarBackup.addEventListener('click', restaurarBackupSistema);
        const btnResetarSistema = document.getElementById('btnResetarSistema'); if(btnResetarSistema) btnResetarSistema.addEventListener('click', confirmarResetSistema);
        const modoManutencaoSwitch = document.getElementById('modoManutencao');
        if(modoManutencaoSwitch) modoManutencaoSwitch.addEventListener('change', (e) => { configs.modoManutencao = e.target.checked; salvarConfigsNoStorage(); mostrarFeedback('Modo manutenção atualizado.'); });
        const notificacoesSwitch = document.getElementById('notificacoes');
        if(notificacoesSwitch) notificacoesSwitch.addEventListener('change', (e) => { configs.notificacoes = e.target.checked; salvarConfigsNoStorage(); mostrarFeedback('Notificações atualizadas.'); });
        const intervaloBackupSelect = document.getElementById('intervaloBackup');
        if(intervaloBackupSelect) intervaloBackupSelect.addEventListener('change', (e) => { configs.intervaloBackup = parseInt(e.target.value); salvarConfigsNoStorage(); mostrarFeedback('Intervalo de backup atualizado.'); });
    });
    function carregarConfiguracoesNaTela() {
        configs = JSON.parse(localStorage.getItem('configSistema')); 
        if(document.getElementById('nomeRestaurante')) document.getElementById('nomeRestaurante').value = configs.nomeRestaurante;
        if(document.getElementById('horarioFuncionamento')) document.getElementById('horarioFuncionamento').value = configs.horarioFuncionamento;
        if(document.getElementById('taxaServico')) document.getElementById('taxaServico').value = configs.taxaServico;
        if(document.getElementById('modoManutencao')) document.getElementById('modoManutencao').checked = configs.modoManutencao;
        if(document.getElementById('notificacoes')) document.getElementById('notificacoes').checked = configs.notificacoes;
        if(document.getElementById('intervaloBackup')) document.getElementById('intervaloBackup').value = configs.intervaloBackup;
        const dataUltimoBackupEl = document.getElementById('dataUltimoBackup');
        if (dataUltimoBackupEl) {
            const ultimoBackupTimestamp = localStorage.getItem('ultimoBackupTimestamp');
            if (ultimoBackupTimestamp) dataUltimoBackupEl.textContent = new Date(parseInt(ultimoBackupTimestamp)).toLocaleString('pt-BR');
            else dataUltimoBackupEl.textContent = "Nenhum backup realizado";
        }
    }
    function salvarConfigGerais(e) {
        e.preventDefault();
        configs.nomeRestaurante = document.getElementById('nomeRestaurante').value;
        configs.horarioFuncionamento = document.getElementById('horarioFuncionamento').value;
        configs.taxaServico = parseFloat(document.getElementById('taxaServico').value) || 0;
        salvarConfigsNoStorage(); mostrarFeedback('Configurações gerais salvas!');
    }
    function carregarUsuariosNaTela() {
        configs = JSON.parse(localStorage.getItem('configSistema')); 
        const listaUsuariosEl = document.getElementById('listaUsuarios'); if(!listaUsuariosEl) return;
        listaUsuariosEl.innerHTML = '';
        if (!configs.usuarios || configs.usuarios.length === 0) { listaUsuariosEl.innerHTML = '<li>Nenhum usuário.</li>'; return; }
        configs.usuarios.forEach(usuario => {
            const li = document.createElement('li');
            li.innerHTML = `<div><span class="usuario-nome">${usuario.username}</span><span class="usuario-tipo">${formatarTipoUsuarioDisplay(usuario.tipo)}</span></div><button class="btn-excluir-usuario" data-username="${usuario.username}" title="Remover"><i class="fas fa-trash-alt"></i></button>`;
            listaUsuariosEl.appendChild(li);
        });
        document.querySelectorAll('.btn-excluir-usuario').forEach(btn => btn.addEventListener('click', function() { confirmarExclusaoDeUsuario(this.getAttribute('data-username')); }));
    }
    function formatarTipoUsuarioDisplay(tipo) { const t = { 'garcom': 'Garçom', 'caixa': 'Caixa', 'gerente': 'Gerente', 'admin': 'Administrador' }; return t[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1); }
    function adicionarNovoUsuario() {
        const usernameInput = document.getElementById('novoUsuario'); const passwordInput = document.getElementById('novaSenha'); const tipoSelect = document.getElementById('tipoUsuario');
        if(!usernameInput || !passwordInput || !tipoSelect) return;
        const username = usernameInput.value.trim(); const password = passwordInput.value; const tipo = tipoSelect.value;
        if (username && password) {
            if (configs.usuarios.some(u => u.username.toLowerCase() === username.toLowerCase())) { mostrarFeedback('Usuário já existe!', 'erro'); return; }
            configs.usuarios.push({ username, password, tipo }); salvarConfigsNoStorage(); carregarUsuariosNaTela();
            usernameInput.value = ''; passwordInput.value = ''; mostrarFeedback('Usuário adicionado!');
        } else { mostrarFeedback('Nome e senha são obrigatórios!', 'erro'); }
    }
    function removerUsuarioDoSistema(username) {
        garantirUsuarioAdmin(); configs = JSON.parse(localStorage.getItem('configSistema'));
        const admins = configs.usuarios.filter(u => u.tipo === 'admin');
        const usuarioParaRemover = configs.usuarios.find(u => u.username === username);
        if (usuarioParaRemover && usuarioParaRemover.tipo === 'admin' && admins.length === 1) { mostrarFeedback('Não pode remover o último admin!', 'erro'); return; }
        configs.usuarios = configs.usuarios.filter(u => u.username !== username);
        salvarConfigsNoStorage(); carregarUsuariosNaTela(); mostrarFeedback(`Usuário "${username}" removido!`);
    }
    function gerarBackupSistema() {
        const backupData = { configSistema: JSON.parse(localStorage.getItem('configSistema')) || {}, mesasData: JSON.parse(localStorage.getItem('mesasData')) || {}, estoqueRestaurante: JSON.parse(localStorage.getItem('estoqueRestaurante')) || [], historicoVendas: JSON.parse(localStorage.getItem('historicoVendas')) || [], relatorioData: JSON.parse(localStorage.getItem('relatorioData')) || {} };
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a');
        a.href = url; a.download = `backup_restaurante_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        localStorage.setItem('ultimoBackupTimestamp', Date.now().toString()); carregarConfiguracoesNaTela();
        mostrarFeedback('Backup completo gerado!');
    }
    function restaurarBackupSistema() {
        const fileInput = document.getElementById('arquivoBackup');
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) { mostrarFeedback('Selecione um arquivo!', 'erro'); return; }
        const file = fileInput.files[0]; const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backupDataRestaurada = JSON.parse(e.target.result);
                abrirModalConfirmacao('Confirmar Restauração', 'Restaurar este backup? Dados atuais serão substituídos. Ação irreversível.', function() {
                    if (backupDataRestaurada.configSistema) { localStorage.setItem('configSistema', JSON.stringify(backupDataRestaurada.configSistema)); configs = backupDataRestaurada.configSistema; }
                    if (backupDataRestaurada.mesasData) { localStorage.setItem('mesasData', JSON.stringify(backupDataRestaurada.mesasData)); mesasData = backupDataRestaurada.mesasData; }
                    if (backupDataRestaurada.estoqueRestaurante) localStorage.setItem('estoqueRestaurante', JSON.stringify(backupDataRestaurada.estoqueRestaurante));
                    if (backupDataRestaurada.historicoVendas) localStorage.setItem('historicoVendas', JSON.stringify(backupDataRestaurada.historicoVendas));
                    if (backupDataRestaurada.relatorioData) localStorage.setItem('relatorioData', JSON.stringify(backupDataRestaurada.relatorioData));
                    localStorage.setItem('ultimoBackupTimestamp', Date.now().toString());
                    mostrarFeedback('Backup restaurado! Recarregando...'); setTimeout(() => location.reload(), 2000);
                });
            } catch (err) { console.error("Erro backup:", err); mostrarFeedback('Arquivo inválido!', 'erro'); }
        };
        reader.onerror = () => { mostrarFeedback('Erro ao ler arquivo.', 'erro'); };
        reader.readAsText(file); fileInput.value = '';
    }
    function salvarConfigsNoStorage() { localStorage.setItem('configSistema', JSON.stringify(configs)); }
    function confirmarExclusaoDeUsuario(username) { abrirModalConfirmacao('Excluir Usuário', `Remover "${username}"?`, () => removerUsuarioDoSistema(username)); }
    function confirmarResetSistema() { abrirModalConfirmacao('Restaurar Padrões', 'Resetar configs e usuários (exceto admin)? Não afeta vendas/estoque. Irreversível.', resetarConfiguracoesDoSistema); }
    function resetarConfiguracoesDoSistema() {
        localStorage.removeItem('configSistema'); garantirUsuarioAdmin();
        configs = JSON.parse(localStorage.getItem('configSistema'));
        mostrarFeedback('Configs restauradas! Recarregando...'); setTimeout(() => location.reload(), 2000);
    }
    function abrirModalConfirmacao(titulo, mensagem, callbackConfirmar) {
        const modalEl = document.getElementById('modalConfirmacao'); const modalTituloEl = document.getElementById('modalTitulo'); const modalMensagemEl = document.getElementById('modalMensagem'); const modalConfirmarBtn = document.getElementById('modalConfirmar'); const modalCancelarBtn = document.getElementById('modalCancelar'); const closeModalBtn = modalEl ? modalEl.querySelector('.close-modal') : null;
        if (!modalEl || !modalTituloEl || !modalMensagemEl || !modalConfirmarBtn || !modalCancelarBtn || !closeModalBtn) {
            if (confirm(`${titulo}\n\n${mensagem}`)) callbackConfirmar(); return;
        }
        modalTituloEl.textContent = titulo; modalMensagemEl.textContent = mensagem; modalEl.style.display = 'block';
        const novoConfirmarBtn = modalConfirmarBtn.cloneNode(true); modalConfirmarBtn.parentNode.replaceChild(novoConfirmarBtn, modalConfirmarBtn);
        const novoCancelarBtn = modalCancelarBtn.cloneNode(true); modalCancelarBtn.parentNode.replaceChild(novoCancelarBtn, modalCancelarBtn);
        const novoCloseModalBtn = closeModalBtn.cloneNode(true); closeModalBtn.parentNode.replaceChild(novoCloseModalBtn, closeModalBtn);
        novoConfirmarBtn.onclick = function() { modalEl.style.display = 'none'; callbackConfirmar(); };
        novoCancelarBtn.onclick = function() { modalEl.style.display = 'none'; };
        novoCloseModalBtn.onclick = function() { modalEl.style.display = 'none'; };
        window.onclick = function(event) { if (event.target == modalEl) modalEl.style.display = "none"; }
    }
}

// Dados do cardápio (global)
const cardapio = {
    comidas: [
        { id: 'c1', nome: 'X-Burger', preco: 18.90, categoria: 'comida', estoqueId: null },
        { id: 'c2', nome: 'X-Salada', preco: 20.90, categoria: 'comida', estoqueId: null },
        { id: 'c3', nome: 'Batata Frita', preco: 12.90, categoria: 'comida', estoqueId: null },
        { id: 'c4', nome: 'Porção de Frango', preco: 25.90, categoria: 'comida', estoqueId: null }
    ],
    bebidas: [
        { id: 'b1', nome: 'Refrigerante Lata', preco: 6.90, categoria: 'bebida', estoqueId: null },
        { id: 'b2', nome: 'Suco Natural Laranja', preco: 8.90, categoria: 'bebida', estoqueId: null },
        { id: 'b3', nome: 'Água Mineral 500ml', preco: 4.90, categoria: 'bebida', estoqueId: null },
        { id: 'b4', nome: 'Cerveja Long Neck', preco: 9.90, categoria: 'bebida', estoqueId: null }
    ],
    sobremesas: [
        { id: 's1', nome: 'Pudim Fatia', preco: 8.90, categoria: 'sobremesa', estoqueId: null },
        { id: 's2', nome: 'Sorvete 2 Bolas', preco: 10.90, categoria: 'sobremesa', estoqueId: null },
        { id: 's3', nome: 'Mousse Chocolate', preco: 7.90, categoria: 'sobremesa', estoqueId: null }
    ]
};

// Função para carregar o cardápio na interface (VERSÃO ATUALIZADA E COM LOGS)
function carregarCardapio(categoriaFiltro = 'todos') {
    const gradeItens = document.getElementById('gradeItens');
    console.log("[carregarCardapio] Iniciando. Categoria:", categoriaFiltro);

    if (!gradeItens) {
        console.error("[carregarCardapio] ERRO: Elemento #gradeItens NÃO encontrado no DOM!");
        return;
    }
    gradeItens.innerHTML = ''; // Limpa a grade antes de popular

    const estoqueAtual = JSON.parse(localStorage.getItem('estoqueRestaurante')) || [];
    // console.log("[carregarCardapio] Estoque atual:", JSON.parse(JSON.stringify(estoqueAtual)));
    // console.log("[carregarCardapio] Cardápio base (constante):", JSON.parse(JSON.stringify(cardapio)));

    let itensParaExibir = [];

    // Adiciona itens do objeto 'cardapio' (constante global)
    Object.values(cardapio).forEach(listaItensCategoria => { // Itera sobre comidas, bebidas, sobremesas
        listaItensCategoria.forEach(itemCardapioFixo => {
            if (categoriaFiltro === 'todos' || itemCardapioFixo.categoria === categoriaFiltro) {
                let disponivelParaVenda = true; // Assume disponível por padrão
                // Se o item do cardápio estiver vinculado a um item de estoque (itemCardapioFixo.estoqueId)
                if (itemCardapioFixo.estoqueId) {
                    const itemNoEstoque = estoqueAtual.find(e => e.id === itemCardapioFixo.estoqueId);
                    if (itemNoEstoque) {
                        if (itemNoEstoque.quantidade <= 0) {
                            disponivelParaVenda = false;
                            // console.log(`[carregarCardapio] Item do cardápio "${itemCardapioFixo.nome}" indisponível (estoqueId: ${itemCardapioFixo.estoqueId}, qtd: 0)`);
                        }
                    } else {
                        disponivelParaVenda = false; // Vinculado mas não encontrado no estoque
                        // console.log(`[carregarCardapio] Item do cardápio "${itemCardapioFixo.nome}" com estoqueId ${itemCardapioFixo.estoqueId} não foi encontrado no estoque.`);
                    }
                }
                if (disponivelParaVenda) {
                    itensParaExibir.push({
                        id: itemCardapioFixo.id, // ID do item (ex: 'c1', 'b2')
                        nome: itemCardapioFixo.nome,
                        preco: itemCardapioFixo.preco,
                        categoria: itemCardapioFixo.categoria,
                        fromEstoque: false, // Sinaliza que é um item "definido" no cardápio
                        estoqueIdParaBaixar: itemCardapioFixo.estoqueId || null // ID do item no ESTOQUE para dar baixa, se houver link
                    });
                }
            }
        });
    });

    // Adiciona itens diretamente do ESTOQUE que são configurados para venda (lógica do seu script original)
    const categoriaMapEstoque = { 'comida': ['kg', 'g', 'un'], 'bebida': ['l', 'ml'], 'sobremesa': ['un'] };
    let itensDoEstoqueParaVenda = estoqueAtual;
    if (categoriaFiltro !== 'todos') {
        itensDoEstoqueParaVenda = estoqueAtual.filter(item => {
            const unidadesPossiveis = categoriaMapEstoque[categoriaFiltro] || [];
            return unidadesPossiveis.includes(item.unidade);
        });
    }
    itensDoEstoqueParaVenda.forEach(itemEstoque => {
        if (itemEstoque.quantidade > 0) {
            // Para evitar duplicidade se um item do estoque já foi adicionado via 'cardapio' (pelo estoqueId)
            const jaExisteNaListaPeloCardapio = itensParaExibir.some(i => i.estoqueIdParaBaixar === itemEstoque.id);
            if (!jaExisteNaListaPeloCardapio) {
                let categoriaVenda = 'outros'; // Categoria padrão
                for (const [cat, unidades] of Object.entries(categoriaMapEstoque)) {
                    if (unidades.includes(itemEstoque.unidade)) { categoriaVenda = cat; break; }
                }
                 // Apenas adiciona se a categoria do item do estoque corresponder ao filtro atual
                if (categoriaFiltro === 'todos' || categoriaVenda === categoriaFiltro) {
                    itensParaExibir.push({
                        id: itemEstoque.id, // ID do item (é o ID do próprio item no estoque)
                        nome: itemEstoque.nome,
                        preco: itemEstoque.valor, // Usa 'valor' do estoque como preço de venda
                        categoria: categoriaVenda,
                        fromEstoque: true, // Sinaliza que é um item direto do estoque
                        estoqueIdParaBaixar: itemEstoque.id // O ID para baixa é o próprio ID do item no estoque
                    });
                }
            }
        }
    });
    // console.log(`[carregarCardapio] Itens pré-filtro de busca (${itensParaExibir.length}):`, JSON.parse(JSON.stringify(itensParaExibir)));

    const termoBuscaInput = document.getElementById("buscaItem");
    const termoBusca = termoBuscaInput ? termoBuscaInput.value.toLowerCase() : "";
    // console.log("[carregarCardapio] Termo de busca:", termoBusca);

    if (termoBusca) {
        itensParaExibir = itensParaExibir.filter(item => item.nome.toLowerCase().includes(termoBusca));
    }
    // console.log(`[carregarCardapio] Itens pós-filtro de busca (${itensParaExibir.length}):`, JSON.parse(JSON.stringify(itensParaExibir)));

    if (itensParaExibir.length === 0) {
        console.log("[carregarCardapio] Nenhum item para exibir, mostrando mensagem de vazio.");
        const mensagem = document.createElement('div');
        mensagem.className = 'mensagem-sem-itens';
        mensagem.innerHTML = `
            <i class="fas fa-concierge-bell"></i>
            <p>Nenhum item encontrado${(categoriaFiltro !== 'todos' || termoBusca) ? ' para os filtros aplicados' : ''}.</p>`;
        gradeItens.appendChild(mensagem);
        return;
    }

    // console.log("[carregarCardapio] Renderizando itens na grade...");
    itensParaExibir.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.setAttribute('data-categoria', item.categoria);
        itemDiv.setAttribute('data-id', item.id); // ID do item (seja do cardápio ou do estoque)

        itemDiv.innerHTML = `
            <h3>${item.nome}</h3>
            <p>R$ ${item.preco.toFixed(2)}</p>
            <button class="btn-adicionar-item-pedido">
                <i class="fas fa-plus"></i> Adicionar
            </button>`;
        
        const addButton = itemDiv.querySelector('.btn-adicionar-item-pedido');
        // Chama adicionarAoPedido com os parâmetros corretos
        addButton.addEventListener('click', () => adicionarAoPedido(
            item.id,                     // itemId: ID do item no cardápio ou no estoque
            item.nome,                   // nome
            item.preco,                  // preco
            item.categoria,              // categoria
            item.fromEstoque,            // veioDoEstoque: true se for direto do estoque, false se for item do cardápio (mesmo que vinculado)
            item.estoqueIdParaBaixar     // estoqueIdParaBaixar: ID do item NO ESTOQUE que deve ser decrementado
        ));
        gradeItens.appendChild(itemDiv);
    });
}

// Função para adicionar item ao pedido (VERSÃO ATUALIZADA E ROBUSTA)
function adicionarAoPedido(itemId, nome, preco, categoria, veioDoEstoque = false, estoqueIdParaBaixar = null) {
    console.log(`[adicionarAoPedido] Tentando adicionar: ${nome}, ID do item: ${itemId}, Veio do Estoque: ${veioDoEstoque}, ID Estoque para Baixar: ${estoqueIdParaBaixar}`);
    if (!mesaSelecionada) {
        mostrarFeedback('Selecione uma mesa primeiro!', 'erro');
        return;
    }

    if (!mesasData.mesas[mesaSelecionada]) {
        mesasData.mesas[mesaSelecionada] = { status: 'disponivel', pedidos: [], garcom: null };
    }
    
    if (mesasData.mesas[mesaSelecionada].pedidos.length === 0 && mesasData.mesas[mesaSelecionada].status === 'disponivel') {
        mesasData.mesas[mesaSelecionada].status = 'ocupada';
        // console.log(`[adicionarAoPedido] Mesa ${mesaSelecionada} status alterado para ocupada.`);
    }

    const pedido = {
        idOriginal: itemId, // ID do item como exibido no cardápio (pode ser 'c1' ou um timestamp do estoque)
        nome: nome,
        preco: parseFloat(preco),
        categoria: categoria,
        timestamp: new Date().getTime(),
        estoqueIdBaixado: null // Para rastrear qual ID do estoque foi efetivamente usado para baixa
    };

    let estoqueFoiAtualizado = false;
    // Se 'estoqueIdParaBaixar' foi fornecido (seja de um item do cardápio vinculado, ou um item direto do estoque)
    if (estoqueIdParaBaixar) {
        const estoque = JSON.parse(localStorage.getItem('estoqueRestaurante')) || [];
        const itemNoEstoqueIndex = estoque.findIndex(e => e.id === estoqueIdParaBaixar);

        if (itemNoEstoqueIndex !== -1) {
            if (estoque[itemNoEstoqueIndex].quantidade > 0) {
                estoque[itemNoEstoqueIndex].quantidade -= 1; // Assume que 1 item do cardápio = 1 unidade do estoque
                localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
                pedido.estoqueIdBaixado = estoqueIdParaBaixar;
                estoqueFoiAtualizado = true;
                console.log(`[adicionarAoPedido] Estoque do item ID ${estoqueIdParaBaixar} (${nome}) atualizado. Nova qtd: ${estoque[itemNoEstoqueIndex].quantidade}`);
            } else {
                mostrarFeedback(`Item "${nome}" está indisponível no estoque! (ID Estoque: ${estoqueIdParaBaixar})`, 'erro');
                // Recarregar cardápio para refletir indisponibilidade
                carregarCardapio(document.querySelector('.filtro-botao.ativo')?.getAttribute('data-categoria') || 'todos');
                return; 
            }
        } else {
            // Este caso é mais crítico se estoqueIdParaBaixar foi definido mas o item não foi encontrado
            console.error(`[adicionarAoPedido] ERRO: Item de estoque com ID ${estoqueIdParaBaixar} não encontrado para ${nome}, mas era esperado.`);
            mostrarFeedback(`Erro ao encontrar item "${nome}" no estoque para baixa. Verifique a configuração.`, 'erro');
            return; 
        }
    }
    // Se 'veioDoEstoque' for true, mas 'estoqueIdParaBaixar' não foi passado corretamente (deve ser o 'itemId' nesse caso),
    // a lógica acima já cobre isso se 'item.estoqueIdParaBaixar' foi setado como 'item.id' em carregarCardapio.

    mesasData.mesas[mesaSelecionada].pedidos.push(pedido);
    localStorage.setItem('mesasData', JSON.stringify(mesasData));
    console.log("[adicionarAoPedido] mesasData salvo após adicionar item:", JSON.parse(localStorage.getItem('mesasData')));


    atualizarListaPedidos();
    inicializarMesas(); 
    if (estoqueFoiAtualizado) {
        // Recarrega o cardápio da categoria atual para refletir a baixa no estoque
        carregarCardapio(document.querySelector('.filtro-botao.ativo')?.getAttribute('data-categoria') || 'todos');
    }
    mostrarFeedback(`"${nome}" adicionado ao pedido!`, 'sucesso');
}


function removerItemPedido(indexNaLista) {
    if (mesaSelecionada && mesasData.mesas[mesaSelecionada]?.pedidos) {
        const pedidoRemovido = mesasData.mesas[mesaSelecionada].pedidos[indexNaLista];
        if (pedidoRemovido.estoqueIdBaixado) {
            const estoque = JSON.parse(localStorage.getItem('estoqueRestaurante')) || [];
            const itemNoEstoqueIndex = estoque.findIndex(e => e.id === pedidoRemovido.estoqueIdBaixado);
            if (itemNoEstoqueIndex !== -1) {
                estoque[itemNoEstoqueIndex].quantidade += 1;
                localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
                carregarCardapio(document.querySelector('.filtro-botao.ativo')?.getAttribute('data-categoria') || 'todos');
            }
        }
        mesasData.mesas[mesaSelecionada].pedidos.splice(indexNaLista, 1);
        if (mesasData.mesas[mesaSelecionada].pedidos.length === 0 && mesasData.mesas[mesaSelecionada].status !== 'aguardando_pagamento') {
            mesasData.mesas[mesaSelecionada].status = 'disponivel';
        }
        localStorage.setItem('mesasData', JSON.stringify(mesasData));
        atualizarListaPedidos();
        inicializarMesas();
        mostrarFeedback(`"${pedidoRemovido.nome}" removido.`);
    }
}

function carregarHistorico(periodo = 'hoje') {
    const listaHistorico = document.getElementById('listaHistorico');
    const totalPeriodoEl = document.getElementById('totalPeriodo');
    const qtdPedidosEl = document.getElementById('qtdPedidos');
    if (!listaHistorico || !totalPeriodoEl || !qtdPedidosEl) return;
    const vendasSalvas = JSON.parse(localStorage.getItem('historicoVendas')) || [];
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const vendasFiltradas = vendasSalvas.filter(venda => {
        const dataVendaObj = new Date(venda.data); dataVendaObj.setHours(0, 0, 0, 0);
        switch(periodo) {
            case 'hoje': return dataVendaObj.getTime() === hoje.getTime();
            case 'ontem': const ontem = new Date(hoje); ontem.setDate(hoje.getDate() - 1); return dataVendaObj.getTime() === ontem.getTime();
            case 'semana': const semanaAtras = new Date(hoje); semanaAtras.setDate(hoje.getDate() - 7); return dataVendaObj >= semanaAtras && dataVendaObj <= hoje;
            default: return true; 
        }
    });
    vendasFiltradas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    listaHistorico.innerHTML = '';
    if (vendasFiltradas.length === 0) {
        listaHistorico.innerHTML = `<div class="item-vazio"><i class="fas fa-folder-open"></i><p>Nenhum pedido neste período.</p></div>`;
    } else {
        vendasFiltradas.forEach(venda => {
            const formaPagamentoFormatada = formatarFormaPagamentoDisplay(venda.formaPagamento);
            const dataVenda = new Date(venda.data);
            const dataFormatada = dataVenda.toLocaleDateString('pt-BR');
            const horaFormatada = dataVenda.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const itemHistorico = document.createElement('div');
            itemHistorico.className = 'item-historico';
            itemHistorico.innerHTML = `
                <div class="info-pedido">
                    <div class="mesa-historico"><i class="fas fa-receipt"></i> Pedido Mesa: ${venda.mesa}</div>
                    <div class="detalhes-historico">
                        <span><i class="fas fa-user-tag"></i> G: ${venda.garcom || 'N/A'}</span>
                        <span><i class="fas fa-clock"></i> ${horaFormatada}</span>
                        <span><i class="fas fa-calendar-alt"></i> ${dataFormatada}</span>
                        <span class="forma-pagamento-historico" data-forma="${venda.formaPagamento}"><i class="fas ${getIconeFormaPagamentoDisplay(venda.formaPagamento)}"></i> ${formaPagamentoFormatada}</span>
                    </div>
                </div>
                <div class="valor-historico">R$ ${venda.total.toFixed(2)}</div>`;
            listaHistorico.appendChild(itemHistorico);
        });
    }
    const totalDoPeriodo = vendasFiltradas.reduce((sum, v) => sum + v.total, 0);
    totalPeriodoEl.textContent = `R$ ${totalDoPeriodo.toFixed(2)}`;
    qtdPedidosEl.textContent = vendasFiltradas.length.toString();
}

function formatarFormaPagamentoDisplay(formaPagamento) {
    const f = { 'dinheiro': 'Dinheiro', 'cartao_credito': 'Crédito', 'cartao_debito': 'Débito', 'pix': 'PIX' };
    return f[formaPagamento] || formaPagamento;
}
function getIconeFormaPagamentoDisplay(formaPagamento) {
    const i = { 'dinheiro': 'fa-money-bill-wave', 'cartao_credito': 'fa-credit-card', 'cartao_debito': 'fa-credit-card', 'pix': 'fa-qrcode' };
    return i[formaPagamento] || 'fa-dollar-sign';
}

// Demais funções (Estoque, Relatório, Configurações) permanecem como na sua última versão completa.
// Cole elas aqui se precisar que eu revise algo específico nelas também.
// ... (Restante do seu código JS para Estoque, Relatório, Configurações)

// ==================== FUNÇÕES DO ESTOQUE ====================
if (window.location.pathname.includes("estoque.html")) {
    document.addEventListener('DOMContentLoaded', function() {
        // Array para armazenar os itens do estoque
        let estoque = JSON.parse(localStorage.getItem('estoqueRestaurante')) || [];
        let editando = false;
        let itemEditandoId = null;
        let itemParaRemover = null; // ID do item para remover quantidade

        // Elementos do DOM
        const form = document.getElementById('itemForm');
        const estoqueBody = document.getElementById('estoqueBody');
        const btnCancelar = document.getElementById('btnCancelar');
        const busca = document.getElementById('busca'); // Input de busca
        const btnBaixoEstoque = document.getElementById('btnBaixoEstoque'); // Botão de filtro
        
        // Elementos do modal de remoção de quantidade
        const modalRemover = document.getElementById('modalRemover'); // O modal
        const btnCloseModal = modalRemover?.querySelector('.close'); // Botão fechar (X) do modal
        const btnConfirmarRemocao = document.getElementById('btnConfirmarRemocao');
        const btnCancelarRemocao = document.getElementById('btnCancelarRemocao');
        const quantidadeRemoverInput = document.getElementById('quantidadeRemover'); // Input de quantidade no modal

        // Função para verificar se existem itens com baixo estoque
        function verificarBaixoEstoque() {
            return estoque.some(item => 
                (item.unidade === 'un' && item.quantidade < 5) || 
                (item.unidade !== 'un' && item.quantidade < 0.5) // Ex: 0.5 kg ou 0.5 l
            );
        }

        // Função para atualizar visibilidade do botão de filtro "Baixo Estoque"
        function atualizarBotaoBaixoEstoque() {
            if (btnBaixoEstoque) { // Verifica se o botão existe na página
                btnBaixoEstoque.style.display = verificarBaixoEstoque() ? 'inline-block' : 'none';
            }
        }

        // Carregar estoque ao iniciar
        carregarEstoque();

        // Função para carregar o estoque na tabela
        function carregarEstoque(filtroTermo = '', itensParaMostrar = estoque) {
            if(!estoqueBody) return; // Sai se a tabela não existir na página
            estoqueBody.innerHTML = '';
            
            let itensFiltrados = itensParaMostrar;
            
            if (filtroTermo) {
                const termo = filtroTermo.toLowerCase();
                itensFiltrados = itensParaMostrar.filter(item => 
                    item.nome.toLowerCase().includes(termo) ||
                    (item.fornecedor && item.fornecedor.toLowerCase().includes(termo))
                );
            }
            
            if (itensFiltrados.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 5; // Número de colunas da tabela
                td.textContent = 'Nenhum item encontrado.';
                td.style.textAlign = 'center';
                tr.appendChild(td);
                estoqueBody.appendChild(tr);
            } else {
                itensFiltrados.forEach(item => {
                    const tr = document.createElement('tr');
                    
                    // Adiciona classe para itens com baixo estoque para feedback visual
                    if ((item.unidade === 'un' && item.quantidade < 5) || 
                        (item.unidade !== 'un' && item.quantidade < 0.5)) {
                        tr.classList.add('baixo-estoque');
                    }
                    
                    const valorTotal = item.quantidade * item.valor;
                    
                    tr.innerHTML = `
                        <td>${item.nome}</td>
                        <td>${item.quantidade.toLocaleString('pt-BR')} ${item.unidade}</td>
                        <td>R$ ${item.valor.toFixed(2)}</td>
                        <td>R$ ${valorTotal.toFixed(2)}</td>
                        <td class="acoes">
                            <button class="btn-editar" data-id="${item.id}"><i class="fas fa-edit"></i> Editar</button>
                            <button class="btn-remover-qtd" data-id="${item.id}"><i class="fas fa-minus-circle"></i> Remover Qtd.</button>
                            <button class="btn-excluir" data-id="${item.id}"><i class="fas fa-trash"></i> Excluir</button>
                        </td>
                    `;
                    estoqueBody.appendChild(tr);
                });
            }
            
            atualizarBotaoBaixoEstoque(); // Atualiza a visibilidade do botão de filtro
            
            // Adicionar eventos aos botões de ação da tabela
            document.querySelectorAll('.btn-editar').forEach(btn => {
                btn.addEventListener('click', function() {
                    editarItem(this.getAttribute('data-id'));
                });
            });
            
            document.querySelectorAll('.btn-excluir').forEach(btn => {
                btn.addEventListener('click', function() {
                    excluirItem(this.getAttribute('data-id'));
                });
            });
            
            // Botão para abrir modal de remover quantidade
            document.querySelectorAll('.btn-remover-qtd').forEach(btn => {
                btn.addEventListener('click', function() {
                    abrirModalRemover(this.getAttribute('data-id'));
                });
            });
        }

        // Evento de submit do formulário de adicionar/editar item
        if(form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const nome = document.getElementById('nome').value.trim();
                const quantidade = parseFloat(document.getElementById('quantidade').value);
                const unidade = document.getElementById('unidade').value;
                const valor = parseFloat(document.getElementById('valor').value);
                const validade = document.getElementById('validade').value; // Pode ser vazio
                const fornecedor = document.getElementById('fornecedor').value.trim(); // Pode ser vazio

                if (!nome || isNaN(quantidade) || quantidade < 0 || !unidade || isNaN(valor) || valor < 0) {
                    mostrarFeedback('Nome, quantidade, unidade e valor unitário são obrigatórios e devem ser válidos!', 'erro');
                    return;
                }

                if (editando) {
                    const index = estoque.findIndex(item => item.id == itemEditandoId); // Usar == para comparar string com number se ID for string
                    if (index > -1) {
                        estoque[index] = { ...estoque[index], nome, quantidade, unidade, valor, validade, fornecedor };
                    }
                } else {
                    const novoItem = {
                        id: Date.now().toString(), // ID como string
                        nome, quantidade, unidade, valor, validade, fornecedor
                    };
                    estoque.push(novoItem);
                }

                localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
                carregarEstoque(busca?.value || ''); // Recarrega com o filtro atual, se houver
                limparFormulario();
                mostrarFeedback(editando ? 'Item atualizado com sucesso!' : 'Item adicionado com sucesso!');
                editando = false; // Reseta o modo de edição
                itemEditandoId = null;
            });
        }
        

        // Evento do botão cancelar no formulário
        if(btnCancelar) {
            btnCancelar.addEventListener('click', limparFormulario);
        }

        // Evento de busca (input)
        if(busca) {
            busca.addEventListener('input', function() {
                carregarEstoque(this.value, estoque); // Passa o array original para filtrar
            });
        }

        // Evento do botão de filtro "Baixo Estoque"
        if (btnBaixoEstoque) {
            btnBaixoEstoque.addEventListener('click', function() {
                const itensBaixo = estoque.filter(item => 
                    (item.unidade === 'un' && item.quantidade < 5) || 
                    (item.unidade !== 'un' && item.quantidade < 0.5)
                );
                carregarEstoque(busca?.value || '', itensBaixo); // Filtra os itens de baixo estoque E aplica o termo de busca
                // Adicionar feedback visual de que o filtro está ativo, se desejado
            });
        }
        
        // Eventos do modal de remoção de quantidade
        if(btnCloseModal) btnCloseModal.onclick = () => modalRemover.style.display = 'none';
        if(btnCancelarRemocao) btnCancelarRemocao.onclick = () => modalRemover.style.display = 'none';
        
        if(btnConfirmarRemocao) {
            btnConfirmarRemocao.addEventListener('click', function() {
                if (itemParaRemover && quantidadeRemoverInput.value) {
                    const qtdRemover = parseFloat(quantidadeRemoverInput.value);
                    const itemIndex = estoque.findIndex(item => item.id == itemParaRemover);
                    
                    if (itemIndex > -1 && qtdRemover > 0) {
                        const item = estoque[itemIndex];
                        if (qtdRemover <= item.quantidade) {
                            item.quantidade -= qtdRemover;
                            item.quantidade = parseFloat(item.quantidade.toFixed(2)); // Evita problemas com float

                            localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
                            carregarEstoque(busca?.value || ''); // Recarrega com o filtro atual
                            mostrarFeedback('Quantidade removida com sucesso!');

                            if (item.quantidade <= 0) {
                                if (confirm(`"${item.nome}" ficou com quantidade zero. Deseja excluir o item do estoque?`)) {
                                    estoque.splice(itemIndex, 1);
                                    localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
                                    carregarEstoque(busca?.value || '');
                                    mostrarFeedback('Item zerado removido do estoque.');
                                }
                            }
                        } else {
                            mostrarFeedback('Quantidade a remover maior que o estoque atual!', 'erro');
                        }
                    }
                    modalRemover.style.display = 'none';
                    quantidadeRemoverInput.value = '';
                    itemParaRemover = null;
                } else {
                    mostrarFeedback('Insira uma quantidade válida para remover.', 'erro');
                }
            });
        }

        // Função para limpar o formulário de item
        function limparFormulario() {
            if(form) form.reset();
            if(document.getElementById('itemId')) document.getElementById('itemId').value = '';
            editando = false;
            itemEditandoId = null;
            document.getElementById('nome')?.focus(); // Foca no nome para novo item
        }

        // Função para abrir o modal de remoção de quantidade
        function abrirModalRemover(id) { // id é string
            itemParaRemover = id;
            const item = estoque.find(item => item.id == id);
            if (item && modalRemover && quantidadeRemoverInput) {
                quantidadeRemoverInput.value = ''; // Limpa valor anterior
                quantidadeRemoverInput.max = item.quantidade; // Define o máximo
                quantidadeRemoverInput.step = (item.unidade === 'un' || item.unidade === 'unidades') ? '1' : '0.01';
                modalRemover.style.display = 'block';
                quantidadeRemoverInput.focus();
            }
        }

        // Função para preencher formulário para edição
        function editarItem(id) { // id é string
            const item = estoque.find(item => item.id == id);
            if (item && form) {
                editando = true;
                itemEditandoId = id;
                
                document.getElementById('itemId').value = item.id;
                document.getElementById('nome').value = item.nome;
                document.getElementById('quantidade').value = item.quantidade;
                document.getElementById('unidade').value = item.unidade;
                document.getElementById('valor').value = item.valor;
                if(document.getElementById('validade')) document.getElementById('validade').value = item.validade || '';
                if(document.getElementById('fornecedor')) document.getElementById('fornecedor').value = item.fornecedor || '';
                
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                document.getElementById('nome').focus();
            }
        }

        // Função para excluir item do estoque
        function excluirItem(id) { // id é string
            if (confirm('Tem certeza que deseja excluir este item permanentemente do estoque?')) {
                estoque = estoque.filter(item => item.id != id);
                localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
                carregarEstoque(busca?.value || ''); // Recarrega com filtro atual
                mostrarFeedback('Item excluído com sucesso.');
            }
        }

        // Fechar modal ao clicar fora dele (se o modal existir)
        if (modalRemover) {
            window.addEventListener('click', function(event) {
                if (event.target === modalRemover) {
                    modalRemover.style.display = 'none';
                }
            });
        }
    });
}
// ==================== FUNÇÕES DO RELATÓRIO ====================
if (window.location.pathname.includes("relatorio.html")) {
    document.addEventListener('DOMContentLoaded', function() {
        carregarDados(); // Carrega dados e calcula resumo inicial
        
        // Adiciona listener para o botão de adicionar vendas (se existir)
        const btnAddVendas = document.querySelector('.relatorio-card .botao[onclick="adicionarVendas()"]');
        if (btnAddVendas) {
             // Remove o onclick inline e adiciona listener
            btnAddVendas.removeAttribute('onclick');
            btnAddVendas.addEventListener('click', adicionarVendas);
        }

        // Adiciona listener para o botão de adicionar funcionário (se existir)
        const btnAddFunc = document.querySelector('.relatorio-card .botao[onclick="adicionarFuncionario()"]');
        if (btnAddFunc) {
            btnAddFunc.removeAttribute('onclick');
            btnAddFunc.addEventListener('click', adicionarFuncionario);
        }
        
        // Adiciona listener para o botão de adicionar despesa (se existir)
        const btnAddDespesa = document.querySelector('.relatorio-card .botao[onclick="adicionarDespesa()"]');
        if (btnAddDespesa) {
            btnAddDespesa.removeAttribute('onclick');
            btnAddDespesa.addEventListener('click', adicionarDespesa);
        }

        // Atualiza o resumo quando houver mudanças nos inputs numéricos relevantes
        document.querySelectorAll('#vendas-dia, #salario-funcionario, #valor-despesa').forEach(input => {
            input.addEventListener('change', () => {
                // Apenas recarregar os dados e recalcular pode ser suficiente se os dados já foram salvos
                // Mas para feedback imediato sem salvar, precisaria de lógica mais complexa.
                // Por ora, o cálculo é feito após salvar os dados.
            });
        });
    });
}

// Função para carregar os dados iniciais do relatório
function carregarDados() {
    // Tenta carregar 'relatorioData' que inclui vendas manuais, funcionários e despesas.
    // As vendas de pedidos finalizados vêm de 'historicoVendas'.
    let relatorioData = JSON.parse(localStorage.getItem('relatorioData')) || {
        vendasManuais: [], // Renomeado para clareza, se for usar vendas de 'historicoVendas'
        funcionarios: [],
        despesas: []
    };
    // Garante que as chaves existem
    relatorioData.vendasManuais = relatorioData.vendasManuais || [];
    relatorioData.funcionarios = relatorioData.funcionarios || [];
    relatorioData.despesas = relatorioData.despesas || [];

    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));

    carregarDisplayVendasManuais(); // Carrega e exibe vendas manuais
    carregarFuncionarios();
    carregarDespesas();
    calcularResumoFinanceiro(); // Função renomeada para clareza
}

// Função para adicionar funcionário (chamada pelo event listener)
function adicionarFuncionario() {
    const nomeInput = document.getElementById('nome-funcionario');
    const salarioInput = document.getElementById('salario-funcionario');
    
    if (!nomeInput || !salarioInput) return;

    const nome = nomeInput.value.trim();
    const salario = parseFloat(salarioInput.value);

    if (!nome || isNaN(salario) || salario <= 0) {
        mostrarFeedback('Preencha o nome e um salário válido para o funcionário!', 'erro');
        return;
    }

    let relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    relatorioData.funcionarios.push({
        id: Date.now().toString(), // ID como string
        nome,
        salario
    });

    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));
    carregarFuncionarios(); // Atualiza a lista na tela
    calcularResumoFinanceiro(); // Recalcula o resumo
            
    nomeInput.value = '';
    salarioInput.value = '';
    mostrarFeedback('Funcionário adicionado com sucesso!');
}

// Função para carregar lista de funcionários
function carregarFuncionarios() {
    const listaFuncionarios = document.getElementById('lista-funcionarios');
    if (!listaFuncionarios) return;

    let relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    listaFuncionarios.innerHTML = ''; // Limpa a lista

    if (!relatorioData.funcionarios || relatorioData.funcionarios.length === 0) {
        listaFuncionarios.innerHTML = '<li class="item-vazio">Nenhum funcionário cadastrado.</li>';
        return;
    }

    relatorioData.funcionarios.forEach(funcionario => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="item-info">
                <span class="item-nome">${funcionario.nome}</span>
                <span class="item-valor">R$ ${funcionario.salario.toFixed(2)}</span>
            </div>
            <button class="btn-remover" data-id="${funcionario.id}" data-tipo="funcionario">
                <i class="fas fa-trash"></i>
            </button>
        `;
        listaFuncionarios.appendChild(li);
    });
    
    // Adiciona event listeners aos novos botões de remover
    listaFuncionarios.querySelectorAll('.btn-remover[data-tipo="funcionario"]').forEach(btn => {
        btn.onclick = () => removerItemRelatorio(btn.getAttribute('data-id'), 'funcionario');
    });
}

// Função para adicionar despesa (chamada pelo event listener)
function adicionarDespesa() {
    const descricaoInput = document.getElementById('descricao-despesa');
    const valorInput = document.getElementById('valor-despesa');

    if(!descricaoInput || !valorInput) return;

    const descricao = descricaoInput.value.trim();
    const valor = parseFloat(valorInput.value);

    if (!descricao || isNaN(valor) || valor <= 0) {
        mostrarFeedback('Preencha a descrição e um valor válido para a despesa!', 'erro');
        return;
    }

    let relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    relatorioData.despesas.push({
        id: Date.now().toString(), // ID como string
        descricao,
        valor,
        data: new Date().toLocaleDateString('pt-BR') // Salva data formatada
    });

    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));
    carregarDespesas(); // Atualiza a lista na tela
    calcularResumoFinanceiro(); // Recalcula o resumo
            
    descricaoInput.value = '';
    valorInput.value = '';
    mostrarFeedback('Despesa adicionada com sucesso!');
}

// Função para carregar despesas
function carregarDespesas() {
    const listaDespesas = document.getElementById('lista-despesas');
    if (!listaDespesas) return;

    let relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    listaDespesas.innerHTML = ''; // Limpa a lista

    if (!relatorioData.despesas || relatorioData.despesas.length === 0) {
        listaDespesas.innerHTML = '<li class="item-vazio">Nenhuma despesa registrada.</li>';
        return;
    }

    relatorioData.despesas.forEach(despesa => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="item-info">
                <span class="item-nome">${despesa.descricao}</span>
                <span class="item-data">${despesa.data}</span>
                <span class="item-valor">R$ ${despesa.valor.toFixed(2)}</span>
            </div>
            <button class="btn-remover" data-id="${despesa.id}" data-tipo="despesa">
                <i class="fas fa-trash"></i>
            </button>
        `;
        listaDespesas.appendChild(li);
    });

    // Adiciona event listeners aos novos botões de remover
    listaDespesas.querySelectorAll('.btn-remover[data-tipo="despesa"]').forEach(btn => {
        btn.onclick = () => removerItemRelatorio(btn.getAttribute('data-id'), 'despesa');
    });
}

// Função genérica para remover itens do relatório (funcionários, despesas)
function removerItemRelatorio(id, tipo) { // id é string
    if (!confirm(`Tem certeza que deseja remover este item (${tipo})?`)) return;

    let relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    if (tipo === 'funcionario') {
        relatorioData.funcionarios = relatorioData.funcionarios.filter(f => f.id !== id);
        carregarFuncionarios();
    } else if (tipo === 'despesa') {
        relatorioData.despesas = relatorioData.despesas.filter(d => d.id !== id);
        carregarDespesas();
    } else if (tipo === 'vendaManual') {
        relatorioData.vendasManuais = relatorioData.vendasManuais.filter(v => v.id !== id);
        carregarDisplayVendasManuais(); // Atualiza a exibição das vendas manuais
    }

    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));
    calcularResumoFinanceiro();
    mostrarFeedback(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} removido(a) com sucesso!`);
}


// Função para ADICIONAR VENDAS MANUAIS (se houver um campo para isso)
function adicionarVendas() { // Chamada pelo event listener
    const vendasDiaInput = document.getElementById('vendas-dia');
    if (!vendasDiaInput) return;

    const valorVenda = parseFloat(vendasDiaInput.value);

    if (isNaN(valorVenda) || valorVenda <= 0) {
        mostrarFeedback('Digite um valor válido para as vendas manuais!', 'erro');
        return;
    }

    let relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    relatorioData.vendasManuais.push({
        id: Date.now().toString(), // ID para possível remoção
        valor: valorVenda,
        data: new Date().toISOString() // Data completa para filtro futuro, se necessário
    });

    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));
    carregarDisplayVendasManuais(); // Atualiza o display de vendas manuais
    calcularResumoFinanceiro(); // Recalcula tudo
    
    vendasDiaInput.value = ''; // Limpa o campo
    mostrarFeedback('Venda manual adicionada com sucesso!');
}

// Função para CARREGAR/EXIBIR o total de vendas manuais do mês
function carregarDisplayVendasManuais() {
    const totalVendasMesEl = document.getElementById('total-vendas-mes'); // Elemento que mostra o total de vendas (manuais + pedidos)
    if (!totalVendasMesEl) return; // Se o elemento não existe na página, sai.

    // Esta função agora será parte do calcularResumoFinanceiro, que considera todas as fontes de venda.
    // Deixaremos calcularResumoFinanceiro atualizar este campo.
}


// Função para calcular e exibir o RESUMO FINANCEIRO TOTAL
function calcularResumoFinanceiro() {
    const relatorioData = JSON.parse(localStorage.getItem('relatorioData')) || { vendasManuais: [], funcionarios: [], despesas: [] };
    const vendasPedidos = JSON.parse(localStorage.getItem('historicoVendas')) || [];

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // 1. Total de Vendas dos Pedidos (do históricoVendas) do mês atual
    const totalVendasPedidosMes = vendasPedidos.filter(venda => {
        const dataVenda = new Date(venda.data);
        return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
    }).reduce((total, venda) => total + venda.total, 0);

    // 2. Total de Vendas Manuais (de relatorioData.vendasManuais) do mês atual
    const totalVendasManuaisMes = (relatorioData.vendasManuais || []).filter(venda => {
        const dataVenda = new Date(venda.data);
        return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
    }).reduce((total, venda) => total + venda.valor, 0);
    
    const vendasTotaisDoMes = totalVendasPedidosMes + totalVendasManuaisMes;

    // Atualiza o display do total de vendas do mês (se existir o elemento)
    const totalVendasMesEl = document.getElementById('total-vendas-mes');
    if (totalVendasMesEl) {
        totalVendasMesEl.textContent = `R$ ${vendasTotaisDoMes.toFixed(2)}`;
    }
    
    // 3. Total de Despesas (de relatorioData.despesas) - Geralmente se considera todas, não apenas do mês.
    const totalDespesas = (relatorioData.despesas || []).reduce((total, despesa) => total + despesa.valor, 0);
    
    // 4. Total da Folha de Pagamento (de relatorioData.funcionarios)
    const totalFolhaPagamento = (relatorioData.funcionarios || []).reduce((total, func) => total + func.salario, 0);
    
    // 5. Lucro Total (Vendas Totais do Mês - Despesas Totais - Folha de Pagamento Total)
    const lucroTotalMes = vendasTotaisDoMes - totalDespesas - totalFolhaPagamento;
    
    // Atualiza os elementos na interface do resumo
    const resumoVendasEl = document.getElementById('resumo-vendas');
    if(resumoVendasEl) resumoVendasEl.textContent = `R$ ${vendasTotaisDoMes.toFixed(2)}`;
    
    const resumoDespesasEl = document.getElementById('resumo-despesas');
    if(resumoDespesasEl) resumoDespesasEl.textContent = `R$ ${totalDespesas.toFixed(2)}`;
    
    const resumoFuncionariosEl = document.getElementById('resumo-funcionarios');
    if(resumoFuncionariosEl) resumoFuncionariosEl.textContent = `R$ ${totalFolhaPagamento.toFixed(2)}`;
    
    const lucroTotalEl = document.getElementById('lucro-total');
    if(lucroTotalEl) {
        lucroTotalEl.textContent = `R$ ${lucroTotalMes.toFixed(2)}`;
        lucroTotalEl.className = lucroTotalMes >= 0 ? 'valor-positivo' : 'valor-negativo'; // Atualiza classe de cor
    }
}


// ==================== FUNÇÕES DE CONFIGURAÇÕES ====================
if (window.location.pathname.includes("configuracoes.html")) {
    // Garante que o admin existe e as configurações básicas estão lá
    garantirUsuarioAdmin(); 
    let configs = JSON.parse(localStorage.getItem('configSistema')); // Já garantido que existe

    // Inicialização
    document.addEventListener('DOMContentLoaded', function() {
        carregarConfiguracoesNaTela(); // Renomeada para clareza
        carregarUsuariosNaTela();   // Renomeada para clareza
        
        const formConfigGerais = document.getElementById('formConfigGerais');
        if(formConfigGerais) formConfigGerais.addEventListener('submit', salvarConfigGerais);
        
        const btnAdicionarUsuario = document.getElementById('btnAdicionarUsuario');
        if(btnAdicionarUsuario) btnAdicionarUsuario.addEventListener('click', adicionarNovoUsuario); // Renomeada
        
        const btnGerarBackup = document.getElementById('btnGerarBackup');
        if(btnGerarBackup) btnGerarBackup.addEventListener('click', gerarBackupSistema); // Renomeada
        
        const btnRestaurarBackup = document.getElementById('btnRestaurarBackup');
        if(btnRestaurarBackup) btnRestaurarBackup.addEventListener('click', restaurarBackupSistema); // Renomeada
        
        const btnResetarSistema = document.getElementById('btnResetarSistema');
        if(btnResetarSistema) btnResetarSistema.addEventListener('click', confirmarResetSistema); // Renomeada

        // Listeners para switches e select de intervalo de backup (salva ao mudar)
        const modoManutencaoSwitch = document.getElementById('modoManutencao');
        if(modoManutencaoSwitch) modoManutencaoSwitch.addEventListener('change', (e) => {
            configs.modoManutencao = e.target.checked;
            salvarConfigsNoStorage();
            mostrarFeedback('Modo manutenção atualizado.');
        });

        const notificacoesSwitch = document.getElementById('notificacoes');
        if(notificacoesSwitch) notificacoesSwitch.addEventListener('change', (e) => {
            configs.notificacoes = e.target.checked;
            salvarConfigsNoStorage();
            mostrarFeedback('Configuração de notificações atualizada.');
        });
        
        const intervaloBackupSelect = document.getElementById('intervaloBackup');
        if(intervaloBackupSelect) intervaloBackupSelect.addEventListener('change', (e) => {
            configs.intervaloBackup = parseInt(e.target.value);
            salvarConfigsNoStorage();
            mostrarFeedback('Intervalo de backup automático atualizado.');
        });
    });

    // Carrega as configurações na tela
    function carregarConfiguracoesNaTela() {
        // Recarrega configs do localStorage para garantir dados mais recentes
        configs = JSON.parse(localStorage.getItem('configSistema')); 

        if(document.getElementById('nomeRestaurante')) document.getElementById('nomeRestaurante').value = configs.nomeRestaurante;
        if(document.getElementById('horarioFuncionamento')) document.getElementById('horarioFuncionamento').value = configs.horarioFuncionamento;
        if(document.getElementById('taxaServico')) document.getElementById('taxaServico').value = configs.taxaServico;
        if(document.getElementById('modoManutencao')) document.getElementById('modoManutencao').checked = configs.modoManutencao;
        if(document.getElementById('notificacoes')) document.getElementById('notificacoes').checked = configs.notificacoes;
        if(document.getElementById('intervaloBackup')) document.getElementById('intervaloBackup').value = configs.intervaloBackup;
        
        const dataUltimoBackupEl = document.getElementById('dataUltimoBackup');
        if (dataUltimoBackupEl) {
            const ultimoBackupTimestamp = localStorage.getItem('ultimoBackupTimestamp');
            if (ultimoBackupTimestamp) {
                dataUltimoBackupEl.textContent = new Date(parseInt(ultimoBackupTimestamp)).toLocaleString('pt-BR');
            } else {
                dataUltimoBackupEl.textContent = "Nenhum backup realizado";
            }
        }
    }

    // Salva as configurações gerais do formulário principal
    function salvarConfigGerais(e) {
        e.preventDefault();
        
        configs.nomeRestaurante = document.getElementById('nomeRestaurante').value;
        configs.horarioFuncionamento = document.getElementById('horarioFuncionamento').value;
        configs.taxaServico = parseFloat(document.getElementById('taxaServico').value) || 0; // Default 0 se NaN
        
        // Switches e select já salvam individualmente com seus listeners 'change'
        // configs.modoManutencao = document.getElementById('modoManutencao').checked;
        // configs.notificacoes = document.getElementById('notificacoes').checked;
        // configs.intervaloBackup = parseInt(document.getElementById('intervaloBackup').value);
        
        salvarConfigsNoStorage();
        mostrarFeedback('Configurações gerais salvas com sucesso!');
    }

    // ==================== GERENCIAMENTO DE USUÁRIOS (Configurações) ====================
    function carregarUsuariosNaTela() {
        // Recarrega configs para ter a lista de usuários atualizada
        configs = JSON.parse(localStorage.getItem('configSistema')); 
        const listaUsuariosEl = document.getElementById('listaUsuarios');
        if(!listaUsuariosEl) return;

        listaUsuariosEl.innerHTML = '';
        
        if (!configs.usuarios || configs.usuarios.length === 0) {
            listaUsuariosEl.innerHTML = '<li>Nenhum usuário cadastrado.</li>';
            return;
        }

        configs.usuarios.forEach(usuario => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <span class="usuario-nome">${usuario.username}</span>
                    <span class="usuario-tipo">${formatarTipoUsuarioDisplay(usuario.tipo)}</span>
                </div>
                <button class="btn-excluir-usuario" data-username="${usuario.username}" title="Remover Usuário">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            listaUsuariosEl.appendChild(li);
        });
        
        document.querySelectorAll('.btn-excluir-usuario').forEach(btn => {
            btn.addEventListener('click', function() {
                const username = this.getAttribute('data-username');
                confirmarExclusaoDeUsuario(username); // Renomeada
            });
        });
    }

    function formatarTipoUsuarioDisplay(tipo) { // Renomeada para evitar conflito se houver outra
        const tipos = {
            'garcom': 'Garçom',
            'caixa': 'Caixa',
            'gerente': 'Gerente',
            'admin': 'Administrador'
        };
        return tipos[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1);
    }

    function adicionarNovoUsuario() { // Renomeada
        const usernameInput = document.getElementById('novoUsuario');
        const passwordInput = document.getElementById('novaSenha');
        const tipoSelect = document.getElementById('tipoUsuario');

        if(!usernameInput || !passwordInput || !tipoSelect) return;

        const username = usernameInput.value.trim();
        const password = passwordInput.value; // Senha não precisa de trim usualmente
        const tipo = tipoSelect.value;
        
        if (username && password) {
            if (configs.usuarios.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                mostrarFeedback('Nome de usuário já existe!', 'erro');
                return;
            }
            
            configs.usuarios.push({ username, password, tipo });
            salvarConfigsNoStorage();
            carregarUsuariosNaTela();
            
            usernameInput.value = '';
            passwordInput.value = '';
            mostrarFeedback('Usuário adicionado com sucesso!');
        } else {
            mostrarFeedback('Nome de usuário e senha são obrigatórios!', 'erro');
        }
    }

    function removerUsuarioDoSistema(username) { // Renomeada
        // Garante que o admin padrão (se for o caso) não seja removido se for o único
        garantirUsuarioAdmin(); 
        configs = JSON.parse(localStorage.getItem('configSistema')); // Recarrega

        const admins = configs.usuarios.filter(u => u.tipo === 'admin');
        const usuarioParaRemover = configs.usuarios.find(u => u.username === username);

        if (usuarioParaRemover && usuarioParaRemover.tipo === 'admin' && admins.length === 1) {
            mostrarFeedback('Não é possível remover o último administrador do sistema!', 'erro');
            return;
        }
        
        configs.usuarios = configs.usuarios.filter(u => u.username !== username);
        salvarConfigsNoStorage();
        carregarUsuariosNaTela();
        mostrarFeedback(`Usuário "${username}" removido com sucesso!`);
    }

    // ==================== BACKUP E RESTAURAÇÃO (Configurações) ====================
    function gerarBackupSistema() { // Renomeada
        // Coleta todos os dados relevantes do localStorage
        const backupData = {
            configSistema: JSON.parse(localStorage.getItem('configSistema')) || {},
            mesasData: JSON.parse(localStorage.getItem('mesasData')) || {},
            estoqueRestaurante: JSON.parse(localStorage.getItem('estoqueRestaurante')) || [],
            historicoVendas: JSON.parse(localStorage.getItem('historicoVendas')) || [],
            relatorioData: JSON.parse(localStorage.getItem('relatorioData')) || {},
            // Adicione outros itens do localStorage que seu sistema use
        };
        
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' }); // null, 2 para formatar o JSON
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_restaurante_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Libera o objeto URL
        
        localStorage.setItem('ultimoBackupTimestamp', Date.now().toString());
        carregarConfiguracoesNaTela(); // Atualiza a data na tela
        
        mostrarFeedback('Backup completo do sistema gerado com sucesso!');
    }

    function restaurarBackupSistema() { // Renomeada
        const fileInput = document.getElementById('arquivoBackup');
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            mostrarFeedback('Selecione um arquivo de backup para restaurar!', 'erro');
            return;
        }
        const file = fileInput.files[0];
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backupDataRestaurada = JSON.parse(e.target.result);
                
                abrirModalConfirmacao( // Renomeada para maior clareza e especificidade
                    'Confirmar Restauração do Backup',
                    'Tem certeza que deseja restaurar este backup? Todos os dados atuais do sistema (configurações, mesas, estoque, vendas, relatórios) serão substituídos pelos dados do arquivo. Esta ação não pode ser desfeita.',
                    function() { // Callback de confirmação
                        // Restaura cada parte do sistema
                        if (backupDataRestaurada.configSistema) {
                            localStorage.setItem('configSistema', JSON.stringify(backupDataRestaurada.configSistema));
                            configs = backupDataRestaurada.configSistema; // Atualiza a variável local
                        }
                        if (backupDataRestaurada.mesasData) {
                            localStorage.setItem('mesasData', JSON.stringify(backupDataRestaurada.mesasData));
                            mesasData = backupDataRestaurada.mesasData; // Atualiza a variável global
                        }
                        if (backupDataRestaurada.estoqueRestaurante) {
                            localStorage.setItem('estoqueRestaurante', JSON.stringify(backupDataRestaurada.estoqueRestaurante));
                        }
                        if (backupDataRestaurada.historicoVendas) {
                            localStorage.setItem('historicoVendas', JSON.stringify(backupDataRestaurada.historicoVendas));
                        }
                        if (backupDataRestaurada.relatorioData) {
                            localStorage.setItem('relatorioData', JSON.stringify(backupDataRestaurada.relatorioData));
                        }
                        // Restaure outros itens se houver
                        
                        localStorage.setItem('ultimoBackupTimestamp', Date.now().toString()); // Marca a data da restauração
                        
                        mostrarFeedback('Backup restaurado com sucesso! A página será recarregada.');
                        setTimeout(() => location.reload(), 2000); // Recarrega para aplicar todas as mudanças
                    }
                );
            } catch (err) {
                console.error("Erro ao ler arquivo de backup:", err);
                mostrarFeedback('Arquivo de backup inválido ou corrompido!', 'erro');
            }
        };
        reader.onerror = () => {
            mostrarFeedback('Erro ao tentar ler o arquivo de backup.', 'erro');
        };
        reader.readAsText(file);
        fileInput.value = ''; // Limpa o input de arquivo
    }

    // ==================== FUNÇÕES UTILITÁRIAS (Configurações) ====================
    function salvarConfigsNoStorage() { // Renomeada
        localStorage.setItem('configSistema', JSON.stringify(configs));
    }

    function confirmarExclusaoDeUsuario(username) { // Renomeada
        abrirModalConfirmacao(
            'Confirmar Exclusão de Usuário',
            `Tem certeza que deseja remover o usuário "${username}" do sistema?`,
            () => removerUsuarioDoSistema(username)
        );
    }

    function confirmarResetSistema() { // Renomeada
        abrirModalConfirmacao(
            'Restaurar Padrões do Sistema',
            'Tem certeza que deseja restaurar todas as configurações e usuários para os valores padrão? Esta ação removerá todos os usuários exceto o admin padrão e resetará as configurações gerais. Não afeta dados de vendas, estoque ou mesas. Esta ação não pode ser desfeita.',
            resetarConfiguracoesDoSistema // Renomeada
        );
    }

    function resetarConfiguracoesDoSistema() { // Renomeada
        // Recria o objeto de configurações padrão, mantendo o admin padrão
        localStorage.clear(); // Limpa TUDO para um reset mais completo de dados de operação.
                              // Se quiser manter mesasData, estoqueRestaurante, historicoVendas, relatorioData,
                              // então não use localStorage.clear(). Remova apenas 'configSistema'.
                              // E chame garantirUsuarioAdmin() para recriar só as configs.

        // Para um reset apenas das configurações do sistema e usuários:
        // localStorage.removeItem('configSistema'); 
        garantirUsuarioAdmin(); // Recria 'configSistema' com o admin padrão e configurações default
        
        configs = JSON.parse(localStorage.getItem('configSistema')); // Recarrega as configs resetadas

        mostrarFeedback('Configurações do sistema restauradas para os padrões! A página será recarregada.');
        setTimeout(() => location.reload(), 2000);
    }

    // Modal de Confirmação específico para a página de configurações
    function abrirModalConfirmacao(titulo, mensagem, callbackConfirmar) {
        const modalEl = document.getElementById('modalConfirmacao');
        const modalTituloEl = document.getElementById('modalTitulo');
        const modalMensagemEl = document.getElementById('modalMensagem');
        const modalConfirmarBtn = document.getElementById('modalConfirmar');
        const modalCancelarBtn = document.getElementById('modalCancelar');
        const closeModalBtn = modalEl ? modalEl.querySelector('.close-modal') : null;

        if (!modalEl || !modalTituloEl || !modalMensagemEl || !modalConfirmarBtn || !modalCancelarBtn || !closeModalBtn) {
            console.error("Elementos do modal de confirmação não encontrados!");
            // Fallback para um confirm simples se o modal não estiver completo
            if (confirm(`${titulo}\n\n${mensagem}`)) {
                callbackConfirmar();
            }
            return;
        }
        
        modalTituloEl.textContent = titulo;
        modalMensagemEl.textContent = mensagem;
        modalEl.style.display = 'block';
        
        // Remove listeners antigos para evitar múltiplas execuções
        const novoConfirmarBtn = modalConfirmarBtn.cloneNode(true);
        modalConfirmarBtn.parentNode.replaceChild(novoConfirmarBtn, modalConfirmarBtn);
        
        const novoCancelarBtn = modalCancelarBtn.cloneNode(true);
        modalCancelarBtn.parentNode.replaceChild(novoCancelarBtn, modalCancelarBtn);

        const novoCloseModalBtn = closeModalBtn.cloneNode(true);
        closeModalBtn.parentNode.replaceChild(novoCloseModalBtn, closeModalBtn);

        novoConfirmarBtn.onclick = function() {
            modalEl.style.display = 'none';
            callbackConfirmar();
        };
        
        novoCancelarBtn.onclick = function() {
            modalEl.style.display = 'none';
        };
        
        novoCloseModalBtn.onclick = function() {
            modalEl.style.display = 'none';
        };

        // Fechar ao clicar fora (opcional)
        window.onclick = function(event) {
            if (event.target == modalEl) {
                modalEl.style.display = "none";
            }
        }
    }
}

// ==================== FUNÇÕES DE CARREGAMENTO DO CARDÁPIO (Área do Garçom) ====================
// Função para carregar o cardápio na interface (Área do Garçom)
function carregarCardapio(categoriaFiltro = 'todos') {
    const gradeItens = document.getElementById('gradeItens');
    if (!gradeItens) return;

    gradeItens.innerHTML = ''; // Limpa a grade
    
    // Carrega itens do estoque REAL (do localStorage)
    const estoqueAtual = JSON.parse(localStorage.getItem('estoqueRestaurante')) || [];
    
    let itensParaExibir = [];

    // Adiciona itens fixos do cardápio, filtrados pela categoria selecionada
    Object.values(cardapio).forEach(listaCategoria => {
        listaCategoria.forEach(itemCardapioFixo => {
            if (categoriaFiltro === 'todos' || itemCardapioFixo.categoria === categoriaFiltro) {
                // Verifica se este item fixo do cardápio está vinculado a um item de estoque
                // E se esse item de estoque tem quantidade > 0
                let disponivelNoEstoque = true; // Assume disponível se não vinculado ou se não há controle de estoque para ele
                if (itemCardapioFixo.estoqueId) { // Se o item do cardápio tem um ID de estoque vinculado
                    const itemNoEstoque = estoqueAtual.find(e => e.id === itemCardapioFixo.estoqueId);
                    if (itemNoEstoque && itemNoEstoque.quantidade <= 0) {
                        disponivelNoEstoque = false;
                    } else if (!itemNoEstoque) { // Se vinculado mas não encontrado no estoque
                        disponivelNoEstoque = false; 
                    }
                }
                // Poderia também verificar itens não vinculados que são "infinitos" (ex: X-Burger não baixa estoque)
                // ou que são montados e o controle é nos ingredientes.
                // Por simplicidade, vamos assumir que itens do 'cardapio' que não tem 'estoqueId' estão sempre disponíveis
                // ou seu controle de estoque é feito de outra forma.

                if (disponivelNoEstoque) { // Só adiciona se disponível
                     itensParaExibir.push({ ...itemCardapioFixo, fromEstoque: false }); // Marcar que não é diretamente do estoque (é do cardápio)
                }
            }
        });
    });

    // Adiciona itens DIRETAMENTE do estoque que são vendáveis (ex: uma bebida específica, uma sobremesa pronta)
    // Esses itens não estariam no 'cardapio' fixo, mas sim gerenciados apenas pelo estoque.
    // (Esta parte pode ser opcional ou ajustada conforme a lógica de negócio)
    // Por ora, vamos assumir que o 'cardapio' global é a fonte principal de itens vendáveis,
    // e o 'estoqueRestaurante' é para ingredientes ou itens que podem ser vendidos diretamente SE configurados.
    // A lógica original adicionava itens do estoque com base na unidade de medida, o que pode ser complexo para venda.

    // Vamos manter a exibição do 'cardapio' como principal, e o estoque é para controle interno ou itens específicos.
    // Se um item do 'estoqueRestaurante' é diretamente vendável e não está no 'cardapio',
    // você precisaria de um campo "vendável: true" e "categoriaVenda" no item do estoque.

    // Filtragem final por termo de busca (se houver)
    const termoBusca = document.getElementById("buscaItem")?.value.toLowerCase() || "";
    if (termoBusca) {
        itensParaExibir = itensParaExibir.filter(item => item.nome.toLowerCase().includes(termoBusca));
    }


    if (itensParaExibir.length === 0) {
        const mensagem = document.createElement('div');
        mensagem.className = 'mensagem-sem-itens'; // Estilo CSS para mensagem
        mensagem.innerHTML = `
            <i class="fas fa-concierge-bell"></i>
            <p>Nenhum item encontrado${categoriaFiltro !== 'todos' || termoBusca ? ' para os filtros aplicados' : ''}.</p>
        `;
        gradeItens.appendChild(mensagem);
        return;
    }

    // Adiciona os itens filtrados à grade
    itensParaExibir.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item'; // Classe para estilização CSS
        itemDiv.setAttribute('data-categoria', item.categoria); // Para filtros
        itemDiv.setAttribute('data-id', item.id); // ID do item

        itemDiv.innerHTML = `
            <h3>${item.nome}</h3>
            <p>R$ ${item.preco.toFixed(2)}</p>
            <button class="btn-adicionar-item-pedido">
                <i class="fas fa-plus"></i> Adicionar
            </button>
        `;
        // Adiciona o evento de clique diretamente aqui
        const addButton = itemDiv.querySelector('.btn-adicionar-item-pedido');
        addButton.addEventListener('click', () => adicionarAoPedido(item.id, item.nome, item.preco, item.categoria, item.fromEstoque, item.estoqueId));
        
        gradeItens.appendChild(itemDiv);
    });
}

// scripts.js

// Função para adicionar item ao pedido (VERSÃO COM MAIS LOGS PARA DEPURAÇÃO)
function adicionarAoPedido(itemId, nome, preco, categoria, veioDoEstoque = false, estoqueIdParaBaixar = null) {
    console.log(`[adicionarAoPedido] Chamada com: itemId=<span class="math-inline">\{itemId\}, nome\=</span>{nome}, preco=<span class="math-inline">\{preco\}, categoria\=</span>{categoria}, veioDoEstoque=<span class="math-inline">\{veioDoEstoque\}, estoqueIdParaBaixar\=</span>{estoqueIdParaBaixar}`);
    console.log("[adicionarAoPedido] Estado atual de mesaSelecionada:", mesaSelecionada);

    if (!mesaSelecionada) {
        mostrarFeedback('Selecione uma mesa primeiro antes de adicionar um item!', 'erro'); // Mensagem mais clara
        console.error("[adicionarAoPedido] ERRO: Nenhuma mesa selecionada.");
        return;
    }

    // Garante que mesasData e mesasData.mesas existam
    if (!mesasData) {
        console.error("[adicionarAoPedido] ERRO: mesasData é nulo ou indefinido! Tentando reinicializar.");
        mesasData = { mesas: {}, atribuicoes: {} }; 
    }
    if (!mesasData.mesas) {
        console.error("[adicionarAoPedido] ERRO: mesasData.mesas é nulo ou indefinido! Tentando reinicializar 'mesas'.");
        mesasData.mesas = {}; 
    }

    // Inicializa a estrutura da mesa se ela não existir em mesasData.mesas
    if (!mesasData.mesas[mesaSelecionada]) {
        console.log(`[adicionarAoPedido] Mesa ${mesaSelecionada} não encontrada em mesasData.mesas. Inicializando...`);
        mesasData.mesas[mesaSelecionada] = {
            status: 'disponivel', 
            pedidos: [],
            garcom: null // Garçom que efetivamente adiciona/finaliza
        };
        console.log(`[adicionarAoPedido] Mesa ${mesaSelecionada} inicializada:`, JSON.parse(JSON.stringify(mesasData.mesas[mesaSelecionada])));
    }
    
    const mesaAtual = mesasData.mesas[mesaSelecionada]; 

    if (mesaAtual.pedidos.length === 0 && mesaAtual.status === 'disponivel') {
        mesaAtual.status = 'ocupada';
        console.log(`[adicionarAoPedido] Mesa ${mesaSelecionada} status alterado para 'ocupada'.`);
    }

    const pedido = {
        idOriginal: itemId, // ID do item do cardápio ou do estoque
        nome: nome,
        preco: parseFloat(preco), 
        categoria: categoria,
        timestamp: new Date().getTime(),
        estoqueIdBaixado: null // Qual ID do estoque foi realmente usado para baixa
    };
    console.log("[adicionarAoPedido] Objeto 'pedido' criado:", JSON.parse(JSON.stringify(pedido)));

    let estoqueFoiAtualizado = false;
    if (estoqueIdParaBaixar) { // Se há um ID de estoque para dar baixa (seja de item do cardápio vinculado ou item direto do estoque)
        console.log(`[adicionarAoPedido] Verificando estoque para estoqueIdParaBaixar: ${estoqueIdParaBaixar}`);
        const estoque = JSON.parse(localStorage.getItem('estoqueRestaurante')) || [];
        const itemNoEstoqueIndex = estoque.findIndex(e => e.id === estoqueIdParaBaixar);

        if (itemNoEstoqueIndex !== -1) {
            console.log(`[adicionarAoPedido] Item encontrado no estoque (index ${itemNoEstoqueIndex}):`, JSON.parse(JSON.stringify(estoque[itemNoEstoqueIndex])));
            if (estoque[itemNoEstoqueIndex].quantidade > 0) {
                estoque[itemNoEstoqueIndex].quantidade -= 1; // Assume 1 item do cardápio = 1 unidade do estoque
                localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
                pedido.estoqueIdBaixado = estoqueIdParaBaixar; // Registra qual ID do estoque foi usado
                estoqueFoiAtualizado = true;
                console.log(`[adicionarAoPedido] Estoque do item ID <span class="math-inline">\{estoqueIdParaBaixar\} \(</span>{nome}) atualizado. Nova qtd: ${estoque[itemNoEstoqueIndex].quantidade}`);
            } else {
                mostrarFeedback(`Item "${nome}" está ESGOTADO no estoque! (ID Estoque: ${estoqueIdParaBaixar})`, 'erro');
                console.warn(`[adicionarAoPedido] Item "${nome}" (Estoque ID: ${estoqueIdParaBaixar}) esgotado.`);
                // Recarrega o cardápio para refletir a indisponibilidade, se a função estiver acessível globalmente
                if (typeof carregarCardapio === "function") {
                    carregarCardapio(document.querySelector('.filtro-botao.ativo')?.getAttribute('data-categoria') || 'todos');
                }
                return; // Não adiciona o pedido se o item de estoque vinculado está zerado
            }
        } else {
            // Este é um caso problemático: foi instruído a baixar um estoqueId que não existe.
            console.error(`[adicionarAoPedido] ERRO CRÍTICO: Item de estoque com ID <span class="math-inline">\{estoqueIdParaBaixar\} \(para "</span>{nome}") NÃO FOI ENCONTRADO no estoque, mas era esperado para baixa.`);
            mostrarFeedback(`Erro: item de controle de estoque para "${nome}" não encontrado. Avise o administrador.`, 'erro');
            return; 
        }
    }

    // Adiciona o pedido à lista de pedidos da mesa
    mesaAtual.pedidos.push(pedido);
    console.log(`[adicionarAoPedido] Pedido adicionado à mesa ${mesaSelecionada}. Total de pedidos na mesa agora: ${mesaAtual.pedidos.length}`);
    console.log(`[adicionarAoPedido] Pedidos da mesa ${mesaSelecionada} agora:`, JSON.parse(JSON.stringify(mesaAtual.pedidos)));


    try {
        localStorage.setItem('mesasData', JSON.stringify(mesasData));
        console.log("[adicionarAoPedido] SUCESSO: mesasData salvo no localStorage. Conteúdo atual de mesasData:", JSON.parse(localStorage.getItem('mesasData')));
        // Especificamente, logar a mesa que acabamos de modificar:
        if (mesasData.mesas[mesaSelecionada]) {
             console.log(`[adicionarAoPedido] Estado da mesa ${mesaSelecionada} no localStorage:`, JSON.parse(JSON.stringify(mesasData.mesas[mesaSelecionada])));
        }
    } catch (error) {
        console.error("[adicionarAoPedido] ERRO FATAL ao salvar mesasData no localStorage:", error);
        mostrarFeedback('ERRO GRAVE ao salvar dados do pedido. Contate o suporte.', 'erro');
        // Considerar reverter a adição do pedido ao array se o save falhar
        // mesaAtual.pedidos.pop(); // Remove o último pedido adicionado
        return;
    }

    atualizarListaPedidos(); // Atualiza UI da lista de pedidos do garçom
    inicializarMesas();    // Atualiza UI dos botões de mesa (status pode ter mudado)
    
    if (estoqueFoiAtualizado) {
        // Recarrega o cardápio da categoria atual para refletir a baixa no estoque
        if (typeof carregarCardapio === "function") {
             carregarCardapio(document.querySelector('.filtro-botao.ativo')?.getAttribute('data-categoria') || 'todos');
        }
    }
    mostrarFeedback(`"${nome}" adicionado ao pedido da Mesa ${mesaSelecionada}!`, 'sucesso');
}