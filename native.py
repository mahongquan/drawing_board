import os
import shutil
dir1=r".\node_modules\sqlite3\lib\binding\electron-v1.8-win32-ia32"
if not os.path.exists(dir1):
	os.makedirs(dir1)
srcfile="node_sqlite3.node"
desfile=".\\node_modules\\sqlite3\\lib\\binding\\electron-v1.8-win32-ia32\\node_sqlite3.node"
shutil.copyfile(srcfile,desfile)
dir1=r".\node_modules\serialport\build\Release"
if not os.path.exists(dir1):
	os.makedirs(dir1)	
srcfile="serialport.node"
desfile=".\\node_modules\\serialport\\build\\Release\\serialport.node"
shutil.copyfile(srcfile,desfile)