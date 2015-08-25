import { Pie } from './pie'

export class Donut extends Pie {
	
	protected innerRadius:number = 0
	
	protected draw(container, transition:boolean) {
		this.innerRadius = Math.min(this._drawingAreaSize.width, this._drawingAreaSize.height) / 2 * (this.dataLabels ? 0.55 : 0.65)
		super.draw(container, transition)
	}
}