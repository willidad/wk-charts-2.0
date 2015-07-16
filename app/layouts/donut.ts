import { Layout } from './../baseLayouts/layout'

import * as d3 from 'd3'
import * as _ from 'lodash'

import { Style } from './../core/interfaces'
import { Pie } from './pie'
import { pie as pieDefaults} from './../core/defaults'

export class Donut extends Pie {
	
	protected innerRadius:number = 0
	
	protected beforeDraw = (container, data, drawingAreaSize?) => {
		this.innerRadius = (Math.min(drawingAreaSize.width, drawingAreaSize.height) / 2) * .65
	}
}