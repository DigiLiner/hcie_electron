"use strict";
//Tool class for tool constants
class Tool {
    constructor(name, id, toggle) {
        this.name = name;
        this.id = id;
        this.toggle = toggle;
    }
    toString() {
        return this.name;
    }
    static getAllTools() {
        return [
            Tool.Line,
            Tool.Circle,
            Tool.Rectangle,
            Tool.Pen,
            Tool.Brush,
            Tool.Spray,
            Tool.Flood_Fill,
            Tool.Eraser,
            Tool.Eye_Dropper,
            Tool.Text,
        ];
    }
}
Tool.Line = new Tool("Line", "btn-line", true);
Tool.Circle = new Tool("Circle", "btn-circle", true);
Tool.Rectangle = new Tool("Rectangle", "btn-rect", true);
Tool.Pen = new Tool("Pen", "btn-pen", true);
Tool.Brush = new Tool("Brush", "btn-brush", true);
Tool.Spray = new Tool("Spray", "btn-spray", true);
Tool.Flood_Fill = new Tool("Flood Fill", "btn-flood-fill", true);
Tool.Eraser = new Tool("Eraser", "btn-eraser", true);
Tool.Eye_Dropper = new Tool("Eye Dropper", "btn-eye-dropper", true);
Tool.Text = new Tool("Text", "btn-text", true);
Tool.Zoom_In = new Tool("Zoom In", "btn-zoom-in", false);
Tool.Zoom_Out = new Tool("Zoom Out", "btn-zoom-out", false);
Tool.Undo = new Tool("Undo", "btn-undo", false);
Tool.Redo = new Tool("Redo", "btn-redo", false);
/// Class for global variables
class g {
}
//flag for drawing on canvas true/false
g.drawing = false;
//current tool for drawing string= line, circle, rect, pen, brush, spray, fill
g.current_tool = Tool.Pen;
//color of pencil
g.pen_color = '#000000';
//width of pencil
g.pen_width = 10;
//Opacity of pencil 0-Transparent to 1-Opaque
g.pen_opacity = 1;
//pen blur radius
g.pen_blur = 1;
//pen type solid or dashed
g.pen_type = "solid";
//pen cap type round or square
g.pen_cap = "round";
//pen join type round or bevel
g.pen_join = "round";
//color of brush
g.brush_color = "blue";
//Brush blur radius
g.brush_blur = 2;
//radius of circle for spray tool
g.spray_radius = 50;
//density of spray tool
g.spray_density = 100;
//Start position X of mouse
g.startX = 0;
//Start position Y of mouse
g.startY = 0;
//Zoom factor of canvas
g.zoom_factor = 2;
//Image width of original canvas
g.image_width = 500;
//Image height of original canvas
g.image_height = 500;
//image background color
g.image_bg_color = "white";
//flag for zooming true/false
g.zooming = false;
//tool icon size
g.tool_icon_size = "24px";
//flag for erasing true/false
g.erasing = false;
g.counter = 0;
g.undo_index = -1;
//file location on disk
g.filepath = "";
class layer_class {
    constructor() {
        this.canvas = new OffscreenCanvas(g.image_width, g.image_height);
        this.ctx = this.canvas.getContext("2d");
    }
}
let layers = [];
layers.push(new layer_class());
layers.push(new layer_class());
/// Function to convert RGB string to integer
function rgbToInt(rgbString) {
    // Extract numbers using regex
    const match = rgbString.match(/\d+/g);
    if (!match || match.length < 3) {
        throw new Error("Invalid RGB format");
    }
    // Convert extracted values to integers
    const [r, g, b] = match.map(Number);
    console.log(r, g, b);
    // Combine into a single integer
    return (r << 16) | (g << 8) | b;
}
