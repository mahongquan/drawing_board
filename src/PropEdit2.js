import React from 'react';
import InputColor from './InputColor_mui';
import TextField from '@mui/material/TextField';
var _=require("lodash");
// let fprops2=[]
const fprops = [
  'left',
  'top',
  'width',
  'height',
  'fill',
  'opacity',
  'stroke',
  'strokeWidth',
  'scaleX',
  'scaleY',
  'angle',
  'flipX',
  'flipY',
  'skewX',
  'skewY',
];
const tprops = [
  'int',
  'int',
  'int',
  'int',
  'color',
  'int',
  'color',
  'int',
  'int',
  'int',
  'int',
  'bool',
  'bool',
  'int',
  'int',
];
function myin(arr,v){
  for(var i=0;i<arr.length;i++){
    if(v===arr[i]) return true;
  }
  return false;
}
export default class App extends React.Component {
  constructor(props) {
    super();
    if (props.selected) {
      this.state = props.selected[0];
    } else {
      this.state = {};
    }
  }
  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    if (nextProps.selected) {
      this.setState(nextProps.selected[0]);
    }
  }
  prop_change = (index, e) => {
    let p = fprops[index]; //e.target.getAttribute("data")
    let v = e.target.value;
    console.log(p);
    console.log(v);
    if (tprops[index] === 'int') {
      v = parseInt(v, 10);
    }
    let data = {};
    data[p] = v;
    this.setState(data);
    this.props.propChange(data);
  };
  prop_color_change = (index, e) => {
    let p = fprops[index]; //e.target.getAttribute("data")
    let v = e;
    let data = {};
    data[p] = v;
    this.setState(data);
    this.props.propChange(data);
  };

  render = () => {
    console.log(this.state);
    console.log(this.props);
    if(!this.props.selected){ return <div>no selected</div>}
    let obj=this.props.selected[0];
    for(var attr in obj){
      if(!_.isFunction(obj[attr])){
        if( myin(fprops,attr)){
          ;
        }
        else{
          fprops.push(attr);
        }
      }
    }
    let trs = fprops.map((item, index) => {
      if (this.state[item]) {
        if (tprops[index] === 'color') {
          return (
            <tr key={index}>
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
              <td>
                <InputColor
                  data={item}
                  value={this.state[item]}
                  onChange={e => {
                    this.prop_color_change(index, e);
                  }}
                />
              </td>
            </tr>
          );
        }
        return (
          <tr key={index}>
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
            <td>
              <TextField
                data={item}
                value={this.state[item]}
                onChange={e => {
                  this.prop_change(index, e);
                }}
              />
            </td>
          </tr>
        );
      } else {
        return null;
      }
    });
    return (
      <table>
        <tbody>{trs}</tbody>
      </table>
    );
  };
}
