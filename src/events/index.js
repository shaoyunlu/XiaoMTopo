import {getElPosition ,setElTransform} from '../utils/index'
import {dialogSelect} from '../utils/dialog'

export function eventInit(vTopo)
{
	// 屏蔽默认右键事件
	vTopo.jqWrapperEl.bind("contextmenu", function (e) {
	    e.preventDefault();
	    return false;
    });

    // 鼠标左键点击事件
    vTopo.jqWrapperEl.bind('click' ,function (e){
    	// 清除菜单
    	$(".vtopo-context-menu").remove()
        // 清除dialog
        $(".vTopo-dialog").remove()
        vTopo.resetGuideLinePos()
        if (e.target.id == 'svg'){
            //取消选中的节点
            vTopo.selectedNodeArray.forEach(node =>{
                node && node.removeSelected()
            })
            vTopo.selectedNodeArray = []
        }
        
    })


    // 鼠标滑动拖拽事件
    var mousemove_x
    var mousemove_y
    var mousemove_ori_pos
    var mousemove_throttle = _.throttle(function (e){
        e.stopPropagation()
        setElTransform(vTopo.jqVTopoBaseNode ,{left:(mousemove_ori_pos.left + (e.clientX-mousemove_x)*vTopo.zoomScale ),
                                               top:(mousemove_ori_pos.top + (e.clientY-mousemove_y)*vTopo.zoomScale )
                                               })
    }, 10);

    $(window).bind('mousedown.vTopo' ,function (e){
        mousemove_x = e.clientX
        mousemove_y = e.clientY
        mousemove_ori_pos = getElPosition(vTopo.jqVTopoBaseNode)
        $(window).bind('mousemove.vTopo' ,mousemove_throttle)
        $(window).bind('mouseup' ,function (){
            mousemove_ori_pos = getElPosition(vTopo.jqVTopoBaseNode)
            $(window).unbind('mousemove')
            $(window).unbind('mouseup')
        })
    })

    document.addEventListener('keydown' ,(e)=>{
        
        if (e.key == 'Control'){
            vTopo.ctrlDown = true
        }else if (e.key == 'ArrowLeft' || e.key == 'ArrowRight'
                    || e.key == 'ArrowUp' || e.key == 'ArrowDown'){
            vTopo.handleMove(e.key)
        }else if (e.code == 'KeyF' && e.ctrlKey){
            e.preventDefault()
            dialogSelect({})
        }
    })

    document.addEventListener('keyup' ,()=>{
        vTopo.ctrlDown = false
    })

    window.addEventListener('hashchange' ,()=>{
        vTopo.currentHash = window.location.hash.substring(1)
        vTopo.reload()
    })
}


export function zoomEventInit(vTopo){
    let __windowSizeChange = _.debounce(function (){
        vTopo.setViewBox()
        //vTopo.alignLayout()
    } ,100)
    $(window).resize(__windowSizeChange)

    let __zoomEvent = _.throttle((e)=>{
        e.preventDefault();
        var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
                    (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));              // firefox

        if (delta > 0)
            // 向上滚，缩小
            vTopo.zoomScale = vTopo.zoomScale - 0.1
        else if (delta < 0)
            // 向下滚，放大
            vTopo.zoomScale = vTopo.zoomScale + 0.1
        vTopo.setViewBox()
    } ,50)

    vTopo.jqWrapperEl.on("mousewheel DOMMouseScroll", __zoomEvent);
}