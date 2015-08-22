import { Layout } from './layout'


export class PathLayout extends Layout {
	
	protected pathGenerator:Generator;
	
	//override functions
	public targetContainer = 'wk-chart-layout-area';
	public needsPadding:boolean = false
	
	protected startPath = () => {
		this.pathGenerator.keyOffset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
		this.pathGenerator.data = this._prevData
		// extract added keys and key position from diff
		var ptIdx = -1
		var i = -1
		while (++i < this.diffSeq.length) {
			var op:string = this.diffSeq[i][0]
			var key:string = this.diffSeq[i][1]
			if (op === '+') {
				if (this.keyScale.isOrdinal) {
					this.pathGenerator.insertPointAtIdx(ptIdx)
				} else {
					this.pathGenerator.insertPointAt(key)
				}
			} else ptIdx++
		}
		return this.pathGenerator.path
	}
	
	protected endPath = ():string => {
		this.pathGenerator.keyOffset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
		this.pathGenerator.data = this._data
		// extract added keys and key position from diff
		var ptIdx = -1
		var i = -1
		while (++i < this.diffSeq.length) {
			var op = this.diffSeq[i][0]
			var key = this.diffSeq[i][1]
			if (op === '-') {
				if (this.keyScale.isOrdinal) {
					this.pathGenerator.insertPointAtIdx(ptIdx)
				} else {
					this.pathGenerator.insertPointAt(key)
				}
			} else ptIdx++
		}
		return this.pathGenerator.path
	}
	
	protected cleanPath = ():string => {
		this.pathGenerator.keyOffset = this.keyScale.isOrdinal ? this.keyScale.getRangeBand() / 2 : 0
		this.pathGenerator.data = this._data
		return this.pathGenerator.path
	}
	
	//-------------------------------------------------------------------------------
	
}