let id = new URLSearchParams(location.search).get("id");




// MÁSCARA VALOR

document.addEventListener("DOMContentLoaded", function(){

const campoValor = document.getElementById("valor");

campoValor.addEventListener("input", function(e){

let valor = e.target.value.replace(/\D/g,"");

if(valor==""){
e.target.value="R$ 0,00";
return;
}

valor = (parseInt(valor)/100).toFixed(2);

valor = valor.replace(".",",");

valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g,".");

e.target.value = "R$ " + valor;

});

});




// converter valor

function obterValorNumerico(){

let valorCampo = document.getElementById("valor").value;

return parseFloat(

valorCampo
.replace("R$","")
.replace(/\./g,"")
.replace(",",".")
.trim()

);

}




// CARREGAR DADOS

async function carregar(){

let { data, error } = await supabaseClient

.from("emprestimos")

.select(`
*,
clientes (
telefone
)
`)

.eq("id", id)

.single();



if(error){

alert("Erro ao carregar");

console.log(error);

return;

}



// preencher cliente

document.getElementById("clienteInput").value = data.nome;

document.getElementById("telefone").value = data.clientes?.telefone || "";



// preencher valor

document.getElementById("valor").value =
"R$ " +
Number(data.valor)
.toFixed(2)
.replace(".",",")
.replace(/\B(?=(\d{3})+(?!\d))/g,".");



// preencher resto

document.getElementById("percentual").value = data.percentual;

document.getElementById("garantia").value = data.garantia;

document.getElementById("vencimento").value = data.vencimento;

}

carregar();




// SALVAR

async function salvar(){

let valorNumerico = obterValorNumerico();

let percentualValor = parseFloat(percentual.value);

let juros = valorNumerico * (percentualValor/100);

let total = valorNumerico + juros;



let { error } = await supabaseClient

.from("emprestimos")

.update({

valor: valorNumerico,

percentual: percentualValor,

juros: juros,

total_faltante: total,

garantia: garantia.value,

vencimento: vencimento.value

})

.eq("id", id);



if(error){

alert("Erro ao atualizar");

return;

}



alert("Atualizado com sucesso");

location.href = "index.html";

}




function cancelar(){

location.href="index.html";

}