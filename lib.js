class Offset {
    constructor(dx, dy) {
        this.dx = dx;
        this.dy = dy;
    }

    equals(other) {
        return this.dx == other.dx &&
            this.dy == other.dy;
    }

    add(other) {
        return new Offset(this.dx + other.dx, this.dy + other.dy);
    }
}

class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    equals(other) {
        return this.width == other.width &&
            this.height == other.height;
    }
}

class BoxConstraints {
    constructor(minWidth, maxWidth, minHeight, maxHeight) {
        this.minWidth;
        this.maxWidth;
        this.minHeight;
        this.maxHeight;
    }

    min() {
        return Size(this.minWidth, this.minHeight);
    }

    max() {
        return Size(this.maxWidth, this.maxHeight);
    }

    constrain(size) {
        let width = size.width;
        if (width < this.minWidth) {
            width = this.minWidth;
        }
        if (width > this.maxWidth) {
            width = this.maxWidth;
        }
        let height = size.height;
        if (height < this.minHeight) {
            height = this.minHeight;
        }
        if (width > this.maxHeight) {
            width = this.maxHeight;
        }
        return new Size(width, height);
    }

    trimHeigh(height) {
        let minHeight = this.minHeight - height;
        if (minHeight < 0) {
            minHeight = 0;
        }
        let maxHeight = this.maxHeight - height;
        if (maxHeight < minHeight) {
            maxHeight = minHeight;
        }
        return new BoxConstraints(this.minWidth, this.maxWidth, minHeight, maxHeight);
    }
}

class Window {
    constructor(requestFrameCallback) {
        this.requestFrameCallback = requestFrameCallback;
    }

    requestFrame() {
        this.requestFrameCallback();
    }
}

class RenderBox {
    constructor() {
        this.offset = new Offset(0, 0);
        this.size = new Size(0, 0);
        this.needsLayout = true;
        this.parent = null;
    }

    markNeedsLayout() {
        if (this.needsLayout) {
            return;
        }
        this.needsLayout = true;
        if (this.parent == null) {
            return;
        }
        this.parent.markNeedsLayout();
    }

    performLayout(constraints) {
        if (!this.needsLayout) {
            return;
        }
        this.needsLayout = false;
        this.layout(constraints);
    }

    layout(constraints) {
        this.size = constraints.min();
    }

    paint(sk, canvas, offset) {
    }
}

class RenderSingleChildBox extends RenderBox {
    constructor(child) {
        super();
        this.setChild(child);
    }

    setChild(child) {
        this.child = child;
        this.child.parent = this;
        this.markNeedsLayout();
    }
}

class RenderRoot extends RenderSingleChildBox {
    constructor(window, child) {
        super(child);
        this.window = window;
        this.setDevicePixelRatio(1.0);
    }

    markNeedsLayout() {
        if (!this.needsLayout) {
            this.window.requestFrame();
        }
        super.markNeedsLayout();
    }

    setDevicePixelRatio(devicePixelRatio) {
        this.devicePixelRatio = devicePixelRatio;
    }

    layout(constraints) {
        this.child.performLayout(constraints);
        this.child.offset = new Offset(0, 0);
        this.size = this.child.size;
    }

    paint(sk, canvas, offset) {
        canvas.save();
        canvas.scale(this.devicePixelRatio, this.devicePixelRatio);
        this.child.paint(sk, canvas, offset);
        canvas.restore();
    }
}

class RenderSizedBox extends RenderBox {
    constructor(preferredSize) {
        super();
        this.setPreferredSize(preferredSize);
    }

    setPreferredSize(preferredSize) {
        if (this.preferredSize != null && this.preferredSize.equals(preferredSize)) {
            return;
        }
        this.preferredSize = preferredSize;
        this.markNeedsLayout();
    }

    setColor(color) {
        this.color = color;
    }

    layout(constraints) {
        console.log('RenderSizedBox');
        this.size = constraints.constrain(this.preferredSize);
    }

    paint(sk, canvas, offset) {
        let paint = new sk.Paint();
        paint.setColor(this.color);
        paint.setAntiAlias(true);
        let rect = sk.LTRBRect(offset.dx, offset.dy,
            offset.dx + this.size.width, offset.dy + this.size.height);
        canvas.drawRect(rect, paint);
    }
}

class RenderTopAndBottom extends RenderBox {
    constructor(top, bottom) {
        super();
        this.setTop(top);
        this.setBottom(bottom);
    }

    setTop(top) {
        this.top = top;
        this.top.parent = this;
        this.markNeedsLayout();
    }

    setBottom(bottom) {
        this.bottom = bottom;
        this.bottom.parent = this;
        this.markNeedsLayout();
    }

    layout(constraints) {
        this.top.performLayout(constraints);
        this.top.offset = new Offset(0, 0);

        let bottomConstraints = constraints.trimHeigh(this.top.size.height);
        this.bottom.performLayout(bottomConstraints);
        this.bottom.offset = new Offset(0, this.top.size.height);
    }

    paint(sk, canvas, offset) {
        this.top.paint(sk, canvas, offset);
        this.bottom.paint(sk, canvas, offset.add(this.bottom.offset));
    }
}
