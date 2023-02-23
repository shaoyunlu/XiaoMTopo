import BaseNode from './base'
import LineNode from './line'
import TextNode from './text'
import {removeNode ,findNode} from '../core/nodePool'
import {rightClickInit} from '../events/click'
import {getElPosition,getEventOffSetX ,getEventOffSetY ,splitText} from '../utils/index'

/** 
	opt : id
	      img     xxx.png
	      textArray
	      transform
*/

function CircleNode(vTopo ,opt){
	var self = this
	this.type = 'circle'
	this.isLinkNode = opt.isLinkNode || false

	this.cx = vTopo.vTopoOpt.components.circle.cx
	this.cy = vTopo.vTopoOpt.components.circle.cy
	this.r = opt.r || vTopo.vTopoOpt.components.circle.r

	// 关联的LineNodeArray
	this.relationLinkNodeIdArray = []

	this.textArray = []

	this.img = opt.img

	this.textNode

	this.snapBaseNodeCreate(vTopo ,opt)

	let __jqVTopoBaseNode_pos = getElPosition(vTopo.jqVTopoBaseNode)

	this.snapNode = vTopo.snapSvg.paper.circle(
							this.cx,
							this.cy,
							this.r)
						.attr({
								"id" : 'c_' + this.id,
								"data-type" : "circle",
								"fill" : 'none'
							  })

	this.snapBaseNode.add(this.snapNode)
	this.snapBaseNode.attr("transform" , "matrix(1,0,0,1,"+(0-__jqVTopoBaseNode_pos.left + 900)+","+(0-__jqVTopoBaseNode_pos.top + 500)+")")
	this.snapBaseNode.attr('id' ,'g_' + this.id)
	this.jqBaseNodeEl = $("#" + 'g_' + this.id)
	this.jqNodeEl = $("#" + 'c_' + this.id)

	this.snapImgNode = vTopo.snapSvg.paper.image("", 0, 0, this.r*2, this.r*2)
	this.snapShadowImgNode = vTopo.snapSvg.paper.image("", 0, 0, this.r*2, this.r*2)
												.attr("opacity" ,1)

	this.snapBaseNode.add(this.snapImgNode)
	this.snapBaseNode.add(this.snapShadowImgNode)

	this.status

	this.removeCbf

	this.getPosRange = function (){
		var pos = getElPosition(this.jqBaseNodeEl)
		return {
			x_range : [pos.left ,pos.left+this.r*2],
			y_range : [pos.top ,pos.top+this.r*2]
		}
	}

	this.getCenterPosition = function (){
		let offset = this.r
		var __attr = this.jqBaseNodeEl.attr("transform")
		if (!__attr)
			return {left:(0 + offset) ,top : (0 + offset)}
		var __array = __attr.replace(")" ,"").split(",")
		return {left:(parseInt(__array[4]) + offset) ,top : (parseInt(__array[5]) + offset)}
	}

	this.getNodeWidthHeight = function (){
		return {width:this.r*2,height:this.r*2}
	}

	this.updataRelationLinkNode = function (id){
		this.relationLinkNodeIdArray = _.filter(this.relationLinkNodeIdArray ,(tmp)=>{
			return tmp != id
		})
	}

	this.setImg = function (imgPath){
		this.snapImgNode.attr("xlink:href" ,vTopo.vTopoOpt.config.imgPath+imgPath)
		this.img = imgPath
	}

	this.setStatusImg = function (statusImgPath){
		this.snapShadowImgNode.attr("xlink:href" ,vTopo.vTopoOpt.config.imgPath+statusImgPath)
		//this.snapShadowImgNode.attr("class" ,"vTopo-breath-light")
	}

	this.remove = function (){
		this.removeCbf && this.removeCbf(this.id)
		removeNode(this.id)
		vTopo.nodeArray = _.filter(vTopo.nodeArray ,tmp =>{
			return tmp.id != this.id
		})
		this.jqBaseNodeEl.remove()
		/** 相关联的连线也需要删除 */
		self.relationLinkNodeIdArray.forEach(tmp =>{
			findNode(tmp).remove()
		})
		this.jqBaseNodeEl.unbind('mousedown')
		vTopo.jqWrapperEl.unbind('mousemove.drag')
		vTopo.jqWrapperEl.unbind('mouseup.drag')

		this.snapBaseNode.undrag()

		if (this.textNode)
			this.textNode.remove()
		this.snapImgNode.remove()
		this.snapShadowImgNode.remove()
		this.snapImgNode = null
		this.snapShadowImgNode = null
		this.baseRemove()
	}

	this.loadData = function (opt){
		this.setImg(opt.img)
		if (opt.transform)
			this.jqBaseNodeEl.attr("transform" ,opt.transform)
		if (opt.textArray && opt.textArray.length > 0)
			new TextNode({parentNode:self ,vTopo:vTopo ,textArray:opt.textArray}),this.textArray = opt.textArray
		if (opt.textStr)
			self.textArray = splitText(opt.textStr ,vTopo),
			new TextNode({parentNode:self ,vTopo:vTopo ,textArray:self.textArray})
	}

	vTopo.nodeArray.push(this)

	if (vTopo.mode != "view")
		this.snapBaseNode.drag()

	this.loadData(opt)

	var mousemove_throttle = _.throttle(function (e){
		vTopo.setGuideLinePos(self.getCenterPosition())
		e.stopPropagation()

		self.relationLinkNodeIdArray.forEach(tmp =>{
			findNode(tmp).sideToSideLink()
		})
	}, 50);

	if (vTopo.mode != "view")
	{
		this.jqBaseNodeEl.bind('mousedown' ,function (e){
			e.stopPropagation()
			vTopo.jqWrapperEl.bind('mousemove.drag' ,mousemove_throttle)

			vTopo.jqWrapperEl.bind('mouseup.drag' ,function (){
				vTopo.jqWrapperEl.unbind('mousemove.drag')
				vTopo.jqWrapperEl.unbind('mouseup.drag')
				vTopo.resetGuideLinePos()
			})
		})
	}else{
		if (self.isLinkNode){
			setTimeout(() => {
				self.jqBaseNodeEl.css('opacity' ,0)
			}, 10);
		}
	}

	rightClickInit(this ,vTopo ,{
		createLineNode : function (opt){
			// {startNode:node ,vTopo:vTopo}
			new LineNode(vTopo ,opt)
		},
		createTextNode : function (opt){
			// {parentNode:node ,vTopo:vTopo ,textArray:textArray}
			$("#t_" + self.id).remove()
			this.textNode = new TextNode(opt)
			self.textArray = opt.textArray
		}
	})

	// 左键点击事件
	this.jqBaseNodeEl.click((e)=>{
		// 如果是单点
		if (!vTopo.ctrlDown){
			vTopo.selectedNodeArray.forEach(node =>{
				node.removeSelected()
			})
			vTopo.selectedNodeArray[0] = self
		}else{
			// ctrl + 鼠标点击
			vTopo.selectedNodeArray.push(self)
		}
		self.selected()
		e.stopPropagation()
	})


	// 移动
	this.handleMove = (key)=>{
		let martix = self.snapBaseNode.transform().localMatrix
		switch (key) {
			case 'ArrowLeft':
				martix.e = martix.e - 1
				break;
			case 'ArrowRight':
				martix.e = martix.e + 1
				break;
			case 'ArrowUp':
				martix.f = martix.f - 1
				break;
			case 'ArrowDown':
				martix.f = martix.f + 1
				break;
			default:
				break;
		}
		self.snapBaseNode.transform(martix)
		vTopo.setGuideLinePos(self.getCenterPosition())
		self.relationLinkNodeIdArray.forEach(tmp =>{
			findNode(tmp).sideToSideLink()
		})
	}

	// 选中
	this.selected = ()=>{
		self.snapShadowImgNode.attr('href' ,'img/selected.png')
	}

	// 取消选中
	this.removeSelected = ()=>{
		self.snapShadowImgNode.attr('href' ,'')
	}

	this.setText = function (textStr){
		$("#t_" + self.id).remove()
		let __textArray = splitText(textStr ,vTopo)
		this.textNode = new TextNode({parentNode:self ,vTopo:vTopo ,textArray:__textArray})
		self.textArray = __textArray
	}

	this.saveData = function (){
		let saveData = {}
		saveData.type = "circle"
		saveData.r = this.r
		saveData.id = this.id
		saveData.transform = this.jqBaseNodeEl.attr("transform")
		saveData.img = this.img
		saveData.textArray = this.textArray
		saveData.status = this.status
		saveData.isLinkNode = this.isLinkNode
		return saveData
	}
}

CircleNode.prototype = new BaseNode()

export default CircleNode