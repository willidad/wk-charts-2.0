import * as s from './segment'
import * as bezier from './../helpers/bezierFunctions'

export class Linear implements s.Segment {
	
	constructor(public p1:s.Point, public p2:s.Point) {}
	
	public contains(p:number, direction:s.Direction):boolean {
		return this.p1[direction] < this.p2[direction] ? this.p1[direction] <= p && p <= this.p2[direction] : this.p2[direction] <= p && p <= this.p1[direction]
	}
	
	public splitAt(pos:number, direction:s.Direction):[Linear, Linear] {
		var other = direction === s.Direction.x ? s.Direction.y : s.Direction.x
		var tan = (this.p1[other]- this.p2[other]) / (this.p1[direction - this.p2[direction]])
		var split:s.Point = [0,0]
		split[direction] = pos;
		split[other] = this.p1[other] + (this.p1[other]- this.p2[other]) * tan
		return [new Linear(this.p1, split), new Linear(split,this.p2)]
	}
	
	get path():string {
		return `L${this.p2.join()}`
	}
}