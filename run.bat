rem %~d0 是当前盘符
rem %cd% 是当前目录
set path=%~d0\nodejs;%cd%
node_modules\.bin\electron . --local
rem .\out\Sqlectron-win32-ia32\sqlectron.exe
