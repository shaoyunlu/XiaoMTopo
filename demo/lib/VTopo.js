(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.VTopo = factory());
}(this, (function () { 'use strict';

	/** 
		节点池     节点管理中心
	*/

	var nodePool = [];
	function registerNode(node) {
	  nodePool.push(node);
	}
	function removeNode(id) {
	  nodePool = _.filter(nodePool, function (tmp) {
	    return tmp.id != id;
	  });
	}
	function findNode(id) {
	  return _.find(nodePool, function (tmp) {
	    return tmp.id == id;
	  });
	}
	function nodeList() {
	  return nodePool;
	}
	function clearAllNode() {
	  nodePool = [];
	}

	function BaseNode(vTopo, opt) {

	  /** 节点唯一标识 */
	  this.id;

	  /** 节点类型       circle,line等*/
	  this.type;
	  this.snapBaseNode;
	  this.snapNode;
	  this.jqBaseNodeEl;
	  this.jqNodeEl;
	  this.snapBaseNodeCreate = function (vTopo, __opt) {
	    this.snapBaseNode = vTopo.snapSvg.paper.g();
	    vTopo.vTopoBaseNode.add(this.snapBaseNode);
	    this.id = __opt.id || vTopo.uuid++;
	    registerNode(this);
	  };
	  this.baseRemove = function () {
	    this.snapBaseNode.remove();
	    this.snapNode.remove();
	    this.snapBaseNode = null;
	    this.snapNode = null;
	    this.jqBaseNodeEl = null;
	    this.jqNodeEl = null;
	  };
	}

	function _typeof(obj) {
	  "@babel/helpers - typeof";

	  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
	    return typeof obj;
	  } : function (obj) {
	    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	  }, _typeof(obj);
	}

	function getElPosition(jqEl) {
	  var __attr = jqEl.attr("transform");
	  if (!__attr) return {
	    left: 0,
	    top: 0
	  };
	  var __array = __attr.replace(")", "").split(",");
	  return {
	    left: parseInt(__array[4]),
	    top: parseInt(__array[5])
	  };
	}
	function setElTransform(jqEl, pos) {
	  jqEl.attr("transform", "matrix(1,0,0,1," + pos.left + "," + pos.top + ")");
	}
	function getLinePathWithOutStart(jqEl) {
	  var array_d = jqEl.attr("d").split(" ");
	  array_d = array_d.slice(3);
	  return array_d.join(" ");
	}
	function getLinePathWithoutEnd(jqEl) {
	  var array_d = jqEl.attr("d").split(" ");
	  var array_d_length = array_d.length;
	  array_d = array_d.slice(0, array_d_length - 3);
	  return array_d.join(" ");
	}
	function lineIsInNode(jqEl, vTopo) {
	  var pos = __getLineEndNodePosition(jqEl);
	  var endNode = null;
	  for (var i = 0; i < vTopo.nodeArray.length; i++) {
	    var __pos = vTopo.nodeArray[i].getPosRange();
	    if (pos.left > __pos.x_range[0] && pos.left < __pos.x_range[1] && pos.top > __pos.y_range[0] && pos.top < __pos.y_range[1]) {
	      endNode = vTopo.nodeArray[i];
	      break;
	    }
	  }
	  return endNode;
	}

	// 获取坐标在哪个区间
	function getSpaceIndexFromLine(dstX, dstY, lineNode) {
	  dstX = Math.abs(dstX);
	  dstY = Math.abs(dstY);
	  var __path = lineNode.snapNode.attr("d").split(" ");
	  var range = __path.length / 3 - 1;
	  var res = -1;
	  for (var i = 0; i < range; i++) {
	    if ((dstX >= Math.abs(__path[i * 3 + 1]) && dstX <= Math.abs(__path[i * 3 + 4]) || dstX <= Math.abs(__path[i * 3 + 1]) && dstX >= Math.abs(__path[i * 3 + 4])) && (dstY >= Math.abs(__path[i * 3 + 2]) && dstY <= Math.abs(__path[i * 3 + 5]) || dstY <= Math.abs(__path[i * 3 + 2]) && dstY >= Math.abs(__path[i * 3 + 5]))) {
	      res = i;
	      break;
	    }
	  }
	  return res;
	}
	function splitText(textStr, vTopo) {
	  var textArray = [];
	  var res = [];
	  var start_pos = 0;
	  var digit = 1;
	  var count = 0;
	  for (var i = 0; i < textStr.length; i++) {
	    if (textStr.charCodeAt(i) > 127 || textStr.charCodeAt(i) == 94) count += 2;else count++;
	    if (count == 110 || count == 120) res.push(textStr.substr(start_pos, digit)), count = 0, digit = 1, start_pos = i + 1;else digit++;
	  }
	  var res_str = res.join("");
	  if (res_str.length != textStr.length) res.push(textStr.substr(res_str.length));
	  res.forEach(function (tmp) {
	    var __t = $('<span>' + tmp + '</span>').appendTo(vTopo.jqTextSplit);
	    textArray.push({
	      text: tmp,
	      width: __t.width()
	    });
	  });
	  return textArray;
	}
	function getEventOffSetX(e, vTopo) {
	  return e.pageX - vTopo.jqWrapperElOffset.left;
	}
	function getEventOffSetY(e, vTopo) {
	  return e.pageY - vTopo.jqWrapperElOffset.top;
	}
	function getLineEndNodePosition(jqEl) {
	  var array_d = jqEl.attr("d").split(" ");
	  var __attr = jqEl.attr("transform");
	  var __array = __attr.replace(")", "").split(",");
	  return {
	    left: parseInt(__array[4]) + parseInt(array_d[4]),
	    top: parseInt(__array[5]) + parseInt(array_d[5])
	  };
	}
	function isEmpty(obj) {
	  if (obj == undefined) {
	    return true;
	  } else if (typeof obj == "string") {
	    return !obj;
	  } else if (_typeof(obj) == "object") {
	    if (obj instanceof Array) return obj.length == 0;else return !obj;
	  }
	}
	function __getLineEndNodePosition(jqEl) {
	  var array_d = jqEl.attr("d").split(" ");
	  var __attr = jqEl.attr("transform");
	  var __array = __attr.replace(")", "").split(",");
	  return {
	    left: parseInt(__array[4]) + parseInt(array_d[4]),
	    top: parseInt(__array[5]) + parseInt(array_d[5])
	  };
	}

	function dialogInput(opt, vTopo) {
	  var pos = opt.pos;
	  var dialogEl = $("<div class=\"vTopo-dialog\">\n\t\t\t\t\t\t<input />\n\t\t\t\t\t\t<span style=\"cursor:pointer\">\u63D0\u4EA4</span>\n\t\t\t\t\t</div>");
	  $('body').append(dialogEl);
	  dialogEl.css({
	    "left": pos.left,
	    "top": pos.top
	  });
	  dialogEl.find("span").click(function () {
	    var str_array = splitText(dialogEl.find("input").val(), vTopo);
	    opt.enterCbf(str_array);
	    dialogEl.remove();
	  });
	}

	function rightClickInit(node, vTopo, opt) {
	  if (vTopo.mode == "view") return false;
	  var target_el = node.jqBaseNodeEl || node.jqNodeEl;
	  opt = opt || {};
	  target_el.bind("contextmenu", function (e) {
	    e.preventDefault();
	    return false;
	  });
	  target_el.bind("mousedown", function (e) {
	    if (e.which != 3) return false;
	    __contentMenuShow(node, vTopo, e, opt, target_el);
	    e.stopPropagation();
	  });
	}
	var nodeContextMenuStr = "<div class=\"vtopo-context-menu\">\n\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t<li data-oper=\"drawLine\">\u7ED8\u5236\u8FDE\u7EBF</li>\n\t\t\t\t\t\t\t<li data-oper=\"setImage\">\u8BBE\u7F6E\u56FE\u7247</li>\n\t\t\t\t\t\t\t<li data-oper=\"drawNodeText\">\u6DFB\u52A0\u6587\u5B57</li>\n\t\t\t\t\t\t\t<li data-oper=\"deleteNode\">\u5220\u9664\u5143\u7D20</li>\n\t\t\t\t\t\t</ul>\n\t\t\t\t\t</div>";
	var lineContextMenuStr = "<div class=\"vtopo-context-menu\">\n\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t<li data-oper=\"addTextInLine\">\u6DFB\u52A0\u6587\u5B57</li>\n\t\t\t\t\t\t\t<li data-oper=\"deleteLine\">\u5220\u9664\u8FDE\u7EBF</li>\n\t\t\t\t\t\t</ul>\n\t\t\t\t\t</div>";
	var inflexNodeContextMenuStr = "<div class=\"vtopo-context-menu\">\n\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t<li data-oper=\"deleteInflexNode\">\u5220\u9664\u5143\u7D20</li>\n\t\t\t\t\t\t</ul>\n\t\t\t\t\t</div>";
	function __contentMenuShow(node, vTopo, e, opt, target_el) {
	  $(".vtopo-context-menu").remove();
	  var pos = getElPosition(target_el);
	  var __el;
	  if (node.type == "circle") __el = $(nodeContextMenuStr);else if (node.type == "line") __el = $(lineContextMenuStr);else if (node.type == "inflexPoint") __el = $(inflexNodeContextMenuStr);
	  __el.css("left", getEventOffSetX(e, vTopo) + vTopo.jqWrapperElOffset.left + "px");
	  __el.css("top", getEventOffSetY(e, vTopo) + "px");
	  vTopo.jqWrapperEl.append(__el);
	  __el.bind('click', function (e) {
	    e.preventDefault();
	    return false;
	  });
	  __el.find("[data-oper]").click(function (e) {
	    e.stopPropagation();
	    var __oper = $(this).attr("data-oper");
	    if (__oper == "deleteNode") node.remove();else if (__oper == "drawNodeText") dialogInput({
	      pos: {
	        left: getEventOffSetX(e, vTopo) + "px",
	        "top": getEventOffSetY(e, vTopo) + "px"
	      },
	      enterCbf: function enterCbf(textArray) {
	        opt.createTextNode({
	          parentNode: node,
	          vTopo: vTopo,
	          textArray: textArray
	        });
	      }
	    }, vTopo);else if (__oper == "setImage") dialogInput({
	      pos: {
	        left: getEventOffSetX(e, vTopo) + "px",
	        "top": getEventOffSetY(e, vTopo) + "px"
	      },
	      enterCbf: function enterCbf(textArray) {
	        node.setImg(textArray[0].text + '.png');
	      }
	    }, vTopo);else if (__oper == "deleteLine") node.remove();else if (__oper == "drawLine") opt.createLineNode({
	      startNode: node,
	      vTopo: vTopo
	    });else if (__oper == "deleteInflexNode") node.remove();
	    $(".vtopo-context-menu").remove();
	  });
	}

	function inflexPoint(opt) {
	  var self = this;
	  var vTopo = opt.vTopo;
	  var parentNode = findNode(opt.parentNodeId);
	  this.type = "inflexPoint";
	  this.range = opt.range;
	  this.cx = vTopo.vTopoOpt.components.inflexPoint.cx;
	  this.cy = vTopo.vTopoOpt.components.inflexPoint.cy;
	  this.r = vTopo.vTopoOpt.components.inflexPoint.r;
	  var node_id = opt.id || 'i_' + vTopo.uuid++;
	  this.node_id = node_id;
	  this.snapNode = vTopo.snapSvg.paper.circle(this.cx, this.cy, this.r).attr({
	    "id": node_id,
	    "data-type": "inflexPoint",
	    "fill-opacity": 0.9,
	    "fill": "#3d88e0",
	    "transform": "matrix(1,0,0,1,0,0)"
	  });
	  this.jqNodeEl = $("#" + node_id);
	  this.jqNodeEl.css("cursor", "pointer");
	  var vTopoBaseNode_pos = getElPosition(vTopo.jqVTopoBaseNode);
	  setElTransform(this.jqNodeEl, {
	    left: opt.pos.left - vTopoBaseNode_pos.left,
	    top: opt.pos.top - vTopoBaseNode_pos.top
	  });
	  this.snapNode.drag();
	  parentNode.snapBaseNode.add(this.snapNode);
	  var mousemove_throttle = _.throttle(function (e) {
	    e.stopPropagation();
	    parentNode.chageInflexPoint(self);
	    vTopo.setGuideLinePos(getElPosition(self.jqNodeEl));
	  }, 50);
	  this.jqNodeEl.bind('mousedown', function (e) {
	    e.stopPropagation();
	    vTopo.jqWrapperEl.bind('mousemove.drag', mousemove_throttle);
	    vTopo.jqWrapperEl.bind('mouseup.drag', function () {
	      vTopo.jqWrapperEl.unbind('mousemove.drag');
	      vTopo.jqWrapperEl.unbind('mouseup.drag');
	      vTopo.resetGuideLinePos();
	    });
	  });
	  this.getCenterPosition = function () {
	    var offset = this.r;
	    var __attr = this.jqNodeEl.attr("transform");
	    if (!__attr) return {
	      left: 0 + offset,
	      top: 0 + offset
	    };
	    var __array = __attr.replace(")", "").split(",");
	    return {
	      left: parseInt(__array[4]) + offset,
	      top: parseInt(__array[5]) + offset
	    };
	  };
	  this.remove = function () {
	    var ori_array = parentNode.jqNodeEl.attr("d").split(" ");
	    var res_array = ori_array.slice(0, (this.range + 1) * 3).concat(ori_array.slice((this.range + 1) * 3 + 3));
	    parentNode.jqNodeEl.attr("d", res_array.join(" "));
	    this.jqNodeEl.remove();
	    vTopo.jqWrapperEl.unbind('mousemove.drag');
	    vTopo.jqWrapperEl.unbind('mouseup.drag');
	    parentNode.removeInflexPoint(this.range);
	    parentNode = null;
	  };
	  this.exception_remove = function () {
	    this.jqNodeEl.remove();
	    vTopo.jqWrapperEl.unbind('mousemove.drag');
	    vTopo.jqWrapperEl.unbind('mouseup.drag');
	    parentNode = null;
	  };
	  rightClickInit(this, vTopo);
	  if (vTopo.mode == 'view') {
	    this.jqNodeEl.css('opacity', 0);
	  }
	}

	/** */

	function LineNode(vTopo, opt) {
	  var self = this;
	  this.type = 'line';
	  this.startNode = opt.startNode;
	  this.endNode;
	  this.inflexPointArray = [];
	  this.inflexPointIndex = [];
	  this.pos = {
	    startX: 0,
	    startY: 0,
	    endX: 0,
	    endY: 0
	  };
	  this.snapBaseNodeCreate(vTopo, opt);
	  var start_node_pos = this.startNode.getCenterPosition();
	  this.snapNode = vTopo.snapSvg.paper.path("M 0 0 L 0 0").attr({
	    "stroke": vTopo.vTopoOpt.components.line.strokeColor,
	    "strokeWidth": vTopo.vTopoOpt.components.line.lineWidth,
	    "fill": "none",
	    "id": "l_" + this.id,
	    "data-type": "line",
	    "transform": "matrix(1,0,0,1," + start_node_pos.left + "," + start_node_pos.top + ")"
	  });
	  this.snapBaseNode.add(this.snapNode);
	  this.snapBaseNode.attr('id', 'g_' + this.id);
	  this.jqBaseNodeEl = $("#" + 'g_' + this.id);
	  this.jqNodeEl = $("#" + 'l_' + this.id);
	  this.snapBaseNode.insertAfter(vTopo.pathStartEl);

	  //this.jqNodeEl.css("marker-start" ,"url('#startArrow')")
	  //this.jqNodeEl.css("marker-end" ,"url('#endArrow')")

	  var throttled;
	  this.__lineMousemoveEventInit = function () {
	    var array_d = self.jqNodeEl.attr("d").split(" ");
	    var array_transform = self.jqNodeEl.attr("transform").replace(")", "").split(",");
	    var svg_g_pos = getElPosition(vTopo.jqVTopoBaseNode);
	    throttled = _.throttle(function (e) {
	      self.jqNodeEl.attr("d", "M 0 0 L " + (0 - svg_g_pos.left + getEventOffSetX(e, vTopo) + parseInt(array_d[4]) - parseInt(array_transform[4])) + " " + (0 - svg_g_pos.top + getEventOffSetY(e, vTopo) + parseInt(array_d[5]) - parseInt(array_transform[5])));
	    }, 50);
	    vTopo.jqWrapperEl.bind('mousemove', throttled);
	    setTimeout(function () {
	      vTopo.jqWrapperEl.bind('click.drag', function (e) {
	        vTopo.jqWrapperEl.unbind('.line');
	        e.stopPropagation();
	        vTopo.jqWrapperEl.unbind('mousemove');
	        vTopo.jqWrapperEl.unbind('click.drag');
	        var endNode;
	        if (!(endNode = lineIsInNode(self.jqNodeEl, vTopo))) {
	          //self.remove()
	          var pos = getLineEndNodePosition(self.jqNodeEl);
	          self.endNode = vTopo.createCircleNode({
	            img: "linknode.png",
	            isLinkNode: true,
	            r: 7
	          });
	          var __martix = self.endNode.snapBaseNode.transform().localMatrix;
	          __martix.e = pos.left - 10;
	          __martix.f = pos.top - 10;
	          self.endNode.snapBaseNode.transform(__martix);
	        } else {
	          self.endNode = endNode;
	        }
	        self.startNode.relationLinkNodeIdArray.push(self.id);
	        self.endNode.relationLinkNodeIdArray.push(self.id);
	        self.sideToSideLink();
	        self.__lineMouseoverEventInit();
	        // 连线之后，进行右键菜单初始化
	        rightClickInit(self, vTopo);
	      });
	      vTopo.jqWrapperEl.bind("contextmenu.line", function (e) {
	        self.remove();
	        vTopo.jqWrapperEl.unbind('.line');
	      });
	    }, 200);
	  };
	  this.__lineMouseoverEventInit = function () {
	    if (vTopo.mode == "view") return false;
	    this.snapNode.mouseover(function () {
	      self.snapNode.attr("strokeWidth", 10);
	      self.jqNodeEl.css("cursor", "pointer");
	      self.snapNode.click(function (e) {
	        var __inflexNode = new inflexPoint({
	          vTopo: vTopo,
	          parentNodeId: self.id,
	          pos: {
	            left: getEventOffSetX(e, vTopo),
	            top: getEventOffSetY(e, vTopo)
	          }
	        });
	        self.inflexPointArray.push(__inflexNode);
	        var __range = self.insertInflexPoint(__inflexNode);
	        __inflexNode.range = __range;
	        if (__range < 0) {
	          __inflexNode.exception_remove();
	          self.inflexPointArray = _.filter(self.inflexPointArray, function (tmp) {
	            return tmp.range != -1;
	          });
	        }
	      });
	    }).mouseout(function () {
	      self.snapNode.attr("strokeWidth", vTopo.vTopoOpt.components.line.lineWidth);
	      self.jqNodeEl.css("cursor", "default");
	      self.snapNode.unclick();
	    });
	  };
	  this.sideToSideLink = function () {
	    var _this = this;
	    // 找到range最大的折点
	    var __startNode;
	    if (this.inflexPointIndex.length == 0) __startNode = self.startNode;else __startNode = _.find(this.inflexPointArray, function (tmp) {
	      return tmp.range == _.max(_this.inflexPointIndex);
	    });
	    self.updateEndNodePosition(self.endNode.getCenterPosition(), self.adjustNodePosition(__startNode, self.endNode));
	    // 找到range为0的折点
	    var __endNode;
	    if (this.inflexPointIndex.length == 0) __endNode = self.endNode;else __endNode = _.find(this.inflexPointArray, function (tmp) {
	      return tmp.range == 0;
	    });
	    self.updateStartNodePosition(self.startNode, self.adjustNodePosition(__endNode, self.startNode));
	  };
	  this.adjustNodePosition = function (condition_node, answer_node) {
	    var offset_obj = {
	      left: 0,
	      top: 0
	    };
	    var condition_node_pos = condition_node.getCenterPosition();
	    var answer_node_pos = answer_node.getCenterPosition();

	    // 两条横边长度
	    var x_side = Math.abs(answer_node_pos.left - condition_node_pos.left);
	    var y_side = Math.abs(answer_node_pos.top - condition_node_pos.top);
	    // 斜边长度
	    var hypo_side = Math.sqrt(x_side * x_side + y_side * y_side);

	    // 计算偏移量
	    var x_offset = Math.round(answer_node.r / hypo_side * x_side);
	    var y_offset = Math.round(answer_node.r / hypo_side * y_side);
	    answer_node_pos.left > condition_node_pos.left ? offset_obj.left = offset_obj.left - x_offset : offset_obj.left = offset_obj.left + x_offset;
	    answer_node_pos.top > condition_node_pos.top ? offset_obj.top = offset_obj.top - y_offset : offset_obj.top = offset_obj.top + y_offset;
	    //return offset_obj
	    return {
	      left: 0,
	      top: 0
	    };
	  };
	  this.updateStartNodePosition = function (startNode, offset_obj) {
	    var array_d = self.jqNodeEl.attr("d").split(" ");
	    var array_d_length = array_d.length;
	    var array_transform = this.jqNodeEl.attr("transform").replace(")", "").split(",");
	    var node_transform = startNode.jqBaseNodeEl.attr("transform").replace(")", "").split(",");
	    var __x = parseInt(node_transform[4]) + startNode.r - parseInt(array_transform[4]);
	    var __y = parseInt(node_transform[5]) + startNode.r - parseInt(array_transform[5]);
	    this.jqNodeEl.attr("d", "M " + (__x + offset_obj.left) + " " + (__y + offset_obj.top) + " " + getLinePathWithOutStart(this.jqNodeEl));
	  };
	  this.updateEndNodePosition = function (end_node_pos, offset_obj) {
	    var array_transform = this.jqNodeEl.attr("transform").replace(")", "").split(",");
	    this.jqNodeEl.attr("d", getLinePathWithoutEnd(this.jqNodeEl) + " L " + (end_node_pos.left + offset_obj.left - parseInt(array_transform[4])) + " " + (end_node_pos.top + offset_obj.top - parseInt(array_transform[5])));
	  };

	  // 节点删除
	  this.remove = function () {
	    if (this.inflexPointArray) this.inflexPointArray.forEach(function (tmp) {
	      tmp.remove();
	    });
	    // startNode 与 endNode的  link属性需要更新
	    this.startNode && this.startNode.updataRelationLinkNode(this.id);
	    this.endNode && this.endNode.updataRelationLinkNode(this.id);
	    removeNode(this.id);
	    this.jqBaseNodeEl.remove();
	    vTopo.jqWrapperEl.unbind('mousemove');
	    vTopo.jqWrapperEl.unbind('click.drag');
	    this.startNode = null;
	    this.endNode = null;
	    this.inflexPointArray = null;
	    this.inflexPointIndex = null;
	    this.baseRemove();
	  };

	  // 添加折点
	  this.insertInflexPoint = function (__inflexNode) {
	    var x;
	    var y;
	    var __str;
	    var __path = this.snapNode.attr("d").split(" ");
	    var __inflexNode_pos = getElPosition(__inflexNode.jqNodeEl);
	    var __jqNodeEl_pos = getElPosition(this.jqNodeEl);
	    x = __inflexNode_pos.left - __jqNodeEl_pos.left;
	    y = __inflexNode_pos.top - __jqNodeEl_pos.top;
	    __str = "M " + __path[1] + " " + __path[2];
	    var __range;
	    if (__inflexNode.range || __inflexNode.range == 0) __range = __inflexNode.range;else __range = getSpaceIndexFromLine(x, y, this);
	    var mid_num = __path.length / 3 - 1;
	    for (var i = 0; i < mid_num; i++) {
	      if (i == __range) __str = __str + " L " + x + " " + y;
	      var _t = (i + 1) * 3;
	      __str = __str + " L " + __path[_t + 1] + " " + __path[_t + 2];
	    }
	    this.snapNode.attr("d", __str);
	    this.updateInflexIndex();
	    return __range;
	  };

	  // 移动折点
	  this.chageInflexPoint = function (__inflexNode) {
	    var x;
	    var y;
	    var __str;
	    var __path = this.snapNode.attr("d").split(" ");
	    var __inflexNode_pos = getElPosition(__inflexNode.jqNodeEl);
	    var __jqNodeEl_pos = getElPosition(this.jqNodeEl);
	    x = __inflexNode_pos.left - __jqNodeEl_pos.left;
	    y = __inflexNode_pos.top - __jqNodeEl_pos.top;
	    __str = "M " + __path[1] + " " + __path[2];
	    var mid_num = __path.length / 3 - 1;
	    for (var i = 0; i < mid_num; i++) {
	      if (i == __inflexNode.range) __str = __str + " L " + x + " " + y;else __str = __str + " L " + __path[(i + 1) * 3 + 1] + " " + __path[(i + 1) * 3 + 2];
	    }
	    this.snapNode.attr("d", __str);
	    this.sideToSideLink();
	  };

	  // 删除折点
	  this.removeInflexPoint = function (__range) {
	    this.inflexPointArray = _.filter(this.inflexPointArray, function (tmp) {
	      return tmp.range != __range;
	    });
	    this.updateInflexIndex();
	    this.sideToSideLink();
	  };

	  // 更新折点索引
	  this.updateInflexIndex = function () {
	    var _this2 = this;
	    this.inflexPointIndex = [];
	    var array_d = this.jqNodeEl.attr("d").split(" ");
	    var refer_pos = getElPosition(this.jqNodeEl);
	    var __x;
	    var __y;
	    var flag = false;
	    var res_pos;
	    this.inflexPointArray.forEach(function (inflexPoint) {
	      flag = false;
	      var inflexPoint_pos = getElPosition(inflexPoint.jqNodeEl);
	      __x = inflexPoint_pos.left - refer_pos.left;
	      __y = inflexPoint_pos.top - refer_pos.top;
	      for (var i = 0; i < array_d.length; i++) {
	        if (!flag) {
	          if (array_d[i] == __x && array_d[i + 1] == __y) {
	            flag = true;
	            res_pos = i;
	          }
	        }
	      }
	      inflexPoint.range = Math.round(res_pos / 3) - 1;
	      _this2.inflexPointIndex.push(inflexPoint.range);
	    });
	  };

	  // 更新线段颜色
	  this.updateColor = function (status) {
	    var currentColor = self.snapNode.attr('stroke');
	    if (!status) {
	      self.snapNode.attr('stroke', 'red');
	    } else {
	      self.snapNode.attr('stroke', vTopo.vTopoOpt.components.line.strokeColor);
	    }
	  };
	  this.loadData = function () {
	    if (opt.endNodeId) {
	      self.endNode = findNode(opt.endNodeId);
	      self.startNode.relationLinkNodeIdArray.push(self.id);
	      self.endNode.relationLinkNodeIdArray.push(self.id);
	      self.__lineMouseoverEventInit();
	      // 连线之后，进行右键菜单初始化
	      rightClickInit(self, vTopo);
	      opt.inflexPointArray.forEach(function (tmp) {
	        var __inflexNode = new inflexPoint({
	          id: tmp.id,
	          range: tmp.range,
	          vTopo: vTopo,
	          parentNodeId: self.id,
	          pos: {
	            left: tmp.pos.left,
	            top: tmp.pos.top
	          }
	        });
	        self.inflexPointArray.push(__inflexNode);
	        var __range = self.insertInflexPoint(__inflexNode);
	        __inflexNode.range = __range;
	      });
	      self.sideToSideLink();
	    } else {
	      self.__lineMousemoveEventInit();
	    }
	  };
	  this.saveData = function () {
	    var saveData = {};
	    saveData.type = "line";
	    saveData.id = this.id;
	    saveData.startNodeId = this.startNode.id;
	    saveData.endNodeId = this.endNode.id;
	    saveData.inflexPointArray = [];
	    var __array = _.sortBy(this.inflexPointIndex, function (num) {
	      return Math.min(num);
	    });
	    __array.forEach(function (__id) {
	      var tmp = _.find(self.inflexPointArray, function (__tmp) {
	        return __tmp.range == __id;
	      });
	      var __obj = new Object();
	      __obj.pos = getElPosition(tmp.jqNodeEl);
	      __obj.id = tmp.node_id;
	      __obj.range = tmp.range;
	      saveData.inflexPointArray.push(__obj);
	    });
	    return saveData;
	  };
	  this.loadData();
	}
	LineNode.prototype = new BaseNode();

	function textNode(opt) {
	  var _this = this;
	  var vTopo = opt.vTopo;
	  var y_margin = vTopo.vTopoOpt.components.text.yMargin;
	  var self = this;
	  this.type = 'text';
	  this.align = opt.align || 'bottom';
	  this.parentNode = opt.parentNode;
	  this.text = [];
	  opt.textArray.forEach(function (tmp) {
	    _this.text.push(tmp.text);
	  });
	  this.snapNode = vTopo.snapSvg.paper.text(0, 0, this.text).attr({
	    "id": "t_" + this.parentNode.id,
	    "fill": vTopo.vTopoOpt.components.text.textColor
	  });
	  this.jqNodeEl = $("#" + 't_' + this.parentNode.id);

	  // this.snapNode.attr({
	  // 	"y" : this.parentNode.getNodeWidthHeight().height + y_margin
	  // })

	  this.parentNode.snapBaseNode.add(this.snapNode);
	  this.textLayout = function () {
	    var _this2 = this;
	    var p_width_height = this.parentNode.getNodeWidthHeight();
	    var textArrayLength = opt.textArray.length || 0;
	    opt.textArray.forEach(function (tmp, i) {
	      if (self.align == 'bottom') {
	        _this2.jqNodeEl.find("tspan").eq(i).attr("x", (p_width_height.width - tmp.width) / 2);
	        _this2.jqNodeEl.find("tspan").eq(i).attr("y", p_width_height.height + y_margin + y_margin * i);
	      } else if (self.align == 'right') {
	        _this2.jqNodeEl.find("tspan").eq(i).attr("x", p_width_height.width);
	        _this2.jqNodeEl.find("tspan").eq(i).attr("y", p_width_height.height / 2 + y_margin * i);
	      } else if (self.align == 'top') {
	        _this2.jqNodeEl.find("tspan").eq(i).attr("x", (p_width_height.width - tmp.width) / 2);
	        _this2.jqNodeEl.find("tspan").eq(i).attr("y", -(textArrayLength - 1) * 12 + 12 * i);
	      } else if (self.align == 'left') {
	        _this2.jqNodeEl.find("tspan").eq(i).attr("x", -tmp.width);
	        _this2.jqNodeEl.find("tspan").eq(i).attr("y", p_width_height.height / 2 + 12 * i);
	      }
	    });
	  };
	  this.remove = function () {
	    this.snapNode.remove();
	    this.parentNode = null;
	    this.snapNode = null;
	    this.jqNodeEl = null;
	  };
	  this.textLayout();
	}

	/** 
		opt : id
		      img     xxx.png
		      textArray
		      transform
	*/

	function CircleNode(vTopo, opt) {
	  var _this = this;
	  var self = this;
	  this.type = 'circle';
	  this.category = opt.category || '';
	  this.isLinkNode = opt.isLinkNode || false;
	  this.cx = vTopo.vTopoOpt.components.circle.cx;
	  this.cy = vTopo.vTopoOpt.components.circle.cy;
	  this.r = opt.r || vTopo.vTopoOpt.components.circle.r;

	  // 关联的LineNodeArray
	  this.relationLinkNodeIdArray = [];
	  this.textArray = [];
	  this.img = opt.img;
	  this.textNode;
	  this.snapBaseNodeCreate(vTopo, opt);
	  var __jqVTopoBaseNode_pos = getElPosition(vTopo.jqVTopoBaseNode);
	  this.snapNode = vTopo.snapSvg.paper.circle(this.cx, this.cy, this.r).attr({
	    "id": 'c_' + this.id,
	    "data-type": "circle",
	    "fill": 'none'
	  });
	  this.snapBaseNode.add(this.snapNode);
	  this.snapBaseNode.attr("transform", "matrix(1,0,0,1," + (0 - __jqVTopoBaseNode_pos.left + 900) + "," + (0 - __jqVTopoBaseNode_pos.top + 500) + ")");
	  this.snapBaseNode.attr('id', 'g_' + this.id);
	  this.jqBaseNodeEl = $("#" + 'g_' + this.id);
	  this.jqNodeEl = $("#" + 'c_' + this.id);
	  this.snapImgNode = vTopo.snapSvg.paper.image("", 0, 0, this.r * 2, this.r * 2);
	  this.snapShadowImgNode = vTopo.snapSvg.paper.image("", 0, 0, this.r * 2, this.r * 2).attr("opacity", 1);
	  this.snapBaseNode.add(this.snapImgNode);
	  this.snapBaseNode.add(this.snapShadowImgNode);
	  this.status = opt.status || true;
	  this.removeCbf;
	  this.getPosRange = function () {
	    var pos = getElPosition(this.jqBaseNodeEl);
	    return {
	      x_range: [pos.left, pos.left + this.r * 2],
	      y_range: [pos.top, pos.top + this.r * 2]
	    };
	  };
	  this.getCenterPosition = function () {
	    var offset = this.r;
	    var __attr = this.jqBaseNodeEl.attr("transform");
	    if (!__attr) return {
	      left: 0 + offset,
	      top: 0 + offset
	    };
	    var __array = __attr.replace(")", "").split(",");
	    return {
	      left: parseInt(__array[4]) + offset,
	      top: parseInt(__array[5]) + offset
	    };
	  };
	  this.getNodeWidthHeight = function () {
	    return {
	      width: this.r * 2,
	      height: this.r * 2
	    };
	  };
	  this.updataRelationLinkNode = function (id) {
	    this.relationLinkNodeIdArray = _.filter(this.relationLinkNodeIdArray, function (tmp) {
	      return tmp != id;
	    });
	  };
	  this.setImg = function (imgPath) {
	    this.snapImgNode.attr("xlink:href", vTopo.vTopoOpt.config.imgPath + imgPath);
	    this.img = imgPath;
	  };
	  this.__setStatusImg = function (status) {
	    if (_this.isLinkNode) return false;
	    if (status) _this.setStatusImg('light_green.png');else _this.setStatusImg('light_grey.png');
	  };
	  this.setStatusImg = function (statusImgPath) {
	    this.snapShadowImgNode.attr("xlink:href", vTopo.vTopoOpt.config.imgPath + statusImgPath);
	    //this.snapShadowImgNode.attr("class" ,"vTopo-breath-light")
	  };

	  this.toggleStatus = function () {
	    _this.status = !_this.status;
	    _this.__setStatusImg(_this.status);
	  };
	  this.remove = function () {
	    var _this2 = this;
	    this.removeCbf && this.removeCbf(this.id);
	    removeNode(this.id);
	    vTopo.nodeArray = _.filter(vTopo.nodeArray, function (tmp) {
	      return tmp.id != _this2.id;
	    });
	    this.jqBaseNodeEl.remove();
	    /** 相关联的连线也需要删除 */
	    self.relationLinkNodeIdArray.forEach(function (tmp) {
	      findNode(tmp).remove();
	    });
	    this.jqBaseNodeEl.unbind('mousedown');
	    vTopo.jqWrapperEl.unbind('mousemove.drag');
	    vTopo.jqWrapperEl.unbind('mouseup.drag');
	    this.snapBaseNode.undrag();
	    if (this.textNode) this.textNode.remove();
	    this.snapImgNode.remove();
	    this.snapShadowImgNode.remove();
	    this.snapImgNode = null;
	    this.snapShadowImgNode = null;
	    this.baseRemove();
	  };
	  this.loadData = function (opt) {
	    if (!(vTopo.mode == "view" && self.isLinkNode)) {
	      this.setImg(opt.img);
	    }
	    if (vTopo.mode == "view" && !self.isLinkNode && self.category != 'contact') {
	      this.__setStatusImg(opt.status);
	    }
	    if (opt.transform) this.jqBaseNodeEl.attr("transform", opt.transform);
	    if (opt.textArray && opt.textArray.length > 0) new textNode({
	      parentNode: self,
	      vTopo: vTopo,
	      textArray: opt.textArray
	    }), this.textArray = opt.textArray;
	    if (opt.textStr) self.textArray = splitText(opt.textStr, vTopo), new textNode({
	      parentNode: self,
	      vTopo: vTopo,
	      textArray: self.textArray
	    });
	    if (opt.category == 'contact') this.loadContactData(opt);
	  };
	  this.loadContactData = function (opt) {
	    var img = opt.status ? 'contact_close.png' : 'contact.png';
	    _this.setImg(img);
	  };
	  vTopo.nodeArray.push(this);
	  if (vTopo.mode != "view") this.snapBaseNode.drag();
	  this.loadData(opt);
	  var mousemove_throttle = _.throttle(function (e) {
	    vTopo.setGuideLinePos(self.getCenterPosition());
	    e.stopPropagation();
	    self.relationLinkNodeIdArray.forEach(function (tmp) {
	      findNode(tmp).sideToSideLink();
	    });
	  }, 50);
	  if (vTopo.mode != "view") {
	    this.jqBaseNodeEl.bind('mousedown', function (e) {
	      e.stopPropagation();
	      vTopo.jqWrapperEl.bind('mousemove.drag', mousemove_throttle);
	      vTopo.jqWrapperEl.bind('mouseup.drag', function () {
	        vTopo.jqWrapperEl.unbind('mousemove.drag');
	        vTopo.jqWrapperEl.unbind('mouseup.drag');
	        vTopo.resetGuideLinePos();
	      });
	    });
	  }
	  rightClickInit(this, vTopo, {
	    createLineNode: function createLineNode(opt) {
	      // {startNode:node ,vTopo:vTopo}
	      new LineNode(vTopo, opt);
	    },
	    createTextNode: function createTextNode(opt) {
	      // {parentNode:node ,vTopo:vTopo ,textArray:textArray}
	      $("#t_" + self.id).remove();
	      this.textNode = new textNode(opt);
	      self.textArray = opt.textArray;
	    }
	  });

	  // 左键点击事件
	  this.jqBaseNodeEl.click(function (e) {
	    if (vTopo.mode == 'view') {
	      if (self.category == 'contact') {
	        _this.handleContactClick();
	        return false;
	      }
	      var parentNodeArray = vTopo.findAllParentNodes(self);
	      if (isEmpty(parentNodeArray)) {
	        self.toggleStatus();
	      } else {
	        if (!vTopo.getParentStatus(parentNodeArray)) {
	          self.status = false;
	          _this.__setStatusImg(false);
	        } else {
	          if (self.isLinkNode) self.status = true;else self.toggleStatus();
	        }
	      }
	      self.activeAllLine(self, self);
	    } else {
	      // 如果是单点
	      if (!vTopo.ctrlDown) {
	        vTopo.selectedNodeArray.forEach(function (node) {
	          node.removeSelected();
	        });
	        vTopo.selectedNodeArray = [];
	        vTopo.selectedNodeArray.push(self);
	      } else {
	        // ctrl + 鼠标点击
	        vTopo.selectedNodeArray.push(self);
	      }
	      self.selected();
	    }
	  });
	  this.handleContactClick = function () {
	    var routeNode1;
	    var routeNode2;
	    self.relationLinkNodeIdArray.forEach(function (tmp) {
	      var __line = findNode(tmp);
	      var endNode = __line.endNode;
	      if (!routeNode1) {
	        routeNode1 = vTopo.findParentNode(vTopo.findAllParentNodes(endNode)[0]);
	      } else {
	        routeNode2 = vTopo.findParentNode(vTopo.findAllParentNodes(endNode)[0]);
	      }
	    });
	    if (routeNode1.status && !routeNode2.status) ; else if (!routeNode1.status && routeNode2.status) ;
	  };

	  // 点击元件，关联的线都要跟着变化，避免回路
	  this.activeAllLine = function (circleNode, orignNode) {
	    var isLeaf = true;
	    circleNode.relationLinkNodeIdArray.forEach(function (tmp) {
	      var __line = findNode(tmp);
	      if (__line.startNode.id == circleNode.id && __line.endNode.id != orignNode.id) {
	        var nextNode = __line.endNode;
	        var parentNode = circleNode.isLinkNode ? vTopo.findParentNode(circleNode) : circleNode;
	        var parentNodeArray = vTopo.findAllParentNodes(nextNode);
	        if (!vTopo.getParentStatus(parentNodeArray)) {
	          nextNode.status = false;
	          nextNode.__setStatusImg(false);
	        } else {
	          if (circleNode.isLinkNode) {
	            circleNode.status = true;
	          }
	        }
	        __line.updateColor(circleNode.status);
	        _this.activeAllLine(nextNode, circleNode);
	        isLeaf = false;
	      }
	    });
	    if (isLeaf) {
	      var parentNodeArray = vTopo.findAllParentNodes(circleNode);
	      var parentStatus = vTopo.getParentStatus(parentNodeArray);
	      circleNode.status = parentStatus;
	      circleNode.__setStatusImg(parentStatus);

	      // let parentNode = vTopo.findParentNode(circleNode)
	      // circleNode.status = parentNode.status
	      // circleNode.__setStatusImg(circleNode.status)
	    }
	  };

	  // 移动
	  this.handleMove = function (key) {
	    var martix = self.snapBaseNode.transform().localMatrix;
	    switch (key) {
	      case 'ArrowLeft':
	        martix.e = martix.e - 1;
	        break;
	      case 'ArrowRight':
	        martix.e = martix.e + 1;
	        break;
	      case 'ArrowUp':
	        martix.f = martix.f - 1;
	        break;
	      case 'ArrowDown':
	        martix.f = martix.f + 1;
	        break;
	    }
	    self.snapBaseNode.transform(martix);
	    vTopo.setGuideLinePos(self.getCenterPosition());
	    self.relationLinkNodeIdArray.forEach(function (tmp) {
	      findNode(tmp).sideToSideLink();
	    });
	  };

	  // 选中
	  this.selected = function () {
	    self.snapShadowImgNode && self.snapShadowImgNode.attr('href', 'img/selected.png');
	  };

	  // 取消选中
	  this.removeSelected = function () {
	    self.snapShadowImgNode && self.snapShadowImgNode.attr('href', '');
	  };
	  this.setText = function (textStr) {
	    $("#t_" + self.id).remove();
	    var __textArray = splitText(textStr, vTopo);
	    this.textNode = new textNode({
	      parentNode: self,
	      vTopo: vTopo,
	      textArray: __textArray
	    });
	    self.textArray = __textArray;
	  };
	  this.saveData = function () {
	    var saveData = {};
	    saveData.type = "circle";
	    saveData.category = this.category;
	    saveData.r = this.r;
	    saveData.id = this.id;
	    saveData.transform = this.jqBaseNodeEl.attr("transform");
	    saveData.img = this.img;
	    saveData.textArray = this.textArray;
	    saveData.status = this.status;
	    saveData.isLinkNode = this.isLinkNode;
	    return saveData;
	  };
	}
	CircleNode.prototype = new BaseNode();

	function eventInit(vTopo) {
	  // 屏蔽默认右键事件
	  vTopo.jqWrapperEl.bind("contextmenu", function (e) {
	    e.preventDefault();
	    return false;
	  });

	  // 鼠标左键点击事件
	  vTopo.jqWrapperEl.bind('click', function (e) {
	    // 清除菜单
	    $(".vtopo-context-menu").remove();
	    // 清除dialog
	    $(".vTopo-dialog").remove();
	    vTopo.resetGuideLinePos();
	    if (e.target.id == 'svg') {
	      //取消选中的节点
	      vTopo.selectedNodeArray.forEach(function (node) {
	        node && node.removeSelected();
	      });
	      vTopo.selectedNodeArray = [];
	    }
	  });

	  // 鼠标滑动拖拽事件
	  var mousemove_x;
	  var mousemove_y;
	  var mousemove_ori_pos;
	  var mousemove_throttle = _.throttle(function (e) {
	    e.stopPropagation();
	    setElTransform(vTopo.jqVTopoBaseNode, {
	      left: mousemove_ori_pos.left + (e.clientX - mousemove_x) * vTopo.zoomScale,
	      top: mousemove_ori_pos.top + (e.clientY - mousemove_y) * vTopo.zoomScale
	    });
	  }, 10);
	  $(window).bind('mousedown.vTopo', function (e) {
	    mousemove_x = e.clientX;
	    mousemove_y = e.clientY;
	    mousemove_ori_pos = getElPosition(vTopo.jqVTopoBaseNode);
	    $(window).bind('mousemove.vTopo', mousemove_throttle);
	    $(window).bind('mouseup', function () {
	      mousemove_ori_pos = getElPosition(vTopo.jqVTopoBaseNode);
	      $(window).unbind('mousemove');
	      $(window).unbind('mouseup');
	    });
	  });
	  document.addEventListener('keydown', function (e) {
	    if (e.key == 'Control') {
	      vTopo.ctrlDown = true;
	    } else if (e.key == 'ArrowLeft' || e.key == 'ArrowRight' || e.key == 'ArrowUp' || e.key == 'ArrowDown') {
	      vTopo.handleMove(e.key);
	    }
	  });
	  document.addEventListener('keyup', function () {
	    vTopo.ctrlDown = false;
	  });
	}
	function zoomEventInit(vTopo) {
	  var __windowSizeChange = _.debounce(function () {
	    vTopo.setViewBox();
	    //vTopo.alignLayout()
	  }, 100);
	  $(window).resize(__windowSizeChange);
	  var __zoomEvent = _.throttle(function (e) {
	    e.preventDefault();
	    var delta = e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1) ||
	    // chrome & ie
	    e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1); // firefox

	    if (delta > 0)
	      // 向上滚，缩小
	      vTopo.zoomScale = vTopo.zoomScale - 0.1;else if (delta < 0)
	      // 向下滚，放大
	      vTopo.zoomScale = vTopo.zoomScale + 0.1;
	    vTopo.setViewBox();
	  }, 50);
	  vTopo.jqWrapperEl.on("mousewheel DOMMouseScroll", __zoomEvent);
	}

	var defs = {
	  init: function init(vTopo) {
	    var el_defs = vTopo.jqSvgEl.find("defs");
	    el_defs.html("<marker id=\"endArrow\" viewBox=\"0 0 20 20\" refX=\"11\" refY=\"10\" markerWidth=\"5\" markerHeight=\"5\" orient=\"auto\">\n\t\t\t<path d=\"M 1 5 L 11 10 L 1 15 Z\" style=\"fill: #6b9ae6; stroke-width: 1px;\n\t\t\tstroke-linecap: round; stroke-dasharray: 10000, 1; stroke: #6b9ae6;\"></path></marker>\n\t\t\t<marker id=\"startArrow\" viewBox=\"0 0 20 20\" refX=\"11\" refY=\"10\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto\">\n\t\t\t<path d=\"M 22 5 L 12 10 L 22 15 Z\" style=\"fill: #6b9ae6; stroke-width: 1px;\n\t\t\tstroke-linecap: round; stroke-dasharray: 10000, 1; stroke: #6b9ae6;\"></path></marker>");
	  }
	};

	function styleInject(css, ref) {
	  if ( ref === void 0 ) ref = {};
	  var insertAt = ref.insertAt;

	  if (!css || typeof document === 'undefined') { return; }

	  var head = document.head || document.getElementsByTagName('head')[0];
	  var style = document.createElement('style');
	  style.type = 'text/css';

	  if (insertAt === 'top') {
	    if (head.firstChild) {
	      head.insertBefore(style, head.firstChild);
	    } else {
	      head.appendChild(style);
	    }
	  } else {
	    head.appendChild(style);
	  }

	  if (style.styleSheet) {
	    style.styleSheet.cssText = css;
	  } else {
	    style.appendChild(document.createTextNode(css));
	  }
	}

	var css_248z = ".vTopo tspan {\n  font-size: 12px;\n  -moz-user-select: none;\n  -webkit-user-select: none;\n  user-select: none;\n}\n.vtopo-context-menu {\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 150px;\n  background-color: rgba(0, 0, 0, 0.75);\n  color: #fff;\n}\n.vtopo-context-menu ul li {\n  cursor: pointer;\n  text-align: center;\n  padding: 10px 5px;\n}\n.vTopo-dialog {\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  padding: 10px;\n  border: 1px solid #eee;\n  font-size: 12px;\n  color: #fff;\n}\n.vTopo-guideline-x {\n  position: absolute;\n  width: 100%;\n  height: 1px;\n  background-color: #3d88e0;\n}\n.vTopo-guideline-y {\n  position: absolute;\n  top: 0;\n  left: -9999px;\n  width: 1px;\n  height: 100%;\n  background-color: #3d88e0;\n}\n.vTopo-text-split {\n  font-size: 12px;\n}\n.vTopo-breath-light {\n  opacity: 0.3;\n  animation-name: breath;\n  /* 动画名称 */\n  animation-duration: 3s;\n  /* 动画时长3秒 */\n  animation-timing-function: ease-in-out;\n  /* 动画速度曲线：以低速开始和结束 */\n  animation-iteration-count: infinite;\n  /* 播放次数：无限 */\n  /* Safari and Chrome */\n  -webkit-animation-name: breath;\n  /* 动画名称 */\n  -webkit-animation-duration: 3s;\n  /* 动画时长3秒 */\n  -webkit-animation-timing-function: ease-in-out;\n  /* 动画速度曲线：以低速开始和结束 */\n  -webkit-animation-iteration-count: infinite;\n  /* 播放次数：无限 */\n}\n@keyframes breath {\n  from {\n    opacity: 0.3;\n  }\n  /* 动画开始时的不透明度 */\n  50% {\n    opacity: 1;\n  }\n  /* 动画50% 时的不透明度 */\n  to {\n    opacity: 0.3;\n  }\n  /* 动画结束时的不透明度 */\n}\n@-webkit-keyframes breath {\n  from {\n    opacity: 0.3;\n  }\n  /* 动画开始时的不透明度 */\n  50% {\n    opacity: 1;\n  }\n  /* 动画50% 时的不透明度 */\n  to {\n    opacity: 0.3;\n  }\n  /* 动画结束时的不透明度 */\n}\n";
	styleInject(css_248z);

	function VTopo(opt) {
	  var _this = this;
	  var self = this;
	  this.uuid = new Date().getTime();

	  // 只记录circle节点
	  this.nodeArray = [];

	  // 当前选中node
	  this.selectedNodeArray = [];

	  // 主从关系表
	  this.masterSlaveMapping = new Object();
	  this.vTopoOpt = {
	    components: {
	      circle: {
	        cx: 30,
	        cy: 30,
	        r: 15,
	        strokeWidth: 1
	      },
	      line: {
	        strokeColor: '#3d88e0',
	        lineWidth: 1
	      },
	      text: {
	        xMargin: 10,
	        yMargin: 10,
	        textColor: "#c8e0ff"
	      },
	      inflexPoint: {
	        cx: 0,
	        cy: 0,
	        r: 5
	      }
	    },
	    config: {
	      imgPath: "img/"
	    }
	  };
	  this.mode = opt.mode;
	  this.jqSvgEl = opt.jqSvgEl;
	  this.jqWrapperEl = opt.jqSvgEl.parent();
	  this.jqWrapperElOffset = this.jqWrapperEl.offset();
	  this.snapSvg = Snap(this.jqSvgEl[0]);
	  this.jqWrapperEl.addClass("vTopo");
	  this.vTopoBaseNode = this.snapSvg.paper.g().attr({
	    "id": "svg_g",
	    "transform": "matrix(1 0 0 1 0 0)"
	  });
	  this.jqVTopoBaseNode = this.jqWrapperEl.find("#svg_g");
	  this.pathStartEl = this.snapSvg.paper.path("").attr({
	    "id": "pathStart"
	  });
	  this.vTopoBaseNode.add(this.pathStartEl);
	  this.jqGuideLineX;
	  this.jqGuideLineY;
	  this.zoomScale = 1;
	  this.ctrlDown = false;
	  clearAllNode();
	  this.createBaseNode = function () {
	  };
	  this.createCircleNode = function (opt) {
	    return new CircleNode(self, opt);
	  };

	  // 清空所有元素
	  this.clear = function () {
	    var __nodeList = nodeList();
	    var __circleArray = _.filter(__nodeList, function (tmp) {
	      return tmp.type == "circle";
	    });
	    __circleArray.forEach(function (tmp) {
	      tmp.remove();
	    });
	  };
	  this.findNode = function (nodeId) {
	    return findNode(nodeId);
	  };
	  this.findRootNode = function () {};
	  this.findParentNode = function (node) {
	    var parentNode;
	    node.relationLinkNodeIdArray.forEach(function (tmp) {
	      var __line = _this.findNode(tmp);
	      if (__line.endNode.id == node.id) {
	        if (__line.startNode.isLinkNode) {
	          parentNode = _this.findParentNode(__line.startNode);
	        } else {
	          parentNode = __line.startNode;
	        }
	      }
	    });
	    return parentNode;
	  };

	  // 并联
	  this.getParentStatus = function (parentArray) {
	    var flag = false;
	    parentArray.forEach(function (tmp) {
	      if (tmp.status) {
	        flag = true;
	      }
	    });
	    return flag;
	  };
	  this.findAllParentNodes = function (node) {
	    var parentNodeArray = [];
	    node.relationLinkNodeIdArray.forEach(function (tmp) {
	      var __line = _this.findNode(tmp);
	      var parentNode;
	      if (__line.endNode.id == node.id) {
	        if (__line.startNode.isLinkNode) {
	          parentNode = _this.findParentNode(__line.startNode);
	        } else {
	          parentNode = __line.startNode;
	        }
	        parentNodeArray.push(parentNode);
	      }
	    });
	    return _.filter(parentNodeArray, function (tmp) {
	      return tmp.category != 'contact';
	    });
	  };
	  this.handleMove = function (key) {
	    if (self.selectedNodeArray.length == 0) return false;
	    self.selectedNodeArray[0].handleMove(key);
	  };
	  this.align = function (type) {
	    if (self.selectedNodeArray.length == 0) {
	      return false;
	    }
	    var firstNode = self.selectedNodeArray[0];
	    var martix = firstNode.snapBaseNode.transform().localMatrix;
	    self.selectedNodeArray.forEach(function (node) {
	      var __martix = node.snapBaseNode.transform().localMatrix;
	      __martix[type] = martix[type] + (firstNode.r - node.r);
	      node.snapBaseNode.transform(__martix);
	      node.relationLinkNodeIdArray.forEach(function (tmp) {
	        findNode(tmp).sideToSideLink();
	      });
	    });
	  };

	  // 加载数据
	  this.loadData = function (jsonData) {
	    this.clear();
	    setElTransform(this.jqVTopoBaseNode, {
	      left: 0,
	      top: 0
	    });
	    // 先加载circle  再加载线
	    var __data = jsonData;
	    var __nodeList = __data.nodeList;
	    var __circleArray = _.filter(__nodeList, function (tmp) {
	      return tmp.type == "circle";
	    });
	    __circleArray.forEach(function (tmp) {
	      new CircleNode(self, tmp);
	    });
	    var __lineArray = _.filter(__nodeList, function (tmp) {
	      return tmp.type == "line";
	    });
	    __lineArray.forEach(function (tmp) {
	      tmp.startNode = findNode(tmp.startNodeId);
	      new LineNode(self, tmp);
	    });
	    setElTransform(this.jqVTopoBaseNode, __data.transform);
	    //this.alignLayout()
	  };

	  // 保存数据
	  this.saveData = function () {
	    var saveData = new Object();
	    saveData.nodeList = [];
	    var __nodeList = nodeList();
	    __nodeList.forEach(function (node) {
	      saveData.nodeList.push(node.saveData());
	    });
	    saveData.transform = getElPosition(this.jqVTopoBaseNode);
	    console.log(saveData);
	    return JSON.stringify(saveData);
	  };
	  this.initTextSplit = function () {
	    this.jqTextSplit = $('<div class="vTopo-text-split"></div>').appendTo(this.jqWrapperEl);
	  };
	  this.setViewBox = function () {
	    var __width = this.jqWrapperEl.width() * this.zoomScale;
	    var __height = this.jqWrapperEl.height() * this.zoomScale;
	    this.snapSvg.attr("viewBox", "0,0," + __width + "," + __height);
	  };
	  this.initGuideLine = function () {
	    this.jqGuideLineX = $('<div class="vTopo-guideline-x"></div>').appendTo(this.jqWrapperEl);
	    this.jqGuideLineY = $('<div class="vTopo-guideline-y"></div>').appendTo(this.jqWrapperEl);
	  };
	  this.setGuideLinePos = function (pos) {
	    var __jqVTopoBaseNode_pos = getElPosition(this.jqVTopoBaseNode);
	    this.jqGuideLineX.css("top", pos.top + __jqVTopoBaseNode_pos.top + "px");
	    this.jqGuideLineY.css("left", pos.left + __jqVTopoBaseNode_pos.left + this.jqWrapperElOffset.left + "px");
	  };
	  this.resetGuideLinePos = function () {
	    this.jqGuideLineX && this.jqGuideLineX.css("top", "9999px");
	    this.jqGuideLineY && this.jqGuideLineY.css("left", "9999px");
	  };
	  this.alignLayout = function () {
	    var jqVTopoBaseNode_pos = getElPosition(this.jqVTopoBaseNode);
	    var jqVTopoBaseNode_w_h = this.jqVTopoBaseNode[0].getBoundingClientRect();
	    var jqWrapperEl_width = this.jqWrapperEl.width();
	    var jqWrapperEl_height = this.jqWrapperEl.height();
	    var x_array = [];
	    var y_array = [];
	    this.nodeArray.forEach(function (tmp) {
	      var __pos = getElPosition(tmp.jqBaseNodeEl);
	      x_array.push(__pos.left);
	      y_array.push(__pos.top);
	    });
	    var x_min = _.min(x_array);
	    var y_min = _.min(y_array);
	    var x_tmp = (jqWrapperEl_width - jqVTopoBaseNode_w_h.width) / 2 - (jqVTopoBaseNode_pos.left + x_min);
	    var y_tmp = (jqWrapperEl_height - jqVTopoBaseNode_w_h.height) / 2 - (jqVTopoBaseNode_pos.top + y_min);
	    setElTransform(this.jqVTopoBaseNode, {
	      left: jqVTopoBaseNode_pos.left + x_tmp,
	      top: jqVTopoBaseNode_pos.top + y_tmp
	    });
	  };
	  eventInit(self);
	  if (this.mode != "view") this.initGuideLine();else this.setViewBox(), zoomEventInit(self);
	  defs.init(self);
	  this.initTextSplit();
	}

	return VTopo;

})));
