import {Tool} from './Tool.js';

export class FreeDraw extends Tool {
    constructor(canvas) {
        super(canvas, 'free-draw');
        this.canvas.isDrawingMode = true;
        this.resetEvents();
        this.canvas.on('path:created', event => this.pathCreated(event));
    }

    undoLastDraw() {
        let path = this.canvas.getObjects('path').pop();
        if (path) {
            this.canvas.remove(path);
        }
    }

    clearDraws() {
        for (let path of this.canvas.getObjects('path')) {
            this.canvas.remove(path);
        }
    }

    pathCreated(event) {
        this.canvas.simulator.setBackgroundOptions(event.path);
    }

}
