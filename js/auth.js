async function protegerPagina(){

const { data, error } = await window.supabase.auth.getSession()

if(error || !data.session){

window.location.href = "login.html"

}

}

protegerPagina()