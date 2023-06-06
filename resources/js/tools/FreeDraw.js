import { Tool } from './Tool.js';

export class FreeDraw extends Tool {
    constructor(canvas) {
        super(canvas, 'free-draw');
        this.canvas.isDrawingMode = true;
        this.resetEvents();
        this.canvas.on('path:created', event => this.pathCreated(event));
    }

    pathCreated(event) {
        this.simulator.setBackgroundOptions(event.path);
    }

}
