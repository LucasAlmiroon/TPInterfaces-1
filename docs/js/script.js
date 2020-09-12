document.addEventListener ("DOMContentLoaded", function(){

  let canvas = document.querySelector("#canvas");
  let ctx = canvas.getContext("2d");
  let input = document.querySelector('#inputGroupFile01');
  let cw = canvas.width;
  let ch = canvas.height;
  let gomaActiva = false;
  let lapizActivo = false;
  let dataImgAnterior;
  let filtroAplicado = false;
  
  function verificarFiltro(){
  
    if (filtroAplicado){
      ctx.putImageData(dataImgAnterior,0,0);
    }else{
      filtroAplicado = true;
    }
  }
  
  input.onchange = e =>{cargarImagen(e)}

  function cargarImagen(e){
    let file = e.target.files[0];
    
    let reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = readerEvent => {
      let content = readerEvent.target.result;
      
      let image = new Image();
      
      image.src = content;
      
      image.onload = function(){
      
        canvas.width = this.width;
        canvas.height = this.height;

        ctx.drawImage(image,0,0,canvas.width,canvas.height);
        dataImgAnterior = ctx.getImageData(0,0,canvas.width,canvas.height);
        input.value= '';

      }
    }
  }
    
  function canvasNuevo(){
    input.value= '';
    
    let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    
    for(let x = 0; x <= canvas.width; x++){
    
      for (let y = 0; y <= canvas.height; y++){
    
        let index = (x*imageData.width*y)*4;
        imageData.data[index + 0] = 255;
        imageData.data[index + 1] = 255;
        imageData.data[index + 2] = 255;
      }
    }
    
    ctx.putImageData(imageData,0,0);
    canvas.width = cw;
    canvas.height = ch;
    ctx.fillStyle ="white";
    ctx.fillRect(0,0,cw,ch);
  }

  function descargar(){	
    var dataURL = canvas.toDataURL("image/jpeg", 1.0);
    
    downloadImage(dataURL, 'imagen.jpeg');
  }
  
  function downloadImage(data, filename = 'untitled.jpeg') {
    let a = document.createElement('a');
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
  }
  
  function oMousePos(canvas, e) {
    let ClientRect = canvas.getBoundingClientRect();
         return {
         x: Math.round(e.clientX - ClientRect.left),
         y: Math.round(e.clientY - ClientRect.top)
  }};
  
  function changeToCursor1(){
    if (lapizActivo){
      document.body.style.cursor="url('./img/lapiz.ico'), default";
    }else if(gomaActiva){
      document.body.style.cursor="url('./img/goma.ico'), default";  
    }
  }

  function herramientas(dibujando){
    
    canvas.addEventListener('mousedown', e => {
      dibujando = true;
      ctx.beginPath();
    });
    
    canvas.addEventListener("mousemove", e => {
      if (dibujando) {
        
        let m = oMousePos(canvas, e);
        
        if (lapizActivo){
        
          ctx.lineTo(m.x, m.y);
          let color = document.querySelector("#colorLapiz").value;
          ctx.strokeStyle = color;
          ctx.stroke();
        
        }else if (gomaActiva){
        
          ctx.fillStyle ="white";
          let rangogoma = document.querySelector("#rangogoma");
          ctx.fillRect(m.x,m.y,rangogoma.value,rangogoma.value);
        }
      }
    });
    
    canvas.addEventListener('mouseup', e => {
      dibujando = false;
    });
    
  }
  
  function dibujar(){
    
    let dibujando = false;
    lapizActivo = true;
    gomaActiva = false;
    changeToCursor1();
    herramientas(dibujando);
  }

  function gomaBorrar(){
    
    let borrando = false;
    lapizActivo = false;
    gomaActiva = true;
    changeToCursor1();
    herramientas(borrando);
  }
    
  function getRed(index,imageData){
    return  imageData.data[index + 0];
  }

  function getGreen(index,imageData){
    return  imageData.data[index + 1];
  }
    
  function getBlue(index,imageData){
    return  imageData.data[index + 2];
  }
  
  function aplicarFiltroNegativo(){
    
    verificarFiltro();
    
    let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    let w = imageData.width;
    let h = imageData.height;
    
    for (let x = 0; x < w; x++){
    
      for (let y = 0; y < h; y++){
    
        let index = (x + w * y)*4;
        let r = getRed(index,imageData);
        let g = getGreen(index,imageData);
        let b = getBlue(index,imageData);
        
        
        imageData.data[index + 0] = 255 - r;
        imageData.data[index + 1] = 255 - g;
        imageData.data[index + 2] = 255 - b;
        
      }
    }
    ctx.putImageData(imageData, 0, 0);          
  }

  function aplicarFiltroGris(){

    verificarFiltro();

    let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    let w = imageData.width;
    let h = imageData.height;

    for (let x = 0; x < w; x++){
      
      for (let y = 0; y < h; y++){
      
        let index = (x + w * y)*4;
        let r = getRed(index,imageData);
        let g = getGreen(index,imageData);
        let b = getBlue(index,imageData);
        
        let gris = (r+g+b)/3;
        
        imageData.data[index + 0] = gris;
        imageData.data[index + 1] = gris;
        imageData.data[index + 2] = gris;
        
      }
    }
    ctx.putImageData(imageData, 0, 0);            
  }

  function aplicarFiltroSepia(){

    verificarFiltro();

    let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    let w = imageData.width;
    let h = imageData.height;
    for (let x = 0; x < w; x++){
      
      for (let y = 0; y < h; y++){
        
        let index = (x + w * y)*4;
        let r = getRed(index,imageData);
        let g = getGreen(index,imageData);
        let b = getBlue(index,imageData);
        
        let sepia = ((0.3 * r) + (0.6* g) + (0.1* b))
        
        imageData.data[index + 0] = Math.min(sepia + 40,255);
        imageData.data[index + 1] = Math.min(sepia + 15,255);
        imageData.data[index + 2] = sepia;
        
      }
    }
    ctx.putImageData(imageData, 0, 0);            
  }
  
  function aplicarFiltroBinario(){
    
    verificarFiltro();
    
    let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    let w = imageData.width;
    let h = imageData.height;
    
    for (let x = 0; x < w; x++){
      
      for (let y = 0; y < h; y++){
        
        let index = (x + w * y)*4;
        let r = getRed(index,imageData);
        let g = getGreen(index,imageData);
        let b = getBlue(index,imageData);
        
        if (((r + g + b)/3) <= 127){
          
          imageData.data[index + 0] = 0;
          imageData.data[index + 1] = 0;
          imageData.data[index + 2] = 0;
          
        }else{
          
          imageData.data[index + 0] = 255;
          imageData.data[index + 1] = 255;
          imageData.data[index + 2] = 255;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function cambiarContraste(){

    verificarFiltro();

    let rango = document.querySelector("#rangocontraste").value*1.0;
    let contraste = Math.tan(rango * Math.PI / 180.0);
    let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);

    for (y=0;y<canvas.height;y++){
        for (x=0;x<canvas.width;x++){
            let index=(x+y*imageData.width)*4;
            imageData.data[index+0]=rangeColor(128 + (imageData.data[index + 0] - 128) * contraste);
            imageData.data[index+1]=rangeColor(128 + (imageData.data[index + 1] - 128) * contraste);
            imageData.data[index+2]=rangeColor(128 + (imageData.data[index + 2] - 128) * contraste);
        }
    }
    
    ctx.putImageData(imageData,0,0);
  }

  function cambiarBrillo(){

    verificarFiltro();

    let k = document.querySelector("#rangobrillo").value*1.0;
    let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);

    for (y=0;y<canvas.height;y++){
        for (x=0;x<canvas.width;x++){
            let index=(x+y*imageData.width)*4;
            imageData.data[index+0]=rangeColor(imageData.data[index + 0] + k);
            imageData.data[index+1]=rangeColor(imageData.data[index + 1] + k);
            imageData.data[index+2]=rangeColor(imageData.data[index + 2] + k);
        }
    }
    
    ctx.putImageData(imageData,0,0);
  }

  function rangeColor(pixel) {

    if (pixel < 0)
        pixel = 0;
    if (pixel > 255)
        pixel = 255;

    return pixel;
  }

  canvasNuevo();
  document.querySelector('#nuevo').addEventListener('click',canvasNuevo);
  document.querySelector("#guardar").addEventListener("click",descargar);
  document.querySelector("#lapiz").addEventListener('click',dibujar);
  document.querySelector("#goma").addEventListener('click',gomaBorrar);
  document.querySelector("#rangocontraste").addEventListener('change',cambiarContraste);
  document.querySelector("#rangobrillo").addEventListener('change',cambiarBrillo);
  document.querySelector("#filtrogris").addEventListener('click',aplicarFiltroGris);
  document.querySelector("#filtronegativo").addEventListener('click',aplicarFiltroNegativo);
  document.querySelector("#filtrosepia").addEventListener('click',aplicarFiltroSepia);
  document.querySelector("#filtrobinario").addEventListener('click',aplicarFiltroBinario);
  
});