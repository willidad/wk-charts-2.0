import * as d3 from 'd3'

export interface Style {
	[name:string]:any
}

export interface IMargins {
	top:number,
	bottom:number,
	left:number,
	right:number
}

export interface AreaSize {
	width:number;
	height:number;
}


export interface XYPathLayout {
	
	/**
	 * sets the svg style attribute set to the layout color 
	 * Default value: 'stroke'
	 */
	colorProp:string;
	
	/**
	 * sets the line or area interpolation type used if the 'spline' property of the layout
	 * is set to true. 
	 * Default value: 'cardinal
	 */
	splineType:string;
	
	/**
	 * returns a fully configured d3 path generator (typically line or area)
	 */
	pathGenerator():d3.svg.Area<any> | d3.svg.Line<any>;
	
	/**
	 * the path that is generated for the layout.
	 */
	path?:d3.Selection<any>;
	
	/**
	 * called before the layout is drawn. 
	 */
	beforeDraw(container:d3.Selection<any>, data:any[], drawingAreaSize?: AreaSize)
	/**
	 * called after the layout is drawn. apply styles etc here. 
	 */
	afterDraw(container:d3.Selection<any>, data:any[], drawingAreaSize?: AreaSize)
}
