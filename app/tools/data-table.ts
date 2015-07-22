import * as d3 from 'd3'
import * as _ from 'lodash'

export class DataTable {
	
	private data:any[] = []
	private ctr
	private table
	private rows
	private cols
	
	
	constructor(private container:string, private initialData, private change:{(data):void}) {
		this.data = _.cloneDeep(initialData)
		this.ctr = d3.select(container)
		this.table = this.ctr.append('table')
		// draw title
		var title = this.table.append('tr')
		var hdrs = title.selectAll('th').data(this.entries(initialData[0]))
		hdrs.enter().append('th')
		hdrs.text((d) => d.key)
		hdrs.exit().remove()
		// draw data rows
		this.setData(this.data)
		
		this.ctr.append('button').text('reset').on('click', this.btnClick())
	}
	
	private setData = (data) => {
		//console.log('setData', data)
		var rows = this.table.selectAll('.row').data(data, (d) => d['x'])
	    rows.enter().append('tr').attr('class', 'row')
	    var cols = rows.selectAll('.col').data((d, i) => this.entries(d, i), (d) => d['key'])
	    cols.enter().append('td').attr('class', 'col').append('input')
	    cols.select('input').attr('value',function(d) {
			this.value = d.value //need to set value property to change he displayed value. d3 changes value attribute !!!!!
			return d.value
		}).on('change',this.changeHandler())
		var check = rows.select('.check')
		if (check.empty()) {
			rows.append('input').attr('class', 'check')
				.attr('type', 'checkbox')
				.attr('checked', true)
				.on('change', this.checkHandler())
		}
	    cols.exit().remove()
	    rows.exit().remove()
	}
	
	
	private changeHandler() {
		var _self = this
		return function (d,i) {
	        d.ref[d.key] = this.value
	        _self.change(_.reject(_self.data,'exclude'))
		}
	}
	
	private checkHandler() {
		var _self = this
		return function (d,i) {
			d.exclude = !this.checked
			_self.change(_.reject(_self.data,'exclude'))
		}
	}
	
	private btnClick() {
		var _self = this
		return function(ev) {
			_self.data = _.cloneDeep(_self.initialData)
			_self.setData(_self.data);
			_self.change(_.reject(_self.data,'exclude'))
		}
	}
	
	private entries(row:{}, i?:number) {
        var res = []
        for (var key in row) {
            res.push({key:key, value:row[key], ref:row, refI:i})
        }
        return res  
    }
}