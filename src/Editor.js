import React, { Component } from 'react';
import DlgAbout from './DlgAbout';
import DlgColor from './DlgColor';
// import AceEditor from 'react-ace';
// import 'brace/mode/html';
// import 'brace/theme/tomorrow_night';
import data from './Data';
import Browser from './Browser2';
import MyFs from './MyFs';
import { SketchPicker } from 'react-color'
import PropEdit from './PropEdit';
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
var drawWidth = 10; //笔触宽度
var color = '#ffff00'; //画笔颜色
var drawingObject = null; //当前绘制对象
var moveCount = 1; //绘制移动计数器
var doDrawing = false; // 绘制状态
let canvas;
let _clipboard;

//坐标转换
function transformMouse(mouseX, mouseY) {
  return { x: mouseX / window.zoom, y: mouseY / window.zoom };
}
//绘画方法
function drawing() {
  if (drawingObject) {
    canvas.remove(drawingObject);
  }
  var canvasObject = null;
  switch (drawType) {
    case 'arrow': //箭头
      canvasObject = new fabric.Path(
        drawArrow(mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y, 30, 30),
        {
          stroke: color,
          fill: 'rgba(255,255,255,0)',
          strokeWidth: drawWidth,
        }
      );
      break;
    case 'line': //直线
      canvasObject = new fabric.Line(
        [mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y],
        {
          stroke: color,
          strokeWidth: drawWidth,
        }
      );
      break;
    case 'dottedline': //虚线
      canvasObject = new fabric.Line(
        [mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y],
        {
          strokeDashArray: [3, 1],
          stroke: color,
          strokeWidth: drawWidth,
        }
      );
      break;
    case 'circle': //正圆
      var left = mouseFrom.x,
        top = mouseFrom.y;
      var radius =
        Math.sqrt(
          (mouseTo.x - left) * (mouseTo.x - left) +
            (mouseTo.y - top) * (mouseTo.y - top)
        ) / 2;
      canvasObject = new fabric.Circle({
        left: left,
        top: top,
        stroke: color,
        fill: 'rgba(255, 255, 255, 0)',
        radius: radius,
        strokeWidth: drawWidth,
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
        stroke: color,
        fill: 'rgba(255, 255, 255, 0)',
        originX: 'center',
        originY: 'center',
        rx: Math.abs(left - mouseTo.x),
        ry: Math.abs(top - mouseTo.y),
        strokeWidth: drawWidth,
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
        stroke: color,
        strokeWidth: drawWidth,
        fill: 'rgba(255, 255, 255, 0)',
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
        stroke: color,
        strokeWidth: drawWidth,
        fill: 'rgba(255, 255, 255, 0)',
      });
      break;
    case 'equilateral': //等边三角形
      var height = mouseTo.y - mouseFrom.y;
      canvasObject = new fabric.Triangle({
        top: mouseFrom.y,
        left: mouseFrom.x,
        width: Math.sqrt(Math.pow(height, 2) + Math.pow(height / 2.0, 2)),
        height: height,
        stroke: color,
        strokeWidth: drawWidth,
        fill: 'rgba(255,255,255,0)',
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
        fill: color,
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
}

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
  var path = ' M ' + fromX + ' ' + fromY;
  path += ' L ' + toX + ' ' + toY;
  arrowX = toX + topX;
  arrowY = toY + topY;
  path += ' M ' + arrowX + ' ' + arrowY;
  path += ' L ' + toX + ' ' + toY;
  arrowX = toX + botX;
  arrowY = toY + botY;
  path += ' L ' + arrowX + ' ' + arrowY;
  return path;
}

//获取画板对象的下标
function getCanvasObjectIndex() {
  return canvasObjectIndex++;
}

const path = window.require('path');
const fs = window.require('fs');
const electron = window.require('electron');
const { ipcRenderer } = window.require('electron'); //
const fontSize = 16;
const toolbar_h = 70;
const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>

</style>
</head>
<body>

</body>
</html>`;
const css = `ul {
    display:flex;
    padding: 0;
    margin:0 0 0 0;
    list-style: none;
    flex-wrap:wrap;
    background-color: #777;
    align-items: baseline;
    justify-content: center;
    align-content:center;
    height:200;
    width:200;
}
li {
    background-color: #8cacea;
    margin: 8px;
    width:100px;
    overflow:hidden;
}
li:first-child
{ 
    line-height:1em;
    font-size:3em;
    height:100px;
}
li:last-child
{ 
    line-height:1em;
    font-size:2em;
    height:200px;
}`;
class HtmlEditor extends Component {
  cssChange = newv => {
    this.setState({ css: newv });
  };
  htmlChange = newv => {
    this.setState({ html: newv }, () => {
      // this.updateFrame();
    });
  };
  // preview = () => {
  //   this.setState({csshtml: `<style>${this.state.css}</style>${this.state.html}`});
  // };
  constructor() {
    super();
    data.getconfig();
    ipcRenderer.on('request_close', () => {
      data.saveconfig();
      ipcRenderer.send('close');
    });
    ipcRenderer.on('save', () => {
      this.save_click();
    });
    ipcRenderer.on('new', () => {
      this.newfile();
    });
    ipcRenderer.on('open', () => {
      this.open_click();
    });
    ipcRenderer.on('about', () => {
      this.setState({ show_about: true });
    });
    this.state = {
      mode:"Pencil",
      shadow_color:"#00FF00",
      shadow_width:10,
      shadow_offset:4,
      show_about: false,
      show_color:false,
      show_prop:"none",
      canvasSize: { width: '1000px', height: '1000px' },
      previewSize: { width: '220px', height: '300px' },
      css: css,
      // head:`<meta charset="utf-8"/>`,
      html: html,
      showPreview: 'none',
      html_editor_h: 600,
      edit_width: 800,
      filename: '',
      selectValue: '',
      active_tool: 0,
      pen_width: 3,
      color:color,
      selected:null,
    };
    this.cssEditor = React.createRef();
    this.htmlEditor = React.createRef();
  }
  propChange=(dict)=>{
    console.log(dict);
      if(this.state.selected[0]){
        this.state.selected[0].set(dict);
        canvas.renderAll();
      }
  }
  color_change=(e)=>{
    console.log(e);
    this.setState({color:e.target.value});
    color=e.target.value;
    canvas.freeDrawingBrush.color=e.target.value;
  }
  shadow_color_change=(e)=>{
    this.setState({shadow_color:e.target.value})
    canvas.freeDrawingBrush.shadow.color=e.target.value;
  }
  shadow_width_change=(e)=>{
    this.setState({shadow_width:parseInt(e.target.value,10)})
    canvas.freeDrawingBrush.shadow.blur = parseInt(e.target.value, 10) || 0;
  }
  shadow_offset_change=(e)=>{
    this.setState({shadow_offset:parseInt(e.target.value,10)})
    canvas.freeDrawingBrush.shadow.offsetX = parseInt(e.target.value, 10) || 0;
    canvas.freeDrawingBrush.shadow.offsetY = parseInt(e.target.value, 10) || 0;
  }
  mode_change=(e)=>{
    this.setState({mode:e.target.value});
    if (e.target.value === 'hline') {
      canvas.freeDrawingBrush = this.vLinePatternBrush;
    }
    else if (e.target.value === 'vline') {
      canvas.freeDrawingBrush = this.hLinePatternBrush;
    }
    else if (e.target.value=== 'square') {
      canvas.freeDrawingBrush = this.squarePatternBrush;
    }
    else if (e.target.value === 'diamond') {
      canvas.freeDrawingBrush = this.diamondPatternBrush;
    }
    else if (e.target.value === 'texture') {
      canvas.freeDrawingBrush = this.texturePatternBrush;
    }
    else {
      canvas.freeDrawingBrush = new fabric[e.target.value + 'Brush'](canvas);
    }

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = drawWidth;
      canvas.freeDrawingBrush.shadow = new fabric.Shadow({
        blur: drawWidth || 0,
        offsetX: 0,
        offsetY: 0,
        affectStroke: true,
        color: this.state.shadow_color,
      });
    }
  }
  onChangeComplete=(vcolor)=>{
    // console.log(vcolor);

    this.setState({color:vcolor.hex});
    color=vcolor.hex;
    canvas.freeDrawingBrush.color = vcolor.hex;
  }
  componentWillUnmount() {       
    // window.removeEventListener('resize',this.resize);
  }

  resize=(e)=>{
    this.setState({canvasSize:{width:window.innerWidth,height:window.innerHeight}},()=>{
      canvas.set({width:this.refs.canvas.clientWidth
        ,height:this.refs.canvas.clientHeight});

    })
    // console.log("resize");
    // canvas.renderAll();
    // canvas.clear();
    // canvas = new fabric.Canvas('c', {
    //   backgroundColor: 'rgb(100,100,200)',
    //   width: this.refs.canvas.clientWidth,
    //   height: this.refs.canvas.clientHeight,
    //   isDrawingMode: false,
    //   skipTargetFind: false,
    //   selectable: true,
    //   selection: true,
    // });
    // window.canvas = canvas;
    // window.zoom = window.zoom ? window.zoom : 1;

    // canvas.freeDrawingBrush.color = color; //设置自由绘颜色
    // canvas.freeDrawingBrush.width = drawWidth;
    // // this.bind_events();
    // this.bind_select();
  }
  componentDidMount() {
    console.log(canvas);
    canvas = new fabric.Canvas('c', {
      backgroundColor: 'rgb(100,100,200)',
      width: this.refs.canvas.clientWidth,
      height: this.refs.canvas.clientHeight,
      isDrawingMode: false,
      skipTargetFind: false,
      selectable: true,
      selection: true,
    });

    window.canvas = canvas;
    window.zoom = window.zoom ? window.zoom : 1;

    canvas.freeDrawingBrush.color = color; //设置自由绘颜色
    canvas.freeDrawingBrush.width = drawWidth;
    // this.bind_events();
    this.bind_select();
    // window.addEventListener('resize', this.resize);
    if (fabric.PatternBrush) {
    this.vLinePatternBrush = new fabric.PatternBrush(canvas);
    this.vLinePatternBrush.getPatternSrc = function() {

      var patternCanvas = fabric.document.createElement('canvas');
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
    this.hLinePatternBrush.getPatternSrc = function() {

      var patternCanvas = fabric.document.createElement('canvas');
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

      var squareWidth = 10, squareDistance = 2;

      var patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
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
    img.src = './honey_im_subtle.png';

    this.texturePatternBrush = new fabric.PatternBrush(canvas);
    this.texturePatternBrush.source = img;
  }
  }
  unbind_events = () => {
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');
    canvas.off('selection:created');
  };
  bind_select=()=>{
    let self=this;
    canvas.on("selection:cleared",(options)=>{

      self.setState({selected:options.selected});
      console.log("selection:cleared");
      console.log(options);
    });

    canvas.on("selection:updated",(options)=>{

      self.setState({selected:options.selected});
      console.log("selection:updated");
      console.log(options);
    });

    canvas.on("selection:created",(options)=>{

      self.setState({selected:options.selected});
      console.log("selection:created");
      console.log(options);
    });
  }
  bind_events = () => {
    //绑定画板事件
    canvas.on('mouse:down', function(options) {
      var xy = transformMouse(options.e.offsetX, options.e.offsetY);
      mouseFrom.x = xy.x;
      mouseFrom.y = xy.y;
      doDrawing = true;
    });
    canvas.on('mouse:up', function(options) {
      var xy = transformMouse(options.e.offsetX, options.e.offsetY);
      mouseTo.x = xy.x;
      mouseTo.y = xy.y;
      // drawing();
      drawingObject = null;
      moveCount = 1;
      doDrawing = false;
    });
    canvas.on('mouse:move', function(options) {
      if (moveCount % 2 && !doDrawing) {
        //减少绘制频率
        return;
      }
      moveCount++;
      var xy = transformMouse(options.e.offsetX, options.e.offsetY);
      mouseTo.x = xy.x;
      mouseTo.y = xy.y;
      drawing();
    });

    canvas.on('selection:created', function(e) {
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
  };
  componentWillUnmount() {}
  handleDragStart = () => {
    this.setState({
      dragging: true,
    });
  };
  onFileClick = filepath => {
    filepath = MyFs.toLocalPath(filepath);
    this.setState({ filename: filepath });
    let content = fs.readFileSync(filepath, { encoding: 'utf-8', flag: 'r' });
    if (path.parse(filepath).ext === '.svg') {
      fabric.loadSVGFromString(content, function(objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        canvas.clear();
        canvas.add(obj).renderAll();
      });
    } else if (path.parse(filepath).ext === '.json') {
      canvas.loadFromJSON(content);
    }

    this.setState({ html: content, showPreview: 'none' });
  };
  open_click = () => {
    var dialog = electron.remote.dialog;
    dialog.showOpenDialog(
      {
        defaultPath: path.resolve('./css_examples'),
        properties: ['openFile'],
        filters: [
          { name: '*.fabric.json', extensions: ['fabric.json'] },
          { name: '*.svg', extensions: ['svg'] },
          { name: '*.txt', extensions: ['text'] },
          { name: '*', extensions: ['*'] },
        ],
      },
      res => {
        if (!res) return;
        // const cheerio = require('cheerio');
        this.setState({ filename: res[0] });
        let content = fs.readFileSync(res[0], { encoding: 'utf-8', flag: 'r' });
        if (path.parse(res[0]).ext === '.svg') {
          fabric.loadSVGFromString(content, function(objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            canvas.clear();
            canvas.add(obj).renderAll();
          });
        } else {
          canvas.loadFromJSON(content);
        }
        this.setState({ html: content, showPreview: 'none' });
      }
    );
  };
  animationEnd = el => {
    var animations = {
      animation: 'animationend',
      OAnimation: 'oAnimationEnd',
      MozAnimation: 'mozAnimationEnd',
      WebkitAnimation: 'webkitAnimationEnd',
    };

    for (var t in animations) {
      if (el.style[t] !== undefined) {
        return animations[t];
      }
    }
    return;
  };
  updateFrame = () => {
    let frame = window.frames['preview'];
    if (frame) {
      let filepath = path.dirname(this.state.filename);
      // let $ = cheerio.load(this.state.html,{
      //    xmlMode: true,
      //    lowerCaseTags: false
      // });
      // $("head").prepend(`<base href="${filepath}/" />`);
      let content = this.state.html;
      content = content.replace('<head>', `<head><base href="${filepath}/" />`);
      let doc = window.frames['preview'].document;
      if (!doc) return;
      try {
        doc.open();
        doc.write(content);
        doc.close();
      } catch (err) {
        console.log(err);
        // this.setState({filename:"about:blank"});
      }
    }
  };
  anim = () => {
    //console.log(e.target.value);
    this.setState(
      {
        selectValue: 'flipInX animated',
      },
      () => {
        setTimeout(this.check, 1000);
      }
    );
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
    var dialog = electron.remote.dialog;
    dialog.showSaveDialog(
      {
        defaultPath: path.resolve('./css_examples'),
        properties: ['saveFile'],
        filters: [
          { name: '*.fabric.json', extensions: ['fabric.json'] },
          { name: '*.svg', extensions: ['svg'] },
          { name: '*.txt', extensions: ['text'] },
          { name: '*', extensions: ['*'] },
        ],
      },
      res => {
        if (res) {
          this.anim();
          this.setState({ filename: res });

          if (path.parse(res).ext === '.svg') {
            fs.writeFileSync(res, this.genOutSvg());
          } else {
            fs.writeFileSync(res, this.genOut());
          }
        }
      }
    );
  };
  save_click = () => {
    if (this.state.filename != '') {
      this.anim();
      fs.writeFileSync(this.state.filename, this.genOut());
    } else {
      this.save_as_click();
    }
  };
  genOutSvg = () => {
    return canvas.toSVG();
    // `<html><body><style>${this.state.css}</style>${this.state.html}</body></html>`
    // let $ = cheerio.load(this.state.html,{
    //          xmlMode: true,
    //          lowerCaseTags: false
    //       });
    // let html=$("body").append(`<style>this.state.css</style`)
  };
  genOut = () => {
    return JSON.stringify(canvas);
    // `<html><body><style>${this.state.css}</style>${this.state.html}</body></html>`
    // let $ = cheerio.load(this.state.html,{
    //          xmlMode: true,
    //          lowerCaseTags: false
    //       });
    // let html=$("body").append(`<style>this.state.css</style`)
  };
  handleDragEnd = () => {
    // console.log(this.cssEditor.current);
    this.cssEditor.current.editor.resize();
    this.htmlEditor.current.editor.resize();
    this.setState({
      dragging: false,
    });
  };
  newfile = () => {
    this.setState({
      filename: '',
      html:
        '<!DOCTYPE html><html><head>\n\n<style>\n\n</style></head><body>\n\n</body></html>',
    });
    canvas.clear();
    canvas.backgroundColor="rgb(100,100,200)";
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
    this.setState({ active_tool: index });

    drawType = tool_types[index]; //jQuery(this).attr("data-type");
    console.log(index);
    console.log(drawType);
    canvas.isDrawingMode = false;
    if (drawType === 'move') {
      canvas.selection = true;
      canvas.skipTargetFind = false;
      canvas.selectable = true;
      this.unbind_events();
      this.bind_select();
      return;
    } else {
      this.bind_events();
    }
    if (textbox) {
      //退出文本编辑状态
      textbox.exitEditing();
      textbox = null;
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
      drawWidth = this.state.pen_width;
      canvas.freeDrawingBrush.width = drawWidth;
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
  group=()=> {
        if (!canvas.getActiveObject()) {
          return;
        }
        if (canvas.getActiveObject().type !== 'activeSelection') {
          return;
        }
        canvas.getActiveObject().toGroup();
        canvas.requestRenderAll();
      }

      ungroup=()=> {
        if (!canvas.getActiveObject()) {
          return;
        }
        if (canvas.getActiveObject().type !== 'group') {
          return;
        }
        canvas.getActiveObject().toActiveSelection();
        canvas.requestRenderAll();
      }

Copy=()=> {
  // clone what are you copying since you
  // may want copy and paste on different moment.
  // and you do not want the changes happened
  // later to reflect on the copy.
  canvas.getActiveObject().clone(function(cloned) {
    _clipboard = cloned;
  });
}

Paste=()=> {
  // clone again, so you can do multiple copies.
  if(!_clipboard) return;
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
}
  change_color=()=>{
    this.setState({show_color:true});
  }
  selectAll = ()=> {
        canvas.discardActiveObject();
        var sel = new fabric.ActiveSelection(canvas.getObjects(), {
          canvas: canvas,
        });
        canvas.setActiveObject(sel);
        canvas.requestRenderAll();
      }
      selectNone = ()=> {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
 removeScript=()=> {
  var active = canvas.getActiveObject();
  if (!active) return;
  active.setSelectionStyles({
    fontSize: undefined,
    deltaY: undefined,
  });
  canvas.requestRenderAll();
}

superScript=()=> {
  var active = canvas.getActiveObject();
  if (!active) return;
  active.setSuperscript();
  canvas.requestRenderAll();
}
delete=()=>{
  var active = canvas.getActiveObject();
  console.log(active);
  if(!active) return;
  if (active.type === 'activeSelection') {
      active.forEachObject(function(obj) {
        canvas.remove(obj);
      });
  }
  else{
    canvas.remove(active);
  }
  canvas.discardActiveObject();
  // canvas.requestRenderAll();
}
subScript=()=> {
  var active = canvas.getActiveObject();
  if (!active) return;
  active.setSubscript();
  canvas.requestRenderAll();
}
  render() {
    // console.log(this.state);
    // let $ = cheerio.load(this.state.html,{
    //          xmlMode: true,
    //          lowerCaseTags: false
    //       });
    let html = this.state.html; //$("body").html();
    // let head=(<meta charSet="utf-8"></meta>);
    // this.updateFrame();
    let filepath = path.dirname(this.state.filename);
    let content = this.state.html;
    content = content.replace(
      '<head>',
      `<head><base href="${this.state.filename}" >`
    );
    let li_tools = tool_types.map((item, index) => {
      // console.log(item);
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
    console.log("=====================================")
    console.log(this.state);
    return (
      <div id="root_new">
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
        <Browser onFileClick={this.onFileClick} />

        <div id="contain_edit">
          <div style={{ height: toolbar_h, backgroundColor: '#ccc' }}>
            <button
              style={{ margin: '10px 10px 10px 10px' }}
              onClick={this.open_click}
            >
              open
            </button>
            <span
              style={{
                display: 'inline-block',
                border: 'solid gray 2px',
                margin: '2px 2px 2px 2px',
              }}
              ref="contactedit"
              className={this.state.selectValue}
            >
              <button
                style={{ margin: '10px 10px 10px 10px' }}
                onClick={this.save_click}
              >
                save
              </button>
              <button
                style={{ margin: '10px 10px 10px 10px' }}
                onClick={this.save_as_click}
              >
                save as
              </button>
            </span>
            <button
              onClick={this.newfile}
              style={{ margin: '10px 10px 10px 10px' }}
            >
              New
            </button>
            <button onClick={this.group}>group</button>
            <button onClick={this.ungroup}>un group</button>
            
            <button onClick={this.Copy}>copy</button>
            <button onClick={this.Paste}>Paste</button>
            <button onClick={this.selectAll}>全选</button>
            <button onClick={this.selectNone}>取消选择</button>
            <button onClick={this.superScript}>上标</button>
            <button onClick={this.subScript}>下标</button>
            <button onClick={this.removeScript}>正常</button>
            <button onClick={this.delete}>delete</button>
            <div>{this.state.filename}</div>
          </div>
          <div
            style={{
              backgroundColor:"#000",
              flex: 1,
              width: '100%',
              height: `calc(100vh - ${toolbar_h})`,
            }}
          >
            <div style={{ width: '52px', float: 'left' }}>
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
                backgroundColor:"#070",
              }}
            >
              <canvas
                id="c"
                ref="canvas"
                style={{ margin:"30px 30px 30px 30px"
                  ,width: this.state.canvasSize.width
                  , height: this.state.canvasSize.height}}
              >
                请使用支持HTML5的浏览器
              </canvas>
            </div>
          </div>
        </div>
           <div id="contain_preview">
             <button onClick={()=>{
                if(this.state.showPreview==="none"){
                  this.setState({showPreview:"flex"});
                }
                else{
                  this.setState({showPreview:"none"}); 
                }
             }}>pen</button>
           <div style={{margin:"10 10 10 10",with:"250px",height:"330px",
              flexDirection:"column",
              display:this.state.showPreview}}>

             <div>
  <div id="drawing-mode-options">
    <label>Mode:</label>
    <select id="drawing-mode-selector" value={this.state.mode}
              onChange={this.mode_change}>
      <option>Pencil</option>
      <option>Circle</option>
      <option>Spray</option>
      <option>Pattern</option>
      <option>hline</option>
      <option>vline</option>
      <option>square</option>
      <option>diamond</option>
      <option>texture</option>
    </select><br />
    <label >Line width:</label>
    <input value={this.state.pen_width}
              onChange={this.pen_width_change} id="drawing-line-width" /><br />

    <label >Line color:</label>
    <input type="color" value={this.state.color} onChange={this.color_change} id="drawing-color" /><br />

    <label >Shadow color:</label>
    <input type="color" value={this.state.shadow_color}  onChange={this.shadow_color_change} id="drawing-shadow-color" /><br/>

    <label >Shadow width:</label>
    <input value={this.state.shadow_width}
              onChange={this.shadow_width_change} id="drawing-shadow-width" /><br />

    <label >Shadow offset:</label>
    <input value={this.state.shadow_offset}
              onChange={this.shadow_offset_change} id="drawing-shadow-offset" /><br />
  </div>
</div>
           </div>
          </div>
          <div id="contain_prop">
           <div style={{margin:"10 10 10 10",
              display:this.state.show_prop}}>
             <PropEdit selected={this.state.selected} propChange={this.propChange}/>
           </div>
           <button onClick={()=>{
                if(this.state.show_prop==="none"){
                  this.setState({show_prop:"block"});
                }
                else{
                  this.setState({show_prop:"none"}); 
                }
             }}>prop</button>
          </div>
        <style jsx="true">{`
          body {
            margin: 0 0 0 0;
            padding: 0 0 0 0;
          }
          #root_new {
            margin: 0 0 0 0;
            padding: 0 0 0 0;
            display:flex;
            flex-direction:row;
            width: 100%;
            height: 100%;
          }
          #contain_edit {
            height: 100vh;
            flex:1;
            display:flex;
            flex-direction:column;
          }
          #contain_prop {
            background-color:#eee;
            position:fixed;
            display:flex;
            flex-direction:column;
            right:0;
            bottom:0;
            margin:0 0 0 0;
            padding：0 0 0 0;
            overflow: auto;
            z-index:100;
          }
          #contain_preview {
            background-color:#eee;
            position:fixed;
            display:flex;
            flex-direction:column;
            right:0;
            top:0;
            margin:0 0 0 0;
            padding：0 0 0 0;
            overflow: auto;
            z-index:100;
          }
        `}</style>
      </div>
    );
  }
}

export default HtmlEditor;
