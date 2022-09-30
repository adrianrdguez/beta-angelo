class Tool {
    canvas;
    toolName;
    constructor(canvas, toolName = null) {
        if (toolName) {
            this.toolName = toolName;
            this.setActiveTool(toolName);
        }
        this.canvas = canvas;
        this.canvas.isDrawingMode = false;
        this.setBrushOptions();
    }

    setBrushOptions(width = 1, color = 'red') {
        this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
        this.canvas.freeDrawingBrush.color = color;
        this.canvas.freeDrawingBrush.width = width;
        this.canvas.freeDrawingBrush.decimate = 0;
    }

    resetEvents() {
        this.canvas.discardActiveObject()
        this.canvas.requestRenderAll();
        this.canvas.off();
        this.canvas.on('mouse:wheel', event => this.zoomToPoint(event));
    };

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
        })
        object.clipPath = this.limitClipPathField;
        object.on('mousedown', this.obectMouseDownEvent);
    }

    obectMouseDownEvent(event) {
        this.canvas.bringToFront(event.target);
        let menu = document.getElementById('menu-1');
        if (event.button === 2) {
            this.removeElement(event.target);
        } else if (event.button === 3) {
            this.canvas.selectedElement = event.target;
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

    setActiveTool(toolName) {
        document.querySelectorAll('.list').forEach(li => li.classList.remove("active"));
        document.getElementById(toolName)?.classList.add("active");
    }

    removeElement(element = null) {
        element = element ?? this.canvas.getObjects().pop();
        if (element && this.canvas.getObjects().length > 1) {
            if (element.associatedChild) {
                this.removeElement(element.associatedChild);
            }
            this.canvas.remove(element);
        }
        document.getElementById('menu-1').style = `visibility: hidden;left: 0;top: 0;z-index: -100;`;
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
