function formatarData(data){

let d = new Date(data);

return d.toLocaleDateString("pt-BR");

}


let listaEmprestimos = [];

let ordemNomeAsc = true;

let ordemVencAsc = true;


// função moeda
function formatarMoeda(valor){

return Number(valor).toLocaleString("pt-BR", {

style: "currency",

currency: "BRL",

minimumFractionDigits: 2,

maximumFractionDigits: 2

});

}



// carregar do banco
async function carregar(){

let {data,error}=await supabaseClient

.from("emprestimos")
.select(`
*,
clientes (
telefone
)
`);



if(error){

console.log(error);

return;

}


listaEmprestimos = data;

renderizar(listaEmprestimos);

}




// renderizar tabela
function renderizar(data){

let hoje=new Date();

let tabela=document.querySelector("#tabela tbody");

let risco=document.querySelector("#risco tbody");

tabela.innerHTML="";

risco.innerHTML="";



let listaNormal=[];

let listaRisco=[];



data.forEach(e=>{


// NÃO MOSTRAR PAGOS NO PAINEL

if(Number(e.total_faltante) <= 0){

return;

}


let venc=new Date(e.vencimento);

let diff=(hoje-venc)/(1000*60*60*24);



if(diff>60){

listaRisco.push(e);

}

else{

listaNormal.push(e);

}

});




// renderizar lista normal

listaNormal.forEach(e=>{

criarLinha(e,tabela);

});




// renderizar lista risco

listaRisco.forEach(e=>{

criarLinha(e,risco);

});


}




// criar linha
function criarLinha(e, destino){

let hoje=new Date();

let venc=new Date(e.vencimento);

let diff=(hoje-venc)/(1000*60*60*24);



let status="ABERTO";


if(Number(e.total_faltante)<=0){

status="PAGO";

}

else if(diff>60){

status="RISCO DE PERDA";

}

else if(diff>0){

status="ATRASADO";

}




let tr=document.createElement("tr");



tr.onclick=()=>{

location.href="cliente.html?id="+e.cliente_id;

};




tr.innerHTML=`

<td>${e.nome}</td>

<td>${formatarData(e.inicio)}</td>

<td>${formatarMoeda(e.valor)}</td>

<td>${e.percentual}</td>

<td>${formatarMoeda(e.juros)}</td>

<td>${formatarMoeda(e.valor_pago)}</td>

<td>${formatarMoeda(e.total_faltante)}</td>

<td>${formatarData(e.vencimento)}</td>

<td>${e.clientes?.telefone || ""}</td>

<td>${e.garantia}</td>

<td>${status}</td>

<td>

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




// ordenar por nome
document.getElementById("ordenarNome").onclick=function(){

ordemNomeAsc=!ordemNomeAsc;


listaEmprestimos.sort(function(a,b){

return ordemNomeAsc

? a.nome.localeCompare(b.nome)

: b.nome.localeCompare(a.nome);

});


renderizar(listaEmprestimos);

};




// ordenar por vencimento
document.getElementById("ordenarVencimento").onclick=function(){

ordemVencAsc=!ordemVencAsc;


listaEmprestimos.sort(function(a,b){

return ordemVencAsc

? new Date(a.vencimento)-new Date(b.vencimento)

: new Date(b.vencimento)-new Date(a.vencimento);

});


renderizar(listaEmprestimos);

};




// botões

function pagar(id){

location.href="pagar.html?id="+id;

}



function editar(id){

location.href="editar.html?id="+id;

}




// iniciar

carregar();


// PESQUISA APENAS POR NOME

document.getElementById("pesquisa").addEventListener("keyup", function(){

let termo = this.value.toLowerCase().trim();


// se vazio, mostra tudo

if(termo===""){

renderizar(listaEmprestimos);

return;

}


// filtrar apenas por nome

let filtrado = listaEmprestimos.filter(function(e){

return e.nome.toLowerCase().includes(termo);

});


renderizar(filtrado);

});
