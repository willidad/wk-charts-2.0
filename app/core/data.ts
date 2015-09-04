import { Diff } from './../tools/array-diff'

export class Data {
	
	constructor(public key:(v:any)=>any) {}
	
	private _prevData:any[]
	private _prevKeys:any[]
	private _prevKeyIdx:{}
	private _currentData:any[] = []
	private _currentKeys:any[] = []
	private _currentKeyIdx:{}
	private _diffSeq:any[]
	private _differ = Diff({compress:false, unique:true})
	
	set data(val:any[]) {
		this._prevData = this._currentData
		this._prevKeys = this._currentKeys
		this._prevKeyIdx = this._currentKeyIdx
		this._currentData = val
		this._currentKeys = []
		this._currentKeyIdx = {}
		for (var d of val) {
			this._currentKeys.push(this.key(d))
			this._currentKeyIdx[this.key(d)] = d
		}
		this._diffSeq = this._differ(this._prevKeys,this._currentKeys)  
	}
	
	get diffSequence():[string, string][] {  
		return this._diffSeq
	}
	
	public getCurrentVal(key:any):any {
		return this._currentKeyIdx[key]
	}
	
	public getPrevVal(key:any):any {
		if (!this._prevKeyIdx[key]) debugger
		return this._prevKeyIdx[key]
	}
	
	get current():any[] {
		return this._currentData
	}
	
	get previous():any[] {
		return this._prevData
	}
	
	public getByKey(key:any):any {
		return this._currentKeyIdx[key]
	}
}