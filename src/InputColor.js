import React from 'react';
import { SketchPicker } from 'react-color';
import sprintf from 'sprintf';
import { Modal } from 'react-bootstrap';

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
        <Modal show={this.state.showModal} onClose={this.closeModal}>
          <Modal.Body>
            <SketchPicker
              disableAlpha={false}
              color={this.state.color}
              onChangeComplete={this.onChangeComplete}
            />
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-primary" onClick={this.ok}>
              确定
            </button>
            <button className="btn btn-primary" onClick={this.closeModal}>
              取消
            </button>
          </Modal.Footer>
        </Modal>
      </span>
    );
  };
}
