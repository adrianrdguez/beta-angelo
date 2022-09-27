class Simulator {
    canvas;
    radiographyUrl;
    limitClipPathField;
    constructor(radiographyUrl) {
        this.canvas = new fabric.Canvas('simulador', { selection: false, fireRightClick: true, fireMiddleClick: true, stopContextMenu: true });
        this.radiographyUrl = radiographyUrl;
        this.setCanvasSize(this.canvas);
        fabric.Image.fromURL(this.radiographyUrl, (img) => {
            this.canvas.add(img);
            img.center();
            this.setBackgroundOptions(img);
            this.limitClipPathField = new fabric.Rect({
                width: img.width + 1,
                height: img.height + 1,
                top: img.top - 1,
                left: img.left - 1,
                absolutePositioned: true
            });
        });
        this.canvas.simulator = this;
        this.setCurrentTool(new Drag(this.canvas))
    }

    init() {
        window.onresize = () => this.setCanvasSize(this.canvas);
        document.getElementById('menu-1').oncontextmenu = e => e.preventDefault();
        document.getElementById('adding-line-btn').addEventListener('click', () => this.setCurrentTool(new Rule(this.canvas)));
        document.getElementById('drawing-btn').addEventListener('click', () => this.setCurrentTool(new FreeDraw(this.canvas)));
        document.getElementById('dragging-btn').addEventListener('click', () => this.setCurrentTool(new Drag(this.canvas)));
        document.getElementById('free-cut-btn').addEventListener('click', () => this.setCurrentTool(new FreeCut(this.canvas)));
        document.getElementById('remove-btn').addEventListener('click', () => this.removeElement(this.canvas.selectedElement));
    }

    setCanvasSize(canvas) {
        canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }

    setCurrentTool(tool) {
        this.canvas.currentTool = tool;
    }

    setBackgroundOptions(object) {
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

}
