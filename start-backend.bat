@echo off
cd /d "C:\Users\bontu\sacco-management-system\backend"
call gradlew.bat bootRun -x buildFrontend > backend-output.log 2>&1
