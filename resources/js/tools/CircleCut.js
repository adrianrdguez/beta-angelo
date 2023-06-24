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
        this.simulator.setBackgroundOptions(this.element.circle);
        let semicirclePrueba = fabric.util.object.clone(this.element.semicircle);
        semicirclePrueba.set({
            stroke: 'transparent',
        })
        semicirclePrueba.endAngle = ((parseInt(this.element.semicircle.input) + 1) / 2);
        semicirclePrueba.startAngle = -(parseInt(this.element.semicircle.input) + 1) / 2;
        this.freeCutTool = new FreeCut(this.canvas, this.callbackOnFinishedCut, semicirclePrueba);
        this.canvas.remove(this.element.text);

        this.element.miniPointer = new fabric.Circle({
            radius: this.canvas.freeDrawingBrush.width,
            fill: this.canvas.freeDrawingBrush.color,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false,
            selectable: false,
        });
        this.canvas.add(this.element.miniPointer);
        this.element.circle.set({
            originX: 'center',
            originY: 'center',
        })
        this.element.miniPointer.set({
            left: this.element.circle.left,
            top: this.element.circle.top,
        });

        // NEED A REFACTOR

        let p4 = this.getPointCoord(this.element.line, 0);
        let newAngle;
        if (this.element.semicircle.input === undefined) {
            newAngle = 0;
        } else {
            newAngle = (180 - this.element.semicircle.input) / 2;
        }
        let angleInRadians = this.degreesToRadians(newAngle);

        const lineLength = (this.element.circle.radius) * 2;
        const halfLength = (lineLength / 2) + 2;

        const centerX = p4.x - (halfLength * Math.cos(angleInRadians));
        const centerY = p4.y - (halfLength * Math.sin(angleInRadians));

        const endX = centerX + (lineLength * Math.cos(angleInRadians));
        const endY = centerY + (lineLength * Math.sin(angleInRadians));

        /* this.element.miniPointer = new fabric.Circle({
            radius: this.canvas.freeDrawingBrush.width,
            fill: this.canvas.freeDrawingBrush.color,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false,
            selectable: false,
        });
        this.canvas.add(this.element.miniPointer);

        this.element.miniPointer.set({
            left: endX,
            top: endY,
        }); */

        let newLine = new fabric.Line([centerX, centerY, endX, endY], {
            stroke: 'blue',
            strokeWidth: 0.5,
            strokeLineCap: 'round',
            originX: 'center',
            originY: 'center',
            angle: this.element.semicircle.angle - 90
        });

        let mirroredLine = new fabric.Line([centerX, endY, endX, centerY], {
            stroke: 'red',
            strokeWidth: 0.5,
            strokeLineCap: 'round',
            originX: 'center',
            originY: 'center',
            angle: this.element.semicircle.angle - 90
        });

        /* this.canvas.add(newLine)
        this.canvas.add(mirroredLine) */

        const endPoint = newLine.getPointByOrigin('left', 'bottom');
        const startPoint = newLine.getPointByOrigin('right', 'bottom');

        const endPoint2 = newLine.getPointByOrigin('left', 'top');
        const startPoint2 = newLine.getPointByOrigin('right', 'top');

        if (this.element.semicircle.input <= 180) {
            this.freeCutTool.element.pointer.set({
                left: startPoint.x + 1.5,
                top: startPoint.y,
            });
            this.freeCutTool.element.miniPointer.set({
                left: startPoint.x + 1.5,
                top: startPoint.y,
            });
            this.freeCutTool.startCut(endPoint.x + 2, endPoint.y);
        } else {
            this.freeCutTool.element.pointer.set({
                left: startPoint2.x,
                top: startPoint2.y,
            });
            this.freeCutTool.element.miniPointer.set({
                left: startPoint2.x,
                top: startPoint2.y,
            });
            this.freeCutTool.startCut(endPoint2.x, endPoint2.y);
        }

        this.canvas.remove(this.element.line);
        delete this.element.line;
        Object.assign(this.freeCutTool.element, this.element);
        this.canvas.requestRenderAll();
    }

    callbackOnFinishedCut(imgCut) {
        this.simulator.setBackgroundOptions(this.element.circle);

        const circleCenter = this.element.circle.getCenterPoint();
        const imgCutCenter = imgCut.getCenterPoint();

        this.element.miniPointer2 = new fabric.Circle({
            radius: this.canvas.freeDrawingBrush.width,
            fill: this.canvas.freeDrawingBrush.color,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false,
            selectable: false,
            left: circleCenter.x,
            top: circleCenter.y,
        })
        this.canvas.add(this.element.miniPointer2);

        this.element.miniPointer = new fabric.Circle({
            radius: this.canvas.freeDrawingBrush.width,
            fill: this.canvas.freeDrawingBrush.color,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false,
            selectable: false,
            left: imgCutCenter.x,
            top: imgCutCenter.y,
        });

        this.canvas.add(this.element.miniPointer);

        console.log(circleCenter)
        console.log(imgCutCenter)
        imgCut.set({
            lockMovementX: true,
            lockMovementY: true,
            lockUniScaling: true,
        });
        this.setDefaultObjectOptions(imgCut);
        this.element.semicircle.set({
            fill: this.canvas.freeDrawingBrush.color + '40',
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
            left: this.element.semicircle.left + 870,
            top: this.element.semicircle.top + 650,
            originX: 'center',
            originY: 'center',
            stroke: 'red',
            fontSize: 12,
            angle: imgCut.angle,
            fontFamily: 'Nunito'
        });
        this.canvas.add(this.element.angleText);
        this.canvas.bringToFront(this.element.circle);

        imgCut.on('rotating', (event) => {
            this.element.semicircle.set({
                flipX: (imgCut.angle + 90) < 270,
                angle: imgCut.angle + 90,
            });
            this.element.semicircle2.set({
                angle: (imgCut.angle + 90) < 270 ? 90 : 270,
            });
            let newAngle = 0;
            if (this.element.semicircle.angle > 270) {
                newAngle = Math.round(450 - this.element.semicircle.angle);
            } else {
                newAngle = -Math.round(this.element.semicircle.angle - 90);
            }
            this.element.angleText.set('text', newAngle + 'º');
            this.canvas.renderAll();
            this.canvas.bringToFront(this.element.circle);
            this.canvas.bringToFront(this.element.semicircle);
        });

        imgCut.on('selected', (event) => {
            setTimeout(() => {
                this.canvas.bringToFront(this.element.circle);
                this.canvas.bringToFront(this.element.semicircle);
            }, 10);
        });
    }
}
