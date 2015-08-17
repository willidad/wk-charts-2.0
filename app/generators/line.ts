import { Linear} from './interpolators/lineLinear'
import { Hermite } from './interpolators/lineHermite'
import { Generator } from './generator'

type Accessor = (v:any) => number

export class Line extends Generator{
	
	set spline(val:boolean) {
		this._spline = val
		this._interpolatorY = val ? new Hermite() : new Linear()
	}
	
	set data(val:any[]) {
		this._data = val
		//if (val.length > 1) {
			this._dataMapped = this._data.map((d:any):[number,number] => {
				return [this._x(d), this._y(d)]
			})
			
		this._interpolatorY.data(this._dataMapped)
		//} else {
		//	throw 'Line must have at least two data points'
		//}
	}
	
	get path():string {
		return 'M' + this._interpolatorY.path()
	}
	
	public XInsertPointAt(x:number) {
		this._interpolatorY.insertAtPoint(x)
	}
	
	public XInsertPointsAtIdx(idx: number, nbr:number) {
		this._interpolatorY.insertAtIdx(idx, nbr)
	}
}