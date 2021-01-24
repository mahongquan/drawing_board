const fs = window.require('fs');
const path = window.require('path');
function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
}
const initpath = window.require('electron').ipcRenderer.sendSync('getpath');
class Data {
  static saveconfig = state => {
    Data.config.state = state;
    const configName = 'config.json';
    let configPath = path.join(initpath, configName);
    fs.writeFileSync(configPath, JSON.stringify(Data.config));
  };
  static getconfig = () => {
    try {
      const configName = 'config.json';
      let configPath = path.join(initpath, configName);
      console.log(configPath);
      let data = fs.readFileSync(configPath, { enconding: 'utf-8' });
      Data.config = JSON.parse(data);
      if (!isObject(Data.config)) {
        Data.config = {};
      }
      if (!Data.config.id) {
        Data.config.id = 0;
      }
      if (!Data.config.version) {
        Data.config.version = '0.2';
      }
      if (!Data.config.author) {
        Data.config.author = {
          name: 'mahongquan',
          email: 'mahongquan@sina.com',
        };
      }
      if (!Data.config.website) {
        Data.config.website = 'http://github.com/mahongquan/drawing_board';
      }
      if (!Data.config.state) {
        Data.config.state = {
          background_color: '#002200',
          undo_disabled: true,
          redo_disabled: true,
          fill: 'rgba(100,200,123,0.5)',
          zoom: 1,
          mode: 'Pencil',
          shadow_color: '#00FF00',
          shadow_width: 10,
          shadow_offset: 4,
          show_about: false,
          show_color: false,
          show_prop: 'none',
          canvasSize: { width: 1000, height: 700 },
          showPreview: 'none',
          html_editor_h: 600,
          edit_width: 800,
          filename: '',
          selectValue: '',
          active_tool: 0,
          pen_width: 10,
          pen_color: '#0000ff',
          selected: null,
        };
      }
    } catch (e) {
      console.log(e);
      return {};
    }
  };
  static config = {
    author: {},
    state: {
      background_color: '#002200',
      undo_disabled: true,
      redo_disabled: true,
      fill: 'rgba(100,200,123,0.5)',
      zoom: 1,
      mode: 'Pencil',
      shadow_color: '#00FF00',
      shadow_width: 10,
      shadow_offset: 4,
      show_about: false,
      show_color: false,
      show_prop: 'none',
      canvasSize: { width: 1000, height: 700 },
      showPreview: 'none',
      html_editor_h: 600,
      edit_width: 800,
      filename: '',
      selectValue: '',
      active_tool: 0,
      pen_width: 10,
      pen_color: '#0000ff',
      selected: null,
    },
  };
}
export default Data;
