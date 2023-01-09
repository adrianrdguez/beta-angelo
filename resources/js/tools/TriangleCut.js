import { RuleTriangle } from "./RuleTriangle";

export class TriangleCut extends RuleTriangle {
  cutPath = [];
  cutLinePaths = [];
  constructor(canvas) {
    super(canvas);
  }

  createTriangle() {
    super.createTriangle();
    this.element.line3.set({
      stroke: 'blue',
    });
  }

  addingControlPoints() {
    if (!this.element.pointer4) {
      super.addingControlPoints();
      this.element.pointer1?.set({
        stroke: 'blue',
        fill: 'blue',
      });
      this.element.pointer1?.on('mousedblclick', () => this.createCutterPointer())
    }
  }

  createCutterPointer() {
    let pointerCoords = this.getNewLineCoordinates();
    if (!this.element.pointer4) {
      this.setBrushOptions(0.3);
      this.element.line4 = this.createLine(this.element.line3.x1, this.element.line3.y1, this.element.line3.x2, this.element.line3.y2);
      this.element.line4.set({
        x1: this.element.line3.x1,
        y1: this.element.line3.y1,
        x2: this.element.line3.x2,
        y2: this.element.line3.y2,
      });
      this.element.pointer4 = this.createPointer(pointerCoords.pointer1Coords.top, pointerCoords.pointer1Coords.left);
      this.element.pointer4.set({
        radius: this.element.pointer4.radius + 20,
        stroke: 'lightblue',
        fill: 'lightblue',
      });
      this.element.pointer4.off('moving');
      this.element.pointer4.on('moving', () => this.pointer4Movement());
      this.element.pointer4.on('mousedblclick', () => this.finishCutPath());
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    }
  }

  pointer4Movement() {
    let lineCoords = [];
    if (!this.cutPath.length) {
      lineCoords.push(this.element.line1.x1);
      lineCoords.push(this.element.line1.y1);
    } else {
      let lastPosition = this.cutPath[this.cutPath.length - 1];
      lineCoords.push(lastPosition.x);
      lineCoords.push(lastPosition.y);
    }
    lineCoords.push(this.element.pointer4.left);
    lineCoords.push(this.element.pointer4.top);
    let line = new fabric.Line(lineCoords, {
      stroke: this.canvas.freeDrawingBrush.color,
      strokeWidth: this.canvas.freeDrawingBrush.width,
    });
    this.element[Math.random() * 100000000] = line;
    this.cutLinePaths.push(line);
    this.canvas.add(line);
    this.canvas.requestRenderAll();
    this.cutPath.push({
      x: this.element.pointer4.left,
      y: this.element.pointer4.top,
    });
    this.element.line4.set({
      x1: this.element.pointer4.left,
      y1: this.element.pointer4.top,
    });
    this.element.line4.setCoords();
  }

  async cutTrianglePath(linePath) {
    linePath.strokeWidth = 0;
    linePath.fill = 'black';
    let imgShadow = await this.canvas.simulator.loadImageFromUrl(linePath.toDataURL({ width: linePath.width + 20, height: linePath.height + 20 }));
    imgShadow.left = linePath.left;
    imgShadow.top = linePath.top;
    imgShadow.width = linePath.width;
    imgShadow.height = linePath.height;
    this.canvas.add(imgShadow);
    this.canvas.simulator.setBackgroundOptions(imgShadow);
    this.canvas.moveTo(imgShadow, 1);
    let tmpRadiographyImg = await this.canvas.simulator.loadImageFromUrl(this.canvas.simulator.radiographyUrl)
    let tmpCanvas = new fabric.Canvas();
    this.canvas.simulator.setCanvasSize(tmpCanvas);
    tmpCanvas.add(tmpRadiographyImg);
    tmpRadiographyImg.center();
    imgShadow.absolutePositioned = true;
    tmpRadiographyImg.clipPath = imgShadow;
    let imgCut = await this.canvas.simulator.loadImageFromUrl(tmpCanvas.toDataURL({ left: imgShadow.left, top: imgShadow.top, width: imgShadow.width, height: imgShadow.height }));
    imgCut.left = imgShadow.left;
    imgCut.top = imgShadow.top;
    imgCut.width = imgShadow.width;
    imgCut.height = imgShadow.height;
    this.canvas.add(imgCut);
    this.setDefaultObjectOptions(imgCut);
    this.element.imgCut = imgCut;
    this.element.imgShadow = imgShadow;
    this.canvas.requestRenderAll();
  }

  finishCutPath() {
    this.cutPath.push({
      x: this.element.line3.x2,
      y: this.element.line3.y2,
    })
    this.cutPath.push({
      x: this.element.line3.x1,
      y: this.element.line3.y1,
    })
    let cutPath = new fabric.Polygon(this.cutPath);
    this.cutTrianglePath(cutPath);
    this.element.triangleShadow = new fabric.Polygon([
      { x: this.element.line1.x1, y: this.element.line1.y1 },
      { x: this.element.line1.x2, y: this.element.line1.y2 },
      { x: this.element.line3.x2, y: this.element.line3.y2 },
    ]);
    this.canvas.add(this.element.triangleShadow);
    this.canvas.moveTo(this.element.triangleShadow, 1);
    this.canvas.simulator.setBackgroundOptions(this.element.triangleShadow);
    this.canvas.simulator.setBackgroundOptions(this.element.line1);
    this.canvas.simulator.setBackgroundOptions(this.element.line2);
    this.canvas.simulator.setBackgroundOptions(this.element.line3);
    this.cutPath = [];
    this.canvas.remove(this.element.line4);
    this.canvas.remove(this.element.pointer4);
    this.cutLinePaths.forEach(element => {
      this.canvas.remove(element);
    });
    this.cutLinePaths = [];
  }
}