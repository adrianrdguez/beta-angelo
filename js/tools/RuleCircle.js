class RuleCircle extends Rule {
    constructor(canvas) {
        super(canvas);
        this.toolName = 'rule-circle';
        this.setActiveTool(this.toolName);
    }

    startAddingLine(event) {
        super.startAddingLine(event);
        this.createCircle();
    }

    startDrawingLine(event) {
        super.startDrawingLine(event);
        if (this.line) {
            this.adjustCircleRadiusAndPosition();
        }
    }

    createCircle() {
        let newLineCoords = this.getNewLineCoordinates();
        let circle = new fabric.Circle({
            fill: 'transparent',
            radius: 60,
            strokeWidth: this.canvas.freeDrawingBrush.width,
            stroke: this.canvas.freeDrawingBrush.color,
            top: newLineCoords.y1,
            left: newLineCoords.x1,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false,
            selectable: false
        });
        this.canvas.add(circle);
        this.line.circle = circle;
        this.line.associatedChild = circle;
        this.canvas.requestRenderAll();
    }

    pointersFollowLine() {
        super.pointersFollowLine();
        this.adjustCircleRadiusAndPosition();
    }

    lineFollowPointers() {
        super.lineFollowPointers();
        this.adjustCircleRadiusAndPosition();
    }

    adjustCircleRadiusAndPosition() {
        let newLineCoords = this.getNewLineCoordinates();
        this.line.circle?.set({
            radius: Math.sqrt(Math.pow(newLineCoords.x2 * 1 - newLineCoords.x1 * 1, 2) + Math.pow(newLineCoords.y2 * 1 - newLineCoords.y1 * 1, 2)),
            top: newLineCoords.y1,
            left: newLineCoords.x1,
        })
        this.canvas.requestRenderAll();
    }

    addingControlPoints() {
        super.addingControlPoints();
        if (this.line.pointer1) {
            this.line.circle.associatedChild = this.line.pointer1;
            this.line.associatedChild = this.line.circle
        }
    }

}
