class FreeCut extends Tool {
    element = {};
    constructor(canvas) {
        super(canvas, 'free-cut');
        this.canvas.isDrawingMode = true;
        this.resetEvents();
        this.setBrushOptions(0.3);
        this.canvas.on('mouse:down', event => this.startAddingLine(event));
        this.canvas.on('mouse:move', event => this.startDrawingLine(event));
        this.canvas.on('path:created', event => this.pathCreated(event));
    }

    async cutPath(linePath) {
        linePath.strokeWidth = 0;
        linePath.fill = 'black';
        let imgShadow = await this.canvas.simulator.loadImageFromUrl(linePath.toDataURL({ width: linePath.width + 20, height: linePath.height + 20 }));
        imgShadow.left = linePath.left;
        imgShadow.top = linePath.top;
        imgShadow.width = linePath.width;
        imgShadow.height = linePath.height;
        this.canvas.add(imgShadow);
        this.canvas.simulator.setBackgroundOptions(imgShadow);
        this.canvas.moveTo(imgShadow, 1);
        let tmpRadiographyImg = await this.canvas.simulator.loadImageFromUrl(this.canvas.simulator.radiographyUrl)
        let tmpCanvas = new fabric.Canvas();
        this.canvas.simulator.setCanvasSize(tmpCanvas);
        tmpCanvas.add(tmpRadiographyImg);
        tmpRadiographyImg.center();
        imgShadow.absolutePositioned = true;
        tmpRadiographyImg.clipPath = imgShadow;
        let imgCut = await this.canvas.simulator.loadImageFromUrl(tmpCanvas.toDataURL({ left: imgShadow.left, top: imgShadow.top, width: imgShadow.width, height: imgShadow.height }));
        imgCut.left = imgShadow.left;
        imgCut.top = imgShadow.top;
        imgCut.width = imgShadow.width;
        imgCut.height = imgShadow.height;
        this.canvas.add(imgCut);
        this.setDefaultObjectOptions(imgCut);
        this.element.imgCut = imgCut;
        this.element.imgShadow = imgShadow;
        this.canvas.remove(linePath)
        this.canvas.remove(this.element.line)
        this.canvas.requestRenderAll();
        this.canvas.simulator.setCurrentTool(new Drag(this.canvas));
    }

    pathCreated(event) {
        this.cutPath(event.path);
    }

    startAddingLine(event) {
        let pointer = this.canvas.getPointer(event.e);
        this.element.line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: this.canvas.freeDrawingBrush.color,
            strokeWidth: this.canvas.freeDrawingBrush.width
        })
        this.canvas.add(this.element.line);
        this.canvas.requestRenderAll();
    }

    startDrawingLine(event) {
        if (this.element.line) {
            let pointer = this.canvas.getPointer(event.e);
            this.element.line.set({
                x2: pointer.x,
                y2: pointer.y
            });
            this.canvas.requestRenderAll()
        }
    }

}
