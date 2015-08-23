import { Style, D3Selection } from './../core/interfaces'
import { Layout } from './../core/layout'
import { Scale } from './../core/scale'
import { Point, Points, IInterpolator} from './../interpolators/interpolator'
import { Linear} from './../interpolators/lineLinear'
import { Hermite } from './../interpolators/lineHermite'

export class Area extends Layout {
	
	constructor(
		
		keyScale:Scale, 
		keyProperty:string, 
		valueScale:Scale, 
		valueProperty:string, 
		public value0Property?:string,
		colorScale?:Scale, 
		isVertical?:boolean,
		spline?:boolean,
		public dataMarkers?:boolean) {
		
		super(keyScale, keyProperty, valueScale, valueProperty, colorScale, isVertical)
		this.spline = spline
	}
	
	private _interpolatorY: IInterpolator
	private _interpolatorY0: IInterpolator
	private _dataMapped:Points
	private _dataMappedY0:Points
	private _path
	private _spline;boolean
	private _markers
	
	private val0Fn(val?):number  {
		return this.value0Property ? this.valueScale.map(val[this.value0Property]) : this.valueScale.map(0)
	}

	set spline(val:boolean) {
		this._spline = val
		this._interpolatorY = val ? new Hermite(this.isVertical) : new Linear(this.isVertical)
		this._interpolatorY0 = this.val0Fn && val ? new Hermite(this.isVertical) : new Linear(this.isVertical)
	}

	set data(val:any[]) {
		this._dataMapped = val.map((d:any):[number,number] => {
			return this.isVertical ? [this.valFn(d), this.keyFn(d) + this.keyOffset] : [this.keyFn(d) + this.keyOffset, this.valFn(d)]
		})
		if (this.val0Fn) {
			this._dataMappedY0 = val.map((d:any):[number,number] => {
				return this.isVertical ? [this.val0Fn(d), this.keyFn(d) + this.keyOffset] : [this.keyFn(d) + this.keyOffset, this.val0Fn(d)]
			})
		} else {
			// y0 is not specified, use y start and end values
			this._dataMappedY0 = this.isVertical ? 
				[[this.val0Fn(0), this._dataMapped[0][1]], [this.val0Fn(0), this._dataMapped[this._dataMapped.length - 1][1]]] : 
				[[this._dataMapped[0][0],this.val0Fn(0)], [this._dataMapped[this._dataMapped.length - 1][0],this.val0Fn(0)]]
		}
		
		this._interpolatorY.data(this._dataMapped)
		this._interpolatorY0.data(this._dataMappedY0.reverse())
	}
	
	public insertPointAt(key:number) {
		this._interpolatorY.insertAtPoint(this.keyFn(key) + this.keyOffset)
		this._interpolatorY0.insertAtPointReverse(this.keyFn(key) + this.keyOffset)
	}
	
	protected removePointAt(key:any) {
		this.insertPointAt(key)
	}
	
	public insertPointAtIdx(idx: number) {
		this._interpolatorY.insertAtIdx(idx)
		this._interpolatorY0.insertAtIdxReverse(idx)
	}
	
	protected removePointAtIdx(idx:number) {
		this.insertPointAtIdx(idx)
	}
	
	protected draw(transition:boolean) {
		if (!this._path) this._path = this._layoutG.append('path')

		var s = transition ? this._path.transition().duration(this._duration) : this._path
		s.attr('d', `M${this._interpolatorY.path()}L${this._interpolatorY0.path()}Z`)

		if (this.colorScale) {
			this._path.style('fill', this.propertyColor())
		}
		
		if (this.dataMarkers) {
			console.log(this._interpolatorY.getPathPoints().concat(this._interpolatorY0.getPathPoints()))
			this._markers = this._layoutG.selectAll('.wk-chart-markers').data(this._interpolatorY.getPathPoints().concat(this._interpolatorY0.getPathPoints()), function(d,i) { return i })
			this._markers.enter().append('circle').attr('class', 'wk-chart-markers')
			var m = transition ? this._markers.transition().duration(this._duration).each('end', function(d) { if (d[2]) d3.select(this).remove()}) : this._markers
			m
				.attr('cx', function(d:Point) { return d[0] })
				.attr('cy', function(d:Point) { return d[1] })
				.attr('r', 5)
				.style('opacity', function(d:Point) { return d[2] ? 0 : 1})
				.style('fill', this.propertyColor())
			this._markers.exit().remove()
		}
		
	}
}