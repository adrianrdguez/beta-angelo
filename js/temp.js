function readFile(file) {
    return new Promise((resolve, reject) => {
        let fr = new FileReader();
        fr.onload = () => {
            resolve(fr.result)
        };
        fr.onerror = reject;
        fr.readAsDataURL(file);
    });
}

function loadStartCanvas(imgUploaded, contrast = 0, brightness = 0, blackWhite = false) {
    let fabricCanvas = document.getElementsByClassName('canvas-container');
    if (fabricCanvas.length) {
        fabricCanvas = fabricCanvas[0];
        let canvas = document.createElement('canvas');
        canvas.id = 'simulador';
        fabricCanvas.parentNode.insertBefore(canvas, fabricCanvas.nextSibling)
        fabricCanvas.remove();
    }

    fabric.Image.fromURL(imgUploaded, (img) => {
        img.filters.push(new fabric.Image.filters.Contrast({
            contrast: parseFloat(contrast)
        }));
        img.filters.push(new fabric.Image.filters.Brightness({
            brightness: parseFloat(brightness)
        }));
        if (blackWhite) {
            img.filters.push(new fabric.Image.filters.BlackWhite());
        }
        if (img.filters.length) {
            img.applyFilters();
        }
        simulator = new Simulator(img.toDataURL());
        simulator.init();
        document.getElementsByClassName('navigation')[0].style.visibility = 'visible';
    })
}

let simulator;
let imgUploaded = null;
let script = document.createElement("script");  // create a script DOM node
script.onload = function () {
    simulator = new Simulator('img/radiografia.png');
    simulator.init();
};
script.onerror = function () {
    document.getElementsByClassName('navigation')[0].style.visibility = 'hidden';
    let input = document.createElement('input');
    input.type = 'file';
    input.id = 'file';
    document.body.appendChild(input);
    input.onchange = async (evt) => {
        input.remove();
        let tgt = evt.target || window.event.srcElement;
        let files = tgt.files;
        if (FileReader && files && files.length) {
            imgUploaded = await readFile(files[0]);
            loadStartCanvas(imgUploaded);
        }
        document.getElementById('apply-filters').onclick = () => {
            loadStartCanvas(imgUploaded, document.getElementById('contrast').value, document.getElementById('brightness').value, document.getElementById('blackandwhite').checked)
        }
        document.getElementById('reset-filters').onclick = () => {
            let elements = document.getElementsByTagName('input');
            for (const element of elements) {
                element.value = 0;
                element.checked = false;
            }
            loadStartCanvas(imgUploaded)
        }
    }
}
script.src = 'js/disableStart.js';
document.body.appendChild(script);