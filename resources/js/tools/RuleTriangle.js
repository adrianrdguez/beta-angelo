import { Rule } from './Rule.js';
import { Drag } from './Drag.js';

export class RuleTriangle extends Rule {
    element = {};
    constructor(canvas) {
        super(canvas);
        this.resetEvents();
        this.toolName = 'rule-triangle';
        this.setActiveTool(this.toolName);
        this.createTriangle();
        this.canvas.simulator.setCurrentTool(new Drag(this.canvas));
    }

    createLine(x1, y1, x2, y2) {
        console.log(x1, y1, x2, y2);
        let line = new fabric.Line([0, 0, 0, 0], {
            stroke: this.canvas.freeDrawingBrush.color,
            strokeWidth: this.canvas.freeDrawingBrush.width,
            strokeLineCap: 'round',
        });
        this.canvas.add(line);
        line.set({
            x1: (this.canvas.width / 2) + x1,
            y1: (this.canvas.height / 2) + y1,
            x2: (this.canvas.width / 2) + x2,
            y2: (this.canvas.height / 2) + y2
        });
        this.setDefaultObjectOptions(line);
        line.set({
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingFlip: true,
            lockScalingX: true,
            lockScalingY: true,
            lockSkewingX: true,
            lockSkewingY: true,
        });
        line.setControlsVisibility({
            mtr: false,
        });
        line.on('mousedblclick', () => this.addingControlPoints());
        line.on('moving', () => this.pointersFollowLine());
        return line;
    }


    createTriangle() {
        let triangleSize = 10;
        let vertexTopLeftX = -(this.canvas.width / triangleSize);
        let vertexTopLeftY = -(this.canvas.width / triangleSize);
        let vertexTopRightX = (this.canvas.width / triangleSize);
        let vertexTopRightY = -(this.canvas.width / triangleSize);
        let vertexBottomMiddleX1 = vertexTopRightX + vertexTopLeftX;
        let vertexBottomMiddleX2 = vertexTopLeftY - vertexTopRightY;
        let vertexBottomMiddleY1 = (this.canvas.width / triangleSize);
        let vertexBottomMiddleY2 = vertexBottomMiddleY1;
        this.element.line1 = this.createLine(vertexTopLeftX, vertexTopLeftY, vertexTopRightX, vertexTopRightY);
        this.element.line2 = this.createLine(vertexBottomMiddleX1, vertexBottomMiddleY1, vertexTopRightX, vertexTopRightY);
        this.element.line3 = this.createLine(vertexTopLeftX, vertexTopLeftY, vertexBottomMiddleX2, vertexBottomMiddleY2)
        this.getAngleBetweenLines(this.element.line1, this.element.line3);
        this.getAngleBetweenLines(this.element.line1, this.element.line2);
        this.getAngleBetweenLines(this.element.line2, this.element.line3, true);
        this.setTextInTheMiddleOfLine();
        this.canvas.requestRenderAll();
    }

    getAngleBetweenLines(line1, line2, line180 = false) {
        let angle1;
        let angle2;
        if (line180) {
            angle1 = Math.atan2(line1.y2 - line1.y1, line1.x2 - line1.x1);
            angle1 += Math.PI;
            angle2 = Math.atan2(line2.y2 - line2.y1, line2.x2 - line2.x1);
        } else {
            angle1 = Math.atan2(line1.y2 - line1.y1, line1.x2 - line1.x1);
            angle2 = Math.atan2(line2.y2 - line2.y1, line2.x2 - line2.x1);
        }
        angle1 = angle1 * 180 / Math.PI;
        angle2 = angle2 * 180 / Math.PI;
        /* 
         if (angle1 < 0 && line180) {
             angle1 += 180;
         }
         
         if (angle2 < 0 && line180) {
             angle2 += 180;
         }*/

        let angle = angle1 - angle2;
        let angleReal = angle;

        if (angleReal < 0) {
            angleReal = - angleReal;
        }

        if (360 - angleReal < angleReal) {
            angleReal = 360 - angleReal;
        }

        if (angleReal < 0) {
            angleReal = - angleReal;
        }

        console.log("angle", angleReal);
    }

    getAngleBetweenLines2(line1, line2) {
        let u = [line1.x2 - line1.x1, line1.y2 - line1.y1]
        let v = [line2.x2 - line2.x1, line2.y2 - line2.y1]

        let angle1 = Math.atan2(u[0], u[1]);
        let angle2 = Math.atan2(v[0], v[1]);


        let angle = angle1 - angle2;
        angle = angle * 180 / Math.PI;
        if (angle < 0) {
            angle = -angle;
        }
        if (360 - angle < angle) {
            angle = 360 - angle;
        }

        console.log('angle3', angle);
    }

