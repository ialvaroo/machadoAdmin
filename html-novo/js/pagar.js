const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

let emprestimoAtual = null;

const inputValor = document.getElementById("valorPagamento");


// ===============================
// FUNÇÕES DE DATA
// ===============================

function criarDataLocal(dataString){
  if(!dataString) return null;

  const partes = dataString.split("-");

  return new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2])
  );
}

function zerarHorario(data){
  data.setHours(0,0,0,0);
  return data;
}


// ===============================
// CÁLCULO DE MESES
// ===============================

function calcularMeses(inicio){

  let dataInicio = zerarHorario(criarDataLocal(inicio));
  let hoje = zerarHorario(new Date());

  let anos = hoje.getFullYear() - dataInicio.getFullYear();
  let meses = hoje.getMonth() - dataInicio.getMonth();

  let totalMeses = anos * 12 + meses;

  if(hoje.getDate() < dataInicio.getDate()){
    totalMeses--;
  }

  if(totalMeses < 0) return 0;

  return totalMeses;
}


// ===============================
// JUROS COMPOSTOS MENSAIS
// ===============================

function calcularTotalComJuros(valor, percentual, inicio){

  let meses = calcularMeses(inicio);

  let taxaMensal = percentual / 100;

  let total = valor * Math.pow((1 + taxaMensal), meses);

  return total;
}


// ===============================
// MÁSCARA DE MOEDA
// ===============================

inputValor.addEventListener("input", function (e) {

  let valor = e.target.value.replace(/\D/g, "");

  valor = (Number(valor) / 100).toFixed(2);

  valor = valor.replace(".", ",");
  valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  e.target.value = "R$ " + valor;
});


// ===============================
// LIMPAR MOEDA
// ===============================

function limparMoeda(valor) {

  if (!valor) return 0;

  return Number(
    valor
      .replace("R$ ", "")
      .replace(/\./g, "")
      .replace(",", ".")
  );
}


// ===============================
// CARREGAR EMPRÉSTIMO
// ===============================

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
        nome,
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
  const valorPago = Number(data.valor_pago || 0);

  const totalComJuros = calcularTotalComJuros(
    valor,
    Number(data.percentual),
    data.inicio
  );

  const juros = totalComJuros - valor;

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

  <div class="table-container">  
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

  <td style="font-weight: bold;">${data.clientes?.nome || ""}</td>

  <td style="text-align: center;">${formatarData(data.inicio)}</td>

  <td style="text-align: center;">${formatarMoeda(valor)}</td>

  <td style="text-align: center;">${data.percentual}%</td>

  <td style="text-align: center;">${formatarMoeda(juros)}</td>

  <td style="text-align: center;">${formatarMoeda(valorPago)}</td>

  <td style="text-align: center; font-weight: bold;">${formatarMoeda(totalFaltante)}</td>

  <td style="text-align: center;">${formatarData(data.vencimento)}</td>

  <td style="text-align: center;">${data.clientes?.telefone || ""}</td>

  <td style="text-align: center;">${data.garantia || ""}</td>

  <td style="text-align: center;" class="${classeStatus}">${status}</td>

  </tr>
  </tbody>

  </table>
  </div>
  `;
}


// ===============================
// ALTERNAR QUITAR
// ===============================

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


// ===============================
// CONFIRMAR PAGAMENTO
// ===============================

async function confirmarPagamento(){

  if(!emprestimoAtual){
    alert("Empréstimo não carregado.");
    return;
  }

  const quitar = document.getElementById("checkQuitar").checked;

  const valorBase = Number(emprestimoAtual.valor || 0);
  const pagoAtual = Number(emprestimoAtual.valor_pago || 0);

  const totalComJuros = calcularTotalComJuros(
    valorBase,
    Number(emprestimoAtual.percentual),
    emprestimoAtual.inicio
  );

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
      valor_pago: novoValorPago
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


// ===============================
// CANCELAR
// ===============================

function cancelar(){

let origem = new URLSearchParams(window.location.search).get("origem");

if(origem){
window.location.href = origem;
}else{
window.location.href = "index.html";
}

}


// ===============================
// FORMATAR
// ===============================

function formatarMoeda(valor){
  return Number(valor).toLocaleString("pt-BR",{
    style:"currency",
    currency:"BRL"
  });
}

function formatarData(data){

  if(!data) return "-";

  let d = new Date(data);

  return d.toLocaleDateString("pt-BR");
}


// ===============================

carregarEmprestimo();