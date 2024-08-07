export default class Quadtree {
    boundary: any;
    capacity: number;
    shapes: any[];
    divided: boolean;
    northeast: Quadtree | null;
    northwest: Quadtree | null;
    southeast: Quadtree | null;
    southwest: Quadtree | null;
  
    constructor(boundary: any, capacity: number) {
      this.boundary = boundary;
      this.capacity = capacity;
      this.shapes = [];
      this.divided = false;
      this.northeast = null;
      this.northwest = null;
      this.southeast = null;
      this.southwest = null;
    }
  
    subdivide() {
      const { x, y, w, h } = this.boundary;
      const ne = { x: x + w / 2, y: y - h / 2, w: w / 2, h: h / 2 };
      const nw = { x: x - w / 2, y: y - h / 2, w: w / 2, h: h / 2 };
      const se = { x: x + w / 2, y: y + h / 2, w: w / 2, h: h / 2 };
      const sw = { x: x - w / 2, y: y + h / 2, w: w / 2, h: h / 2 };
  
      this.northeast = new Quadtree(ne, this.capacity);
      this.northwest = new Quadtree(nw, this.capacity);
      this.southeast = new Quadtree(se, this.capacity);
      this.southwest = new Quadtree(sw, this.capacity);
  
      this.divided = true;
    }
  
    insert(shape: any) {
      if(!this.contains(this.boundary, shape)) {
        return false;
      }
 
      if (this.shapes.length < this.capacity) {
        this.shapes.push(shape);
        return true;
      }
  
      if (!this.divided) {
        this.subdivide();
      }

      if (this.northeast!.insert(shape) || this.northwest!.insert(shape) || this.southeast!.insert(shape) || this.southwest!.insert(shape)) {
        return true;
      }

      return false;
    }
  
    contains(boundary: any, shape: any) {
      const { x1, y1, x2, y2 } = shape;
      return (
        x1 >= boundary.x - boundary.w &&
        x1 < boundary.x + boundary.w &&
        y1 >= boundary.y - boundary.h &&
        y1 < boundary.y + boundary.h &&
        x2 >= boundary.x - boundary.w &&
        x2 < boundary.x + boundary.w &&
        y2 >= boundary.y - boundary.h &&
        y2 < boundary.y + boundary.h
      );
    }
  
    query(range: any, found: any[]) {
      if (!this.intersects(range, this.boundary)) {
        return;
      }
  
      for (const shape of this.shapes) {
        if (this.contains(range, shape)) {
          found.push(shape);
        }
      }
  
      if (this.divided) {
        this.northeast!.query(range, found);
        this.northwest!.query(range, found);
        this.southeast!.query(range, found);
        this.southwest!.query(range, found);
      }
    }
  
    intersects(range: any, boundary: any) {
      return !(
        range.x - range.w > boundary.x + boundary.w ||
        range.x + range.w < boundary.x - boundary.w ||
        range.y - range.h > boundary.y + boundary.h ||
        range.y + range.h < boundary.y - boundary.h
      );
    }
  }
  