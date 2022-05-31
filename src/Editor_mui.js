import React, { Component } from 'react';
import DlgAbout from './DlgAbout_mui';
import DlgColor from './DlgColor_mui';
import data from './Data';
import { SketchPicker } from 'react-color';
import PropEdit from './PropEdit2';
import InputColor from './InputColor_mui';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import ToolBar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { withStyles } from '@mui/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { sprintf } from "printj/printj.mjs";
import { fabric } from "fabric";
console.log("myAPI=============")
console.log(window.myAPI)
const path = window.myAPI?window.myAPI.path:null;
const fs = window.myAPI?window.myAPI.fs:null;
// const electron = null;
// const ipcRenderer  = null; //

const styles = {
  root: { flexGrow: 1 },
  grow: { flexGrow: 1 },
  menuButton: { marginLeft: -12, marginRight: 20 },
};
function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return u8arr; //new Blob([u8arr], {type:mime});
}
var panning = false;
const tool_types = [
  'move',
  'pen',
  'arrow',
  'line',
  'dottedline',
  'circle',
  'ellipse',
  'rectangle',
  'rightangle',
  'equilateral',
  'text',
  'remove',
];
var mouseFrom = {},
  mouseTo = {},
  drawType = null,
  canvasObjectIndex = 0,
  textbox = null;
var drawingObject = null; //当前绘制对象
// var moveCount = 1; //绘制移动计数器
var doDrawing = false; // 绘制状态
let canvas;
let _clipboard;

//绘制箭头方法
function drawArrow(fromX, fromY, toX, toY, theta, headlen) {
  theta = typeof theta != 'undefined' ? theta : 30;
  headlen = typeof theta != 'undefined' ? headlen : 10;
  // 计算各角度和对应的P2,P3坐标
  var angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI,
    angle1 = ((angle + theta) * Math.PI) / 180,
    angle2 = ((angle - theta) * Math.PI) / 180,
    topX = headlen * Math.cos(angle1),
    topY = headlen * Math.sin(angle1),
    botX = headlen * Math.cos(angle2),
    botY = headlen * Math.sin(angle2);
  var arrowX = fromX - topX,
    arrowY = fromY - topY;
  var path1 = ' M ' + fromX + ' ' + fromY;
  path1 += ' L ' + toX + ' ' + toY;
  arrowX = toX + topX;
  arrowY = toY + topY;
  path1 += ' M ' + arrowX + ' ' + arrowY;
  path1 += ' L ' + toX + ' ' + toY;
  arrowX = toX + botX;
  arrowY = toY + botY;
  path1 += ' L ' + arrowX + ' ' + arrowY;
  return path1;
}
const fontSize = 16;
const toolbar_h = 50;
class Editor extends Component {
  constructor() {
    super();
    data.getconfig();
    // if(ipcRenderer){
    //   ipcRenderer.on('request_close', () => {
    //     data.saveconfig(this.state);
    //     ipcRenderer.send('close');
    //   });
    //   ipcRenderer.on('save', () => {
    //     this.save_click();
    //   });
    //   ipcRenderer.on('new', () => {
    //     this.newfile();
    //   });
    //   ipcRenderer.on('open', () => {
    //     this.open_click();
    //   });
    //   ipcRenderer.on('about', () => {
    //     this.setState({ show_about: true });
    //   });
    // }
    // data.config.state.filename="";
    this.state = data.config.state;
    this.history = [];
    this.history_index = -1;
    this.fabricHistoryReplay = false;
    this.state.showPreview = false;
    this.state.show_prop = false;
    this.history_len = 0;
  }
  width_change = e => {
    let w = parseInt(e.target.value, 10) || 10;
    canvas.setWidth(w);
    this.setState({
      canvasSize: { width: w, height: this.state.canvasSize.height },
    });
  };
  height_change = e => {
    let w = parseInt(e.target.value, 10) || 10;
    canvas.setHeight(w);
    this.setState({
      canvasSize: { width: this.state.canvasSize.width, height: w },
    });
  };
  background_color_change = s => {
    // console.log("background_color_change");
    // console.log(vcolor);
    // let s=sprintf("rgba(%d,%d,%d,%f)",vcolor.rgb.r,vcolor.rgb.g,vcolor.rgb.b,vcolor.rgb.a);
    canvas.backgroundColor = s;
    canvas.renderAll();
    this.setState({ background_color: s });
  };
  reset_zoom = () => {
    canvas.setZoom(1.0);
    let now_center = canvas.getVpCenter();
    canvas.relativePan({
      x: now_center.x - canvas.getWidth() / 2,
      y: now_center.y - canvas.getHeight() / 2,
    });
  };
  zoomToFitCanvas = () => {
    //遍历所有对对象，获取最小坐标，最大坐标
    var objects = canvas.getObjects();
    if (objects.length > 0) {
      var rect = objects[0].getBoundingRect();
      var minX = rect.left;
      var minY = rect.top;
      var maxX = rect.left + rect.width;
      var maxY = rect.top + rect.height;
      for (var i = 1; i < objects.length; i++) {
        rect = objects[i].getBoundingRect();
        minX = Math.min(minX, rect.left);
        minY = Math.min(minY, rect.top);
        maxX = Math.max(maxX, rect.left + rect.width);
        maxY = Math.max(maxY, rect.top + rect.height);
      }
    }

    //计算平移坐标
    var panX = (maxX - minX - canvas.width) / 2 + minX;
    var panY = (maxY - minY - canvas.height) / 2 + minY;
    //开始平移
    canvas.absolutePan({ x: panX, y: panY });

    //计算缩放比例
    var zoom = Math.min(
      canvas.width / (maxX - minX),
      canvas.height / (maxY - minY)
    );
    //计算缩放中心
    var zoomPoint = new fabric.Point(canvas.width / 2, canvas.height / 2);
    //开始缩放
    canvas.zoomToPoint(zoomPoint, zoom);
  };
  propChange = dict => {
    // console.log(dict);
    if (this.state.selected && this.state.selected[0]) {
      this.state.selected[0].set(dict);
      canvas.renderAll();
    }
  };
  color_change = e => {
    // console.log(e);
    this.setState({ pen_color: e });
    canvas.freeDrawingBrush.color = e;
  };
  shadow_color_change = e => {
    this.setState({ shadow_color: e });
    canvas.freeDrawingBrush.shadow.color = e;
  };
  shadow_width_change = e => {
    this.setState({ shadow_width: parseInt(e.target.value, 10) });
    canvas.freeDrawingBrush.shadow.blur = parseInt(e.target.value, 10) || 0;
  };
  shadow_offset_change = e => {
    this.setState({ shadow_offset: parseInt(e.target.value, 10) });
    canvas.freeDrawingBrush.shadow.offsetX = parseInt(e.target.value, 10) || 0;
    canvas.freeDrawingBrush.shadow.offsetY = parseInt(e.target.value, 10) || 0;
  };
  mode_change = e => {
    this.setState({ mode: e.target.value });
    if (e.target.value === 'hline') {
      canvas.freeDrawingBrush = this.hLinePatternBrush;
    } else if (e.target.value === 'vline') {
      canvas.freeDrawingBrush = this.vLinePatternBrush;
    } else if (e.target.value === 'square') {
      canvas.freeDrawingBrush = this.squarePatternBrush;
    } else if (e.target.value === 'diamond') {
      canvas.freeDrawingBrush = this.diamondPatternBrush;
    } else if (e.target.value === 'texture') {
      canvas.freeDrawingBrush = this.texturePatternBrush;
    } else {
      canvas.freeDrawingBrush = new fabric[e.target.value + 'Brush'](canvas);
    }

    if (canvas.freeDrawingBrush) {
      var brush = canvas.freeDrawingBrush;
      if (brush.getPatternSrc) {
        brush.source = brush.getPatternSrc.call(brush);
      }
    }
    canvas.freeDrawingBrush.color = this.state.pen_color;
    canvas.freeDrawingBrush.width = this.state.pen_width;
    canvas.freeDrawingBrush.shadow = new fabric.Shadow({
      blur: this.state.pen_width || 0,
      offsetX: 0,
      offsetY: 0,
      affectStroke: true,
      color: this.state.shadow_color,
    });
    // }
  };
  onChange_fill = s => {
    // console.log(vcolor);
    // let s=sprintf("rgba(%d,%d,%d,%f)",vcolor.rgb.r,vcolor.rgb.g,vcolor.rgb.b,vcolor.rgb.a);
    this.setState({ fill: s });
    // color = vcolor.hex;
    // canvas.freeDrawingBrush.color = vcolor.hex;
  };
  componentWillUnmount = () => {
    // window.removeEventListener('resize',this.resize);
  };

