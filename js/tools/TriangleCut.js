class TriangleCut extends RuleTriangle {
    constructor(canvas) {
        super(canvas);
    }

    createTriangle() {
        super.createTriangle();
        this.element.line3.set({
            stroke: 'blue',
        });
    }

    addingControlPoints() {
        if (!this.element.pointer4) {
            super.addingControlPoints();
            this.element.pointer1?.set({
                stroke: 'blue',
                fill: 'blue',
            });
            this.element.pointer1?.on('mousedblclick', () => this.createCutterPointer())
        }
    }

    createCutterPointer() {
        let pointerCoords = this.getNewLineCoordinates();
        if (!this.element.pointer4) {
            
            this.element.line4 = this.createLine(this.element.line3.x1, this.element.line3.y1, this.element.line3.x2, this.element.line3.y2);
            this.element.pointer4 = this.createPointer(pointerCoords.pointer1Coords.top, pointerCoords.pointer1Coords.left);
            this.element.pointer4.set({
                radius: this.element.pointer4.radius + 10,
                stroke: 'lightblue',
                fill: 'lightblue',
            });
            this.element.pointer4.off('moving');
            this.element.pointer4.on('moving', () => this.line4FollowPointer4())
            this.canvas.discardActiveObject();
            this.canvas.requestRenderAll();
        }
    }

    line4FollowPointer4() {
        this.element.line4.set({
            x1: this.element.pointer4.left,
            y1: this.element.pointer4.top,
        })
        this.element.line4.setCoords();
    }
}
