import { Tool } from './Tool.js';
import { Drag } from './Drag.js';

export class Rule extends Tool {
    constructor(canvas) {
        super(canvas, 'rule');
        this.resetEvents();
        this.element.line = this.createLine(-100, 0, 100, 0);
        this.movingControlPointsCallback();
        this.element.line.element = this.element;
        this.setDeleteControl(this.element.line, 40, 0);
        this.simulator.setCurrentTool(new Drag(this.canvas));
    }

    createLine(x1, y1, x2, y2) {
        let line = this.createPolygon([{
            x: x1, y: y1
        }, {
            x: x2, y: y2
        }]);
        this.canvas.add(line);
        line.id = Date.now();
        line.tool = this;
        return line;
    }

    movingControlPointsCallback() {
        if (!this.element.line) {
            return;
        }

        let mm = this.calculateTextMeasure();
        this.setTextInCanvas(mm + 'mm');

        let lines = this.canvas.getObjects().filter((line) => line?.id);
        for (const line of lines) {
            let keyAngle = this.element.line.id + line.id;
            if (this.checkIfLinesCollide(this.element.line, line)) {
                this.createOrUpdateAngle(this.element.line, line, keyAngle);
            } else if (this.simulator.lineAngles[keyAngle]) {
                this.removeAngle(keyAngle);
            }
        }
    }

    createOrUpdateAngle(line1, line2, keyAngle) {
        let coords = this.getCoordsOfCollidingLines(line1, line2);
        let angle = this.getAngleBetweenRules(line1, line2);
        let p1 = coords.p1;
        let p3 = coords.p3;
        if (angle > 90) {
            angle = 180 - angle;
            p1 = coords.p0;
        }
        if (this.checkDistanceToCollidePoint(coords.pc.x, coords.pc.y, p1.x, p1.y, coords.p3.x, coords.p3.y)) {
            p1 = (angle > 90) ? coords.p1 : coords.p0;
            p3 = (angle > 90) ? coords.p3 : coords.p2;
        }
        let roundedAngle = Math.round(angle);
        let text = (roundedAngle % 1 === 0.5 ? roundedAngle + 0.1 : roundedAngle) + 'º';
        if (!this.simulator.lineAngles[keyAngle]) {
            this.simulator.lineAngles[keyAngle] = {};
            this.simulator.lineAngles[keyAngle].triangle = this.createTriangle(coords.pc.x, coords.pc.y, p1.x, p1.y, p3.x, p3.y);
            this.simulator.lineAngles[keyAngle].circle = this.createAngleCircle(this.simulator.lineAngles[keyAngle].triangle);
            this.simulator.lineAngles[keyAngle].text = this.createAngleText(text);
            this.element[keyAngle] = {
                triangle: this.simulator.lineAngles[keyAngle].triangle,
                circle: this.simulator.lineAngles[keyAngle].circle,
                text: this.simulator.lineAngles[keyAngle].text
            };
        }
        this.simulator.lineAngles[keyAngle].triangle.set({
            points: [
                { x: coords.pc.x, y: coords.pc.y },
                { x: p1.x, y: p1.y },
                { x: p3.x, y: p3.y },
            ],
        });
        this.simulator.lineAngles[keyAngle].triangle._setPositionDimensions({});
        this.simulator.lineAngles[keyAngle].circle.set({
            left: coords.pc.x,
            top: coords.pc.y,
        });
        this.simulator.lineAngles[keyAngle].text.set({
            text: text,
            left: coords.pc.x,
            top: coords.pc.y,
        });
    }

    checkDistanceToCollidePoint(x1, y1, x2, y2, x3, y3) {
        let x2diff = x1 - x2;
        let y2diff = y1 - y2;
        let distance1 = Math.sqrt(x2diff ** 2 + y2diff ** 2);

        let x3diff = x1 - x3;
        let y3diff = y1 - y3;
        let distance2 = Math.sqrt(x3diff ** 2 + y3diff ** 2);

        return !!(distance1 < 15 || distance2 < 15);
    }

    removeAngle(keyAngle) {
        this.canvas.remove(this.simulator.lineAngles[keyAngle].triangle);
        this.canvas.remove(this.simulator.lineAngles[keyAngle].circle);
        this.canvas.remove(this.simulator.lineAngles[keyAngle].text);
        delete this.simulator.lineAngles[keyAngle];
    }

