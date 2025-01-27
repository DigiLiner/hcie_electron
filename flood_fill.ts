function flood_fill(ctx: CanvasRenderingContext2D, x: number, y: number, fillcolor: string) {
    // read the pixels in the canvas
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

    // get the color we're filling
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const targetColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
   
    console.log('targetcolor:',targetColor);
    console.log(ctx.canvas.width, ctx.canvas.height);
    // check we are actually filling a different color
    if (!colorsMatch(targetColor, fillcolor)) {

        const pixelsToCheck: any[]    = [];
        while (pixelsToCheck.length > 0) {
            let y = pixelsToCheck.pop();
            const x = pixelsToCheck.pop();
    
            const currentColor = getPixel(imageData, x, y);
            if (colorsMatch(currentColor, targetColor)) {
                setPixel(imageData, x, y, fillcolor);
                pixelsToCheck.push(x + 1);
                pixelsToCheck.push(x - 1);
                pixelsToCheck.push( y + 1);
                pixelsToCheck.push( y - 1);
            }
        }

    // put the data back
    ctx.putImageData(imageData, 0, 0);
    }
}
function colorsMatch(a:any, b:any) {
return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

function fillPixel(imageData: ImageData, x: number, y:number, targetColor: string, fillColor: string) {
const currentColor = getPixel(imageData, x, y);
if (colorsMatch(currentColor, targetColor)) {
    setPixel(imageData, x, y, g.pen_color);
    fillPixel(imageData, x + 1, y, targetColor, fillColor);
    fillPixel(imageData, x - 1, y, targetColor, fillColor);
    fillPixel(imageData, x, y + 1, targetColor, fillColor);
    fillPixel(imageData, x, y - 1, targetColor, fillColor);
}
}
function   setPixel(imageData: ImageData, x: number, y:number , color:any) {
    const offset: number = (y * imageData.width + x) * 4;
    imageData.data[offset + 0] = color[0];
    imageData.data[offset + 1] = color[1];
    imageData.data[offset + 2] = color[2];
    imageData.data[offset + 3] = color[0];
}
function  getPixel(imageData: ImageData, x: number, y:   number) {
    if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
        return [-1, -1, -1, -1];  // impossible color
    } else {
        const offset = (y * imageData.width + x) * 4;
        return imageData.data.slice(offset, offset + 4);
    }
}
