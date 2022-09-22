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
        window.onresize = () => {this.setCanvasSize(this.canvas)}
        let addingLineButton = document.getElementById('adding-line-btn');
        addingLineButton.addEventListener('click', this.setRuleMode);

        let startDrawingLineButton = document.getElementById('drawing-btn');
        startDrawingLineButton.addEventListener('click', this.setDrawingMode);

        let startDraggingLineButton = document.getElementById('dragging-btn');
        startDraggingLineButton.addEventListener('click', this.setDraggingMode);

        this.canvas.on('mouse:wheel', this.zoomToPoint);
        this.canvas.on('mouse:down', (opt) => {
            if (this.canvas.isRuleMode || this.canvas.isCuttingMode) {
                this.startAddingLine(opt);
            } else if (!opt.target && !this.canvas.isDrawingMode) {
                this.activateDraggingMode(opt);
            }
        });
        this.canvas.on('mouse:move', (opt) => {
            if (this.canvas.isRuleMode || this.canvas.isCuttingMode) {
                this.startDrawingLine(opt);
            } else if (this.canvas.isDragging) {
                this.dragScreen(opt);
            }
        });
        this.canvas.on('mouse:up', () => {
            if (this.canvas.isRuleMode || this.canvas.isCuttingMode) {
                this.stopDrawingLine();
            } else if (this.canvas.isDragging) {
                this.disableDraggingMode();
            }
        });
        this.canvas.on('path:created', (opt) => {
            let linePath = opt.path;
            if (this.canvas.isCuttingMode) {
                this.cutPath(linePath);
            }
        });
        this.canvas.on('mouse:dblclick', (opt) => {
            this.addingControlPoints(opt);
        });
    }

    setCanvasSize = (canvas) => {
        canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }

    zoomToPoint = (opt) => {
        let delta = opt.e.deltaY;
        let zoom = this.canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
    }

    activateDraggingMode = (opt) => {
        let event = opt.e;
        this.canvas.isDragging = true;
        this.canvas.lastPosX = event.clientX;
        this.canvas.lastPosY = event.clientY;
    }

    disableDraggingMode = () => {
        this.canvas.setViewportTransform(this.canvas.viewportTransform);
        this.canvas.isDragging = false;
    }

    dragScreen = (opt) => {
        let e = opt.e;
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
        this.canvas.isRuleMode = true;
    }

    setNewRuleMode = () => {
        this.canvas.isNewRuleMode = true;
    }

    startAddingLine = (opt) => {
        let pointer = this.canvas.getPointer(opt.e);

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

    startDrawingLine = (opt) => {
        if (this.canvas.line) {
            let pointer = this.canvas.getPointer(opt.e);

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
    }

    setDrawingMode = (width = 1, color = '#fff', isCuttingMode = false) => {
        this.setDraggingMode();
        this.canvas.isDrawingMode = true;
        this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
        this.canvas.freeDrawingBrush.color = color;
        this.canvas.freeDrawingBrush.width = width;
        this.canvas.freeDrawingBrush.decimate = 0;
        if (isCuttingMode) {
            this.canvas.isCuttingMode = true;
        } else {
            this.canvas.isCuttingMode = false;
        }
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
        if (obj.id === 'added-line') {
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
            if (obj.id === 'added-line') {
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
        if (obj.id === 'pointer1') {
            this.canvas.getObjects().forEach(object => {
                if (object.id === 'added-line') {
                    object.set({
                        x1: obj.left,
                        y1: obj.top
                    })
                    object.setCoords();
                }
            })
        }

        // Todo: Cambiar la forma de identificar el objeto, en html los id no pueden repetirse
        if (obj.id === 'pointer2') {
            this.canvas.getObjects().forEach(object => {
                if (object.id === 'added-line') {
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
            cornerSize: 50,
            padding: 10,
            cornerStyle: 'circle',
            cornerColor: '#f08080',
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
        object.clipPath = this.limitClipPathField;
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

/*

// Falta refactorizar?

canvas.on({
    'object:moved': updateNewLineCoordinates,
    'selection:created': updateNewLineCoordinates,
    'selection:updated': updateNewLineCoordinates,
    'mouse:dblclick': addingControllPoints
}) */
