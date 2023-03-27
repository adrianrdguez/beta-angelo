import { RuleCircle } from './RuleCircle.js';
import { Drag } from './Drag.js';

export class CircleCut extends RuleCircle {
    constructor(canvas) {
        super(canvas);
        this.setStartControl(this.element.line, () => this.startCut);
    }

    startCut() {
        this.setBrushOptions(0.3);
        this.createFollowLine();
        this.element.pointer.set({
            radius: this.element.pointer.radius + 20,
            stroke: 'lightblue',
            fill: 'lightblue',
        });
        this.setStartControl(this.element.pointer, () => this.finishCutPath());
        this.canvas.requestRenderAll();
    }

    createFollowLine() {
        this.element.line = new fabric.Line([this.element.pointer.left, this.element.pointer.top, this.element.pointer.left, this.element.pointer.top], {
            stroke: this.canvas.freeDrawingBrush.color,
            strokeWidth: this.canvas.freeDrawingBrush.width,
            strokeLineCap: 'round',
        });
        this.canvas.add(this.element.line);
        this.setDefaultObjectOptions(this.element.line);
        this.element.line.set({
            hasBorders: false,
            selectable: false,
        })
        this.element.line.setControlsVisibility({
            mtr: false,
        });
    }

    setStartControl(object, callback) {
        object.controls.startControl = new fabric.Control({
            x: 0,
            y: -0,
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
}
