import * as c from './../core/chartDef'

var xScale:c.Scale = {
	type:'ordinal', 
	properties:['x'], 
	domainRange:c.DomainRangeCalc.extentZero
} 

var yScale:c.Scale = {
	type:'linear', 
	properties:['y0', 'y1', 'y2'], 
	domainRange:c.DomainRangeCalc.extentZero
} 

var xAxis:c.Axis 
var yAxis:c.Axis

var area:c.Area = {
	type:c.ChartType.area,
	keyScale:xScale,
	keyProperty:'x',
	valueScale:yScale,
	value0Property:'y0',
	valueProperty:'y1',
	spline:true,
	dataMarkers:true
}

var line:c.Line = {
	type:c.ChartType.line,
	keyScale:xScale,
	keyProperty:'x',
	valueScale:yScale,
	valueProperty:'y',
	spline:true,
	dataMarkers:{fill:'#c0c0c0'}
	
}

var bubble:c.Bubble = {type:c.ChartType.bubble, keyScale:xScale, keyProperty:'x', valueScale:yScale, valueProperty:'y1'}
var chart:c.ChartDef = {
	title:'This is the title for the chart',
	scales:[xScale, yScale],
	layouts:[area],
	axis:[xAxis, yAxis],
	grid:{axis:xAxis}
}