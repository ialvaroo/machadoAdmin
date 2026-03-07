// destaque automático do menu

let links = document.querySelectorAll(".sidebar a");

links.forEach(link=>{

if(link.href === window.location.href){

link.style.background = "#1e293b";

}

});