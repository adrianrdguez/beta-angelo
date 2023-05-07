import { RuleCircle } from './RuleCircle.js';
import { Drag } from './Drag.js';
import { FreeCut } from './FreeCut.js';

export class CircleCut extends RuleCircle {
    constructor(canvas) {
        super(canvas);
        this.element.line.tool = this;
        this.setStartControl(this.element.line, () => this.startCut());
        this.element.line.on('selected', () => this.simulator.offcanvasToggler('offcanvas-tool-settings', true));
        this.element.line.on('deselected', () => this.simulator.offcanvasToggler('offcanvas-tool-settings', false));
        this.createSemiCircle();
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
        this.element.semicircle = semicircle;
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

    startCut() {
        this.canvas.remove(this.element.circle);
        this.element.semicircle.strokeWidth = this.element.circle.strokeWidth;
        this.simulator.setBackgroundOptions(this.element.circle);
        this.freeCutTool = new FreeCut(this.canvas, this.callbackOnFinishedCut, this.element.semicircle);
        let p1 = this.getPointCoord(this.element.line, 1); // center
        let p2 = this.getPointCoord(this.element.line, 0); // circumferencia point
        let newAngle = (180 - this.element.semicircle.input) / 2;

        const angleInRadians = newAngle * Math.PI / 180;

        const endX = p1.x + (this.element.circle.radius) * 2 * Math.cos(angleInRadians);
        const endY = p1.y + (this.element.circle.radius) * 2 * Math.sin(angleInRadians);

        let newLine = this.createLine(p1.x, p1.y, endX, endY);

        this.freeCutTool.element.pointer.set({
            left: p1.x,
            top: p1.y,
        });
        this.freeCutTool.element.miniPointer.set({
            left: p1.x,
            top: p1.y,
        });
        this.freeCutTool.startCut(p2.x - this.element.circle.radius, p1.y);
        this.canvas.remove(this.element.line);
        delete this.element.line;
        Object.assign(this.freeCutTool.element, this.element);
        this.canvas.requestRenderAll();
    }

    callbackOnFinishedCut(imgCut) {
        let group = new fabric.Group([this.element.circle, imgCut], {
            left: this.element.circle.left,
            top: this.element.circle.top,
            originX: 'center',
            originY: 'center',
        });
        this.setDefaultObjectOptions(group);
        group.set({
            lockMovementX: true,
            lockMovementY: true,
            lockUniScaling: true,
        });
        this.canvas.add(group);
        this.canvas.remove(this.element.circle);
        this.canvas.remove(this.element.semicircle);
        this.canvas.remove(this.element.text);
        this.canvas.remove(imgCut);
    }
}
