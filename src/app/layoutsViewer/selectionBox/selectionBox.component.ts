import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'selection-box',
    templateUrl: './selectionBox.html',
})
export class SelectionBoxComponent implements OnInit {

    @Input() width: string;
    @Input() height: string;
    @Output() pointerdown: EventEmitter<any> = new EventEmitter();
    @Output() pointermove: EventEmitter<any> = new EventEmitter();

    public box = {
        move: false,
        draw: false,
        moveLine: false,
        moveVertex: false,
        selectedLine: 0,
        selectedVertex: 0,
        l: -1,
        t: -1,
        r: -1,
        b: -1,

        moveStartMouseX: 0,
        moveStartMouseY: 0,

        isVisible: false,
        ignoreInfoMove: false,

        // values to show in info box
        left:0,
        right:0,
        top: 0,
        bottom: 0,
        width: 0,
        height: 0,
    };

    public meta = {
        lastAction: null,

    };

    constructor(private _route: ActivatedRoute) {}

    public ngOnInit() {}

    // public showBox() {
    //     this.box.isVisible = true;
    // }
    //
    // public hideBox() {
    //
    //     this.box.isVisible = false;
    //     this.box.l = -1;
    //     this.box.r = -1;
    //     this.box.t = -1;
    //     this.box.b = -1;
    //
    // }

    public getBox() {
        return this.box;
    }

    // ---------- box -----------------
    public refreshBoxData() {
        this.box.width = Math.abs(this.box.l - this.box.r);
        this.box.height = Math.abs(this.box.t - this.box.b);

        if (this.box.l < this.box.r) {
            this.box.left = this.box.l;
            this.box.right = this.box.r;
        } else {
            this.box.left = this.box.r;
            this.box.right = this.box.l;
        }

        if (this.box.t < this.box.b) {
            this.box.bottom = this.box.b;
            this.box.top = this.box.t;
        } else {
            this.box.bottom = this.box.t;
            this.box.top = this.box.b;
        }
    }

    public boxVertices() {
        let l = this.box.l;
        let r = this.box.r;
        let t = this.box.t;
        let b = this.box.b;

        return [
            {x: l, y: t}, {x: r, y: t}, {x: r, y: b}, {x: l, y: b}
        ];
    }

    public boxVerticesSvg() {
        let s = '';
        for (let v of this.boxVertices()) {
            s += v.x + ',' + v.y + ' ';
        }
        return s;
    }

    public svgMouseMove(event: any) {

        if (this.box.move) { this.moveBox(event); }
        if (this.box.draw) { this.boxDraw(event); }
        if (this.box.moveLine) { this.boxMoveLine(event); }
        if (this.box.moveVertex) { this.boxMoveVertex(event); }
        this.pointermove.emit(event);
    }

    public svgMouseMoveUp(event: any) {
        if (this.box.draw) { this.boxDrawStop(event); }
        if (this.box.moveLine) { this.boxMoveLineStop(event); }
    }

    public arrowsManipulate(x, y) {

        if (this.meta.lastAction === 'moveBox') {

            this.arrowsBoxMove(x, y);
        }

        if (this.meta.lastAction === 'moveLine') {

            this.arrowsBoxEdgeMove(x, y);
        }

        if (this.meta.lastAction === 'moveVertex') {

            this.arrowsBoxVertexMove(x, y);
        }
    }

    // ------- Box draw -------

    public boxDrawStart(event: any) {

        this.box.isVisible = true;
        this.box.draw = true;
        this.box.l = event.pageX;
        this.box.t = event.pageY;
        this.box.r = event.pageX;
        this.box.b = event.pageY;

        this.pointerdown.emit(event);
    }

    public boxDraw(event) {
        this.box.b = event.pageY;
        this.box.r = event.pageX;
        this.refreshBoxData();
    }

    public boxDrawStop(event) {
        this.box.draw = false;


        if(this.box.l == this.box.r || this.box.t == this.box.b) {
            this.box.l = -1;
            this.box.r = -1;
            this.box.t = -1;
            this.box.b = -1;
            this.box.isVisible = false;
        }

        this.refreshBoxData();
    }

    // --------- Box Move -----------

    public moveBoxStart(event) {
        this.box.move = true;
        this.box.moveStartMouseX = event.pageX - this.box.l;
        this.box.moveStartMouseY = event.pageY - this.box.t;
        this.pointerdown.emit(event);
        event.stopPropagation();
    }

