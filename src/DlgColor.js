import React from 'react';
import { Modal } from 'react-bootstrap';
import data from './Data';
var { shell } = window.require('electron'); //
export default class App extends React.Component {
  onClick = () => {
    shell.openExternal(data.config.website);
  };
  render = () => {
    return (
      <Modal show={this.props.showModal} onClose={this.props.closeModal}>
        <Modal.Header>关于"drawing board"</Modal.Header>
        <Modal.Body>
          <table>
            <tbody>
              <tr>
                <td>
                  <div
                    style={{
                      display: 'flex',
                      marginRight: '10px',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                    版本:
                  </div>
                </td>
                <td>{data.config.version}</td>
              </tr>
              <tr>
                <td
                  style={{
                    display: 'flex',
                    marginRight: '10px',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}
                >
                  作者:
                </td>
                <td>{data.config.author.name}</td>
              </tr>
              <tr>
                <td
                  style={{
                    display: 'flex',
                    marginRight: '10px',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}
                >
                  电子邮箱:
                </td>
                <td>{data.config.author.email}</td>
              </tr>
              <tr>
                <td
                  style={{
                    display: 'flex',
                    marginRight: '10px',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}
                >
                  网站:
                </td>
                <td>
                  <a onClick={this.onClick}>{data.config.website}</a>
                </td>
              </tr>
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary" onClick={this.props.closeModal}>
            确定
          </button>
        </Modal.Footer>
      </Modal>
    );
  };
}
