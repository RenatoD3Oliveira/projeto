// ==================== FUNÇÕES PRINCIPAIS ====================

/*
 * Sistema de Gerenciamento de Restaurante
 * 
 * Funcionalidades:
 * - Sistema de login com diferentes níveis de acesso (admin, garçom, caixa)
 * - Gerenciamento de mesas e pedidos
 * - Sistema de estoque com controle de quantidade
 * - Relatórios financeiros
 * - Configurações do sistema
 * - Backup e restauração de dados
 * 
 * Novas:
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
        // Remove qualquer usuário admin existente
        configs.usuarios = configs.usuarios.filter(u => u.tipo !== 'admin');
        // Adiciona o usuário admin padrão
        configs.usuarios.push({
            username: "admin",
            password: "1234",
            tipo: "admin"
        });
        localStorage.setItem('configSistema', JSON.stringify(configs));
    }
}

// Garante que o usuário admin existe em qualquer situação
function garantirUsuarioAdmin() {
    verificarUsuarioAdmin();

    // Verifica novamente e força a criação se necessário
    let configs = JSON.parse(localStorage.getItem('configSistema')) || {};
    if (!configs.usuarios || !configs.usuarios.some(u => u.tipo === 'admin')) {
        localStorage.clear(); // Limpa todo o localStorage
        configs = {
            nomeRestaurante: "Meu Restaurante",
            horarioFuncionamento: "08:00 - 22:00",
            taxaServico: 10,
            modoManutencao: false,
            notificacoes: true,
            intervaloBackup: 7,
            usuarios: [{
                username: "admin",
                password: "1234",
                tipo: "admin"
            }]
        };
        localStorage.setItem('configSistema', JSON.stringify(configs));
    }
}

// Função para validar o login
function validarLogin(usuario, senha) {
    garantirUsuarioAdmin(); // Garante que o admin existe antes de validar
    const configs = JSON.parse(localStorage.getItem('configSistema')) || {};
    const usuarioEncontrado = configs.usuarios?.find(u => u.username === usuario && u.password === senha);

    if (usuarioEncontrado) {
        // Salva as informações do usuário logado
        localStorage.setItem('usuarioLogado', JSON.stringify({
            username: usuarioEncontrado.username,
            tipo: usuarioEncontrado.tipo
        }));
        return usuarioEncontrado;
    }
    return null;
}

// Função para verificar o tipo de usuário e ajustar a interface
function ajustarInterface() {
    garantirUsuarioAdmin(); // Garante que o admin existe antes de ajustar a interface
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) return;

    const sidebar = document.querySelector('.sidebar ul');
    if (!sidebar) return;

    // Remove todos os itens do menu
    sidebar.innerHTML = '';

    // Adiciona itens do menu baseado no tipo de usuário
    switch (usuarioLogado.tipo) {
        case 'garcom':
            sidebar.innerHTML = `
                <li><a href="garcom.html"><i class="fas fa-utensils"></i> Área do Garçom</a></li>
                <li><a href="index.html"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
            `;
            // Redireciona se estiver em uma página não autorizada
            if (!window.location.pathname.includes("garcom.html") &&
                !window.location.pathname.includes("index.html")) {
                window.location.href = "garcom.html";
            }
            break;

        case 'caixa':
            sidebar.innerHTML = `
                <li><a href="caixa.html"><i class="fas fa-cash-register"></i> Área do Caixa</a></li>
                <li><a href="index.html"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
            `;
            // Redireciona se estiver em uma página não autorizada
            if (!window.location.pathname.includes("caixa.html") &&
                !window.location.pathname.includes("index.html")) {
                window.location.href = "caixa.html";
            }
            break;

        case 'gerente':
            sidebar.innerHTML = `
                <li><a href="relatorio.html"><i class="fas fa-chart-line"></i> Relatórios</a></li>
                <li><a href="estoque.html"><i class="fas fa-boxes"></i> Estoque</a></li>
                <li><a href="index.html"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
            `;
            // Redireciona se estiver em uma página não autorizada
            if (!window.location.pathname.includes("relatorio.html") &&
                !window.location.pathname.includes("estoque.html") &&
                !window.location.pathname.includes("index.html")) {
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
                <li><a href="usuario.html"><i class="fa-solid fa-users"></i> Usuários</a></li>
                <li><a href="index.html"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
            `;
            break;

        default:
            // Se o tipo de usuário não for reconhecido, redireciona para o login
            window.location.href = "index.html";
            break;
    }

    // Adiciona a classe 'active' ao link da página atual
    const currentPage = window.location.pathname.split('/').pop();
    const activeLink = sidebar.querySelector(`a[href="${currentPage}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Inicializa o sistema de login
if (window.location.pathname.includes("index.html")) {
    // Garante que o admin existe
    garantirUsuarioAdmin();

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const usuario = document.getElementById("usuario").value;
            const senha = document.getElementById("senha").value;
            const usuarioValidado = validarLogin(usuario, senha);

            if (usuarioValidado) {
                window.location.href = "garcom.html";
            } else {
                const mensagemErro = document.getElementById("mensagemErro");
                if (mensagemErro) {
                    mensagemErro.style.display = "block";
                }
            }
        });
    }
} else {
    // Verifica se o usuário está logado em outras páginas
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        window.location.href = "index.html";
    } else {
        ajustarInterface();
        // Atualiza o nome do usuário na interface
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

// Gerenciamento de mesas
let mesasData = JSON.parse(localStorage.getItem('mesasData')) || {
    mesas: {},
    atribuicoes: {}
};

// Função para inicializar as mesas
function inicializarMesas() {
    const gridMesas = document.querySelector('.grid-mesas');
    if (!gridMesas) return;

    gridMesas.innerHTML = '';

    // Recupera o usuário logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) return;

    // Cria 6 mesas
    for (let i = 1; i <= 6; i++) {
        const mesaId = `Mesa ${i}`;
        const mesaData = mesasData.mesas[mesaId] || { status: 'disponivel' };
        const atribuidaA = mesasData.atribuicoes[mesaId];
        const ehMinhaMesa = atribuidaA === usuarioLogado.username;

        const mesaButton = document.createElement('button');
        mesaButton.className = `mesa-button ${mesaData.status} ${ehMinhaMesa ? 'minha-mesa' : ''}`;
        mesaButton.onclick = () => selecionarMesa(mesaId);

        let mesaContent = `
            <i class="fas fa-table"></i>
            ${mesaId}
            <div class="mesa-info">
                ${mesaData.status === 'ocupada' ? 'Ocupada' : 'Disponível'}
                ${atribuidaA ? `<br>Garçom: ${atribuidaA}` : ''}
            </div>
        `;

        // Adiciona botões de ação se a mesa estiver disponível ou for minha mesa
        if (mesaData.status === 'disponivel' || ehMinhaMesa) {
            mesaContent += `
                <div class="mesa-actions">
                    <button class="mesa-action-btn" onclick="event.stopPropagation(); atribuirMesa('${mesaId}')">
                        <i class="fas fa-user-plus"></i>
                    </button>
                </div>
            `;
        }

        mesaButton.innerHTML = mesaContent;
        gridMesas.appendChild(mesaButton);
    }
}

// Função para atribuir uma mesa ao garçom
function atribuirMesa(mesaId) {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) return;

    // Se a mesa já estiver atribuída a outro garçom, não permite a atribuição
    if (mesasData.atribuicoes[mesaId] && mesasData.atribuicoes[mesaId] !== usuarioLogado.username) {
        mostrarFeedback('Esta mesa já está atribuída a outro garçom!', 'erro');
        return;
    }

    // Se a mesa já estiver atribuída ao garçom atual, remove a atribuição
    if (mesasData.atribuicoes[mesaId] === usuarioLogado.username) {
        delete mesasData.atribuicoes[mesaId];
        mostrarFeedback('Mesa desatribuída com sucesso!');
    } else {
        // Atribui a mesa ao garçom
        mesasData.atribuicoes[mesaId] = usuarioLogado.username;
        mostrarFeedback('Mesa atribuída com sucesso!');
    }

    // Salva as alterações
    localStorage.setItem('mesasData', JSON.stringify(mesasData));
    inicializarMesas();
}

// Função para selecionar uma mesa
function selecionarMesa(mesa) {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) return;

    // Verifica se a mesa está atribuída a outro garçom
    if (mesasData.atribuicoes[mesa] && mesasData.atribuicoes[mesa] !== usuarioLogado.username) {
        mostrarFeedback('Esta mesa está atribuída a outro garçom!', 'erro');
        return;
    }

    // Se a mesa não existe nos dados, inicializa
    if (!mesasData.mesas[mesa]) {
        mesasData.mesas[mesa] = { status: 'disponivel', pedidos: [] };
    }

    // Se a mesa está ocupada ou aguardando pagamento, permite visualizar e adicionar pedidos
    if (mesasData.mesas[mesa].status === 'ocupada' || mesasData.mesas[mesa].status === 'aguardando_pagamento') {
        mesaSelecionada = mesa;
        const mesaSelecionadaTitulo = document.getElementById("mesaSelecionadaTitulo");
        if (mesaSelecionadaTitulo) {
            mesaSelecionadaTitulo.textContent = mesa;
        }
        atualizarListaPedidos();
        toggleAbaPedidos();
        return;
    }

    // Se chegou aqui, a mesa está disponível
    mesaSelecionada = mesa;
    const mesaSelecionadaTitulo = document.getElementById("mesaSelecionadaTitulo");
    if (mesaSelecionadaTitulo) {
        mesaSelecionadaTitulo.textContent = mesa;
    }

    // Só marca como ocupada se tiver pedidos
    if (mesasData.mesas[mesa].pedidos && mesasData.mesas[mesa].pedidos.length > 0) {
        mesasData.mesas[mesa].status = 'ocupada';
    } else {
        mesasData.mesas[mesa].status = 'disponivel';
    }

    localStorage.setItem('mesasData', JSON.stringify(mesasData));
    atualizarListaPedidos();
    toggleAbaPedidos();
    inicializarMesas();
}

// Inicializa as mesas quando a página do garçom é carregada
if (window.location.pathname.includes("garcom.html")) {
    document.addEventListener('DOMContentLoaded', function () {
        inicializarMesas();
        carregarCardapio();

        // Adiciona eventos aos botões de filtro
        document.querySelectorAll('.filtro-botao').forEach(botao => {
            botao.addEventListener('click', function () {
                document.querySelectorAll('.filtro-botao').forEach(b => b.classList.remove('ativo'));
                this.classList.add('ativo');
                carregarCardapio(this.getAttribute('data-categoria'));
            });
        });
    });
}

//
// < -------------------------------- >
//



// Função para exibir feedback visual
function mostrarFeedback(mensagem, tipo = "sucesso") {
    const feedback = document.createElement("div");
    feedback.className = `feedback-mensagem ${tipo}`;
    feedback.innerHTML = `
        <i class="fas ${tipo === "sucesso" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
        ${mensagem}
    `;
    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.remove();
    }, 3000);
}

// Verifica se o elemento existe antes de adicionar o event listener
const menuButton = document.getElementById("menuButton");
if (menuButton) {
    menuButton.addEventListener("click", () => {
        const sidebar = document.getElementById("sidebar");
        if (sidebar) {
            sidebar.classList.toggle("open");
        }
    });
} else {
    console.error("Elemento menuButton não encontrado!");
}

const closeButton = document.getElementById("closeButton");
if (closeButton) {
    closeButton.addEventListener("click", () => {
        const sidebar = document.getElementById("sidebar");
        if (sidebar) {
            sidebar.classList.remove("open");
        }
    });
} else {
    console.error("Elemento closeButton não encontrado!");
}

// Função para abrir/fechar a aba lateral de pedidos
function toggleAbaPedidos() {
    const abaPedidos = document.getElementById("abaPedidos");
    if (abaPedidos) {
        abaPedidos.classList.toggle("open");
    }
}

// Variável global para armazenar a mesa selecionada
let mesaSelecionada = null;

// Função para atualizar a lista de pedidos
function atualizarListaPedidos() {
    const listaPedidos = document.getElementById("listaPedidos");
    const totalPedido = document.getElementById("totalPedido");
    if (!listaPedidos || !totalPedido) return;

    listaPedidos.innerHTML = "";
    let total = 0;

    if (mesaSelecionada && mesasData.mesas[mesaSelecionada]?.pedidos) {
        mesasData.mesas[mesaSelecionada].pedidos.forEach((pedido, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span>${pedido.nome} - R$ ${pedido.preco.toFixed(2)}</span>
                <button onclick="removerItemPedido(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            listaPedidos.appendChild(li);
            total += pedido.preco;
        });
    }

    totalPedido.textContent = total.toFixed(2);
}

// Função para finalizar o pedido (Garçom)
function finalizarPedido() {
    if (!mesaSelecionada) {
        mostrarFeedback('Nenhuma mesa selecionada!', 'erro');
        return;
    }

    const mesa = mesasData.mesas[mesaSelecionada];
    if (!mesa || !mesa.pedidos || mesa.pedidos.length === 0) {
        mostrarFeedback('Não há pedidos para finalizar!', 'erro');
        return;
    }

    // Se já estiver aguardando pagamento, não permite finalizar novamente
    if (mesa.status === 'aguardando_pagamento') {
        mostrarFeedback('Esta mesa já está aguardando pagamento!', 'erro');
        return;
    }

    // Atualiza o status da mesa para aguardando pagamento
    mesa.status = 'aguardando_pagamento';
    localStorage.setItem('mesasData', JSON.stringify(mesasData));

    // Fecha a aba de pedidos e atualiza a interface
    toggleAbaPedidos();
    inicializarMesas();
    mostrarFeedback('Pedido finalizado com sucesso! Aguardando pagamento.', 'sucesso');
}

// Função para filtrar itens por categoria
function filtrarPorCategoria(categoria) {
    const itens = document.querySelectorAll(".item");
    itens.forEach((item) => {
        const itemCategoria = item.getAttribute("data-categoria");
        if (categoria === "todos" || itemCategoria === categoria) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

// Função para filtrar itens por busca
function filtrarItens() {
    const termo = document.getElementById("buscaItem").value.toLowerCase();
    const itens = document.querySelectorAll(".item");
    itens.forEach((item) => {
        const nomeItem = item.textContent.toLowerCase();
        if (nomeItem.includes(termo)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

// Adiciona eventos aos botões de filtro
document.querySelectorAll(".filtro-botao").forEach((botao) => {
    botao.addEventListener("click", () => {
        document.querySelectorAll(".filtro-botao").forEach((b) => b.classList.remove("ativo"));
        botao.classList.add("ativo");
        const categoria = botao.getAttribute("data-categoria");
        filtrarPorCategoria(categoria);
    });
});

// Funções para a Tela do Caixa
if (window.location.pathname.includes("caixa.html")) {
    document.addEventListener('DOMContentLoaded', function () {
        carregarPedidosCaixa();
        carregarHistorico('hoje');

        // Adiciona eventos aos botões de filtro
        document.querySelectorAll('.filtros-historico .botao').forEach(botao => {
            botao.addEventListener('click', function () {
                // Remove a classe ativo de todos os botões
                document.querySelectorAll('.filtros-historico .botao').forEach(b =>
                    b.classList.remove('ativo')
                );
                // Adiciona a classe ativo ao botão clicado
                this.classList.add('ativo');
                // Carrega o histórico do período selecionado
                carregarHistorico(this.getAttribute('data-periodo'));
            });
        });
    });
}

// Função para carregar os pedidos no caixa
function carregarPedidosCaixa() {
    const listaMesas = document.getElementById("listaMesas");
    if (!listaMesas) return;

    listaMesas.innerHTML = "";

    // Carrega os dados das mesas
    const mesasComPedidos = Object.entries(mesasData.mesas || {}).filter(([_, mesa]) =>
        (mesa.status === 'ocupada' || mesa.status === 'aguardando_pagamento') &&
        mesa.pedidos && mesa.pedidos.length > 0
    );

    if (mesasComPedidos.length === 0) {
        // Caso não existam pedidos
        const mensagemVazia = document.createElement("div");
        mensagemVazia.className = "mensagem-sem-itens";
        mensagemVazia.innerHTML = `
            <i class="fas fa-receipt"></i>
            <p>Nenhum pedido em aberto.</p>
        `;
        listaMesas.appendChild(mensagemVazia);
        return;
    }

    // Itera sobre as mesas com pedidos
    mesasComPedidos.forEach(([mesaId, mesa]) => {
        const divMesa = document.createElement("div");
        divMesa.className = "mesa-caixa";
        if (mesa.status === 'aguardando_pagamento') {
            divMesa.classList.add('aguardando-pagamento');
        }

        // Título da Mesa
        const titulo = document.createElement("h2");
        titulo.innerHTML = `
            <i class="fas fa-table"></i> ${mesaId}
            ${mesa.status === 'aguardando_pagamento' ? '<span class="status-pagamento">Aguardando Pagamento</span>' : ''}
        `;
        if (mesa.garcom) {
            titulo.innerHTML += ` <span class="garcom-info">(Garçom: ${mesa.garcom})</span>`;
        }
        divMesa.appendChild(titulo);

        // Lista de Itens do Pedido
        const listaItens = document.createElement("ul");
        let total = 0;

        mesa.pedidos.forEach(pedido => {
            const li = document.createElement("li");
            li.setAttribute("data-categoria", pedido.categoria || 'outros');
            li.innerHTML = `
                <span class="item-nome">${pedido.nome}</span>
                <span class="item-preco">R$ ${pedido.preco.toFixed(2)}</span>
            `;
            listaItens.appendChild(li);
            total += pedido.preco;
        });

        divMesa.appendChild(listaItens);

        // Total do Pedido
        const totalPedido = document.createElement("p");
        totalPedido.className = "total";
        totalPedido.innerHTML = `
            <span>Total:</span>
            <span class="valor">R$ ${total.toFixed(2)}</span>
        `;
        divMesa.appendChild(totalPedido);

        // Botões de Ação
        const divBotoes = document.createElement("div");
        divBotoes.className = "acoes-mesa";

        // Botão para Finalizar Pedido
        const botaoFinalizar = document.createElement("button");
        botaoFinalizar.className = "botao-finalizar";
        botaoFinalizar.innerHTML = '<i class="fas fa-check-circle"></i> Finalizar Pedido';
        botaoFinalizar.onclick = () => finalizarPedidoCaixa(mesaId);
        divBotoes.appendChild(botaoFinalizar);

        // Botão para Imprimir Conta
        const botaoImprimir = document.createElement("button");
        botaoImprimir.className = "botao-imprimir";
        botaoImprimir.innerHTML = '<i class="fas fa-print"></i> Imprimir Conta';
        botaoImprimir.onclick = () => imprimirConta(mesaId, mesa);
        divBotoes.appendChild(botaoImprimir);

        divMesa.appendChild(divBotoes);
        listaMesas.appendChild(divMesa);
    });
}

// Função para finalizar o pedido no caixa
function finalizarPedidoCaixa(mesaId) {
    const mesa = mesasData.mesas[mesaId];
    if (!mesa || !mesa.pedidos || mesa.pedidos.length === 0) {
        mostrarFeedback('Não há pedidos para finalizar nesta mesa!', 'erro');
        return;
    }

    // Calcula o total do pedido
    const total = mesa.pedidos.reduce((sum, pedido) => sum + pedido.preco, 0);

    // Cria e mostra o modal de confirmação
    const modalHTML = `
        <div id="modalFinalizarPagamento" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-cash-register"></i> Finalizar  Pagamento</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="info-pagamento">
                        <p><strong>Mesa:</strong> ${mesaId}</p>
                        <p><strong>Garçom:</strong> ${mesa.garcom || 'Não informado'}</p>
                        <p><strong>Total a pagar:</strong> <span class="valor-destaque">R$ ${total.toFixed(2)}</span></p>
                    </div>
                    <div class="forma-pagamento">
                        <label><strong>Forma de Pagamento:</strong></label>
                        <select id="formaPagamento" class="input-estilo">
                            <option value="dinheiro">Dinheiro</option>
                            <option value="cartao_credito">Cartão de Crédito</option>
                            <option value="cartao_debito">Cartão de Débito</option>
                            <option value="pix">PIX</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="btnConfirmarPagamento" class="botao-finalizar">
                        <i class="fas fa-check"></i> Confirmar Pagamento
                    </button>
                    <button id="btnCancelarPagamento" class="botao-cancelar">
                        <i class="fas fa-times"></i> Cancelar 
                    </button>
                </div>
            </div>
        </div>
    `;

    // Remove modal anterior se existir
    const modalAnterior = document.getElementById('modalFinalizarPagamento');
    if (modalAnterior) {
        modalAnterior.remove();
    }

    // Adiciona o novo modal ao DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('modalFinalizarPagamento');
    const btnFechar = modal.querySelector('.close');
    const btnConfirmar = document.getElementById('btnConfirmarPagamento');
    const btnCancelar = document.getElementById('btnCancelarPagamento');

    // Exibe o modal
    modal.style.display = 'block';

    // Função para fechar o modal
    const fecharModal = () => {
        modal.style.display = 'none';
        modal.remove();
    };

    // Eventos dos botões
    btnFechar.onclick = fecharModal;
    btnCancelar.onclick = fecharModal;

    // Evento de clique fora do modal
    window.onclick = (event) => {
        if (event.target === modal) {
            fecharModal();
        }
    };

    // Evento de confirmação do pagamento
    btnConfirmar.onclick = () => {
        const formaPagamento = document.getElementById('formaPagamento').value;

        // Adiciona o pedido ao histórico de vendas
        const vendas = JSON.parse(localStorage.getItem('historicoVendas')) || [];
        const venda = {
            mesa: mesaId,
            pedidos: mesa.pedidos,
            total: total,
            formaPagamento: formaPagamento,
            data: new Date().toISOString(),
            garcom: mesa.garcom || 'Não atribuído'
        };

        vendas.push(venda);
        localStorage.setItem('historicoVendas', JSON.stringify(vendas));

        // Limpa os dados da mesa
        mesa.pedidos = [];
        mesa.status = 'disponivel';
        delete mesasData.atribuicoes[mesaId];

        localStorage.setItem('mesasData', JSON.stringify(mesasData));

        // Fecha o modal e atualiza a interface
        fecharModal();
        carregarPedidosCaixa();
        carregarHistorico('hoje'); // Recarrega o histórico com o período atual
        mostrarFeedback('Pagamento finalizado com sucesso!', 'sucesso');
    };
}

// Função para imprimir a conta
function imprimirConta(mesaId, mesa) {
    const conteudo = `
        <div style="font-family: Arial; padding: 20px;">
            <h2 style="text-align: center;">Conta - ${mesaId}</h2>
            <hr>
            ${mesa.garcom ? `<p>Garçom: ${mesa.garcom}</p>` : ''}
            <p>Data: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}</p>
            <hr>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <th style="text-align: left;">Item</th>
                    <th style="text-align: right;">Valor</th>
                </tr>
                ${mesa.pedidos.map(pedido => `
                    <tr>
                        <td>${pedido.nome}</td>
                        <td style="text-align: right;">R$ ${pedido.preco.toFixed(2)}</td>
                    </tr>
                `).join('')}
                <tr style="font-weight: bold;">
                    <td>Total</td>
                    <td style="text-align: right;">R$ ${mesa.pedidos.reduce((sum, pedido) => sum + pedido.preco, 0).toFixed(2)}</td>
                </tr>
            </table>
            <hr>
            <p style="text-align: center;">Obrigado pela preferência!</p>
        </div>
    `;

    const janela = window.open('', '_blank');
    janela.document.write(conteudo);
    janela.document.close();
    janela.print();
}

// ==================== FUNÇÕES DO ESTOQUE ====================
if (window.location.pathname.includes("estoque.html")) {
    document.addEventListener('DOMContentLoaded', function () {
        // Array para armazenar os itens do estoque
        let estoque = JSON.parse(localStorage.getItem('estoqueRestaurante')) || [];
        let editando = false;
        let itemEditandoId = null;
        let itemParaRemover = null;

        // Elementos do DOM
        const form = document.getElementById('itemForm');
        const estoqueBody = document.getElementById('estoqueBody');
        const btnCancelar = document.getElementById('btnCancelar');
        const busca = document.getElementById('busca');
        const btnBaixoEstoque = document.getElementById('btnBaixoEstoque');

        // Elementos do modal
        const modal = document.getElementById('modalRemover');
        const btnClose = document.querySelector('.close');
        const btnConfirmarRemocao = document.getElementById('btnConfirmarRemocao');
        const btnCancelarRemocao = document.getElementById('btnCancelarRemocao');
        const quantidadeRemover = document.getElementById('quantidadeRemover');

        // Função para verificar se existem itens com baixo estoque
        function verificarBaixoEstoque() {
            return estoque.some(item =>
                (item.unidade === 'un' && item.quantidade < 5) ||
                (item.unidade !== 'un' && item.quantidade < 0.5)
            );
        }

        // Função para atualizar visibilidade do botão de baixo estoque
        function atualizarBotaoBaixoEstoque() {
            if (btnBaixoEstoque) {
                const temItensBaixoEstoque = verificarBaixoEstoque();
                btnBaixoEstoque.style.display = temItensBaixoEstoque ? 'block' : 'none';
            }
        }

        // Carregar estoque ao iniciar
        carregarEstoque();

        // Função para carregar o estoque na tabela
        function carregarEstoque(filtro = '', itens = estoque) {
            estoqueBody.innerHTML = '';

            let itensFiltrados = itens;

            if (filtro) {
                const termo = filtro.toLowerCase();
                itensFiltrados = itens.filter(item =>
                    item.nome.toLowerCase().includes(termo) ||
                    (item.fornecedor && item.fornecedor.toLowerCase().includes(termo))
                );
            }

            itensFiltrados.forEach(item => {
                const tr = document.createElement('tr');

                // Adiciona classe para itens com baixo estoque
                if ((item.unidade === 'un' && item.quantidade < 5) ||
                    (item.unidade !== 'un' && item.quantidade < 0.5)) {
                    tr.classList.add('baixo-estoque');
                }

                const valorTotal = item.quantidade * item.valor;

                tr.innerHTML = `
                    <td>${item.nome}</td>
                    <td>${item.quantidade} ${item.unidade}</td>
                    <td>R$ ${item.valor.toFixed(2)}</td>
                    <td>R$ ${valorTotal.toFixed(2)}</td>
                    <td class="acoes">
                        <button class="btn-editar" data-id="${item.id}">Editar</button>
                        <button class="btn-remover" data-id="${item.id}">Remover Qtd</button>
                        <button class="btn-excluir" data-id="${item.id}">Excluir</button>
                    </td>
                `;

                estoqueBody.appendChild(tr);
            });

            // Atualiza a visibilidade do botão de baixo estoque
            atualizarBotaoBaixoEstoque();

            // Adicionar eventos aos botões
            document.querySelectorAll('.btn-editar').forEach(btn => {
                btn.addEventListener('click', function () {
                    editarItem(parseInt(this.getAttribute('data-id')));
                });
            });

            document.querySelectorAll('.btn-excluir').forEach(btn => {
                btn.addEventListener('click', function () {
                    excluirItem(parseInt(this.getAttribute('data-id')));
                });
            });

            document.querySelectorAll('.btn-remover').forEach(btn => {
                btn.addEventListener('click', function () {
                    abrirModalRemover(parseInt(this.getAttribute('data-id')));
                });
            });
        }

        // Evento de submit do formulário
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const nome = document.getElementById('nome').value;
            const quantidade = parseFloat(document.getElementById('quantidade').value);
            const unidade = document.getElementById('unidade').value;
            const valor = parseFloat(document.getElementById('valor').value);
            const validade = document.getElementById('validade').value;
            const fornecedor = document.getElementById('fornecedor').value;

            if (editando) {
                // Editar item existente
                const index = estoque.findIndex(item => item.id === itemEditandoId);
                estoque[index] = {
                    id: itemEditandoId,
                    nome,
                    quantidade,
                    unidade,
                    valor,
                    validade,
                    fornecedor
                };
            } else {
                // Adicionar novo item
                const novoItem = {
                    id: Date.now(),
                    nome,
                    quantidade,
                    unidade,
                    valor,
                    validade,
                    fornecedor
                };
                estoque.push(novoItem);
            }

            // Salvar no localStorage
            localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));

            // Recarregar a tabela
            carregarEstoque();

            // Limpar formulário
            limparFormulario();
        });

        // Evento do botão cancelar
        btnCancelar.addEventListener('click', limparFormulario);

        // Evento de busca
        busca.addEventListener('input', function () {
            carregarEstoque(this.value);
        });

        // Evento do botão baixo estoque
        btnBaixoEstoque.addEventListener('click', function () {
            const itensBaixoEstoque = estoque.filter(item => {
                // Considera baixo estoque se tiver menos de 5 unidades (ou 0.5kg/l para itens não unitários)
                if (item.unidade === 'un') {
                    return item.quantidade < 5;
                } else {
                    return item.quantidade < 0.5;
                }
            });
            carregarEstoque('', itensBaixoEstoque);
        });

        // Eventos do modal
        btnClose.addEventListener('click', function () {
            modal.style.display = 'none';
        });

        btnCancelarRemocao.addEventListener('click', function () {
            modal.style.display = 'none';
        });

        btnConfirmarRemocao.addEventListener('click', function () {
            if (itemParaRemover && quantidadeRemover.value && parseFloat(quantidadeRemover.value) > 0) {
                const qtd = parseFloat(quantidadeRemover.value);
                const item = estoque.find(item => item.id === itemParaRemover);

                if (item) {
                    if (qtd <= item.quantidade) {
                        item.quantidade -= qtd;
                        localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
                        carregarEstoque();

                        // Se a quantidade chegar a zero, perguntar se quer excluir
                        if (item.quantidade <= 0) {
                            if (confirm('Quantidade zerada. Deseja excluir o item do estoque?')) {
                                estoque = estoque.filter(i => i.id !== item.id);
                                localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
                                carregarEstoque();
                            }
                        }
                    } else {
                        alert('Quantidade insuficiente em estoque!');
                    }
                }

                modal.style.display = 'none';
                quantidadeRemover.value = '';
                itemParaRemover = null;
            } else {
                alert('Por favor, insira uma quantidade válida!');
            }
        });

        // Função para limpar o formulário
        function limparFormulario() {
            form.reset();
            document.getElementById('itemId').value = '';
            editando = false;
            itemEditandoId = null;
        }

        // Função para abrir o modal de remoção
        function abrirModalRemover(id) {
            itemParaRemover = id;
            const item = estoque.find(item => item.id === id);
            if (item) {
                quantidadeRemover.setAttribute('max', item.quantidade);
                quantidadeRemover.setAttribute('step', item.unidade === 'un' ? '1' : '0.01');
                modal.style.display = 'block';
            }
        }

        // Função para editar item
        function editarItem(id) {
            const item = estoque.find(item => item.id === id);
            if (item) {
                editando = true;
                itemEditandoId = id;

                document.getElementById('itemId').value = item.id;
                document.getElementById('nome').value = item.nome;
                document.getElementById('quantidade').value = item.quantidade;
                document.getElementById('unidade').value = item.unidade;
                document.getElementById('valor').value = item.valor;
                document.getElementById('validade').value = item.validade;
                document.getElementById('fornecedor').value = item.fornecedor;

                // Rolagem suave para o formulário
                document.querySelector('.formulario').scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Função para excluir item
        function excluirItem(id) {
            if (confirm('Tem certeza que deseja excluir este item?')) {
                estoque = estoque.filter(item => item.id !== id);
                localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
                carregarEstoque();
            }
        }

        // Fechar modal ao clicar fora dele
        window.addEventListener('click', function (event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}
// ==================== FUNÇÕES DO RELATÓRIO ====================
if (window.location.pathname.includes("relatorio.html")) {
    document.addEventListener('DOMContentLoaded', function () {
        carregarDados();
        // Atualiza o resumo quando houver mudanças
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('change', calcularResumo);
        });
    });
}

// Função para carregar os dados iniciais
function carregarDados() {
    const relatorioData = JSON.parse(localStorage.getItem('relatorioData')) || {
        vendas: [],
        funcionarios: [],
        despesas: []
    };
    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));

    carregarVendas();
    carregarFuncionarios();
    carregarDespesas();
    calcularResumo();
}

// Função para adicionar funcionário
function adicionarFuncionario() {
    const nome = document.getElementById('nome-funcionario').value;
    const salario = parseFloat(document.getElementById('salario-funcionario').value);

    if (!nome || !salario) {
        mostrarFeedback('Preencha todos os campos!', 'erro');
        return;
    }

    const relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    if (!relatorioData.funcionarios) relatorioData.funcionarios = [];

    relatorioData.funcionarios.push({
        id: Date.now(),
        nome,
        salario
    });

    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));
    carregarFuncionarios();
    calcularResumo();

    // Limpa os campos
    document.getElementById('nome-funcionario').value = '';
    document.getElementById('salario-funcionario').value = '';

    mostrarFeedback('Funcionário adicionado com sucesso!');
}

// Função para carregar lista de funcionários
function carregarFuncionarios() {
    const lista = document.getElementById('lista-funcionarios');
    if (!lista) return;

    const relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    lista.innerHTML = '';

    if (!relatorioData.funcionarios || relatorioData.funcionarios.length === 0) {
        lista.innerHTML = '<li class="item-vazio">Nenhum funcionário cadastrado</li>';
        return;
    }

    relatorioData.funcionarios.forEach(funcionario => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="item-info">
                <span class="item-nome">${funcionario.nome}</span>
                <span class="item-valor">R$ ${funcionario.salario.toFixed(2)}</span>
            </div>
            <button onclick="removerFuncionario(${funcionario.id})" class="btn-remover">
                <i class="fas fa-trash"></i>
                </button>
            `;
        lista.appendChild(li);
    });
}

// Função para remover funcionário
function removerFuncionario(id) {
    if (!confirm('Tem certeza que deseja remover este funcionário?')) return;

    const relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    relatorioData.funcionarios = relatorioData.funcionarios.filter(f => f.id !== id);
    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));

    carregarFuncionarios();
    calcularResumo();
    mostrarFeedback('Funcionário removido com sucesso!');
}

// Função para adicionar despesa
function adicionarDespesa() {
    const descricao = document.getElementById('descricao-despesa').value;
    const valor = parseFloat(document.getElementById('valor-despesa').value);

    if (!descricao || !valor) {
        mostrarFeedback('Preencha todos os campos!', 'erro');
        return;
    }

    const relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    if (!relatorioData.despesas) relatorioData.despesas = [];

    relatorioData.despesas.push({
        id: Date.now(),
        descricao,
        valor,
        data: new Date().toLocaleDateString()
    });

    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));
    carregarDespesas();
    calcularResumo();

    // Limpa os campos
    document.getElementById('descricao-despesa').value = '';
    document.getElementById('valor-despesa').value = '';

    mostrarFeedback('Despesa adicionada com sucesso!');
}

// Função para carregar despesas
function carregarDespesas() {
    const lista = document.getElementById('lista-despesas');
    if (!lista) return;

    const relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    lista.innerHTML = '';

    if (!relatorioData.despesas || relatorioData.despesas.length === 0) {
        lista.innerHTML = '<li class="item-vazio">Nenhuma despesa registrada</li>';
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
            <button onclick="removerDespesa(${despesa.id})" class="btn-remover">
                <i class="fas fa-trash"></i>
                </button>
            `;
        lista.appendChild(li);
    });
}

// Função para remover despesa
function removerDespesa(id) {
    if (!confirm('Tem certeza que deseja remover esta despesa?')) return;

    const relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    relatorioData.despesas = relatorioData.despesas.filter(d => d.id !== id);
    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));

    carregarDespesas();
    calcularResumo();
    mostrarFeedback('Despesa removida com sucesso!');
}

// Função para carregar vendas
function carregarVendas() {
    const totalVendasMes = document.getElementById('total-vendas-mes');
    if (!totalVendasMes) return;

    const relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    if (!relatorioData.vendas) relatorioData.vendas = [];

    // Calcula o total de vendas do mês atual
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const vendasMes = relatorioData.vendas.filter(venda => {
        const dataVenda = new Date(venda.data);
        return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
    });

    const totalMes = vendasMes.reduce((total, venda) => total + venda.valor, 0);
    totalVendasMes.textContent = `R$ ${totalMes.toFixed(2)}`;
}

// Função para calcular o resumo financeiro--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function calcularResumo() {
    const relatorioData = JSON.parse(localStorage.getItem('relatorioData'));

    // Calcula total de vendas do mês
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const vendasMes = relatorioData.vendas ? relatorioData.vendas.filter(venda => {
        const dataVenda = new Date(venda.data);
        return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
    }) : [];

    const totalVendas = vendasMes.reduce((total, venda) => total + venda.valor, 0);

    // Calcula total de despesas
    const totalDespesas = relatorioData.despesas ?
        relatorioData.despesas.reduce((total, despesa) => total + despesa.valor, 0) : 0;

    // Calcula total da folha de pagamento
    const totalFolha = relatorioData.funcionarios ?
        relatorioData.funcionarios.reduce((total, func) => total + func.salario, 0) : 0;

    // Calcula lucro
    const lucroTotal = totalVendas - totalDespesas - totalFolha;

    // Atualiza os elementos na interface
    document.getElementById('resumo-vendas').textContent = `R$ ${totalVendas.toFixed(2)}`;
    document.getElementById('resumo-despesas').textContent = `R$ ${totalDespesas.toFixed(2)}`;
    document.getElementById('resumo-funcionarios').textContent = `R$ ${totalFolha.toFixed(2)}`;
    document.getElementById('lucro-total').textContent = `R$ ${lucroTotal.toFixed(2)}`;

    // Atualiza as classes de cor baseado no lucro
    const lucroElement = document.getElementById('lucro-total');
    lucroElement.className = lucroTotal >= 0 ? 'valor-positivo' : 'valor-negativo';
}

// ==================== FUNÇÕES DE CONFIGURAÇÕES ====================
if (window.location.pathname.includes("configuracoes.html")) {
    // Configurações do sistema
    garantirUsuarioAdmin(); // Garante que o admin existe nas configurações
    let configs = JSON.parse(localStorage.getItem('configSistema')) || {
        nomeRestaurante: "Meu Restaurante",
        horarioFuncionamento: "08:00 - 22:00",
        taxaServico: 10,
        modoManutencao: false,
        notificacoes: true,
        intervaloBackup: 7,
        usuarios: [
            { username: "admin", password: "admin123", tipo: "admin" }
        ]
    };

    // Inicialização
    document.addEventListener('DOMContentLoaded', function () {
        carregarConfiguracoes();
        carregarUsuarios();

        // Eventos do formulário de configurações gerais
        document.getElementById('formConfigGerais').addEventListener('submit', salvarConfigGerais);

        // Evento para adicionar usuário
        document.getElementById('btnAdicionarUsuario').addEventListener('click', adicionarUsuario);

        // Eventos de backup
        document.getElementById('btnGerarBackup').addEventListener('click', gerarBackup);
        document.getElementById('btnRestaurarBackup').addEventListener('click', restaurarBackup);

        // Evento para resetar sistema
        document.getElementById('btnResetarSistema').addEventListener('click', confirmarReset);
    });

    // Carrega as configurações na tela
    function carregarConfiguracoes() {
        document.getElementById('nomeRestaurante').value = configs.nomeRestaurante;
        document.getElementById('horarioFuncionamento').value = configs.horarioFuncionamento;
        document.getElementById('taxaServico').value = configs.taxaServico;
        document.getElementById('modoManutencao').checked = configs.modoManutencao;
        document.getElementById('notificacoes').checked = configs.notificacoes;
        document.getElementById('intervaloBackup').value = configs.intervaloBackup;

        // Atualiza data do último backup se existir
        if (localStorage.getItem('ultimoBackup')) {
            document.getElementById('dataUltimoBackup').textContent =
                new Date(parseInt(localStorage.getItem('ultimoBackup'))).toLocaleString();
        }
    }

    // Salva as configurações gerais
    function salvarConfigGerais(e) {
        e.preventDefault();

        configs.nomeRestaurante = document.getElementById('nomeRestaurante').value;
        configs.horarioFuncionamento = document.getElementById('horarioFuncionamento').value;
        configs.taxaServico = parseFloat(document.getElementById('taxaServico').value);
        configs.modoManutencao = document.getElementById('modoManutencao').checked;
        configs.notificacoes = document.getElementById('notificacoes').checked;
        configs.intervaloBackup = parseInt(document.getElementById('intervaloBackup').value);

        salvarConfigs();
        mostrarFeedback('Configurações salvas com sucesso!');
    }

    // ==================== GERENCIAMENTO DE USUÁRIOS ====================
    function carregarUsuarios() {
        const lista = document.getElementById('listaUsuarios');
        lista.innerHTML = '';

        configs.usuarios.forEach(usuario => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <span class="usuario-nome">${usuario.username}</span>
                    <span class="usuario-tipo">${formatarTipoUsuario(usuario.tipo)}</span>
                </div>
                <button class="btn-excluir" data-user="${usuario.username}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            lista.appendChild(li);
        });

        // Adiciona eventos aos botões de exclusão
        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.addEventListener('click', function () {
                const username = this.getAttribute('data-user');
                confirmarExclusaoUsuario(username);
            });
        });
    }

    function formatarTipoUsuario(tipo) {
        const tipos = {
            'garcom': 'Garçom',
            'caixa': 'Caixa',
            'gerente': 'Gerente',
            'admin': 'Administrador'
        };
        return tipos[tipo] || tipo;
    }

    function adicionarUsuario() {
        const username = document.getElementById('novoUsuario').value;
        const password = document.getElementById('novaSenha').value;
        const tipo = document.getElementById('tipoUsuario').value;

        if (username && password) {
            // Verifica se usuário já existe
            if (configs.usuarios.some(u => u.username === username)) {
                mostrarFeedback('Usuário já existe!', 'erro');
                return;
            }

            configs.usuarios.push({ username, password, tipo });
            salvarConfigs();
            carregarUsuarios();

            // Limpar campos
            document.getElementById('novoUsuario').value = '';
            document.getElementById('novaSenha').value = '';

            mostrarFeedback('Usuário adicionado com sucesso!');
        } else {
            mostrarFeedback('Preencha todos os campos!', 'erro');
        }
    }

    function removerUsuario(username) {
        garantirUsuarioAdmin(); // Garante que o admin existe antes de remover usuários
        // Não permite remover o último admin
        const admins = configs.usuarios.filter(u => u.tipo === 'admin');
        if (admins.length === 1 && admins[0].username === username) {
            mostrarFeedback('Não é possível remover o último administrador!', 'erro');
            return;
        }

        configs.usuarios = configs.usuarios.filter(u => u.username !== username);
        salvarConfigs();
        carregarUsuarios();
        mostrarFeedback('Usuário removido!');
    }

    // ==================== BACKUP E RESTAURAÇÃO ====================
    function gerarBackup() {
        const backupData = {
            configs: configs,
            pedidos: JSON.parse(localStorage.getItem('pedidos')) || {},
            estoque: JSON.parse(localStorage.getItem('estoqueRestaurante')) || []
        };

        const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_restaurante_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Salva data do backup
        localStorage.setItem('ultimoBackup', Date.now());
        document.getElementById('dataUltimoBackup').textContent = new Date().toLocaleString();

        mostrarFeedback('Backup gerado com sucesso!');
    }

    function restaurarBackup() {
        const fileInput = document.getElementById('arquivoBackup');
        const file = fileInput.files[0];

        if (!file) {
            mostrarFeedback('Selecione um arquivo de backup!', 'erro');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const backupData = JSON.parse(e.target.result);

                // Mostra modal de confirmação
                abrirModal(
                    'Confirmar Restauração',
                    'Tem certeza que deseja restaurar este backup? Todos os dados atuais serão substituídos.',
                    function () {
                        // Restaura os dados
                        if (backupData.configs) {
                            configs = backupData.configs;
                            salvarConfigs();
                        }

                        if (backupData.pedidos) {
                            localStorage.setItem('pedidos', JSON.stringify(backupData.pedidos));
                        }

                        if (backupData.estoque) {
                            localStorage.setItem('estoqueRestaurante', JSON.stringify(backupData.estoque));
                        }

                        localStorage.setItem('ultimoBackup', Date.now());

                        mostrarFeedback('Backup restaurado com sucesso!');
                        setTimeout(() => location.reload(), 1500);
                    }
                );
            } catch (e) {
                mostrarFeedback('Arquivo de backup inválido!', 'erro');
            }
        };
        reader.readAsText(file);
    }

    // ==================== FUNÇÕES UTILITÁRIAS ====================
    function salvarConfigs() {
        localStorage.setItem('configSistema', JSON.stringify(configs));
    }

    function confirmarExclusaoUsuario(username) {
        abrirModal(
            'Confirmar Exclusão',
            `Tem certeza que deseja remover o usuário "${username}"?`,
            () => removerUsuario(username)
        );
    }

    function confirmarReset() {
        abrirModal(
            'Restaurar Configurações Padrão',
            'Tem certeza que deseja restaurar todas as configurações para os valores padrão? Esta ação não pode ser desfeita.',
            resetarSistema
        );
    }

    function resetarSistema() {
        garantirUsuarioAdmin(); // Garante que o admin existe ao resetar o sistema
        // Mantém apenas o usuário admin
        configs = {
            nomeRestaurante: "Meu Restaurante",
            horarioFuncionamento: "08:00 - 22:00",
            taxaServico: 10,
            modoManutencao: false,
            notificacoes: true,
            intervaloBackup: 7,
            usuarios: [
                { username: "admin", password: "admin123", tipo: "admin" }
            ]
        };

        salvarConfigs();
        mostrarFeedback('Configurações resetadas para os padrões!');
        setTimeout(() => location.reload(), 1500);
    }

    function abrirModal(titulo, mensagem, callback) {
        document.getElementById('modalTitulo').textContent = titulo;
        document.getElementById('modalMensagem').textContent = mensagem;
        document.getElementById('modalConfirmacao').style.display = 'block';

        document.getElementById('modalConfirmar').onclick = function () {
            document.getElementById('modalConfirmacao').style.display = 'none';
            callback();
        };

        document.getElementById('modalCancelar').onclick = function () {
            document.getElementById('modalConfirmacao').style.display = 'none';
        };

        document.querySelector('.close-modal').onclick = function () {
            document.getElementById('modalConfirmacao').style.display = 'none';
        };
    }
}

// Dados do cardápio
const cardapio = {
    comidas: [
        { id: 1, nome: 'X-Burger', preco: 18.90, categoria: 'comida' },
        { id: 2, nome: 'X-Salada', preco: 20.90, categoria: 'comida' },
        { id: 3, nome: 'Batata Frita', preco: 12.90, categoria: 'comida' },
        { id: 4, nome: 'Porção de Frango', preco: 25.90, categoria: 'comida' }
    ],
    bebidas: [
        { id: 5, nome: 'Refrigerante', preco: 6.90, categoria: 'bebida' },
        { id: 6, nome: 'Suco Natural', preco: 8.90, categoria: 'bebida' },
        { id: 7, nome: 'Água', preco: 4.90, categoria: 'bebida' },
        { id: 8, nome: 'Cerveja', preco: 9.90, categoria: 'bebida' }
    ],
    sobremesas: [
        { id: 9, nome: 'Pudim', preco: 8.90, categoria: 'sobremesa' },
        { id: 10, nome: 'Sorvete', preco: 10.90, categoria: 'sobremesa' },
        { id: 11, nome: 'Mousse', preco: 7.90, categoria: 'sobremesa' }
    ]
};

// Função para carregar o cardápio na interface
function carregarCardapio(categoria = 'todos') {
    const gradeItens = document.getElementById('gradeItens');
    if (!gradeItens) return;

    gradeItens.innerHTML = '';

    // Carrega itens do estoque
    const estoque = JSON.parse(localStorage.getItem('estoqueRestaurante')) || [];

    // Mapeia categorias do estoque para categorias do cardápio
    const categoriaMap = {
        'comida': ['kg', 'g', 'un'],
        'bebida': ['l', 'ml'],
        'sobremesa': ['un']
    };

    // Array para armazenar todos os itens
    let todosItens = [];

    // Adiciona itens fixos do cardápio
    if (categoria === 'todos' || categoria === 'comida') {
        todosItens.push(...cardapio.comidas);
    }
    if (categoria === 'todos' || categoria === 'bebida') {
        todosItens.push(...cardapio.bebidas);
    }
    if (categoria === 'todos' || categoria === 'sobremesa') {
        todosItens.push(...cardapio.sobremesas);
    }

    // Filtra os itens do estoque baseado na categoria
    let itensFiltrados = estoque;
    if (categoria !== 'todos') {
        itensFiltrados = estoque.filter(item => {
            const unidadesPossiveis = categoriaMap[categoria] || [];
            return unidadesPossiveis.includes(item.unidade);
        });
    }

    // Adiciona itens do estoque
    itensFiltrados.forEach(item => {
        // Determina a categoria baseada na unidade
        let itemCategoria = 'outros';
        for (const [cat, unidades] of Object.entries(categoriaMap)) {
            if (unidades.includes(item.unidade)) {
                itemCategoria = cat;
                break;
            }
        }

        // Só mostra itens que têm quantidade em estoque
        if (item.quantidade > 0) {
            todosItens.push({
                nome: item.nome,
                preco: item.valor,
                categoria: itemCategoria,
                fromEstoque: true // Marca que veio do estoque
            });
        }
    });

    // Adiciona todos os itens à grade
    todosItens.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.setAttribute('data-categoria', item.categoria);
        itemDiv.innerHTML = `
            <h3>${item.nome}</h3>
            <p>R$ ${item.preco.toFixed(2)}</p>
            <button onclick="adicionarAoPedido('${item.nome}', ${item.preco}, '${item.categoria}', ${item.fromEstoque || false})">
                <i class="fas fa-plus"></i> Adicionar
            </button>
        `;
        gradeItens.appendChild(itemDiv);
    });

    // Se não houver itens, mostra mensagem
    if (todosItens.length === 0) {
        const mensagem = document.createElement('div');
        mensagem.className = 'mensagem-sem-itens';
        mensagem.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>Nenhum item encontrado${categoria !== 'todos' ? ' nesta categoria' : ''}.</p>
        `;
        gradeItens.appendChild(mensagem);
    }
}

// Função para adicionar item ao pedido
function adicionarAoPedido(nome, preco, categoria, fromEstoque = false) {
    if (!mesaSelecionada) {
        mostrarFeedback('Selecione uma mesa primeiro!', 'erro');
        return;
    }

    // Inicializa a mesa se não existir
    if (!mesasData.mesas[mesaSelecionada]) {
        mesasData.mesas[mesaSelecionada] = {
            status: 'disponivel',
            pedidos: []
        };
    }

    // Adiciona o pedido
    const pedido = {
        nome: nome,
        preco: preco,
        categoria: categoria,
        timestamp: new Date().getTime()
    };

    mesasData.mesas[mesaSelecionada].pedidos.push(pedido);

    // Atualiza o status da mesa para ocupada quando adiciona o primeiro item
    mesasData.mesas[mesaSelecionada].status = 'ocupada';

    localStorage.setItem('mesasData', JSON.stringify(mesasData));

    // Se o item veio do estoque, atualiza a quantidade
    if (fromEstoque) {
        const estoque = JSON.parse(localStorage.getItem('estoqueRestaurante')) || [];
        const itemIndex = estoque.findIndex(item => item.nome === nome);
        if (itemIndex !== -1) {
            if (estoque[itemIndex].unidade === 'un') {
                estoque[itemIndex].quantidade -= 1;
            } else {
                estoque[itemIndex].quantidade -= 0.1; // Remove 100g ou 100ml
            }
            localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
        }
    }

    atualizarListaPedidos();
    inicializarMesas(); // Atualiza a visualização das mesas
    mostrarFeedback('Item adicionado ao pedido!', 'sucesso');
}

// Função para remover item do pedido
function removerItemPedido(index) {
    if (mesaSelecionada && mesasData.mesas[mesaSelecionada]?.pedidos) {
        const pedidoRemovido = mesasData.mesas[mesaSelecionada].pedidos[index];

        // Se o item veio do estoque, devolve ao estoque
        if (pedidoRemovido.fromEstoque) {
            const estoque = JSON.parse(localStorage.getItem('estoqueRestaurante')) || [];
            const item = estoque.find(i => i.nome === pedidoRemovido.nome);
            if (item) {
                item.quantidade += 1;
                localStorage.setItem('estoqueRestaurante', JSON.stringify(estoque));
            }
        }

        mesasData.mesas[mesaSelecionada].pedidos.splice(index, 1);

        // Se não houver mais pedidos, muda o status para disponível
        if (mesasData.mesas[mesaSelecionada].pedidos.length === 0) {
            mesasData.mesas[mesaSelecionada].status = 'disponivel';
        }

        localStorage.setItem('mesasData', JSON.stringify(mesasData));
        atualizarListaPedidos();
        inicializarMesas(); // Atualiza a visualização das mesas
        if (pedidoRemovido.fromEstoque) {
            carregarCardapio();
        }
        mostrarFeedback('Item removido do pedido!');
    }
}

// Função para carregar histórico de pedidos
function carregarHistorico(periodo = 'hoje') {
    const listaHistorico = document.getElementById('listaHistorico');
    const totalPeriodo = document.getElementById('totalPeriodo');
    const qtdPedidos = document.getElementById('qtdPedidos');

    if (!listaHistorico || !totalPeriodo || !qtdPedidos) return;

    const vendas = JSON.parse(localStorage.getItem('historicoVendas')) || [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Filtra vendas baseado no período selecionado
    const vendasFiltradas = vendas.filter(venda => {
        const dataVenda = new Date(venda.data);
        dataVenda.setHours(0, 0, 0, 0);

        switch (periodo) {
            case 'hoje':
                return dataVenda.getTime() === hoje.getTime();
            case 'ontem':
                const ontem = new Date(hoje);
                ontem.setDate(hoje.getDate() - 1);
                return dataVenda.getTime() === ontem.getTime();
            case 'semana':
                const umaSemanaAtras = new Date(hoje);
                umaSemanaAtras.setDate(hoje.getDate() - 7);
                return dataVenda >= umaSemanaAtras;
            case 'semana':
                const mes = new Date(hoje);
                mes.setDate(hoje.getDate() - 30);
                return dataVenda >= mes;
            default:
                return true;
        }
    });

    // Ordena vendas por data (mais recentes primeiro)
    vendasFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));

    // Atualiza a lista de histórico
    listaHistorico.innerHTML = '';

    if (vendasFiltradas.length === 0) {
        listaHistorico.innerHTML = `
            <div class="item-vazio">
                <i class="fas fa-info-circle"></i>
                <p>Nenhum pedido encontrado neste período</p>
            </div>
        `;
    } else {
        vendasFiltradas.forEach(venda => {
            // Formata a forma de pagamento para exibição
            const formaPagamentoFormatada = formatarFormaPagamento(venda.formaPagamento);

            // Formata a data para o padrão brasileiro
            const dataVenda = new Date(venda.data);
            const dataFormatada = dataVenda.toLocaleDateString('pt-BR');
            const horaFormatada = dataVenda.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const itemHistorico = document.createElement('div');
            itemHistorico.className = 'item-historico';
            itemHistorico.innerHTML = `
                <div class="info-pedido">
                    <div class="mesa">
                        <i class="fas fa-table"></i> ${venda.mesa}
                    </div>
                    <div class="detalhes">
                        <span><i class="fas fa-user"></i> ${venda.garcom || 'Não informado'}</span>
                        <span><i class="fas fa-clock"></i> ${horaFormatada}</span>
                        <span><i class="fas fa-calendar"></i> ${dataFormatada}</span>
                        <span class="forma-pagamento">
                            <i class="fas ${getIconeFormaPagamento(venda.formaPagamento)}"></i>
                            ${formaPagamentoFormatada}
                        </span>
                    </div>
                </div>
                <div class="valor">R$ ${venda.total.toFixed(2)}</div>
            `;
            listaHistorico.appendChild(itemHistorico);
        });
    }

    // Atualiza o resumo
    const total = vendasFiltradas.reduce((sum, venda) => sum + venda.total, 0);
    totalPeriodo.textContent = `R$ ${total.toFixed(2)}`;
    qtdPedidos.textContent = vendasFiltradas.length;
}

// Função auxiliar para formatar a forma de pagamento
function formatarFormaPagamento(formaPagamento) {
    const formatacao = {
        'dinheiro': 'Dinheiro',
        'cartao_credito': 'Cartão de Crédito',
        'cartao_debito': 'Cartão de Débito',
        'pix': 'PIX'
    };
    return formatacao[formaPagamento] || formaPagamento;
}

// Função auxiliar para obter o ícone da forma de pagamento
function getIconeFormaPagamento(formaPagamento) {
    const icones = {
        'dinheiro': 'fa-money-bill-wave',
        'cartao_credito': 'fa-credit-card',
        'cartao_debito': 'fa-credit-card',
        'pix': 'fa-qrcode'
    };
    return icones[formaPagamento] || 'fa-money-bill';
}

// Função para adicionar vendas ao relatório
function adicionarVendas() {
    const vendasDia = parseFloat(document.getElementById('vendas-dia').value);

    if (!vendasDia || vendasDia <= 0) {
        mostrarFeedback('Digite um valor válido para as vendas!', 'erro');
        return;
    }

    const relatorioData = JSON.parse(localStorage.getItem('relatorioData'));
    if (!relatorioData.vendas) relatorioData.vendas = [];

    relatorioData.vendas.push({
        valor: vendasDia,
        data: new Date().toISOString()
    });

    localStorage.setItem('relatorioData', JSON.stringify(relatorioData));
    carregarVendas();
    calcularResumo();

    // Limpa o campo
    document.getElementById('vendas-dia').value = '';

    mostrarFeedback('Vendas adicionadas com sucesso!');
}