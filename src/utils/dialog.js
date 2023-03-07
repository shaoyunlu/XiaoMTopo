import {splitText} from './index'

export function dialogInput(opt ,vTopo){
	let pos = opt.pos
	let dialogEl = $(`<div class="vTopo-dialog">
						<input />
						<span style="cursor:pointer">提交</span>
					</div>`)
	$('body').append(dialogEl)

	// 禁止事件穿透
	dialogEl[0].addEventListener('mousemove' ,(e)=>{
		e.stopPropagation()
	})

	dialogEl.css({"left":pos.left ,"top":pos.top})
	dialogEl.find("span").click(function (){
		var str_array = splitText(dialogEl.find("input").val() ,vTopo)
		opt.enterCbf(str_array)
		dialogEl.remove()
	})
}

export function dialogSelect(opt ,vTopo){
	let listStr =  `<li data-val='ng'><div>南工变电所</div><span>展示</span><p>编辑</p></li>
					<li data-val='db'><div>东帮变电所</div><span>展示</span><p>编辑</p></li>
					<li data-val='zn'><div>珠南变电所</div><span>展示</span><p>编辑</p></li>
				   `
	let dialogEl = $(`<div class="vTopo-dialog vTopo-dialog-select">
						<ul>${listStr}</ul>
					  </div>`)
	$('body').append(dialogEl)
	// 禁止事件穿透
	dialogEl[0].addEventListener('mousemove' ,(e)=>{
		e.stopPropagation()
	})
	let dialogElWidth = dialogEl.width()
	let dialogElHeight = dialogEl.height()
	dialogEl.css({"left":'50%' ,"top":'50%' ,'transform':`translate(-${dialogElWidth}px,-${dialogElHeight}px)`})
	//dialogEl.css('trasform' ,`translate(${dialogElWidth}px,${dialogElHeight}px)`)
	dialogEl.find('span').click(function (){
		let dataVal = $(this).parent().attr('data-val')
		window.location.href = '/show.html#' + dataVal
		dialogEl.remove()
	})

	dialogEl.find('p').click(function (){
		let dataVal = $(this).parent().attr('data-val')
		window.location.href = '/edit.html#' + dataVal
		dialogEl.remove()
	})
}