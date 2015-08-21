

import { Point, Points, IInterpolator} from './interpolators/interpolator'
import { Linear} from './interpolators/lineLinear'
import { Hermite } from './interpolators/lineHermite'

export type Accessor = (v:any) => number

export class Generator {
	
	protected _spline = false;
	protected _interpolatorY: IInterpolator
	protected _data:any[] = []
	
	constructor(spline:boolean = false, protected key?:Accessor, protected val?:Accessor, protected isVertical:boolean = false) {	
		this.spline = spline
	}
	
	public keyOffset:number = 0
	
	get spline():boolean {
		return this._spline
	}
	set spline(val:boolean) {
		console.warn('generator.spline called. should be overridden')
		// override
	}
	
	get data():any[] {
		return this._data
	}
	set data(val:any[]) {
		console.warn('generator.set data called. should be overridden')
		//override
	}
	
	get path():string {
		console.warn('generator.get path called. should be overridden')
		//override
		return
	}
	
	public insertPointAt(x:number, val?:any) {
		console.warn('generator.insertPointAt called. should be overridden')
		//override
	}
	
	public insertPointAtIdx(idx: number, val?:any) {
		console.warn('generator.insertPointAtIdx called. should be overridden')
		//override
	}
}