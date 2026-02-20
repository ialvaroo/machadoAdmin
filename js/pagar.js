const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

window.emprestimoAtual = null;
async function carregarDetalhes() {

  const { data, error } = await supabase
    .from("emprestimos")
    .select("*, clientes(nome)")
    .eq("id", id)
    .single();

  if (error || !data) {
    alert("Erro ao carregar empréstimo");
    return;
  }

  window.emprestimoAtual = data;

  const restante = data.valor_total - data.valor_pago;

  document.getElementById("detCliente").textContent = data.clientes.nome;
  document.getElementById("detTotal").textContent = data.valor_total.toFixed(2);
  document.getElementById("detPago").textContent = data.valor_pago.toFixed(2);
  document.getElementById("detRestante").textContent = restante.toFixed(2);
  document.getElementById("detJuros").textContent = data.juros;
  document.getElementById("detData").textContent = data.data;
  document.getElementById("detStatus").textContent = data.status;

  if (data.status === "Quitado") {
    document.getElementById("valorPagamento").disabled = true;
    document.getElementById("quitarCheckbox").disabled = true;
    alert("Este empréstimo já está quitado.");
  }
}

document.getElementById("quitarCheckbox").addEventListener("change", function () {

  const inputValor = document.getElementById("valorPagamento");

  if (this.checked) {

    const restante =
      window.emprestimoAtual.valor_total -
      window.emprestimoAtual.valor_pago;

    inputValor.value = restante.toFixed(2);
    inputValor.disabled = true;

  } else {
    inputValor.disabled = false;
    inputValor.value = "";
  }
});

async function pagarEmprestimo() {

  if (!window.emprestimoAtual) return;

  const inputValor = document.getElementById("valorPagamento");
  const valorDigitado = parseFloat(inputValor.value);

  const restante =
    window.emprestimoAtual.valor_total -
    window.emprestimoAtual.valor_pago;

  if (!valorDigitado || valorDigitado <= 0) {
    alert("Digite um valor válido.");
    return;
  }

  if (valorDigitado > restante) {
    alert("Valor maior que o restante do empréstimo.");
    return;
  }

  const novoValorPago =
    window.emprestimoAtual.valor_pago + valorDigitado;

  const novoStatus =
    novoValorPago >= window.emprestimoAtual.valor_total
      ? "Quitado"
      : "Em andamento";

  const { error } = await supabase
    .from("emprestimos")
    .update({
      valor_pago: novoValorPago,
      status: novoStatus
    })
    .eq("id", window.emprestimoAtual.id);

  if (error) {
    alert("Erro ao realizar pagamento.");
  } else {
    alert("Pagamento realizado com sucesso!");
    window.location.href = "index.html";
  }
}

function voltar() {
  window.location.href = "index.html";
}

carregarDetalhes();