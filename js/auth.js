async function verificarLogin(){

const { data } = await supabaseClient.auth.getSession();

if(!data.session){

window.location.href = "login.html";

return;

}

document.body.style.display="block";

}

verificarLogin();