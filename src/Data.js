const fs = window.require('fs');
const path = window.require('path');
class Board {
  static id1 = 0;
  constructor(title) {
    this.title = title;
    this.id = Data.config.id++;
    this.stories = [];
  }
}
function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
}
class Story {
  constructor(color, description, duan, time) {
    this.color = color;
    this.description = description;
    this.id = Data.config.id++;
    this.time = time;
    this.duan = duan;
  }
}
const initpath = window.require('electron').ipcRenderer.sendSync('getpath');
class Data {
  static duan_name = ['将要做', '进行中', '已完成'];
  static clearStage(stage) {
    let board = Data.config.boards[stage.board_index];
    let stories = board.stories;
    let new_stories = [];
    for (var i = 0; i < stories.length; i++) {
      let item = stories[i];
      if (item.duan != stage.duan) {
        new_stories.push(item);
      }
    }
    board.stories = new_stories;
  }
  static new_Story(board_index, color, description, duan) {
    let s = new Story(color, description);
    s.duan = duan;
    Data.config.boards[board_index].stories.push(s);
  }
  static new_Board(name) {
    let b = new Board(name);
    Data.config.boards.push(b);
  }
  static saveconfig = () => {
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
      // console.log(Data.config);
      if (!isObject(Data.config)) {
        Data.config = {};
      }
      if (!Data.config.id) {
        Data.config.id = 0;
      }
      if (!Data.config.version) {
        Data.config.version = '0.1';
      }
      if (!Data.config.author) {
        Data.config.author = {
          name: 'mahongquan',
          email: 'mahongquan@sina.com',
        };
      }
      if (!Data.config.website) {
        Data.config.website = 'http://github.com/mahongquan/notepad';
      }
      if (!Data.config.boards) {
        Data.config.boards = [];
      }
    } catch (e) {
      console.log(e);
      return {};
    }
  };
  static config = {};
}
export default Data;
