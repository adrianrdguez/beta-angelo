import { Tool } from './Tool.js';

export class Drag extends Tool {
    isDragging = false;
    constructor(canvas) {
        super(canvas, 'drag');
        this.resetEvents();
        this.canvas.on('mouse:down', (event) => this.activateDraggingMode(event));
        this.canvas.on('mouse:move', (event) => this.dragScreen(event));
        this.canvas.on('mouse:up', () => this.disableDraggingMode());
        this.canvas.requestRenderAll();
    }

    activateDraggingMode(event) {
        if (!event.target) {
            this.isDragging = true;
            event = event.e;
            let coords = this.getClientCoords(event);
            this.canvas.lastPosX = coords.clientX;
            this.canvas.lastPosY = coords.clientY;
        }
    }

    dragScreen(event) {
        if (this.isDragging) {
            event = event.e;
            let coords = this.getClientCoords(event);
            this.canvas.viewportTransform[4] += coords.clientX - this.canvas.lastPosX;
            this.canvas.viewportTransform[5] += coords.clientY - this.canvas.lastPosY;
            this.canvas.requestRenderAll();
            this.canvas.lastPosX = coords.clientX;
            this.canvas.lastPosY = coords.clientY;
        }
    }

    disableDraggingMode() {
        this.canvas.setViewportTransform(this.canvas.viewportTransform);
        this.isDragging = false;
    }

    getClientCoords(event) {
        let clientX = this.canvas.lastPosX;
        let clientY = this.canvas.lastPosY;
        if (event.clientX) {
            clientX = event.clientX;
        }
        if (event.clientY) {
            clientY = event.clientY;
        }
        if (event.touches?.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        }
        return {
            clientX: clientX,
            clientY: clientY,
        }
    }

}
