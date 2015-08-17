type Accessor = (v:any) => number

import { Point, Points} from './interpolators/interpolator'
import { Linear} from './interpolators/lineLinear'
import { Hermite } from './interpolators/lineHermite'

export class Generator {
	
	protected _spline = false;
	protected _interpolatorY: Hermite | Linear
	protected _data:any[] = []
	protected _dataMapped:[number, number][]

	protected _x = undefined
	protected _y = undefined
	
	constructor(spline:boolean = false, public x:string | Accessor = 'x', public y:string | Accessor = 'y') {	
		this._x = typeof x === 'string' ? function(val:any):number { return val[this.x]} : x
		this._y = typeof y === 'string' ? function(val:any):number { return val[this.y]} : y
		this.spline = spline
	}
	
	get spline():boolean {
		return this._spline
	}
	set spline(val:boolean) {
		// override
	}
	
	get data():any[] {
		return this._data
	}
	set data(val:any[]) {
		//override
	}
	
	get path():string {
		//override
		return
	}
	
	public XInsertPointAt(x:number) {
		//override
	}
	
	public XInsertPointsAtIdx(idx: number, nbr:number) {
		//override
	}
	
	public insertPointsAt(idx: number, points:Point[]) {
		
	}
}