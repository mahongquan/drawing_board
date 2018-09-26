import React from 'react';
import {Button,Overlay,Navbar,Nav,NavItem,Tooltip,OverlayTrigger} from "react-bootstrap";
var socket=require("./MyFs");
let styles = {
  item: {
    padding: '2px 2px',
    cursor: 'default'
  },

  highlightedItem: {
    color: 'white',
    background: 'hsl(200, 50%, 50%)',
    padding: '2px 2px',
    cursor: 'default'
  },

  menu: {
    border: 'solid 1px #ccc'
  }
}
class File extends React.Component {
    glyphClass=()=>{
        var className = "glyphicon ";
        className += this.props.isdir ? "glyphicon-folder-open" : "glyphicon-file";
        return className;
    }
    renderList=()=>{
        var dateString =  new Date(this.props.time).toLocaleString();//toGMTString()
        //var glyphClass = this.glyphClass();
        let style1;
        if (this.props.isdir){
            console.log("isdir");
            style1={backgroundColor:"#cc0"}
        }
        else{
            style1={}   
        }
        return (<tr id={this.props.id} ref={this.props.path}>
                        <td>
                        <a style={style1} onContextMenu={this.props.handleContextMenu} 
                        onClick={this.props.onClick}>
                        {this.props.name}</a>
                        </td>
                        <td>{File.sizeString(this.props.size,this.props.isdir)}</td>
                        <td>{dateString}</td>
                        </tr>);
    }
    renderGrid=()=>{
        //var glyphClass = this.glyphClass();
        let style1;
        if (this.props.isdir){
            style1={display:"inline-block" ,marginRight:"10px", marginLeft: "10px",backgroundColor:"#cc0"}
        }
        else{
            style1={display:"inline-block",marginRight:"10px",marginLeft: "10px"}   
        }
        return (
            <a style={style1} onContextMenu={this.props.handleContextMenu}  onClick={this.props.onClick}>
                {this.props.name}
            </a>);
    }

    render=()=>{
            return this.props.gridView ? this.renderGrid() : this.renderList();
    }
    static id = ()=>{return (Math.pow(2,31) * Math.random())|0; }

    static timeSort =(left, right)=>{return left.time - right.time;}

    static sizeSort = (left, right)=>{return left.size - right.size;}

    static pathSort = (left, right)=>{return left.path.localeCompare(right.path);}

    static sizes = [{count : 1, unit:"bytes"}, {count : 1024, unit: "kB"}, {count: 1048576 , unit : "MB"}, {count: 1073741824, unit:"GB" } ]

    static sizeString = (sizeBytes,isdir)=>{
        if (isdir){
            return null;
        }
        var iUnit=0;
        var count=0;
        for (iUnit=0; iUnit < File.sizes.length;iUnit++) {
                count = sizeBytes / File.sizes[iUnit].count;
                if (count < 1024)
                        break;
        }
        return "" + (count|0) +" "+ File.sizes[iUnit].unit;
    }
};
class  Browser extends React.Component {
  channels_change=(event, value)=>{
    console.log("auto_change");
    //this.setState({ yiqixinghao_value:value, auto_loading: false });
    this.channels_select(null,value) 
  }
  channels_input=(event)=>{
    console.log(event);
    //this.setState({ yiqixinghao_value:value, auto_loading: false });
    this.channels_select(null,event) 
  }
  channels_select=(value, item)=>{
      console.log("selected");
      this.setState({channels:item});
  }
   matchStateToTerm=(state, value)=>{
     return      state.toLowerCase().indexOf(value.toLowerCase()) !== -1 ;
  }
    state= {
          channels:"",
          isroot:true,
          paths : ["."],
          files: [],
          sort: File.pathSort,
          gridView: true,
          current_path:".",
          displayUpload:"none",
          showcontext: false,
          target:null,
          pathIdx:null,
          openfilepath:null,
          filecontent:"",
          filechange:false,
          mode:"text",
          connect_error:false,
    }
  handleContextMenu = (event) => {
    //console.log(event);
    event.preventDefault();
    event.stopPropagation();
    this.setState({target:event.target,showcontext:true});
    setTimeout(()=>{
            this.setState({showcontext:false});
        },5000);
  }
    loadFilesFromServer=(path)=>{
        if (path==="." || path==="./"){
            this.setState({isroot:true});
        }
        else{
            this.setState({isroot:false});   
        }
        var self=this;
            socket.emit("/fs/children",{path:path},(data)=>{
                var files = data.children.sort(self.state.sort);
                var paths = self.state.paths;
                if (paths[paths.length-1] !== path) paths = paths.concat([path])
                self.setState(
                    {files: files,
                     paths: paths,
                     sort: self.state.sort,
                     gridView: self.state.gridView,
                     showcontext:false
                    },()=>{
                        self.updateNavbarPath(self.currentPath());        
                    });
            });
    }
    updateNavbarPath=(path)=>{
        // console.log("updateNavbarPath");
        // console.log(path);
        this.setState({current_path:path});

    }
    reloadFilesFromServer=()=> {
        this.loadFilesFromServer(this.currentPath())
    }

