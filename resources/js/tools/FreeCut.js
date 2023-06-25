import { Tool } from './Tool.js';
import { Drag } from './Drag.js';

export class FreeCut extends Tool {
    cutPath = [];
    cutLinePaths = [];
    callbackOnFinishedCut = null;
    pathToAddToCut = null;
    constructor(canvas, callbackOnFinishedCut = null, pathToAddToCut = null, x2 = null, y2 = null) {
        super(canvas, 'free-cut');
        this.callbackOnFinishedCut = callbackOnFinishedCut;
        this.pathToAddToCut = pathToAddToCut;
        this.resetEvents();
        this.createPointer(x2, y2);
        this.simulator.setCurrentTool(new Drag(this.canvas));
    }

    createPointer(x2 = null, y2 = null) {
        this.element.pointer = new fabric.Circle();
        this.setDefaultObjectOptions(this.element.pointer);
        this.element.pointer.set({
            strokeWidth: this.canvas.freeDrawingBrush.width,
            radius: this.canvas.freeDrawingBrush.width * 20,
            stroke: 'blue',
            fill: 'blue',
            originX: 'center',
            originY: 'center',
            opacity: 0.4,
            hasBorders: false,
        });
        this.element.pointer.setControlsVisibility({
            mtr: false,
        });
        this.element.miniPointer = new fabric.Circle({
            radius: this.canvas.freeDrawingBrush.width,
            fill: this.canvas.freeDrawingBrush.color,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false,
            selectable: false,
        });
        this.element.pointer.on('moving', () => this.miniPointerFollowPointer());
        this.setStartControl(this.element.pointer, () => this.startCut());
        this.canvas.add(this.element.pointer);
        this.canvas.add(this.element.miniPointer);
        let pointerPosition = this.simulator.getCenterOfView(this.element.pointer);
        if (x2 && y2) {
            pointerPosition = {
                left: x2,
                top: y2,
            };
        }
        this.element.pointer.set(pointerPosition);
        this.miniPointerFollowPointer();
        this.canvas.bringForward(this.element.pointer);
    }

    miniPointerFollowPointer() {
        this.element.miniPointer.set({
            left: this.element.pointer.left,
            top: this.element.pointer.top,
        });
        if (this.element.line) {
            this.pointerMovement();
        }
    }

    createLine(x1 = null, y1 = null) {
        this.element.line = new fabric.Line([this.element.pointer.left, this.element.pointer.top, x1 ?? this.element.pointer.left, y1 ?? this.element.pointer.top], {
            stroke: this.canvas.freeDrawingBrush.color,
            strokeWidth: this.canvas.freeDrawingBrush.width,
            strokeLineCap: 'round',
            originX: 'center',
            originY: 'center',
        });
        this.canvas.add(this.element.line);
        this.simulator.setBackgroundOptions(this.element.line);
        this.element.line.set({
            hasBorders: false,
            selectable: false,
        })
        this.element.line.setControlsVisibility({
            mtr: false,
        });
    }

    startCut(x1 = null, y1 = null) {
        this.setBrushOptions(0.3);
        this.createLine(x1, y1);
        this.element.pointer.set({
            radius: this.element.pointer.radius + 20,
            stroke: 'lightblue',
            fill: 'lightblue',
        });
        this.setStartControl(this.element.pointer, () => this.finishCutPath(x1, y1));
        this.canvas.requestRenderAll();
    }

    pointerMovement() {
        let lineCoords = [];
        if (!this.cutPath.length) {
            lineCoords.push(this.element.pointer.left);
            lineCoords.push(this.element.pointer.top);
        } else {
            let lastPosition = this.cutPath[this.cutPath.length - 1];
            lineCoords.push(lastPosition.x);
            lineCoords.push(lastPosition.y);
        }
        lineCoords.push(this.element.pointer.left);
        lineCoords.push(this.element.pointer.top);
        let line = new fabric.Line(lineCoords, {
            stroke: this.canvas.freeDrawingBrush.color,
            strokeWidth: this.canvas.freeDrawingBrush.width,
            strokeLineCap: 'round',
        });
        this.simulator.setBackgroundOptions(line);
        this.element[Math.random() * 100000000] = line;
        this.cutLinePaths.push(line);
        this.canvas.add(line);
        this.canvas.requestRenderAll();
        this.cutPath.push({
            x: this.element.pointer.left,
            y: this.element.pointer.top,
        });
        this.element.line.set({
            x1: this.element.pointer.left,
            y1: this.element.pointer.top,
        });
        this.element.line.setCoords();
    }

