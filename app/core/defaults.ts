import { Style, IMargins } from './interfaces'

const emptyStyle:Style = {}

export var chart = {
		titleStyle: {'font-size': '1.8em'},
		titleBgStyle: {fill: 'lightgrey'},
		subTitleStyle: {'font-size': '1.4em'},
		subTitleBgStyle: {fill:'lightgrey'},
		margins: {
			left:5,
			right:10,
			top:10,
			bottom:5
		}
	}
	
export var grid = {
		lineStyle: {stroke: 'lightgrey'},
	}
	
export var axis = {
		titleStyle: {'font-size': '1em'},
		titleBgStyle: {fill: 'none', stroke:'red'},
		tickLabelStyle: emptyStyle,
		tickLabelBgStyle: {fill:'yellow', opacity:0.3},
		tickLineStyle: {stroke:'green'}
	}
	
export var line = {
	lineStyle: emptyStyle
}

export var area = {
	areaStyle: {opacity:0.5}
}

export var column = {
	columnStyle: emptyStyle
}

export var pie = {
	pieStyle: {opacity: 0.4}
}

export var markers = {
	markerStyle: emptyStyle,
	markerSize: 5
}

export var dataLabels = {
	labelStyle: emptyStyle, 
	labelPadding: 5,
	labelBgStyle: {fill:'none', stroke:'lightblue'}
}