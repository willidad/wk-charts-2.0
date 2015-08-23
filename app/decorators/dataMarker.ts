import { IGenerator } from './../core/interfaces'
import { Layout } from './../core/layout'
import { Point, Points} from './../interpolators/interpolator'
import { column as defaults } from './../core/defaults'
import * as _ from 'lodash'
import {markers as markerDefaults} from './../core/defaults'

type Circle = {cx:number, cy:number, fill:string, opacity:number, style:Style, remove?:boolean }
type d3Selection = d3.Selection<any>
type Style = { [key:string]: string }

export class DataMarker extends Layout {
	
	private _markerStyle:Style = {}
	
	set markerStyle(val:Style) { this._markerStyle = val; }
	get markerStyle():Style { return <Style>_.defaults(this._markerStyle, markerDefaults.markerStyle)}
	
	public targetContainer = 'wk-chart-marker-area'
	public needsPadding = false
	
	private selector = 'wk-chart-data-marker' 
	
	private _dataMapped:Circle[]
	private elemMap:{[key:string]:d3Selection} = {}
	
	protected createElem(container:d3Selection, key:string) {
		return this.elemMap[key] = container.append('circle').attr('class', 'wk-chart-data-marker')
			.attr('r', markerDefaults.markerSize)
	}
	
	private setAttr(s) {
		s
			.attr('cx', function(d:Circle):number { return d.cx })
			.attr('cy', function(d:Circle):number { return d.cy })
			.style('fill', function(d:Circle):string { return d.fill })
			.style( function(d:Circle):Style { return d.style } )
			.style('opacity', function(d:Circle):number { return d.opacity })
	}
	
	private mapData(idx: number, v, insert?:boolean, remove?:boolean):Circle {
		if (this.isVertical) {
			return {
					cy: this.keyScale.isOrdinal ? this.mapKeyIdx(idx) + this.keyOffset : this.keyFn(v),
					cx: this.valFn(v),			
					fill: this.colorFn(v),
					opacity: remove || insert ? 0 : 1,
					style:this.markerStyle,
					remove: remove
				}
		} else {
			return {
					cx: this.keyScale.isOrdinal ? this.mapKeyIdx(idx) + this.keyOffset : this.keyFn(v),
					cy: this.valFn(v),			
					fill: this.colorFn(v),
					opacity: remove || insert ? 0 : 1,
					style:this.markerStyle,
					remove: remove
				}
		}
	}
	
	set data(val:any[]) {
		var elem:d3Selection
		for (var i = 0; i < val.length; i++) {
			var v = val[i]
			elem = this.elemMap[this.key(v)] || this.createElem(this._layoutG, this.key(v))
			if (elem) elem.datum( this.mapData(i, v) )
		}
	}
	protected insertPointAtIdx(idx:number, val:any):void {
		var elem:d3Selection = this.createElem(this._layoutG, this.key(val))
		elem.datum(this.mapData(idx, val, true))
	}
	protected insertPointAt(key:any):void {
		var elem:d3Selection = this.createElem(this._layoutG, key)
		elem.datum(this.mapData(0, key, true))
	}
	protected removePointAtIdx(idx:number, val:any):void {
		this.elemMap[this.key(val)].datum(this.mapData(idx, val, false, true))
	}
	protected removePointAt(key:any):void {
		this.elemMap[key].datum(this.mapData(0, key, false, true))
	}
	protected draw(transition:boolean):void {
		for (var key in this.elemMap) {
			if (transition) {
				this.elemMap[key].transition().duration(this._duration)
					.call(this.setAttr)
					.each('end', function(d:Circle) { if (d.remove) d3.select(this).remove()})
			} else {
				this.elemMap[key]
					.call(this.setAttr)
			}
		}
	}
}