import { fabric } from 'fabric';
import { Drag } from './tools/Drag.js';
import { FreeCut } from './tools/FreeCut.js';
import { FreeDraw } from './tools/FreeDraw.js';
import { Rule } from './tools/Rule.js';
import { RuleCircle } from './tools/RuleCircle.js';
import { RuleTriangle } from './tools/RuleTriangle.js';
import { InitialRule } from './tools/InitialRule.js';
import { TriangleCut } from './tools/TriangleCut.js';
import { CircleCut } from './tools/CircleCut.js';

class Simulator {
    canvas;
    radiographyUrl;
    limitClipPathField;
    currentTool;
    initialLine;
    firstLineMeasurePx;
    firstLineMeasureMm;
    lineAngles = {};
    constructor(radiographyUrl) {
        this.initConstructor(radiographyUrl);
    }

    async initConstructor(radiographyUrl) {
        this.firstLineMeasurePx = document.getElementById('simulator').dataset.firstlinemeasurepx ?? null;
        this.firstLineMeasureMm = document.getElementById('simulator').dataset.firstlinemeasuremm ?? null;
        fabric.Object.prototype.objectCaching = false;
        fabric.Object.prototype.fontFamily = 'Nunito';
        this.canvas = new fabric.Canvas('simulator', {
            selection: false,
            fireRightClick: true,
            fireMiddleClick: true,
            stopContextMenu: true,
            perPixelTargetFind: true,
            imageSmoothingEnabled: false,
            imageSmoothingQuality: 'high',
            preserveObjectStacking: true
        });
        /* if (document.getElementById('simulator').dataset.json) {
            let json = JSON.parse(document.getElementById('simulator').dataset.json);
            this.canvas.loadFromJSON(json, () => this.canvas.renderAll.bind(this.canvas));
        } */
        this.radiographyUrl = radiographyUrl;
        this.setCanvasSize(this.canvas);
        let img = await this.loadImageFromUrl(this.radiographyUrl);
        let imageTextureSize = img.width > img.height ? img.width : img.height;
        if (imageTextureSize > fabric.textureSize) {
            fabric.textureSize = imageTextureSize;
        }
        this.canvas.add(img);
        img.center();
        this.limitClipPathField = new fabric.Rect({
            width: img.width + 1,
            height: img.height + 1,
            top: img.top - 1,
            left: img.left - 1,
            absolutePositioned: true
        });
        this.setBackgroundOptions(img);
        this.canvas.simulator = this;
        if (!this.firstLineMeasureMm && !this.firstLineMeasurePx) {
            document.getElementById('botones-flotantes').classList.add('invisible');
            this.setCurrentTool(new InitialRule(this.canvas));
        } else {
            this.closeAllCanvas();
            this.setCurrentTool(new Drag(this.canvas));
        }
    }

