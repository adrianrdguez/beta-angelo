class RuleTriangle extends Rule {
    element = {};
    constructor(canvas) {
        super(canvas);
        this.resetEvents();
        this.toolName = 'rule-triangle';
        this.setActiveTool(this.toolName);
        this.createTriangle();
        this.canvas.simulator.setCurrentTool(new Drag(this.canvas));
    }

    createLine(x1, y1, x2, y2) {
        let line = new fabric.Line([0, 0, 0, 0], {
            stroke: this.canvas.freeDrawingBrush.color,
            strokeWidth: this.canvas.freeDrawingBrush.width,
        });
        this.canvas.add(line);
        line.set({
            x1: (this.canvas.width / 2) + x1,
            y1: (this.canvas.height / 2) + y1,
            x2: (this.canvas.width / 2) + x2,
            y2: (this.canvas.height / 2) + y2
        });
        this.setDefaultObjectOptions(line);
        line.set({
            hasBorders: false,
        })
        line.setControlsVisibility({
            mtr: false,
        })
        line.on('mousedblclick', () => this.addingControlPoints());
        line.on('moving', () => this.pointersFollowLine());
        return line;
    }

    createTriangle() {
        let triangleSize = 10;
        let vertexTopLeftX = -(this.canvas.width / triangleSize);
        let vertexTopLeftY = -(this.canvas.width / triangleSize);
        let vertexTopRightX = (this.canvas.width / triangleSize);
        let vertexTopRightY = -(this.canvas.width / triangleSize);
        let vertexBottomMiddleX1 = vertexTopRightX + vertexTopLeftX;
        let vertexBottomMiddleX2 = vertexTopLeftY - vertexTopRightY;
        let vertexBottomMiddleY1 = (this.canvas.width / triangleSize);
        let vertexBottomMiddleY2 = vertexBottomMiddleY1;
        this.element.line1 = this.createLine(vertexTopLeftX, vertexTopLeftY, vertexTopRightX, vertexTopRightY);
        this.element.line1.stroke ='red'
        this.element.line2 = this.createLine(vertexBottomMiddleX1, vertexBottomMiddleY1, vertexTopRightX, vertexTopRightY);
        this.element.line2.stroke ='blue'
        this.element.line3 = this.createLine(vertexTopLeftX, vertexTopLeftY, vertexBottomMiddleX2, vertexBottomMiddleY2);
        this.element.line3.stroke ='green'
        this.canvas.requestRenderAll();
    }

    getNewLineCoordinates() {
        let pointerCoords = {};
        let centerX = this.element.line1.getCenterPoint().x;
        let centerY = this.element.line1.getCenterPoint().y;
        let x1offset = this.element.line1.calcLinePoints().x1;
        let y1offset = this.element.line1.calcLinePoints().y1;
        let x2offset = this.element.line1.calcLinePoints().x2;
        let y2offset = this.element.line1.calcLinePoints().y2;
        pointerCoords.pointer1Coords = {
            top: centerX + x1offset,
            left: centerY + y1offset,
        }
        pointerCoords.pointer2Coords = {
            top: centerX + x2offset,
            left: centerY + y2offset,
        }
        centerX = this.element.line3.getCenterPoint().x;
        centerY = this.element.line3.getCenterPoint().y;
        x2offset = this.element.line3.calcLinePoints().x2;
        y2offset = this.element.line3.calcLinePoints().y2;
        pointerCoords.pointer3Coords = {
            top: centerX + x2offset,
            left: centerY + y2offset,
        }
        return pointerCoords;
    }

    addingControlPoints() {
        if (
            !this.element.pointer1 &&
            !this.element.pointer2 &&
            !this.element.pointer3
        ) {
            let pointerCoords = this.getNewLineCoordinates();
            this.element.pointer1 = this.createPointer(pointerCoords.pointer1Coords.left, pointerCoords.pointer1Coords.top);
            this.element.pointer2 = this.createPointer(pointerCoords.pointer2Coords.left, pointerCoords.pointer2Coords.top);
            this.element.pointer3 = this.createPointer(pointerCoords.pointer3Coords.left, pointerCoords.pointer3Coords.top);
            this.canvas.discardActiveObject();
            this.canvas.requestRenderAll();
            this.canvas.on('selection:cleared', event => this.removePointers(event));
        }
    }

    pointersFollowLine() {
        let pointerCoords = this.getNewLineCoordinates();
        this.element.pointer1?.set({
            top: pointerCoords.pointer1Coords,
            left: pointerCoords.pointer1Coords
        })
        this.element.pointer2?.set({
            top: pointerCoords.pointer2Coords,
            left: pointerCoords.pointer2Coords
        })
        this.element.pointer3?.set({
            top: pointerCoords.pointer3Coords,
            left: pointerCoords.pointer3Coords
        })
    }

    lineFollowPointers() {
        this.element.line1.set({
            x1: this.element.pointer1.left,
            y1: this.element.pointer1.top,
            x2: this.element.pointer2.left,
            y2: this.element.pointer2.top
        })
        this.element.line1.setCoords();
        this.element.line2.set({
            x1: this.element.pointer3.left,
            y1: this.element.pointer3.top,
            x2: this.element.pointer2.left,
            y2: this.element.pointer2.top
        })
        this.element.line2.setCoords();
        this.element.line3.set({
            x1: this.element.pointer1.left,
            y1: this.element.pointer1.top,
            x2: this.element.pointer3.left,
            y2: this.element.pointer3.top
        })
        this.element.line3.setCoords();
    }

    removePointers() {
        this.canvas.remove(this.element.pointer1)
        this.canvas.remove(this.element.pointer2)
        this.canvas.remove(this.element.pointer3)
        delete this.element.pointer1;
        delete this.element.pointer2;
        delete this.element.pointer3;
        this.canvas.requestRenderAll();
        this.canvas.off('selection:cleared');
    }

}
