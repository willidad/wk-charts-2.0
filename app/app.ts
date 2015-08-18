/// <reference path="./../typings/tsd.d.ts" />

import { Chart } from './core/chart';
import { DomainCalc , Scale } from './core/scale';
import { Position, Axis } from './core/axis';
import { Line } from './layouts/line'
import { Area } from './layouts/area'
import { Columns } from './layouts/column'
import { Pie } from './layouts/pie'
import { Donut } from './layouts/donut'
import { Grid } from './core/grid'
import { XYDataLabel } from './decorators/dataLabels'
import { DataMarker } from './decorators/datamarker'
import { DataTable } from './tools/data-table'

export function main(el: HTMLElement): void {
    
    var chart = new Chart(el, 'This is the chart title', "Subtitle");
    
    var xScale = chart.addScale('ordinal', ['x'])
    var x2Scale = chart.addScale('ordinal', ['x'])
    x2Scale.isInverted = true
    var yScale = chart.addScale('linear', ['y', 'y2'], DomainCalc.extentZero)
    var y2Scale = chart.addScale('linear', ['y2'], DomainCalc.extent)
    var colorScale = chart.addScale('category10',[])
    var keyColors = chart.addScale('category10', ['x'])
    
    var axisBottom = chart.addAxis(Position.bottom, xScale, 'X - Scale')
    var axisTop = chart.addAxis(Position.top, y2Scale, 'X - Scale Top')
    var axisLeft = chart.addAxis(Position.left, yScale, 'Y - Scale')
    var axisRight = chart.addAxis(Position.right, x2Scale, 'Y - Axis Right')

    var leftGrid = chart.addGrid(axisLeft)
    //var gridRight = chart.addGrid(axisRight)
    //gridRight.lineStyle = {stroke:'blue', opacity:0.7}
    var gridBottom = chart.addGrid(axisBottom)
    
    var line1 = chart.addLayout(new Line(xScale,'x', yScale,'y',colorScale, false, true))


    var data = [{x:'aaaa', x1:1, y:12, y2:10.5},{x:'bbb', x1:2, y:13.87620, y2:3.123456},{x:'Äaaaaaa', x1:3, y:15, y2:11},{x:'ddd', x1:4, y:3, y2:-9},{x:'eeee', x1:5, y:-7, y2:-15}]
    chart.draw(data)
    
    new DataTable('#data-table', data ,(data) => {
        //console.log('change', data)
        chart.draw(data)
    })
    
    function rotationHandler(ev) {
        var r = Number((<HTMLInputElement>ev.target).value)
        axisBottom.tickRotation = r
        axisLeft.tickRotation = r
        axisRight.tickRotation = r
        axisTop.tickRotation = r
        //dataLabels2.labelRotation = r
        //dataLabels1.labelRotation = r
        chart.draw()
    }
    
    document.getElementById('rotation').addEventListener('change',(ev) => { 
        // needed for IE 11. IE does not support input event on range input, however implents
        // the change event to (incorrectly accd to spec) to behave like input in chrome
        rotationHandler(ev)
    })
    
    document.getElementById('rotation').addEventListener('input',(ev) => {
        rotationHandler(ev)
    })
    
    document.getElementById('col').addEventListener('click', (ev) => {
        chart = new Chart(el, 'This is the chart title', "Subtitle");
        var xScale = chart.addScale('ordinal', ['x'])
        //xScale.isInverted = true
        var yScale = chart.addScale('linear', ['y', 'y2'], DomainCalc.extentZero)
        var colorScale = chart.addScale('category10',[])      
        axisBottom = chart.addAxis(Position.bottom, xScale, 'X - Scale')
        axisLeft = chart.addAxis(Position.left, yScale, 'Y - Scale')  
        var leftGrid = chart.addGrid(axisLeft)
        var gridBottom = chart.addGrid(axisBottom)
        var column1 = chart.addLayout(new Columns(xScale,'x', yScale,'y', colorScale))
        column1.padding = [0.13,0.52]
        column1.rowColor = colorScale.map('y')
        var column2 = chart.addLayout(new Columns(xScale,'x', yScale,'y2',colorScale))
        column2.padding = [0.52,0.13]
        column2.rowColor = colorScale.map('y2') 
        var dataLabels1 = chart.addDataLabels(column1) 
        var dataLabels2 = chart.addDataLabels(column2)
        
        chart.draw(data)
    })
    
    document.getElementById('bar').addEventListener('click', (ev) => {
        chart = new Chart(el, 'This is the chart title', "Subtitle");
        var yScale = chart.addScale('ordinal', ['x'])
        yScale.isInverted = true
        var xScale = chart.addScale('linear', ['y', 'y2'], DomainCalc.extentZero)
        var colorScale = chart.addScale('category10',[])      
        axisTop = chart.addAxis(Position.top, xScale, 'X - Scale Top')
        axisRight = chart.addAxis(Position.right, yScale, 'Y - Axis Right')
        var gridRight = chart.addGrid(axisRight)
        var gridTop = chart.addGrid(axisTop)
        var column1 = chart.addLayout(new Columns(yScale,'x', xScale,'y',colorScale,true))
        column1.padding = [0.13,0.52]
        column1.rowColor = colorScale.map('y')
        var column2 = chart.addLayout(new Columns(yScale,'x', xScale,'y2',colorScale, true))
        column2.padding = [0.52,0.13]
        column2.rowColor = colorScale.map('y2') 
        var dataLabels1 = chart.addDataLabels(column1) 
        var dataLabels2 = chart.addDataLabels(column2)
        
        chart.draw(data)
    })
    
    document.getElementById('pie').addEventListener('click', (ev) => {
        chart = new Chart(el, 'This is the chart title', "Subtitle");
        var xScale = chart.addScale('ordinal', ['x']) 
        var yScale = chart.addScale('linear', ['y', 'y2'], DomainCalc.extentZero)  
        var keyColors = chart.addScale('category10', ['x'])
        var pie = chart.addLayout(new Donut(xScale, 'x', yScale, 'y', keyColors))
        chart.addDataLabels(pie)
        
        chart.draw(data)
    })
    
    document.getElementById('lineHor').addEventListener('click', (ev) => {
        chart = new Chart(el, 'This is the chart title', "Subtitle");
    
        var xScale = chart.addScale('linear', ['x1'], DomainCalc.extent)
        var yScale = chart.addScale('linear', ['y'], DomainCalc.extentZero)
        var colorScale = chart.addScale('category10',[])
        var keyColors = chart.addScale('category10', ['x'])
        
        axisBottom = chart.addAxis(Position.bottom, xScale, 'X - Scale')
        axisLeft = chart.addAxis(Position.left, yScale, 'Y - Scale')
    
        var leftGrid = chart.addGrid(axisLeft)
        var gridBottom = chart.addGrid(axisBottom)
        
        var line1 = chart.addLayout(new Line(xScale,'x1', yScale,'y',colorScale, false, true))
        //var line1Marker = chart.addLayout(new DataMarker(yScale,'y',xScale,'x1', colorScale))
        line1.spline = false
        
        chart.draw(data)

    })
    
    document.getElementById('areaHor').addEventListener('click', (ev) => {
        chart = new Chart(el, 'This is the chart title', "Subtitle");
    
        var xScale = chart.addScale('linear', ['x1'], DomainCalc.extent)
        var yScale = chart.addScale('linear', ['y', 'y2'], DomainCalc.extentZero)
        var colorScale = chart.addScale('category10',[])
        var keyColors = chart.addScale('category10', ['x'])
        
        axisBottom = chart.addAxis(Position.bottom, xScale, 'X - Scale')
        axisLeft = chart.addAxis(Position.left, yScale, 'Y - Scale')
    
        var leftGrid = chart.addGrid(axisLeft)
        var gridBottom = chart.addGrid(axisBottom)
        
        var area = chart.addLayout(new Area(xScale,'x1', yScale,'y','y2',colorScale, false, true))
        var line1Marker = chart.addLayout(new DataMarker(xScale,'x1', yScale,'y',colorScale))
        
        chart.draw(data)
    })
    
    document.getElementById('lineVert').addEventListener('click', (ev) => {
        chart = new Chart(el, 'This is the chart title', "Subtitle");
    
        var yScale = chart.addScale('linear', ['x1'], DomainCalc.extent)
        var xScale = chart.addScale('linear', ['y'], DomainCalc.extentZero)
        var colorScale = chart.addScale('category10',[])
        var keyColors = chart.addScale('category10', ['x'])
        
        axisBottom = chart.addAxis(Position.bottom, xScale, 'X - Scale')
        axisLeft = chart.addAxis(Position.left, yScale, 'Y - Scale')
    
        var leftGrid = chart.addGrid(axisLeft)
        var gridBottom = chart.addGrid(axisBottom)
        
        var line1 = chart.addLayout(new Line(yScale,'x1', xScale,'y',colorScale, true, true))
        //var line1Marker = chart.addDataMarkers(line1)
        
        chart.draw(data)

    })
    
    document.getElementById('areaVert').addEventListener('click', (ev) => {
        chart = new Chart(el, 'This is the chart title', "Subtitle");
    
        var yScale = chart.addScale('linear', ['x1'], DomainCalc.extent)
        var xScale = chart.addScale('linear', ['y','y2'], DomainCalc.extentZero)
        var colorScale = chart.addScale('category10',[])
        var keyColors = chart.addScale('category10', ['x']) 
        var axisBottom = chart.addAxis(Position.bottom, xScale, 'X - Scale')
        var axisLeft = chart.addAxis(Position.left, yScale, 'Y - Scale')
        var leftGrid = chart.addGrid(axisLeft)
        var gridBottom = chart.addGrid(axisBottom)
        
        var line1 = chart.addLayout(new Area(yScale,'x1', xScale,'y','y2', colorScale, true, true))
        var line1Marker = chart.addDataMarkers(line1)
        
        chart.draw(data)

    })
}