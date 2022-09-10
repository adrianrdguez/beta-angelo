class Simulator {
    constructor(radiography) {
        this.paths = [];
        this.canvas = new fabric.Canvas('template', {
            selection: false,
            width: $(window).width(),
            height: $(window).height(),
        });
        fabric.Image.fromURL(radiography, (img) => {
            this.canvas.add(img);
            img.center();
            img.set({
                centeredRotation: false,
                centeredScaling: false,
                evented: false,
                hasBorders: false,
                hasControls: false,
                lockMovementX: false,
                lockMovementY: false,
                lockRotation: true,
                lockScalingFlip: false,
                lockScalingX: true,
                lockScalingY: true,
                lockSkewingX: false,
                lockSkewingY: false,
                selectable: false,
            });
        });

    }

    init = () => {
        $(window).bind("resize", () => {
            this.canvas.setDimensions({ width: $(window).width(), height: $(window).height() });
        });
        this.canvas.on('mouse:wheel', (opt) => {
            let delta = opt.e.deltaY;
            let zoom = this.canvas.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;
            this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });
        this.canvas.on('mouse:down', (opt) => {
            if (!opt.target && !this.canvas.isDrawingMode) {
                let event = opt.e;
                this.canvas.isDragging = true;
                this.canvas.lastPosX = event.clientX;
                this.canvas.lastPosY = event.clientY;
            }
        });
        this.canvas.on('mouse:move', (opt) => {
            if (this.canvas.isDragging) {
                let e = opt.e;
                let vpt = this.canvas.viewportTransform;
                vpt[4] += e.clientX - this.canvas.lastPosX;
                vpt[5] += e.clientY - this.canvas.lastPosY;
                this.canvas.requestRenderAll();
                this.canvas.lastPosX = e.clientX;
                this.canvas.lastPosY = e.clientY;
            }
        });
        this.canvas.on('mouse:up', (opt) => {
            this.canvas.setViewportTransform(this.canvas.viewportTransform);
            this.canvas.isDragging = false;
        });
        this.canvas.on('path:created', (object) => {
            if (this.canvas.isDrawingMode && this.canvas.fillDrawing) {
                this.canvas.getObjects().forEach(o => {
                    o.fill = this.canvas.freeDrawingBrush.color
                });
                this.canvas.renderAll();
            }
        });
    }

    undoLastDraw = () => {
        for (let path of this.canvas.getObjects('path').reverse()) {
            this.canvas.remove(path);
            return;
        }
    }

    clearDraws = () => {
        for (let path of this.canvas.getObjects('path')) {
            this.canvas.remove(path);
        }
    }

    downloadImage = (filename) => {
        const link = document.createElement("a");
        link.href = this.canvas.toDataURL();
        link.download = filename;
        link.click();
    }

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

    setNormalMode = () => {
        this.canvas.isDragging = true;
        this.canvas.isDrawingMode = false;
    }

    setDrawingMode = (width = 3, color = '#fff', fillDrawing = false) => {
        this.canvas.isDragging = false;
        this.canvas.isDrawingMode = true;
        this.canvas.freeDrawingBrush.color = color;
        this.canvas.freeDrawingBrush.width = parseInt(width, 10) || 1;
        this.canvas.fillDrawing = fillDrawing;
    }
}

let simulator = new Simulator('img/radiografia.png');
simulator.init()