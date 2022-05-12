import SortableTree from 'react-sortable-tree';
import React from 'react';
var io = require("socket.io-client");
var socket=io('http://localhost:8000');
export default class Tree1 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      treeData: [],
    };
  }
  loadFilesFromServer=(path)=>{
        var self=this;
            socket.emit("list",{path:path},(data)=>{
                    console.log(data);
                    self.setState({
                      treeData:[{title:data.title,children:data.children}]
                    });
                    //self.updateNavbarPath(self.currentPath());
            });
    }
  componentDidMount=()=>{
        var path = ".";
        this.loadFilesFromServer(path);
    }
  render() {
    console.log("treeData")
    console.log(this.state.treeData);
    return (
      <div style={{ height: 400 }}>
        <SortableTree
          treeData={this.state.treeData}
          onChange={treeData => this.setState({ treeData })}
        />
      </div>
    );
  }
}