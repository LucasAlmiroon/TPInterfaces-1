document.addEventListener ("DOMContentLoaded", function(){

  let canvas = document.querySelector("#canvas");
  let ctx = canvas.getContext("2d");
  let input = document.querySelector('#inputGroupFile01');
  let nuevo = document.querySelector('#nuevo');
  let guardar = document.querySelector("#guardar");
  let lapiz = document.querySelector("#lapiz");
  let goma = document.querySelector("#goma");
  let botonfiltrogris = document.querySelector("#filtrogris");
  let botonfiltronegativo = document.querySelector("#filtronegativo");
  let botonfiltrosepia = document.querySelector("#filtrosepia");
  let botonfiltrobinario = document.querySelector("#filtrobinario");
  let cw = canvas.width;
  let ch = canvas.height;
  let gomaActiva = false;
  let lapizActivo = false;
  

  input.onchange = e =>{cargarImagen(e)}
  
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
          ctx.lineTo(m.x, m.y);
          if (lapizActivo){
            let color = document.querySelector("#colorLapiz").value;
            ctx.strokeStyle = color;
          }
          ctx.stroke();
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
    canvas.addEventListener('mousedown', e => {
      borrando = true;
    });

    canvas.addEventListener("mousemove", e => {
        if (borrando) {
          let m = oMousePos(canvas, e);   
          ctx.fillStyle ="white";
          let rangogoma = document.querySelector("#rangogoma");
          ctx.fillRect(m.x,m.y,rangogoma.value,rangogoma.value);
        }
    });

    canvas.addEventListener('mouseup', e => {
      borrando = false;
    });
  }

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

      }
    }
  }

  function aplicarFiltroNegativo(){
    
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
            
            ctx.putImageData(imageData, 0, 0);          
        }
    }
  }

  function aplicarFiltroGris(){
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
            
            ctx.putImageData(imageData, 0, 0);            
        }
    }
  }

  function aplicarFiltroSepia(){
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
            
            ctx.putImageData(imageData, 0, 0);            
        }
    }
  }

  function aplicarFiltroBinario(){
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
        ctx.putImageData(imageData, 0, 0);
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
        ctx.putImageData(imageData,x,y);
      }
    }
    canvas.width = cw;
    canvas.height = ch;
    ctx.fillStyle ="white";
    ctx.fillRect(0,0,cw,ch);
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

  function descargar(){	
    var dataURL = canvas.toDataURL("image/jpeg", 1.0);

    downloadImage(dataURL, 'imagen.jpeg');
  }

  function downloadImage(data, filename = 'untitled.jpeg') {
      var a = document.createElement('a');
      a.href = data;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
  }

  canvasNuevo();
  
  nuevo.addEventListener('click',canvasNuevo);
  guardar.addEventListener("click",descargar);
  lapiz.addEventListener('click',dibujar);
  goma.addEventListener('click',gomaBorrar);
  botonfiltrogris.addEventListener('click',aplicarFiltroGris);
  botonfiltronegativo.addEventListener('click',aplicarFiltroNegativo);
  botonfiltrosepia.addEventListener('click',aplicarFiltroSepia);
  botonfiltrobinario.addEventListener('click',aplicarFiltroBinario);
});