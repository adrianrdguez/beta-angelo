class Tool {
    canvas;
    toolName;
    element;
    constructor(canvas, toolName = null) {
        if (toolName) {
            this.toolName = toolName;
            this.setActiveTool(toolName);
        }
        this.canvas = canvas;
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
        // object.clipPath = this.canvas.simulator.limitClipPathField;
        object.on('mousedown', this.objectMouseDownEvent);
        object.element = this.element;
    }

    objectMouseDownEvent(event) {
        this.canvas.bringToFront(event.target);
    }

    setDeleteControl(object) {
        object.controls.deleteControl = new fabric.Control({
            x: 0.5,
            y: -0.5,
            offsetY: -16,
            offsetX: 16,
            cursorStyle: 'pointer',
            mouseUpHandler: (eventData, transform) => {
                let target = transform.target;
                if (target?.element) {
                    for (const [key, value] of Object.entries(target.element)) {
                        this.canvas.remove(value);
                    }
                }
                this.canvas.remove(target);
                this.canvas.requestRenderAll();
            },
            render: function (ctx, left, top, styleOverride, fabricObject) {
                let deleteImg = document.createElement('img');
                deleteImg.src = 'img/circle-xmark-regular.svg';
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
        document.querySelectorAll('#herramientas .btn').forEach(li => li.classList.remove("active"));
        document.getElementById('herramientas').classList.remove('show');
        document.getElementById(toolName)?.classList.add("active");
    }

    zoomToPoint(event) {
        let delta = event.e.deltaY;
        let zoom = this.canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        this.canvas.zoomToPoint({ x: event.e.offsetX, y: event.e.offsetY }, zoom);
        event.e.preventDefault();
        event.e.stopPropagation();
    }

}
