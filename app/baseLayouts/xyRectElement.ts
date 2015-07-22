import { IMargins } from './../core/interfaces'
import { Style } from './../core/interfaces'
import { Layout } from './layout'
import { Scale } from './../core/scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as drawing from './../tools/drawing'
import {markers as markerDefaults, duration} from './../core/defaults'

export class XYRectElement extends Layout {
	
	// override functions used to create, update and remove the positioned element. 
	
	protected getSelector():string { return '' }
	protected create(selection:d3.Selection<any>, caller:XYRectElement) {}
	protected update(selection:d3.Selection<any>, caller:XYRectElement) {}
	protected remove(selection:d3.Selection<any>, caller:XYRectElement) {}
	
	//--------------------------------------------------------------------------------
	
	protected offset:number = 0; 
	
	constructor(public valueScale:Scale, public valueProperty:string, public keyScale:Scale, public keyProperty:string, public colorScale?:Scale, public isVertical:boolean = false) {
		super(valueScale, valueProperty, keyScale, keyProperty, colorScale)
	}
	
	public getPadding = (container, data, drawingAreaSize):IMargins => {
		var padding:IMargins = {top:0, bottom:0, left:0, right:0}
		this.keyScale.setDomain(data)
		this.keyScale.setRange(this.isVertical ? [drawingAreaSize.height, 0] : [0, drawingAreaSize.width])
		this.valueScale.setDomain(data)
		this.valueScale.setRange(this.isVertical ? [0, drawingAreaSize.width] : [drawingAreaSize.height, 0])
		
		var l = container.select(`.wk-layout-${this._id}`)
		if (l.empty()) {
			l = container.append('g').attr('class', `wk-layout-${this._id}` )
		}
		
		this.beforeDraw(l, data, drawingAreaSize)
		this.drawLayout(l, data, drawingAreaSize)

		// measure the size of the label container
		var box = container.node().getBBox()
		// determine the additional space requirements
		padding.left = box.x < 0 ? Math.abs(box.x) : 0
		padding.top = box.y < 0 ? Math.abs(box.y) : 0
		padding.bottom = box.y + box.height > drawingAreaSize.height ? Math.abs(drawingAreaSize.height - box.y - box.height) : 0
		padding.right = box.x + box.width > drawingAreaSize.width ? Math.abs(drawingAreaSize.width - box.x - box.width) : 0
		return padding
	}
	
	public drawLayout = (container, data, drawingAreaSize?, animate?) => {
				
		var items = container.selectAll(this.getSelector()).data(data, (d) => d.key)
		var enter = items.enter().call(this.create, this)
		
		var it = (animate ? items.transition().duration(this._duration) : items)
		var itExit = (animate ? items.exit().transition().duration(duration) : items.exit())
		
		it.call(this.update, this)
		if (this.isVertical) {
			it.attr('transform', (d,i) => `translate(${d.valPos}, ${d.keyPos})`)		
		} else {
			it.attr('transform', (d,i) => `translate(${d.keyPos}, ${d.valPos})`)
		}
		
		items.exit().call(this.remove, this).remove()
	}
}


