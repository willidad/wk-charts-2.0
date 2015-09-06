import * as def from './chartDef'

import { Chart as ChartImpl } from './../core/chart'
import { Layout } from './../core/layout'
import { Scale } from "./../core/scale"
import { Axis } from "./../core/axis"
import { Grid } from "./../core/grid"
import { Area } from './../layouts/area'
import { Line } from './../layouts/line'
import { Column } from './../layouts/column'
import { Pie } from './../layouts/pie'
import { Donut } from './../layouts/donut'
import { DataMarker } from './../decorators/dataMarker'
import { DataLabel } from './../decorators/dataLabels'
import { PieDataLabel } from './../decorators/pieDataLabels'
import { Tooltip } from './../behavior/tooltip'

export class Chart implements def.Chart {
	private layouts: Layout[];
       
	private scales:{[id:string]:Scale} = {};
	private axis:Axis[];
	private grid:Grid[];
	private chart:ChartImpl;
        
	constructor(public container:def.d3DivSelector, public model:def.ChartDef) {
		this.chart = new ChartImpl(container)
		if (typeof model.title === 'object') {
			this.chart.title = (<def.StyledText>model.title).text
			if (this.chart.titleStyle) this.chart.titleStyle = (<def.StyledText>model.title).style
			if (this.chart.titleBgStyle) this.chart.titleBgStyle = (<def.StyledText>model.title).bgStyle		
		} else {
			this.chart.title = <string>model.title
		}
		if (typeof model.subTitle === 'object') {
			this.chart.subTitle = (<def.StyledText>model.subTitle).text
			if (this.chart.subTitleStyle) this.chart.subTitleStyle = (<def.StyledText>model.subTitle).style
			if (this.chart.subTitleBgStyle) this.chart.subTitleBgStyle = (<def.StyledText>model.subTitle).bgStyle		
		} else {
			this.chart.subTitle = <string>model.subTitle
		}
        
        for (var s of model.scales) {
        if (!s.id) throw 'Scale needs an ID'
        this.scales[s.id] = this.chart.addScale(s.type,s.properties,s.domainRange)
			this.scales[s.id].isInverted = s.isInverted
        }
        for (var l of model.layouts) {
			var layout;
			switch (l.type) {
				case def.ChartType.area:
					var la:def.Area = <def.Area>l;
					layout = new Area(this.scales[la.keyScaleId], la.keyProperty, this.scales[la.valueScaleId], la.valueProperty, la.value0Property, this.scales[la.colorScaleId], la.isVertical, la.spline);
					if (la.rowColor) {
						layout.rowColor = la.rowColor
					}
					if (la.dataMarkers) {
						var dm = new DataMarker()
						if (typeof la.dataMarkers === 'object') {
							dm.markerStyle = <def.Style>la.dataMarkers
						}
						layout.dataMarkers = dm
					}
					if (la.areaStyle) layout.areaStyle = la.areaStyle;
					break;
				case def.ChartType.line:
					var ll:def.Line = <def.Line>l;
					layout = new Line(this.scales[ll.keyScaleId], ll.keyProperty, this.scales[ll.valueScaleId], ll.valueProperty, this.scales[ll.colorScaleId], ll.isVertical, ll.spline);
					if (ll.rowColor) {
						layout.rowColor = ll.rowColor
					}
					if (ll.dataMarkers) {
					var dm = new DataMarker()
						if (typeof ll.dataMarkers === 'object') {
							dm.markerStyle = <def.Style>ll.dataMarkers
						}
						layout.dataMarkers = dm
					}
					if (ll.lineStyle) layout.lineStyle = ll.lineStyle;
					break;
				case def.ChartType.column:
					var lc:def.Column = <def.Column>l;
					layout = new Column(this.scales[lc.keyScaleId], lc.keyProperty, this.scales[lc.valueScaleId], lc.valueProperty, this.scales[lc.colorScaleId], lc.isVertical);
					if (lc.rowColor) {
						layout.rowColor = lc.rowColor
					}
					if (lc.columnStyle) layout.columnStyle = lc.columnStyle;
                	if (lc.padding) layout.padding = lc.padding;
					if (lc.dataLabels) {
						var dl = new DataLabel()
						if (typeof lc.dataLabels === 'object') {
							dl.style = (<def.DataLabels>lc.dataLabels).style
						}
						layout.dataLabels = dl
					}
					break;
				case def.ChartType.pie:
					var lp:def.Pie = <def.Pie>l;
					layout = new Pie(this.scales[lp.keyScaleId], lp.keyProperty, this.scales[lp.valueScaleId], lp.valueProperty, this.scales[l.colorScaleId]);
					if (lp.pieStyle) layout.pieStyle = lp.pieStyle;
					if (lp.dataLabels) {
					var dp = new PieDataLabel()
						if (typeof lp.dataLabels === 'object') {
							if ((<def.DataLabels>lp.dataLabels).style) {
								dp.labelStyle = (<def.DataLabels>lp.dataLabels).style
							}
							if ((<def.DataLabels>lp.dataLabels).bgStyle) {
								dp.labelBgStyle = (<def.DataLabels>lp.dataLabels).bgStyle
							}
						}
						layout.dataLabels = dp
					}
					break;
				case def.ChartType.donut:
                var lp = <def.Donut>l;
                layout = new Donut(this.scales[lp.keyScaleId], lp.keyProperty, this.scales[lp.valueScaleId], lp.valueProperty, this.scales[l.colorScaleId]) ;
					if (lp.pieStyle) layout.pieStyle = lp.pieStyle;
					if (lp.dataLabels) {
						var dp = new PieDataLabel()
						if (typeof lp.dataLabels === 'object') {
							if ((<def.DataLabels>lp.dataLabels).style) {
								dp.labelStyle = (<def.DataLabels>lp.dataLabels).style
							}
							if ((<def.DataLabels>lp.dataLabels).bgStyle) {
								dp.labelBgStyle = (<def.DataLabels>lp.dataLabels).bgStyle
							}
						}
						layout.dataLabels = dp
					}
					break;
			} //switch
			this.chart.addLayout(layout)
        } //layouts
        if (model.axis) {
        	for (var a of model.axis) {
        		var ax:Axis = this.chart.addAxis(a.orientation, this.scales[a.scaleId]);
				if (typeof a.title == 'string') {
					ax.title = <string>a.title
				} else {
					ax.title = (<def.StyledText>a.title).text;
					ax.titleStyle = (<def.StyledText>a.title).style
				}
        		if ((<def.StyledText>a.title).bgStyle) ax.titleBgStyle = (<def.StyledText>a.title).bgStyle;
        		if (a.grid) {
					var g:Grid = this.chart.addGrid(ax);
					if (typeof a.grid === 'object') {
						g.lineStyle = <def.Style>a.grid
                	}
        		}
        
        		if (a.tickLabelStyle) {
                	if (a.tickLabelStyle.labelStyle) {
                		ax.tickLabelStyle = a.tickLabelStyle.labelStyle
                	}
                	if (a.tickLabelStyle.bgStyle) {
                		ax.tickLabelBgStyle = a.tickLabelStyle.bgStyle
                	}
                	if (a.tickLabelStyle.rotation) {
                		ax.tickRotation = a.tickLabelStyle.rotation
                	}
        		}	
        
				//TODO : LabelFormat
        	}
        }
        
        if (model.tooltip) {
			this.chart.tooltip = new Tooltip(model.tooltip.showElement, this.scales[model.tooltip.keyScaleId],model.tooltip.properties, model.tooltip.isVertical, model.tooltip.showMarkerArea)
        }
	} //constructor
        
	public draw(data:any) {
		this.chart.draw(data)
	}

}