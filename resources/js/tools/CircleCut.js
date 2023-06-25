import { RuleCircle } from './RuleCircle.js';
import { Drag } from './Drag.js';
import { FreeCut } from './FreeCut.js';

export class CircleCut extends RuleCircle {
    constructor(canvas) {
        super(canvas);
        this.element.line.tool = this;
        this.element.line.startAngle = 0;
        this.setStartControl(this.element.line, () => this.startCut());
        this.element.line.on('selected', () => this.simulator.offcanvasToggler('offcanvas-tool-settings', true));
        this.element.line.on('deselected', () => this.simulator.offcanvasToggler('offcanvas-tool-settings', false));
        this.element.semicircle = this.createSemiCircle();
        this.movingControlPointsCallback(true);
        this.canvas.setActiveObject(this.element.line);
        this.simulator.setCircleCutOptions('radius-input');
        this.simulator.setCurrentTool(new Drag(this.canvas));
    }

    updateSemiCircleAngles(angle) {
        this.element.semicircle?.set({
            angle: angle + 90
        });
    }

    adjustCircleRadiusAndPosition(calculateRadius = false) {
        let coords = super.adjustCircleRadiusAndPosition(calculateRadius);
        this.element.semicircle?.set({
            left: coords.p0.x,
            top: coords.p0.y,
            stroke: 'blue',
        });
        let dx = coords.p1.x - coords.p0.x;
        let dy = coords.p1.y - coords.p0.y;
        let angleRadians = Math.atan2(dy, dx);
        let angle = angleRadians * (180 / Math.PI)
        this.updateSemiCircleAngles(angle);
        if (calculateRadius) {
            this.element.semicircle?.set({
                radius: this.calculate(coords.p0.x, coords.p0.y, coords.p1.x, coords.p1.y),
            });
        }
    }

    createSemiCircle() {
        let semicircle = new fabric.Circle({
            fill: 'transparent',
            strokeWidth: this.canvas.freeDrawingBrush.width + 1,
            strokeLineCap: 'round',
            stroke: 'blue',
            originX: 'center',
            originY: 'center',
            startAngle: 270,
            endAngle: 90,
            hasBorders: false,
            hasControls: false,
            selectable: false,
            angle: 90,
        });
        this.canvas.add(semicircle);
        return semicircle;
    }

