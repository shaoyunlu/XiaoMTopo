function textNode(opt){
	let vTopo = opt.vTopo
	let y_margin = vTopo.vTopoOpt.components.text.yMargin
	var self = this
	this.type = 'text'
	this.align = opt.align || 'bottom'

	this.parentNode = opt.parentNode

	this.text = []

	opt.textArray.forEach(tmp => {
		this.text.push(tmp.text)
	})

	this.snapNode = vTopo.snapSvg.paper.text(0, 0, this.text).attr({
																	"id" : "t_" + this.parentNode.id,
																	"fill" : vTopo.vTopoOpt.components.text.textColor
																   })

	this.jqNodeEl = $("#" + 't_' + this.parentNode.id)

	// this.snapNode.attr({
	// 	"y" : this.parentNode.getNodeWidthHeight().height + y_margin
	// })

	this.parentNode.snapBaseNode.add(this.snapNode)

	this.textLayout = function (){
		let p_width_height = this.parentNode.getNodeWidthHeight()
		let textArrayLength = opt.textArray.length || 0
		opt.textArray.forEach( (tmp ,i) => {
			if (self.align == 'bottom'){
				this.jqNodeEl.find("tspan").eq(i).attr("x" ,(p_width_height.width - tmp.width)/2)
				this.jqNodeEl.find("tspan").eq(i).attr("y" ,(p_width_height.height + y_margin) + y_margin*i)
			} else if (self.align == 'right'){
				this.jqNodeEl.find("tspan").eq(i).attr("x" ,(p_width_height.width))
				this.jqNodeEl.find("tspan").eq(i).attr("y" ,(p_width_height.height/2) + y_margin*i)
			} else if (self.align == 'top'){
				this.jqNodeEl.find("tspan").eq(i).attr("x" ,(p_width_height.width - tmp.width)/2)
				this.jqNodeEl.find("tspan").eq(i).attr("y" ,(-(textArrayLength-1) * 12) + 12 * i)
			} else if (self.align == 'left'){
				this.jqNodeEl.find("tspan").eq(i).attr("x" ,(-(tmp.width)))
				this.jqNodeEl.find("tspan").eq(i).attr("y" ,(p_width_height.height/2) + 12*i)
			}
			
		})
	}

	this.remove = function (){
		this.snapNode.remove()
		this.parentNode = null
		this.snapNode = null
		this.jqNodeEl = null
	}

	this.textLayout()
}

export default textNode