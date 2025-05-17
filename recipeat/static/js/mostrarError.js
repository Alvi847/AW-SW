function mostrarError(statusCode, message){
  const main = document.querySelector('main');
  main.innerHTML = '';

  const contenedor = document.createElement('div');
  contenedor.className = 'pagina-error';

  const titulo = document.createElement('h1');

  if(statusCode === 403)
    titulo.textContent = 'Sin permisos';
  else  
    titulo.textContent = 'Ha ocurrido un error';

  const mensaje = document.createElement('p');
  if(message)
    mensaje.textContent = message;
  else
    mensaje.textContent = 'Ha ocurrido un error desconocido, sentimos las molestias';

  const boton_volver = document.createElement('button');
  boton_volver.textContent = 'Volver a la página principal';
  boton_volver.onclick = function () {window.location.assign('/');}; 

  contenedor.appendChild(titulo);
  contenedor.appendChild(mensaje);
  contenedor.appendChild(boton_volver);

  main.appendChild(contenedor);
  window.scrollTo(0, 0);
}