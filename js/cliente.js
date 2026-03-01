let id = new URLSearchParams(location.search).get("id");


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

function zerarHorario(data){
  data.setHours(0,0,0,0);
  return data;
}

function formatarData(data){
  const novaData = criarDataLocal(data);
  if(!novaData) return "-";
  return novaData.toLocaleDateString("pt-BR");
}


// ===============================
// JUROS POR DIA
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

  // taxa diária equivalente
  let taxaDiaria = Math.pow(1 + taxaMensal, 1/30) - 1;

  let total = valor * Math.pow((1 + taxaDiaria), dias);

  return total;
}


// ===============================
// MOEDA
// ===============================

function formatarMoeda(valor){
  return Number(valor).toLocaleString("pt-BR",{
    style:"currency",
    currency:"BRL"
  });
}


// ===============================
// PAGAR
// ===============================

function pagar(id){
  location.href="pagar.html?id="+id+"&origem=clientes.html";
}


// ===============================
// CARREGAR CLIENTE
// ===============================

async function carregarCliente(){

  let {data,error} = await supabaseClient
  .from("clientes")
  .select("*")
  .eq("id", id)
  .eq("ativo", true)
  .single();

  if(error){
    console.log(error);
    return;
  }

  if(!data){
    alert("Cliente não encontrado ou foi excluído.");
    location.href="clientes.html";
    return;
  }

  document.getElementById("clienteNome").innerText = data.nome || "-";
  document.getElementById("clienteTelefone").innerText = data.telefone || "-";
}


// ===============================
// CARREGAR EMPRÉSTIMOS
// ===============================

async function carregar(){

  let {data} = await supabaseClient
  .from("emprestimos")
  .select("*")
  .eq("cliente_id", id)
  .order("inicio",{ascending:false});

  let t = document.getElementById("hist");
  t.innerHTML="";

  data.forEach(e=>{

    let valor = Number(e.valor || 0);
    let pago = Number(e.valor_pago || 0);

    // CALCULA JUROS EM TEMPO REAL
    let totalAtualizado = calcularTotalComJuros(
      valor,
      Number(e.percentual),
      e.inicio
    );

    let juros = totalAtualizado - valor;
    let faltante = totalAtualizado - pago;

    // STATUS
    let hoje = zerarHorario(new Date());
    let venc = zerarHorario(criarDataLocal(e.vencimento));
    let diff = (hoje - venc) / (1000*60*60*24);

    let status="ABERTO";
    let classeStatus="status-aberto";

    if(faltante<=0){
      status="QUITADO";
      classeStatus="status-quitado";
    }
    else if(diff>60){
      status="RISCO";
      classeStatus="status-risco";
    }
    else if(diff>0){
      status="ATRASADO";
      classeStatus="status-atrasado";
    }

    t.innerHTML += `
    <tr>
      <td style="text-align: center;">${formatarData(e.inicio)}</td>
      <td style="text-align: center;">${formatarMoeda(valor)}</td>
      <td style="text-align: center;">${e.percentual}%</td>
      <td style="text-align: center;">${formatarMoeda(juros)}</td>
      <td style="text-align: center;">${formatarMoeda(pago)}</td>
      <td style="text-align: center; font-weight: bold;">${formatarMoeda(faltante)}</td>
      <td style="text-align: center;">${formatarData(e.vencimento)}</td>
      <td style="text-align: center;">${e.garantia || ""}</td>
      <td style="text-align: center;" class="${classeStatus}">${status}</td>
      <td style="text-align: center;">
        ${
          faltante > 0 
          ? `<button class="btn-verde" onclick="event.stopPropagation(); pagar('${e.id}')">
              Pagar
            </button>`
          : `<span style="color:#16a34a; font-weight:bold;">-</span>`
        }
      </td>
    </tr>
    `;
  });
}

// ===============================

carregarCliente();
carregar();