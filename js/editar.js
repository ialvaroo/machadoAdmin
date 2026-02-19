let id=new URLSearchParams(location.search).get("id");

async function carregar(){

let {data}=await supabaseClient

.from("emprestimos")

.select("*")

.eq("id",id)

.single();

nome.value=data.nome;

valor.value=data.valor;

percentual.value=data.percentual;

vencimento.value=data.vencimento;

garantia.value=data.garantia;

}

carregar();

async function salvar(){

let v=parseFloat(valor.value);

let p=parseFloat(percentual.value);

let juros=v*(p/100);

let total=v+juros;

await supabaseClient

.from("emprestimos")

.update({

nome:nome.value,

valor:v,

percentual:p,

juros:juros,

total_faltante:total,

vencimento:vencimento.value,

garantia:garantia.value

})

.eq("id",id);

alert("Atualizado");

location.href="index.html";

}
