import { Point, Points, IInterpolator} from './interpolator'

export class Linear implements IInterpolator {
	
	constructor(private isVertical:boolean) {}


	private _data:Points

	public path():string {
			return this._data.join('L')
		}
		
	public data(data:Points) {
		this._data = data
	}
	
	private insertBetween(key, low, high) {
			var deltaKey, deltaVal, deltaValIns, deltaKeyIns;
			console.log (low, high, key, this._data)
			deltaKey = Math.abs(this._data[high][k] - this._data[low][k])
			deltaVal = this._data[high][v] - this._data[low][v]
			deltaKeyIns = Math.abs(key - this._data[low][k])
			deltaValIns = Math.abs(this._data[low][k] - key) / deltaKey * deltaVal
			this._data.splice(low, 0 , [key, this._data[low][v] + deltaKeyIns / deltaKey * deltaVal])
		}
		
	public insertAtPoint(key:number) {
		// find insertion point
		var k = this.isVertical ? 1 : 0	
		var v = this.isVertical ? 0 : 1
		var iLow, iHigh, deltaKey, deltaVal, deltaValIns, deltaKeyIns
		
		if (this._data[0][k] > this._data[this._data.length-1][k]) {
			// test boundaries
			if (key > this._data[0][k]) this._data.unshift(this._data[0])
			else if (key < this._data[this._data.length-1][k]) this._data.push(this._data[this._data.length-1])
			else {
				iHigh = 0 // points to larger value
				iLow = 1 // points to smaller value
				while (iLow < this._data.length) {
					if (this._data[iHigh][k] >= key &&  key >= this._data[iLow][k]) break
					iHigh++
					iLow++
				}
				deltaKey = Math.abs(this._data[iHigh][k] - this._data[iLow][k])
				deltaVal = this._data[iHigh][v] - this._data[iLow][v]
				deltaKeyIns = Math.abs(key - this._data[iLow][k])
				deltaValIns = Math.abs(this._data[iLow][k] - key) / deltaKey * deltaVal
				var insPt:[number,number] = [0,0]
				insPt[k] = key
				insPt[v] = this._data[iLow][v] + deltaKeyIns / deltaKey * deltaVal
				this._data.splice(iLow, 0 , insPt)
			}
		} else {
			if (key < this._data[0][k]) this._data.unshift(this._data[0])
			else if (key > this._data[this._data.length-1][k]) this._data.push(this._data[this._data.length-1])
			else {
				iHigh = 1 // points to larger value
				iLow = 0 // points to smaller value
				while (iHigh < this._data.length) {
					if (this._data[iHigh][k] >= key &&  key >= this._data[iLow][k]) break
					iHigh++
					iLow++
				}
				console.log (iLow, iHigh, key, this._data)
				deltaKey = Math.abs(this._data[iHigh][k] - this._data[iLow][k])
				deltaVal = this._data[iHigh][v] - this._data[iLow][v]
				deltaKeyIns = Math.abs(key - this._data[iLow][k])
				deltaValIns = Math.abs(this._data[iLow][k] - key) / deltaKey * deltaVal
				var insPt:[number,number] = [0,0]
				insPt[k] = key
				insPt[v] = this._data[iLow][v] + deltaKeyIns / deltaKey * deltaVal
				this._data.splice(iHigh, 0 , insPt)
			}
		}
	}
	
	public insertAtPointReverse = this.insertAtPoint 
	
	public insertAtIdx(i:number, nbr:number, reverse?:boolean) {
		
		var deltaKey, deltaVal, deltaValIns, deltaKeyIns, startKey, startVal;
		var k = this.isVertical ? 1 : 0	
		var v = this.isVertical ? 0 : 1
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
			deltaKey = Math.abs(this._data[i + 1][k] - this._data[i][k])
			deltaVal = this._data[i+1][v] - this._data[i][v]
			deltaKeyIns = deltaKey / j
			deltaValIns = deltaVal / j
			startKey = this._data[i][k];
			startVal = this._data[i][v]
			while (--j > 0) this._data.splice(i,0, [startKey + j * deltaKeyIns, startVal + j * deltaValIns])
		}	
	}
	
	public insertAtIdxReverse(i:number, nbr:number, reverse?:boolean) {
		var deltaKey, deltaVal, deltaValIns, deltaKeyIns, startKey, startVal;
		var k = this.isVertical ? 1 : 0	
		var v = this.isVertical ? 0 : 1	
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
			deltaKey = Math.abs(this._data[i1- 1][k] - this._data[i1][k])
			deltaVal = this._data[i1 - 1][v] - this._data[i1][v]
			deltaKeyIns = deltaKey / j
			deltaValIns = deltaVal / j
			startKey = this._data[i1][k];
			startVal = this._data[i1][v]
			while (--j > 0) this._data.splice(i1,0, [startKey + j * deltaKeyIns, startVal + j * deltaValIns])
		}	
	}
}