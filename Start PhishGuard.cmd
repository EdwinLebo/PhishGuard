@echo off
cd /d "%~dp0"
if not exist node_modules call npm.cmd install
echo Open the Local address printed below in your browser.
call npm.cmd run dev
