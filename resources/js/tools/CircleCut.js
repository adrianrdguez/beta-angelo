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
        pathToAddToCut.endAngle = ((parseInt(this.element.semicircle.input) + 3) / 2);
        pathToAddToCut.startAngle = -(parseInt(this.element.semicircle.input) + 3) / 2;
        this.canvas.remove(this.element.text);
        this.element.circle.set({
            originX: 'center',
            originY: 'center',
        });
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
        let newAngle = 0;
        if (this.element.semicircle.input) {
            newAngle = ((180 - this.element.semicircle.input)) / 2;
        }
        let angleInRadians = this.degreesToRadians(newAngle);
        let lineLength = (this.element.circle.radius) * 2;
        let halfLength = (lineLength / 2);
        let startX = this.element.circlePointer.left - (halfLength * Math.cos(angleInRadians));
        let startY = this.element.circlePointer.top - (halfLength * Math.sin(angleInRadians));
        let endX = (startX + (lineLength * Math.cos(angleInRadians)));
        let endY = (startY + (lineLength * Math.sin(angleInRadians)));
        let newPoints1 = this.calculateNewCoords(startX, startY, endX, endY, this.element.semicircle.angle - 90);
        let newPoints2 = this.calculateNewCoords(newPoints1.x1, newPoints1.y1, newPoints1.x2, newPoints1.y2, this.element.semicircle.endAngle * 2);
        this.freeCutTool = new FreeCut(this.canvas, this.callbackOnFinishedCut, pathToAddToCut, newPoints2.x2, newPoints2.y2);
        this.freeCutTool.startCut(newPoints1.x2, newPoints1.y2);
        this.canvas.remove(this.element.line);
        delete this.element.line;
        Object.assign(this.freeCutTool.element, this.element);
        this.canvas.requestRenderAll();
    }

    calculateNewCoords(x1, y1, x2, y2, angleInDegrees) {
        let angleInRadians = angleInDegrees * Math.PI / 180;
        let centerX = (x1 + x2) / 2;
        let centerY = (y1 + y2) / 2;
        let rotatedX1 = Math.cos(angleInRadians) * (x1 - centerX) - Math.sin(angleInRadians) * (y1 - centerY) + centerX;
        let rotatedY1 = Math.sin(angleInRadians) * (x1 - centerX) + Math.cos(angleInRadians) * (y1 - centerY) + centerY;
        let rotatedX2 = Math.cos(angleInRadians) * (x2 - centerX) - Math.sin(angleInRadians) * (y2 - centerY) + centerX;
        let rotatedY2 = Math.sin(angleInRadians) * (x2 - centerX) + Math.cos(angleInRadians) * (y2 - centerY) + centerY;
        return {
            x1: rotatedX1,
            y1: rotatedY1,
            x2: rotatedX2,
            y2: rotatedY2
        };
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
            fill: this.canvas.freeDrawingBrush.color + '40',
            strokeWidth: 0,
            startAngle: 270,
            endAngle: 90,
            angle: 90,
        });
        this.element.angleCircle = fabric.util.object.clone(this.element.semicircle);
        this.element.clipPath = fabric.util.object.clone(this.element.semicircle);
        this.canvas.remove(this.element.semicircle);
        this.canvas.add(this.element.angleCircle);
        this.canvas.add(this.element.clipPath);
        this.element.clipPath.set({
            fill: 'transparent',
            stroke: 'transparent',
            strokeWidth: 0,
            startAngle: 270,
            endAngle: 90,
            angle: 270,
            absolutePositioned: true
        });
        this.element.angleCircle.set({
            angle: imgCut.angle + 90,
            clipPath: this.element.clipPath,
        });
        this.element.angleText = new fabric.Text("0", {
            left: this.element.circle.left + (this.element.circle.width / 2) + 20,
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
            this.element.angleCircle.set({
                flipX: (this.element.circle.angle + 90) < 270,
                angle: this.element.circle.angle + 90,
            });
            this.element.clipPath.set({
                angle: this.element.angleCircle.angle < 270 ? 90 : 270,
            });
            angleText = Math.abs(Math.round(this.element.circle.angle) > 180 ? Math.round(this.element.circle.angle) - 360 : Math.round(this.element.circle.angle));
            this.element.angleText.text = angleText + 'º';
            this.canvas.renderAll();
        });
    }
}
