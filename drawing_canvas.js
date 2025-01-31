"use strict";
//Canvas container
const calculateScreenSize = () => {
    let cc = document.createElement("drawingCanvasContainer");
    const r = document.querySelector(":root");
    const tmpcolorwidth = 120;
    const tmptoolbarheight = 120;
    const tmptoolboxwidth = 50;
    //todo set realtime size later
    const w = window.innerWidth - tmpcolorwidth - tmptoolboxwidth + "px";
    const h = window.innerHeight - tmptoolbarheight;
    if (r) {
        // @ts-ignore
        r.style.setProperty("--canvas-width", w);
        // @ts-ignore
        r.style.setProperty("--canvas-height", h + "px");
        // @ts-ignore
        r.style.setProperty("--canvas-top", (h - g.image_height) / 2 + "px");
        //
        if (cc) {
            console.log("window", window.innerWidth, window.innerHeight);
            console.log("w/h", w, h);
            console.log("offset", cc.offsetWidth, cc.offsetHeight);
        }
    }
};
window.addEventListener("resize", calculateScreenSize);
// Initial calculation
calculateScreenSize();
let originalCanvas;
originalCanvas = document.getElementById('originalCanvas');
if (originalCanvas !== null) {
    originalCanvas.width = g.image_width;
    originalCanvas.height = g.image_height;
}
else {
    console.error("originalCanvas not found");
}
//Viewer/Drawing Canvas (Picture1)
let can;
can = document.getElementById("drawingCanvas");
if (can !== null) {
    can.width = g.image_width;
    can.height = g.image_height;
}
else {
    console.error("drawingCanvas not found");
}
//Zoom canvas (Test)
const zoomCanvas = document.getElementById("zoomCanvas");
if (zoomCanvas !== null) {
    zoomCanvas.width = can.width * g.zoom_factor;
    zoomCanvas.height = can.height * g.zoom_factor;
}
else {
    console.error("zoomCanvas not found");
}
//UNDO / REDO
const undo = [];
//Layers
layers[0].ctx.fillStyle = "#0ff";
layers[0].ctx.fillRect(0, 0, 150, 150);
layers[0].ctx.fillStyle = "#000";
layers[0].ctx.fillText("layer 0 bg", 20, 50);
layers[1].ctx.fillStyle = "#f001";
layers[1].ctx.fillRect(100, 100, 150, 150);
layers[1].ctx.fillStyle = "#000f";
layers[1].ctx.fillText("counter: " + g.counter.toString(), 120, 150);
layers[1].ctx.fillStyle = "#0f0f";
layers[1].ctx.fillRect(200, 200, 150, 150);
const ctx = can.getContext("2d");
can.addEventListener('mousedown', (e) => {
    console.log('mousedown buttons:' + e.buttons.toString());
    if (!ctx) {
        console.error("ctx not found");
        return;
    }
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (originalCanvas) {
        ctx.drawImage(originalCanvas, 0, 0);
    }
    else {
        console.error("originalCanvas is null");
    }
    // Pen Line Settings All tools
    ctx.globalAlpha = g.pen_opacity;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash([]);
    ctx.lineWidth = g.pen_width;
    ctx.strokeStyle = g.pen_color;
    g.counter++;
    console.log(g.counter.toString());
    //ctx.filter= "blur(5px)"
    ctx.filter = "blur(" + g.pen_blur + "px)";
    console.log(ctx.filter);
    //Start Position of mouse
    g.startX = e.offsetX;
    g.startY = e.offsetY;
    //Set Drawing Flag
    g.drawing = true;
    switch (g.current_tool) {
        case Tool.Spray:
            drawSpray(ctx, e);
            break; //todo:
        case Tool.Pen:
            drawPen(e, ctx);
            break;
        case Tool.Flood_Fill:
            //convert hex string to int as color
            const match = g.pen_color.match(/\d+/g);
            if (!match || match.length < 3) {
                throw new Error("Invalid RGB format");
            }
            // Convert extracted values to integers
            const [r, gr, b] = match.map(Number);
            floodFill(e.offsetX, e.offsetY, ctx, { r: r, g: gr, b: b, a: 255 }, { r: 48, g: 48, b: 48, a: 64 }); //todo: siyah (0) ise çalışıyor
            break;
        default:
            break;
    }
    console.log(`Mouse down at (${e.offsetX}, ${e.offsetY}) with tool ${g.current_tool} and color ${g.pen_color}`);
});
can.addEventListener("mousemove", (e) => {
    if (!ctx) {
        console.error("ctx not found");
        return;
    }
    ctx.globalAlpha = 1;
    ctx.filter = "none";
    // console.log('mousemove ' + g.drawing + ' ' + e.buttons.toString());
    // console.log(`Mouse move at (${e.offsetX}, ${e.offsetY}) with tool ${g.current_tool} and color ${g.pencil_color}`);
    if (e.buttons === 1) {
        if (!g.drawing) {
            finishDrawing();
            g.startX = e.offsetX;
            g.startY = e.offsetY;
            g.drawing = true;
        }
        if (!(g.current_tool === Tool.Spray || //Type 1 tools excluded
            g.current_tool === Tool.Pen)) {
            console.log("layers.length:", layers.length);
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(originalCanvas, 0, 0);
        }
        console.log(g.current_tool, g.drawing);
        //Pen Line Settings All tools
        ctx.filter = "blur(" + g.pen_blur + "px)";
        ctx.globalAlpha = g.pen_opacity;
        if (g.current_tool === Tool.Circle) {
            drawCircle(e, ctx);
        }
        else if (g.current_tool === Tool.Line) {
            drawLine(e, ctx);
        }
        else if (g.current_tool === Tool.Rectangle) {
            drawRect(ctx, g.startX, g.startY, e.offsetX, e.offsetY);
        }
        else if (g.current_tool === Tool.Pen) {
            drawPen(e, ctx);
        }
        else if (g.current_tool === Tool.Brush) {
            drawCircle(e, ctx);
        }
        else if (g.current_tool === Tool.Spray) {
            //todo:
            drawSpray(ctx, e);
        }
    }
});
can.addEventListener("mouseup", () => {
    //if (e.buttons === 0) {return}
    finishDrawing();
});
function finishDrawing() {
    if (ctx === null) {
        console.error("ctx not found");
        return;
    }
    if (!originalCanvas) {
        console.error("originalCanvas not found");
        return;
    }
    if (!zoomCanvas) {
        console.error("zoomCanvas not found");
        return;
    }
    const originalCtx = originalCanvas.getContext("2d");
    if (!originalCtx) {
        console.error("originalCtx not found");
        return;
    }
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    originalCtx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    originalCtx.drawImage(ctx.canvas, 0, 0);
    if (g.undo_index < undo.length - 1) {
        undo.splice(g.undo_index + 1, undo.length - g.undo_index - 1);
    }
    undo.push(originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height));
    g.undo_index = undo.length - 1;
    console.log(g.undo_index, undo.length, "finishDrawing");
    g.drawing = false;
    /*const zoomCtx = zoomCanvas.getContext('2d');
      if (zoomCtx) {
          zoomCtx.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);
          zoomCtx.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height, 0, 0, zoomCanvas.width, zoomCanvas.height);
          //applyBlurEffect();
          //todo://applySepiaEffect();
     */
}
function selectTool(tool) {
    g.current_tool = tool;
    //enable or disable sliders for spray tool
    const sliderRadius = document.getElementById("sliderContainerRadius");
    const sliderDensity = document.getElementById("sliderContainerDensity");
    if (g.current_tool === Tool.Spray) {
        sliderRadius.style.display = "flex";
        sliderDensity.style.display = "flex";
    }
    else {
        sliderRadius.style.display = "none";
        sliderDensity.style.display = "none";
    }
    //Clear previous selected tool's style from buttons
    //todo: needs to be refactored
    clearSelected();
    let e = document.getElementById(tool.id);
    if (e === null) {
        console.error(tool.id, "element not found");
        return;
    }
    e.classList.add("down");
}
function clearSelected() {
    Tool.getAllTools().forEach((t) => {
        let elem = document.getElementById(t.id);
        if (elem === null) {
            console.error(t.id, "element not found");
            return;
        }
        elem.classList.remove("down");
    });
}
function undoImage() {
    if (g.undo_index > 0) {
        g.undo_index--;
        drawUndoImage();
    }
}
function redoImage() {
    if (g.undo_index < undo.length - 1) {
        g.undo_index++;
        drawUndoImage();
    }
}
function drawUndoImage() {
    console.log("UNDO+ I/L:", g.undo_index, undo.length);
    const originalCtx = originalCanvas.getContext("2d");
    if (!originalCtx) {
        console.error("ctx not found");
        return;
    }
    else {
        originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
        originalCtx.putImageData(undo[g.undo_index], 0, 0);
        // @ts-ignore
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // @ts-ignore
        ctx.putImageData(undo[g.undo_index], 0, 0);
    }
}
finishDrawing(); // Run once for proper undo
async function openImage(filename) {
    let img = await loadImage(filename);
    g.undo_index = -1;
    undo.splice(0, undo.length);
    // @ts-ignore
    can === null || can === void 0 ? void 0 : can.width = img.width;
    // @ts-ignore
    can === null || can === void 0 ? void 0 : can.height = img.height;
    ctx === null || ctx === void 0 ? void 0 : ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(img, 0, 0, img.width, img.height);
    originalCanvas.width = ctx === null || ctx === void 0 ? void 0 : ctx.canvas.width;
    originalCanvas.height = ctx === null || ctx === void 0 ? void 0 : ctx.canvas.height;
    finishDrawing();
}
async function loadImage(url) {
    return new Promise((r) => {
        let i = new Image();
        i.onload = () => r(i);
        i.src = url;
    });
}
function getCanvasImageDataURL() {
    const canvas = document.getElementById("originalCanvas");
    return canvas.toDataURL("image/png");
}
console.log("Started...");
