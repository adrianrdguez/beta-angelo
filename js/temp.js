function readFile(file) {
    return new Promise((resolve, reject) => {
        let fr = new FileReader();
        fr.onload = () => {
            resolve(fr.result);
        };
        fr.onerror = reject;
        fr.readAsDataURL(file);
    });
}

function applyFiltersToBackgroundImg(contrast = null, brightness = null, grayscale = null) {
    let backgroundImg = simulator.canvas.getObjects()[0];
    backgroundImg.filters[0].contrast = contrast ?? backgroundImg.filters[0].contrast;
    backgroundImg.filters[1].brightness = brightness ?? backgroundImg.filters[1].brightness;
    if (grayscale === true) {
        backgroundImg.filters.push(new fabric.Image.filters.Grayscale());
    } else if (grayscale === false && backgroundImg.filters.length > 2) {
        backgroundImg.filters.pop();
    }
    backgroundImg.applyFilters();
    simulator.canvas.requestRenderAll();
}

async function loadStartCanvas(imgUploaded) {
    simulator = new Simulator(imgUploaded);
    simulator.init();
    let interval = setInterval(() => {
        let backgroundImg = simulator.canvas.getObjects()[0];
        if (backgroundImg) {
            backgroundImg.filters.push(new fabric.Image.filters.Contrast({
                contrast: 0
            }));
            backgroundImg.filters.push(new fabric.Image.filters.Brightness({
                brightness: 0
            }));
            backgroundImg.applyFilters();
            document.getElementById('contrast').onchange = document.getElementById('contrast').oninput = function () {
                applyFiltersToBackgroundImg(this.value);
            }
            document.getElementById('brightness').onchange = document.getElementById('brightness').oninput = function () {
                applyFiltersToBackgroundImg(null, this.value);
            }
            document.getElementById('blackandwhite').onchange = function () {
                applyFiltersToBackgroundImg(null, null, this.checked);
            }
            document.getElementById('pincelcolor').onchange = function () {
                simulator.canvas.currentTool.setBrushOptions();
            }
            document.getElementById('pincelsize').onchange = function () {
                simulator.canvas.currentTool.setBrushOptions();
            }
            document.getElementById('reset-filters').onclick = () => {
                let elements = document.getElementsByTagName('input');
                for (const element of elements) {
                    element.value = 0;
                    element.checked = false;
                    if (element.id === 'pincelsize') {
                        element.value = 1;
                    }
                    if (element.id === 'pincelcolor') {
                        element.value = '#FF0000';
                    }
                }
                applyFiltersToBackgroundImg(0, 0, false);
            }
            document.getElementsByClassName('botones-flotantes')[0].style.visibility = 'visible';
            clearInterval(interval);
        }
    }, 0.5);

}

let simulator;
let imgUploaded = null;
let script = document.createElement("script");  // create a script DOM node
script.onload = function () {
    loadStartCanvas('img/radiografia.png')
};
script.onerror = function () {
    document.getElementsByClassName('botones-flotantes')[0].style.visibility = 'hidden';
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
    }
}
script.src = 'js/disableStart.js';
document.body.appendChild(script);