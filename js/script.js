class Simulator {
    constructor(radiographyUrl) {
        this.radiographyUrl = radiographyUrl;
        this.radiographyImg = null;
        this.limitClipPathField = null;
        this.canvas = new fabric.Canvas('template', { selection: false });
        this.setCanvasSize();
        fabric.Image.fromURL(this.radiographyUrl, (img) => {
            this.canvas.add(img);
            img.center();
            img.clone((imgCloned) => {
                this.radiographyImg = imgCloned;
            })
            img.set({
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
        window.onresize = this.setCanvasSize
        this.canvas.on('mouse:wheel', (opt) => {
            this.zoomToPoint(opt);
        });
        this.canvas.on('mouse:down', (opt) => {
            if (!opt.target && !this.canvas.isDrawingMode) {
                this.activateDraggingMode(opt);
            }
        });
        this.canvas.on('mouse:move', (opt) => {
            if (this.canvas.isDragging) {
                this.dragScreen(opt);
            }
        });
        this.canvas.on('mouse:up', () => {
            if (this.canvas.isDragging) {
                this.disableDraggingMode();
            }
        });
        this.canvas.on('path:created', (opt) => {
            let linePath = opt.path;
            if (this.canvas.isDrawingMode && this.canvas.cutBackground) {
                linePath.strokeWidth = 0;
                linePath.fill = 'black';
                linePath.width = linePath.width + 5;
                linePath.height = linePath.height + 5;
                fabric.Image.fromURL(linePath.toDataURL(), (lineImg) => {
                    lineImg.left = linePath.left;
                    lineImg.top = linePath.top;
                    lineImg.width = linePath.width;
                    lineImg.height = linePath.height;
                    lineImg.set({
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
                    })
                    this.canvas.add(lineImg);
                    fabric.Image.fromURL(this.radiographyUrl, (img) => {
                        let imgCanvas = new fabric.Canvas();
                        imgCanvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
                        imgCanvas.add(img);
                        img.center();
                        lineImg.absolutePositioned = true;
                        img.clipPath = lineImg;
                        fabric.Image.fromURL(imgCanvas.toDataURL({
                            left: lineImg.left,
                            top: lineImg.top,
                            width: lineImg.width,
                            height: lineImg.height,
                        }), (img) => {
                            img.left = lineImg.left;
                            img.top = lineImg.top;
                            img.width = lineImg.width;
                            img.height = lineImg.height;
                            this.canvas.add(img);
                            this.canvas.bringToFront(img)
                            this.setDefaultObjectOptions(img)
                            this.undoLastDraw()
                        })
                    });
                })
                this.canvas.requestRenderAll();
                this.setDraggingMode();
            }
        });
        this.setFreeCutMode();
    }

    setCanvasSize = () => {
        this.canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
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

    // ------------- Herramientas -------------------

    setDraggingMode = () => {
        this.canvas.isDragging = false;
        this.canvas.isDrawingMode = false;
        this.canvas.cutBackground = false;
    }

    setDrawingMode = (width = 1, color = '#fff', dashedLine = false) => {
        this.setDraggingMode();
        this.canvas.isDrawingMode = true;
        this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
        this.canvas.freeDrawingBrush.straightLineKey = 'altKey';
        this.canvas.freeDrawingBrush.color = color;
        this.canvas.freeDrawingBrush.width = width;
        if (dashedLine) {
            this.canvas.cutBackground = true;
            this.canvas.freeDrawingBrush.strokeDashArray = [1.5];
        } else {
            this.canvas.cutBackground = false;
            this.canvas.freeDrawingBrush.strokeDashArray = [];
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

    setFreeCutMode = () => {
        this.setDrawingMode(0.5, 'red', true);
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
            borderColor: 'darkblue',
            cornerSize: 50,
            padding: 10,
            cornerStyle: 'circle',
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