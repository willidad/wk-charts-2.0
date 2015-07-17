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

export interface XYGroupItem {
	
	getSelector():string;
	create(selection, caller);
	update(selection, caller);
	
}
