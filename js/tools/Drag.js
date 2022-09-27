class Drag extends Tool {

    constructor(canvas) {
        super(canvas);
        this.resetEvents();
        this.canvas.on('mouse:down', (event) => this.activateDraggingMode(event));
        this.canvas.on('mouse:move', (event) => this.dragScreen(event));
        this.canvas.on('mouse:up', () => this.disableDraggingMode());
    }

    activateDraggingMode = (event) => {
        event = event.e;
        this.canvas.lastPosX = event.clientX;
        this.canvas.lastPosY = event.clientY;
    }

    dragScreen = (event) => {
        let e = event.e;
        let vpt = this.canvas.viewportTransform;
        vpt[4] += e.clientX - this.canvas.lastPosX;
        vpt[5] += e.clientY - this.canvas.lastPosY;
        this.canvas.requestRenderAll();
        this.canvas.lastPosX = e.clientX;
        this.canvas.lastPosY = e.clientY;
    }

    disableDraggingMode = () => {
        this.canvas.setViewportTransform(this.canvas.viewportTransform);
    }

}