    init() {
        window.onresize = () => this.setCanvasSize(this.canvas);
        document.getElementById('measure-input').addEventListener('keyup', (e) => { e.key === 'Enter' ? this.setUpMeasure() : null });
        document.getElementById('measure-input-button').addEventListener('click', () => this.setUpMeasure());
        document.querySelectorAll('.offcanvas .offcanvas-header button.btn-close').forEach((e) => e.addEventListener('click', () => this.closeAllCanvas()));
        document.getElementById('button-offcanvas-opciones').addEventListener('click', () => this.offcanvasToggler('offcanvas-opciones'));
        document.getElementById('button-offcanvas-implants').addEventListener('click', () => this.offcanvasToggler('offcanvas-implants'));
        document.getElementById('button-offcanvas-herramientas').addEventListener('click', () => this.offcanvasToggler('offcanvas-herramientas'));
        document.getElementById('implant-type-selector').addEventListener('change', (e) => this.updateSubTypeSelect('implant-sub-type-selector', e.target.value));
        document.getElementById('implant-sub-type-selector').addEventListener('change', (e) => this.updateImplants(document.getElementById('implant-type-selector').value, e.target.value));
        document.getElementById('rule').addEventListener('click', () => this.setCurrentTool(new Rule(this.canvas)));
        document.getElementById('rule-circle').addEventListener('click', () => this.setCurrentTool(new RuleCircle(this.canvas)));
        document.getElementById('rule-triangle').addEventListener('click', () => this.setCurrentTool(new RuleTriangle(this.canvas)));
        document.getElementById('free-draw').addEventListener('click', () => this.setCurrentTool(new FreeDraw(this.canvas)));
        document.getElementById('drag').addEventListener('click', () => this.setCurrentTool(new Drag(this.canvas)));
        document.getElementById('free-cut').addEventListener('click', () => this.setCurrentTool(new FreeCut(this.canvas)));
        document.getElementById('triangle-cut').addEventListener('click', () => this.setCurrentTool(new TriangleCut(this.canvas)));
        document.getElementById('circle-cut').addEventListener('click', () => this.setCurrentTool(new CircleCut(this.canvas)));
        document.getElementById('rotate-implant-right').addEventListener('click', () => {
            this.rotateAndFlipImplant('right');
        });

        document.getElementById('rotate-implant-left').addEventListener('click', () => {
            this.rotateAndFlipImplant('left');
        });

        document.getElementById('opacity').addEventListener('input', (e) => this.applyFiltersToImplant());
        document.getElementById('angle-input').addEventListener('input', () => this.setCircleCutOptions('angle-input'));
        document.getElementById('radius-input').addEventListener('input', () => this.setCircleCutOptions('radius-input'));
        document.getElementById('undo-drawing').addEventListener('click', () => this.undoLastDraw());
        document.getElementById('clear-drawing').addEventListener('click', () => this.clearDraws());
        document.addEventListener('keydown', (event) => {
            if (event.key === 'l' || event.key === 'L') {
                this.setCurrentTool(new Rule(this.canvas));
            }
        });
        this.setCircleCutOptions('angle-input')
        this.setCircleCutOptions('radius-input')
    }

    setCanvasSize(canvas) {
        canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }

    setCurrentTool(tool) {
        this.canvas.currentTool = tool;
    }

    getCenterOfView(object = null) {
        let zoom = this.canvas.getZoom();
        return {
            left: (fabric.util.invertTransform(this.canvas.viewportTransform)[4] + (this.canvas.width / zoom) / 2) - (object ? (object.width / 2) : 0),
            top: (fabric.util.invertTransform(this.canvas.viewportTransform)[5] + (this.canvas.height / zoom) / 2) - (object ? (object.height / 2) : 0)
        };
    }

    async addImplantObject(element) {
        let img = await this.loadImageFromUrl(element.src);
        img.allowRotation = parseInt(element.dataset.allow_rotation);
        this.canvas.add(img);
        img.scale(((element.dataset.measure * this.firstLineMeasurePx) / this.firstLineMeasureMm) / img.width);
        img.set(this.getCenterOfView());
        img.on("selected", () => this.offcanvasToggler('offcanvas-implants-settings', true));
        img.on("deselected", () => this.offcanvasToggler('offcanvas-implants-settings', false));
        img.on('selected', () => {
            document.getElementById('opacity').value = img.opacity;
            if (img.allowRotation) {
                document.getElementById('rotate-implant').classList.remove('invisible');
            } else {
                document.getElementById('rotate-implant').classList.add('invisible');
            }
        });
        this.canvas.currentTool.setDefaultObjectOptions(img);
        this.canvas.requestRenderAll();
        this.canvas.setViewportTransform(this.canvas.viewportTransform);
        this.offcanvasToggler('offcanvas-implants', false);
    }

    async swapSrcImg(element) {
        let img = element.parentElement.parentElement.parentElement.querySelector('img');
        if (img.dataset.selected === img.dataset.above) {
            img.src = img.dataset.selected = img.dataset.lateral;
        } else if (img.dataset.selected === img.dataset.lateral) {
            img.src = img.dataset.selected = img.dataset.above;
        }
    }

