import { Style } from './../core//interfaces'
import { Scale } from './../core/scale'
import * as d3 from 'd3'
import * as _ from 'lodash'
import { Layout } from './layout'

import * as drawing from './../tools/drawing'
import {markers as markerDefaults} from './../core/defaults'

export class XYLayout extends Layout {
	
	constructor(public valueScale:Scale, public valueProperty:string, public keyScale:Scale, public keyProperty:string, public colorScale?:Scale, public isVertical:boolean = false) {
		super(valueScale, valueProperty, keyScale, keyProperty, colorScale)
	}
}