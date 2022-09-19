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

        this.canvas.on('mouse:wheel', this.zoomToPoint);
        this.canvas.on('mouse:down', (opt) => {
            if (this.canvas.isRuleMode) {
                this.startAddingLine(opt);
            } else if (!opt.target && !this.canvas.isDrawingMode) {
                this.activateDraggingMode(opt);
            }
        });
        this.canvas.on('mouse:move', (opt) => {
            if (this.canvas.isRuleMode) {
                this.startDrawingLine(opt);
            } else if (this.canvas.isDragging) {
                this.dragScreen(opt);
            }
        });
        this.canvas.on('mouse:up', () => {
            if (this.canvas.isRuleMode) {
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

    dragScreen = (opt) => {
        let e = opt.e;
        let vpt = this.canvas.viewportTransform;
        vpt[4] += e.clientX - this.canvas.lastPosX;
        vpt[5] += e.clientY - this.canvas.lastPosY;
        this.canvas.requestRenderAll();
        this.canvas.lastPosX = e.clientX;
        this.canvas.lastPosY = e.clientY;
    }

    disableDraggingMode = () => {
        this.canvas.setViewportTransform(this.canvas.viewportTransform);
        this.canvas.isDragging = false;
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

    startAddingLine = (mouse) => {
        let pointer = this.canvas.getPointer(mouse.e);

        let line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            id: 'added-line',
            stroke: 'red',
            strokeWidth: 3,
            selectable: false
        })

        this.canvas.line = line;
        this.canvas.add(line);
        this.canvas.requestRenderAll();
    }

    startDrawingLine = (mouse) => {
        if (this.canvas.line) {
            let pointer = this.canvas.getPointer(mouse.e);

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


    cutPath(linePath) {
        linePath.strokeWidth = 0;
        linePath.fill = 'black';
        fabric.Image.fromURL(linePath.toDataURL({ width: linePath.width + 5, height: linePath.height + 5 }), (lineImg) => {
            lineImg.left = linePath.left;
            lineImg.top = linePath.top;
            lineImg.width = linePath.width;
            lineImg.height = linePath.height;
            this.canvas.add(lineImg);
            this.setBackgroundOptions(lineImg);
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
                    this.canvas.add(img);
                    this.setDefaultObjectOptions(img);
                    this.undoLastDraw();
                });
            });
        });
        this.canvas.requestRenderAll();
        this.setDraggingMode();
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
})


function updateNewLineCoordinates(object) {
    let obj = object.target;

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

function addingControllPoints(object) {
    let obj = object.target;

    let newLineCoords = updateNewLineCoordinates(object);

    if (!obj) {
        return;
    } else {
        if (obj.id === 'added-line') {
            let pointer1 = new fabric.Circle({
                id: 'pointer1',
                radius: obj.strokeWidth * 6,
                fill: 'blue',
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
                fill: 'blue',
                opacity: 0.5,
                top: newLineCoords.y2,
                left: newLineCoords.x2,
                originX: 'center',
                originY: 'center',
                hasBorders: false,
                hasControls: false
            })

            canvas.add(pointer1, pointer2);
            canvas.discardActiveObject();
            canvas.requestRenderAll();

            canvas.on('object:moving', endPointOfLineFollowPointer);
        }
    }
}

function endPointOfLineFollowPointer(object) {
    let obj = object.target;

    if (obj.id === 'pointer1') {
        canvas.getObjects().forEach(object => {
            if (object.id === 'added-line') {
                object.set({
                    x1: obj.left,
                    y1: obj.top
                })
                object.setCoords();
            }
        })
    }

    if (obj.id === 'pointer2') {
        canvas.getObjects().forEach(object => {
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

*/