    currentPath =()=>{
        if (this.state.paths.length>0)
            return this.state.paths[this.state.paths.length-1]
        else
            return "."
    }

    onBack =()=>{
        if (this.state.paths.length <2) {
                alert("Cannot go back from "+ this.currentPath());
                return;
        }
        var paths2=this.state.paths.slice(0,-1);
        this.setState({paths:paths2});
        this.loadFilesFromServer(paths2[paths2.length-1])
    }

    onUpload=()=>{
        this.setState({displayUpload:""});
    }

    onParent=()=>{
        // console.log("onParent");
        var thepath=this.currentPath();
        if(thepath==="."){
            alert(". 已经是根目录!");
        }
        else{
            var data={path:thepath};
            // console.log(data);
            socket.emit("/fs/parent",data,(res)=>{
                if (res.isroot){
                    alert("已经是根目录!");
                }
                else{
                    var parentPath = res.path;
                    this.updatePath(parentPath);
                }
            });
        }
    }

    alternateView=()=>{
        var updatedView = !  this.state.gridView;

        this.setState(
          {
                gridView: updatedView,
                showcontext:false
          });
    }
    uploadFile=(evt)=>{
        console.log(evt);
        var path = this.currentPath();
        const file = evt.target.files[0];
        var stream = ss.createStream();
        // upload a file to the server.
        ss(socket).emit('upload', stream, {path:path,name:file.name,size: file.size},(res)=>{
           console.log(res);
           this.reloadFilesFromServer();
           this.setState({displayUpload:"none"});
        });
        ss.createBlobReadStream(file).pipe(stream);
    }
    componentDidMount=()=>{
        // socket.on("connect_error",()=>{
        //   this.setState({connect_error:true});
        // })
        // socket.on("connect",()=>{
        //   this.setState({connect_error:false});
        // })
        // console.log("mount======");
        // console.log(this.props.initpath);
        if (this.props.initpath)
            this.state.paths.push(this.props.initpath);
        var path = this.currentPath();
        this.loadFilesFromServer(path);
    }

    updateSort=(sort)=>{
            var files  = this.state.files
                    var lastSort = this.state.sort;
            if  (lastSort === sort)
                    files = files.reverse();
            else
                    files = files.sort(sort);

            this.setState({files: files, sort: sort,  paths: this.state.paths, gridView: this.state.gridView});
    }

    timeSort=()=>{
            this.updateSort(File.timeSort);
    }
    pathSort=()=>{
            this.updateSort(File.pathSort);
    }
    sizeSort=()=>{
            this.updateSort(File.sizeSort);
    }
    updatePath=(path)=>{
            this.loadFilesFromServer(path);
    }
    getContent=(path)=>{
        // console.log("content");
        // console.log(path);
        this.props.onFileClick(path);
    }
    mkdir=()=>{
        var newFolderName = prompt("Enter new folder name");
        if (newFolderName == null)
                return;
        socket.emit("mkdir",{path:this.currentPath(),name:newFolderName},
          this.reloadFilesFromServer
        );
    }
    onClick=(f)=>{
        // console.log("onClick");
        // console.log(f);
        if (f.isdir){
          this.updatePath(f.path);
        }
        else{
           this.getContent(f.path);
        }
    }
    mapfunc=(f, idx)=>{
        var id  =  File.id(f.name);
        return (
            <File key={idx}  id={id} gridView={this.state.gridView} onClick={()=>this.onClick(f)} 
                handleContextMenu={this.handleContextMenu}
                path={f.path} name={f.name} isdir={f.isdir} size={f.size} time={f.time} browser={this}
            />);
    }
    onChange=(newValue)=>{
      //console.log('change',newValue);
        this.setState({
            filecontent:newValue
            ,filechange:true
        });
    }
    genpath=(path)=>{
        // console.log("genpath=============")
        // console.log(path);
        var paths=path.split("\\");
        //if (paths.length==1) return null;
        // console.log(paths);
        var r=[]
        var i=0;
        while(i<paths.length){
            var s="";
            for(var j=0;j<i+1;j++){
                s+=paths[j];
                if (j<i) s+="\\";
            }
            //console.log(paths[i])
            //console.log(s)
            r.push([s,paths[i]])
            i++;
        }
        r.pop();
        // if(r.length===0){
        //     this.isroot=true;
        // }
        // else{
        //     this.isroot=false;   
        // }
        // console.log(r);
        var hs=r.map((item,idx)=>{
            let style1;
            if(idx===this.state.pathIdx){
                style1={marginLeft:"6px",backgroundColor:"#ccc"};
            }
            else{
                style1={marginLeft:"6px",backgroundColor:"#cc0"}
            }
            return <span key={idx} 
                onMouseEnter={()=>this.onMouseEnter(idx)}
                onMouseLeave={()=>this.onMouseLeave(idx)}
                style={style1} 
                onClick={()=>{this.linkclick(item[0])}}>{item[1]}/</span>
        })
        return hs;
    }
    onMouseLeave=(idx)=>{
        this.setState({pathIdx:null});
    }
    onMouseEnter=(idx)=>{
        this.setState({pathIdx:idx});
    }
    linkclick=(e)=>{
        console.log(e);
        this.updatePath(e);
    }
    rootclick=()=>{
        this.updatePath(".")
    }
    onRename=()=>{
        //var type = this.props.isdir ? "folder" : "file";
        var path=this.state.current_path+"/"+this.state.target.text;
        var updatedName = prompt("Enter new name for "+this.state.target.text);
        if (updatedName != null){
            socket.emit("rename",{path:path,name:updatedName},()=>{
                this.reloadFilesFromServer();
                this.setState({showcontext:false});
            });
        }
    }
    onRemove=()=>{
        console.log("onRemove");
        //var type = this.props.isdir ? "folder" : "file";
        var path=this.state.current_path+"/"+this.state.target.text;
        var remove =window.confirm("Remove  '"+ path +"' ?");
        if (remove){
            socket.emit("remove",{path:path},()=>{
                this.reloadFilesFromServer();
                this.setState({showcontext:false});
            });
        }
    }
    savefilecontent=()=>{
        socket.emit("savefile",{path:this.state.openfilepath,content:this.state.filecontent},()=>{
                this.reloadFilesFromServer();
                this.setState({
                    showcontext:false
                    ,filechange:false
                });
        });
    }

