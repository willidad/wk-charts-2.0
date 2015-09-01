import { Chart } from './publicInterface/chart'
import  * as def from './publicInterface/chartDef'
import { DataTable } from './tools/data-table'

var xScaleOrd:def.Scale = {
    id:'x',
	type:'ordinal', 
	properties:['x'], 
	domainRange:def.DomainRangeCalc.extentZero
};
var xScaleLin:def.Scale = {
    id:'x',
	type:'linear', 
	properties:['x1'], 
	domainRange:def.DomainRangeCalc.extent
};
var yScale:def.Scale = {
    id:'y',
	type:'linear', 
	properties:['y', 'y2'],
	domainRange:def.DomainRangeCalc.extentZero
};
var colorScale:def.Scale = {
    id:'color',
	type:'category10',
	properties:[]
};

var axisBottomOrd:def.Axis = {
	orientation: def.Position.bottom,
	scale:'x',
	title:'X-Axis',
    grid:true
};
var axisBottomLin:def.Axis = {
	orientation: def.Position.bottom,
	scale:'x',
	title:'X-Axis',
    grid:true
};
var axisLeft:def.Axis = {
	orientation: def.Position.left,
	scale:'y',
	title:'Y-Axis',
    grid:true
};

var area:def.Area = {
	type:def.ChartType.area,
	keyScale:'x',
	keyProperty:'x1',
	valueScale:'y',
	value0Property:'y2',
	valueProperty:'y',
    colorScale:'color',
	spline:true,
	dataMarkers:true
};

var line:def.Line = {
	type:def.ChartType.line,
	keyScale:xScaleLin,
	keyProperty:'x',
	valueScale:yScale,
	valueProperty:'y',
	spline:true,
	dataMarkers:{fill:'#c0c0c0'}	
};

var chartDef:def.ChartDef = {
	title:'This is the title for the chart',
    subTitle:'BlaBla',
    scales:[xScaleLin, yScale, colorScale],
	layouts:[area],
	axis:[axisBottomLin, axisLeft],
};

var data = [{x:'aaaa', x1:1, y:12, y2:10.5},{x:'bbb', x1:2, y:13.87620, y2:3.123456},{x:'Äaaaaaa', x1:3, y:15, y2:11},{x:'ddd', x1:4, y:3, y2:-9},{x:'eeee', x1:5, y:-7, y2:-15},{x:'ff', x1:6, y:9, y2:-2}]

new DataTable('#data-table', data ,(data) => {
    chart.draw(data)
});

var container = d3.select('#container').node();
var chart = new Chart(container,chartDef);
chart.draw(data);

