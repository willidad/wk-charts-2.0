
import { Style } from './../core/interfaces'
import { Scale } from './../core/scale'
import { PathLayout } from './../baseLayouts/pathlayout'

export class XYPath extends PathLayout {
	
	constructor(
		public keyScale:Scale, 
		public keyProperty:string, 
		public valueScale:Scale, 
		public valueProperty:string, 
		public colorScale?:Scale, 
		public isVertical:boolean = false, 
		public spline:boolean = false) {
		super(keyScale,keyProperty, valueScale,valueProperty, colorScale)
	}
	
	/**
	 * called at end of animation to remove animation target points of removed data points. 
	 */	
	private cleanup = () => {
		var endPath = this.cleanPath();
		var path = this.path
		return function() {
			console.log ('path cleanup')
			path.attr('d', endPath)
		}
	}
	
	protected path:d3.Selection<any>;
	protected offset:number = 0
	protected colorProp:string = 'stroke'
	protected pathStyle:Style = {}
	
	// exposed drawing utility functions 
	
	public drawStart = () => {
		//console.log ('drawStart')
		if (!this.path) this.path = this.layoutG.append('path')
		this.path.attr('d', this.startPath)
			.style(this.pathStyle)
		
		if (this.colorScale) {
			this.path.style(this.colorProp, this.propertyColor())
		}
	}
	
	public drawAnimation = () => {
		//console.log ('drawAnimation')
		if (!this.path) this.path = this.layoutG.append('path')
		this.path.transition().duration(this._duration)
			.attr('d', this.endPath())
			.each('end', this.cleanup()) //clean up animation targets for deleted data points after animation is done
		
		if (this.colorScale) {
			this.path.style(this.colorProp, this.propertyColor())
		}		
	}
	
	public drawEnd = () => {
		//console.log ('drawEnd')
		if (!this.path) this.path = this.layoutG.append('path')
		this.path.attr('d', this.cleanPath())
			.style(this.pathStyle)
		
		if (this.colorScale) {
			this.path.style(this.colorProp, this.propertyColor())
		}		
	}
}