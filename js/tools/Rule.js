class Rule extends Tool {

    constructor(canvas) {
        super(canvas)
    }

    startAddingLine = (event) => {
        let pointer = this.canvas.getPointer(event.e);
        let line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            id: 'added-line',
            stroke: 'red',
            strokeWidth: this.canvas.freeDrawingBrush.width ?? 3,
            selectable: false
        })
        this.canvas.line = line;
        this.canvas.add(line);
        this.canvas.requestRenderAll();
    }

    startDrawingLine = (event) => {
        if (this.canvas.line) {
            let pointer = this.canvas.getPointer(event.e);

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

    updateNewLineCoordinates = (object) => {
        let obj = object.target;

        // Todo: Cambiar la forma de identificar el objeto, en html los id no pueden repetirse
        if (obj?.id === 'added-line') {
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

    addingControlPoints = (object) => {
        let obj = object.target;

        let newLineCoords = this.updateNewLineCoordinates(object);

        if (!obj) {
            return;
        } else {
            // Todo: Cambiar la forma de identificar el objeto, en html los id no pueden repetirse
            if (obj?.id === 'added-line') {
                let pointer1 = new fabric.Circle({
                    id: 'pointer1',
                    radius: obj.strokeWidth * 6,
                    fill: 'red',
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
                    fill: 'red',
                    opacity: 0.5,
                    top: newLineCoords.y2,
                    left: newLineCoords.x2,
                    originX: 'center',
                    originY: 'center',
                    hasBorders: false,
                    hasControls: false
                })

                this.canvas.add(pointer1, pointer2);
                this.canvas.discardActiveObject();
                this.canvas.requestRenderAll();

                // TODO: Esto esta mal, cada vez que se ejecute un doble click se va a crear un evento?
                this.canvas.on('object:moving', this.endPointOfLineFollowPointer);
            }
        }
    }

    endPointOfLineFollowPointer = (object) => {
        let obj = object.target;

        // Todo: Cambiar la forma de identificar el objeto, en html los id no pueden repetirse
        if (obj?.id === 'pointer1') {
            this.canvas.getObjects().forEach(object => {
                if (object?.id === 'added-line') {
                    object.set({
                        x1: obj.left,
                        y1: obj.top
                    })
                    object.setCoords();
                }
            })
        }

        // Todo: Cambiar la forma de identificar el objeto, en html los id no pueden repetirse
        if (obj?.id === 'pointer2') {
            this.canvas.getObjects().forEach(object => {
                if (object?.id === 'added-line') {
                    object.set({
                        x2: obj.left,
                        y2: obj.top
                    })
                    object.setCoords();
                }
            })
        }
    }


}
