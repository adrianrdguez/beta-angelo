import { Rule } from './Rule.js';
import { Drag } from './Drag.js';

export class InitialRule extends Rule {
    constructor(canvas) {
        super(canvas);
        this.canvas.remove(this.element.text);
        setTimeout(() => {
            this.simulator.offcanvasToggler('offcanvas-initial-settings', true);
        }, 100);
        canvas.simulator.initialLine = this;
        this.simulator.setCurrentTool(new Drag(this.canvas));
    }

    movingControlPointsCallback() {
        return;
    }

    setDeleteControl(object) {
        return;
    }

}