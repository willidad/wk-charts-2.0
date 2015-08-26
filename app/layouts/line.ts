import * as _ from 'lodash'
import { Style, D3Selection, IInterpolator, Point, Points } from './../core/interfaces'
import { Layout } from './../core/layout'
import { Scale } from './../core/scale'
import { DataMarker } from './../decorators/dataMarker'
import { Linear} from './../interpolators/lineLinear'
import { Hermite } from './../interpolators/lineHermite'
import { line as defaults } from './../core/defaults'
import { outerBox } from './../tools/helpers'

export class Line extends Layout {
	
	constructor(
		
		keyScale:Scale, 
		keyProperty:string, 
		valueScale:Scale, 
		valueProperty:string, 
		colorScale?:Scale, 
		isVertical?:boolean,
		spline?:boolean,
		dataMarkers?:DataMarker) {
		
		super(keyScale, keyProperty, valueScale, valueProperty, colorScale, isVertical)
		this.spline = spline
		this.dataMarkers = dataMarkers
	}
	
	private _dataMapped:Points;
	private _path
	private _interpolatorY: IInterpolator
	private _spline:boolean
	private _lineStyle:Style = {}
	
	set lineStyle(val:Style) { this._lineStyle = val; }
	get lineStyle():Style { return <Style>_.defaults(this._lineStyle, defaults.lineStyle) }
	
	set dataMarkers(val:DataMarker) { this._dataMarkers = val}
	get dataMarkers():DataMarker { return this._dataMarkers}
	
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
	
	protected draw(container, transition:boolean) {
		this._path = container.select('.wk-chart-line')
		if (this._path.empty()) this._path = container.append('path').attr('class', 'wk-chart-line')

		var s = transition ? this._path.transition().duration(this._duration) : this._path
		s.attr('d', `M${this._interpolatorY.path()}`)

		if (this.colorScale) {
			this._path.style('stroke', this.rowColor || this.propertyColor()).style('fill','none')
		}
		
		this._path.style(this.lineStyle)
		
		if (this._dataMarkers) {
			this._dataMarkers.draw(container,this._interpolatorY.getPathPoints(),this.propertyColor(), transition, this._duration)
		}
	}
	
	protected getBBox() {
		var bounds = [] 
		bounds.push(this._interpolatorY.getBBox())
		if (this._dataMarkers) {
			var d = this._interpolatorY.getPathPoints()	
			bounds.push(this._dataMarkers.getBBox(d))	
		}
		return outerBox(bounds)
	}
}