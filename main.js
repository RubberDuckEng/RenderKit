const ckLoaded = CanvasKitInit({
    locateFile: (file) => 'https://unpkg.com/canvaskit-wasm@0.19.0/bin/' + file
});
function fitCanvasToWindow() {
    let canvas = document.getElementById('display');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
ckLoaded.then((sk) => {
    fitCanvasToWindow();
    const surface = sk.MakeCanvasSurface('display');

    let tree = new RenderBox();
    let x = 0;

    function drawFrame(canvas) {
        canvas.clear(sk.BLUE);
        x += 1;
        let offset = new Offset(x, 50);

        tree.paint(sk, canvas, offset);
        // surface.requestAnimationFrame(drawFrame);
    }

    surface.requestAnimationFrame(drawFrame);
});