    async cutFreePath(linePath) {
        linePath.strokeWidth = 0;
        linePath.fill = 'black';
        let imgShadow = await this.simulator.loadImageFromUrl(linePath.toDataURL({ width: linePath.width + 20, height: linePath.height + 20 }));
        imgShadow.left = linePath.left;
        imgShadow.top = linePath.top;
        imgShadow.width = linePath.width;
        imgShadow.height = linePath.height;
        this.canvas.add(imgShadow);
        this.simulator.setBackgroundOptions(imgShadow);
        this.canvas.moveTo(imgShadow, 1);
        let tmpRadiographyImg = await this.simulator.loadImageFromUrl(this.simulator.radiographyUrl);
        let tmpCanvas = new fabric.Canvas(null, {
            perPixelTargetFind: true,
            imageSmoothingEnabled: false,
            imageSmoothingQuality: 'high',
        });
        this.simulator.setCanvasSize(tmpCanvas);
        tmpCanvas.add(tmpRadiographyImg);
        tmpRadiographyImg.center();
        imgShadow.absolutePositioned = true;
        tmpRadiographyImg.clipPath = imgShadow;
        let imgCut = await this.simulator.loadImageFromUrl(tmpCanvas.toDataURL({ left: imgShadow.left, top: imgShadow.top, width: imgShadow.width, height: imgShadow.height }));
        imgCut.filters = this.canvas.getObjects()[0].filters;
        imgCut.applyFilters();
        imgCut.left = imgShadow.left;
        imgCut.top = imgShadow.top;
        imgCut.width = imgShadow.width;
        imgCut.height = imgShadow.height;
        delete imgCut.controls.startControl;
        this.canvas.add(imgCut);
        this.setDefaultObjectOptions(imgCut);
        this.element.imgCut = imgCut;
        this.element.imgShadow = imgShadow;
        this.canvas.remove(linePath);
        this.canvas.remove(this.element.line);
        this.simulator.setCurrentTool(new Drag(this.canvas));
        if (this.callbackOnFinishedCut) {
            this.callbackOnFinishedCut(this.element.imgCut);
        }
    }

    finishCutPath(x1 = null, y1 = null) {
        if (x1 && y1) {
            this.cutPath.push({
                x: x1,
                y: y1,
            });
        }
        this.cutPath.push({
            x: this.cutPath[0].x,
            y: this.cutPath[0].y,
        });
        let cutPath = new fabric.Polygon(this.cutPath);
        if (this.pathToAddToCut) {
            this.pathToAddToCut.fill = 'black';
            this.pathToAddToCut.strokeWidth = 0;
            cutPath = new fabric.Group([this.pathToAddToCut, cutPath]);
        }
        this.cutFreePath(cutPath);
        this.cutPath = [];
        this.canvas.remove(this.element.line);
        this.canvas.remove(this.element.pointer);
        this.canvas.remove(this.element.miniPointer);
        this.cutLinePaths.forEach(element => {
            this.canvas.remove(element);
        });
        this.cutLinePaths = [];
        this.canvas.requestRenderAll();
    }

    setStartControl(object, callback) {
        object.controls.startControl = new fabric.Control({
            x: -0.5,
            y: -0.5,
            offsetY: -16,
            offsetX: -16,
            cursorStyle: 'pointer',
            mouseUpHandler: (eventData, transform) => {
                callback();
            },
            render: function (ctx, left, top, styleOverride, fabricObject) {
                let checkStartImg = document.createElement('img');
                checkStartImg.src = '/img/circle-check-regular.svg';
                checkStartImg.style.borderRadius = '1000px';
                checkStartImg.style.backgroundColor = 'lightgreen';
                let size = this.cornerSize;
                ctx.save();
                ctx.translate(left, top);
                ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
                ctx.drawImage(checkStartImg, -size / 2, -size / 2, size, size);
                ctx.restore();
            },
            cornerSize: 24
        });
    }

}
