function drawPen(e: MouseEvent, ctx: CanvasRenderingContext2D) {

    //var gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    //gradient.addColorStop(0, 'blue');
    //gradient.addColorStop(1, 'green');

    // Set stroke style to the gradient
    //ctx.strokeStyle = gradient;


    ctx.beginPath();
    ctx.moveTo(g.startX, g.startY);
    ctx.lineTo(e.offsetX , e.offsetY);
    ctx.stroke();
    //set ctx style gradient
    ctx.closePath();
    g.startX = e.offsetX;
    g.startY = e.offsetY;
    ctx.filter= "none";
}

function drawLine(e: MouseEvent, ctx: CanvasRenderingContext2D) {

    ctx.beginPath();
    ctx.moveTo(g.startX, g.startY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

}

function drawCircle(e: MouseEvent, ctx: CanvasRenderingContext2D) {
    console.log("drawCircle", e);
    ctx.beginPath();
    const radius = Math.sqrt(Math.pow(e.offsetX - g.startX, 2) + Math.pow(e.offsetY - g.startY, 2));
    console.log("radius", radius);
    ctx.arc(g.startX, g.startY, radius, 0, Math.PI * 2);
    ctx.stroke();
}

function drawRect(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
}