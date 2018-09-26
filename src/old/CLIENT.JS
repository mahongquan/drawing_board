/* eslint-disable no-undef */
var io = require("socket.io-client");
var socket=io('http://localhost:8000');
function getRaw(url,cb) {
  socket.emit("/get"+url,{},cb);
}
function get(url,data,cb) {
  console.log("emit")
  console.log(url);
  console.log(data);
  socket.emit("/get"+url,data,cb)
}
function delete1(url,data,cb) {

  socket.emit("/delete"+url,data,cb)
}
function post(url,data,cb) {
  socket.emit("/post"+url,data,cb)
}
function put(url,data,cb) {
  socket.emit("/put"+url,data,cb)
}
function postOrPut(url,data,cb) {
  var method="post"
  if (data.id){
    method="put"
  }
  socket.emit("/"+method+url,data,cb)
}
function postForm(url,data,cb) {
  socket.emit("/post"+url,data,cb)
}
function contacts(data, cb) {
  socket.emit("/get/Contact",data,cb)
}
function UsePacks(query, cb) {
  console.log("UsePacks");
  console.log(query);
  socket.emit("/get/UsePack",{contact_id:query},cb)
}
function PackItems(query, cb) {
  socket.emit("/get/PackItem",{pack_id:query,limit:200},cb)
}
function items(query, cb) {
  socket.emit("/get/Item",{search:query},cb)
}
function login_index( cb) {
}
function logout( cb) {
}
function login(username,password,cb) {
}
const Client = {put,getRaw,contacts,items,login_index,login,logout,UsePacks,PackItems,get,post,postOrPut,delete1,postForm};
export default Client;
