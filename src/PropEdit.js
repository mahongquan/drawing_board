import React from 'react';
const fprops=["left", "top", "width", "height","fill", "opacity"
, "stroke", "strokeWidth","scaleX", "scaleY", "angle","flipX", "flipY","skewX", "skewY"]
const tprops=["int", "int", "int", "int","str", "int"
, "str", "int","int", "int", "int","bool", "bool","int", "int"]

export default class App extends React.Component {
  constructor(props) {
    super();
    if(props.selected){
        this.state=props.selected[0];
    }
    else{
      this.state={};
    }
  }
  componentWillReceiveProps(nextProps) {
    console.log(nextProps)
    if(nextProps.selected){
        this.setState(nextProps.selected[0]);
    }
  }
  // left_change=(e)=>{
  //   let v=parseInt(e.target.value, 10)
  //   this.setState({left:v});
  //   this.props.propChange({left:v});
  // }
  // fill_change=(e)=>{
  //   let v=e.target.value;
  //   this.setState({fill:v});
  //   this.props.propChange({fill:v});
  // }
  // stroke_change=(e)=>{
  //   let v=e.target.value;
  //   this.setState({stroke:v});
  //   this.props.propChange({stroke:v});
  // }
  prop_change=(index,e)=>{
    let p=fprops[index] //e.target.getAttribute("data")
    let v=e.target.value;
    console.log(p);
    console.log(v);
    if(tprops[index]==="int"){
      v=parseInt(v, 10)
    }
    let data={}
    data[p]=v
    this.setState(data);
    this.props.propChange(data);
  }
  render = () => {
    console.log(this.state);
    let trs=fprops.map((item,index)=>{
      if (this.state[item]){
        return (<tr key={index}>
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        marginRight: '10px',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                      }}
                    >
                      {item}:
                    </div>
                  </td>
                  <td><input data={item} value={this.state[item]} onChange={(e)=>{this.prop_change(index,e)}} /></td>
                </tr>);
      }
     else{
      return null;
     }
    })
    return (
          <table>
            <tbody>
              {trs}
            </tbody>
          </table>
    );
  };
}
// left, top; dimension — width, height; rendering — fill, opacity, stroke, strokeWidth; scaling and rotation — scaleX, scaleY, angle; and even those related to flipping — flipX, flipY and skewing skewX, skewY
              // <tr>
              //   <td>
              //     <div
              //       style={{
              //         display: 'flex',
              //         marginRight: '10px',
              //         justifyContent: 'flex-end',
              //         alignItems: 'center',
              //       }}
              //     >
              //       fill:
              //     </div>
              //   </td>
              //   <td><input value={this.state.fill} onChange={this.fill_change} /></td>
              // </tr>
              // <tr>
              //   <td
              //     style={{
              //       display: 'flex',
              //       marginRight: '10px',
              //       justifyContent: 'flex-end',
              //       alignItems: 'center',
              //     }}
              //   >
              //     left:
              //   </td>
              //   <td><input value={this.state.left} onChange={this.left_change} /></td>
              // </tr>
              // <tr>
              //   <td
              //     style={{
              //       display: 'flex',
              //       marginRight: '10px',
              //       justifyContent: 'flex-end',
              //       alignItems: 'center',
              //     }}
              //   >
              //     stroke:
              //   </td>
              //   <td><input value={this.state.stroke} onChange={this.stroke_change} /></td>
              // </tr>