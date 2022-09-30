class Rule extends Tool {
    line;
    constructor(canvas) {
        super(canvas, 'rule');
        this.resetEvents();
        this.canvas.on('mouse:down', event => this.startAddingLine(event));
        this.canvas.on('mouse:move', event => this.startDrawingLine(event));
        this.canvas.on('mouse:up', event => this.stopDrawingLine(event));
    }

    startAddingLine(event) {
        let pointer = this.canvas.getPointer(event.e);
        this.line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: this.canvas.freeDrawingBrush.color,
            strokeWidth: this.canvas.freeDrawingBrush.width,
        });
        this.setDefaultObjectOptions(this.line);
        this.line.set({
            hasBorders: false,
        })
        this.line.setControlsVisibility({
            mtr: false,
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

    stopDrawingLine() {
        this.line.setCoords();
        this.line.on('mousedblclick', () => this.addingControlPoints());
        this.line.on('moving', () => this.pointersFollowLine());
        this.canvas.simulator.setCurrentTool(new Drag(this.canvas));
    }

    getNewLineCoordinates() {
        let centerX = this.line.getCenterPoint().x;
        let centerY = this.line.getCenterPoint().y;

        let x1offset = this.line.calcLinePoints().x1;
        let y1offset = this.line.calcLinePoints().y1;
        let x2offset = this.line.calcLinePoints().x2;
        let y2offset = this.line.calcLinePoints().y2;

        return {
            x1: centerX + x1offset,
            y1: centerY + y1offset,
            x2: centerX + x2offset,
            y2: centerY + y2offset
        }
    }

    addingControlPoints() {
        if (!this.line.pointer1 && !this.line.pointer2) {
            let newLineCoords = this.getNewLineCoordinates();
            let pointer1 = this.createPointer(newLineCoords.y1, newLineCoords.x1);
            let pointer2 = this.createPointer(newLineCoords.y2, newLineCoords.x2);
            pointer1.on('moving', () => this.lineFollowPointers());
            pointer2.on('moving', () => this.lineFollowPointers());
            this.canvas.add(pointer1, pointer2);
            this.canvas.bringForward(pointer1);
            this.canvas.bringForward(pointer2);
            this.line.pointer1 = pointer1;
            this.line.pointer2 = pointer2;
            this.line.pointer1.associatedChild = this.line.pointer2;
            this.line.associatedChild = pointer1;
            this.canvas.discardActiveObject();
            this.canvas.requestRenderAll();
            this.canvas.on('selection:cleared', event => this.removePointers(event));
        }
    }

    createPointer(top, left) {
        return new fabric.Circle({
            radius: this.line.strokeWidth * 20,
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
        this.line.pointer1?.set({
            top: newLineCoords.y1, 
            left: newLineCoords.x1
        })
        this.line.pointer2?.set({
            top: newLineCoords.y2, 
            left: newLineCoords.x2
        })
    }

    lineFollowPointers() {
        this.line.set({
            x1: this.line.pointer1.left,
            y1: this.line.pointer1.top,
            x2: this.line.pointer2.left,
            y2: this.line.pointer2.top
        })
        this.line.setCoords();
    }

    removePointers() {
        this.removeElement(this.line.associatedChild)
        delete this.line.pointer1;
        delete this.line.pointer2;
        this.canvas.requestRenderAll();
        this.canvas.off('selection:cleared');
    }

}
