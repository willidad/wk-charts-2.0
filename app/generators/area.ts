import { Linear} from './interpolators/lineLinear'
import { Hermite } from './interpolators/lineHermite'
import { Accessor, Generator } from './generator'

export class Area extends Generator{
	
	constructor(spline:boolean, public key:Accessor, public val:Accessor , public val0?:Accessor) {	
		super(spline, key, val)

		this.spline = spline || false
	}
	
	private _interpolatorY0: Hermite | Linear
	private _dataMappedY0:[number, number][]

	set spline(val:boolean) {
		this._spline = val
		this._interpolatorY = val ? new Hermite() : new Linear()
		this._interpolatorY0 = this.val0 && val ? new Hermite() : new Linear()
	}

	set data(val:any[]) {
		this._data = val
		this._dataMapped = this._data.map((d:any):[number,number] => {
			return [this.key(d), this.val(d)]
		})
		if (this.val0) {
			this._dataMappedY0 = this._data.map((d:any):[number,number] => {
				return [this.key(d), this.val0(d)]
			})
		} else {
			// y0 is not specified, use y start and end values
			this._dataMappedY0 = [[this._dataMapped[0][0],this.val0(0)], [this._dataMapped[this._dataMapped.length - 1][0],this.val0(0)]]
		}
		
		this._interpolatorY.data(this._dataMapped)
		this._interpolatorY0.data(this._dataMappedY0.reverse())
	}
	
	get path():string {
		return 'M' + this._interpolatorY.path() + 'L' + this._interpolatorY0.path() + 'Z'
	}
	
	public XInsertPointAt(key:number) {
		this._interpolatorY.insertAtPoint(this.key(key))
		this._interpolatorY0.insertAtPointReverse(this.key(key))
	}
	
	public XInsertPointsAtIdx(idx: number, nbr:number) {
		this._interpolatorY.insertAtIdx(idx, nbr)
		this._interpolatorY0.insertAtIdxReverse(idx, nbr)
	}
}