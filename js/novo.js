async function salvar(){
let nome=document.getElementById("nome").value;
let valor=parseFloat(document.getElementById("valor").value);
let perc=parseFloat(document.getElementById("percentual").value);
let juros=valor*(perc/100);
let total=valor+juros;
let venc=document.getElementById("vencimento").value;
let garantia=document.getElementById("garantia").value;
let {data:cliente}=await supabaseClient.from("clientes").select("*").eq("nome",nome).single();
if(!cliente){
let novo=await supabaseClient.from("clientes").insert({nome:nome}).select().single();
cliente=novo.data;
}
await supabaseClient.from("emprestimos").insert({
cliente_id:cliente.id,nome:nome,inicio:new Date(),valor:valor,percentual:perc,juros:juros,valor_pago:0,total_faltante:total,vencimento:venc,garantia:garantia,status:"aberto"
});
alert("Salvo");location.href="index.html";
}
