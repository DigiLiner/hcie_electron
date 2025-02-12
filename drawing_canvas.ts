//Canvas container


const calculateScreenSize = () => {
    let cc: HTMLElement | null = document.createElement(
        "drawingCanvasContainer"
    ) as HTMLElement | null;
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


let originalCanvas: OffscreenCanvas | HTMLCanvasElement;
originalCanvas = document.getElementById('originalCanvas') as OffscreenCanvas | HTMLCanvasElement;
const originalCtx = originalCanvas.getContext("2d");
if (originalCanvas !== null) {
    originalCanvas.width = g.image_width;
    originalCanvas.height = g.image_height;
} else {
    console.error("originalCanvas not found");
}
//Viewer/Drawing Canvas (Picture1)
let can: HTMLCanvasElement | null;
let tempCanvas: OffscreenCanvas = new OffscreenCanvas(g.image_width, g.image_height);
const tempCtx: OffscreenCanvasRenderingContext2D = tempCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

can = document.getElementById("drawingCanvas") as HTMLCanvasElement;
if (can !== null) {
    can.width = g.image_width;
    can.height = g.image_height;
} else {
    console.error("drawingCanvas not found");
}
//Zoom canvas (Test)
const zoomCanvas: OffscreenCanvas | null = document.getElementById(
    "zoomCanvas"
) as OffscreenCanvas | null;
if (zoomCanvas !== null) {
    zoomCanvas.width = can.width * g.zoom;
    zoomCanvas.height = can.height * g.zoom;
} else {
    console.error("zoomCanvas not found");
}
//UNDO / REDO
const undo: ImageData[] = [];

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

const ctx: CanvasRenderingContext2D | null = can.getContext("2d");
////////////////////////////////////////////////////
/////////////////   D  O  W  N /////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////

can.addEventListener('mousedown', (e) => {
    console.log('mousedown buttons:' + e.buttons.toString());
    if (!ctx) {
        console.error("ctx not found");
        return;
    }
    tempCtx.globalAlpha = 1;
    tempCtx.filter = "none";
    tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);

    if (originalCanvas) {
        tempCtx.drawImage(originalCanvas, 0, 0); //Backup original
        ctx.clearRect(0, 0, g.image_width, g.image_height);
        ctx.drawImage(tempCanvas, 0, 0);

    } else {
        console.error("originalCanvas is null");
    }

    ctx.filter = 'none';
    ctx.globalAlpha = 1;
    // Pen Line Settings All tools
    tempCtx.globalAlpha = g.pen_opacity;
    if (g.pen_blur > 0) {
        tempCtx.filter = "blur(" + g.pen_blur + "px)";
    } else {
        tempCtx.filter = "none";
    }
    tempCtx.lineCap = "round";
    tempCtx.lineJoin = "round";
    tempCtx.setLineDash([]);
    tempCtx.lineWidth = g.pen_width;
    tempCtx.strokeStyle = g.pen_color;
    g.counter++;
    console.log(g.counter.toString());


    g.pX = Math.round( e.offsetX / g.zoom);
    g.pY = Math.round( e.offsetY / g.zoom);
    //Start Position of mouse
    g.startX = g.pX;
    g.startY = g.pY;
    //Set Drawing Flag
    g.drawing = true;
    switch (g.current_tool) {
        case Tool.Spray:
            drawSpray(tempCtx as unknown as CanvasRenderingContext2D, e);
            break; //todo:
        case Tool.Pen:
            drawPen(e, tempCtx as unknown as CanvasRenderingContext2D);
            break;
        case Tool.Flood_Fill:
            //convert hex string to int as color

            const match = g.pen_color.match(/\d+/g);
            if (!match || match.length < 3) {
                throw new Error("Invalid RGB format");
            }

            // Convert extracted values to integers
            const [r, gr, b] = match.map(Number);
            const tolerance = 100;
            floodFill(g.pX, g.pY, tempCtx as unknown as CanvasRenderingContext2D, {
                r: r,
                g: gr,
                b: b,
                a: Math.floor(g.pen_opacity * 255)
            }, {
                r: tolerance,
                g: tolerance,
                b: tolerance,
                a: 128
            })


            break;
        default:
            break;
    }

    console.log(
        `Mouse down at (${g.pX}, ${g.pY}) with tool ${g.current_tool} and color ${g.pen_color}`
    );
});
////////////////////////////////////////////////////
/////////////////   M  O  V  E /////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////
can.addEventListener("mousemove", (e) => {
    if (!ctx) {
        console.error("ctx not found");
        return;
    }
    tempCtx.globalAlpha = 1;
    tempCtx.filter = "none";
    // console.log('mousemove ' + g.drawing + ' ' + e.buttons.toString());
    console.log(`Mouse move at (${e.offsetX}, ${e.offsetY}) with tool ${g.current_tool} and color ${g.pen_color}`);
    g.pX = Math.round( e.offsetX / g.zoom);
    g.pY = Math.round( e.offsetY / g.zoom);
    if (e.buttons === 1) {
        if (!g.drawing) {
            finishDrawing();
            g.startX = g.pX;
            g.startY = g.pY;
            g.drawing = true;
        }

        if (
            !(
                g.current_tool === Tool.Spray || //Type 1 tools excluded
                g.current_tool === Tool.Pen
            )
        ) {
            console.log("layers.length:", layers.length);
            tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
            tempCtx.drawImage(originalCanvas, 0, 0);
        }

        console.log(g.current_tool, g.drawing);
        //Pen Line Settings All tools
        if (g.pen_blur > 0) {
            tempCtx.filter = "blur(" + g.pen_blur + "px)";
        } else {
            tempCtx.filter = "none";
        }
        tempCtx.globalAlpha = g.pen_opacity;
        if (g.current_tool === Tool.Circle) {
            drawCircle(e, tempCtx as unknown as CanvasRenderingContext2D);
        } else if (g.current_tool === Tool.Line) {
            drawLine(e, tempCtx as unknown as CanvasRenderingContext2D);

        } else if (g.current_tool === Tool.Rectangle) {
            drawRect(tempCtx as unknown as CanvasRenderingContext2D, g.startX, g.startY, g.pX, g.pY);
        } else if (g.current_tool === Tool.Pen) {
            drawPen(e, tempCtx as unknown as CanvasRenderingContext2D);
            //ctx.drawImage(tempCanvas, 0, 0);
        } else if (g.current_tool === Tool.Brush) {
            drawCircle(e, tempCtx as unknown as CanvasRenderingContext2D);
        } else if (g.current_tool === Tool.Spray) {
            //todo:
            drawSpray(tempCtx as unknown as CanvasRenderingContext2D, e);
        }
        console.log("canvas width:", ctx.canvas.width);
        // @ts-ignore
        ctx.clearRect(0, 0, g.image_width, g.image_height); //todo : Strange
        // @ts-ignore
        ctx.drawImage(tempCanvas, 0, 0);
    }
});


