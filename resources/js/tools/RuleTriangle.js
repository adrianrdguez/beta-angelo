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

    createTriangle() {
        let triangleSize = 10;
        let vertexTopLeftX = -(this.canvas.width / triangleSize);
        let vertexTopLeftY = -(this.canvas.width / triangleSize);
        let vertexTopRightX = (this.canvas.width / triangleSize);
        let vertexTopRightY = -(this.canvas.width / triangleSize);
        let vertexBottomMiddleX1 = vertexTopRightX + vertexTopLeftX;
        let vertexBottomMiddleY1 = (this.canvas.width / triangleSize);
        this.element.triangle = new fabric.Polygon([
            { x: vertexTopLeftX, y: vertexTopLeftY },
            { x: vertexTopRightX, y: vertexTopRightY },
            { x: vertexBottomMiddleX1, y: vertexBottomMiddleY1 },
        ]);
        this.setDefaultObjectOptions(this.element.triangle);
        this.element.triangle.set({
            stroke: this.canvas.freeDrawingBrush.color,
            strokeWidth: this.canvas.freeDrawingBrush.width,
            strokeLineCap: 'round',
            hasBorders: false,
        });
        this.element.triangle.setControlsVisibility({
            mtr: false,
        });
        this.canvas.add(this.element.triangle);
        this.element.triangle.center();
        this.element.angle1 = this.createAngle(this.element.triangle.points[0]);
        this.element.angle2 = this.createAngle(this.element.triangle.points[1]);
        this.element.angle3 = this.createAngle(this.element.triangle.points[2]);
        this.element.triangle.on('moving', () => {
            this.setTextInTheMiddleOfLine();
            this.updateAngles();
        });
        this.addPointControls(this.element.triangle);
        this.setTextInTheMiddleOfLine();
        //this.getAngleBetweenLines(this.element.line1, this.element.line3);
        this.canvas.requestRenderAll();
    }

    addPointControls(object) {
        let lastControl = object.points.length - 1;
        object.cornerStyle = 'circle';
        object.cornerColor = 'rgba(255,0,0,0.1)';
        object.cornerSize = 50;
        object.cornerStrokeColor = 'red';
        object.controls = object.points.reduce((acc, point, index) => {
            acc['p' + index] = new fabric.Control({
                positionHandler: () => this.polygonPositionHandler(index),
                actionHandler: this.anchorWrapper(index > 0 ? index - 1 : lastControl, this.actionHandler),
                actionName: 'modifyPolygon',
                pointIndex: index
            });
            return acc;
        }, {});
        this.setDeleteControl(object);
    }

    polygonPositionHandler(index) {
        var x = (this.element.triangle.points[index].x - this.element.triangle.pathOffset.x),
            y = (this.element.triangle.points[index].y - this.element.triangle.pathOffset.y);
        this.updateAngles();
        this.setTextInTheMiddleOfLine();
        return fabric.util.transformPoint(
            { x: x, y: y },
            fabric.util.multiplyTransformMatrices(
                this.element.triangle.canvas.viewportTransform,
                this.element.triangle.calcTransformMatrix()
            )
        );
    }

    actionHandler(eventData, transform, x, y) {
        var polygon = transform.target,
            currentControl = polygon.controls[polygon.__corner],
            mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
            stroke = new fabric.Point(
                polygon.strokeUniform ? 1 / polygon.scaleX : 1,
                polygon.strokeUniform ? 1 / polygon.scaleY : 1
            ).multiply(polygon.strokeWidth),
            polygonBaseSize = new fabric.Point(polygon.width + stroke.x, polygon.height + stroke.y),
            size = polygon._getTransformedDimensions(0, 0),
            finalPointPosition = {
                x: mouseLocalPosition.x * polygonBaseSize.x / size.x + polygon.pathOffset.x,
                y: mouseLocalPosition.y * polygonBaseSize.y / size.y + polygon.pathOffset.y
            };
        polygon.points[currentControl.pointIndex] = finalPointPosition;
        return true;
    }

    anchorWrapper(anchorIndex, fn) {
        return (eventData, transform, x, y) => {
            var fabricObject = transform.target,
                absolutePoint = fabric.util.transformPoint({
                    x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
                    y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
                }, fabricObject.calcTransformMatrix()),
                actionPerformed = fn(eventData, transform, x, y),
                stroke = new fabric.Point(
                    fabricObject.strokeUniform ? 1 / fabricObject.scaleX : 1,
                    fabricObject.strokeUniform ? 1 / fabricObject.scaleY : 1
                ).multiply(fabricObject.strokeWidth),
                polygonBaseSize = new fabric.Point(fabricObject.width + stroke.x, fabricObject.height + stroke.y),
                newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
                newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
            fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
            return actionPerformed;
        }
    }

    createAngle(point) {
        let triangleCenter = this.element.triangle.getCenterPoint();
        let angle = new fabric.Circle({
            radius: 20,
            stroke: 'red',
            strokeWidth: this.canvas.freeDrawingBrush.width,
            top: point.y + triangleCenter.y,
            left: point.x + triangleCenter.x,
            originX: 'center',
            originY: 'center',
            fill: 'transparent',
            clipPath: this.element.triangle,
            inverted: true,
        });
        this.canvas.simulator.setBackgroundOptions(angle)
        this.canvas.add(angle);
        return angle;
    }

    updateAngles() {
        let triangleCenter = this.element.triangle.getCenterPoint();
        this.element.triangle.points.forEach((point, i) => {
            this.element['angle' + (i + 1)].set({
                top: point.y + triangleCenter.y,
                left: point.x + triangleCenter.x,
            });
        });
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

    setTextInTheMiddleOfLine() {
        let triangleCenter = this.element.triangle.getCenterPoint();
        this.element.text1 = this.createOrUpdateText(this.element.text1, {
            x1: this.element.triangle.points[0].x + triangleCenter.x,
            y1: this.element.triangle.points[0].y + triangleCenter.y,
            x2: this.element.triangle.points[1].x + triangleCenter.x,
            y2: this.element.triangle.points[1].y + triangleCenter.y
        });
        this.element.text2 = this.createOrUpdateText(this.element.text2, {
            x1: this.element.triangle.points[1].x + triangleCenter.x,
            y1: this.element.triangle.points[1].y + triangleCenter.y,
            x2: this.element.triangle.points[2].x + triangleCenter.x,
            y2: this.element.triangle.points[2].y + triangleCenter.y
        });
        this.element.text3 = this.createOrUpdateText(this.element.text3, {
            x1: this.element.triangle.points[2].x + triangleCenter.x,
            y1: this.element.triangle.points[2].y + triangleCenter.y,
            x2: this.element.triangle.points[0].x + triangleCenter.x,
            y2: this.element.triangle.points[0].y + triangleCenter.y
        });
        this.canvas.requestRenderAll();
    }

    createOrUpdateText(text, line) {
        let firstLineMeasureMm = this.canvas.simulator.firstLineMeasureMm;
        let firstLineMeasurePx = this.canvas.simulator.firstLineMeasurePx;
        let px = this.calculate(line.x1, line.y1, line.x2, line.y2).toFixed(2);
        let mm = ((px * firstLineMeasureMm) / firstLineMeasurePx).toFixed(2);
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
