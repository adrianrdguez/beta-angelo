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
        this.canvas.simulator.setCurrentTool(new Drag(this.canvas));
    }

    createLine(x1, y1, x2, y2) {
        let line = this.createPolygon([{
            x: x1, y: y1
        }, {
            x: x2, y: y2
        }]);
        this.canvas.add(line);
        this.canvas.simulator.arrayOfLines.push(line);
        return line;
    }

    movingControlPointsCallback() {
        if (!this.element.line) {
            return;
        }
        let mm = this.calculateTextMeasure();
        if (this.canvas.simulator.arrayOfLines.length > 1) {
            for (const line of this.canvas.simulator.arrayOfLines) {
                if (line !== this.element.line) {
                    let collidingPoint = this.checkIfLinesCollide(this.element.line, line);
                    if (collidingPoint != null) {
                        let angleBetweenLines = this.getAngleBetweenRules(this.element.line, line);
                        this.setAnglesInCanvas({ '0': angleBetweenLines }, collidingPoint.p0);
                        if (this.canvas.simulator.triangle) {
                            this.canvas.remove(this.canvas.simulator.triangle);

                        }
                        let p0 = this.getPointCoord(this.element.line, 0);
                        let p1 = this.getPointCoord(this.element.line, 1);
                        let q0 = this.getPointCoord(line, 0);
                        let q1 = this.getPointCoord(line, 1);
                        console.log("punto final linea 1", p1.x, p1.y);
                        console.log("punto final linea 2", q1.x, q1.y);
                        this.canvas.simulator.triangle = this.createTriangle(collidingPoint.p0.x, collidingPoint.p0.y, p1.x, p1.y, q1.x, q1.y);
                    }
                }
            }
        }
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
                stroke: 'black',
                strokeWidth: 0.05,
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

    checkIfLinesCollide(line1, line2) {
        //Get coord of the endpoints of each lines
        let p0 = this.getPointCoord(line1, 0);
        let p1 = this.getPointCoord(line1, 1);
        let q0 = this.getPointCoord(line2, 0);
        let q1 = this.getPointCoord(line2, 1);

        //Calculate the slopes and y-inter of each line
        let m1 = (p1.y - p0.y) / (p1.x - p0.x);
        let b1 = p0.y - m1 * p0.x;

        let m2 = (q1.y - q0.y) / (q1.x - q0.x);
        let b2 = q0.y - m2 * q0.x;

        //Calculate the point of intersection
        let x = (b2 - b1) / (m1 - m2);
        let y = m1 * x + b1;

        console.log("punto interseccion", x, y)

        //Check if the point of intersection is within the range of both lines coord
        if (x >= Math.min(p0.x, p1.x) && x <= Math.max(p0.x, p1.x) &&
            x >= Math.min(q0.x, q1.x) && x <= Math.max(q0.x, q1.x) &&
            y >= Math.min(p0.y, p1.y) && y <= Math.max(p0.y, p1.y) &&
            y >= Math.min(q0.y, q1.y) && y <= Math.max(q0.y, q1.y)) {
            return {
                p0: { x: x, y: y },
                p1: { x: p1.x, y: p1.y },
                p2: { x: q1.x, y: q1.y }
            }
        }
        return null;
    };

    getAngleBetweenRules(line1, line2) {
        let p0 = this.getPointCoord(line1, 0);
        let p1 = this.getPointCoord(line1, 1);
        let q0 = this.getPointCoord(line2, 0);
        let q1 = this.getPointCoord(line2, 1);

        let d1 = { x: p1.x - p0.x, y: p1.y - p0.y };
        let d2 = { x: q1.x - q0.x, y: q1.y - q0.y };

        let dot = d1.x * d2.x + d1.y * d2.y;
        let mag1 = Math.sqrt(d1.x * d1.x + d1.y * d1.y);
        let mag2 = Math.sqrt(d2.x * d2.x + d2.y * d2.y);

        let angle = Math.acos(dot / (mag1 * mag2));
        let angle_degrees = angle * 180 / Math.PI;

        if (angle_degrees > 90) {
            angle_degrees = 180 - angle_degrees;
        }
        return angle_degrees.toFixed(2);
    };

    createTriangle(x1, y1, x2, y2, x3, y3) {
        let triangle = new fabric.Polygon([{
            x: x1, y: y1
        }, {
            x: x2, y: y2
        }, {
            x: x3, y: y3
        },], {
            fill: 'transparent',
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            objectCaching: false,
            transparentCorners: false,
            hasBorders: false,
            cornerSize: 50,
            cornerStyle: 'circle',
            cornerColor: 'rgba(255, 0, 0, 0.2)',
        });
        this.canvas.add(triangle);
        triangle.absolutePositioned = true;
        return triangle;
    }

    setAnglesInCanvas(angles, p) {
        Object.keys(angles).forEach(point => {
            let text = angles[point] + 'º';
            if (!this.element['circle' + point]) {
                this.element['circle' + point] = new fabric.Circle({
                    fill: 'transparent',
                    strokeWidth: this.canvas.freeDrawingBrush.width,
                    stroke: this.canvas.freeDrawingBrush.color,
                    originX: 'center',
                    originY: 'center',
                    hasBorders: false,
                    hasControls: false,
                    selectable: false,
                    radius: 10,
                });
                this.canvas.simulator.setBackgroundOptions(this.element['circle' + point]);
                this.canvas.add(this.element['circle' + point]);
            }
            if (!this.element['angle' + point]) {
                this.element['angle' + point] = new fabric.Text(text, {
                    fontSize: 12,
                    stroke: 'black',
                    strokeWidth: 0.1,
                    fill: this.canvas.freeDrawingBrush.color
                });
                this.canvas.simulator.setBackgroundOptions(this.element['angle' + point]);
                this.canvas.add(this.element['angle' + point]);
            }
            this.element['circle' + point].set({
                left: p.x,
                top: p.y,
            });
            this.element['angle' + point].set({
                text: text,
                left: p.x,
                top: p.y,
            });
            this.element['circle' + point].clipPath = this.canvas.simulator.triangle;
        });
    }
}
