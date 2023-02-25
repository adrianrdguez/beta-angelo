import { Tool } from './Tool.js';
import { Drag } from './Drag.js';

export class Rule extends Tool {
    constructor(canvas) {
        super(canvas, 'rule');
        this.resetEvents();
        this.element.line = this.createLine(100, 0, -100, 0);
        this.movingControlPointsCallback();
        this.element.line.element = this.element;
        this.setDeleteControl(this.element.line, 40, 0);
        this.canvas.requestRenderAll();
        this.canvas.simulator.setCurrentTool(new Drag(this.canvas));
    }

    createLine(x1, y1, x2, y2) {
        let line = this.createPolygon([{
            x: x1, y: y1
        }, {
            x: x2, y: y2
        }]);
        this.canvas.add(line);
        return line;
    }

    movingControlPointsCallback() {
        if (!this.element.line) {
            return;
        }
        let mm = this.calculateTextMeasure();
        this.setTextInCanvas(mm + 'mm')
    }

    calculateTextMeasure() {
        let realMeasure = this.canvas.simulator.firstLineMeasureMm;
        let firstLineMeasurePx = this.canvas.simulator.firstLineMeasurePx;
        let px = this.calculate(
            this.element.line.points[0].x,
            this.element.line.points[0].y,
            this.element.line.points[1].x,
            this.element.line.points[1].y
        ).toFixed(2);
        return ((px * realMeasure) / firstLineMeasurePx).toFixed(2);
    }

    setTextInCanvas(text) {
        if (!this.element.text) {
            this.element.text = new fabric.Text(text, {
                fontSize: 12,
                stroke: this.canvas.freeDrawingBrush.color,
                fill: this.canvas.freeDrawingBrush.color
            });
            this.canvas.simulator.setBackgroundOptions(this.element.text);
            this.canvas.add(this.element.text);
        }
        let p0 = this.getPointCoord(this.element.line, 0);
        let p1 = this.getPointCoord(this.element.line, 1);
        this.element.text.set({
            text: text,
            left: p0.x + ((p1.x - p0.x) / 2),
            top: p0.y + ((p1.y - p0.y) / 2),
        });
    }

}
