import { RuleTriangle } from "./RuleTriangle";
import { FreeCut } from "./FreeCut";
import { Drag } from './Drag.js';

export class TriangleCut extends RuleTriangle {
    freeCutTool;
    constructor(canvas) {
        super(canvas);
        this.setStartControl(this.element.triangle, () => this.startCut());
        this.element['circle' + 2].set({
            stroke: 'rgb(144, 238, 144)'
        });
        this.simulator.setCurrentTool(new Drag(this.canvas));
    }

    setStartControl(object, callback) {
        object.controls.startControl = new fabric.Control({
            x: -0,
            y: 0,
            offsetY: -40,
            offsetX: -40,
            cursorStyle: 'pointer',
            mouseUpHandler: (eventData, transform) => {
                callback();
            },
            render: function (ctx, left, top, styleOverride, fabricObject) {
                let checkStartImg = document.createElement('img');
                checkStartImg.src = '/img/circle-check-regular.svg';
                checkStartImg.style.borderRadius = '1000px';
                checkStartImg.style.backgroundColor = 'lightgreen';
                let size = this.cornerSize;
                ctx.save();
                ctx.translate(left, top);
                ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
                ctx.drawImage(checkStartImg, -size / 2, -size / 2, size, size);
                ctx.restore();
            },
            cornerSize: 24
        });
    }

    startCut() {
        this.simulator.setBackgroundOptions(this.element.triangle);
        this.freeCutTool = new FreeCut(this.canvas, this.callbackOnFinishedCut);
        let p1 = this.getPointCoord(this.element.triangle, 1);
        let p2 = this.getPointCoord(this.element.triangle, 2);
        this.freeCutTool.element.pointer.set({
            left: p1.x,
            top: p1.y,
        });
        this.freeCutTool.element.miniPointer.set({
            left: p1.x,
            top: p1.y,
        });
        this.freeCutTool.startCut(p2.x, p2.y);
        Object.assign(this.freeCutTool.element, this.element);
        this.canvas.requestRenderAll();
    }

    callbackOnFinishedCut() {
    }

}