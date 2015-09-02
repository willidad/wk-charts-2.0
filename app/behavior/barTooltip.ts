import { ITooltip, D3Selection } from './../core/interfaces'
import { ElementTooltip} from './elementTooltip'

export class BarTooltip extends ElementTooltip implements ITooltip {
	
	protected selector = '.wk-chart-column-bar'
}