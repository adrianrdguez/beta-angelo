class FreeDraw extends Tool {

    constructor(canvas) {
        super(canvas);
        this.canvas.isDrawingMode = true;
        this.setBrushOptions();
    }

    undoLastDraw = () => {
        let path = this.canvas.getObjects('path').pop();
        if (path) {
            this.canvas.remove(path);
        }
    }

    clearDraws = () => {
        for (let path of this.canvas.getObjects('path')) {
            this.canvas.remove(path);
        }
    }

}
