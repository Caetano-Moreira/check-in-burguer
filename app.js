const numeroWhatsApp = "5524998700947";


function pedirProduto(produto, preco) {

    const mensagem =
        `Olá! 👋 Gostaria de fazer um pedido na Check-In Burger.%0A%0A` +
        `🍔 Produto: ${produto}%0A` +
        `💰 Valor: R$ ${preco}%0A%0A` +
        `Pode me passar as informações para finalizar o pedido?`;

    const url =
        `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;

    window.open(url, "_blank");

}