can.addEventListener("mouseup", () => {
    //if (e.buttons === 0) {return}

    finishDrawing();
});
////////////////////////////////////////////////////
/////////////////  F I N I S H /////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////
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
    const originalCtx: OffscreenCanvasRenderingContext2D =
        originalCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    if (!originalCtx) {
        console.error("originalCtx not found");
        return;
    }
    tempCtx.filter = "none";
    tempCtx.globalAlpha = 1;
    originalCtx.filter = "none";
    originalCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
    originalCtx.drawImage(tempCtx.canvas, 0, 0);
    ctx.clearRect(0,0,g.image_width, g.image_height);
    ctx.drawImage(originalCtx.canvas, 0, 0);

    //originalCtx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, originalCanvas.width, originalCanvas.height);
    if (g.undo_index < undo.length - 1) {
        undo.splice(g.undo_index + 1, undo.length - g.undo_index - 1);
    }
    undo.push(
        originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height)
    );
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

function selectTool(tool: Tool) {
    g.current_tool = tool;
    //enable or disable sliders for spray tool
    const sliderRadius: HTMLDivElement = document.getElementById(
        "sliderContainerRadius"
    ) as HTMLDivElement;
    const sliderDensity: HTMLDivElement = document.getElementById(
        "sliderContainerDensity"
    ) as HTMLDivElement;

    if (g.current_tool === Tool.Spray) {
        sliderRadius.style.display = "flex";
        sliderDensity.style.display = "flex";
    } else {
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
    Tool.getAllTools().forEach((t: Tool) => {
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
    const originalCtx: OffscreenCanvasRenderingContext2D =
        originalCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    if (!originalCtx) {
        console.error("ctx not found");
        return;
    } else {
        originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
        originalCtx.putImageData(undo[g.undo_index], 0, 0);
        // @ts-ignore
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // @ts-ignore
        ctx.putImageData(undo[g.undo_index], 0, 0);
    }
}

finishDrawing(); // Run once for proper undo

async function openImage(filename: string) {
    let img: HTMLImageElement = await loadImage(filename);
    g.undo_index = -1;
    undo.splice(0, undo.length);
    // @ts-ignore
    can?.width = <number>img.width;
    // @ts-ignore
    can?.height = <number>img.height;
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx?.drawImage(img, 0, 0, img.width, img.height);
    originalCanvas.width = <number>ctx?.canvas.width;
    originalCanvas.height = <number>ctx?.canvas.height;
    finishDrawing();
}

async function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((r) => {
        let i = new Image();
        i.onload = () => r(i);
        i.src = url;
    });
}

function getCanvasImageDataURL(): string | undefined {
    const canvas = document.getElementById("originalCanvas") as HTMLCanvasElement;
    return canvas.toDataURL("image/png");
}


// Function to handle zoom in
function zoomIn() {
    g.zoom = g.zoom * g.zoomFactor;
    console.error("zoom in", g.zoom);
    setZoom();
}

// Function to handle zoom out
function zoomOut() {
    g.zoom = g.zoom / g.zoomFactor;
    setZoom();
}

function setZoom() {
    if (ctx !== null) {
        ctx.save();
        ctx.canvas.width = g.image_width * g.zoom;
        ctx.canvas.height = g.image_height * g.zoom;
        ctx.scale(g.zoom, g.zoom);
        ctx.restore();
        ctx.drawImage(originalCanvas, 0, 0);
    } else {
        console.error("ctx not found")
    }
}


// Event listeners for zoom in and out
can.addEventListener('wheel', (event) => {
    event.preventDefault();
    if (event.deltaY < 0) {
        zoomIn();
    } else {
        zoomOut();
    }
});
console.log("Started...");
