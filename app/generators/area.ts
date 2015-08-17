import { Linear} from './interpolators/lineLinear'
import { Hermite } from './interpolators/lineHermite'
import { Generator } from './generator'

type Accessor = (v:any) => number

export class Area extends Generator{
	
	constructor(spline:boolean = false, public x:string | Accessor = 'x', public y:string | Accessor = 'y', y0?) {	
		super(spline, x, y)
		if (y0) this.y0 = y0
		this.spline = spline
	}
	
	private _interpolatorY0: Hermite | Linear
	private _dataMappedY0:[number, number][]
	private _y0 = undefined
	
	get y0():string | Accessor {
		return this._y0
	}
	
	set y0(val:string | Accessor) {
		this._y0 = typeof val === 'string' ? function(v:any):number { return v[val]} : val
	}

	set spline(val:boolean) {
		this._spline = val
		this._interpolatorY = val ? new Hermite() : new Linear()
		this._interpolatorY0 = this._y0 && val ? new Hermite() : new Linear()
	}

	set data(val:any[]) {
		this._data = val
		if (val.length > 1) {
			this._dataMapped = this._data.map((d:any):[number,number] => {
				return [this._x(d), this._y(d)]
			})
			if (this._y0) {
				this._dataMappedY0 = this._data.map((d:any):[number,number] => {
					return [this._x(d), this._y0(d)]
				})
			} else {
				// y0 is not specified, use y start and end values
				this._dataMappedY0 = [[this._dataMapped[0][0],0],[this._dataMapped[this._dataMapped.length - 1][0],0]]
			}
			
			this._interpolatorY.data(this._dataMapped)
			this._interpolatorY0.data(this._dataMappedY0.reverse())
		} else {
			throw 'Line must have at least two data points'
		}
		
		
	}
	
	get path():string {
		return 'M' + this._interpolatorY.path() + 'L' + this._interpolatorY0.path() + 'Z'
	}
	
	public XInsertPointAt(x:number) {
		this._interpolatorY.insertAtPoint(x)
		this._interpolatorY0.insertAtPointReverse(x)
	}
	
	public XInsertPointsAtIdx(idx: number, nbr:number) {
		this._interpolatorY.insertAtIdx(idx, nbr)
		this._interpolatorY0.insertAtIdxReverse(idx, nbr)
	}
}