    calculateTextMeasure() {
        let realMeasure = this.simulator.firstLineMeasureMm;
        let firstLineMeasurePx = this.simulator.firstLineMeasurePx;
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
                strokeWidth: 0.10,
                fill: this.canvas.freeDrawingBrush.color,
                fontFamily: 'Nunito'
            });
            this.simulator.setBackgroundOptions(this.element.text);
            this.canvas.add(this.element.text);
        }
        let p0 = this.getPointCoord(this.element.line, 0);
        let p1 = this.getPointCoord(this.element.line, 1);

        let angle = Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
        let centerX = (p0.x + p1.x) / 2;
        let centerY = (p0.y + p1.y) / 2;
        let distance = -10;
        let dx = distance * Math.sin(angle * Math.PI / 180);
        let dy = distance * Math.cos(angle * Math.PI / 180);

        this.element.text.set({
            text: text,
            left: centerX + dx,
            top: centerY - dy,
            angle: angle,
            originX: 'center',
            originY: 'center',
            flipY: (angle >= 90 && angle <= 270),
            flipX: (angle >= 90 && angle <= 270)
        });
    }

    checkIfLinesCollide(line1, line2) {
        if (line1 === line2) {
            return false;
        }
        let coords = this.getCoordsOfCollidingLines(line1, line2);
        //Check if the point of intersection is within the range of both lines coord
        return !!(
            coords.pc.x >= Math.min(coords.p0.x, coords.p1.x) && coords.pc.x <= Math.max(coords.p0.x, coords.p1.x) &&
            coords.pc.x >= Math.min(coords.p2.x, coords.p3.x) && coords.pc.x <= Math.max(coords.p2.x, coords.p3.x) &&
            coords.pc.y >= Math.min(coords.p0.y, coords.p1.y) && coords.pc.y <= Math.max(coords.p0.y, coords.p1.y) &&
            coords.pc.y >= Math.min(coords.p2.y, coords.p3.y) && coords.pc.y <= Math.max(coords.p2.y, coords.p3.y)
        );
    };

    getCoordsOfCollidingLines(line1, line2) {
        //Get coord of the endpoints of each lines
        let p0 = this.getPointCoord(line1, 0);
        let p1 = this.getPointCoord(line1, 1);
        let p2 = this.getPointCoord(line2, 0);
        let p3 = this.getPointCoord(line2, 1);

        //Calculate the slopes and y-inter of each line
        let m1 = (p1.y - p0.y) / (p1.x - p0.x);
        let b1 = p0.y - m1 * p0.x;

        let m2 = (p3.y - p2.y) / (p3.x - p2.x);
        let b2 = p2.y - m2 * p2.x;

        //Calculate the point of intersection
        let pc = {};
        pc.x = (b2 - b1) / (m1 - m2);
        pc.y = m1 * pc.x + b1;
        return { pc: pc, p0: p0, p1: p1, p2: p2, p3: p3 };
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

        return angle_degrees;
    };

    createTriangle(x1, y1, x2, y2, x3, y3) {
        let triangle = new fabric.Polygon([{
            x: x1, y: y1
        }, {
            x: x2, y: y2
        }, {
            x: x3, y: y3
        },], {
            objectCaching: false,
            fill: 'transparent',
            absolutePositioned: true,
        });
        this.simulator.setBackgroundOptions(triangle);
        this.canvas.add(triangle);
        return triangle;
    }

    createAngleCircle(triangle) {
        let circle = new fabric.Circle({
            fill: 'transparent',
            strokeWidth: this.canvas.freeDrawingBrush.width,
            stroke: this.canvas.freeDrawingBrush.color,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false,
            selectable: false,
            radius: 10,
            clipPath: triangle
        });
        this.simulator.setBackgroundOptions(circle);
        this.canvas.add(circle);
        return circle;
    }

    createAngleText(text) {
        let circle = new fabric.Text(text, {
            fontSize: 12,
            stroke: 'black',
            strokeWidth: 0.10,
            fill: this.canvas.freeDrawingBrush.color,
            fontFamily: 'Nunito'
        });
        this.simulator.setBackgroundOptions(circle);
        this.canvas.add(circle);
        return circle;
    }

}
