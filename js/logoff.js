async function fazerLogoff(){

const { error } = await window.supabase.auth.signOut()

if(error){

alert("Erro ao sair")

}else{

window.location.href = "login.html"

}

}

// botão sair
const btn = document.getElementById("logout")

if(btn){

btn.addEventListener("click", fazerLogoff)

}