  // resize = e => {
  //   this.setState(
  //     { canvasSize: { width: window.innerWidth, height: window.innerHeight } },
  //     () => {
  //       canvas.set({
  //         width: this.refs.canvas.clientWidth,
  //         height: this.refs.canvas.clientHeight,
  //       });
  //     }
  //   );
  // };
  hline_func = () => {
    var patternCanvas = fabric.document.createElement('canvas');
    patternCanvas.width = patternCanvas.height = 10;
    var ctx = patternCanvas.getContext('2d');

    ctx.strokeStyle = pen_color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.lineTo(5, 10);
    ctx.closePath();
    ctx.stroke();

    return patternCanvas;
  };
  componentDidMount = () => {
    // console.log(canvas);
    canvas = new fabric.Canvas('c', {
      backgroundColor: this.state.background_color,
      width: this.state.canvasSize.width,
      height: this.state.canvasSize.height,
      isDrawingMode: false,
      skipTargetFind: false,
      selectable: true,
      selection: true,
    });
    if (data.config.state.filename) {
      // console.log('auto open file');
      this.openfile(data.config.state.filename);
    }
    fabric.Object.prototype.cornerSize = 20;
    fabric.Object.prototype.borderColor = 'red';
    fabric.Object.prototype.cornerColor = '#0000ff';
    fabric.Object.prototype.cornerStrokeColor = '#0000ff';
    window.canvas = canvas;
    this.last_tool = -1;
    this.click_tool(this.state.active_tool);
    // window.addEventListener('resize', this.resize);
    canvas.freeDrawingBrush.color = this.state.pen_color;
    canvas.freeDrawingBrush.width = this.state.pen_width;
    canvas.freeDrawingBrush.shadow = new fabric.Shadow({
      blur: this.state.pen_width || 0,
      offsetX: 0,
      offsetY: 0,
      affectStroke: true,
      color: this.state.shadow_color,
    });
    if (fabric.PatternBrush) {
      this.vLinePatternBrush = new fabric.PatternBrush(canvas);
      this.vLinePatternBrush.getPatternSrc =function () {
        var patternCanvas = fabric.util.createCanvasElement();
        patternCanvas.width = patternCanvas.height = 10;
        var ctx = patternCanvas.getContext('2d');

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(10, 5);
        ctx.closePath();
        ctx.stroke();

        return patternCanvas;
      };

      this.hLinePatternBrush = new fabric.PatternBrush(canvas);
      this.hLinePatternBrush.getPatternSrc = function(){
        var patternCanvas = fabric.util.createCanvasElement();
        patternCanvas.width = patternCanvas.height = 10;
        var ctx = patternCanvas.getContext('2d');

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(5, 10);
        ctx.closePath();
        ctx.stroke();

        return patternCanvas;
      };

      this.squarePatternBrush = new fabric.PatternBrush(canvas);
      this.squarePatternBrush.getPatternSrc = function() {
        var squareWidth = 10,
          squareDistance = 2;

        var patternCanvas = fabric.util.createCanvasElement();
        patternCanvas.width = patternCanvas.height =
          squareWidth + squareDistance;
        var ctx = patternCanvas.getContext('2d');

        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, squareWidth, squareWidth);

        return patternCanvas;
      };

      this.diamondPatternBrush = new fabric.PatternBrush(canvas);
      this.diamondPatternBrush.getPatternSrc = function() {

      var squareWidth = 10, squareDistance = 5;
      var patternCanvas = fabric.document.createElement('canvas');
      var rect = new fabric.Rect({
        width: squareWidth,
        height: squareWidth,
        angle: 45,
        fill: this.color
      });

      var canvasWidth = rect.getBoundingRect().width;

      patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
      rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

      var ctx = patternCanvas.getContext('2d');
      rect.render(ctx);

      return patternCanvas;
    };

      var img = new Image();
      img.src = './texture.png';

      this.texturePatternBrush = new fabric.PatternBrush(canvas);
      this.texturePatternBrush.source = img;
    }
  };
  disableUndoRedo = () => {
    var self = this;
    var mods = this.history_index;
    var hist = this.history_len;
    // No redo steps left
    if (hist > 0 && mods < hist - 1) {
      this.setState({ redo_disabled: false });
    } else {
      this.setState({ redo_disabled: true });
    }
    // No undo steps left or no history
    if (mods < -1 || hist === 0) {
      this.setState({ undo_disabled: true });
    } else {
      this.setState({ undo_disabled: false });
    }
  };
  save_history = () => {
    var obj = JSON.stringify(canvas.toDatalessJSON());
    if (obj === this.history[this.history_index]) return; //not change
    this.history_index += 1;
    this.history[this.history_index] = obj;
    this.history_len = this.history_index + 1;
    this.disableUndoRedo();
  };
  unbind_events = index => {
    if (index < 0) return;
    if (index === 0) {
      this.unbind_select();
    } else {
      canvas.off('mouse:down');
      canvas.off('mouse:move');
      canvas.off('mouse:up');
      canvas.off('selection:created');
    }
  };
  unbind_select = () => {
    // canvas.upperCanvasEl.removeEventListener("mousewheel",this.mousewheel);
    canvas.off('mouse:down');
    //鼠标抬起
    canvas.off('mouse:up');

    //鼠标移动
    canvas.off('mouse:move');
    canvas.off('selection:cleared');

    canvas.off('selection:updated');

    canvas.off('selection:created');
  };
  mousewheel = event => {
    // console.log('mousewheel');
    var zoom = (event.deltaY > 0 ? 0.1 : -0.1) + canvas.getZoom();
    zoom = Math.max(0.1, zoom); //最小为原来的1/10
    zoom = Math.min(3, zoom); //最大是原来的3倍
    var zoomPoint = new fabric.Point(event.pageX, event.pageY);
    canvas.zoomToPoint(zoomPoint, zoom);
  };
  bind_select = () => {
    // console.log('addEventListener');
    // canvas.upperCanvasEl.addEventListener("mousewheel",this.mousewheel);
    canvas.on('mouse:down', function(e) {
      //按住alt键才可拖动画布
      if (e.e.altKey) {
        panning = true;
        canvas.selection = false;
      }
    });

    //鼠标抬起
    canvas.on('mouse:up', function(e) {
      panning = false;
      canvas.selection = true;
    });

    //鼠标移动
    canvas.on('mouse:move', function(e) {
      if (panning && e && e.e) {
        var delta = new fabric.Point(e.e.movementX, e.e.movementY);
        canvas.relativePan(delta);
      }
    });
    canvas.on('selection:cleared', options => {
      this.setState({ selected: options.selected });
      // console.log('selection:cleared');
      // console.log(options);
    });

    canvas.on('selection:updated', options => {
      this.setState({ selected: options.selected });
      // console.log('selection:updated');
      // console.log(options);
    });

    canvas.on('selection:created', options => {
      this.setState({ selected: options.selected });
      // console.log('selection:created');
      // console.log(options);
    });
  };
  bind_events = index => {
    if (index === 0) {
      this.bind_select();
    } else {
      //绑定画板事件
      canvas.on('mouse:down', options => {
        // console.log(options);
        var xy = options.absolutePointer; //transformMouse(options.e.offsetX, options.e.offsetY);
        mouseFrom.x = xy.x;
        mouseFrom.y = xy.y;
        doDrawing = true;
      });
      canvas.on('mouse:up', options => {
        var xy = options.absolutePointer; //transformMouse(options.e.offsetX, options.e.offsetY);
        mouseTo.x = xy.x;
        mouseTo.y = xy.y;
        // drawing();
        drawingObject = null;
        // moveCount = 1;
        doDrawing = false;
        this.save_history();
      });
      canvas.on('mouse:move', options => {
        // if (moveCount % 2 && !doDrawing) {
        if (!doDrawing) {
          //减少绘制频率
          return;
        }
        // moveCount++;
        var xy = options.absolutePointer; //transformMouse(options.e.offsetX, options.e.offsetY);
        mouseTo.x = xy.x;
        mouseTo.y = xy.y;
        this.drawing();
      });

      canvas.on('selection:created', e => {
        if (e.target._objects) {
          //多选删除
          var etCount = e.target._objects.length;
          for (var etindex = 0; etindex < etCount; etindex++) {
            canvas.remove(e.target._objects[etindex]);
          }
        } else {
          //单选删除
          canvas.remove(e.target);
        }
        canvas.discardActiveObject(); //清楚选中框
      });
    }
  };
  componentWillUnmount = () => {};
  handleDragStart = () => {
    this.setState({
      dragging: true,
    });
  };
  // onFileClick = filepath => {
  //   filepath = MyFs.toLocalPath(filepath);
  //   this.setState({ filename: filepath });
  //   let content = fs.readFileSync(filepath, { encoding: 'utf-8', flag: 'r' });
  //   if (path.parse(filepath).ext === '.svg') {
  //     fabric.loadSVGFromString(content, function(objects, options) {
  //       var obj = fabric.util.groupSVGElements(objects, options);
  //       canvas.clear();
  //       canvas.add(obj).renderAll();
  //     });
  //   } else if (path.parse(filepath).ext === '.json') {
  //     canvas.loadFromJSON(content);
  //   }

  //   this.setState({ html: content, showPreview: false });
  // };
  open_click = () => {
    // console.log(electron)
    var options ={
      defaultPath: path.resolve('./css_examples'),
      properties: ['openFile'],
      filters: [
        { name: '*.fabric.json', extensions: ['fabric.json'] },
        { name: '*.svg', extensions: ['svg'] },
        { name: '*.txt', extensions: ['text'] },
        { name: '*', extensions: ['*'] },
      ],
    };
    window.myAPI.showOpenDialog(options).then((res)=>{
      console.log(res);
      if (res){
        this.openfile(res[0]);
      }
    }).catch((e)=>{
      console.log(e);
    })
  };
  openfile = fn => {
    try {
      let content = fs.readFileSync(fn, { encoding: 'utf-8', flag: 'r' });
      if (path.parse(fn).ext === '.svg') {
        fabric.loadSVGFromString(content, function(objects, options) {
          var obj = fabric.util.groupSVGElements(objects, options);
          canvas.clear(); //reset canvas
          this.history_index = -1; //reset history
          this.history_len = 0;
          this.reset_zoom(); //reset zoom
          canvas.add(obj).renderAll();
        });
      } else {
        this.history_index = -1;
        this.history_len = 0;
        this.reset_zoom();
        canvas.loadFromJSON(content);
      }
      this.setState({ filename: fn });
    } catch (e) {
      // console.log(e);
      this.setState({ filename: '' });
    }
  };
  // animationEnd = el => {
  //   var animations = {
  //     animation: 'animationend',
  //     OAnimation: 'oAnimationEnd',
  //     MozAnimation: 'mozAnimationEnd',
  //     WebkitAnimation: 'webkitAnimationEnd',
  //   };

  //   for (var t in animations) {
  //     if (el.style[t] !== undefined) {
  //       return animations[t];
  //     }
  //   }
  //   return;
  // };
  anim = () => {
    //console.log(e.target.value);
    // this.setState(
    //   {
    //     selectValue: 'flipInX animated',
    //   },
    //   () => {
    //     setTimeout(this.check, 1000);
    //   }
    // );
  };
  check = () => {
    if (this.animationEnd(this.refs.contactedit)) {
      // console.log("end");
      this.setState({ selectValue: '' });
    } else {
      setTimeout(this.check, 1000);
    }
  };

  save_as_click = () => {
    var options ={
      defaultPath: path.resolve('./css_examples'),
      properties: ['saveFile'],
      filters: [
        { name: '*.fabric.json', extensions: ['fabric.json'] },
        { name: '*.svg', extensions: ['svg'] },
        { name: '*.png', extensions: ['png'] },
        { name: '*', extensions: ['*'] },
      ],
    };
    window.myAPI.showSaveDialog(options).then((res)=>{
       console.log(res);
       if (res) {
          this.anim();
          this.setState({ filename: res });
          this.history_index = -1;
          this.history_len = 0;

          if (path.parse(res).ext === '.svg') {
            fs.writeFileSync(res, this.genOutSvg());
          } else if (path.parse(res).ext === '.png') {
            var blob = dataURLtoBlob(canvas.toDataURL());
            fs.writeFileSync(res, blob);
          } else {
            fs.writeFileSync(res, this.genOut());
          }
        }
    }).catch((e)=>{
      console.log(e);
    })
 
  };
  save_click = () => {
    if (this.state.filename != '') {
      this.anim();
      this.history_index = -1;
      this.history_len = 0;

      if (path.parse(this.state.filename).ext === '.svg') {
        fs.writeFileSync(this.state.filename, this.genOutSvg());
      } else {
        fs.writeFileSync(this.state.filename, this.genOut());
      }
    } else {
      this.save_as_click();
    }
  };
  genOutSvg = () => {
    return canvas.toSVG();
  };
  genOut = () => {
    return JSON.stringify(canvas);
  };
  newfile = () => {
    this.setState({
      filename: '',
    });
    this.history_index = -1;
    this.history_len = 0;
    canvas.clear();
    canvas.backgroundColor = this.state.background_color;
  };
  handleDrag = width => {
    this.setState({ html_editor_h: width });
  };
  resetPreview = () => {
    let filename = this.state.filename;
    this.setState({ filename: 'about:blank' }, () => {
      this.setState({ filename: filename });
    });
  };
  click_tool = index => {
    if (index === this.last_tool) return;

    this.setState({ active_tool: index }, () => {
      this.save_history();
    });
    drawType = tool_types[index]; //jQuery(this).attr("data-type");
    // console.log(index);
    // console.log(drawType);
    canvas.isDrawingMode = false;
    if (textbox) {
      //退出文本编辑状态
      textbox.exitEditing();
      textbox = null;
    }
    if (drawType === 'move') {
      canvas.selection = true;
      canvas.skipTargetFind = false;
      canvas.selectable = true;
      this.unbind_events(this.last_tool);
      this.bind_events(index);
      this.last_tool = index;
      return;
    } else {
      this.unbind_events(this.last_tool);
      this.bind_events(index);
      this.last_tool = index;
    }

    if (drawType == 'pen') {
      canvas.isDrawingMode = true;
    } else if (drawType == 'remove') {
      canvas.selection = true;
      canvas.skipTargetFind = false;
      canvas.selectable = true;
    } else {
      canvas.skipTargetFind = true; //画板元素不能被选中
      canvas.selection = false; //画板不显示选中
    }
  };
  pen_width_change = e => {
    this.setState({ pen_width: parseInt(e.target.value, 10) }, () => {
      // drawWidth = this.state.pen_width;
      canvas.freeDrawingBrush.width = this.state.pen_width;
    });
  };
  anim_canvas = () => {
    var circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 50,
    });
    circle.setGradient('fill', {
      x1: 0,
      y1: 0,
      x2: circle.width,
      y2: 0,
      colorStops: {
        0: 'red',
        0.2: 'orange',
        0.4: 'yellow',
        0.6: 'green',
        0.8: 'blue',
        1: 'purple',
      },
    });
    // circle.setGradient('fill', {
    //   x1: 0,
    //   y1: 0,
    //   x2: 0,
    //   y2: circle.height,
    //   colorStops: {
    //     0: '#000',
    //     1: '#fff'
    //   }
    // });
    canvas.add(circle);
    // fabric.Image.fromURL('./image/tools-28.png', function(img) {
    //   img.filters.push(new fabric.Image.filters.Sepia());
    //   img.applyFilters();
    //   // add image onto canvas (it also re-render the canvas)
    //   canvas.add(img);
    // });
    // fabric.Image.fromURL('./image/tools-28.png', function(img) {

    //   // add filter
    //   img.filters.push(new fabric.Image.filters.Grayscale());

    //   // apply filters and re-render canvas when done
    //   img.applyFilters();
    //   // add image onto canvas (it also re-render the canvas)
    //   canvas.add(img);
    // });
    // var rect = new fabric.Rect({
    //   left: 100,
    //   top: 100,
    //   fill: 'red',
    //   width: 20,
    //   height: 20
    // });
    // canvas.add(rect);
    // rect.animate('left', 500, {
    //   onChange: canvas.renderAll.bind(canvas),
    //   duration: 1000,
    //   easing: fabric.util.ease.easeOutBounce
    // });
    // rect.animate('left', '+=100', { onChange: canvas.renderAll.bind(canvas) });
    // rect.animate('angle', 45, {
    //   onChange: canvas.renderAll.bind(canvas)
    // });
  };
  group = () => {
    if (!canvas.getActiveObject()) {
      return;
    }
    if (canvas.getActiveObject().type !== 'activeSelection') {
      return;
    }
    canvas.getActiveObject().toGroup();
    canvas.requestRenderAll();
  };

  ungroup = () => {
    if (!canvas.getActiveObject()) {
      return;
    }
    if (canvas.getActiveObject().type !== 'group') {
      return;
    }
    canvas.getActiveObject().toActiveSelection();
    canvas.requestRenderAll();
  };
  front = () => {
    if (!canvas.getActiveObject()) {
      return;
    }
    canvas.getActiveObject().bringToFront();
    this.selectNone();
  };
  back = () => {
    if (!canvas.getActiveObject()) {
      return;
    }
    canvas.getActiveObject().sendToBack();
    this.selectNone();
  };
  downward = () => {
    if (!canvas.getActiveObject()) {
      return;
    }
    canvas.getActiveObject().sendBackwards();
    this.selectNone();
  };
  upward = () => {
    if (!canvas.getActiveObject()) {
      return;
    }
    canvas.getActiveObject().bringForward();
    this.selectNone();
  };
  Copy = () => {
    // clone what are you copying since you
    // may want copy and paste on different moment.
    // and you do not want the changes happened
    // later to reflect on the copy.
    canvas.getActiveObject().clone(function(cloned) {
      _clipboard = cloned;
    });
  };

  Paste = () => {
    // clone again, so you can do multiple copies.
    if (!_clipboard) return;
    _clipboard.clone(function(clonedObj) {
      canvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      });
      if (clonedObj.type === 'activeSelection') {
        // active selection needs a reference to the canvas.
        clonedObj.canvas = canvas;
        clonedObj.forEachObject(function(obj) {
          canvas.add(obj);
        });
        // this should solve the unselectability
        clonedObj.setCoords();
      } else {
        canvas.add(clonedObj);
      }
      _clipboard.top += 10;
      _clipboard.left += 10;
      canvas.setActiveObject(clonedObj);
      canvas.requestRenderAll();
    });
  };
  change_color = () => {
    this.setState({ show_color: true });
  };
  zoom_change = e => {
    let v = parseInt(e.target.value, 10);
    // console.log('zoom:' + v);
    this.setState({ zoom: v }, () => {
      var zoomPoint = new fabric.Point(canvas.width / 2, canvas.height / 2);
      canvas.zoomToPoint(zoomPoint, v);
    });
  };
  selectAll = () => {
    canvas.discardActiveObject();
    var sel = new fabric.ActiveSelection(canvas.getObjects(), {
      canvas: canvas,
    });
    canvas.setActiveObject(sel);
    canvas.requestRenderAll();
  };
  selectNone = () => {
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };
  removeScript = () => {
    var active = canvas.getActiveObject();
    if (!active) return;
    active.setSelectionStyles({
      fontSize: undefined,
      deltaY: undefined,
    });
    canvas.requestRenderAll();
  };

  superScript = () => {
    var active = canvas.getActiveObject();
    if (!active) return;
    active.setSuperscript();
    canvas.requestRenderAll();
  };
  delete1 = () => {
    var active = canvas.getActiveObject();
    // console.log(active);
    if (!active) return;
    if (active.type === 'activeSelection') {
      active.forEachObject(function(obj) {
        canvas.remove(obj);
      });
    } else {
      canvas.remove(active);
    }
    canvas.discardActiveObject();
    // canvas.requestRenderAll();
  };
  subScript = () => {
    var active = canvas.getActiveObject();
    if (!active) return;
    active.setSubscript();
    canvas.requestRenderAll();
  };
  undo = () => {
    // console.log('undo');
    if (this.history_index === -1) return;
    this.history_index -= 1;
    this.disableUndoRedo();
    canvas.clear();
    var obj = this.history[this.history_index];
    canvas.loadFromJSON(obj, () => {}, canvas.renderAll.bind(canvas));
  };
  redo = () => {
    // console.log('redo');
    if (this.history_index === this.history_len - 1) return;
    this.history_index += 1;
    this.disableUndoRedo();
    canvas.clear();
    var obj = this.history[this.history_index];
    canvas.loadFromJSON(obj, () => {}, canvas.renderAll.bind(canvas));
  };
  handleKeyDown = e => {
    console.log(e);
  };
  drawing = () => {
    if (drawingObject) {
      canvas.remove(drawingObject);
    }
    var canvasObject = null;
    switch (drawType) {
      case 'arrow': //箭头
        canvasObject = new fabric.Path(
          drawArrow(mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y, 30, 30),
          {
            stroke: this.state.pen_color,
            fill: this.state.fill,
            strokeWidth: this.state.pen_width,
          }
        );
        break;
      case 'line': //直线
        canvasObject = new fabric.Line(
          [mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y],
          {
            stroke: this.state.pen_color,
            strokeWidth: this.state.pen_width,
          }
        );
        break;
      case 'dottedline': //虚线
        canvasObject = new fabric.Line(
          [mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y],
          {
            strokeDashArray: [3, 1],
            stroke: this.state.pen_color,
            strokeWidth: this.state.pen_width,
          }
        );
        break;
      case 'circle': //正圆
        var left = mouseFrom.x,
          top = mouseFrom.y;
        var radius = Math.sqrt(
          (mouseTo.x - left) * (mouseTo.x - left) +
            (mouseTo.y - top) * (mouseTo.y - top)
        );
        canvasObject = new fabric.Circle({
          left: left - radius,
          top: top - radius,
          stroke: this.state.pen_color,
          fill: this.state.fill,
          radius: radius,
          strokeWidth: this.state.pen_width,
        });
        break;
      case 'ellipse': //椭圆
        var left = mouseFrom.x,
          top = mouseFrom.y;
        var radius =
          Math.sqrt(
            (mouseTo.x - left) * (mouseTo.x - left) +
              (mouseTo.y - top) * (mouseTo.y - top)
          ) / 2;
        canvasObject = new fabric.Ellipse({
          left: left,
          top: top,
          stroke: this.state.pen_color,
          fill: this.state.fill,
          originX: 'center',
          originY: 'center',
          rx: Math.abs(left - mouseTo.x),
          ry: Math.abs(top - mouseTo.y),
          strokeWidth: this.state.pen_width,
        });
        break;
      case 'square': //TODO:正方形（后期完善）
        break;
      case 'rectangle': //长方形
        var path =
          'M ' +
          mouseFrom.x +
          ' ' +
          mouseFrom.y +
          ' L ' +
          mouseTo.x +
          ' ' +
          mouseFrom.y +
          ' L ' +
          mouseTo.x +
          ' ' +
          mouseTo.y +
          ' L ' +
          mouseFrom.x +
          ' ' +
          mouseTo.y +
          ' L ' +
          mouseFrom.x +
          ' ' +
          mouseFrom.y +
          ' z';
        canvasObject = new fabric.Path(path, {
          left: left,
          top: top,
          stroke: this.state.pen_color,
          strokeWidth: this.state.pen_width,
          fill: this.state.fill,
        });
        //也可以使用fabric.Rect
        break;
      case 'rightangle': //直角三角形
        var path =
          'M ' +
          mouseFrom.x +
          ' ' +
          mouseFrom.y +
          ' L ' +
          mouseFrom.x +
          ' ' +
          mouseTo.y +
          ' L ' +
          mouseTo.x +
          ' ' +
          mouseTo.y +
          ' z';
        canvasObject = new fabric.Path(path, {
          left: left,
          top: top,
          stroke: this.state.pen_color,
          strokeWidth: this.state.pen_width,
          fill: this.state.fill,
        });
        break;
      case 'equilateral': //等边三角形
        var height = Math.abs(mouseTo.y - mouseFrom.y);
        var width = Math.abs(mouseTo.x - mouseFrom.x);
        canvasObject = new fabric.Triangle({
          top: mouseFrom.y,
          left: mouseFrom.x,
          width: width,
          height: height,
          stroke: this.state.pen_color,
          strokeWidth: this.state.pen_width,
          fill: this.state.fill,
        });
        break;
      case 'isosceles':
        break;
      case 'text':
        textbox = new fabric.Textbox('', {
          left: mouseFrom.x - 60,
          top: mouseFrom.y - 20,
          width: 150,
          fontSize: 28,
          borderColor: '#2c2c2c',
          fill: this.state.fill,
          hasControls: false,
        });
        canvas.add(textbox);
        textbox.enterEditing();
        textbox.hiddenTextarea.focus();
        break;
      case 'remove':
        break;
      default:
        break;
    }
    if (canvasObject) {
      // canvasObject.index = getCanvasObjectIndex();
      canvas.add(canvasObject); //.setActiveObject(canvasObject)
      drawingObject = canvasObject;
    }
  };
  add_image = () => {
    var options ={
        defaultPath: path.resolve('./css_examples'),
        properties: ['openFile'],
        filters: [
          { name: '*.png', extensions: ['png'] },
          { name: '*.jpg', extensions: ['jpeg'] },
          { name: '*', extensions: ['*'] },
        ],
    };
    electron.ipcRenderer.invoke("showOpenDialog",options).then((res)=>{
      console.log(res);
        fabric.Image.fromURL(res[0], oImg => {
          // scale image down, and flip it, before adding it onto canvas
          // window.img=oImg;
          // console.log(oImg);
          canvas.add(oImg);
        });
    }).catch((e)=>{
      console.log(e);
    })
  };
  render = () => {
    const { classes } = this.props;
    // let filepath = path.dirname(this.state.filename);
    let li_tools = tool_types.map((item, index) => {
      if (index === this.state.active_tool) {
        return (
          <li
            key={index}
            data-type={item}
            onClick={() => {
              this.click_tool(index);
            }}
            className="active"
          >
            <i
              className={'icon-tools icon-' + item + '-select'}
              data-default={'icon-tools icon-' + item + '-black'}
            />
          </li>
        );
      } else {
        return (
          <li
            key={index}
            data-type={item}
            onClick={() => {
              this.click_tool(index);
            }}
          >
            <i
              className={'icon-tools icon-' + item + '-black'}
              data-default={'icon-tools icon-' + item + '-black'}
            />
          </li>
        );
      }
    });
    console.log('=====================================');
    console.log(this.state);
    let btn_undo, btn_redo;
    if (this.state.undo_disabled) {
      btn_undo = (
        <button onClick={this.undo} disabled={true}>
          undo
        </button>
      );
    } else {
      btn_undo = <button onClick={this.undo}>undo</button>;
    }
    if (this.state.redo_disabled) {
      btn_redo = (
        <button onClick={this.redo} disabled={true}>
          redo
        </button>
      );
    } else {
      btn_redo = <button onClick={this.redo}>redo</button>;
    }
    let the_width;
    if (canvas) the_width = canvas.getWidth();
    return (
      <div id="root_new">
        <AppBar position="static">
          <ToolBar>
            <Typography color="inherit" className={classes.grow}>
              drawing board
            </Typography>
            
            <Button
              color="inherit"
              variant="outlined"
              onClick={this.open_click}
            >
              open
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              onClick={this.save_click}
            >
              save
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              onClick={this.save_as_click}
            >
              save as
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              onClick={this.newfile}
              style={{ margin: '0px 10px 0px 10px' }}
            >
              New
            </Button>
            <Select>
              <MenuItem onClick={this.group}>
                group
              </MenuItem>
              <MenuItem onClick={this.ungroup}>
                ungroup
              </MenuItem>
              <MenuItem onClick={this.front}>
                front
              </MenuItem>
              <MenuItem onClick={this.back}>
                back
              </MenuItem>
              <MenuItem onClick={this.downward}>
                downward
              </MenuItem>
              <MenuItem onClick={this.upward}>
                upward
              </MenuItem>
              <MenuItem onClick={this.Copy}>
                copy
              </MenuItem>
              <MenuItem onClick={this.Paste}>
                paste
              </MenuItem>
              <MenuItem onClick={this.selectAll}>
                selectAll
              </MenuItem>
              <MenuItem onClick={this.selectNone}>
                selectNone
              </MenuItem>
              <MenuItem onClick={this.superScript}>
                superScript
              </MenuItem>
              <MenuItem onClick={this.subScript}>
                subScript
              </MenuItem>
              <MenuItem onClick={this.removeScript}>
                removeScript
              </MenuItem>

              <MenuItem onClick={this.delete1}>
                delete
              </MenuItem>
              <MenuItem onClick={this.zoomToFitCanvas}>
                fit
              </MenuItem>
              <MenuItem onClick={this.reset_zoom}>
                unfit
              </MenuItem>
              <MenuItem onClick={this.add_image}>
                image
              </MenuItem>
            </Select>
          </ToolBar>
        </AppBar>
        <DlgAbout
          showModal={this.state.show_about}
          closeModal={() => {
            this.setState({ show_about: false });
          }}
        />
        <DlgColor
          showModal={this.state.show_color}
          closeModal={() => {
            this.setState({ show_color: false });
          }}
        />
        <div id="contain_edit">
          <div style={{ height: toolbar_h, backgroundColor: '#ccc' }}>
            <input
              type="range"
              style={{ display: 'inline', width: '100px' }}
              min="1"
              max="10"
              value={this.state.zoom}
              onChange={this.zoom_change}
              step="1"
            />
            {btn_undo}
            {btn_redo}
            <span>{this.state.filename}</span>
            <Button
              variant="outlined"
              onClick={() => {
                this.setState({ showPreview: true });
              }}
            >
              set
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                this.setState({ show_prop: true });
              }}
            >
              prop
            </Button>
          </div>
          <div
            style={{
              backgroundColor: '#000',
              flex: 1,
              width: '100%',
              height: `calc(100vh - ${toolbar_h})`,
              display: 'flex',
            }}
          >
            <div style={{ width: '52px' }}>
              <ul id="toolsul" className="tools">
                {li_tools}
              </ul>
            </div>
            <div
              id="canvasDiv"
              className="canvasDiv"
              style={{
                width: '100%',
                height: 'calc(100vh - ${toolbar_h})',
                backgroundColor: '#070',
              }}
            >
              <canvas
                id="c"
                ref="canvas"
                style={{
                  margin: '0px 10px 10px 10px',
                }}
              >
                请使用支持HTML5的浏览器
              </canvas>
            </div>
          </div>
        </div>
        <Dialog
          open={this.state.showPreview}
          onClose={() => {
            this.setState({ showPreview: false });
          }}
        >
          <DialogTitle>set</DialogTitle>
          <DialogContent>
            <label>background color:</label>
            <InputColor
              value={this.state.background_color}
              onChange={this.background_color_change}
            />
            <br />
            <TextField
              label="width"
              value={this.state.canvasSize.width}
              onChange={this.width_change}
            />
            <br />
            <label>height:</label>
            <TextField
              value={this.state.canvasSize.height}
              onChange={this.height_change}
            />
            <br />
            <label>draw Mode:</label>
            <select value={this.state.mode} onChange={this.mode_change}>
              <option>Pencil</option>
              <option>Circle</option>
              <option>Spray</option>
              <option>Pattern</option>
              <option>hline</option>
              <option>vline</option>
              <option>square</option>
              <option>diamond</option>
              <option>texture</option>
            </select>
            <br />
            <label>pen width:</label>
            <TextField
              value={this.state.pen_width}
              onChange={this.pen_width_change}
            />
            <br />

            <label>pen color:</label>
            <InputColor
              type="color"
              value={this.state.pen_color}
              onChange={this.color_change}
            />
            <br />

            <label>Shadow color:</label>
            <InputColor
              type="color"
              value={this.state.shadow_color}
              onChange={this.shadow_color_change}
            />
            <br />

            <label>Shadow width:</label>
            <TextField
              value={this.state.shadow_width}
              onChange={this.shadow_width_change}
            />
            <br />

            <label>Shadow offset:</label>
            <TextField
              value={this.state.shadow_offset}
              onChange={this.shadow_offset_change}
            />
            <br />
            <label>fill color:</label>
            <InputColor value={this.state.fill} onChange={this.onChange_fill} />
          </DialogContent>
        </Dialog>
        <Dialog
          open={this.state.show_prop}
          onClose={() => {
            this.setState({ show_prop: false });
          }}
        >
          <DialogTitle>prop</DialogTitle>
          <DialogContent>
            <PropEdit
              selected={this.state.selected}
              propChange={this.propChange}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  };
}

export default withStyles(styles)(Editor);
