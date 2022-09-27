class FreeCut extends Tool {

    constructor(canvas) {
        super(canvas)
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
            this.setBackgroundOptions(lineImg);
            this.canvas.moveTo(lineImg, 1);
            fabric.Image.fromURL(this.radiographyUrl, (img) => {
                let imgCanvas = new fabric.Canvas();
                this.setCanvasSize(imgCanvas);
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
                    this.removeElement(this.canvas.line);
                    this.undoLastDraw();
                });
            });
        });
        this.canvas.requestRenderAll();
        this.setDraggingMode();
    }

    setDrawingMode = (width = 0.3, color = 'red', isCuttingMode = false) => {
        this.setDraggingMode();
        this.canvas.isDrawingMode = true;
        this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
        this.canvas.freeDrawingBrush.color = color;
        this.canvas.freeDrawingBrush.width = width;
        this.canvas.freeDrawingBrush.decimate = 0;
        this.canvas.isCuttingMode = isCuttingMode;
    }

    setFreeCutMode = () => {
        this.setDrawingMode(0.3, 'red', true);
    }
}
