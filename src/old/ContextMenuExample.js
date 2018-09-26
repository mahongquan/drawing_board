import React from 'react';
import {Overlay,Tooltip} from "react-bootstrap";
class  ContextMenuExample extends  React.Component{
  state={ 
  	showcontext: false,
  	target:null,
  }
  handleContextMenu = (event) => {
  	console.log(event);
    event.preventDefault();
    event.stopPropagation();
	this.setState({target:event.target,showcontext:true});
  }
  rename=()=>{
    	console.log("rename")
    	this.setState({showcontext:false});
    }
    remove=()=>{
    	console.log("remove")
    	this.setState({showcontext:false});
    }
  render=()=>{
  	const data=["clickme","clickme","clickme"];
  	const views=data.map((item,idx)=>{
  		return(
  			<span key={idx}  onContextMenu={this.handleContextMenu}>
	          Click me!
	        </span>
		);
  	});
  	//var target1=ReactDOM.findDOMNode(this.refs.target);
    return (
      <div >
        <Overlay target={this.state.target} 
        container={this} show={this.state.showcontext}  placement="bottom">
        	<Tooltip id="tooltip1" >
	        	<div onClick={this.rename}>rename</div>
	        	<div onClick={this.remove}>remove</div>
        	</Tooltip>
        </Overlay>
        {
        	views
        }
      </div>
    );
  }
}
export default ContextMenuExample;
