import { D3Selection } from './../core/interfaces'
import { Scale } from './../core/scale'
import * as _ from 'lodash'

export class Tooltip {
	
	protected _selector = '.wk-chart-tt-target'
	protected _container:D3Selection
	protected _containerElem:HTMLElement
	protected _ttTargetSelector
	protected _template: D3Selection
	protected _ttMarker: D3Selection
	protected _markerRect: D3Selection
	protected _containerRect
	protected _compiledTemplate
	protected _templateText = `
		<div class="wk-chart-tooltip">
			<table>
				<%if(data.name) {%>
					<thead><tr><th class="wk-chart-tt-name"><%- data.name%> :</th><th class="wk-chart-tt-value"><%- data.value %></th></thead>
				<%}%>
				<tbody>
					<% _.forEach(data.details, function(d) { %>
						<tr><td class="wk-chart-tt-name"><%-d.name%> :</td><td class="wk-chart-tt-value"><%- d.value %></td></tr>
					<%})%> 
				<tbody>
			</table>
		</div > `
	
	constructor(public showElement:boolean, public keyScale?:Scale, public properties?:string[], public isVertical?:boolean, public showBand:boolean = false) {
		this._compiledTemplate = _.template(this._templateText)
		this._ttTargetSelector = this.showElement ? '.wk-chart-tt-target' : '.wk-chart-interaction-layer'
	}
	
	public containerSize
	
	set container(elem: D3Selection) {
		this._container = elem
		this._containerElem = <HTMLElement>elem.node()
	}
	get container(): D3Selection {
		return this._container
	}
	
	public data:any[]
	
	public enable() {
		if (this.container) {
			this.container.selectAll(this._ttTargetSelector)
				.on('mousemove', this.showElement ? this.moveTT : this.moveAndUpdateTT)
				.on('mouseover', this.showElement ? this.showElementTT : this.showGroupTT)
				.on('mouseout', this.hideTT)
				.style('pointer-events', 'all');
		}
	}
	
	public disable() {
		if (this.container) {
			this.container.selectAll(this._ttTargetSelector)
				.on('mousemove', null)     
				.on('mouseover', null)
				.on('mouseout', null)
				.style('pointer-events', 'none')}
	}
	
	private showElementTT = () => {
		var obj:D3Selection = d3.select(d3.event.target)
		this._template = this._container.append('div')
			.style('position', 'absolute').style('pointer-events', 'none')
		var data = d3.select(d3.event.target).datum()
		this.formatSingleData(this.keyScale.properties[0], this.properties[0], data.data)
	}
	
	private showGroupTT = () => {
		var obj:D3Selection = d3.select(d3.event.target)
		this._template = this._container.append('div')
			.style('position', 'absolute').style('pointer-events', 'none')
		this.moveBox(d3.mouse(this._containerElem))
		// create orientation line and markers
		var markerContainer = this.container.select(this.showBand ? '.wk-chart-grid-area' : '.wk-chart-interaction-area') //show line above chart, markerarea behind
		
		this._ttMarker = markerContainer.append('g').attr('class', 'wk-chart-tt-marker')
		this._markerRect = this._ttMarker.append('rect').style({ stroke: 'black', fill: 'lightGrey', 'stroke-width': 1, 'pointer-events': 'none', opacity: 0.3 })
		var markerSize = this.showBand && this.keyScale.getRangeBand() ? this.keyScale.getRangeBand() : 1
		if (this.isVertical) {
			this._markerRect.attr('width', this.containerSize.width).attr('height', markerSize)
		} else {
			this._markerRect.attr('width', markerSize).attr('height', this.containerSize.height)
		}
	}
	
	private hideTT = () => {
		this._template.remove()
		if (this._ttMarker) this._ttMarker.remove()
	}
	
	private moveTT = () => {
		this.moveBox(d3.mouse(this._containerElem))
	}
	
	private moveAndUpdateTT = () => {
		var markerPos, nextKeyPos
		var mappedKey = d3.mouse(this.container.select('.wk-chart-interaction-layer').node())[this.isVertical ? 1 : 0]
		var dataIdx = this.keyScale.invert(mappedKey)
		if (dataIdx >=  0 && dataIdx < this.data.length) {
			var data = this.data[dataIdx]
			var key = data[this.keyScale.properties[0]]
			this.formatDataList(this.keyScale.properties[0], this.properties, data)
			this.moveBox(d3.mouse(this._containerElem))
			var keyPos = this.keyScale.map(key)
			if (this.keyScale.isOrdinal) {
				markerPos = this.keyScale.map(key) + (this.showBand ? 0 : this.keyScale.getRangeBand() / 2)                
			} else {
				markerPos = keyPos
			}
			 
			this._ttMarker.attr('transform', `translate(${this.isVertical ? 0 : markerPos}, ${this.isVertical ? markerPos : 0})`)
		}	
	}
	
	private moveBox(pos: [number, number]) {
		var x = pos[0] + 10 // ensure cursor does no cover toolip text
		var y = pos[1] + 10
		var boxSize = (<HTMLElement>this._template.node()).getBoundingClientRect()
		var containerBoxSize = (<HTMLElement>this.container.node()).getBoundingClientRect()
		// Ensure box does not move outside the current body area
		if (x + boxSize.width >= containerBoxSize.right) {
			x = (x - boxSize.width) > 0 ? x - boxSize.width : 0
		}
		if (y + boxSize.height > containerBoxSize.bottom) {
			y = (y - boxSize.height) > 0 ? y - boxSize.height : 0
		} 
		this._template.style('left',x).style('top', y) 
	}
	
	private formatDataList(keyProperty: string, properties:string[],data:any) {
		var ttData = { name: keyProperty, value: data[keyProperty], details: [] }
		for (var p of properties) {
			ttData.details.push({name:p, value:data[p]})
		}
		var html = this._compiledTemplate({ data: ttData })
		this._template.html(html)
	}
	
	private formatSingleData(keyProperty:string, valueProperty:string, data:any) {
		var ttData = { details: [{name:keyProperty, value:data.key}, {name:valueProperty, value:data.value}] }
		var html = this._compiledTemplate({ data: ttData })
		this._template.html(html)
	}

}