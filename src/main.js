import BaseNode from './components/base'
import CircleNode from './components/circle'

import LineNode from './components/line'
import {eventInit ,zoomEventInit} from './events/index'
import defs from './core/defs'
import {nodeList ,findNode ,clearAllNode ,findByCategory} from './core/nodePool'
import {getElPosition ,isEmpty,setElTransform} from './utils/index'
import A from './style/app.less'

function VTopo(opt){
	var self = this

	this.uuid = new Date().getTime()

	// 只记录circle节点
	this.nodeArray = []

	// 当前选中node
	this.selectedNodeArray = []

	// 主从关系表
	this.masterSlaveMapping = new Object()


	this.vTopoOpt = {
		components : 
		{
			circle : 
			{
				cx : 30,
				cy : 30,
				r : 15,
				strokeWidth : 1
			},
			line : 
			{
				//strokeColor : '#3d88e0',
				strokeColor : '#34667e',
				lineWidth : (opt.mode == 'view' ? 2 : 1)
			},
			text :
			{
				xMargin : 10,
				yMargin : 10,
				//textColor : "#c8e0ff"
				textColor : "#000"
			},
			inflexPoint :
			{
				cx : 0,
				cy : 0,
				r : 5
			}
		},
		config : 
		{
			imgPath : "img/"
		}
	}
	this.mode = opt.mode
	this.jqSvgEl = opt.jqSvgEl
	this.jqWrapperEl = opt.jqSvgEl.parent()
	this.jqWrapperElOffset = this.jqWrapperEl.offset()
	this.snapSvg = Snap(this.jqSvgEl[0])
	this.jqWrapperEl.addClass("vTopo")
	this.vTopoBaseNode = this.snapSvg.paper.g().attr({"id":"svg_g" ,"transform":"matrix(1 0 0 1 0 0)"})
	this.jqVTopoBaseNode = this.jqWrapperEl.find("#svg_g")
	this.pathStartEl = this.snapSvg.paper
								.path("").attr({"id" : "pathStart"})
	this.vTopoBaseNode.add(this.pathStartEl)
	this.jqGuideLineX
	this.jqGuideLineY
	this.zoomScale = 1
	this.ctrlDown = false

	this.currentHash

	clearAllNode()

	this.createBaseNode = function (){
		new BaseNode(self)
	}

	this.createCircleNode = function (opt){
		return new CircleNode(self ,opt)
	}

	// 清空所有元素
	this.clear = function (){
		let __nodeList = nodeList()
		let __circleArray = _.filter(__nodeList ,tmp =>{return tmp.type == "circle"})
		__circleArray.forEach(tmp => {
			tmp.remove()
		})
	}

	this.findNode = function (nodeId){
		return findNode(nodeId)
	}

	this.findRootNode = ()=>{
		let nodeList = findByCategory('root')
		return nodeList[0]
	}

	this.findParentNode = (node)=>{
		let parentNode
		node.relationLinkNodeIdArray.forEach(tmp =>{
			let __line = this.findNode(tmp)
			if (__line.endNode.id == node.id){
				if (__line.startNode.isLinkNode){
					parentNode = this.findParentNode(__line.startNode)
				}else{
					parentNode = __line.startNode
				}
			}
		})
		return parentNode
	}

	// 并联
	this.getParentStatus = (parentArray)=>{
		let flag = false
		parentArray.forEach(tmp => {
			if (tmp.status){
				flag = true
			}else{
				let slave = this.masterSlaveMapping[tmp.id]
				if (slave && slave.status){
					flag = true
				}
			}
		})
		return flag
	}

	this.findAllParentNodes = (node)=>{
		let parentNodeArray = []
		node.relationLinkNodeIdArray.forEach(tmp =>{
			let __line = this.findNode(tmp)
			let parentNode
			if (__line.endNode.id == node.id){
				if (__line.startNode.isLinkNode){
					parentNode = this.findParentNode(__line.startNode)
				}else{
					parentNode = __line.startNode
				}
				parentNodeArray.push(parentNode)
			}
		})
		return _.filter(parentNodeArray ,tmp=>{return tmp.category != 'contact'})
	}

	this.handleMove = (key)=>{
		if (self.selectedNodeArray.length == 0)
			return false
		self.selectedNodeArray[0].handleMove(key)
	}

	this.align = (type)=>{
		if (self.selectedNodeArray.length == 0){
			return false
		}
		let firstNode = self.selectedNodeArray[0]
		let martix = firstNode.snapBaseNode.transform().localMatrix
		self.selectedNodeArray.forEach((node)=>{
			let __martix = node.snapBaseNode.transform().localMatrix
			__martix[type] = martix[type] + (  firstNode.r - node.r)
			node.snapBaseNode.transform(__martix)
			node.relationLinkNodeIdArray.forEach(tmp =>{
				findNode(tmp).sideToSideLink()
			})
		})
	}

	this.init = ()=>{
		this.currentHash =  window.location.hash.substring(1)
		if (isEmpty(this.currentHash)){
			window.location.hash = 'ng'
			return false
		}
		self.reload()
	}

	// 加载数据
	this.loadData = function (jsonData){
		this.clear()
		setElTransform(this.jqVTopoBaseNode ,{left:0,top:0})
		// 先加载circle  再加载线
		let __data = jsonData
		let __nodeList = __data.nodeList
		let __circleArray = _.filter(__nodeList ,tmp =>{return tmp.type == "circle"})
		__circleArray.forEach(tmp => {
			new CircleNode(self ,tmp)
		})
		let __lineArray = _.filter(__nodeList ,tmp=>{return tmp.type == "line"})
		__lineArray.forEach(tmp => {
			tmp.startNode = findNode(tmp.startNodeId)
			new LineNode(self ,tmp)
		})
		setElTransform(this.jqVTopoBaseNode ,__data.transform)
		this.masterSlaveMapping = __data.masterSlaveMapping || {}
		//this.alignLayout()
		if (this.mode == 'view'){
			let rootNode = this.findRootNode()
			rootNode.activeAllLine(rootNode,rootNode)
		}
	}

	// 保存数据
	this.saveData = function (){
		let saveData = new Object()
		saveData.nodeList = []
		let __nodeList = nodeList()
		__nodeList.forEach(node => {
			saveData.nodeList.push(node.saveData())
		})
		saveData.transform = getElPosition(this.jqVTopoBaseNode)
		saveData.masterSlaveMapping = this.masterSlaveMapping
		return JSON.stringify(saveData)
	}

	this.reload = ()=>{

		let storageData = window.localStorage['vTopo_' + self.currentHash]
		if (!isEmpty(storageData)){
			self.loadData(JSON.parse(storageData))
			return false
		}

		let promise = fetch(self.currentHash + '.json').then(function(response) {
			if(response.status === 200){
				return response.json();
			}else{
				return {}
			}
		})
		
		promise = promise.then(function(data){
			window.localStorage['vTopo_' + self.currentHash] = JSON.stringify(data)
			self.loadData(data)
		}).catch(function(err){
			console.log(err);
		})
	}

	this.save = ()=>{
		var __data = this.saveData()
		window.localStorage['vTopo_' + self.currentHash] = __data
	}

	this.initTextSplit = function (){
		this.jqTextSplit = $('<div class="vTopo-text-split"></div>').appendTo(this.jqWrapperEl)
	}

	this.setViewBox = function (){
		let __width =  this.jqWrapperEl.width() * this.zoomScale
		let __height = this.jqWrapperEl.height() * this.zoomScale
		this.snapSvg.attr("viewBox" ,"0,0,"+__width+","+__height)
	}

	this.initGuideLine = function (){
		this.jqGuideLineX = $('<div class="vTopo-guideline-x"></div>').appendTo(this.jqWrapperEl)
		this.jqGuideLineY = $('<div class="vTopo-guideline-y"></div>').appendTo(this.jqWrapperEl)
	}

	this.setGuideLinePos = function (pos){
		let __jqVTopoBaseNode_pos = getElPosition(this.jqVTopoBaseNode)
		this.jqGuideLineX.css("top" ,(pos.top + __jqVTopoBaseNode_pos.top) + "px")
		this.jqGuideLineY.css("left" ,(pos.left + __jqVTopoBaseNode_pos.left) + this.jqWrapperElOffset.left + "px")
	}

	this.resetGuideLinePos = function (){
		this.jqGuideLineX && this.jqGuideLineX.css("top" ,"9999px")
		this.jqGuideLineY && this.jqGuideLineY.css("left" ,"9999px")
	}

	this.alignLayout = function (){
		let jqVTopoBaseNode_pos = getElPosition(this.jqVTopoBaseNode)
		let jqVTopoBaseNode_w_h = this.jqVTopoBaseNode[0].getBoundingClientRect()
		let jqWrapperEl_width = this.jqWrapperEl.width()
		let jqWrapperEl_height = this.jqWrapperEl.height()
		let x_array = []
		let y_array = []
		this.nodeArray.forEach(tmp =>{
			let __pos = getElPosition(tmp.jqBaseNodeEl)
			x_array.push(__pos.left)
			y_array.push(__pos.top)
		})
		let x_min = _.min(x_array)
		let y_min = _.min(y_array)
		let x_tmp = (jqWrapperEl_width-jqVTopoBaseNode_w_h.width)/2 - (jqVTopoBaseNode_pos.left + x_min)
		let y_tmp = (jqWrapperEl_height-jqVTopoBaseNode_w_h.height)/2 - (jqVTopoBaseNode_pos.top + y_min)
		setElTransform(this.jqVTopoBaseNode ,{
			left : jqVTopoBaseNode_pos.left + x_tmp,
			top : jqVTopoBaseNode_pos.top + y_tmp,
		})
	}
	eventInit(self)
	if (this.mode != "view")
		this.initGuideLine()
	else
		this.setViewBox(),zoomEventInit(self)
	defs.init(self)
	this.initTextSplit()
	
}

export default VTopo