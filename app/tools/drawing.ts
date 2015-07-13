import * as d3 from 'd3'
import * as _ from 'lodash'
import {defaults} from './../models/defaults'

export function measureLabel(text:string, container, labelStyle, bgStyle):ClientRect {
	
	container.style('display', 'none')
	var textElem = container.select('text')
	if (textElem.empty()) {
		textElem = container.append('text')
	}
	var rectElem = container.select('rect')
	if (rectElem.empty()) {
		rectElem = container.append('rect')
	}
	textElem.text(text).style(labelStyle);
	var size = textElem.node().getBBox()
	return size
}

export function drawLabel(text:string, container, labelStyle, bgStyle):void {
	container.style('display', null)
	var textElem = container.select('text')
	if (textElem.empty()) {
		textElem = container.append('text')
	}
	var rectElem = container.select('rect')
	if (rectElem.empty()) {
		rectElem = container.append('rect')
	}
	textElem.text(text).style(labelStyle);
	var size = textElem.node().getBBox()
	rectElem.style(bgStyle).attr(size)
}
