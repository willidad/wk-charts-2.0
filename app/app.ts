import { Chart } from './publicInterface/chart'
import  * as def from './publicInterface/chartDef'
import { DataTable } from './tools/data-table'
import * as _ from 'lodash'

var chart
var curChartDef: def.ChartDef
var container

var keyScaleOrd:def.Scale = {
    id:'keyOrd',
	type:'ordinal', 
	properties:['x']
};
var keyScaleLin:def.Scale = {
    id:'keyLin',
	type:'linear', 
	properties:['x1'], 
	domainRange:def.DomainCalc.extent
};
var valScaleLin:def.Scale = {
    id:'valLin',
	type:'linear', 
	properties:['y', 'y2'],
	domainRange:def.DomainCalc.extentZero
};
var colorScale:def.Scale = {
    id:'color',
	type:'category10',
	properties:[]
};
var keyAxisBottomOrd:def.Axis = {
	orientation: def.Position.bottom,
	scaleId:'keyOrd',
	title:'X-Axis Ordinal',
    grid:true
};
var keyAxisLeftOrd: def.Axis = {
	orientation: def.Position.left,
	scaleId: 'keyOrd',
	title:'Y-Axis Ordinal'
}
var keyAxisLeftLin: def.Axis = {
	orientation: def.Position.left,
	scaleId: 'keyLin',
	title:'Y-Axis Linear'
}

var keyAxisBottomLin:def.Axis = {
	orientation: def.Position.bottom,
	scaleId:'keyLin',
	title:'X-Axis Linear',
    grid:true
};
var valueAxisLeftLin:def.Axis = {
	orientation: def.Position.left,
	scaleId:'valLin',
	title:'Y-Axis Linear',
    grid:true
};

var valueAxisBottomLin: def.Axis = {
	orientation: def.Position.bottom,
	scaleId: 'valLin',
	title:'X-Axis Linear'
}

var area:def.Area = {
	type:def.ChartType.area,
	keyScaleId:'keyLin',
	keyProperty:'x1',
	valueScaleId:'valLin',
	value0Property:'y2',
	valueProperty:'y',
    colorScaleId:'color',
	spline:true,
	dataMarkers:true
};

var vertArea:def.Area = {
	type:def.ChartType.area,
	keyScaleId:'keyOrd',
	keyProperty:'x',
	valueScaleId:'valLin',
	value0Property:'y2',
	valueProperty:'y',
    colorScaleId:'color',
	spline:true,
	dataMarkers: true,
	isVertical:true
};

var line:def.Line = {
	type:def.ChartType.line,
	keyScaleId:'keyLin',
	keyProperty:'x1',
	valueScaleId:'valLin',
	valueProperty: 'y',
	colorScaleId:'color',
	spline:true,
	dataMarkers:{fill:'#c0c0c0'}	
};

var vertLine:def.Line = {
	type:def.ChartType.line,
	keyScaleId:'keyLin',
	keyProperty:'x1',
	valueScaleId:'valLin',
	valueProperty: 'y',
	colorScaleId: 'color',
	spline: true, 
	dataMarkers: { fill: '#c0c0c0' },	
	isVertical: true
};

var column1: def.Column = {
	type:def.ChartType.column,
	keyScaleId: 'keyOrd',
	keyProperty: 'x',
	valueScaleId: 'valLin',
	valueProperty: 'y',
	colorScaleId: 'color',
	rowColor: 'rgb(31, 119, 180)',
	padding:[0.13,0.52],
	dataLabels:true
}
var column1Vert = _.clone(column1)
column1Vert.isVertical = true

var column2: def.Column = {
	type:def.ChartType.column,
	keyScaleId: 'keyOrd',
	keyProperty: 'x',
	valueScaleId: 'valLin',
	valueProperty: 'y2',
	colorScaleId: 'color',
	rowColor: 'rgb(255, 127, 14)',
	padding:[0.52, 0.13],
	dataLabels:true
}

var column2Vert = _.clone(column2)
column2Vert.isVertical = true

var pie: def.Donut = {
	type:def.ChartType.donut,
	keyScaleId: 'keyOrd',
	keyProperty: 'x',
	valueScaleId: 'valLin',
	valueProperty: 'y',
	colorScaleId: 'color',
	dataLabels:true
}

var col: def.ChartDef = {
	title:'Column Chart',
    scales:[keyScaleOrd, valScaleLin, colorScale],
	layouts:[column1, column2],
	axis: [keyAxisBottomOrd, valueAxisLeftLin],
	tooltip: { showElement:true, keyScaleId:'keyOrd', properties:['y', 'y2'] }
};

