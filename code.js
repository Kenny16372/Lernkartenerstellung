var data;
var compressed;

//Make the DIV element draggagle:

del = false;
bild = null;

var style = document.createElement("style");
var css = `html, body{
	overflow-x: hidden;
    padding: 0;
    margin: 0;
}

.fenster{
	position: relative;
	padding: 0  5px 5px 0;
	width: calc(100% - 5px);
    height: calc(100% - 5px);
    cursor: pointer;
}

.rahmen{
	position: absolute;
	background-color: white;
	border: 1px solid black;
}

.rahmen:active{
    background-color: RGBA(0,0,0,0);
}

#bildContainer{
	position: relative;
	width: calc(100vw - 3rem);
	float: right;
	padding: 1rem;
}

img{
	position: relative;
    width: 100%;
    user-select: none;
}`;
style.appendChild(document.createTextNode(css));

function makeDraggable(){
    var elmnts = document.getElementsByClassName("fenster");
    var arr = Array.prototype.slice.call(elmnts);
    arr.forEach(dragElement);
}

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    var bild = document.getElementById("bildContainer").getBoundingClientRect();
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    toPercent(elmnt);

    var rahmen = elmnt.parentElement;
    rahmen.style.top = (rahmen.offsetTop - pos2)/bild.height*100 + "%";
    rahmen.style.left = (rahmen.offsetLeft - pos1)/bild.width*100 + "%";

    var img = document.getElementById("bild").getBoundingClientRect();

    var left = img.x;
    var right = img.x + img.width;
    var top = img.y;
    var bottom = img.y + img.height;


    if(del == true && pos3 > left && pos4 > top && pos3 < right && pos4 < bottom){
        del = false;
        document.getElementsByTagName("body")[0].style.backgroundColor = "white";
    }

    if(pos3 < left || pos4 < top || pos3 > right || pos4 > bottom){
        del = true;
        document.getElementsByTagName("body")[0].style.backgroundColor = "tomato";
    }
  }



  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;

    if(del == true){
        elmnt.parentElement.parentNode.removeChild(elmnt.parentElement);
        del = false;
        document.getElementsByTagName("body")[0].style.backgroundColor = "white";
    }
  }
}

function toPercent(elmnt){
    var bild = document.getElementById("bildContainer").getBoundingClientRect();
    var box = elmnt.parentElement.getBoundingClientRect();
    var width = box.width - 2; // border
    var height = box.height - 2; // border
    elmnt.parentElement.style.width = width/bild.width*100 + "%";
    elmnt.parentElement.style.height = height/bild.height*100 + "%";

    var left = box.left - bild.left;
    var top = box.top - bild.top;

    elmnt.parentElement.style.left = left/bild.width*100 + "%";
    elmnt.parentElement.style.top = top/bild.height*100 + "%";
}

function save(){
    // fenster width und height in %
    var elmnts = document.getElementsByClassName("fenster");
    arr = Array.prototype.slice.call(elmnts);
    arr.forEach(toPercent);

    var title = document.getElementById("title").value;

    elmnts = document.getElementsByClassName("edit");
    arr = Array.prototype.slice.call(elmnts);
    arr.forEach(function(elmnt){
        elmnt.parentNode.removeChild(elmnt);
    });
    document.head.appendChild(style);
    var html = "<!doctype html>\n" + document.documentElement.outerHTML;
	html = html.replace(/<script[\s\S]*<\/script>/g, "");
	html = html.replace(/<title>[\s\S]*<\/title>/, "<title>" + (title != "" ? title : "Lernkarte") + "</title>");
    html = html.replace(/<link rel="stylesheet" href="css\/edit.css">/u, "");
    html = html.replace(/<body onload="makeDraggable();loaded();">/uig, "<body>");
    if(title == ""){
        title = "webpage";
	}

    download(html, title + ".html", "text/html");

    location.reload();

    function download(data, filename, type) {
        var file = new Blob([data], {type: type});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }
}

async function newImg(){
    var elmnts = document.getElementsByClassName('rahmen');
    var arr = Array.prototype.slice.call(elmnts);
    arr.forEach(function(el){
        el.parentNode.removeChild(el);
    });

    var img = document.getElementById("bild");
    var input = document.getElementById("img");
    var data = await toBase64(input.files[0]);

    img.src = data;
    makeDraggable();
}

