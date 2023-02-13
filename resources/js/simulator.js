import './fabric.js';
import { Drag } from './tools/Drag.js';
import { FreeCut } from './tools/FreeCut.js';
import { FreeDraw } from './tools/FreeDraw.js';
import { Rule } from './tools/Rule.js';
import { RuleCircle } from './tools/RuleCircle.js';
import { RuleTriangle } from './tools/RuleTriangle.js';
import { InitialRule } from './tools/InitialRule.js';
import { TriangleCut } from './tools/TriangleCut.js';

class Simulator {
    canvas;
    radiographyUrl;
    limitClipPathField;
    currentTool;
    firstLineMeasurePx;
    firstLineMeasureMm;
    constructor(radiographyUrl) {
        this.initConstructor(radiographyUrl);
    }

    async initConstructor(radiographyUrl) {
        this.firstLineMeasurePx = document.getElementById('simulator').dataset.firstlinemeasurepx ?? null;
        this.firstLineMeasureMm = document.getElementById('simulator').dataset.firstlinemeasuremm ?? null;
        fabric.Object.prototype.objectCaching = false;
        this.canvas = new fabric.Canvas('simulator', {
            selection: false,
            fireRightClick: true,
            fireMiddleClick: true,
            stopContextMenu: true,
            perPixelTargetFind: true,
            imageSmoothingEnabled: false
        });
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
            document.getElementsByClassName('botones-flotantes')[0].style.visibility = 'hidden';
            this.setCurrentTool(new InitialRule(this.canvas, true));
        } else {
            document.getElementsByClassName('wrapper')[0].style.visibility = 'hidden';
        }
        this.setCurrentTool(new Drag(this.canvas));
    }

    init() {
        window.onresize = () => this.setCanvasSize(this.canvas);
        this.updateImplants(document.getElementById('implant-type-selector').value);
        document.querySelectorAll('.offcanvas .offcanvas-header button.btn-close').forEach((e) => e.addEventListener('click', () => this.closeAllCanvas()));
        document.getElementById('button-offcanvas-opciones').addEventListener('click', () => this.offcanvasToggler('offcanvas-opciones'));
        document.getElementById('button-offcanvas-implants').addEventListener('click', () => this.offcanvasToggler('offcanvas-implants'));
        document.getElementById('button-offcanvas-herramientas').addEventListener('click', () => this.offcanvasToggler('offcanvas-herramientas'));
        document.getElementById('implant-type-selector').addEventListener('change', (e) => this.updateImplants(e.target.value));
        document.getElementById('rule').addEventListener('click', () => this.setCurrentTool(new Rule(this.canvas)));
        document.getElementById('rule-circle').addEventListener('click', () => this.setCurrentTool(new RuleCircle(this.canvas)));
        document.getElementById('rule-triangle').addEventListener('click', () => this.setCurrentTool(new RuleTriangle(this.canvas)));
        document.getElementById('free-draw').addEventListener('click', () => this.setCurrentTool(new FreeDraw(this.canvas)));
        document.getElementById('drag').addEventListener('click', () => this.setCurrentTool(new Drag(this.canvas)));
        document.getElementById('free-cut').addEventListener('click', () => this.setCurrentTool(new FreeCut(this.canvas)));
        document.getElementById('triangle-cut').addEventListener('click', () => this.setCurrentTool(new TriangleCut(this.canvas)));
        document.getElementById('rotate-implant').addEventListener('click', () => this.rotateAndFlipImplant());
        document.getElementById('opacity').addEventListener('change', (e) => this.applyFiltersToImplant());
        document.getElementById('frontalImplants').addEventListener('click', () => this.updateImplants(document.getElementById('implant-type-selector').value, true));
        document.getElementById('lateralImplants').addEventListener('click', () => this.updateImplants(document.getElementById('implant-type-selector').value, false));
    }

    setCanvasSize(canvas) {
        canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }

    setCurrentTool(tool) {
        this.canvas.currentTool = tool;
    }

    async addImplantObject(element) {
        let img = await this.loadImageFromUrl(element.querySelector('img').src);
        this.canvas.add(img);
        img.scaleToWidth((element.dataset.measure * this.firstLineMeasurePx) / this.firstLineMeasureMm);
        img.center();
        img.on("selected", () => this.offcanvasToggler('offcanvas-implants-settings', true));
        img.on("deselected", () => this.offcanvasToggler('offcanvas-implants-settings', false));
        img.on('selected', () => {
            document.getElementById('opacity').value = img.opacity;
        });
        this.canvas.currentTool.setDefaultObjectOptions(img);
        this.canvas.requestRenderAll();
        this.offcanvasToggler('offcanvas-implants', false);
    }

    async rotateAndFlipImplant() {
        let activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            if (activeObject.flipY) {
                activeObject.set({
                    flipY: false
                });
            } else {
                activeObject.set({
                    flipY: true
                });
            }
            this.canvas.requestRenderAll();
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

    updateImplants(implant_type_id, view = true) {
        fetch(`/api/implants?implant_type_id=${implant_type_id}`)
            .then(response => response.json())
            .then(result => {
                document.getElementById('implants').innerHTML = '';
                result.data.forEach(implant => {
                    document.getElementById('implants').innerHTML += `
                    <div class="block rounded-lg shadow-lg bg-white max-w-sm text-center card" data-measure="${implant.measureWidth}">
                        <div class="py-3 px-6 border-b border-gray-300">
                            <h5 style="color: black;">${implant.id} - ${implant.name}</h5>
                        </div>
                        <div class="p-6 h-40">
                            <img src="${view ? implant.aboveViewUrl : implant.lateralViewUrl}" class="h-full w-full">
                        </div>
                        <div class="py-3 px-6 border-t border-gray-300 text-gray-600">
                            ${implant.model} - ${implant.measureWidth}mm
                        </div>
                    </div>
                    `;
                })
            }).then(result => {
                document.querySelectorAll('.card').forEach(el => el.addEventListener('click', () => this.addImplantObject(el)));
            })
            .catch(error => console.log('error', error));
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
                applyFiltersToBackgroundImg(this.value);
            }
        document.getElementById('brightness').onchange = document.getElementById('brightness')
            .oninput = function () {
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
        clearInterval(interval)
    }
}, 0.5);