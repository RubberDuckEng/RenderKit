const ckLoaded = CanvasKitInit({
    locateFile: (file) => 'https://unpkg.com/canvaskit-wasm@0.19.0/bin/' + file
});

function fitCanvasToWindow(devicePixelRatio) {
    let canvas = document.getElementById('display');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

function main() {
    ckLoaded.then((sk) => {
        const devicePixelRatio = window.devicePixelRatio;
        fitCanvasToWindow(devicePixelRatio);

        function requestFrame() {
            surface.requestAnimationFrame(drawFrame);
        }

        const surface = sk.MakeCanvasSurface('display');
        let wnd = new Window(requestFrame);
        let sizedBoxTop = new RenderSizedBox(new Size(200, 100));
        let sizedBoxBottom = new RenderSizedBox(new Size(200, 100));
        let tree = new RenderRoot(wnd,
            new RenderTopAndBottom(sizedBoxTop, sizedBoxBottom)
        );

        tree.devicePixelRatio = window.devicePixelRatio;
        sizedBoxTop.color = sk.Color4f(0, 1, 0, 1);
        sizedBoxBottom.color = sk.Color4f(1, 1, 0, 1);

        function drawFrame(canvas) {
            let constraints = new BoxConstraints(0, window.innerWidth,
                0, window.innerHeight / 2);
            tree.performLayout(constraints);

            canvas.clear(sk.BLUE);
            let offset = new Offset(0, 0);
            tree.paint(sk, canvas, offset);
        }

        wnd.requestFrame();

        function onClick(event) {
            let offset = new Offset(event.x, event.y);
            let box = tree.hitTest(offset);
            if (box) {
                box.handleEvent(new ClickEvent());
            }
            // let size = new Size(sizedBoxTop.size.width, sizedBoxTop.size.height + 10);
            // box.setPreferredSize(size);
        }

        document.addEventListener('click', onClick);
    });
}

document.addEventListener('DOMContentLoaded', main);