    linkclick=(e)=>{
        console.log(e);
        this.updatePath(e);
    }
    rootclick=()=>{
        this.updatePath(".")
    }
    render=()=>{
        // console.log(this.state.paths);
        const tooltipback = (
          <Tooltip id="tooltipback"><strong>back</strong></Tooltip>
        );
        const tooltipparent = (
          <Tooltip id="tooltipparent"><strong>parent</strong></Tooltip>
        );
        const tooltipupload = (
          <Tooltip id="tooltipparent"><strong>upload</strong></Tooltip>
        );
        const files = this.state.files.map(this.mapfunc);
        var pathshow=this.genpath(this.state.current_path);
        var gridGlyph = "glyphicon glyphicon-th-large";
        var listGlyph = "glyphicon glyphicon-list";
        var className = this.state.gridView ? listGlyph : gridGlyph;
        var toolbar=(
            <React.Fragment>
            <Overlay target={this.state.target} 
                container={this} show={this.state.showcontext}  placement="bottom">
                <Tooltip id="tooltip1" >
                    <div onClick={this.onRename}>rename</div>
                    <div onClick={this.onRemove}>remove</div>
                </Tooltip>
            </Overlay>
            <div style={{display:"flex"}}>
                        <OverlayTrigger placement="bottom" overlay={tooltipback}>
                          <button>
                            <span onClick={this.onBack} className="glyphicon glyphicon-arrow-left">
                            </span>
                          </button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="bottom" overlay={tooltipparent}>
                          <button>
                            <span  disabled={this.state.isroot} onClick={this.onParent} className="glyphicon glyphicon-arrow-up"/>
                          </button>
                       </OverlayTrigger>
                        <button>
                        <span onClick={this.alternateView} ref="altViewSpan" className={className} />
                        </button>
                        <button>
                        <span onClick={this.rootclick} className="glyphicon glyphicon-chevron-right"/>
                        </button>
                        {pathshow}
              </div>
            <input type="file" id="uploadInput" onChange={this.uploadFile} style={{display:this.state.displayUpload}} />
        </React.Fragment>
        );
        let dircontent;
        if (this.state.gridView)
        {
            dircontent=(
                <div  style={{display : "inline"}}>
                {files}
                </div>
            );
        }
        else{
            dircontent=(
                <table >
                  <thead><tr>
                  <th><button onClick={this.pathSort} ><span className="glyphicon glyphicon-sort"/>名称</button></th>
                  <th><button onClick={this.sizeSort} ><span className="glyphicon glyphicon-sort"/>大小</button></th>
                  <th><button onClick={this.timeSort} ><span className="glyphicon glyphicon-sort"/>修改日期</button></th>
                  </tr></thead>
                  <tbody>
                  {files}
                  </tbody>
                </table>
            );
        }
        return (
                    <div style={{width:"180px",
                            backgroundColor:"#888", 
                            maxHeight:"100%",
                            overflow:"auto"}}>
                        {toolbar}
                        {dircontent}
                    </div>
        );
    }
}

export default Browser;
