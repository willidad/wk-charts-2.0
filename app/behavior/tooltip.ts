import { ITooltip, Style } from './../core/interfaces'

export class Tooltip implements ITooltip {
	
	constructor(
		keyProperty:string,
		valueProperties:string[]) {	
	}
	
	public dispatcher:d3.Dispatch
	
	public enter() {
		var ev = d3.event.target
		var obj = d3.select(d3.event.target)
		var data = obj.datum()
		//if (obj.classed('wk-chart-column-bar')) {
			console.log(data.key, data.value)
		//}
		var d = d3.select(d3.event.target).data()
		console.log (`tooltip show: ${ev}`, d)
	}
	
	public exit(t) {
		var ev =  d3.event.target
		var d = d3.select(d3.event.target).data()
		console.log (`tooltip hide: ${ev}`, d)
	}
	
	public move = () => {
		var ev = d3.event.target
		var pos = d3.mouse(d3.select('.wk-chart-layout-area').node())
		var d = d3.select(d3.event.target).data()
		//this.dispatcher.getData(pos[0], pos[1])
		//console.log (`tooltip x position: ${pos}`, d)
	}
	
	public data(keyProperty:string, valueProperty:string, key:any, value:any, color:string, style:Style) {
		console.log (`tooltip data key:${key} , value:${value} , color:${color}`)
	}
}