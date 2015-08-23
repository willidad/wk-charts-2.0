import { Style, D3Selection, IInterpolator, Point, Points } from './../core/interfaces'
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
		spline?:boolean,
		public dataMarkers?:boolean) {
		
		super(keyScale, keyProperty, valueScale, valueProperty, colorScale, isVertical)
		this.spline = spline
	}
	
	private _dataMapped:Points;
	private _path
	private _interpolatorY: IInterpolator
	private _spline:boolean
	private _markers
	
	set spline(val:boolean) {
		this._spline = val
		this._interpolatorY = val ? new Hermite(this.isVertical) : new Linear(this.isVertical)
	}
	
	set data(val:any[]) {
		this._dataMapped = val.map((d:any):Point => {
			return this.isVertical ? [this.valFn(d), this.keyFn(d) + this.keyOffset, false] : [this.keyFn(d) + this.keyOffset, this.valFn(d), false]
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
	
	private cleanup() {
		
	}
	
	protected draw(transition:boolean) {
		if (!this._path) this._path = this._layoutG.append('path')

		var s = transition ? this._path.transition().duration(this._duration) : this._path
		s.attr('d', `M${this._interpolatorY.path()}`)

		if (this.colorScale) {
			this._path.style('stroke', this.propertyColor()).style('fill','none')
		}
		
		if (this.dataMarkers) {
			console.log(this._interpolatorY.getPathPoints())
			this._markers = this._layoutG.selectAll('.wk-chart-markers').data(this._interpolatorY.getPathPoints(), function(d,i) { return i })
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