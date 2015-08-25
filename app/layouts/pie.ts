import { Layout } from './../core/layout'
import { Style } from './../core/interfaces'
import { PieDataLabel } from './../decorators/pieDatalabels'
import { pie as pieDefaults, duration} from './../core/defaults'
import * as d3 from 'd3'
import * as _ from 'lodash'

type Arc = {key:any, val:number, value:any, insert:boolean, remove:boolean}

export class Pie extends Layout {
	
	private _pieStyle:Style = {};
	private _dataLabelStyle:Style = {};
	private _labelBgStyle:Style = {};
	protected radius:number;
	protected innerRadius:number = 0
	private _dataMapped:any[] = []
	
	set pieStyle(val:Style) { this._pieStyle = val; }
	get pieStyle():Style { return <Style>_.defaults(this._pieStyle, pieDefaults.pieStyle)}
	
	get dataLabels():PieDataLabel { return this._pieDatalabels }
	set dataLabels(val:PieDataLabel) { this._pieDatalabels = val }

	
	set data(val:any[]) {
		this._dataMapped = val.map((d):Arc => { return {key: this.key(d), val:Math.abs(this.val(d)), value:this.val(d), insert:false, remove:false} })
	}
	
	protected insertPointAt(key:any) {
		throw 'linear key scale not supported for PIE layout'
	}
	
	protected removePointAt(key:any) {
		throw 'linear key scale not supported for PIE layout'
	}
	
	protected insertPointAtIdx(idx: number, v:any) {
		if (idx < 0) this._dataMapped.unshift({key: this.key(v), val:0, value:this.val(v), insert:true, remove:false})
		else if (idx >= this._dataMapped.length) this._dataMapped.push({key: this.key(v), val:0, value:this.val(v), insert:true, remove:false})
		else this._dataMapped.splice(idx + 1 ,0,{key: this.key(v), val:0, value:this.val(v), insert:true, remove:false})
	}
	
	protected removePointAtIdx(idx:number, v:any) {
		if (idx < 0) this._dataMapped.unshift({key: this.key(v), val:0, value:this.val(v), insert:false, remove:true})
		else if (idx >= this._dataMapped.length) this._dataMapped.push({key: this.key(v), val:0, value:this.val(v), insert:false, remove:true})
		else this._dataMapped.splice(idx + 1 ,0,{key: this.key(v), val:0, value:this.val(v), insert:false, remove:true})
	}
	
	protected draw(container, transition:boolean) {
		
		this.radius = Math.min(this._drawingAreaSize.width, this._drawingAreaSize.height) / 2 * (this.dataLabels ? 0.85 : 1)
		var arc:any = d3.svg.arc().outerRadius(this.radius).innerRadius(this.innerRadius)
		var labelArc = d3.svg.arc().outerRadius(this.radius * 1.1).innerRadius(this.radius * 1.1)
		var pie = d3.layout.pie()
			.value(function(d) { return d.val })
			.sort(null)
		
		function arcTween(a) {
		  	var i = d3.interpolate(this._current, a);
		  	this._current = i(0);
		  	return function(t) {
		    	return arc(i(t));
		  };
		}
		
		function removeDeleted(d) {
			if (d.data.remove) {
				d3.select(<any>this).remove()  //this gets called from d3 with its context ('this'). Type checker gets confused without forced type
			}
		}
		
		var segments = pie(this._dataMapped)
		var path = container.selectAll('.wk-chart-pie-segment')
			.data(segments, (d) => d.data.key) 
		
		path.enter().append('path').attr('class', 'wk-chart-pie-segment')
			.each(function(d) { this._current = d; })
			
		if (transition) {
			path.transition().duration(duration)
				.attrTween('d', arcTween)
				.each('end', removeDeleted)	
		} else {
			path.attr('d', arc)
		}
		
		path
			.attr('fill', (d) => this.mapColor(d.data.key))
			.style(this.pieStyle)
		
		path.exit().remove()
		
		container.attr('transform', `translate(${this._drawingAreaSize.width / 2}, ${this._drawingAreaSize.height / 2})`)
		
		if (this._pieDatalabels) {
			this._pieDatalabels.draw(container, segments, this.radius, transition, this._duration)
		}
	
	}
	
}