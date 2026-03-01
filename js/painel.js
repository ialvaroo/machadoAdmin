// ===============================
// FUNÇÕES DE DATA (SEM ERRO DE FUSO)
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

function formatarData(data){
  const novaData = criarDataLocal(data);
  if(!novaData) return "";
  return novaData.toLocaleDateString("pt-BR");
}

function zerarHorario(data){
  data.setHours(0,0,0,0);
  return data;
}


// ===============================
let listaEmprestimos = [];
let ordemNomeAsc = true;
let ordemVencAsc = true;


// ===============================
// CÁLCULO DE JUROS POR DIA
// ===============================

function calcularDias(inicio) {

  let dataInicio = zerarHorario(criarDataLocal(inicio));
  let hoje = zerarHorario(new Date());

  let diffMs = hoje - dataInicio;
  let dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (dias < 0) return 0;

  return dias;
}

function calcularTotalComJuros(valor, percentual, inicio) {

  let dias = calcularDias(inicio);

  let taxaMensal = percentual / 100;

  // taxa diária equivalente (juros compostos)
  let taxaDiaria = Math.pow(1 + taxaMensal, 1/30) - 1;

  let total = valor * Math.pow((1 + taxaDiaria), dias);

  return total;
}


// ===============================
// MOEDA
// ===============================

function formatarMoeda(valor){
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

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
// INPUT VALOR
// ===============================

const inputValor = document.getElementById("valor");

if(inputValor){
  inputValor.addEventListener("input", function (e) {
    let valor = e.target.value.replace(/\D/g, "");
    if(valor === ""){
      e.target.value = "";
      return;
    }
    valor = (Number(valor) / 100).toFixed(2);
    valor = valor.replace(".", ",");
    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    e.target.value = "R$ " + valor;
  });
}

function pegarValor() {
  const valorInput = document.getElementById("valor")?.value || "";
  return limparMoeda(valorInput);
}

function validarValor(maximo) {
  const valor = pegarValor();
  if(!valor || valor <= 0){
    alert("Digite um valor válido.");
    return false;
  }
  if(valor > maximo){
    alert("Valor maior que o permitido.");
    return false;
  }
  return true;
}


// ===============================
// CARREGAR DO BANCO
// ===============================

async function carregar(){

  let {data,error}=await supabaseClient
  .from("emprestimos")
  .select(`
    *,
    clientes (
      telefone,
      ativo
    )
  `)
  .eq("clientes.ativo", true); 

  if(error){
    console.log(error);
    return;
  }

  listaEmprestimos = data.filter(e => e.clientes?.ativo === true);

  renderizar(listaEmprestimos);
}


// ===============================
// RENDERIZAR
// ===============================

function renderizar(data){

  let hoje = zerarHorario(new Date());

  let tabela=document.querySelector("#tabela tbody");
  let risco=document.querySelector("#risco tbody");

  tabela.innerHTML="";
  risco.innerHTML="";

  let listaNormal=[];
  let listaRisco=[];

  data.forEach(e=>{

    let totalAtualizado = calcularTotalComJuros(
      Number(e.valor),
      Number(e.percentual),
      e.inicio
    );

    let totalFaltante = totalAtualizado - Number(e.valor_pago);

    if(totalFaltante <= 0){
      return;
    }

    e.total_faltante = totalFaltante;
    e.juros = totalAtualizado - Number(e.valor);

    let venc = zerarHorario(criarDataLocal(e.vencimento));
    let diff = (hoje - venc)/(1000*60*60*24);

    if(diff > 60){
      listaRisco.push(e);
    } else {
      listaNormal.push(e);
    }

  });

  listaNormal.forEach(e=> criarLinha(e,tabela));
  listaRisco.forEach(e=> criarLinha(e,risco));
}


// ===============================
// CRIAR LINHA
// ===============================

function criarLinha(e, destino){

  let hoje = zerarHorario(new Date());
  let venc = zerarHorario(criarDataLocal(e.vencimento));
  let diff = (hoje - venc)/(1000*60*60*24);

  let status="ABERTO";

  if(Number(e.total_faltante)<=0){
    status="PAGO";
  }
  else if(diff>60){
    status="RISCO";
  }
  else if(diff>0){
    status="ATRASADO";
  }

  let classeStatus = "";
  if (status === "PAGO") classeStatus = "status-quitado";
  else if (status === "ATRASADO") classeStatus = "status-atrasado";
  else if (status === "RISCO") classeStatus = "status-risco";
  else classeStatus = "status-aberto";

  let tr=document.createElement("tr");

  tr.onclick=()=>{
    location.href="cliente.html?id="+e.cliente_id+"&origem=index.html";
  };

  tr.innerHTML=`
    <td style="font-weight: bold;">${e.nome}</td>
    <td style="text-align: center;">${formatarData(e.inicio)}</td>
    <td style="text-align: center;">${formatarMoeda(e.valor)}</td>
    <td style="text-align: center;">${e.percentual}%</td>
    <td style="text-align: center;">${formatarMoeda(e.juros)}</td>
    <td style="text-align: center;">${formatarMoeda(e.valor_pago)}</td>
    <td style="text-align: center; font-weight: bold;">${formatarMoeda(e.total_faltante)}</td>
    <td style="text-align: center;">${formatarData(e.vencimento)}</td>
    <td style="text-align: center;">${e.clientes?.telefone || ""}</td>
    <td style="text-align: center;">${e.garantia || ""}</td>
    <td style="text-align: center;" class="${classeStatus}">${status}</td>
    <td style="text-align: center;">
      <button class="btn-pagar" onclick="event.stopPropagation(); pagar('${e.id}')">
        Pagar
      </button>
      <button class="btn-editar" onclick="event.stopPropagation(); editar('${e.id}')">
        Editar
      </button>
    </td>
  `;

  destino.appendChild(tr);
}


// ===============================
// ORDENAÇÕES
// ===============================

document.getElementById("ordenarNome").onclick=function(){
  ordemNomeAsc=!ordemNomeAsc;
  listaEmprestimos.sort((a,b)=>
    ordemNomeAsc
      ? a.nome.localeCompare(b.nome)
      : b.nome.localeCompare(a.nome)
  );
  renderizar(listaEmprestimos);
};

document.getElementById("ordenarVencimento").onclick=function(){
  ordemVencAsc=!ordemVencAsc;
  listaEmprestimos.sort((a,b)=>
    ordemVencAsc
      ? criarDataLocal(a.vencimento)-criarDataLocal(b.vencimento)
      : criarDataLocal(b.vencimento)-criarDataLocal(a.vencimento)
  );
  renderizar(listaEmprestimos);
};

// ===============================
// BOTÕES
// ===============================

function pagar(id){
  location.href="pagar.html?id="+id+"&origem=index.html";
}

function editar(id){
  location.href="editar.html?id="+id;
}

// ===============================
// PESQUISA
// ===============================

document.getElementById("pesquisa").addEventListener("keyup", function(){

  let termo = this.value.toLowerCase().trim();

  if(termo===""){
    renderizar(listaEmprestimos);
    return;
  }

  let filtrado = listaEmprestimos.filter(e =>
    e.nome.toLowerCase().includes(termo)
  );

  renderizar(filtrado);
});


// ===============================
carregar();