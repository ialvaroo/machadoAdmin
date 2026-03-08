let listaClientes=[];


// carregar clientes

async function carregarClientes(){

let {data,error}=await supabaseClient
.from("clientes")
.select("*")
.eq("ativo", true) // 👈 FILTRO IMPORTANTE
.order("nome",{ascending:true});

if(error){
console.log(error);
return;
}

listaClientes=data;
renderizarClientes(data);

}

//excluir cliente

async function excluirCliente(id){

let confirmar = confirm("Deseja realmente excluir este cliente?");

if(!confirmar) return;

let { error } = await supabaseClient
.from("clientes")
.update({ ativo: false })
.eq("id", id);

if(error){
    console.log(error);
    alert("Erro ao excluir cliente");
    return;
}

carregarClientes();

}




// renderizar

function renderizarClientes(data){


let tbody=document.querySelector("#tabelaClientes tbody");

tbody.innerHTML="";


data.forEach(cliente=>{


let tr=document.createElement("tr");



// clicar abre histórico

tr.onclick=()=>{

location.href="cliente.html?id="+cliente.id+"&origem=clientes.html";

};



tr.innerHTML=`

<td style="padding-left: 5vw; width: 30vw;">${cliente.nome}</td>

<td style="text-align: center;">${cliente.telefone || ""}</td>


<td style="text-align: center;">

<button  class="btn-editar" 

onclick="event.stopPropagation(); editarCliente('${cliente.id}')">

Editar

</button>

<button class="btn-vermelho" 
onclick="event.stopPropagation(); excluirCliente('${cliente.id}')">
Excluir
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
