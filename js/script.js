class Simulator {
    constructor(radiographyUrl) {
        this.radiographyUrl = radiographyUrl;
        this.radiographyImg = null;
        this.limitClipPathField = null;
        this.canvas = new fabric.Canvas('simulador', { selection: false, fireRightClick: true, fireMiddleClick: true, stopContextMenu: true });
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
        this.htmlEvents();
        this.canvasEvents();
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

    // ------------- Eventos HTML -------------------
    htmlEvents = () => {
        window.onresize = () => { this.setCanvasSize(this.canvas) }
        document.getElementById('menu-1').oncontextmenu = e => e.preventDefault();
        document.getElementById('adding-line-btn').addEventListener('click', (event) => { this.setListActive(event); this.setRuleMode() });
        document.getElementById('drawing-btn').addEventListener('click', (event) => { this.setListActive(event); this.setDrawingMode() });
        document.getElementById('dragging-btn').addEventListener('click', (event) => { this.setListActive(event); this.setDraggingMode() });
        document.getElementById('free-cut-btn').addEventListener('click', (event) => { this.setListActive(event); this.setFreeCutMode() });
        document.getElementById('remove-btn').addEventListener('click', (event) => this.removeElement(this.canvas.selectedElement));
    }

    setCanvasSize = (canvas) => {
        canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }

    setListActive = (event = null) => {
        document.querySelectorAll('.list').forEach(li => li.classList.remove("active"));
        if (event) {
            event.currentTarget.classList.add("active");
        } else {
            document.getElementById('dragging-btn').classList.add("active");
        }
    }

    setRuleMode = () => {
        this.setDraggingMode();
        this.canvas.freeDrawingBrush.width = 1;
        this.canvas.isRuleMode = true;
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

    setDraggingMode = () => {
        this.canvas.isDragging = false;
        this.canvas.isDrawingMode = false;
        this.canvas.isRuleMode = false;
        this.canvas.isCuttingMode = false;
    }

    setFreeCutMode = () => {
        this.setDrawingMode(0.3, 'red', true);
    }

    removeElement = (element = null) => {
        element = element ?? this.canvas.getObjects().pop();
        if (element && this.canvas.getObjects().length > 1) {
            if (element.associatedChild) {
                this.removeElement(element.associatedChild);
            }
            this.canvas.remove(element);
        }
        document.getElementById('menu-1').style = `visibility: hidden;left: 0;top: 0;z-index: -100;`;
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

    // ------------- Eventos Canvas -------------------

    canvasEvents = () => {
        this.canvas.on('mouse:wheel', this.zoomToPoint);
        this.canvas.on('mouse:down', (event) => this.mouseDown(event));
        this.canvas.on('mouse:move', (event) => this.mouseMove(event));
        this.canvas.on('mouse:up', (event) => this.mouseUp(event));
        this.canvas.on('mouse:dblclick', (event) => this.mouseDblClick(event));
        this.canvas.on('path:created', (event) => this.pathCreated(event));
        this.canvas.on('object:moving', this.endPointOfLineFollowPointer);
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

    mouseDown(event) {
        this.canvas.selectedElement = event.target;
        if (this.canvas.isRuleMode || this.canvas.isCuttingMode) {
            this.startAddingLine(event);
        } else if (!this.canvas.selectedElement && !this.canvas.isDrawingMode) {
            this.activateDraggingMode(event);
        }
        let menu = document.getElementById('menu-1');
        if (event.button === 3 && this.canvas.selectedElement) {
            const menuWidth = menu.offsetWidth;
            const menuHeight = menu.offsetHeight;
            let pointX = event.pointer.x;
            let pointY = event.pointer.y;
            if (this.canvas.width - pointX <= menuWidth) {
                pointX -= menuWidth;
            }
            if (this.canvas.height - pointY <= menuHeight) {
                pointY -= menuHeight;
            }
            menu.style = `visibility: visible;left: ${pointX}px;top: ${pointY}px;z-index: 100;`;
        } else {
            menu.style = `visibility: hidden;left: 0;top: 0;z-index: -100;`;
        }
    }

    mouseMove(event) {
        if (this.canvas.isRuleMode || this.canvas.isCuttingMode) {
            this.startDrawingLine(event);
        } else if (this.canvas.isDragging) {
            this.dragScreen(event);
        }
    }

    mouseUp() {
        if (this.canvas.isRuleMode || this.canvas.isCuttingMode) {
            this.stopDrawingLine();
        } else if (this.canvas.isDragging) {
            this.disableDraggingMode();
        }
    }

    mouseDblClick(event) {
        this.addingControlPoints(event);
    }

    pathCreated(event) {
        let linePath = event.path;
        if (this.canvas.isCuttingMode) {
            this.cutPath(linePath);
        } else {
            this.setBackgroundOptions(linePath);
        }
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
        this.setListActive();
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
                    radius: obj.strokeWidth * 20,
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
                    radius: obj.strokeWidth * 20,
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
        this.setListActive();
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

    // ------------- Tratamiento con objetos -------------------

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