    public moveBoxStop(event) {
        this.box.move = false;
    }

    public moveBox(event) {
        if (this.box.move ) {
            this.meta.lastAction = 'moveBox';
            let oldL = this.box.l;
            let oldT = this.box.t;
            this.box.l = event.pageX - this.box.moveStartMouseX;
            this.box.t = event.pageY - this.box.moveStartMouseY;
            this.box.r += this.box.l - oldL;
            this.box.b += this.box.t - oldT;
            this.refreshBoxData();
        }
    }

    public arrowsBoxMove(shiftX, shiftY) {
        this.box.l += shiftX;
        this.box.t += shiftY;
        this.box.r += shiftX;
        this.box.b += shiftY;
        this.refreshBoxData();
    }

    public boxLineVertices() {
        let result = [];
        let tmp = 0;
        let l = this.box.l;
        let r = this.box.r;
        let t = this.box.t;
        let b = this.box.b;

        if(l<r) {
            l+=1;
        } else {
            r+=1;
        }

        if(t<b) {
            t+=1;
        } else {
            b+=1;
        }

        result.push({ x1: l<r ? l-1:l, y1: t, x2: l<r ? r:r-1, y2: t, });
        result.push({ x1: r, y1: t, x2: r, y2: b, });
        result.push({ x1: l<r ? r:r-1, y1: b, x2: l<r ? l-1:l, y2: b, });
        result.push({ x1: l, y1: b, x2: l, y2: t, });

        return result;
    }

    // -------- move line --------

    public boxMoveLineStart(i, event) {
        this.box.selectedLine = i;
        this.box.moveLine = true;
        event.stopPropagation();
    }

    public boxMoveLine(event) {
        let i = this.box.selectedLine;
        if (this.box.moveLine) {

            this.meta.lastAction = 'moveLine';

            if (i === 0) { // top line
                this.box.t = event.pageY;
            }

            if (i === 1) { // right line
                this.box.r = event.pageX;
            }

            if (i === 2) { // bottom line
                this.box.b = event.pageY;
            }

            if (i === 3) { // left line
                this.box.l = event.pageX;
            }

            this.refreshBoxData();
        }
        event.stopPropagation();
    }

    public boxMoveLineStop(event) {
        this.box.moveLine = false;
    }

    public arrowsBoxEdgeMove(shiftX, shiftY) {
        let i = this.box.selectedLine;
        if (i === 0) { // top line
            this.box.t += shiftY;
        }

        if (i === 1) { // right line
            this.box.r += shiftX;
        }

        if (i === 2) { // bottom line
            this.box.b += shiftY;
        }

        if (i === 3) { // left line
            this.box.l += shiftX;
        }
        this.refreshBoxData();
    }

    // ------ move box vertex ------
    public boxMoveVertexStart(i,event) {
        this.box.selectedVertex = i;
        this.box.moveVertex = true;
        event.stopPropagation();
    }

    public boxMoveVertex(event) {
        let i = this.box.selectedVertex;
        if (this.box.moveVertex) {

            this.meta.lastAction = 'moveVertex';

            if (i === 0) { // top line
                this.box.t = event.pageY;
                this.box.l = event.pageX;
            }

            if (i === 1) { // right line
                this.box.r = event.pageX;
                this.box.t = event.pageY;
            }

            if (i === 2) { // bottom line
                this.box.b = event.pageY;
                this.box.r = event.pageX;
            }

            if (i === 3) { // left line
                this.box.l = event.pageX;
                this.box.b = event.pageY;
            }

            this.refreshBoxData();
        }
        event.stopPropagation();
    }

    public boxMoveVertexStop(i,event) {
        this.box.moveVertex = false;
    }

    public arrowsBoxVertexMove(shiftX, shiftY) {
        let i = this.box.selectedVertex;
        if (i === 0) { // top line
            this.box.t += shiftY;
            this.box.l += shiftX;
        }

        if (i === 1) { // right line
            this.box.r += shiftX;
            this.box.t += shiftY;
        }

        if (i === 2) { // bottom line
            this.box.b += shiftY;
            this.box.r += shiftX;
        }

        if (i === 3) { // left line
            this.box.l += shiftX;
            this.box.b += shiftY;
        }
        this.refreshBoxData();
    }

}
