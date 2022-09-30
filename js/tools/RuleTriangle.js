class RuleTriangle extends Rule {
    line2;
    line3;
    constructor(canvas) {
        super(canvas);
        this.resetEvents();
        this.toolName = 'rule-triangle';
        this.setActiveTool(this.toolName);
        this.createTriangle();
    }

    createLine(x1, y1, x2, y2) {
        let line = new fabric.Line([0, 0, 0, 0], {
            stroke: this.canvas.freeDrawingBrush.color,
            strokeWidth: this.canvas.freeDrawingBrush.width,
        });
        this.canvas.add(line);
        line.center();
        console.log(this.canvas.width)
        console.log(this.canvas.height)
        line.set({
            x1: (this.canvas.width / 2),
            y1: (this.canvas.height / 2),
            x2: (this.canvas.width / 2),
            y1: (this.canvas.height / 2)
        })
        return line;
    }

    createTriangle() {
        this.line = this.createLine(-10, -10, 10, 10);

        /* this.line2 = this.createLine(x1, y1, x2, y2)
        this.line3 = this.createLine(x1, y1, x2, y2) */
        this.canvas.requestRenderAll();
    }

}
