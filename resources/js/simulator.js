import './fabric.js';
import { Drag } from './tools/Drag.js';
import { FreeCut } from './tools/FreeCut.js';
import { FreeDraw } from './tools/FreeDraw.js';
import { Implant } from './tools/Implant.js';
import { Rule } from './tools/Rule.js';
import { RuleCircle } from './tools/RuleCircle.js';
import { RuleTriangle } from './tools/RuleTriangle.js';
import { InitialRule } from './tools/InitialRule.js';

class Simulator {
    canvas;
    radiographyUrl;
    limitClipPathField;
    currentTool;
    measure;
    firstLineMeasure;
    constructor(radiographyUrl) {
        this.initConstructor(radiographyUrl);
    }

    async initConstructor(radiographyUrl) {
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
        if (this.measure == undefined) {
            document.getElementsByClassName('botones-flotantes')[0].style.visibility = 'hidden';

        }
        this.setCurrentTool(new InitialRule(this.canvas, true));
        this.setCurrentTool(new Drag(this.canvas))
    }

    init() {
        window.onresize = () => this.setCanvasSize(this.canvas);
        document.querySelectorAll('#implants .card').forEach(el => el.addEventListener('click', () => this.addImplantObject(el)));
        document.getElementById('rule').addEventListener('click', () => this.setCurrentTool(new Rule(this.canvas)));
        document.getElementById('rule-circle').addEventListener('click', () => this.setCurrentTool(new RuleCircle(this.canvas)));
        document.getElementById('rule-triangle').addEventListener('click', () => this.setCurrentTool(new RuleTriangle(this.canvas)));
        document.getElementById('free-draw').addEventListener('click', () => this.setCurrentTool(new FreeDraw(this.canvas)));
        document.getElementById('drag').addEventListener('click', () => this.setCurrentTool(new Drag(this.canvas)));
        document.getElementById('free-cut').addEventListener('click', () => this.setCurrentTool(new FreeCut(this.canvas)));
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
        img.center();
        this.canvas.currentTool.setDefaultObjectOptions(img);
        this.canvas.requestRenderAll();
        document.getElementById('implants').classList.remove('show');
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