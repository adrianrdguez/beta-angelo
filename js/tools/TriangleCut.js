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

}