    getNewLineCoordinates() {
        let pointerCoords = {};
        let centerX = this.element.line1.getCenterPoint().x;
        let centerY = this.element.line1.getCenterPoint().y;
        let x1offset = this.element.line1.calcLinePoints().x1;
        let y1offset = this.element.line1.calcLinePoints().y1;
        let x2offset = this.element.line1.calcLinePoints().x2;
        let y2offset = this.element.line1.calcLinePoints().y2;
        pointerCoords.pointer1Coords = {
            top: centerY + y1offset,
            left: centerX + x1offset,
        }
        pointerCoords.pointer2Coords = {
            top: centerY + y2offset,
            left: centerX + x2offset,
        }
        centerX = this.element.line3.getCenterPoint().x;
        centerY = this.element.line3.getCenterPoint().y;
        x2offset = this.element.line3.calcLinePoints().x2;
        y2offset = this.element.line3.calcLinePoints().y2;
        pointerCoords.pointer3Coords = {
            top: centerY + y2offset,
            left: centerX + x2offset,
        }
        return pointerCoords;
    }

    addingControlPoints() {
        if (
            !this.element.pointer1 &&
            !this.element.pointer2 &&
            !this.element.pointer3
        ) {
            let pointerCoords = this.getNewLineCoordinates();
            this.element.pointer1 = this.createPointer(pointerCoords.pointer1Coords.top, pointerCoords.pointer1Coords.left);
            this.element.pointer2 = this.createPointer(pointerCoords.pointer2Coords.top, pointerCoords.pointer2Coords.left);
            this.element.pointer3 = this.createPointer(pointerCoords.pointer3Coords.top, pointerCoords.pointer3Coords.left);
            this.canvas.discardActiveObject();
            this.canvas.requestRenderAll();
            this.canvas.on('selection:cleared', event => this.removePointers(event));
        }
    }

    pointersFollowLine() {
        let pointerCoords = this.getNewLineCoordinates();
        this.element.pointer1?.set({
            top: pointerCoords.pointer1Coords.top,
            left: pointerCoords.pointer1Coords.left
        });
        this.element.pointer2?.set({
            top: pointerCoords.pointer2Coords.top,
            left: pointerCoords.pointer2Coords.left
        });
        this.element.pointer3?.set({
            top: pointerCoords.pointer3Coords.top,
            left: pointerCoords.pointer3Coords.left
        });
        this.setTextInTheMiddleOfLine();
    }

    lineFollowPointers() {
        this.element.line1.set({
            x1: this.element.pointer1.left,
            y1: this.element.pointer1.top,
            x2: this.element.pointer2.left,
            y2: this.element.pointer2.top
        });
        this.element.line1.setCoords();
        this.element.line2.set({
            x1: this.element.pointer3.left,
            y1: this.element.pointer3.top,
            x2: this.element.pointer2.left,
            y2: this.element.pointer2.top
        });
        this.element.line2.setCoords();
        this.element.line3.set({
            x1: this.element.pointer1.left,
            y1: this.element.pointer1.top,
            x2: this.element.pointer3.left,
            y2: this.element.pointer3.top
        });
        this.element.line3.setCoords();
        this.getAngleBetweenLines(this.element.line1, this.element.line3);
        this.getAngleBetweenLines(this.element.line1, this.element.line2);
        this.getAngleBetweenLines(this.element.line2, this.element.line3, true);
        this.setTextInTheMiddleOfLine();
    }

    removePointers() {
        this.canvas.remove(this.element.pointer1)
        this.canvas.remove(this.element.pointer2)
        this.canvas.remove(this.element.pointer3)
        delete this.element.pointer1;
        delete this.element.pointer2;
        delete this.element.pointer3;
        this.canvas.requestRenderAll();
        this.canvas.off('selection:cleared');
    }

    setTextInTheMiddleOfLine() {
        this.element.text1 = this.createOrUpdateText(this.element.text1, this.element.line1);
        this.element.text2 = this.createOrUpdateText(this.element.text2, this.element.line2);
        this.element.text3 = this.createOrUpdateText(this.element.text3, this.element.line3);
        this.canvas.requestRenderAll();
    }

    createOrUpdateText(text, line) {
        let realMeasure = this.canvas.simulator.measure;
        let firstLineMeasure = this.canvas.simulator.firstLineMeasure;
        let px = this.calculate(line.x1, line.y1, line.x2, line.y2).toFixed(2);
        let mm = ((px * realMeasure) / firstLineMeasure).toFixed(2);
        if (!text) {
            text = new fabric.Text(mm, {
                fontSize: 12,
                stroke: this.canvas.freeDrawingBrush.color,
                fill: this.canvas.freeDrawingBrush.color
            });
            this.canvas.simulator.setBackgroundOptions(text);
            this.canvas.add(text);
        }
        text.set({
            text: mm + 'mm',
            left: line.x1 + ((line.x2 - line.x1) / 2),
            top: line.y1 + ((line.y2 - line.y1) / 2),
        });
        return text;
    }

}
