import { Rule } from './Rule.js';

export class InitialRule extends Rule {

    constructor(canvas, first) {
        super(canvas)
        this.element.line = this.createLine(100, 0, -100, 0, first)
        this.addingControlPoints();
        canvas.simulator.initialLine = this;
    }

    createLine(x1, y1, x2, y2, first) {
        let line = new fabric.Line([0, 0, 0, 0], {
            stroke: this.canvas.freeDrawingBrush.color,
            strokeWidth: this.canvas.freeDrawingBrush.width,
            strokeLineCap: 'round',
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
            selectable: false,
        })
        line.setControlsVisibility({
            mtr: false,
        })
        line.on('mousedblclick', () => this.addingControlPoints());
        line.on('moving', () => this.pointersFollowLine());
        if (first) {
            setTimeout(() => {
                this.canvas.simulator.offcanvasToggler('offcanvas-initial-settings', true);
            }, 500);
        }
        return line;
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
            this.element.pointer1 = this.createPointer(newLineCoords.y1, newLineCoords.x1);
            this.element.pointer2 = this.createPointer(newLineCoords.y2, newLineCoords.x2);
            this.canvas.discardActiveObject();
            this.canvas.requestRenderAll();
            this.canvas.on('selection:cleared', event => this.removePointers(event));
        }
    }

    createPointer(top, left) {
        let circle = new fabric.Circle({
            radius: this.canvas.freeDrawingBrush.width * 20,
            fill: this.canvas.freeDrawingBrush.color,
            stroke: 'red',
            strokeWidth: 2,
            fill: 'transparent',
            top: top,
            left: left,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false
        });
        /*  this.element.miniPointer = new fabric.Circle({
             radius: this.canvas.freeDrawingBrush.width,
             fill: this.canvas.freeDrawingBrush.color,
             originX: 'center',
             originY: 'center',
             hasBorders: false,
             hasControls: false,
             selectable: false,
         }); */
        circle.on('moving', () => this.lineFollowPointers()/* , this.miniPointerFollowPointer() */);
        this.canvas.add(circle);
        /* this.canvas.add(this.element.miniPointer); */
        this.canvas.bringForward(circle);
        /*  this.element.miniPointer.center(); */
        return circle;
    }

    /* miniPointerFollowPointer() {
        this.element.miniPointer.set({
            left: this.canvas.circle.left,
            top: this.canvas.circle.top,
        });
        if (this.element.line) {
            this.pointerMovement()
        }
    } */

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
        this.element.line.startx = this.element.pointer1.left;
        this.element.line.starty = this.element.pointer1.top;
        this.element.line.endx = this.element.pointer2.left;
        this.element.line.endy = this.element.pointer2.top;
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