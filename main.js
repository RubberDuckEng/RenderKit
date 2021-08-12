const ckLoaded = CanvasKitInit({
    locateFile: (file) => 'https://unpkg.com/canvaskit-wasm@0.19.0/bin/' + file
});

function fitCanvasToWindow(devicePixelRatio) {
    let canvas = document.getElementById('display');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width * devicePixelRatio;
    canvas.height = width * devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

function main() {
    ckLoaded.then((sk) => {
        const devicePixelRatio = window.devicePixelRatio;
        fitCanvasToWindow(devicePixelRatio);

        const surface = sk.MakeCanvasSurface('display');
        let tree = new RenderBox();

        function drawFrame(canvas) {

            canvas.clear(sk.BLUE);
            let offset = new Offset(50, 50);
            tree.paint(sk, canvas, offset);
            // surface.requestAnimationFrame(drawFrame);
        }

        surface.requestAnimationFrame(drawFrame);
    });
}

document.addEventListener('DOMContentLoaded', main);
