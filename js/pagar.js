const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

let emprestimoAtual = null;

const inputValor = document.getElementById("valorPagamento");

// 🔹 Máscara de moeda
inputValor.addEventListener("input", function (e) {

    let valor = e.target.value.replace(/\D/g, "");

    valor = (Number(valor) / 100).toFixed(2);

    valor = valor.replace(".", ",");
    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    e.target.value = "R$ " + valor;
});

// 🔹 Remove máscara para salvar no banco
function limparMoeda(valor) {
    if (!valor) return 0;

    return Number(
        valor
        .replace("R$ ", "")
        .replace(/\./g, "")
        .replace(",", ".")
    );
}

async function carregarEmprestimo() {

  if (!id) {
    alert("ID do empréstimo não informado.");
    return;
  }

  const { data, error } = await supabase
    .from("emprestimos")
    .select(`
      *,
      clientes (
        telefone
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    alert("Erro ao carregar empréstimo");
    console.error(error);
    return;
  }

  emprestimoAtual = data;

  const valor = Number(data.valor || 0);
  const juros = Number(data.juros || 0);
  const valorPago = Number(data.valor_pago || 0);

  const totalComJuros = valor + juros;
  const totalFaltante = totalComJuros - valorPago;

  let hoje = new Date();
  let venc = new Date(data.vencimento);
  let diff = (hoje - venc) / (1000 * 60 * 60 * 24);

  let status = "ABERTO";

  if (totalFaltante <= 0) status = "PAGO";
  else if (diff > 60) status = "RISCO";
  else if (diff > 0) status = "ATRASADO";

  let classeStatus = "";
  if (status === "PAGO") classeStatus = "status-quitado";
  else if (status === "ATRASADO") classeStatus = "status-atrasado";
  else if (status === "RISCO") classeStatus = "status-risco";
  else classeStatus = "status-aberto";

  document.getElementById("detalhesEmprestimo").innerHTML = `
    <h3>Detalhes do Empréstimo</h3>
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Inicio</th>
          <th>Valor</th>
          <th>%</th>
          <th>Juros</th>
          <th>Pago</th>
          <th>Total (Faltante)</th>
          <th>Vencimento</th>
          <th>Telefone</th>
          <th>Garantia</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${data.nome}</td>
          <td>${formatarData(data.inicio)}</td>
          <td>${formatarMoeda(valor)}</td>
          <td>${data.percentual}</td>
          <td>${formatarMoeda(juros)}</td>
          <td>${formatarMoeda(valorPago)}</td>
          <td>${formatarMoeda(totalFaltante)}</td>
          <td>${formatarData(data.vencimento)}</td>
          <td>${data.clientes?.telefone || ""}</td>
          <td>${data.garantia}</td>
          <td class="${classeStatus}">${status}</td>
        </tr>
      </tbody>
    </table>
  `;
}

function alternarModo(){
  const check = document.getElementById("checkQuitar");
  const campo = document.getElementById("campoValor");
  const input = document.getElementById("valorPagamento");

  if(check.checked){
    campo.classList.add("campo-desativado");
    input.disabled = true;
    input.value = "";
  } else {
    campo.classList.remove("campo-desativado");
    input.disabled = false;
  }
}

async function confirmarPagamento(){

  if(!emprestimoAtual){
    alert("Empréstimo não carregado.");
    return;
  }

  const quitar = document.getElementById("checkQuitar").checked;

  const valorBase = Number(emprestimoAtual.valor || 0);
  const juros = Number(emprestimoAtual.juros || 0);
  const pagoAtual = Number(emprestimoAtual.valor_pago || 0);

  const totalComJuros = valorBase + juros;
  const saldoAtual = totalComJuros - pagoAtual;

  if(saldoAtual <= 0){
    alert("Este empréstimo já está quitado.");
    return;
  }

  let novoValorPago = pagoAtual;

  if(quitar){
    novoValorPago = totalComJuros;
  } else {

    const valorInput = document.getElementById("valorPagamento").value;
    const valorDigitado = limparMoeda(valorInput);

    if(valorDigitado <= 0){
      alert("Digite um valor válido.");
      return;
    }

    if(valorDigitado > saldoAtual){
      alert("Valor maior que o saldo restante.");
      return;
    }

    novoValorPago = pagoAtual + valorDigitado;
  }

  const novoSaldo = totalComJuros - novoValorPago;

  const { error } = await supabase
    .from("emprestimos")
    .update({
      valor_pago: novoValorPago,
      total_faltante: novoSaldo,
      status: novoSaldo <= 0 ? "QUITADO" : "ABERTO"
    })
    .eq("id", id);

  if(error){
    console.error(error);
    alert("Erro ao registrar pagamento.");
    return;
  }

  alert("Pagamento registrado com sucesso!");
  window.location.href = "index.html";
}

function cancelar(){
  window.location.href = "index.html";
}

function formatarMoeda(valor){
  return Number(valor).toLocaleString("pt-BR", {
    style:"currency",
    currency:"BRL"
  });
}

function formatarData(data){
  if(!data) return "-";
  let d = new Date(data);
  return d.toLocaleDateString("pt-BR");
}

carregarEmprestimo();