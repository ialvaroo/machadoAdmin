document.addEventListener("DOMContentLoaded", function(){

const campoValor=document.getElementById("valor");

campoValor.value="R$ 0,00";

campoValor.addEventListener("input", function(e){

let valor=e.target.value.replace(/\D/g,"");

if(valor==""){
e.target.value="R$ 0,00";
return;
}

valor=(parseInt(valor)/100).toFixed(2);

valor=valor.replace(".",",");

valor=valor.replace(/\B(?=(\d{3})+(?!\d))/g,".");

e.target.value="R$ "+valor;

});

});

function cancelar(){
  window.location.href = "index.html";
}

function obterValorNumerico(){

let valorCampo=document.getElementById("valor").value;

let valor=parseFloat(

valorCampo
.replace("R$","")
.replace(/\./g,"")
.replace(",",".")
.trim()

);

return valor;

}



async function salvar(){

let novo = document.getElementById("novoCheck").checked;

let nome = document.getElementById("nome").value.trim();

let telefone = document.getElementById("telefone").value.trim();

let valor = obterValorNumerico();

let percentual = parseFloat(document.getElementById("percentual").value);

let vencimento = document.getElementById("vencimento").value;

let garantia = document.getElementById("garantia").value;


// VALIDAÇÕES

if(novo){

if(nome === ""){

alert("Digite o nome do cliente");

return;

}


}


if(!novo && !clienteSelecionado){

alert("Selecione um cliente");

return;

}


if(!valor || valor <= 0){

alert("Digite o valor do empréstimo");

return;

}


if(!percentual || percentual <= 0){

alert("Digite o juros (%)");

return;

}


if(!vencimento){

alert("Selecione a data de vencimento");

return;

}



// DEFINIR CLIENTE

let cliente_id;


if(novo){

let {data,error} = await supabaseClient

.from("clientes")

.insert({

nome:nome,

telefone:telefone

})

.select()

.single();


if(error){

alert("Erro ao salvar cliente");

return;

}


cliente_id = data.id;

}


else{

cliente_id = clienteSelecionado.id;

nome = clienteSelecionado.nome;

telefone = clienteSelecionado.telefone;

}



// CALCULAR

let juros = (valor * percentual) / 100;

let total = valor + juros;



// SALVAR

let {error} = await supabaseClient

.from("emprestimos")

.insert({

cliente_id:cliente_id,

nome:nome,

valor:valor,

percentual:percentual,

juros:juros,

valor_pago:0,

total_faltante:total,

garantia:garantia,

vencimento:vencimento,

inicio:new Date(),

status:"ABERTO"

});


if(error){

alert("Erro ao salvar empréstimo");

console.log(error);

return;

}


alert("Empréstimo salvo com sucesso");

location.href="index.html";

}