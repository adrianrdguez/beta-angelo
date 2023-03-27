import { Rule } from './Rule.js';
import { Drag } from './Drag.js';

export class RuleCircle extends Rule {
    constructor(canvas) {
        super(canvas);
        this.element.line.controls.p0.positionHandler = () => [0, 0, 0, 0, 0, 0];
        this.createCircle();
        this.adjustCircleRadiusAndPosition();
        this.simulator.setCurrentTool(new Drag(this.canvas));
    }

    createCircle() {
        let circle = new fabric.Circle({
            fill: 'transparent',
            strokeWidth: this.canvas.freeDrawingBrush.width,
            stroke: this.canvas.freeDrawingBrush.color,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false,
            selectable: false
        });
        this.canvas.add(circle);
        this.element.circle = circle;
    }

    adjustCircleRadiusAndPosition() {
        let p0 = this.getPointCoord(this.element.line, 0);
        let p1 = this.getPointCoord(this.element.line, 1);
        this.element.circle?.set({
            radius: this.calculate(p0.x, p0.y, p1.x, p1.y),
            left: p0.x,
            top: p0.y,
        });
        this.canvas.requestRenderAll();
    }

    movingControlPointsCallback() {
        super.movingControlPointsCallback();
        if (!this.element.line) {
            return;
        }
        this.adjustCircleRadiusAndPosition();
    }


}
