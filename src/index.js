import React from 'react';
<<<<<<< HEAD
import * as ReactDOMClient from 'react-dom/client'
import App from './Editor_mui';
const root=ReactDOMClient.createRoot(document.getElementById('root'));
root.render(<App />)
=======
import ReactDOM from 'react-dom';
import Browser from './Browser.jsx';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
//import ContextMenuExample from './ContextMenuExample';
ReactDOM.render(<Browser />, document.getElementById('root'));
>>>>>>> 7319b023710459d8a3eb212bf5bccd72a0f4b101
