const numeroWhatsApp = "5524998700947";
const carrinho = JSON.parse(localStorage.getItem("checkin-carrinho")) || [];

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function salvarCarrinho() {
    localStorage.setItem("checkin-carrinho", JSON.stringify(carrinho));
}

function adicionarAoCarrinho(nome, preco) {
    const existente = carrinho.find(item => item.nome === nome);
    if (existente) existente.quantidade += 1;
    else carrinho.push({ nome, preco: Number(preco), quantidade: 1 });
    salvarCarrinho();
    atualizarCarrinho();
    mostrarFeedback(`${nome} adicionado ao pedido!`);
}

function alterarQuantidade(index, mudanca) {
    if (!carrinho[index]) return;
    carrinho[index].quantidade += mudanca;
    if (carrinho[index].quantidade <= 0) carrinho.splice(index, 1);
    salvarCarrinho();
    atualizarCarrinho();
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    salvarCarrinho();
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const itensArea = document.getElementById("cart-items");
    if (!itensArea) return;

    const quantidadeTotal = carrinho.reduce((s, item) => s + item.quantidade, 0);
    const total = carrinho.reduce((s, item) => s + item.preco * item.quantidade, 0);

    document.getElementById("cart-count").textContent = quantidadeTotal;
    document.getElementById("cart-count-float").textContent = quantidadeTotal;
    document.getElementById("cart-total").textContent = formatarPreco(total);

    const vazio = document.getElementById("cart-empty");
    const checkout = document.getElementById("cart-checkout");

    if (!carrinho.length) {
        itensArea.innerHTML = "";
        vazio.style.display = "flex";
        checkout.style.display = "none";
        return;
    }

    vazio.style.display = "none";
    checkout.style.display = "block";
    itensArea.innerHTML = carrinho.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <strong>${item.nome}</strong>
                <span>${formatarPreco(item.preco)} cada</span>
            </div>
            <div class="cart-item-actions">
                <button type="button" onclick="alterarQuantidade(${index}, -1)">−</button>
                <span>${item.quantidade}</span>
                <button type="button" onclick="alterarQuantidade(${index}, 1)">+</button>
            </div>
            <div class="cart-item-subtotal">
                <strong>${formatarPreco(item.preco * item.quantidade)}</strong>
                <button type="button" class="remove-item" onclick="removerDoCarrinho(${index})">Remover</button>
            </div>
        </div>
    `).join("");
}

function abrirCarrinho() {
    document.getElementById("cart-drawer").classList.add("open");
    document.getElementById("cart-overlay").classList.add("show");
    document.getElementById("cart-drawer").setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");
}

function fecharCarrinho() {
    document.getElementById("cart-drawer").classList.remove("open");
    document.getElementById("cart-overlay").classList.remove("show");
    document.getElementById("cart-drawer").setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
}

function alternarEndereco() {
    const tipo = document.querySelector('input[name="entrega"]:checked')?.value;
    document.getElementById("delivery-fields").classList.toggle("hidden", tipo === "Retirada");
}

function alternarTroco() {
    const pagamento = document.getElementById("pagamento").value;
    document.getElementById("troco-field").classList.toggle("hidden", pagamento !== "Dinheiro");
}

function mostrarFeedback(texto) {
    let feedback = document.getElementById("cart-feedback");
    if (!feedback) {
        feedback = document.createElement("div");
        feedback.id = "cart-feedback";
        feedback.className = "cart-feedback";
        document.body.appendChild(feedback);
    }
    feedback.textContent = `✓ ${texto}`;
    feedback.classList.add("show");
    clearTimeout(window.feedbackTimer);
    window.feedbackTimer = setTimeout(() => feedback.classList.remove("show"), 1800);
}

function finalizarPedido() {
    if (!carrinho.length) return mostrarFeedback("Adicione pelo menos um item.");

    const nome = document.getElementById("cliente-nome").value.trim();
    const tipoEntrega = document.querySelector('input[name="entrega"]:checked').value;
    const endereco = document.getElementById("cliente-endereco").value.trim();
    const bairro = document.getElementById("cliente-bairro").value.trim();
    const referencia = document.getElementById("cliente-referencia").value.trim();
    const pagamento = document.getElementById("pagamento").value;
    const troco = document.getElementById("troco").value;
    const observacoes = document.getElementById("observacoes").value.trim();

    if (!nome) {
        alert("Por favor, informe seu nome antes de finalizar o pedido.");
        return document.getElementById("cliente-nome").focus();
    }

    if (tipoEntrega === "Delivery" && (!endereco || !bairro)) {
        alert("Para delivery, informe o endereço e o bairro.");
        return (!endereco ? document.getElementById("cliente-endereco") : document.getElementById("cliente-bairro")).focus();
    }

    const total = carrinho.reduce((s, item) => s + item.preco * item.quantidade, 0);
    const linhas = carrinho.map(item => `• ${item.quantidade}x ${item.nome} — ${formatarPreco(item.preco * item.quantidade)}`).join("\n");

    let mensagem = `🍔 *NOVO PEDIDO - CHECK-IN BURGER*\n\n`;
    mensagem += `👤 *Cliente:* ${nome}\n\n`;
    mensagem += `🛒 *PEDIDO*\n${linhas}\n\n`;
    mensagem += `💰 *TOTAL DOS ITENS:* ${formatarPreco(total)}\n`;
    mensagem += `_Taxa de entrega, se houver, será confirmada no atendimento._\n\n`;
    mensagem += `🛵 *Recebimento:* ${tipoEntrega}\n`;

    if (tipoEntrega === "Delivery") {
        mensagem += `📍 *Endereço:* ${endereco}\n`;
        mensagem += `🏘️ *Bairro:* ${bairro}\n`;
        if (referencia) mensagem += `📌 *Referência:* ${referencia}\n`;
    }

    mensagem += `\n💳 *Pagamento:* ${pagamento}\n`;
    if (pagamento === "Dinheiro" && troco) mensagem += `💵 *Troco para:* ${formatarPreco(troco)}\n`;
    if (observacoes) mensagem += `\n📝 *Observações:* ${observacoes}\n`;
    mensagem += `\n_Pedido montado pelo site da Check-In Burger._`;

    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`, "_blank");
}

document.addEventListener("keydown", e => { if (e.key === "Escape") fecharCarrinho(); });
document.addEventListener("DOMContentLoaded", () => {
    atualizarCarrinho();
    alternarEndereco();
    alternarTroco();
});
