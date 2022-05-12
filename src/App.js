import React, { Component } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import update from 'immutability-helper';
import blue from '@mui/material/colors/blue';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import Select from '@mui/material/Select';
import withRoot from './withRoot';
class SimpleSelect extends React.Component {
  state = {
    age: '',
    name: 'hai',
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  onClick = () => {
    console.log('click');
  };
  render() {
    // const { classes } = this.props;

    return (
      <Select
        value="baoxiang"
        onChange={this.handleChange}
        inputProps={{
          name: 'age',
          id: 'age-simple',
        }}
      >
        <MenuItem value="" onClick={this.onClick}>
          <em>None</em>
        </MenuItem>
        <MenuItem value={10} onClick={this.onClick}>
          Ten
        </MenuItem>
        <MenuItem value={20} onClick={this.onClick}>
          Twenty
        </MenuItem>
        <MenuItem value={30} onClick={this.onClick}>
          Thirty
        </MenuItem>
      </Select>
    );
  }
}

SimpleSelect.propTypes = {
  classes: PropTypes.object.isRequired,
};

var SimpleSelectStyle = withStyles(styles)(SimpleSelect);
var host = '';
class App extends Component {
  mystate = {
    start: 0,
    limit: 10,
    total: 0,
    baoxiang: '',
    logined: false,
    search: '',
  };
  state = {
    contacts: [],
    limit: 10,
    user: 'AnonymousUser',
    start: 0,
    total: 0,
    search: '',
    start_input: 1,
    currentIndex: null,
    baoxiang: '',
    open: false,
    anchorEl: null,
  };
  componentDidMount = () => {
    this.load_data();
  };
  load_data = () => {
    // Client.contacts(
    //   { start:this.mystate.start,
    //     limit:this.mystate.limit,
    //     search:this.mystate.search,
    //     baoxiang:this.mystate.baoxiang,
    //   },
    //   (contacts) => {
    //     var user=contacts.user;
    //     if(user===undefined){
    //       user="AnonymousUser"
    //     }
    //     this.mystate.total=contacts.total;//because async ,mystate set must before state;
    //     this.setState({
    //       contacts: contacts.data, //.slice(0, MATCHING_ITEM_LIMIT),
    //       limit:this.mystate.limit,
    //       user: user,
    //       total:contacts.total,
    //       start:this.mystate.start
    //     });
    // });
  };
  // removeFoodItem = (itemIndex) => {
  //   const filteredFoods = this.state.selectedFoods.filter(
  //     (item, idx) => itemIndex !== idx,
  //   );
  //   this.setState({ selectedFoods: filteredFoods });
  // }

