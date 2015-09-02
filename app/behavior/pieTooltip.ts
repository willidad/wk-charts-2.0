import { ITooltip, D3Selection } from './../core/interfaces'
import { ElementTooltip} from './elementTooltip'

export class PieTooltip extends ElementTooltip implements ITooltip {
	
	protected selector = '.wk-chart-pie-segment'	

}