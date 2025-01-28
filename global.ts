//Tool class for tool constants
class Tool {
    public static readonly Line = new Tool("Line", "btn-line",true);
    public static readonly Circle = new Tool("Circle", "btn-circle",true);
    public static readonly Rectangle = new Tool("Rectangle", "btn-rect",true);
    public static readonly Pen = new Tool("Pen", "btn-pen",true);
    public static readonly Brush = new Tool("Brush", "btn-brush",true);
    public static readonly Spray = new Tool("Spray", "btn-spray",true);
    public static readonly Flood_Fill = new Tool("Flood Fill", "btn-flood-fill",true);
    public static readonly Eraser = new Tool("Eraser", "btn-eraser",true);
    public static readonly Eye_Dropper = new Tool("Eye Dropper", "btn-eye-dropper",true);
    public static readonly Text = new Tool("Text", "btn-text",true);
    public static readonly Zoom_In = new Tool("Zoom In", "btn-zoom-in",false);
    public static readonly Zoom_Out = new Tool("Zoom Out", "btn-zoom-out",false);
    public static readonly Undo = new Tool("Undo", "btn-undo",false);
    public static readonly Redo = new Tool("Redo", "btn-redo",false);

    constructor(public name: string, public id: string,public toggle:boolean) {}

    toString(): string {
        return this.name;
    }

    public static getAllTools(): Tool[] {
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
            Tool.Text           
        ];
    }
}
// Class for global variables
class g {
    //flag for drawing on canvas true/false
    static drawing = false;
    //current tool for drawing string= line, circle, rect, pen, brush, spray, fill
    static current_tool = Tool.Pen;
    //color of pencil
    static pen_color = "black";
    //width of pencil
    static pen_width = 10;
    //Opacity of pencil 0-Transparent to 1-Opaque
    static pen_opacity = 1;
    //pen blur radius
    static pen_blur: number = 1;
    //pen type solid or dashed
    static pen_type = "solid";
    //pen cap type round or square
    static pen_cap = "round";
    //pen join type round or bevel
    static pen_join = "round";
    //color of brush
    static brush_color = "blue";
    //Brush blur radius
    static brush_blur: number = 2;
    //radius of circle for spray tool
    static spray_radius = 50;
    //density of spray tool
    static spray_density = 100;
    //Start position X of mouse
    static startX = 0
    //Start position Y of mouse
    static startY = 0;
    //Zoom factor of canvas
    static zoom_factor = 1;
    //Image width of original canvas
    static image_width = 500;
    //Image height of original canvas
    static image_height = 500;
    //image background color
    static image_bg_color = "white";
    //flag for zooming true/false
    static zooming = false;
    //tool icon size
    static tool_icon_size = '24px';
    //flag for erasing true/false
    static erasing = false;
    static counter = 0;
    static undo_index=-1;
    //file location on disk
    static filepath ="";
}





class layer_class {
    canvas: OffscreenCanvas = new OffscreenCanvas(g.image_width, g.image_height);
    ctx: OffscreenCanvasRenderingContext2D = this.canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
}

let layers: layer_class[] = [];
layers.push(new layer_class());
layers.push(new layer_class());


