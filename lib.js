class Offset {
    constructor(dx, dy) {
        this.dx = dx;
        this.dy = dy;
    }
}

class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}

class RenderBox {
    paint(sk, canvas, offset) {
        let paint = new sk.Paint();
        paint.setColor(sk.Color4f(0, 1, 0, 1));
        paint.setAntiAlias(true);
        let rect = sk.LTRBRect(10 + offset.dx, 10 + offset.dy, 400, 400);
        canvas.drawRect(rect, paint);
    }
}
