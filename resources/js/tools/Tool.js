export class Tool {
    canvas;
    toolName;
    element = {};
    constructor(canvas, toolName = null) {
        this.canvas = canvas;
        this.simulator = canvas.simulator;
        if (toolName) {
            this.toolName = toolName;
            this.setActiveTool(toolName);
        }
        this.canvas.isDrawingMode = false;
        this.setBrushOptions();
    }

    setBrushOptions(width = null) {
        this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
        this.canvas.freeDrawingBrush.color = document.getElementById('pincelcolor').value;
        this.canvas.freeDrawingBrush.width = width ?? parseFloat(document.getElementById('pincelsize').value);
        this.canvas.freeDrawingBrush.decimate = 0;
    }

    resetEvents() {
        this.canvas.discardActiveObject()
        this.canvas.requestRenderAll();
        this.canvas.off();
        this.canvas.on('mouse:wheel', event => this.zoomToPoint(event));
        this.canvas.on('touch:gesture', event => {
            if (event.e.touches && event.e.touches.length === 2) {
                if (event.self.state == "start") {
                    this.canvas.zoomStartScale = this.canvas.getZoom();
                }
                let zoom = this.canvas.zoomStartScale * event.self.scale;
                if (zoom > 20) zoom = 20;
                if (zoom < 0.01) zoom = 0.01;
                this.canvas.zoomToPoint({ x: event.self.x, y: event.self.y }, zoom);
                event.e.preventDefault();
                event.e.stopPropagation();
            }
        });
    }

    setDefaultObjectOptions(object) {
        object.set({
            lockScalingFlip: true,
            lockScalingX: true,
            lockScalingY: true,
            lockSkewingX: true,
            lockSkewingY: true,
            selectable: true,
            borderColor: 'red',
            cornerSize: 20,
            padding: 10,
            cornerStyle: 'circle',
            cornerColor: '#f08080',
            transparentCorners: false,
            hasBorders: true,
        });
        object.controls.mtr.offsetY = -parseFloat(60);
        object.setControlsVisibility({
            tl: false,
            bl: false,
            tr: false,
            br: false,
            ml: false,
            mb: false,
            mr: false,
            mt: false,
        });
        this.setDeleteControl(object);
        // Descomentar para limitar los objetos a la imagen
        // object.clipPath = this.simulator.limitClipPathField;
        object.on('mousedown', this.objectMouseDownEvent);
        object.element = this.element;
    }

    objectMouseDownEvent(event) {
        if (event.target) {
            this.canvas?.bringToFront(event.target);
        }
    }

    setDeleteControl(object, offset = 16, position = 0.5) {
        object.controls.deleteControl = new fabric.Control({
            x: position,
            y: -position,
            offsetY: -offset,
            offsetX: offset,
            cursorStyle: 'pointer',
            mouseDownHandler: (eventData, transform) => {
                let target = transform.target;
                let targetId = target?.id;
                if (target?.element) {
                    for (const [key, value] of Object.entries(target.element)) {
                        if (value instanceof fabric.Object) {
                            this.canvas.remove(value);
                        } else {
                            for (const [subKey, subValue] of Object.entries(value)) {
                                if (subValue instanceof fabric.Object) {
                                    this.canvas.remove(subValue);
                                }
                            }
                        }
                    }
                }
                if (targetId) {
                    for (const keyAngle in this.simulator.lineAngles) {
                        let lines = this.canvas.getObjects().filter((line) => line?.id === (keyAngle - targetId));
                        if (lines.length > 0) {
                            lines[0].tool.removeAngle(lines[0].id + targetId);
                        }
                    }
                }
                if (target?.iid) {
                    let index = this.simulator.usedImplants.indexOf(target.iid)
                    if (index > -1) {
                        this.simulator.usedImplants.splice(index, 1);
                    }
                }
                this.canvas.remove(target);
                this.canvas.requestRenderAll();
            },
            render: function (ctx, left, top, styleOverride, fabricObject) {
                let deleteImg = document.createElement('img');
                deleteImg.src = '/img/circle-xmark-regular.svg';
                deleteImg.style.width = '100%'
                deleteImg.style.height = 'auto'
                let size = this.cornerSize;
                ctx.save();
                ctx.translate(left, top);
                ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
                ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
                ctx.restore();
            },
            cornerSize: 24
        });
    }

    setActiveTool(toolName) {
        document.querySelectorAll('#offcanvas-herramientas button').forEach(li => li.classList.remove('bg-yellow-500', 'text-black'));
        this.simulator.offcanvasToggler('offcanvas-herramientas', false);
        document.getElementById(toolName)?.classList.add('bg-yellow-500', 'text-black');
    }

    zoomToPoint(event) {
        let delta = event.e.deltaY;
        let zoom = this.canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        let textObjects = this.canvas.getObjects('text')
        textObjects?.forEach((text) => {
            this.setTextZoomInCanvas(text, zoom);
        });
        let circleObjects = this.canvas.getObjects('circle')
        circleObjects?.forEach((circle) => {
            if (circle?.isAngle) {
                this.setCircleZoomInCanvas(circle, zoom);
            }
        });
        this.canvas.zoomToPoint({ x: event.e.offsetX, y: event.e.offsetY }, zoom);
        event.e.preventDefault();
        event.e.stopPropagation();
    }

    setCircleZoomInCanvas(circle, zoom) {
        let newZoom = 2 / zoom;
        if (newZoom > 2) {
            return
        }
        circle.scaleX = newZoom;
        circle.scaleY = newZoom;
    };

    setTextZoomInCanvas(text, zoom) {
        let newZoom = 2 / zoom;
        if (newZoom > 2) {
            return
        }
        text.scaleX = newZoom;
        text.scaleY = newZoom;
    };

    getOriginOfRotation(object, x, y) {
        let brPoints = object.oCoords.br;
        let tlPoints = object.oCoords.tl;

        let xFirstDiff = brPoints.x - tlPoints.x;
        let yFirstDiff = brPoints.y - tlPoints.y;

        let xSecondDiff = x - tlPoints.x;
        let ySecondDiff = y - tlPoints.y;

        let newOriginX = xSecondDiff / xFirstDiff;
        let newOriginY = ySecondDiff / yFirstDiff;
        return {
            x: newOriginX,
            y: newOriginY
        }
    }

    calculate(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 * 1 - x1 * 1, 2) + Math.pow(y2 * 1 - y1 * 1, 2));
    }

    getPointCoord(object, pointIndex) {
        let matrix = object.calcTransformMatrix();
        return fabric.util.transformPoint(new fabric.Point(
            object.points[pointIndex].x - object.pathOffset.x,
            object.points[pointIndex].y - object.pathOffset.y
        ), matrix);
    }

    polygonPositionHandler(dim, finalMatrix, fabricObject) {
        if (!fabricObject.canvas) {
            return [0, 0, 0, 0, 0, 0];
        }
        let x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x);
        let y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
        let point = fabric.util.transformPoint(
            { x: x, y: y },
            fabric.util.multiplyTransformMatrices(
                fabricObject.canvas.viewportTransform,
                fabricObject.calcTransformMatrix()
            ),
        );
        if (this?.tool?.movingControlPointsCallback) {
            this.tool.movingControlPointsCallback();
        }
        return point;
    }

    getObjectSizeWithStroke(object) {
        let stroke = new fabric.Point(
            object.strokeUniform ? 1 / object.scaleX : 1,
            object.strokeUniform ? 1 / object.scaleY : 1
        ).multiply(object.strokeWidth);
        return new fabric.Point(object.width + stroke.x, object.height + stroke.y);
    }

    actionHandler(eventData, transform, x, y) {
        let polygon = transform.target;
        let currentControl = polygon.controls[polygon.__corner];
        let mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center');
        let polygonBaseSize = this.getObjectSizeWithStroke(polygon);
        let size = polygon._getTransformedDimensions(0, 0);
        let finalPointPosition = {
            x: mouseLocalPosition.x * polygonBaseSize.x / size.x + polygon.pathOffset.x,
            y: mouseLocalPosition.y * polygonBaseSize.y / size.y + polygon.pathOffset.y
        };
        polygon.points[currentControl.pointIndex] = finalPointPosition;
        return true;
    }

    anchorWrapper(anchorIndex) {
        return (eventData, transform, x, y) => {
            let fabricObject = transform.target;
            let absolutePoint = fabric.util.transformPoint({
                x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
                y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
            }, fabricObject.calcTransformMatrix());
            let actionPerformed = this.actionHandler(eventData, transform, x, y);
            fabricObject._setPositionDimensions({});
            let polygonBaseSize = this.getObjectSizeWithStroke(fabricObject);
            let newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x;
            let newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
            fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
            return actionPerformed;
        }
    }

    createPolygon(points) {
        let polygon = new fabric.Polygon(points, {
            fill: 'transparent',
            strokeWidth: this.canvas.freeDrawingBrush.width,
            stroke: this.canvas.freeDrawingBrush.color,
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
            objectCaching: false,
            transparentCorners: false,
            hasBorders: false,
            cornerSize: 50,
            cornerStyle: 'circle',
            cornerColor: 'rgba(255, 0, 0, 0.2)',
        });
        polygon.controls = polygon.points.reduce((acc, point, index) => {
            acc['p' + index] = new fabric.Control({
                positionHandler: this.polygonPositionHandler,
                actionHandler: this.anchorWrapper(index > 0 ? index - 1 : (polygon.points.length - 1)),
                actionName: 'modifyPolygon',
                pointIndex: index,
                tool: this
            });
            return acc;
        }, {});
        polygon.set(this.simulator.getCenterOfView(polygon));
        return polygon;
    }

}
