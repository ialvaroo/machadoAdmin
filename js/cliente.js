let id = new URLSearchParams(location.search).get("id");


function formatarMoeda(valor){

return Number(valor).toLocaleString("pt-BR",{

style:"currency",

currency:"BRL"

});

}


function formatarData(data){

if(!data) return "-";

return new Date(data).toLocaleDateString("pt-BR");

}



function pagar(id){

location.href="pagar.html?id="+id;

}

async function carregarCliente(){

let {data,error} = await supabaseClient

.from("clientes")

.select("*")

.eq("id", id)

.single();


if(error){

console.log(error);

return;

}


document.getElementById("clienteNome").innerText = data.nome || "-";

document.getElementById("clienteTelefone").innerText = data.telefone || "-";

}

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

let juros = Number(e.juros || 0);

let pago = Number(e.valor_pago || 0);

let total = valor + juros;

let faltante = total - pago;



// STATUS

let hoje = new Date();

let venc = new Date(e.vencimento);

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

<td style="text-align: center;">${e.percentual}</td>

<td style="text-align: center;">${formatarMoeda(juros)}</td>

<td style="text-align: center;">${formatarMoeda(pago)}</td>

<td style="text-align: center; font-weight: bold;">${formatarMoeda(faltante)}</td>

<td style="text-align: center;">${formatarData(e.vencimento)}</td>

<td style="text-align: center;">${e.garantia || ""}</td>

<td style="text-align: center;" class="${classeStatus}">${status}</td>

<td style="text-align: center;">

${faltante > 0 ? 

`<button onclick="pagar(${e.id})" class="btn-azul">
Pagar
</button>`

:

`<span style="color:#16a34a;font-weight:bold;">-</span>`

}

</td>

</tr>

`;

});


}


carregarCliente();
carregar();