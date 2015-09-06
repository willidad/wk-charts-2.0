import { D3Selection } from './../core/interfaces'
import { Scale } from './../core/scale'
import * as _ from 'lodash'

export class Tooltip {
	
	protected selector = '.wk-chart-tt-target'
	protected _container:D3Selection
	protected _containerElem:HTMLElement
	protected _containerSize: ClientRect
	protected _ttTargetSelector
	protected template: D3Selection
	protected containerRect
	protected _compiledTemplate
	protected _template = `
		<div class="wk-chart-tooltip">
			<table>
				<tr><th><%- data.name%></th><th><%- data.value %></th>
				<% _.forEach(data.details, function(d) { %>
					<tr><td><%-d.name%></td><td><%- d.value %></td></tr>
					<%})%> 
			</table>
		</div > `
	
	constructor(public showElement:boolean, public keyScale?:Scale, public properties?:string[], public isVertical?:boolean) {
		this._compiledTemplate = _.template(this._template)
		this._ttTargetSelector = this.showElement ? '.wk-chart-tt-target' : '.wk-chart-interaction-layer'
	}
	
	set container(elem: D3Selection) {
		this._container = elem
		this._containerElem = <HTMLElement>elem.node()
		this._containerSize = this._containerElem.getBoundingClientRect()
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
		this.template = this._container.append('div')
			.style('position', 'absolute').style('pointer-events', 'none')
		var data = d3.select(d3.event.target).datum()
		this.formatSingleData(this.keyScale.properties[0], this.properties[0], data.data)
	}
	
	private showGroupTT = () => {
		var obj:D3Selection = d3.select(d3.event.target)
		this.template = this._container.append('div')
			.style('position', 'absolute').style('pointer-events', 'none')
		this.moveBox(d3.mouse(this._containerElem))
	}
	
	private hideTT = () => {
		this.template.remove()
	}
	
	private moveTT = () => {
		this.moveBox(d3.mouse(this._containerElem))
	}
	
	private moveAndUpdateTT = () => {
		var mappedKey = d3.mouse(this.container.select('.wk-chart-interaction-layer').node())[this.isVertical ? 1 : 0]
		var dataIdx = this.keyScale.invert(mappedKey)
		if (dataIdx >=  0 && dataIdx < this.data.length) {
			var data = this.data[dataIdx]
			var key = data[this.keyScale.properties[0]]
			this.formatDataList(this.keyScale.properties[0], this.properties, data)
			this.moveBox(d3.mouse(this._containerElem))
		}	
	}
	
	private moveBox(pos: [number, number]) {
		var x = pos[0] 
		var y = pos[1]
		var boxSize = (<HTMLElement>this.template.node()).getBoundingClientRect()
		var containerBoxSize = (<HTMLElement>this.container.node()).getBoundingClientRect()
		// Ensure box does not move outside the current body area
		if (x + boxSize.width >= containerBoxSize.right) {
			x = (x - boxSize.width) > 0 ? x - boxSize.width : 0
		}
		if (y + boxSize.height > containerBoxSize.bottom) {
			y = (y - boxSize.height) > 0 ? y - boxSize.height : 0
		} 
		this.template.style('left',x).style('top', y) 
	}
	
	private formatDataList(keyProperty: string, properties:string[],data:any) {
		var ttData = { name: keyProperty, value: data[keyProperty], details: [] }
		for (var p of properties) {
			ttData.details.push({name:p, value:data[p]})
		}
		var html = this._compiledTemplate({ data: ttData })
		this.template.html(html)
	}
	
	private formatSingleData(keyProperty:string, valueProperty:string, data:any) {
		var ttData = { details: [{name:keyProperty, value:data.key}, {name:valueProperty, value:data.value}] }
		var html = this._compiledTemplate({ data: ttData })
		this.template.html(html)
	}

}