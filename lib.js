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

    subtract(other) {
        return new Offset(this.dx - other.dx, this.dy - other.dy);
    }
}

class ClickEvent {

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
        this.minWidth = minWidth;
        this.maxWidth = maxWidth;
        this.minHeight = minHeight;
        this.maxHeight = maxHeight;
    }

    min() {
        return new Size(this.minWidth, this.minHeight);
    }

    max() {
        return new Size(this.maxWidth, this.maxHeight);
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
        if (height > this.maxHeight) {
            height = this.maxHeight;
        }
        return new Size(width, height);
    }

    with(minWidth, maxWidth, minHeight, maxHeight) {
        return new BoxConstraints(
            minWidth != null ? minWidth : this.minWidth,
            maxWidth != null ? maxWidth : this.maxWidth,
            minHeight != null ? minHeight : this.minHeight,
            maxHeight != null ? maxHeight : this.maxHeight,
        );
    }

    trimHeight(height) {
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

    equals(other) {
        return this.minWidth == other.minWidth
            && this.maxWidth == other.maxWidth
            && this.minHeight == other.minHeight
            && this.maxHeight == other.maxHeight;
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
        this.constraints = new BoxConstraints(0, 0, 0, 0);
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
        if (!this.needsLayout && this.constraints.equals(constraints)) {
            return;
        }
        this.needsLayout = false;
        this.layout(constraints);
        this.constraints = constraints;
    }

    layout(constraints) {
        this.size = constraints.min();
    }

    hitTest(offset) {
        if (this.hitTestSelf(offset)) {
            return this;
        }
        return null;
    }

    hitTestSelf(offset) {
        return false;
    }

    handleEvent(event) {
        return false;
    }

    paint(sk, canvas, offset) {
    }
}

class RenderSingleChildBox extends RenderBox {
    constructor(child) {
        super();
        this.setChild(child);
    }

    hitTest(offset) {
        let hit = this.child.hitTest(offset);
        if (hit != null) {
            return hit;
        }
        super.hitTest(offset);
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

        let paint = new sk.Paint();
        paint.setColor(sk.Color4f(1, 0, 0, 1));
        paint.setStyle(sk.PaintStyle.Stroke);
        paint.setStrokeWidth(2);
        paint.setAntiAlias(true);
        let rect = sk.LTRBRect(offset.dx, offset.dy,
            offset.dx + this.size.width, offset.dy + this.size.height);
        canvas.drawRect(rect, paint);

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
        this.size = constraints.constrain(this.preferredSize);
    }

    hitTestSelf(offset) {
        return offset.dx >= 0 && offset.dx < this.size.width &&
            offset.dy >= 0 && offset.dy < this.size.height;
    }

    handleEvent(event) {
        let size = new Size(this.size.width, this.size.height + 10);
        this.setPreferredSize(size)
        return true;
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

    hitTest(offset) {
        let adjusted = offset.subtract(this.bottom.offset);
        let hit = this.bottom.hitTest(adjusted);
        if (hit != null) {
            return hit;
        }
        hit = this.top.hitTest(offset);
        if (hit != null) {
            return hit;
        }
        super.hitTest(offset);
    }

    layout(constraints) {
        let topConstraints = constraints.with(null, null, 0, null);
        this.top.performLayout(topConstraints);
        this.top.offset = new Offset(0, 0);

        let bottomConstraints = constraints.trimHeight(this.top.size.height);
        this.bottom.performLayout(bottomConstraints);
        this.bottom.offset = new Offset(0, this.top.size.height);

        let width = Math.max(this.top.size.width, this.bottom.size.width);
        this.size = new Size(width, this.top.size.height + this.bottom.size.height);
    }

    paint(sk, canvas, offset) {
        this.top.paint(sk, canvas, offset);
        this.bottom.paint(sk, canvas, offset.add(this.bottom.offset));
    }
}
