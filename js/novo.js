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

let nome=document.getElementById("nome").value;

let valor=obterValorNumerico();

let perc=parseFloat(document.getElementById("percentual").value);

let juros=valor*(perc/100);

let total=valor+juros;

let venc=document.getElementById("vencimento").value;

let garantia=document.getElementById("garantia").value;



let {data:cliente}=await supabaseClient

.from("clientes")

.select("*")

.eq("nome",nome)

.single();



if(!cliente){

let novo=await supabaseClient

.from("clientes")

.insert({nome:nome})

.select()

.single();

cliente=novo.data;

}



await supabaseClient

.from("emprestimos")

.insert({

cliente_id:cliente.id,

nome:nome,

inicio:new Date(),

valor:valor,

percentual:perc,

juros:juros,

valor_pago:0,

total_faltante:total,

vencimento:venc,

garantia:garantia,

status:"aberto"

});



alert("Salvo");

location.href="index.html";

}