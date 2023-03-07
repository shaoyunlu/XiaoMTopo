import { getElPosition ,getEventOffSetX ,getEventOffSetY} from "../utils/index"
import { dialogInput } from "../utils/dialog"

export function rightClickInit(node ,vTopo ,opt)
{
	if (vTopo.mode == "view")
		return false
	let target_el = (node.jqBaseNodeEl || node.jqNodeEl)
	opt = opt || {}
	target_el.bind("contextmenu", function (e) {
	    e.preventDefault();
	    return false;
    });

	target_el.bind("mousedown" ,function (e){
		if (e.which != 3)
			return false
		__contentMenuShow(node ,vTopo ,e ,opt ,target_el)
		e.stopPropagation()
	})
}

var nodeContextMenuStr = `<div class="vtopo-context-menu">
						<ul>
							<li data-oper="drawLine">绘制连线</li>
							<li data-oper="drawNodeText">添加文字</li>
							<li data-oper="deleteNode">删除元素</li>
						</ul>
					</div>`
var lineContextMenuStr = `<div class="vtopo-context-menu">
						<ul>
							<li data-oper="addTextInLine">添加文字</li>
							<li data-oper="deleteLine">删除连线</li>
						</ul>
					</div>`
var inflexNodeContextMenuStr = `<div class="vtopo-context-menu">
						<ul>
							<li data-oper="deleteInflexNode">删除元素</li>
						</ul>
					</div>`


function __contentMenuShow(node ,vTopo ,e ,opt ,target_el)
{
	$(".vtopo-context-menu").remove()
	var pos = getElPosition(target_el)
	var __el
	if (node.type == "circle")
		__el = $(nodeContextMenuStr)
	else if(node.type == "line")
		__el = $(lineContextMenuStr)
	else if(node.type == "inflexPoint")
		__el = $(inflexNodeContextMenuStr)

	let eventOffSetX = getEventOffSetX(e ,vTopo) + vTopo.jqWrapperElOffset.left
	let eventOffSetY = getEventOffSetY(e ,vTopo)

	__el.css("left" ,eventOffSetX + 'px')
	__el.css("top" ,eventOffSetY + 'px')
	vTopo.jqWrapperEl.append(__el)
	__el.bind('click' ,function (e){
		e.preventDefault();
	    return false;
	})
	__el.find("[data-oper]").click(function (e){
		e.stopPropagation()
		let __oper = $(this).attr("data-oper")
		if ( __oper == "deleteNode")
			node.remove()
		else if ( __oper == "drawNodeText")
			dialogInput({
				pos : {left : eventOffSetX + 15 + 'px' ,"top" : eventOffSetY + 15 + 'px'},
				enterCbf : function (textArray){
					opt.createTextNode({parentNode:node ,vTopo:vTopo ,textArray:textArray})
				}
			} ,vTopo)
		else if ( __oper == "setImage")
			dialogInput({
				pos : {left : eventOffSetX + 15 + 'px' ,"top" : eventOffSetY + 15 + 'px'},
				enterCbf : function (textArray){
					node.setImg(textArray[0].text + '.png')
				}
			} ,vTopo)
		else if ( __oper == "deleteLine")
			node.remove()
		else if (__oper == "drawLine")
			opt.createLineNode({startNode:node ,vTopo:vTopo})
		else if (__oper == "deleteInflexNode")
			node.remove()
		$(".vtopo-context-menu").remove()
	})
}