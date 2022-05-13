import React from 'react';
// import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Typography from '@mui/material/Typography';
let _ = require('lodash');
export default class DropdownButton extends React.Component {
  state = {
    anchorEl: null,
  };
  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = (value) => {
    this.setState({ anchorEl: null });
    // this.props.click_menu(value);
  };

  render() {
    const { anchorEl } = this.state;
    // console.log("DropdownButton render========");
    // console.log(this.props);
    let cs;
    if (_.isArray(this.props.children)) {
      cs = this.props.children.map((c, idx) => {
        // console.log(c);
        return (
          <MenuItem
            key={idx}
            onClick={(idx) => {
              c.props.onClick();
              this.setState({ anchorEl: null });
            }}
          >
            {c.props.children}
          </MenuItem>
        );
      });
    } else {
      cs = (
        <MenuItem
          onClick={(idx) => {
            this.props.children.props.onClick();
            this.setState({ anchorEl: null });
          }}
        >
          {this.props.children.props.children}
        </MenuItem>
      );
    }
    return (
      <span>
        <span
          style={{ display: 'inline' }}
          aria-owns={anchorEl ? 'simple-menu' : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          <Typography>{this.props.title}</Typography>
          <ArrowDropDownIcon />
        </span>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {cs}
        </Menu>
      </span>
    );
  }
}
