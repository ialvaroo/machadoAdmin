let listaClientes=[];


// carregar clientes

async function carregarClientes(){


let {data,error}=await supabaseClient

.from("clientes")

.select("*")

.order("nome",{ascending:true});


if(error){

console.log(error);

return;

}


listaClientes=data;

renderizarClientes(data);


}




// renderizar

function renderizarClientes(data){


let tbody=document.querySelector("#tabelaClientes tbody");

tbody.innerHTML="";


data.forEach(cliente=>{


let tr=document.createElement("tr");



// clicar abre histórico

tr.onclick=()=>{

location.href="cliente.html?id="+cliente.id;

};



tr.innerHTML=`

<td>${cliente.nome}</td>

<td>${cliente.telefone || ""}</td>


<td>

<button class="btn-editar"

onclick="event.stopPropagation(); editarCliente('${cliente.id}')">

Editar

</button>

</td>

`;


tbody.appendChild(tr);


});


}




// pesquisa

document.getElementById("pesquisaCliente")

.addEventListener("keyup",function(){


let termo=this.value.toLowerCase();


let filtrado=listaClientes.filter(c=>


c.nome.toLowerCase().includes(termo)

);


renderizarClientes(filtrado);


});




// editar

function editarCliente(id){

location.href="editar_cliente.html?id="+id;

}



// novo

function novoCliente(){

location.href="novo_cliente.html";

}



// iniciar

carregarClientes();
