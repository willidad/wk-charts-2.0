import { IGenerator } from './../core/interfaces'
import { Layout } from './../baseLayouts/layout'
import { Point, Points} from './interpolators/interpolator'
import { column as defaults } from './../core/defaults'

type Box = {x:number, y:number, height:number, width:number, fill:string, style:Style, remove?:boolean }
type d3Selection = d3.Selection<any>
type Style = { [key:string]: string }

export class Column extends Layout implements IGenerator{
	
	private _columnStyle:Style = {}
	private _columnSize;
	public padding:[number,number] = [0,0]
	public rowColor = undefined

	set columnStyle(val:Style) { this._columnStyle = val; }
	get columnStyle():Style { return <Style>_.defaults(this._columnStyle, defaults.columnStyle) }
     
	private selector = 'wk-chart-column'
	
	private _dataMapped:Box[]
	private elemMap:{[key:string]:d3Selection} = {}
	private leftTopPadding = this.keyScale.getRangeBand() * this.padding[0]
	private rightBottomPadding = this.keyScale.getRangeBand() * this.padding[1]
	
	private setAttr(s) {
		s
			.attr('x', function(d:Box):number { return d.x })
			.attr('y', function(d:Box):number { return d.y })
			.attr('width', function(d:Box):number { return d.width })
			.attr('height', function(d:Box):number { return d.height })
			.style('fill', function(d:Box):string { return d.fill })
			.style( function(d:Box):Style { return d.style } )
	}
	
	private createElem(container:d3Selection):d3Selection {
		return container.append('rect').attr('class', this.selector)
	}
	
	private mapData(idx: number, v, insert?:boolean, remove?:boolean):Box {
		if (this.isVertical) {
			return {
					x: this.mapKeyIdx(idx) + this.leftTopPadding,
					y: this.valFn(v) < 0 ? -Math.abs(this.valFnZero() - this.valFn(v)) : this.valFn(v),
					height: insert || remove ? 0 : this.keyScale.getRangeBand(),
					width: Math.abs(this.valFnZero() - this.valFn(v)),
					fill: this.rowColor || this.colorFn(v),
					style:this.columnStyle,
					remove: remove
				}
			
		} else {
			return {
					y: this.mapKeyIdx(idx) + this.leftTopPadding,
					x: this.valFn(v) < 0 ? -Math.abs(this.valFnZero() - this.valFn(v)) : this.valFn(v),
					width: insert || remove ? 0 : this.keyScale.getRangeBand(),
					height: Math.abs(this.valFnZero() - this.valFn(v)),
					fill: this.rowColor || this.colorFn(v),
					style:this.columnStyle,
					remove: remove
				}
		}
	}
	
	set data(data:any[]) {
		this._data = data
		var elem:d3Selection
		for (var i = 0; i < this._data.length; i++) {
			var v = this._data[i]
			elem = this.elemMap[this.key(v)]
			elem.datum( this.mapData(i, v) )
		}
	}
	get data():any[] {
		return this._data
	}
	
	public insertPointAtIdx(idx: number, val:any) {
		var elem:d3Selection = this.createElem(this.layoutG)
		this.elemMap[this.key(val)] = elem;
		elem.datum(this.mapData(val, true))
	}
	
	public removePointAtIdx(idx:number, val:any) {
		this.elemMap[this.key(val)].datum(this.mapData(val, false, true))
	}	
	
	public draw(transition:boolean) {
		for (var key in this.elemMap) {
			if (transition) {
				this.elemMap[key].transition().duration(this._duration)
					.call(this.setAttr)
					.each('end', function(d:Box) { if (d.remove) d3.select(this).remove()})
			} else {
				this.elemMap[key]
					.call(this.setAttr)
			}
		}
	} 
}