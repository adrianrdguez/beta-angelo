class Simulator {
    constructor(radiography) {
        this.canvas = new fabric.Canvas('canvas', { selection: false });
        this.setCanvasSize();
        fabric.Image.fromURL(radiography, (img) => {
            this.canvas.add(img);
            img.center();
            img.set({
                centeredRotation: false,
                centeredScaling: false,
                evented: false,
                hasBorders: false,
                hasControls: false,
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                lockScalingFlip: true,
                lockScalingX: true,
                lockScalingY: true,
                lockSkewingX: true,
                lockSkewingY: true,
                selectable: false,
            });
        });
    }

    // ------------- Eventos -------------------

    init = () => {
        window.onresize = this.setCanvasSize

        let addingLineButton = document.getElementById('adding-line-btn');
        addingLineButton.addEventListener('click', this.setRuleMode);


        this.canvas.on('mouse:wheel', (opt) => {
            this.zoomToPoint(opt);
        });

        this.canvas.on('mouse:down', (opt) => {
            console.log("rule", this.canvas.isRuleMode)
            if (this.canvas.isRuleMode) {
                this.startAddingLine(opt);
            }
            else if (!opt.target && !this.canvas.isDrawingMode) {
                this.activateDraggingMode(opt);
            }
        });
        this.canvas.on('mouse:move', (opt) => {
            if (this.canvas.isRuleMode) {
                this.startDrawingLine(opt);
            }
            else if (this.canvas.isDragging) {
                this.dragScreen(opt);
            }
        });
        this.canvas.on('mouse:up', () => {
            if (this.canvas.isRuleMode) {
                this.stopDrawingLine();
            }
            else if (this.canvas.isDragging) {
                this.disableDraggingMode();
            }
        });
        this.canvas.on('path:created', () => {
            if (this.canvas.isDrawingMode && this.canvas.fillDrawing) {
                this.canvas.getObjects().forEach(o => o.fill = this.canvas.freeDrawingBrush.color);
                this.canvas.renderAll();
            }
        });
    }

    setCanvasSize = () => {
        this.canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }

    zoomToPoint = (opt) => {
        let delta = opt.e.deltaY;
        let zoom = this.canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
    }

    activateDraggingMode = (opt) => {
        let event = opt.e;
        this.canvas.isDragging = true;
        this.canvas.lastPosX = event.clientX;
        this.canvas.lastPosY = event.clientY;
    }

    disableDraggingMode = () => {
        this.canvas.setViewportTransform(this.canvas.viewportTransform);
        this.canvas.isDragging = false;
    }

    dragScreen = (opt) => {
        let e = opt.e;
        let vpt = this.canvas.viewportTransform;
        vpt[4] += e.clientX - this.canvas.lastPosX;
        vpt[5] += e.clientY - this.canvas.lastPosY;
        this.canvas.requestRenderAll();
        this.canvas.lastPosX = e.clientX;
        this.canvas.lastPosY = e.clientY;
    }

    // ------------- Herramientas -------------------

    setDraggingMode = () => {
        this.canvas.isDragging = false;
        this.canvas.isDrawingMode = false;
        this.canvas.isRuleMode = false;
    }

    setRuleMode = () => {
        this.canvas.isRuleMode = true;
    }

    startAddingLine = (mouse) => {
        let pointer = this.canvas.getPointer(mouse.e);

        let line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            id: 'added-line',
            stroke: 'red',
            strokeWidth: 3,
            selectable: false
        })

        this.canvas.line = line;
        this.canvas.add(line);
        this.canvas.requestRenderAll();
    }

    startDrawingLine = (mouse) => {
        if (this.canvas.line) {
            let pointer = this.canvas.getPointer(mouse.e);

            this.canvas.line.set({
                x2: pointer.x,
                y2: pointer.y
            });

            this.canvas.requestRenderAll()
        }
    }

    stopDrawingLine = () => {
        this.canvas.line.setCoords();
        delete this.canvas.line;
        this.setDraggingMode();
    }

    setDrawingMode = (width = 3, color = '#fff', fillDrawing = false) => {
        this.canvas.isDragging = false;
        this.canvas.isDrawingMode = true;
        this.canvas.fillDrawing = fillDrawing;
        this.canvas.freeDrawingBrush.color = color;
        this.canvas.freeDrawingBrush.width = parseInt(width, 10) || 1;
    }

    undoLastDraw = () => {
        let path = this.canvas.getObjects('path').pop();
        if (path) {
            this.canvas.remove(path);
        }
    }

    clearDraws = () => {
        for (let path of this.canvas.getObjects('path')) {
            this.canvas.remove(path);
        }
    }

    // ------------- Implantes -------------------

    addImplantObject = (url) => {
        fabric.Image.fromURL(url, (img) => {
            this.canvas.add(img);
            img.center();
            img.set({
                lockScalingFlip: false,
                lockScalingX: true,
                lockScalingY: true,
                lockSkewingX: false,
                lockSkewingY: false,
                selectable: true,
                borderColor: 'blue',
                cornerSize: 50,
                padding: 10,
                cornerStyle: 'circle',
                hasBorders: true,
            });
            img.controls.mtr.offsetY = -parseFloat(60);
            img.setControlVisible('tl', false);
            img.setControlVisible('bl', false);
            img.setControlVisible('tr', false);
            img.setControlVisible('br', false);
            img.setControlVisible('ml', false);
            img.setControlVisible('mb', false);
            img.setControlVisible('mr', false);
            img.setControlVisible('mt', false);
        });
        this.canvas.renderAll();
    }

}

