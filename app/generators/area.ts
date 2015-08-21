import { Point, Points, IInterpolator} from './interpolators/interpolator'
import { Linear} from './interpolators/lineLinear'
import { Hermite } from './interpolators/lineHermite'
import { Accessor, Generator } from './generator'

export class Area extends Generator{
	
	constructor(spline:boolean, public key:Accessor, public val:Accessor , public val0?:Accessor, isVertical?:boolean) {	
		super(spline, key, val, isVertical)

		this.spline = spline || false
	}
	
	private _interpolatorY0: IInterpolator
	private _dataMapped:Points
	private _dataMappedY0:Points

	set spline(val:boolean) {
		this._spline = val
		this._interpolatorY = val ? new Hermite(this.isVertical) : new Linear(this.isVertical)
		this._interpolatorY0 = this.val0 && val ? new Hermite(this.isVertical) : new Linear(this.isVertical)
	}

	set data(val:any[]) {
		this._data = val
		this._dataMapped = this._data.map((d:any):[number,number] => {
			return this.isVertical ? [this.val(d), this.key(d) + this.keyOffset] : [this.key(d) + this.keyOffset, this.val(d)]
		})
		if (this.val0) {
			this._dataMappedY0 = this._data.map((d:any):[number,number] => {
				return this.isVertical ? [this.val0(d), this.key(d) + this.keyOffset] : [this.key(d) + this.keyOffset, this.val0(d)]
			})
		} else {
			// y0 is not specified, use y start and end values
			this._dataMappedY0 = this.isVertical ? 
				[[this.val0(0), this._dataMapped[0][1]], [this.val0(0), this._dataMapped[this._dataMapped.length - 1][1]]] : 
				[[this._dataMapped[0][0],this.val0(0)], [this._dataMapped[this._dataMapped.length - 1][0],this.val0(0)]]
		}
		
		this._interpolatorY.data(this._dataMapped)
		this._interpolatorY0.data(this._dataMappedY0.reverse())
	}
	
	get path():string {
		return 'M' + this._interpolatorY.path() + 'L' + this._interpolatorY0.path() + 'Z'
	}
	
	public insertPointAt(key:number) {
		this._interpolatorY.insertAtPoint(this.key(key) + this.keyOffset)
		this._interpolatorY0.insertAtPointReverse(this.key(key) + this.keyOffset)
	}
	
	public insertPointAtIdx(idx: number) {
		this._interpolatorY.insertAtIdx(idx)
		this._interpolatorY0.insertAtIdxReverse(idx)
	}
}