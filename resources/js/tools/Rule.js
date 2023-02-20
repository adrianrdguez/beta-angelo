import { Tool } from './Tool.js';
import { Drag } from './Drag.js';

export class Rule extends Tool {
    element = {};
    constructor(canvas, first) {
        super(canvas, 'rule');
        this.resetEvents();
        this.canvas.on('mouse:down', event => this.startAddingLine(event));
        this.canvas.on('mouse:move', event => this.startDrawingLine(event));
        this.canvas.on('mouse:up', event => this.stopDrawingLine(event, first));
    }

    startAddingLine(event) {
        let pointer = this.canvas.getPointer(event.e);
        this.element.line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: this.canvas.freeDrawingBrush.color,
            strokeWidth: this.canvas.freeDrawingBrush.width,
            strokeLineCap: 'round',
            startx: new Array(),
            starty: new Array(),
            endx: new Array(),
            endy: new Array(),
            temp: 0
        });

        this.setDefaultObjectOptions(this.element.line);
        this.element.line.set({
            hasBorders: false,
        });
        this.element.line.setControlsVisibility({
            mtr: false,
        });
        this.element.line.startx[this.element.line.temp] = pointer.x;
        this.element.line.starty[this.element.line.temp] = pointer.y;
        this.canvas.add(this.element.line);
        this.canvas.requestRenderAll();
    }

    startDrawingLine(event) {
        if (this.element.line) {
            let pointer = this.canvas.getPointer(event.e);
            //Adding text to the rule while creating
            let startX = this.element.line.startx[this.element.line.temp];
            let startY = this.element.line.starty[this.element.line.temp];
            let endX = this.element.line.endx[this.element.line.temp];
            let endY = this.element.line.endy[this.element.line.temp];
            this.setTextInTheMiddleOfLine(startX, startY, endX, endY);
            this.element.line.set({
                x2: pointer.x,
                y2: pointer.y
            });
            this.element.line.endx[this.element.line.temp] = pointer.x;
            this.element.line.endy[this.element.line.temp] = pointer.y;
            this.canvas.requestRenderAll();
        }
    }

    calculate(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 * 1 - x1 * 1, 2) + Math.pow(y2 * 1 - y1 * 1, 2));
    }

    stopDrawingLine(event, first) {
        this.element.line.setCoords();
        this.element.line.on('mousedblclick', () => this.addingControlPoints());
        this.element.line.on('moving', () => this.pointersFollowLine());
        var lines = [];
        this.canvas.forEachObject(function (obj) {
            if (obj instanceof fabric.Line) {
                lines.push(obj);
            }
        });
        var intersectingLines = [];
        for (var i = 0; i < lines.length; i++) {
            for (var j = i + 1; j < lines.length; j++) {
                if (lines[i].intersectsWithObject(lines[j], true)) {
                    intersectingLines.push([lines[i], lines[j]]);
                }
            }
        }
        console.log(intersectingLines);
        if (intersectingLines.length > 0) {
            const A1 = intersectingLines[0][0].y2 - intersectingLines[0][0].y1;
            const B1 = intersectingLines[0][0].x1 - intersectingLines[0][0].x2;
            const C1 = A1 * intersectingLines[0][0].x1 + B1 * intersectingLines[0][0].y1;

            const A2 = intersectingLines[0][1].y2 - intersectingLines[0][1].y1;
            const B2 = intersectingLines[0][1].x1 - intersectingLines[0][1].x2;
            const C2 = A2 * intersectingLines[0][1].x1 + B2 * intersectingLines[0][1].y1;

            // Determinante
            const det = A1 * B2 - A2 * B1;

            if (det === 0) {
                return null;
            } else {
                // Usamos cramers rule
                const x = (B2 * C1 - B1 * C2) / det;
                const y = (A1 * C2 - A2 * C1) / det;
                console.log("x, y", x, y);
            }

            const angle1 = Math.atan2(intersectingLines[0][0].y2 - intersectingLines[0][0].y1, intersectingLines[0][0].x2 - intersectingLines[0][0].x1);
            const angle2 = Math.atan2(intersectingLines[0][1].y2 - intersectingLines[0][1].y1, intersectingLines[0][1].x2 - intersectingLines[0][1].x1);

            // Valor absoluto para el angulo
            let angle = Math.abs(angle2 - angle1);

            // Calcular el angulo más pequeño
            if (angle > Math.PI) {
                angle = 2 * Math.PI - angle;
            }

            angle = angle * 180 / Math.PI;

            if (angle > 90) {
                angle = 180 - angle;
                console.log("angle", angle)
            } else {
                console.log("angle", angle);
            }
        }
        this.canvas.simulator.setCurrentTool(new Drag(this.canvas));
    }

    getNewLineCoordinates() {
        let centerX = this.element.line.getCenterPoint().x;
        let centerY = this.element.line.getCenterPoint().y;

        let x1offset = this.element.line.calcLinePoints().x1;
        let y1offset = this.element.line.calcLinePoints().y1;
        let x2offset = this.element.line.calcLinePoints().x2;
        let y2offset = this.element.line.calcLinePoints().y2;

        return {
            x1: centerX + x1offset,
            y1: centerY + y1offset,
            x2: centerX + x2offset,
            y2: centerY + y2offset
        }
    }

    addingControlPoints() {
        if (!this.element.pointer1 && !this.element.pointer2) {
            let newLineCoords = this.getNewLineCoordinates();
            this.element.pointer1 = this.createPointer(newLineCoords.y1, newLineCoords.x1);
            this.element.pointer2 = this.createPointer(newLineCoords.y2, newLineCoords.x2);
            this.canvas.discardActiveObject();
            this.canvas.requestRenderAll();
            this.canvas.on('selection:cleared', event => this.removePointers(event));
        }
    }

    createPointer(top, left) {
        let circle = new fabric.Circle({
            radius: this.canvas.freeDrawingBrush.width * 20,
            fill: this.canvas.freeDrawingBrush.color,
            opacity: 0.15,
            top: top,
            left: left,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false
        });
        circle.on('moving', () => this.lineFollowPointers());
        this.canvas.add(circle);
        this.canvas.bringForward(circle);
        return circle;
    }

    pointersFollowLine() {
        let newLineCoords = this.getNewLineCoordinates();
        this.element.pointer1?.set({
            top: newLineCoords.y1,
            left: newLineCoords.x1
        });
        this.element.pointer2?.set({
            top: newLineCoords.y2,
            left: newLineCoords.x2
        });
        this.setTextInTheMiddleOfLine(newLineCoords.x1, newLineCoords.y1, newLineCoords.x2, newLineCoords.y2);
    }

    lineFollowPointers() {
        this.element.line.set({
            x1: this.element.pointer1.left,
            y1: this.element.pointer1.top,
            x2: this.element.pointer2.left,
            y2: this.element.pointer2.top
        });
        this.setTextInTheMiddleOfLine(this.element.line.x1, this.element.line.y1, this.element.line.x2, this.element.line.y2);
        this.element.line.startx = this.element.pointer1.left;
        this.element.line.starty = this.element.pointer1.top;
        this.element.line.endx = this.element.pointer2.left;
        this.element.line.endy = this.element.pointer2.top;
        console.log("hola")
        this.element.line.setCoords();
    }

    removePointers() {
        this.canvas.remove(this.element.pointer1);
        this.canvas.remove(this.element.pointer2);
        delete this.element.pointer1;
        delete this.element.pointer2;
        this.canvas.requestRenderAll();
        this.canvas.off('selection:cleared');
    }

    setTextInTheMiddleOfLine(x1, y1, x2, y2) {
        let realMeasure = this.canvas.simulator.firstLineMeasureMm;
        let firstLineMeasurePx = this.canvas.simulator.firstLineMeasurePx;
        let px = this.calculate(x1, y1, x2, y2).toFixed(2);
        let mm = ((px * realMeasure) / firstLineMeasurePx).toFixed(2);
        if (!this.element.text) {
            this.element.text = new fabric.Text(mm, {
                fontSize: 12,
                stroke: this.canvas.freeDrawingBrush.color,
                fill: this.canvas.freeDrawingBrush.color
            });
            this.canvas.simulator.setBackgroundOptions(this.element.text);
            this.canvas.add(this.element.text);
        }
        this.element.text.set({
            text: mm + 'mm',
            left: x1 + ((x2 - x1) / 2),
            top: y1 + ((y2 - y1) / 2),
        });
    }

}
