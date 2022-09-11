class Simulator {
    constructor(radiography) {
        this.canvas = new fabric.Canvas('canvas', { selection: false });
        this.setCanvasSize();
        fabric.Image.fromURL(radiography, (img) => {
            this.canvas.add(img);
            img.center();
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
        this.canvas.on('path:created', () => {
            if (this.canvas.isDrawingMode && this.canvas.fillDrawing) {
                this.canvas.getObjects().forEach(o => o.fill = this.canvas.freeDrawingBrush.color);
                this.canvas.renderAll();
            }
        });
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
        this.canvas.isDragging = true;
        this.canvas.isDrawingMode = false;
    }

    setDrawingMode = (width = 3, color = '#fff', fillDrawing = false) => {
        this.canvas.isDragging = false;
        this.canvas.isDrawingMode = true;
        this.canvas.fillDrawing = fillDrawing;
        this.canvas.freeDrawingBrush.color = color;
        this.canvas.freeDrawingBrush.width = parseInt(width, 10) || 1;
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

    // ------------- Implantes -------------------

    addImplantObject = (url) => {
        fabric.Image.fromURL(url, (img) => {
            this.canvas.add(img);
            img.center();
            img.set({
                lockScalingFlip: false,
                lockScalingX: true,
                lockScalingY: true,
                lockSkewingX: false,
                lockSkewingY: false,
                selectable: true,
                borderColor: 'blue',
                cornerSize: 50,
                padding: 10,
                cornerStyle: 'circle',
                hasBorders: true,
            });
            img.controls.mtr.offsetY = -parseFloat(60);
            img.setControlVisible('tl', false);
            img.setControlVisible('bl', false);
            img.setControlVisible('tr', false);
            img.setControlVisible('br', false);
            img.setControlVisible('ml', false);
            img.setControlVisible('mb', false);
            img.setControlVisible('mr', false);
            img.setControlVisible('mt', false);
        });
        this.canvas.renderAll();
    }

}

let simulator = new Simulator('img/radiografia.png');
simulator.init()