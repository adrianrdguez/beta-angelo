class FreeCut extends Tool {
    line = null;
    constructor(canvas) {
        super(canvas)
        this.canvas.isDrawingMode = true;
        this.resetEvents();
        this.setBrushOptions(0.3);
        this.canvas.on('mouse:down', event => this.startAddingLine(event));
        this.canvas.on('mouse:move', event => this.startDrawingLine(event));
        this.canvas.on('path:created', event => this.pathCreated(event));
    }

    cutPath(linePath) {
        linePath.strokeWidth = 0;
        linePath.fill = 'black';
        fabric.Image.fromURL(linePath.toDataURL({ width: linePath.width + 20, height: linePath.height + 20 }), (lineImg) => {
            lineImg.left = linePath.left;
            lineImg.top = linePath.top;
            lineImg.width = linePath.width;
            lineImg.height = linePath.height;
            this.canvas.add(lineImg);
            this.canvas.simulator.setBackgroundOptions(lineImg);
            this.canvas.moveTo(lineImg, 1);
            fabric.Image.fromURL(this.canvas.simulator.radiographyUrl, (img) => {
                let imgCanvas = new fabric.Canvas();
                this.canvas.simulator.setCanvasSize(imgCanvas);
                imgCanvas.add(img);
                img.center();
                lineImg.absolutePositioned = true;
                img.clipPath = lineImg;
                fabric.Image.fromURL(imgCanvas.toDataURL({ left: lineImg.left, top: lineImg.top, width: lineImg.width, height: lineImg.height }), (img) => {
                    img.left = lineImg.left;
                    img.top = lineImg.top;
                    img.width = lineImg.width;
                    img.height = lineImg.height;
                    img.associatedChild = lineImg;
                    this.canvas.add(img);
                    this.setDefaultObjectOptions(img);
                    this.removeElement(this.line);
                    this.removeElement(linePath);
                    this.line = null;
                    this.undoLastDraw();
                });
            });
        });
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
