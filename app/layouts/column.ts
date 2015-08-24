
import { Style, D3Selection } from './../core/interfaces'
import { Layout } from './../core/layout'
import { Scale } from './../core/scale'
import { DataLabel } from './../decorators/dataLabels'
import { column as defaults } from './../core/defaults'
import * as _ from 'lodash'

type Box = {x:number, y:number, height:number, width:number, fill:string, style:Style, remove?:boolean, value:any, key:any }

export class Column extends Layout {
	
	constructor(
		
		keyScale:Scale, 
		keyProperty:string, 
		valueScale:Scale, 
		valueProperty:string, 
		colorScale?:Scale, 
		isVertical?:boolean,
		dataLabels?:DataLabel) {
		
		super(keyScale, keyProperty, valueScale, valueProperty, colorScale, isVertical)
		this.dataLabels = dataLabels
	}
	
	private _columnStyle:Style = {}
	private _columnSize;
	public padding:[number,number] = [0,0]
	public rowColor = undefined

	set columnStyle(val:Style) { this._columnStyle = val; }
	get columnStyle():Style { return <Style>_.defaults(this._columnStyle, defaults.columnStyle) }
	
	get dataLabels():DataLabel { return this._dataLabels }
	set dataLabels(val:DataLabel) { this._dataLabels = val }
     
	private selector = 'wk-chart-column'
	
	private _dataMapped:Box[]
	private elemMap:{[key:string]:D3Selection} = {}
	private leftTopPadding = this.keyScale.getRangeBand() * this.padding[0]
	private rightBottomPadding = this.keyScale.getRangeBand() * this.padding[1]
	private _columns
	
	private mapData(idx: number, v, insert?:boolean, remove?:boolean):Box {
		if (this.isVertical) {
			return {
					y: this.mapKeyIdx(idx) + this.keyScale.getRangeBand() * (insert || remove ? 0 : this.padding[0]),
					x: this.val(v) < 0 ? this.valFn(v) : this.valFnZero(),
					height: insert || remove ? 0 : this.keyScale.getRangeBand() * (1 - this.padding[0] - this.padding[1]),
					width: Math.abs(this.valFn(v) - this.valFnZero()),
					fill: this.rowColor || this.colorFn(v),
					style:this.columnStyle,
					remove: remove, 
					value:this.val(v),
					key: this.key(v)
				}
			
		} else {
			return {
					x: this.mapKeyIdx(idx) + this.keyScale.getRangeBand() * (insert || remove ? 0 : this.padding[0]),
					y: this.val(v) < 0 ? this.valFnZero() : this.valFn(v),
					width: insert || remove ? 0 : this.keyScale.getRangeBand() * (1 - this.padding[0] - this.padding[1]),
					height: Math.abs(this.valFnZero() - this.valFn(v)),
					fill: this.rowColor || this.colorFn(v),
					style:this.columnStyle,
					remove: remove,
					value:this.val(v),
					key: this.key(v)
				}
		}
	}
	
	
	set data(val:any[]) {
		this._dataMapped = val.map((d, i:number):Box => { return this.mapData(i, d) })
	}
	
	protected insertPointAtIdx(idx: number, val:any) {
		if (idx < 0) this._dataMapped.unshift(this.mapData(idx, val, true))
		else if (idx + 1 > this._dataMapped.length) this._dataMapped.push(this.mapData(idx + 1, val, true))
		else this._dataMapped.splice(idx + 1, 0 ,this.mapData(idx + 1, val, false, true))
	}
	
	protected removePointAtIdx(idx:number, val:any) {
		this.insertPointAtIdx(idx, val)
	}	
	
	protected draw(transition:boolean) {
		this._columns = this._layoutG.selectAll('.wk-chart-column-bar').data(this._dataMapped, function(d:Box, i) { return i })
		this._columns.enter().append('rect').attr('class','wk-chart-column-bar')
		var cs = transition ? this._columns.transition().duration(this._duration).each('end', function(d:Box) { if (d.remove) d3.select(this).remove()}) : this._columns
		cs
			.attr('x', function(d:Box):number { return d.x })
			.attr('y', function(d:Box):number { return d.y })
			.attr('width', function(d:Box):number { return d.width })
			.attr('height', function(d:Box):number { return d.height })
			.style('fill', function(d:Box):string { return d.fill })
			.style( function(d:Box):Style { return d.style } )
			
		if (this._dataLabels) {
			this._dataLabels.draw(this._dataMapped, transition, this._duration, this.isVertical)
		}
	} 
}