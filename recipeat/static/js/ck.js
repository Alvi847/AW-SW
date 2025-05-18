const toolbarConfig = {
	contentsCss: ['/css/editor-style.css'], // Ruta al CSS personalizado
	bodyClass: 'editor-dark-body', // (opcional) si quieres estilizar más
	uiColor: '#ffffff', // color de la interfaz (barra superior)
	toolbar: [
		{ name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike'] },
		{ name: 'paragraph', items: ['NumberedList', 'BulletedList'] },
		{ name: 'insert', items: ['Image', 'Table'] },
		{ name: 'styles', items: ['Format'] },
		{ name: 'tools', items: ['Maximize'] }
	]
	};
		
		CKEDITOR.replace('descripcion', toolbarConfig);
		CKEDITOR.replace('modo_preparacion', toolbarConfig);