  // addFood = (food) => {
  //   const newFoods = this.state.selectedFoods.concat(food);
  //   this.setState({ selectedFoods: newFoods });
  // }
  handleTest = () => {
    //const contact2=update(this.state.contacts[this.state.selected],{baoxiang: {$set: "test"}});
    // console.log("handleTest");
    //console.log(contact2);
    //var one=this.state.contacts[this.state.selected];
    var idx = this.state.selected;
    console.log(idx);
    const contacts2 = update(this.state.contacts, {
      [idx]: { baoxiang: { $set: 'test111' } },
    });
    console.log(contacts2);
    //this.state.contacts[this.state.selected].baoxiang="test";
    this.setState({ contacts: contacts2 });
    //this.forceUpdate();
  };
  handleContactChange = (idx, contact) => {
    console.log(idx);
    const contacts2 = update(this.state.contacts, { [idx]: { $set: contact } });
    console.log(contacts2);
    this.setState({ contacts: contacts2 });
  };
  oncontactClick = key => {
    console.log('click row');
    console.log(key);
    this.setState({ selected: key });
  };
  handleImportStandard = () => {
    console.log('import row');
  };
  handleUserChange = user => {
    if (user === 'AnonymousUser') {
      this.setState({
        logined: false,
      });
    } else {
      this.setState({
        logined: true,
      });
    }
    this.setState({
      user: user,
      contacts: [], //slice(0, MATCHING_ITEM_LIMIT),
    });
    this.componentDidMount();
  };
  handleTouchTap = event => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };
  showlogin = () => {
    console.log('showlogin');
    var data = {
      username: 'mahongquan',
      password: '333333',
    };
    this.onLoginSubmit(data);
  };
  handleLogin = () => {
    console.log('login');
    Client.login_index(data => {
      //console.log(data.csrf_token);
      // const cookies = new Cookies();

      // cookies.set('csrftoken', this.state.csrf_token, { path: '/' });
      this.showlogin();
    });
  };
  handleLogout = () => {
    console.log('logout');
    Client.logout(data => {
      console.log('logout' + data);
      this.setState({
        logined: false,
        user: 'AnonymousUser',
      });
      this.handleUserChange(this.state.user);
    });
  };
  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };
  handleSearchChange = e => {
    const value = e.target.value;

    this.setState({
      searchValue: value,
    });

    if (value === '') {
      this.setState({
        contacts: [],
        showRemoveIcon: false,
      });
    } else {
      this.setState({
        showRemoveIcon: true,
      });

      Client.contacts(value, contacts => {
        this.setState({
          contacts: contacts.data, //.slice(0, MATCHING_ITEM_LIMIT),
        });
      });
    }
  };
  handleSearchChange = e => {
    this.mystate.search = e.target.value;
    this.setState({ search: this.mystate.search });
  };
  handlePrev = e => {
    this.mystate.start = this.mystate.start - this.mystate.limit;
    if (this.mystate.start < 0) {
      this.mystate.start = 0;
    }
    this.load_data();
  };
  search = e => {
    this.mystate.start = 0;
    this.load_data();
  };
  jump = () => {
    this.mystate.start = parseInt(this.state.start_input, 10) - 1;
    if (this.mystate.start > this.mystate.total - this.mystate.limit)
      this.mystate.start = this.mystate.total - this.mystate.limit; //total >limit
    if (this.mystate.start < 0) {
      this.mystate.start = 0;
    }
    this.load_data();
  };
  handlePageChange = e => {
    this.setState({ start_input: e.target.value });
  };

  onDetailClick = contactid => {
    console.log(contactid);
    window.open(
      host + '/parts/showcontact/?id=' + contactid,
      'detail',
      'height=800,width=800,resizable=yes,scrollbars=yes'
    );
  };
  handleNext = e => {
    this.mystate.start = this.mystate.start + this.mystate.limit;
    if (this.mystate.start > this.mystate.total - this.mystate.limit)
      this.mystate.start = this.mystate.total - this.mystate.limit; //total >limit
    if (this.mystate.start < 0) {
      this.mystate.start = 0;
    }
    this.load_data();
  };

  onLoginSubmit = data => {
    console.log(data);
    Client.login(data.username, data.password, res => {
      if (res.success) {
        this.setState({
          logined: true,
        });
        this.setState({
          user: data.username,
        });
        this.handleUserChange(this.state.user);
      }
    });
  };
  inputChange = e => {
    console.log(this.refs.input);
    console.log(this.refs.style);
    var style = getComputedStyle(this.refs.input, null);
    console.log(style);
    this.setState({ test_input: e.target.value });
  };
  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };
  render() {
    const contactRows = this.state.contacts.map((contact, idx) => (
      <TableRow key={idx} onClick={() => this.oncontactClick(idx)}>
        <TableCell>{contact.id}</TableCell>
        <TableCell>{contact.hetongbh}</TableCell>
        <TableCell>{contact.yonghu}</TableCell>
        <TableCell>{contact.baoxiang}</TableCell>
        <TableCell>{contact.yiqixinghao}</TableCell>
      </TableRow>
    ));
    var hasprev = true;
    var hasnext = true;
    let prev;
    let next;
    console.log(this.mystate);
    console.log(this.state);
    if (this.state.start === 0) {
      hasprev = false;
    }
    console.log(this.state.start + this.state.limit >= this.state.total);
    if (this.state.start + this.state.limit >= this.state.total) {
      hasnext = false;
    }
    if (hasprev) {
      prev = <button onClick={this.handlePrev}>前一页</button>;
    } else {
      prev = null;
    }
    if (hasnext) {
      next = <button onClick={this.handleNext}>后一页</button>;
    } else {
      next = null;
    }
    const { anchorEl } = this.state;
    return (
      <div className="App">
        <Toolbar>
          <TextField
            id="id_search"
            type="text"
            placeholder="Search instrument..."
            value={this.state.searchValue}
            onChange={this.handleSearchChange}
          />
          <div>
            <Button onClick={this.handleTest}>test</Button>
            <Button
              aria-owns={anchorEl ? 'simple-menu' : null}
              aria-haspopup="true"
              onClick={this.handleClick}
            >
              {this.state.user}
            </Button>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleClose}
            >
              <MenuItem onClick={this.handleLogout}>注销</MenuItem>
            </Menu>
          </div>
        </Toolbar>
        <Typography variant="h4" gutterBottom>
          Material-UI
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>id</TableCell>
              <TableCell>合同编号</TableCell>
              <TableCell>用户单位</TableCell>
              <TableCell>包箱</TableCell>
              <TableCell>仪器型号</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{contactRows}</TableBody>
        </Table>
        {prev}
        <label id="page">
          {this.state.start + 1}../{this.state.total}
        </label>
        {next}
        <input
          maxLength="6"
          size="6"
          onChange={this.handlePageChange}
          value={this.state.start_input}
        />
        <Button id="page_go" className="btn btn-info" onClick={this.jump}>
          跳转
        </Button>
        <SimpleSelectStyle />
      </div>
    );
  }
}
export default withRoot(withStyles(styles)(App));
