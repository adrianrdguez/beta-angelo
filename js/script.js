class Simulator {
    canvas;
    radiographyUrl;
    limitClipPathField;
    constructor(radiographyUrl) {
        this.initContructor(radiographyUrl)
    }

    async initContructor(radiographyUrl) {
        this.canvas = new fabric.Canvas('simulador', { selection: false, fireRightClick: true, fireMiddleClick: true, stopContextMenu: true });
        this.radiographyUrl = radiographyUrl;
        this.setCanvasSize(this.canvas);
        let img = await this.loadImageFromUrl(this.radiographyUrl);
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
        this.canvas.simulator = this;
        this.setCurrentTool(new Drag(this.canvas))
    }

    init() {
        window.onresize = () => this.setCanvasSize(this.canvas);
        document.getElementById('menu-1').oncontextmenu = e => e.preventDefault();
        document.getElementById('rule').addEventListener('click', () => this.setCurrentTool(new Rule(this.canvas)));
        document.getElementById('rule-circle').addEventListener('click', () => this.setCurrentTool(new RuleCircle(this.canvas)));
        document.getElementById('free-draw').addEventListener('click', () => this.setCurrentTool(new FreeDraw(this.canvas)));
        document.getElementById('drag').addEventListener('click', () => this.setCurrentTool(new Drag(this.canvas)));
        document.getElementById('free-cut').addEventListener('click', () => this.setCurrentTool(new FreeCut(this.canvas)));
        document.getElementById('remove-btn').addEventListener('click', () => this.canvas.currentTool.removeElement(this.canvas.selectedElement));
    }

    setCanvasSize(canvas) {
        canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }

    setCurrentTool(tool) {
        this.canvas.currentTool = tool;
    }

    async loadImageFromUrl(image_url) {
        return new Promise(function (resolve, reject) {
            try {
                fabric.Image.fromURL(image_url, function (image) {
                    resolve(image);
                });
            } catch (error) {
                reject(error);
            }
        });
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
