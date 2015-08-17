import { Point, Points, IInterpolator} from './interpolator'

export class Linear implements IInterpolator {

	private _data:Points

	public path():string {
			return this._data.join('L')
		}
		
	public data(data:Points) {
		this._data = data
	}
		
	public insertAtPoint(x:number, reverse?:boolean) {
		// find insertion point
		var i = -1,
			deltaX, deltaY, deltaYins, deltaXIns;
			
		while (++i < this._data.length){
			if (x <= this._data[i][0]) break
		}
		// insert Point
		if (i === 0) {
			// insert first point as animation start point
			this._data.unshift(this._data[0]) 
		} else if (i === this._data.length) {
			// insert last point as animation start point
			this._data.push(this._data[i-1])
		} else {
			// insert in between, interpolate y from surrounding two points
			deltaX = Math.abs(this._data[i][0] - this._data[i-1][0])
			deltaY = this._data[i][1] - this._data[i - 1][1]
			deltaXIns = Math.abs(x - this._data[i-1][0])
			deltaYins = Math.abs(this._data[i][0] - x) / deltaX * deltaY
			this._data.splice(i, 0 , [x, this._data[i - 1][1] + deltaXIns / deltaX * deltaY])
		}	
	}
	
	public insertAtPointReverse(x:number, reverse?:boolean) {
		// find insertion point
		var i = this._data.length,
			deltaX, deltaY, deltaYins, deltaXIns;
			

		// insert Point
		if (x > this._data[0][0]) {
			// insert first point as animation start point
			this._data.unshift(this._data[0]) 
		} else if (x < this._data[this._data.length-1][0]) {
			// insert last point as animation start point
			this._data.push(this._data[this._data.length-1])
		} else {
			while (--i >= 0){
				if (x <= this._data[i][0]) break
			}
			// insert in between, interpolate y from surrounding two points
			deltaX = Math.abs(this._data[i][0] - this._data[i+1][0])
			deltaY = this._data[i][1] - this._data[i + 1][1]
			deltaXIns = Math.abs(x - this._data[i+1][0])
			deltaYins = Math.abs(this._data[i][0] - x) / deltaX * deltaY
			this._data.splice(i+1, 0 , [x, this._data[i + 1][1] + deltaXIns / deltaX * deltaY])
		}
	}
	
	
	public insertAtIdx(i:number, nbr:number, reverse?:boolean) {
		
		var deltaX, deltaY, deltaYIns, deltaXIns, startX, startY;
			
		if (i < 0) {
			// insert first point as animation start point
			var j = nbr
			while (--j >= 0) this._data.unshift(this._data[0])
		} else if (i >= this._data.length - 1) {
			var j = nbr
			var last = this._data[this._data.length - 1]
			while (--j >= 0) this._data.push(last)
		} else {
			j = nbr + 1
			deltaX = Math.abs(this._data[i + 1][0] - this._data[i][0])
			deltaY = this._data[i+1][1] - this._data[i][1]
			deltaXIns = deltaX / j
			deltaYIns = deltaY / j
			startX = this._data[i][0];
			startY = this._data[i][1]
			while (--j > 0) this._data.splice(i,0, [startX + j * deltaXIns, startY + j * deltaYIns])
		}	
	}
	
	public insertAtIdxReverse(i:number, nbr:number, reverse?:boolean) {
		var deltaX, deltaY, deltaYIns, deltaXIns, startX, startY;
			
		if (i < 0) {
			// insert first point as animation start point
			var j = nbr
			while (--j >= 0) this._data.push(this._data[this._data.length - 1])
		} else if (i >= this._data.length - 1) {
			var j = nbr
			while (--j >= 0) this._data.unshift(this._data[0])
		} else {
			var i1 = this._data.length - i -1
			j = nbr + 1
			deltaX = Math.abs(this._data[i1- 1][0] - this._data[i1][0])
			deltaY = this._data[i1 - 1][1] - this._data[i1][1]
			deltaXIns = deltaX / j
			deltaYIns = deltaY / j
			startX = this._data[i1][0];
			startY = this._data[i1][1]
			while (--j > 0) this._data.splice(i1,0, [startX + j * deltaXIns, startY + j * deltaYIns])
		}	
	}
}