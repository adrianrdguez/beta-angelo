class Implant extends Tool {
    constructor(canvas) {
        super(canvas)
    }

    addImplantObject = (url) => {
        fabric.Image.fromURL(url, (img) => {
            this.canvas.add(img);
            img.center();
            this.setDefaultObjectOptions(img);
        });
        this.canvas.requestRenderAll();
    }


}
