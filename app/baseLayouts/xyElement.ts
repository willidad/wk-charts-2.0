import { IMargins } from './../core/interfaces'
import { Style } from './../core/interfaces'
import { Layout } from './layout'
import { Scale } from './../core/scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import {markers as markerDefaults, duration} from './../core/defaults'

export class XYElement extends Layout {
	
	// override functions used to create, update and remove the positioned element. 
	
	protected getSelector():string { return '' }
	protected create(selection:d3.Selection<any>, caller:XYElement) {}
	protected update(selection:d3.Selection<any>, caller:XYElement) {}
	protected remove(selection:d3.Selection<any>, caller:XYElement) {}
	
	//--------------------------------------------------------------------------------
	
	protected offset:number = 0; 
	
	constructor(public valueScale:Scale, public valueProperty:string, public keyScale:Scale, public keyProperty:string, public colorScale?:Scale, public isVertical:boolean = false) {
		super(valueScale, valueProperty, keyScale, keyProperty, colorScale)
	}
	
	
	
	public drawLayout = (container, data, drawingAreaSize?, animate?, cbAnimationEnd?) => {
				
		var items = container.selectAll(this.getSelector()).data(data, (d) => d.key)
		var enter = items.enter().call(this.create, this)
		
		var it = (animate ? items.transition().duration(this._duration) : items)
		var itExit = (animate ? items.exit().transition().duration(duration) : items.exit())
		
		it.call(this.update, this)
		if (this.isVertical) {
			it.attr('transform', (d) => `translate(${d.valPos}, ${d.keyPos + (d.added || d.deleted ? 0 : this.offset)})`)		
		} else {
			it.attr('transform', (d) => `translate(${d.keyPos + (d.added || d.deleted ? 0 : this.offset)}, ${d.valPos})`)
		}
		it.style('opacity',(d) => d.added || d.deleted ? 0 : 1)
		
		items.exit().call(this.remove, this).remove()
	}
}


