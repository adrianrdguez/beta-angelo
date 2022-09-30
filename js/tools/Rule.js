class Rule extends Tool {
    element = {};
    constructor(canvas) {
        super(canvas, 'rule');
        this.resetEvents();
        this.canvas.on('mouse:down', event => this.startAddingLine(event));
        this.canvas.on('mouse:move', event => this.startDrawingLine(event));
        this.canvas.on('mouse:up', event => this.stopDrawingLine(event));
    }

    startAddingLine(event) {
        let pointer = this.canvas.getPointer(event.e);
        this.element.line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: this.canvas.freeDrawingBrush.color,
            strokeWidth: this.canvas.freeDrawingBrush.width,
        });
        this.setDefaultObjectOptions(this.element.line);
        this.element.line.set({
            hasBorders: false,
        })
        this.element.line.setControlsVisibility({
            mtr: false,
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

    stopDrawingLine() {
        this.element.line.setCoords();
        this.element.line.on('mousedblclick', () => this.addingControlPoints());
        this.element.line.on('moving', () => this.pointersFollowLine());
        this.canvas.simulator.setCurrentTool(new Drag(this.canvas));
    }

    getNewLineCoordinates() {
        let centerX = this.element.line.getCenterPoint().x;
        let centerY = this.element.line.getCenterPoint().y;

        let x1offset = this.element.line.calcLinePoints().x1;
        let y1offset = this.element.line.calcLinePoints().y1;
        let x2offset = this.element.line.calcLinePoints().x2;
        let y2offset = this.element.line.calcLinePoints().y2;

        return {
            x1: centerX + x1offset,
            y1: centerY + y1offset,
            x2: centerX + x2offset,
            y2: centerY + y2offset
        }
    }

    addingControlPoints() {
        if (!this.element.pointer1 && !this.element.pointer2) {
            let newLineCoords = this.getNewLineCoordinates();
            let pointer1 = this.createPointer(newLineCoords.y1, newLineCoords.x1);
            let pointer2 = this.createPointer(newLineCoords.y2, newLineCoords.x2);
            pointer1.on('moving', () => this.lineFollowPointers());
            pointer2.on('moving', () => this.lineFollowPointers());
            this.canvas.add(pointer1, pointer2);
            this.canvas.bringForward(pointer1);
            this.canvas.bringForward(pointer2);
            this.element.pointer1 = pointer1;
            this.element.pointer2 = pointer2;
            this.canvas.discardActiveObject();
            this.canvas.requestRenderAll();
            this.canvas.on('selection:cleared', event => this.removePointers(event));
        }
    }

    createPointer(top, left) {
        return new fabric.Circle({
            radius: this.element.line.strokeWidth * 20,
            fill: this.canvas.freeDrawingBrush.color,
            opacity: 0.5,
            top: top,
            left: left,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false
        })
    }

    pointersFollowLine() {
        let newLineCoords = this.getNewLineCoordinates();
        this.element.pointer1?.set({
            top: newLineCoords.y1,
            left: newLineCoords.x1
        })
        this.element.pointer2?.set({
            top: newLineCoords.y2,
            left: newLineCoords.x2
        })
    }

    lineFollowPointers() {
        this.element.line.set({
            x1: this.element.pointer1.left,
            y1: this.element.pointer1.top,
            x2: this.element.pointer2.left,
            y2: this.element.pointer2.top
        })
        this.element.line.setCoords();
    }

    removePointers() {
        this.canvas.remove(this.element.pointer1)
        this.canvas.remove(this.element.pointer2)
        delete this.element.pointer1;
        delete this.element.pointer2;
        this.canvas.requestRenderAll();
        this.canvas.off('selection:cleared');
    }

}
