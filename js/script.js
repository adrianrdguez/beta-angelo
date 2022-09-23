class Simulator {
    constructor(radiographyUrl) {
        this.radiographyUrl = radiographyUrl;
        this.radiographyImg = null;
        this.limitClipPathField = null;
        this.canvas = new fabric.Canvas('simulador', { selection: false });
        this.setCanvasSize(this.canvas);
        fabric.Image.fromURL(this.radiographyUrl, (img) => {
            this.canvas.add(img);
            img.center();
            img.clone((imgCloned) => {
                this.radiographyImg = imgCloned;
            })
            this.setBackgroundOptions(img);
            this.limitClipPathField = new fabric.Rect({
                width: img.width + 1,
                height: img.height + 1,
                top: img.top - 1,
                left: img.left - 1,
                absolutePositioned: true
            });
        });
    }

    // ------------- Eventos -------------------

    init = () => {
        window.onresize = () => { this.setCanvasSize(this.canvas) }
        document.getElementById('adding-line-btn').addEventListener('click', (event) => { this.setListActive(event); this.setRuleMode() });
        document.getElementById('drawing-btn').addEventListener('click', (event) => { this.setListActive(event); this.setDrawingMode() });
        document.getElementById('dragging-btn').addEventListener('click', (event) => { this.setListActive(event); this.setDraggingMode() });
        document.getElementById('free-cut-btn').addEventListener('click', (event) => { this.setListActive(event); this.setFreeCutMode() });
        this.canvas.on('mouse:wheel', this.zoomToPoint);
        this.canvas.on('mouse:down', (event) => {
            if (this.canvas.isRuleMode || this.canvas.isCuttingMode) {
                this.startAddingLine(event);
            } else if (!event.target && !this.canvas.isDrawingMode) {
                this.activateDraggingMode(event);
            }
        });
        this.canvas.on('mouse:move', (event) => {
            if (this.canvas.isRuleMode || this.canvas.isCuttingMode) {
                this.startDrawingLine(event);
            } else if (this.canvas.isDragging) {
                this.dragScreen(event);
            }
        });
        this.canvas.on('mouse:up', () => {
            if (this.canvas.isRuleMode || this.canvas.isCuttingMode) {
                this.stopDrawingLine();
            } else if (this.canvas.isDragging) {
                this.disableDraggingMode();
            }
        });
        this.canvas.on('path:created', (event) => {
            let linePath = event.path;
            if (this.canvas.isCuttingMode) {
                this.cutPath(linePath);
            } else {
                this.setBackgroundOptions(linePath);
            }
        });
        this.canvas.on('mouse:dblclick', (event) => {
            this.addingControlPoints(event);
        });
    }

    setListActive = (event) => {
        document.querySelectorAll('.list').forEach(li => li.classList.remove("active"));
        event.currentTarget.classList.add("active")
    }

    setCanvasSize = (canvas) => {
        canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }

    zoomToPoint = (event) => {
        let delta = event.e.deltaY;
        let zoom = this.canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        this.canvas.zoomToPoint({ x: event.e.offsetX, y: event.e.offsetY }, zoom);
        event.e.preventDefault();
        event.e.stopPropagation();
    }

    activateDraggingMode = (event) => {
        event = event.e;
        this.canvas.isDragging = true;
        this.canvas.lastPosX = event.clientX;
        this.canvas.lastPosY = event.clientY;
    }

    disableDraggingMode = () => {
        this.canvas.setViewportTransform(this.canvas.viewportTransform);
        this.canvas.isDragging = false;
    }

    dragScreen = (event) => {
        let e = event.e;
        let vpt = this.canvas.viewportTransform;
        vpt[4] += e.clientX - this.canvas.lastPosX;
        vpt[5] += e.clientY - this.canvas.lastPosY;
        this.canvas.requestRenderAll();
        this.canvas.lastPosX = e.clientX;
        this.canvas.lastPosY = e.clientY;
    }


    // ------------- Modos -------------------

    setDraggingMode = () => {
        this.canvas.isDragging = false;
        this.canvas.isDrawingMode = false;
        this.canvas.isRuleMode = false;
        this.canvas.isCuttingMode = false;
    }

    setRuleMode = () => {
        this.setDraggingMode();
        this.canvas.isRuleMode = true;
    }

    startAddingLine = (event) => {
        let pointer = this.canvas.getPointer(event.e);

        let line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            id: 'added-line',
            stroke: 'red',
            strokeWidth: this.canvas.freeDrawingBrush.width ?? 3,
            selectable: false
        })

        this.canvas.line = line;
        this.canvas.add(line);
        this.canvas.requestRenderAll();
    }

    startDrawingLine = (event) => {
        if (this.canvas.line) {
            let pointer = this.canvas.getPointer(event.e);

            this.canvas.line.set({
                x2: pointer.x,
                y2: pointer.y
            });

            this.canvas.requestRenderAll()
        }
    }

    stopDrawingLine = () => {
        this.canvas.line.setCoords();
        delete this.canvas.line;
        this.setDraggingMode();
        this.setListActive({currentTarget: document.getElementById('dragging-btn')})
    }

    setDrawingMode = (width = 1, color = 'red', isCuttingMode = false) => {
        this.setDraggingMode();
        this.canvas.isDrawingMode = true;
        this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
        this.canvas.freeDrawingBrush.color = color;
        this.canvas.freeDrawingBrush.width = width;
        this.canvas.freeDrawingBrush.decimate = 0;
        this.canvas.isCuttingMode = isCuttingMode;
    }

    setFreeCutMode = () => {
        this.setDrawingMode(0.3, 'red', true);
    }

    // ------------- Opciones de herramienta adicionales -------------------

    removeElement = (element = null) => {
        element = element ?? this.canvas.getObjects().pop();
        if (element && this.canvas.getObjects().length > 1) {
            if (element.associatedChild) {
                this.removeElement(element.associatedChild)
            }
            this.canvas.remove(element);
        }
    }

    undoLastDraw = () => {
        let path = this.canvas.getObjects('path').pop();
        if (path) {
            this.canvas.remove(path);
        }
    }

    clearDraws = () => {
        for (let path of this.canvas.getObjects('path')) {
            this.canvas.remove(path);
        }
    }

    updateNewLineCoordinates = (object) => {
        let obj = object.target;

        // Todo: Cambiar la forma de identificar el objeto, en html los id no pueden repetirse
        if (obj?.id === 'added-line') {
            let centerX = obj.getCenterPoint().x;
            let centerY = obj.getCenterPoint().y;

            let x1offset = obj.calcLinePoints().x1;
            let y1offset = obj.calcLinePoints().y1;
            let x2offset = obj.calcLinePoints().x2;
            let y2offset = obj.calcLinePoints().y2;

            return {
                x1: centerX + x1offset,
                y1: centerY + y1offset,
                x2: centerX + x2offset,
                y2: centerY + y2offset
            }
        }
    }

    addingControlPoints = (object) => {
        let obj = object.target;

        let newLineCoords = this.updateNewLineCoordinates(object);

        if (!obj) {
            return;
        } else {
            // Todo: Cambiar la forma de identificar el objeto, en html los id no pueden repetirse
            if (obj?.id === 'added-line') {
                let pointer1 = new fabric.Circle({
                    id: 'pointer1',
                    radius: obj.strokeWidth * 6,
                    fill: 'red',
                    opacity: 0.5,
                    top: newLineCoords.y1,
                    left: newLineCoords.x1,
                    originX: 'center',
                    originY: 'center',
                    hasBorders: false,
                    hasControls: false
                })

                let pointer2 = new fabric.Circle({
                    id: 'pointer2',
                    radius: obj.strokeWidth * 6,
                    fill: 'red',
                    opacity: 0.5,
                    top: newLineCoords.y2,
                    left: newLineCoords.x2,
                    originX: 'center',
                    originY: 'center',
                    hasBorders: false,
                    hasControls: false
                })

                this.canvas.add(pointer1, pointer2);
                this.canvas.discardActiveObject();
                this.canvas.requestRenderAll();

                // TODO: Esto esta mal, cada vez que se ejecute un doble click se va a crear un evento?
                this.canvas.on('object:moving', this.endPointOfLineFollowPointer);
            }
        }
    }

    endPointOfLineFollowPointer = (object) => {
        let obj = object.target;

        // Todo: Cambiar la forma de identificar el objeto, en html los id no pueden repetirse
        if (obj?.id === 'pointer1') {
            this.canvas.getObjects().forEach(object => {
                if (object?.id === 'added-line') {
                    object.set({
                        x1: obj.left,
                        y1: obj.top
                    })
                    object.setCoords();
                }
            })
        }

        // Todo: Cambiar la forma de identificar el objeto, en html los id no pueden repetirse
        if (obj?.id === 'pointer2') {
            this.canvas.getObjects().forEach(object => {
                if (object?.id === 'added-line') {
                    object.set({
                        x2: obj.left,
                        y2: obj.top
                    })
                    object.setCoords();
                }
            })
        }
    }

    cutPath(linePath) {
        linePath.strokeWidth = 0;
        linePath.fill = 'black';
        fabric.Image.fromURL(linePath.toDataURL({ width: linePath.width + 20, height: linePath.height + 20 }), (lineImg) => {
            lineImg.left = linePath.left;
            lineImg.top = linePath.top;
            lineImg.width = linePath.width;
            lineImg.height = linePath.height;
            this.canvas.add(lineImg);
            this.setBackgroundOptions(lineImg);
            this.canvas.moveTo(lineImg, 1);
            fabric.Image.fromURL(this.radiographyUrl, (img) => {
                let imgCanvas = new fabric.Canvas();
                this.setCanvasSize(imgCanvas);
                imgCanvas.add(img);
                img.center();
                lineImg.absolutePositioned = true;
                img.clipPath = lineImg;
                fabric.Image.fromURL(imgCanvas.toDataURL({ left: lineImg.left, top: lineImg.top, width: lineImg.width, height: lineImg.height }), (img) => {
                    img.left = lineImg.left;
                    img.top = lineImg.top;
                    img.width = lineImg.width;
                    img.height = lineImg.height;
                    img.associatedChild = lineImg;
                    this.canvas.add(img);
                    this.setDefaultObjectOptions(img);
                    this.removeElement(this.canvas.line);
                    this.undoLastDraw();
                });
            });
        });
        this.canvas.requestRenderAll();
        this.setDraggingMode();
        this.setListActive({currentTarget: document.getElementById('dragging-btn')})
    }

    // ------------- Implantes -------------------

    setDefaultObjectOptions = (object) => {
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
        })
        this.addDeleteControl(object);
        object.clipPath = this.limitClipPathField;
    }

    addDeleteControl = (object) => {
        let img = document.createElement('img');
        img.src = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
        object.controls.deleteControl = new fabric.Control({
            x: 0.5,
            y: -0.5,
            offsetY: 16,
            cursorStyle: 'pointer',
            mouseUpHandler: (eventData, transform) => this.removeElement(transform.target),
            render: (ctx, left, top, styleOverride, fabricObject) => {
                let size = 24;
                ctx.save();
                ctx.translate(left, top);
                ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
                ctx.drawImage(img, -size / 2, -size / 2, size, size);
                ctx.restore();
            },
            cornerSize: 24
        });
    }

    setBackgroundOptions = (object) => {
        object.set({
            centeredRotation: false,
            centeredScaling: false,
            evented: false,
            hasBorders: false,
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingFlip: true,
            lockScalingX: true,
            lockScalingY: true,
            lockSkewingX: true,
            lockSkewingY: true,
            selectable: false,
        });
    }

    addImplantObject = (url) => {
        fabric.Image.fromURL(url, (img) => {
            this.canvas.add(img);
            img.center();
            this.setDefaultObjectOptions(img);
        });
        this.canvas.requestRenderAll();
    }

}

let simulator = new Simulator('img/radiografia.png');
simulator.init();
