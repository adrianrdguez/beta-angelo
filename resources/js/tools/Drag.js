import {Tool} from './Tool.js';

export class Drag extends Tool {
    isDragging = false;
    constructor(canvas) {
        super(canvas, 'drag');
        this.resetEvents();
        this.canvas.on('mouse:down', (event) => this.activateDraggingMode(event));
        this.canvas.on('mouse:move', (event) => this.dragScreen(event));
        this.canvas.on('mouse:up', () => this.disableDraggingMode());
    }

    activateDraggingMode(event) {
        if (!event.target) {
            this.isDragging = true;
            event = event.e;
            this.canvas.lastPosX = event.clientX;
            this.canvas.lastPosY = event.clientY;
        }
    }

    dragScreen(event) {
        if (this.isDragging) {
            let e = event.e;
            let vpt = this.canvas.viewportTransform;
            vpt[4] += e.clientX - this.canvas.lastPosX;
            vpt[5] += e.clientY - this.canvas.lastPosY;
            this.canvas.requestRenderAll();
            this.canvas.lastPosX = e.clientX;
            this.canvas.lastPosY = e.clientY;
        }
    }

    disableDraggingMode() {
        this.canvas.setViewportTransform(this.canvas.viewportTransform);
        this.isDragging = false;
    }

}
