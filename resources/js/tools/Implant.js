import { Tool } from './Tool.js';

export class Implant extends Tool {
    constructor(canvas) {
        super(canvas)
    }

    async addImplantObject(url) {
        let img = await this.canvas.simulator.loadImageFromUrl(url);
        this.canvas.add(img);
        img.center();
        this.setDefaultObjectOptions(img);
        this.canvas.requestRenderAll();
    }


}
