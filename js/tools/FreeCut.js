class FreeCut extends Tool {
    line = null;
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
        let lineImg = await this.canvas.simulator.loadImageFromUrl(linePath.toDataURL({ width: linePath.width + 20, height: linePath.height + 20 }));
        lineImg.left = linePath.left;
        lineImg.top = linePath.top;
        lineImg.width = linePath.width;
        lineImg.height = linePath.height;
        this.canvas.add(lineImg);
        this.canvas.simulator.setBackgroundOptions(lineImg);
        this.canvas.moveTo(lineImg, 1);
        let tmpRadiographyImg = await this.canvas.simulator.loadImageFromUrl(this.canvas.simulator.radiographyUrl)
        let tmpCanvas = new fabric.Canvas();
        this.canvas.simulator.setCanvasSize(tmpCanvas);
        tmpCanvas.add(tmpRadiographyImg);
        tmpRadiographyImg.center();
        lineImg.absolutePositioned = true;
        tmpRadiographyImg.clipPath = lineImg;
        let imgCutted = await this.canvas.simulator.loadImageFromUrl(tmpCanvas.toDataURL({ left: lineImg.left, top: lineImg.top, width: lineImg.width, height: lineImg.height }));
        imgCutted.left = lineImg.left;
        imgCutted.top = lineImg.top;
        imgCutted.width = lineImg.width;
        imgCutted.height = lineImg.height;
        imgCutted.associatedChild = lineImg;
        this.canvas.add(imgCutted);
        this.setDefaultObjectOptions(imgCutted);
        this.removeElement(linePath);
        this.removeElement(this.line);
        this.canvas.requestRenderAll();
        this.canvas.simulator.setCurrentTool(new Drag(this.canvas));
    }

    pathCreated(event) {
        this.cutPath(event.path);
    }

    startAddingLine(event) {
        let pointer = this.canvas.getPointer(event.e);
        this.line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: this.canvas.freeDrawingBrush.color,
            strokeWidth: this.canvas.freeDrawingBrush.width
        })
        this.canvas.add(this.line);
        this.canvas.requestRenderAll();
    }

    startDrawingLine(event) {
        if (this.line) {
            let pointer = this.canvas.getPointer(event.e);
            this.line.set({
                x2: pointer.x,
                y2: pointer.y
            });
            this.canvas.requestRenderAll()
        }
    }

}
