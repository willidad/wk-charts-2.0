import { ITooltip, D3Selection } from './../core/interfaces'
import { Scale } from './../core/scale'

export class ElementTooltip implements ITooltip {
	
	protected selector
	
	constructor(public showGroup:boolean, public keyScale?:Scale, public properties?:string[], public isVertical?:boolean) {
		
	}
	
	public container:D3Selection
	public data:any[]
	
	public enable() {
		if (this.container && !this.showGroup) {
			this.container.selectAll(this.selector)
				.on('mouseenter', this.showTT)
				.on('mouseleave', this.hideTT)
		} else {
			this.container.select('.wk-chart-interaction-layer')
				.on('mousemove', this.moveTT)
				.on('mouseenter', this.showTT)
				.on('mouseleave', this.hideTT)
				.style('pointer-events', 'all')
		}
	}
	
	public disable() {
		if (this.container && !this.showGroup) {
			this.container.selectAll(this.selector)
				.on('mouseenter', null)
				.on('mouseleave', null)
		} else {
			this.container.select('.wk-chart-interaction-layer')
				.on('mousemove', null)
				.on('mouseenter', null)
				.on('mouseleave', null)
				.style('pointer-events', 'none')
		}
	}
	
	private showTT(p) {
		var obj:D3Selection = d3.select(d3.event.target)
		if (!this.showGroup) {
			var datum = obj.datum()
			console.log(datum, datum.data.key, datum.data.value)
		}
	}
	
	private hideTT(p) {
		
	}
	
	private moveTT = () => {
		var mappedKey = d3.mouse(this.container.select('.wk-chart-interaction-layer').node())[this.isVertical ? 1 : 0]
		var dataIdx = this.keyScale.invert(mappedKey)
		var data = this.data[dataIdx]
		var key = data[this.keyScale.properties[0]]
		console.log (key)
	}
	
	private moveBox(x,y) {
		
	}
	
	private formatData(key:any, keyProperty: string, properties:string[],data:any) {
		
	}

}