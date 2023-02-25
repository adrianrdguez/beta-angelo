import { fabric } from 'fabric';
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
    initialLine;
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
        document.getElementById('rotate-implant').addEventListener('click', () => this.rotateAndFlipImplant());
        document.getElementById('opacity').addEventListener('change', (e) => this.applyFiltersToImplant());
        document.getElementById('frontalImplants').addEventListener('click', () => this.updateImplants(document.getElementById('implant-type-selector').value, document.getElementById('implant-sub-type-selector').value, true));
        document.getElementById('lateralImplants').addEventListener('click', () => this.updateImplants(document.getElementById('implant-type-selector').value, document.getElementById('implant-sub-type-selector').value, false));
    }

    setCanvasSize(canvas) {
        canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }

    setCurrentTool(tool) {
        this.canvas.currentTool = tool;
    }

    getCenterOfView(object = null) {
        let zoom=this.canvas.getZoom();
        return {
            left: (fabric.util.invertTransform(this.canvas.viewportTransform)[4]+(this.canvas.width/zoom)/2) - (object ? (object.width / 2) : 0),
            top: (fabric.util.invertTransform(this.canvas.viewportTransform)[5]+(this.canvas.height/zoom)/2) - (object ? (object.height / 2) : 0)
        };
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

    updateImplants(implant_type_id, implant_sub_type_id, view = true) {
        fetch(`/api/implants?implant_type_id=${implant_type_id}&implant_sub_type_id=${implant_sub_type_id}`)
            .then(response => response.json())
            .then(result => {
                if (Array.isArray(result.data) && result?.success !== false) {
                    document.getElementById('implants').innerHTML = '';
                    result.data.forEach(implant => {
                        document.getElementById('implants').innerHTML += `
                        <div class="block rounded-lg shadow-lg bg-white max-w-sm text-center card" data-measure="${implant.measureWidth}">
                            <div class="py-3 px-6 border-b border-gray-300">
                                <h5 style="color: black;">${implant.id} - ${implant.name}</h5>
                            </div>
                            <div class="p-6 h-40">
                                <img data-above=${implant.aboveViewUrl} data-lateral=${implant.aboveViewUrl} src="${view ? implant.aboveViewUrl : implant.lateralViewUrl}" class="h-full w-full">
                            </div>
                            <div class="py-3 px-6 border-t border-gray-300 text-gray-600">
                                ${implant.model} - ${implant.measureWidth}mm
                            </div>
                        </div>
                        `;
                    })
                } else {
                    document.getElementById('implants').innerHTML = '<p class="text-white">Ha habido un error.</p>';
                }
            }).then(result => {
                document.querySelectorAll('.card').forEach(el => el.addEventListener('click', () => this.addImplantObject(el)));
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
        clearInterval(interval);
    }
}, 0.5);