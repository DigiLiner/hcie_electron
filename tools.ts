function drawPen(e: MouseEvent, ctx: CanvasRenderingContext2D) {

    //var gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    //gradient.addColorStop(0, 'blue');
    //gradient.addColorStop(1, 'green');

    // Set stroke style to the gradient
    //ctx.strokeStyle = gradient;


    ctx.beginPath();
    ctx.moveTo(g.startX, g.startY);
    ctx.lineTo(g.pX , g.pY);
    ctx.stroke();
    //set ctx style gradient
    ctx.closePath();
    g.startX = g.pX;
    g.startY = g.pY;
    ctx.filter= "none";
}

function drawLine(e: MouseEvent, ctx: CanvasRenderingContext2D) {

    ctx.beginPath();
    ctx.moveTo(g.startX, g.startY);
    ctx.lineTo(g.pX, g.pY);
    ctx.stroke();

}

function drawCircle(e: MouseEvent, ctx: CanvasRenderingContext2D) {
    console.log("drawCircle", e);
    ctx.beginPath();
    const radius = Math.sqrt(Math.pow(g.pX - g.startX, 2) + Math.pow(g.pY - g.startY, 2));
    console.log("radius", radius);
    ctx.arc(g.startX, g.startY, radius, 0, Math.PI * 2);
    ctx.stroke();
}

function drawRect(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
}