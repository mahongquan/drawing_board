import React from 'react';
import { SketchPicker } from 'react-color';
import { sprintf } from "printj/printj.mjs";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export default class InputColor extends React.Component {
  constructor(props) {
    super();
    this.state = { showModal: false, color: props.value };
  }
  componentWillReceiveProps(nextProps) {
    // console.log(nextProps)
    if (nextProps.value) {
      this.setState({ color: nextProps.value });
    }
  }
  click = () => {
    this.setState({ showModal: true });
  };
  closeModal = () => {
    this.setState({ showModal: false });
  };
  ok = () => {
    this.props.onChange(this.state.color);
    this.setState({ showModal: false });
  };
  onChangeComplete = vcolor => {
    console.log(vcolor);
    let s = sprintf(
      'rgba(%d,%d,%d,%f)',
      vcolor.rgb.r,
      vcolor.rgb.g,
      vcolor.rgb.b,
      vcolor.rgb.a
    );
    this.setState({ color: s });
  };
  render = () => {
    return (
      <span>
        <label
          onClick={this.click}
          style={{ display: 'inline', backgroundColor: this.props.value }}
        >
          {this.props.value}
        </label>
        <Dialog open={this.state.showModal} onClose={this.closeModal}>
          <DialogContent>
            <SketchPicker
              disableAlpha={false}
              color={this.state.color}
              onChangeComplete={this.onChangeComplete}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              className="btn btn-primary"
              onClick={this.ok}
            >
              确定
            </Button>
            <Button
              variant="outlined"
              className="btn btn-primary"
              onClick={this.closeModal}
            >
              取消
            </Button>
          </DialogActions>
        </Dialog>
      </span>
    );
  };
}
