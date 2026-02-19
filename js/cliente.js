let id=new URLSearchParams(location.search).get("id");
async function carregar(){
let {data}=await supabaseClient.from("emprestimos").select("*").eq("cliente_id",id);
let t=document.getElementById("hist");
data.forEach(e=>{
t.innerHTML+=`<tr><td>${e.nome}</td><td>${e.valor}</td><td>${e.vencimento}</td></tr>`;
});
}
carregar();
