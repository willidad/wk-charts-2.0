import { Pie } from './pie'

export class Donut extends Pie {
	
	protected innerRadius:number = 0
	
	public beforeDraw = (container, data, drawingAreaSize?) => {
		this.innerRadius = Math.min(drawingAreaSize.width, drawingAreaSize.height) / 2 * (this.dataLabels ? 0.55 : 0.65)
	}
}