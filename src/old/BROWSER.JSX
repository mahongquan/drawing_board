import React from 'react';
//import {Button,Overlay,Navbar,Nav,NavItem,Tooltip,OverlayTrigger} from "react-bootstrap";
//import update from 'immutability-helper';
var Aria2 = require('aria2');
var aria2 = new Aria2({
  host: 'localhost',
  port: 6800,
  secure: false,
  secret: '',
  path: '/jsonrpc'
});
 // aria2.send('getVersion').then(
 //    function (res) {
 //      console.log('result', res)
 //    },
 //    function (err) {
 //      console.log('error', err)
 //    }
 //  )
 // // triggered when a message is being sent
 //  aria2.onsend = function (m) {
 //    console.log('aria2 OUT:', m)
 //  }

 //  // triggered when a message has been received
 //  aria2.onmessage = function (m) {
 //    console.log('aria2 IN:', m)
 //  }

 //  // triggered when socket is open
 //  aria2.onopen = function () {
 //    console.log('aria2 OPEN')
 //  }

 //  // triggered when socket is closed
 //  aria2.onclose = function () {
 //    console.log('aria2 CLOSED')
 //  }

 //  aria2.onDownloadStart = function (gid) {
 //    console.log('downloadStart', gid)
 //  }

 //  // WebSocket is not open so HTTP transport will be used
 //  aria2.send('getVersion', function (err, res) {
 //    console.log('version: ', err || res)

 //    // open WebSocket
 //    aria2.open(function () {
 //      console.log('open')

 //      // WebSocket is open so WebSocket transport will be used
 //      aria2.getGlobalOption(function (err, res) {
 //        console.log('global options: ', err || res)

 //        aria2.send('addUri', ['http://example.org/file', 'http://mirror/file'], {'dir': '/tmp'}, function (err, gid) {
 //          console.log(err || 'gid: ' + gid)

 //          // close socket
 //          // aria2.close(function () {
 //          //   console.log('closed')
 //          // })
 //        })
 //      })
 //    })
 //  })
class  Browser extends React.Component {
    state={
        version:"",
    }
    componentDidMount=()=>{
        console.log("mount======");
        aria2.getVersion().then(
            (res)=>{
                console.log(res);
                this.setState({version:""+res.version});
            },
            function (err) {
              console.log('error', err)
            }
        )
        aria2.onsend =this.onsend;
        aria2.onmessage =this.onmessage;
        aria2.onopen=this.onopen;
        aria2.onclose=this.onclose;
        aria2.onDownloadStart =this.onDownloadStart;
    }
    onsend=(m)=>{

    }
    onmessage=(m)=>{}
    onopen=()=>{}
    onclose=()=>{}
    onDownloadStart=()=>{

    }
    render=()=>{
        return(<div>aria2 version:{this.state.version}
        </div>);
    }
}
export default Browser;
