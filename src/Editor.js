import React, { Component } from 'react';
import DlgAbout from './DlgAbout';
// import AceEditor from 'react-ace';
// import 'brace/mode/html';
// import 'brace/theme/tomorrow_night';
import data from './Data';
import Browser from './Browser2';
import MyFs from './MyFs';
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
var drawWidth = 3; //笔触宽度
var color = 'green'; //画笔颜色
var drawingObject = null; //当前绘制对象
var moveCount = 1; //绘制移动计数器
var doDrawing = false; // 绘制状态
let canvas;
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
        fontSize: 18,
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
      show_about: false,
      previewSize: { width: '50vw', height: '50vh' },
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
    };
    this.cssEditor = React.createRef();
    this.htmlEditor = React.createRef();
  }
  componentDidMount() {
    // this.divPreview = document.getElementById('preview');
    // this.preview();
    // setTimeout(this.updateFrame,2000);
    // this.updateFrame();
    // const canvas = new fabric.Canvas('c', {
    //   width: this.refs.canvas.clientWidth,
    //   height: this.refs.canvas.clientHeight
    // });
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
  }
  unbind_events = () => {
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');
    canvas.off('selection:created');
  };
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
        canvas.add(obj).renderAll();
      });
    } else if (path.parse(filepath).ext === '.json') {
      canvas.loadFromJSON(content);
    }

    this.setState({ html: content, showPreview: 'flex' });
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
            canvas.add(obj).renderAll();
          });
        } else {
          canvas.loadFromJSON(content);
        }
        this.setState({ html: content, showPreview: 'flex' });
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
    return (
      <div id="root_new">
        <DlgAbout
          showModal={this.state.show_about}
          closeModal={() => {
            this.setState({ show_about: false });
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
            <button onClick={this.anim}>anim</button>
            <label>pen width</label>
            <input
              value={this.state.pen_width}
              onChange={this.pen_width_change}
            />
            <button onClick={this.anim_canvas}>test anim</button>
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
                marginLeft: '60px',
                width: '95%',
                height: '100%',
              }}
            >
              <canvas
                id="c"
                ref="canvas"
                style={{ width: '100%', height: '100%' }}
              >
                请使用支持HTML5的浏览器
              </canvas>
            </div>
          </div>
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
          .SplitPane {
            position: relative !important;
          }
          .Resizer {
            background: #000;
            opacity: 0.2;
            z-index: 1;
            -moz-box-sizing: border-box;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            -moz-background-clip: padding;
            -webkit-background-clip: padding;
            background-clip: padding-box;
          }

          .Resizer:hover {
            -webkit-transition: all 2s ease;
            transition: all 2s ease;
          }

          .Resizer.horizontal {
            height: 11px;
            margin: -5px 0;
            border-top: 5px solid rgba(255, 255, 255, 0);
            border-bottom: 5px solid rgba(255, 255, 255, 0);
            cursor: row-resize;
            width: 100%;
          }

          .Resizer.horizontal:hover {
            border-top: 5px solid rgba(0, 0, 0, 0.5);
            border-bottom: 5px solid rgba(0, 0, 0, 0.5);
          }

          .Resizer.vertical {
            width: 11px;
            margin: 0 -5px;
            border-left: 5px solid rgba(255, 255, 255, 0);
            border-right: 5px solid rgba(255, 255, 255, 0);
            cursor: col-resize;
          }

          .Resizer.vertical:hover {
            border-left: 5px solid rgba(0, 0, 0, 0.5);
            border-right: 5px solid rgba(0, 0, 0, 0.5);
          }
          .Resizer.disabled {
            cursor: not-allowed;
          }
          .Resizer.disabled:hover {
            border-color: transparent;
          }
        `}</style>
      </div>
    );
  }
}

export default HtmlEditor;