    setStartControl(object, callback) {
        object.controls.startControl = new fabric.Control({
            x: -0,
            y: 0,
            offsetY: -40,
            offsetX: -40,
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

    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    startCut() {
        this.canvas.remove(this.element.circle);
        this.element.semicircle.strokeWidth = this.element.circle.strokeWidth;
        let pathToAddToCut = fabric.util.object.clone(this.element.semicircle);
        pathToAddToCut.stroke = 'transparent';
        pathToAddToCut.endAngle = ((parseInt(this.element.semicircle.input) + 1) / 2);
        pathToAddToCut.startAngle = -(parseInt(this.element.semicircle.input) + 1) / 2;
        this.canvas.remove(this.element.text);
        this.element.circle.set({
            originX: 'center',
            originY: 'center',
        })
        this.element.circlePointer = new fabric.Circle({
            radius: this.canvas.freeDrawingBrush.width,
            fill: this.canvas.freeDrawingBrush.color,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false,
            selectable: false,
            left: this.element.circle.left,
            top: this.element.circle.top
        });
        this.canvas.add(this.element.circlePointer);

        // NEED A REFACTOR

        let newAngle = 0;
        let newAngle2 = 0;
        if (this.element.semicircle.input) {
            newAngle = ((180 - this.element.semicircle.input)) / 2;
            newAngle2 = ((180 - this.element.semicircle.input) - 45) / 2;
        }
        let angleInRadians = this.degreesToRadians(newAngle);
        const lineLength = (this.element.circle.radius) * 2;
        const halfLength = (lineLength / 2);
        const startX = this.element.circlePointer.left - (halfLength * Math.cos(angleInRadians));
        const startY = this.element.circlePointer.top - (halfLength * Math.sin(angleInRadians));
        const endX = (startX + (lineLength * Math.cos(angleInRadians)));
        const endY = (startY + (lineLength * Math.sin(angleInRadians)));

        //NUEVO
        // Calculate new starting point
        const newStartX = endX - halfLength * Math.cos(this.element.semicircle.angle + (90 - this.element.semicircle.angle));
        const newStartY = endY - halfLength * Math.sin(this.element.semicircle.angle + (90 - this.element.semicircle.angle));

        // Calculate new ending point
        const newEndX = startX + halfLength * Math.cos(this.element.semicircle.angle + (90 - this.element.semicircle.angle));
        const newEndY = startY + halfLength * Math.sin(this.element.semicircle.angle + (90 - this.element.semicircle.angle));

        //NUEVO
        // ---------- Borrar todo esto de abajo

        let newLine = new fabric.Line([newStartX, newStartY, newEndX, newEndY], {
            stroke: 'blue',
            strokeWidth: 0.5,
            strokeLineCap: 'round',
            originX: 'center',
            originY: 'center',
        });
        let mirroredLine = new fabric.Line([startX, endY, endX, startY], {
            stroke: 'red',
            strokeWidth: 0.5,
            strokeLineCap: 'round',
            originX: 'center',
            originY: 'center',
        });

        this.canvas.add(newLine);
        this.canvas.add(mirroredLine);

        // ---------- Borrar todo esto de arriba

        this.freeCutTool = new FreeCut(this.canvas, this.callbackOnFinishedCut, pathToAddToCut, endX, endY);
        this.freeCutTool.startCut(startX, endY);
        this.canvas.remove(this.element.line);
        delete this.element.line;
        Object.assign(this.freeCutTool.element, this.element);
        this.canvas.requestRenderAll();
    }

    calculateNewCoords(x1, y1, x2, y2, rotationInDegrees) {
        let rotateX = x1 + ((x2 - x1) / 2);
        let rotateY = y1 + ((y2 - y1) / 2);
        rotationInDegrees = rotationInDegrees * Math.PI / 180;
        let x1New = (x1 - rotateX) * Math.cos(rotationInDegrees) - (y1 - rotateY) * Math.sin(rotationInDegrees) + rotateX;
        let y1New = (x1 - rotateX) * Math.sin(rotationInDegrees) + (y1 - rotateY) * Math.cos(rotationInDegrees) + rotateY;
        let x2New = (x2 - rotateX) * Math.cos(rotationInDegrees) - (y2 - rotateY) * Math.sin(rotationInDegrees) + rotateX;
        let y2New = (x2 - rotateX) * Math.sin(rotationInDegrees) + (y2 - rotateY) * Math.cos(rotationInDegrees) + rotateY;
        return {
            x1: x1New,
            y1: y1New,
            x2: x2New,
            y2: y2New
        }
    }

    callbackOnFinishedCut(imgCut) {
        this.canvas.add(this.element.circle);
        this.element.circle.fill = "rgba(1, 0, 0, 0.01)";
        this.setDefaultObjectOptions(this.element.circle);
        this.element.circle.hasBorders = true;
        this.element.circle.hasControls = true;
        this.element.circle.selectable = true;
        this.element.circle.lockMovementX = true;
        this.element.circle.lockMovementY = true;
        let brPoints = imgCut.aCoords.br;
        let tlPoints = imgCut.aCoords.tl;
        let circlePoint = new fabric.Point(
            this.element.circle.left,
            this.element.circle.top,
        );
        let xFirstDiff = brPoints.x - tlPoints.x;
        let yFirstDiff = brPoints.y - tlPoints.y;
        let xSecondDiff = circlePoint.x - tlPoints.x;
        let ySecondDiff = circlePoint.y - tlPoints.y;
        let newOriginX = xSecondDiff / xFirstDiff;
        let newOriginY = ySecondDiff / yFirstDiff;
        imgCut.set({
            lockMovementX: true,
            lockMovementY: true,
            lockUniScaling: true,
            originY: newOriginY,
            originX: newOriginX,
            left: circlePoint.x,
            top: circlePoint.y,
        })
        this.simulator.setBackgroundOptions(imgCut);
        this.element.semicircle.set({
            //fill: this.canvas.freeDrawingBrush.color + '40',
            fill: 'blue',
            strokeWidth: 0,
            startAngle: 270,
            endAngle: 90,
            angle: 90,
        });
        this.element.semicircle2 = fabric.util.object.clone(this.element.semicircle);
        this.canvas.add(this.element.semicircle2);
        this.element.semicircle2.set({
            fill: 'transparent',
            stroke: 'transparent',
            strokeWidth: 0,
            startAngle: 270,
            endAngle: 90,
            angle: 270,
            absolutePositioned: true
        });
        this.element.semicircle.set({
            angle: imgCut.angle + 90,
            clipPath: this.element.semicircle2,
        });

        this.element.angleText = new fabric.Text("0", {
            left: this.element.circle.left + (this.element.circle.width / 2) + 10,
            top: this.element.circle.top,
            originX: 'center',
            originY: 'center',
            fontSize: 12,
            stroke: 'black',
            strokeWidth: 0.10,
            fill: this.canvas.freeDrawingBrush.color,
            fontFamily: 'Nunito'
        });
        this.canvas.add(this.element.angleText);
        let angleText = this.element.angleText;
        this.element.circle.on('rotating', (event) => {
            imgCut.set({
                angle: this.element.circle.angle,
            });
            this.element.semicircle.set({
                flipX: (this.element.circle + 90) < 270,
                angle: this.element.circle + 90,
            });
            this.element.semicircle2.set({
                angle: (this.element.circle + 90) < 270 ? 90 : 270,
            });
            angleText = Math.abs(Math.round(this.element.circle.angle) > 180 ? Math.round(this.element.circle.angle) - 360 : Math.round(this.element.circle.angle));
            this.element.angleText.text = angleText + 'º';
            this.canvas.renderAll();
        });
    }
}
