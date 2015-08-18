import { Linear} from './interpolators/lineLinear'
import { Hermite } from './interpolators/lineHermite'
import { Generator } from './generator'

export class Line extends Generator {
	
	set spline(val:boolean) {
		this._spline = val
		this._interpolatorY = val ? new Hermite(this.isVertical) : new Linear(this.isVertical)
	}
	
	set data(val:any[]) {
		this._data = val
		this._dataMapped = this._data.map((d:any):[number,number] => {
			return this.isVertical ? [this.val(d), this.key(d) + this.keyOffset] : [this.key(d) + this.keyOffset, this.val(d)]
		})		
		this._interpolatorY.data(this._dataMapped)
	}
	
	get path():string {
		return 'M' + this._interpolatorY.path()
	}
	
	public insertPointAt(key:any) {
		this._interpolatorY.insertAtPoint(this.key(key)  + this.keyOffset)
	}
	
	public insertPointsAtIdx(idx: number, nbr:number) {
		this._interpolatorY.insertAtIdx(idx)
	}
}