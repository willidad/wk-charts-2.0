

import { Point, Points} from './interpolators/interpolator'
import { Linear} from './interpolators/lineLinear'
import { Hermite } from './interpolators/lineHermite'

export type Accessor = (v:any) => number

export class Generator {
	
	protected _spline = false;
	protected _interpolatorY: Hermite | Linear
	protected _data:any[] = []
	protected _dataMapped:[number, number][]
	
	constructor(spline:boolean = false, protected key?:Accessor, protected val?:Accessor, protected isVertical:boolean = false) {	
		this.spline = spline
	}
	
	public keyOffset:number = 0
	
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
	
	public insertPointAt(x:number) {
		//override
	}
	
	public insertPointsAtIdx(idx: number, nbr:number) {
		//override
	}
}