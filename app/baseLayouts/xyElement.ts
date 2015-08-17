import { IMargins } from './../core/interfaces'
import { Style, Point } from './../core/interfaces'
import { ElementLayout } from './elementLayout'
import { Scale } from './../core/scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import {markers as markerDefaults, duration} from './../core/defaults'

export class XYElement extends ElementLayout {
	
	// override functions used to create, update and remove the positioned element. 
	
	protected getSelector():string { return '' }
	protected create(selection:d3.Selection<any>, caller:XYElement) {}
	protected update(selection:d3.Selection<any>, caller:XYElement) {}
	protected remove(selection:d3.Selection<any>, caller:XYElement) {}
	
	//--------------------------------------------------------------------------------

	protected offset:number = 0; 
	protected fadeInOut:boolean = false;
	
	constructor(
		public keyScale:Scale, 
		public keyProperty:string, 
		public valueScale:Scale, 
		public valueProperty:string, 
		public colorScale?:Scale, 
		public isVertical:boolean = false) {
		super(keyScale, keyProperty, valueScale, valueProperty, colorScale)
	}
	
	private removeDeleted(d) {
		if (d.deleted) {
			d3.select(<any>this).remove()  //this gets called from d3 with its context ('this'). Type checker gets confused without forced type
		}
	}
	
	private getTranslate (d:Point) {
		if (this.isVertical) {
			return `translate(${d.valPos}, ${d.keyPos + (d.added || d.deleted ? 0 : this.offset)})`
		} else {
			return `translate(${d.keyPos + (d.added || d.deleted ? 0 : this.offset)}, ${d.valPos})`
		}
	}
	
	private doFade(sel, fade) {
		if (fade) sel.style('opacity',(d:Point) => d.added || d.deleted ? 0 : 1)
	}
	
	public drawLayout = (data, drawingAreaSize?, animate?, cbAnimationEnd?) => {
				
		var items = this.layoutG.selectAll(this.getSelector()).data(data, (d:Point) => d.key)
		var enter = items.enter()
			.call(this.create, this)
				
		if (animate) {
			items.transition().duration(this._duration)
				.call(this.update, this)
				.attr('transform', (d:Point) => this.getTranslate(d))
				.call(this.doFade, this.fadeInOut)
				.each('end', this.removeDeleted)
			items.exit().transition().duration(this._duration)
				.call(this.remove, this)
				.remove()		
		} else {
			items
				.call(this.update, this)
				.attr('transform', (d:Point) => this.getTranslate(d))
				.call(this.doFade, this.fadeInOut)
			items.exit()
				.call(this.remove, this)
				.remove()	
		}
	}
}


