import { Tool } from './Tool.js';
import { Drag } from './Drag.js';

export class RuleTriangle extends Tool {
    constructor(canvas) {
        super(canvas, 'rule-triangle');
        this.element.triangle = this.createTriangle(100, 0, -100, 0);
        this.element.triangle.element = this.element;
        this.setDeleteControl(this.element.triangle, 40, 0);
        this.movingControlPointsCallback();
        this.simulator.setCurrentTool(new Drag(this.canvas));
    }

    createTriangle(x1, y1, x2, y2) {
        let triangle = this.createPolygon([{
            x: x1, y: y1
        }, {
            x: x2, y: y2
        }, {
            x: 0, y: x1 * 2
        },]);
        this.canvas.add(triangle);
        triangle.absolutePositioned = true;
        return triangle;
    }


    getAngleBetweenLines(line1, line2, line180 = false) {
        const angle1 = Math.atan2(line1.p2y - line1.p1y, line1.p2x - line1.p1x);
        let angle2 = Math.atan2(line2.p2y - line2.p1y, line2.p2x - line2.p1x);

        if (line180) {
            angle2 += Math.PI;
        }

        let angle = (angle1 - angle2) * 180 / Math.PI;

        angle = Math.abs(angle);

        if (angle > 180) {
            angle = 360 - angle;
        }

        return angle;
    }

    movingControlPointsCallback() {
        if (!this.element.triangle) {
            return;
        }
        let measures = this.calculateTextMeasure();
        this.setTextInCanvas(measures);
        let angles = this.calculateTextAngles();
        this.setAnglesInCanvas(angles);
    }

    calculateTextAngles() {
        let line1 = {
            p1x: this.element.triangle.points[0].x,
            p1y: this.element.triangle.points[0].y,
            p2x: this.element.triangle.points[1].x,
            p2y: this.element.triangle.points[1].y
        };
        let line2 = {
            p1x: this.element.triangle.points[1].x,
            p1y: this.element.triangle.points[1].y,
            p2x: this.element.triangle.points[2].x,
            p2y: this.element.triangle.points[2].y
        };
        let line3 = {
            p1x: this.element.triangle.points[2].x,
            p1y: this.element.triangle.points[2].y,
            p2x: this.element.triangle.points[0].x,
            p2y: this.element.triangle.points[0].y
        };

        let angle1 = this.getAngleBetweenLines(line1, line3);
        let angle2 = this.getAngleBetweenLines(line1, line2);
        let angle3 = this.getAngleBetweenLines(line2, line3, true);

        return {
            '0': Math.abs(180 - angle1),
            '1': Math.abs(180 - angle2),
            '2': Math.abs(angle3),
        };
    };

    setAnglesInCanvas(angles) {
        Object.keys(angles).forEach(point => {
            let text = angles[point].toFixed(2) + 'º';
            if (!this.element['circle' + point]) {
                this.element['circle' + point] = new fabric.Circle({
                    fill: 'transparent',
                    isAngle: true,
                    strokeWidth: this.canvas.freeDrawingBrush.width,
                    stroke: this.canvas.freeDrawingBrush.color,
                    originX: 'center',
                    originY: 'center',
                    hasBorders: false,
                    hasControls: false,
                    selectable: false,
                    radius: 10,
                });
                this.simulator.setBackgroundOptions(this.element['circle' + point]);
                this.canvas.add(this.element['circle' + point]);
            }
            if (!this.element['angle' + point]) {
                this.element['angle' + point] = new fabric.Text(text, {
                    fontSize: 12,
                    stroke: 'black',
                    strokeWidth: 0.1,
                    fill: this.canvas.freeDrawingBrush.color
                });
                this.simulator.setBackgroundOptions(this.element['angle' + point]);
                this.canvas.add(this.element['angle' + point]);
            }
            let p = this.getPointCoord(this.element.triangle, parseInt(point));
            this.element['circle' + point].set({
                left: p.x,
                top: p.y,
            });
            this.element['angle' + point].set({
                text: text,
                left: p.x,
                top: p.y,
                rawAngle: angles[point],
            });
            this.element['circle' + point].clipPath = this.element.triangle;
        });
    }

    calculateTextMeasure() {
        let realMeasure = this.simulator.firstLineMeasureMm;
        let firstLineMeasurePx = this.simulator.firstLineMeasurePx;
        let px1 = this.calculate(
            this.element.triangle.points[0].x,
            this.element.triangle.points[0].y,
            this.element.triangle.points[1].x,
            this.element.triangle.points[1].y
        ).toFixed(2);
        let px2 = this.calculate(
            this.element.triangle.points[1].x,
            this.element.triangle.points[1].y,
            this.element.triangle.points[2].x,
            this.element.triangle.points[2].y
        ).toFixed(2);
        let px3 = this.calculate(
            this.element.triangle.points[2].x,
            this.element.triangle.points[2].y,
            this.element.triangle.points[0].x,
            this.element.triangle.points[0].y
        ).toFixed(2);
        return {
            '0': ((px1 * realMeasure) / firstLineMeasurePx).toFixed(2),
            '1': ((px2 * realMeasure) / firstLineMeasurePx).toFixed(2),
            '2': ((px3 * realMeasure) / firstLineMeasurePx).toFixed(2),
        };
    }

    setTextInCanvas(measures) {
        Object.keys(measures).forEach(point => {
            let text = measures[point] + 'mm';
            if (!this.element['text' + point]) {
                this.element['text' + point] = new fabric.Text(text, {
                    fontSize: 12,
                    stroke: 'black',
                    strokeWidth: 0.05,
                    fill: this.canvas.freeDrawingBrush.color
                });
                this.simulator.setBackgroundOptions(this.element['text' + point]);
                this.canvas.add(this.element['text' + point]);
            }
            let p0 = this.getPointCoord(this.element.triangle, parseInt(point));
            let p1 = this.getPointCoord(this.element.triangle, parseInt((point == 2) ? 0 : parseInt(point) + 1));

            let angle = Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
            let centerX = (p0.x + p1.x) / 2;
            let centerY = (p0.y + p1.y) / 2;
            let distance = -10;
            let dx = distance * Math.sin(angle * Math.PI / 180);
            let dy = distance * Math.cos(angle * Math.PI / 180);

            this.element['text' + point].set({
                text: text,
                left: centerX + dx,
                top: centerY - dy,
                angle: angle,
                originX: 'center',
                originY: 'center',
                flipY: (angle >= 90 && angle <= 270),
                flipX: (angle >= 90 && angle <= 270)
            });
        });
    }

}
