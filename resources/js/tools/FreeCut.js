import {Tool} from './Tool.js';
import {Drag} from './Drag.js';

export class FreeCut extends Tool {
    element = {};
    cutPath = [];
    cutLinePaths = [];
    constructor(canvas) {
        super(canvas, 'free-cut');
        this.resetEvents();
        this.createPointer();
        this.canvas.simulator.setCurrentTool(new Drag(this.canvas));
    }

    createPointer() {
        this.element.pointer = new fabric.Circle({
            strokeWidth: this.canvas.freeDrawingBrush.width,
            radius: this.canvas.freeDrawingBrush.width * 20,
            stroke: 'blue',
            fill: 'blue',
            originX: 'center',
            originY: 'center',
            opacity: 0.4,
            hasBorders: false,
            hasControls: false
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
        this.element.pointer.on('moving', () => this.miniPointerFollowPointer())
        this.element.pointer.on('mousedblclick', () => this.startCut())
        this.canvas.add(this.element.pointer);
        this.canvas.add(this.element.miniPointer);
        this.element.pointer.center();
        this.element.miniPointer.center();
        this.canvas.bringForward(this.element.pointer);

    }

    miniPointerFollowPointer() {
        this.element.miniPointer.set({
            left: this.element.pointer.left,
            top: this.element.pointer.top,
        });
        if (this.element.line) {
            this.pointerMovement()
        }
    }

    createLine() {
        this.element.line = new fabric.Line([this.element.pointer.left, this.element.pointer.top, this.element.pointer.left, this.element.pointer.top], {
            stroke: this.canvas.freeDrawingBrush.color,
            strokeWidth: this.canvas.freeDrawingBrush.width,
            strokeLineCap: 'round',
        });
        this.canvas.add(this.element.line);
        this.setDefaultObjectOptions(this.element.line);
        this.element.line.set({
            hasBorders: false,
            selectable: false,
        })
        this.element.line.setControlsVisibility({
            mtr: false,
        })
    }

    startCut() {
        this.setBrushOptions(0.3);
        this.createLine();
        this.element.pointer.set({
            radius: this.element.pointer.radius + 20,
            stroke: 'lightblue',
            fill: 'lightblue',
        });
        this.element.pointer.off('mousedblclick');
        this.element.pointer.on('mousedblclick', () => this.finishCutPath());
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
        let imgShadow = await this.canvas.simulator.loadImageFromUrl(linePath.toDataURL({ width: linePath.width + 20, height: linePath.height + 20 }));
        imgShadow.left = linePath.left;
        imgShadow.top = linePath.top;
        imgShadow.width = linePath.width;
        imgShadow.height = linePath.height;
        this.canvas.add(imgShadow);
        this.canvas.simulator.setBackgroundOptions(imgShadow);
        this.canvas.moveTo(imgShadow, 1);
        let tmpRadiographyImg = await this.canvas.simulator.loadImageFromUrl(this.canvas.simulator.radiographyUrl)
        let tmpCanvas = new fabric.Canvas();
        this.canvas.simulator.setCanvasSize(tmpCanvas);
        tmpCanvas.add(tmpRadiographyImg);
        tmpRadiographyImg.center();
        imgShadow.absolutePositioned = true;
        tmpRadiographyImg.clipPath = imgShadow;
        let imgCut = await this.canvas.simulator.loadImageFromUrl(tmpCanvas.toDataURL({ left: imgShadow.left, top: imgShadow.top, width: imgShadow.width, height: imgShadow.height }));
        imgCut.left = imgShadow.left;
        imgCut.top = imgShadow.top;
        imgCut.width = imgShadow.width;
        imgCut.height = imgShadow.height;
        this.canvas.add(imgCut);
        this.setDefaultObjectOptions(imgCut);
        this.element.imgCut = imgCut;
        this.element.imgShadow = imgShadow;
        this.canvas.remove(linePath)
        this.canvas.remove(this.element.line)
        this.canvas.requestRenderAll();
        this.canvas.simulator.setCurrentTool(new Drag(this.canvas));
    }

    finishCutPath() {
        this.cutPath.push({
            x: this.cutPath[0].x,
            y: this.cutPath[0].y,
        })
        let cutPath = new fabric.Polygon(this.cutPath);
        this.cutFreePath(cutPath);
        this.cutPath = [];
        this.canvas.remove(this.element.line);
        this.canvas.remove(this.element.pointer);
        this.canvas.remove(this.element.miniPointer);
        this.cutLinePaths.forEach(element => {
            this.canvas.remove(element);
        });
        this.cutLinePaths = [];
    }

}