    async rotateAndFlipImplant(direction) {
        let activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            if (direction === 'left') {
                activeObject.set({ flipY: !activeObject.flipY });
            } else if (direction === 'right') {
                activeObject.set({ flipY: !activeObject.flipY });
            }
            this.canvas.requestRenderAll();
        }
        this.updateButtonStatus();
    }

    async updateButtonStatus() {
        if (this.addImplantObject()) {
            document.getElementById('flip-implant-left').disabled = true;
            document.getElementById('flip-implant-right').disabled = false;
        } else {
            document.getElementById('flip-implant-left').disabled = false;
            document.getElementById('flip-implant-right').disabled = true;
        }
    }

    async applyFiltersToImplant() {
        let activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            let opacity = document.getElementById('opacity').value;
            activeObject.set({
                opacity: opacity
            });
            this.canvas.requestRenderAll();
        }
    }

    async loadImageFromUrl(image_url) {
        return new Promise(function (resolve, reject) {
            try {
                fabric.Image.fromURL(image_url, function (image) {
                    resolve(image);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    setBackgroundOptions(object) {
        object.set({
            centeredRotation: false,
            centeredScaling: false,
            evented: false,
            hasBorders: false,
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingFlip: true,
            lockScalingX: true,
            lockScalingY: true,
            lockSkewingX: true,
            lockSkewingY: true,
            selectable: false,
        });
        // Descomentar para limitar los objetos a la imagen
        // object.clipPath = this.limitClipPathField;
    }

    updateImplants(implant_type_id, implant_sub_type_id) {
        fetch(`/api/implants?implant_type_id=${implant_type_id}&implant_sub_type_id=${implant_sub_type_id}&user_id=${document.getElementById('body').dataset.userid}`)
            .then(response => response.json())
            .then(result => {
                if (Array.isArray(result.data) && result?.success !== false) {
                    document.getElementById('implants').innerHTML = '';
                    result.data.forEach(implant => {
                        document.getElementById('implants').innerHTML += `
                        <div class="block rounded-lg shadow-lg bg-white max-w-sm text-center card">
                            <div class="py-3 px-6 border-b border-gray-300">
                                <h5 style="color: black;">${implant.name}</h5>
                            </div>
                            <div class="p-6">
                                <img
                                    data-measure="${implant.measureWidth}"
                                    data-selected="${implant?.aboveViewUrl}"
                                    data-above="${implant?.aboveViewUrl}"
                                    data-lateral="${implant?.lateralViewUrl}"
                                    data-allow_rotation="${implant?.allowRotation}"
                                    src="${implant?.aboveViewUrl ?? implant?.lateralViewUrl}"
                                    class="w-full"
                                >
                            </div>
                            <div class="py-3 px-6 border-t border-gray-300 text-gray-600">
                                Ref.: ${implant.model}
                            </div>
                            <div class="flex items-center justify-center mb-4 ${implant?.aboveViewUrl && implant?.lateralViewUrl ? '' : 'hidden'}">
                                <div class="inline-flex">
                                    <button type="button"
                                        class="rounded px-6 py-2 border border-gray-600 text-gray-600 font-medium text-xs leading-tight uppercase hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">
                                        <i class="fa-solid fa-camera-rotate"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        `;
                    })
                } else {
                    document.getElementById('implants').innerHTML = '<p class="text-white">Ha habido un error.</p>';
                }
            }).then(result => {
                document.querySelectorAll('.card img').forEach(el => el.addEventListener('click', () => this.addImplantObject(el)));
                document.querySelectorAll('.card button').forEach(el => el.addEventListener('click', () => this.swapSrcImg(el)));
            })
            .catch(error => console.log('error', error));
    }

    updateSubTypeSelect(selectInput, implant_type_id, implant_sub_type_id = null) {
        fetch(`/api/implantSubTypes?implant_type_id=${implant_type_id}`)
            .then(response => response.json())
            .then(result => {
                if (Array.isArray(result.data) && result?.success !== false) {
                    let select = document.getElementById(selectInput);
                    select.innerHTML = '<option selected disabled hidden>Selecciona un subtipo</option>';
                    result.data.forEach(implantSubType => {
                        select.innerHTML += `
                        <option value="${implantSubType.id}">${implantSubType.name}</option>
                        `;
                    })
                }
            }).catch(error => console.log('error', error));
    }

    setUpMeasure() {
        let px = this.initialLine.calculate(this.initialLine.element.line.points[0].x, this.initialLine.element.line.points[0].y, this.initialLine.element.line.points[1].x, this.initialLine.element.line.points[1].y).toFixed(2);
        this.firstLineMeasurePx = px;
        this.firstLineMeasureMm = document.getElementById('measure-input').value;
        let body = JSON.stringify({
            "firstLineMeasurePx": this.firstLineMeasurePx,
            "firstLineMeasureMm": this.firstLineMeasureMm
        });
        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        let requestOptions = {
            method: 'PUT',
            headers: headers,
            body: body
        };
        let projectId = document.getElementById('body').dataset.projectid;
        let mediaId = document.getElementById('body').dataset.mediaid;
        fetch(`/api/project/${projectId}/image/${mediaId}`, requestOptions)
            .catch(error => console.log('error', error));
        this.offcanvasToggler('offcanvas-initial-settings', false);
        document.getElementById('botones-flotantes').classList.remove('invisible');
        this.canvas.remove(this.initialLine.element.line);
    }

    offcanvasToggler(id, open = null) {
        let offcanvas = document.getElementById(id);
        if (open === null) {
            if (offcanvas.classList.contains('show')) {
                this.offcanvasToggler(id, false);
            } else {
                this.offcanvasToggler(id, true);
            }
        } else if (open) {
            this.closeAllCanvas();
            let body = document.getElementById('body');
            body.style.overflow = 'hidden';
            body.style.paddingRight = '0px';
            offcanvas.style.visibility = 'visible';
            offcanvas.classList.add('show');
            offcanvas.removeAttribute('arial-hidden');
            offcanvas.setAttribute('arial-modal', 'true');
            offcanvas.setAttribute('role', 'dialog');
        } else {
            document.getElementById('body').removeAttribute('style');
            offcanvas.classList.remove('show');
            offcanvas.style.visibility = 'hidden';
            offcanvas.removeAttribute('arial-modal');
            offcanvas.removeAttribute('role');
            offcanvas.setAttribute('arial-hidden', 'true');
            document.querySelector('.offcanvas-backdrop')?.remove();
        }
    }

    closeAllCanvas() {
        let allOffcanvas = document.getElementsByClassName('offcanvas');
        for (const offcanvas of allOffcanvas) {
            this.offcanvasToggler(offcanvas.id, false);
        }
    }

    setCircleCutOptions(id) {
        let radioRanges = [10, 12, 15, 18, 21, 24, 27, 30];
        let input = document.querySelector('#' + id);
        let bubble = document.querySelector('#' + id + '-value');
        let tool = this.canvas.getActiveObject()?.tool;
        if (tool) {
            if (input.max !== '359') {
                tool.element.line.points[0].x = 0;
                tool.element.line.points[1].y = 0;
                tool.element.line.points[1].x = (tool.element.line.points[1].x < 0 ? -1 : 1) * ((radioRanges[input.value]) * this.firstLineMeasurePx) / this.firstLineMeasureMm;
                tool.movingControlPointsCallback(true);
            } else {
                tool.element.semicircle.endAngle = (input.value / 2);
                tool.element.semicircle.startAngle = -input.value / 2;
                tool.element.semicircle.input = input.value;
            }
            this.canvas.requestRenderAll();
        }
        bubble.textContent = input.id === 'radius-input' ? radioRanges[input.value] + 'mm' : input.value + 'º';
        const percent = (input.value - input.min) / (input.max - input.min);
        const x = percent * input.offsetWidth - bubble.offsetWidth / 2;
        bubble.style.left = `${x}px`;
        bubble.style.top = `-4px`;
    };

    undoLastDraw() {
        let path = this.canvas.getObjects('path').pop();
        if (path) {
            this.canvas.remove(path);
        }
    }

    clearDraws() {
        for (let path of this.canvas.getObjects('path')) {
            this.canvas.remove(path);
        }
    }

}

function applyFiltersToBackgroundImgs(contrast = null, brightness = null, grayscale = null) {
    let imgs = simulator.canvas.getObjects('image').filter(img => img.filters.length !== 0);
    for (const img of imgs) {
        img.filters[0].contrast = contrast ?? img.filters[0].contrast;
        img.filters[1].brightness = brightness ?? img.filters[1].brightness;
        if (grayscale === true) {
            img.filters.push(new fabric.Image.filters.Grayscale());
        } else if (grayscale === false && img.filters.length > 2) {
            img.filters.pop();
        }
        img.applyFilters();
    }
    simulator.canvas.requestRenderAll();
}

let img = document.getElementById('simulator').dataset.img;
let simulator = new Simulator(img);
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
        document.getElementById('contrast').onchange = document.getElementById('contrast').oninput =
            function () {
                applyFiltersToBackgroundImgs(this.value);
            }
        document.getElementById('brightness').onchange = document.getElementById('brightness')
            .oninput = function () {
                applyFiltersToBackgroundImgs(null, this.value);
            }
        document.getElementById('blackandwhite').onchange = function () {
            applyFiltersToBackgroundImgs(null, null, this.checked);
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
                    element.value = '#00ff00';
                }
            }
            applyFiltersToBackgroundImgs(0, 0, false);
        }
        document.getElementById('save-exit').onclick = async function () {
            // Todo: Save canvas to json in database
            let projectId = document.getElementById('body').dataset.projectid;
            let canvas = document.getElementById('simulator');
            let zoom = getZoomLevel(canvas); // Get the current zoom level

            let blob = await (await fetch(canvas.toDataURL())).blob();
            let formData = new FormData();
            formData.append("radiographyImg", blob, canvas.dataset.name);
            formData.append("name", canvas.dataset.name);
            formData.append("rotation", 0);
            formData.append("zoom", zoom); // Append the zoom level to the form data

            let requestOptions = {
                method: 'POST',
                body: formData,
            };
            fetch(`/api/project/${projectId}/image`, requestOptions)
                .catch(error => console.log('error', error));
            window.location.href = `/project/${projectId}`;
        }
        document.getElementById('delete-text').onclick = async function () {
            var objects = simulator.canvas.getObjects();
            for (var i = 1; i < objects.length; i++) {
                if (objects[i].text && objects[i].opacity !== 0) {
                    objects[i].opacity = 0; // Set opacity to 0 (completely invisible)
                }
            }
            simulator.canvas.requestRenderAll();
        };

        document.getElementById('add-text').onclick = async function () {
            var objects = simulator.canvas.getObjects();
            for (var i = 1; i < objects.length; i++) {
                if (objects[i].text) {
                    if (objects[i].opacity === 0) {
                        objects[i].opacity = 1; // Set opacity to 1 (fully visible)
                    } else {
                        objects[i].opacity = 0; // Set opacity to 0 (completely invisible)
                    }
                }
            }
            simulator.canvas.requestRenderAll();
        };




        function getZoomLevel(element) {
            let zoom = 1;
            let transformStyle = window.getComputedStyle(element).getPropertyValue('transform');
            if (transformStyle && transformStyle !== 'none') {
                let matrix = transformStyle.match(/^matrix\(([^\(]*)\)$/);
                if (matrix && matrix[1]) {
                    let values = matrix[1].split(',');
                    zoom = parseFloat(values[0]);
                }
            }
            return zoom;
        }
        clearInterval(interval);
    }
}, 0.5);