var bar: def.ChartDef = {
	title:'Bar Chart',
    scales:[keyScaleOrd, valScaleLin, colorScale],
	layouts:[column1Vert, column2Vert],
	axis: [keyAxisLeftOrd, valueAxisBottomLin],
	tooltip: { keyScaleId:'keyOrd', properties:['y', 'y2'], isVertical:true }
};

var areaHor:def.ChartDef = {
	title:'Area Chart',
    subTitle:'horizontal',
    scales:[keyScaleLin, valScaleLin, colorScale],
	layouts:[area],
	axis:[keyAxisBottomLin, valueAxisLeftLin],
	tooltip: { keyScaleId:'keyLin', properties:['y', 'y2'] }
};

var areaVert:def.ChartDef = {
	title:'Area Chart',
    subTitle:'Vertical',
    scales:[keyScaleOrd, valScaleLin, colorScale],
	layouts:[vertArea],
	axis: [keyAxisLeftOrd, valueAxisBottomLin],
	tooltip: { keyScaleId:'keyOrd', properties:['y', 'y2'], isVertical:true }
};

var lineVert:def.ChartDef = {
	title:'Line Chart',
    subTitle:'Vertical',
    scales:[keyScaleLin, valScaleLin, colorScale],
	layouts:[vertLine],
	axis:[keyAxisLeftLin, valueAxisBottomLin],
	tooltip: { keyScaleId:'keyLin', properties:['y', 'y2'], isVertical:true }
};

var lineHor:def.ChartDef = {
	title:'Line Chart',
    subTitle:'horizontal',
    scales:[keyScaleLin, valScaleLin, colorScale],
	layouts:[line],
	axis: [keyAxisBottomLin, valueAxisLeftLin]	,
	tooltip: { keyScaleId:'keyLin', properties:['y', 'y2'] }
};
var pieChart:def.ChartDef = {
	title:'Pie Chart',
    scales:[keyScaleOrd, valScaleLin, colorScale],
	layouts: [pie],
	tooltip: { showElement:true, keyScaleId:'keyOrd', properties:['y'] }
};

console.log (JSON.stringify(pieChart))

var data = [
	{ x: 'aaaa', 	x1: 1, 	y: 12, 		y2: 10.5 },
	{ x: 'bbb', 	x1: 2, 	y: 13.8762, y2: 3.123456 },
	{ x: 'Äaaaaaa', x1: 3, 	y: 15, 		y2: 11 },
	{ x: 'ddd', 	x1: 4, 	y: 3, 		y2: -9 },
	{ x: 'eeee', 	x1: 5, 	y: -7, 		y2: -15 },
	{ x: 'ff', 		x1: 6, 	y: 9, 		y2: -2 }
]

new DataTable('#data-table', data ,(data) => {
    chart.draw(data)
});

d3.selectAll('button').on('click', function(el) {  
	var chartList = {
		areaHor: areaHor,
		areaVert:areaVert,
		lineHor: lineHor,
		lineVert: lineVert,
		col: col,
		bar: bar, 
		pie:pieChart 
	}
	var id = d3.select(this).attr('id')
	console.log(id)
	container = d3.select('#container');  
	curChartDef = chartList[id]
	chart = new Chart(container, curChartDef);
	chart.draw(data);
})

d3.select('#rotation').on('input', function() {
	for (var a of curChartDef.axis) {
		if (!a.tickLabelStyle) a.tickLabelStyle = {}
		a.tickLabelStyle.rotation = Number(this.value)
	}
	chart = new Chart(container, curChartDef)
	chart.draw(data)
})

d3.select('#spline').on('change', function() {
	var sp = this.checked
	for (var l of curChartDef.layouts) {
		l.spline = sp
	}
	chart = new Chart(container, curChartDef);
	chart.draw(data);
});

d3.select('#base0').on('change', function() {
	var b0 = this.checked
	for (var l of curChartDef.layouts) {
		if (b0) {
			l.value0Property = 'y2'
		} else {
			delete l.value0Property
		}
	}
	chart = new Chart(container, curChartDef);
	chart.draw(data); 
}) 

d3.select('#useOrd').on('change', function() {
	
})
	
// initial chart shown
curChartDef = areaHor

container = d3.select('#container');  
chart = new Chart(container,curChartDef);
chart.draw(data);

