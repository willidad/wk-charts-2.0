import { Style, D3Selection, IInterpolator, Points } from './../core/interfaces'
import { Layout } from './../core/layout'
import { Scale } from './../core/scale'
import { Linear} from './../interpolators/lineLinear'
import { Hermite } from './../interpolators/lineHermite'


export class Line extends Layout {
	
	constructor(
		
		keyScale:Scale, 
		keyProperty:string, 
		valueScale:Scale, 
		valueProperty:string, 
		colorScale?:Scale, 
		isVertical?:boolean,
		spline?:boolean) {
		
		super(keyScale, keyProperty, valueScale, valueProperty, colorScale, isVertical)
		this.spline = spline
	}
	
	private _dataMapped:Points;
	private _path:D3Selection
	private _interpolatorY: IInterpolator
	private _spline:boolean
	
	set spline(val:boolean) {
		this._spline = val
		this._interpolatorY = val ? new Hermite(this.isVertical) : new Linear(this.isVertical)
	}
	
	set data(val:any[]) {
		this._dataMapped = val.map((d:any):[number,number] => {
			return this.isVertical ? [this.valFn(d), this.keyFn(d) + this.keyOffset] : [this.keyFn(d) + this.keyOffset, this.valFn(d)]
		})		
		this._interpolatorY.data(this._dataMapped)
	}
	
	protected insertPointAt(key:any) {
		this._interpolatorY.insertAtPoint(this.keyFn(key)  + this.keyOffset)
	}
	
	protected removePointAt(key:any) {
		this.insertPointAt(key)
	}
	
	protected insertPointAtIdx(idx: number) {
		this._interpolatorY.insertAtIdx(idx)
	}
	
	protected removePointAtIdx(idx:number) {
		this.insertPointAtIdx(idx)
	}
	
	protected draw(transition:boolean) {
		if (!this._path) this._path = this._layoutG.append('path')

		var s = transition ? this._path.transition().duration(this._duration) : this._path
		s.attr('d', `M${this._interpolatorY.path()}`)

		if (this.colorScale) {
			this._path.style('stroke', this.propertyColor()).style('fill','none')
		}
		
	}
}