function plus(pos){
    let bildContainer = document.getElementById("bildContainer");
    var rahmen = document.createElement("div");
    rahmen.classList.add("rahmen");

    if(pos == undefined){
        rahmen.style = "left: 50%; top: 50%; width: 20%; height: 20%";
    }
    else{
        var width = pos[1] - pos[0];
        var height = pos[3] - pos[2];
        rahmen.style = "left: calc(1rem + " + pos[0] + "px); top: calc(1rem + " + pos[2] + "px); width: " + width + "px; height: " + height + "px;";
    }
    var fenster = document.createElement("div");
    fenster.classList.add("fenster");
    rahmen.appendChild(fenster);
    bildContainer.appendChild(rahmen);
    toPercent(fenster);
    makeDraggable();
}

function rotateCW(){
    var img = document.getElementById('bild');
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    drawRotated(canvas, context, img, 90);

    var src = canvas.toDataURL();
    img.src = src;
}

function rotateCCW(){
    var img = document.getElementById('bild');
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    drawRotated(canvas, context, img, -90);

    var src = canvas.toDataURL();
    img.src = src;
}

function drawRotated(canvas, context, image, degrees){
    context.clearRect(0,0,canvas.width,canvas.height);

    canvas.width = image.naturalHeight;
    canvas.height = image.naturalWidth;

    // save the unrotated context of the canvas so we can restore it later
    // the alternative is to untranslate & unrotate after drawing
    context.save();

    // move to the center of the canvas
    context.translate(canvas.width/2,canvas.height/2);

    // rotate the canvas to the specified degrees
    context.rotate(degrees*Math.PI/180);

    // draw the image
    // since the context is rotated, the image will be rotated also
    context.drawImage(image,-image.naturalWidth/2,-image.naturalHeight/2);

    // we’re done with the rotating so restore the unrotated context
    context.restore();
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

function imageToBase64(image){
    var canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    var context = canvas.getContext("2d");
    context.clearRect( 0, 0, context.canvas.width, context.canvas.height);
    context.drawImage(image, 0, 0, context.canvas.width, context.canvas.height);
    return canvas.toDataURL();
}

function loaded(){
    var btn = document.getElementById("click");
    btn.addEventListener('click', click);

    inputsChanged();
    changed();
}

var params = {
    threshold: 150,
    eps: 29,
    minPts: 7,
    dia: 5,
    amt: 0
}



async function changed() {
  var input = document.getElementById("file");
  var img = document.getElementById("bild");
  var file = input.files[0];
  data = img.src;
  if(file){
      data = await toBase64(file);
      img.src = data;
  }
}

function click(){
    var elmnts = document.getElementsByClassName('rahmen');
    var arr = Array.prototype.slice.call(elmnts);
    arr.forEach(function(el){
        el.parentNode.removeChild(el);
    });

    outputRects = {};

    compressed = compress(data);

    textSegment(compressed, params.threshold, params.eps, params.minPts, params.dia, params.amt);
    getOutput();
}

function compress(url){
    let width = 800;
    var image = new Image();
    image.src = url;
    let ratio = image.height / image.width;
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = width * ratio;
    
    var context = canvas.getContext("2d");
    context.clearRect( 0, 0, context.canvas.width, context.canvas.height);
    context.drawImage(image, 0, 0, context.canvas.width, context.canvas.height);
    return canvas.toDataURL();
}

function getOutput(){
    if(isEmpty(outputRects)){
        window.setTimeout(getOutput, 100);
    }
    else{
        drawBoxes();
    }

    function isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
}

function drawBoxes(){
    var compressedImg = new Image();
    compressedImg.src = compressed;

    let img = document.getElementById("bild");
    let ratioX = img.width / compressedImg.width;
    let ratioY = img.height / compressedImg.height;
    for(key in outputRects){
        var box = outputRects[key];
        box[0] = box[0] * ratioX;
        box[2] = box[2] * ratioX;
        box[1] = box[1] * ratioY;
        box[3] = box[3] * ratioY;
        plus(box);
    }
}

function inputsChanged(){
    params.threshold = Number(document.getElementById('threshold').value);
    params.eps = Number(document.getElementById('eps').value);
    params.minPts = Number(document.getElementById('minPts').value);
}

makeDraggable();
loaded();