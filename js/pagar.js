let id=new URLSearchParams(location.search).get("id");

async function salvarPagamento(){

let valor=parseFloat(document.getElementById("valor").value);

let {data}=await supabaseClient

.from("emprestimos")

.select("*")

.eq("id",id)

.single();

let pago=data.valor_pago+valor;

let faltante=data.total_faltante-valor;

let status="aberto";

if(faltante<=0){

status="pago";

faltante=0;

}

await supabaseClient

.from("emprestimos")

.update({

valor_pago:pago,

total_faltante:faltante,

status:status

})

.eq("id",id);

await supabaseClient

.from("pagamentos")

.insert({

emprestimo_id:id,

valor:valor,

data:new Date()

});

alert("Pagamento realizado");

location.href="index.html";

}
