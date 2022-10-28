class Simulator {
    canvas;
    radiographyUrl;
    limitClipPathField;
    selectedElement;
    currentTool;
    measure;
    firstLineMeasure;
    constructor(radiographyUrl) {
        this.initConstructor(radiographyUrl)
    }

    async initConstructor(radiographyUrl) {
        fabric.Object.prototype.objectCaching = false;
        this.canvas = new fabric.Canvas('simulador', {
            selection: false,
            fireRightClick: true,
            fireMiddleClick: true,
            stopContextMenu: true,
            perPixelTargetFind: true,
            imageSmoothingEnabled: false
        });
        this.radiographyUrl = radiographyUrl;
        this.setCanvasSize(this.canvas);
        let img = await this.loadImageFromUrl(this.radiographyUrl);
        let imageTextureSize = img.width > img.height ? img.width : img.height;
        if (imageTextureSize > fabric.textureSize) {
            fabric.textureSize = imageTextureSize;
        }
        this.canvas.add(img);
        img.center();
        this.limitClipPathField = new fabric.Rect({
            width: img.width + 1,
            height: img.height + 1,
            top: img.top - 1,
            left: img.left - 1,
            absolutePositioned: true
        });
        this.setBackgroundOptions(img);
        this.canvas.simulator = this;
        document.getElementsByClassName('botones-flotantes')[0].style.visibility = 'hidden';
        if (this.measure == undefined) {
            document.getElementById('boton-herramientas').style.visibility = 'hidden';

        }
        if (this.measure > 0) {
            document.getElementById('boton-herramientas').style.visibility = 'visible';

        }
        //this.setCurrentTool(new Rule(this.canvas, true));
        this.setCurrentTool(new InitialRule(this.canvas, true));
        this.setCurrentTool(new Drag(this.canvas))
    }

    init() {
        window.onresize = () => this.setCanvasSize(this.canvas);
        document.getElementById('menu-1').oncontextmenu = e => e.preventDefault();
        document.getElementById('rule').addEventListener('click', () => this.setCurrentTool(new Rule(this.canvas)));
        document.getElementById('rule-circle').addEventListener('click', () => this.setCurrentTool(new RuleCircle(this.canvas)));
        document.getElementById('rule-triangle').addEventListener('click', () => this.setCurrentTool(new RuleTriangle(this.canvas)));
        document.getElementById('free-draw').addEventListener('click', () => this.setCurrentTool(new FreeDraw(this.canvas)));
        document.getElementById('drag').addEventListener('click', () => this.setCurrentTool(new Drag(this.canvas)));
        document.getElementById('free-cut').addEventListener('click', () => this.setCurrentTool(new FreeCut(this.canvas)));
        document.getElementById('remove-btn').addEventListener('click', () => this.removeObjectToolFromCanvas());
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
        // Descomentar para limitar los objetos a la imagen
        // object.clipPath = this.limitClipPathField;
    }

    removeObjectToolFromCanvas() {
        if (this.selectedElement) {
            for (const [key, value] of Object.entries(this.selectedElement.element)) {
                this.canvas.remove(value);
            }
        }
        document.getElementById('menu-1').style = `visibility: hidden;left: 0;top: 0;z-index: -100;`;
    }

}