let simulator = new Simulator('img/radiografia.png');
simulator.init()




/* let line;
let mouseDown = false;


let deactivateAddingButton = document.getElementById('deactivate-line-btn');

deactivateAddingButton.addEventListener('click', deactivateAdding)


function deactivateAdding() {
    canvas.off('mouse:down', startAddingLine);
    canvas.off('mouse:move', startDrawingLine);
    canvas.off('mouse:up', stopDrawingLine);

    canvas.getObjects().forEach(object => {
        if (object.id === 'added-line') {
            object.set({
                selectable: true
            })
        }
    })
}

canvas.on({
    'object:moved': updateNewLineCoordinates,
    'selection:created': updateNewLineCoordinates,
    'selection:updated': updateNewLineCoordinates,
    'mouse:dblclick': addingControllPoints
})


function updateNewLineCoordinates(object) {
    let obj = object.target;

    if (obj.id === 'added-line') {
        let centerX = obj.getCenterPoint().x;
        let centerY = obj.getCenterPoint().y;

        let x1offset = obj.calcLinePoints().x1;
        let y1offset = obj.calcLinePoints().y1;
        let x2offset = obj.calcLinePoints().x2;
        let y2offset = obj.calcLinePoints().y2;

        return {
            x1: centerX + x1offset,
            y1: centerY + y1offset,
            x2: centerX + x2offset,
            y2: centerY + y2offset
        }
    }
}

function addingControllPoints(object) {
    let obj = object.target;

    let newLineCoords = updateNewLineCoordinates(object);

    if (!obj) {
        return;
    } else {
        if (obj.id === 'added-line') {
            let pointer1 = new fabric.Circle({
                id: 'pointer1',
                radius: obj.strokeWidth * 6,
                fill: 'blue',
                opacity: 0.5,
                top: newLineCoords.y1,
                left: newLineCoords.x1,
                originX: 'center',
                originY: 'center',
                hasBorders: false,
                hasControls: false
            })

            let pointer2 = new fabric.Circle({
                id: 'pointer2',
                radius: obj.strokeWidth * 6,
                fill: 'blue',
                opacity: 0.5,
                top: newLineCoords.y2,
                left: newLineCoords.x2,
                originX: 'center',
                originY: 'center',
                hasBorders: false,
                hasControls: false
            })

            canvas.add(pointer1, pointer2);
            canvas.discardActiveObject();
            canvas.requestRenderAll();

            canvas.on('object:moving', endPointOfLineFollowPointer);
        }
    }
}

function endPointOfLineFollowPointer(object) {
    let obj = object.target;

    if (obj.id === 'pointer1') {
        canvas.getObjects().forEach(object => {
            if (object.id === 'added-line') {
                object.set({
                    x1: obj.left,
                    y1: obj.top
                })
                object.setCoords();
            }
        })
    }

    if (obj.id === 'pointer2') {
        canvas.getObjects().forEach(object => {
            if (object.id === 'added-line') {
                object.set({
                    x2: obj.left,
                    y2: obj.top
                })
                object.setCoords();
            }
        })
    }
} */