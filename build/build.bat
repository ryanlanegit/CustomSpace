@ECHO OFF
ECHO ************************************************ > built.log
fltmc >nul 2>&1 && (
    cd /D "%~dp0"

    ECHO RequireJS Build Script started. >> built.log & cls & type built.log

REM    ECHO ************************************************ >> built.log
REM    ECHO Building \custom.css >> built.log & cls & type built.log
REM    node "%AppData%\npm\node_modules\requirejs\bin\r.js" -o build-customCSS.js >> built.log & cls & type built.log
REM    
REM    ECHO ************************************************ >> built.log
REM    ECHO Building \Scripts\viewMain.js >> built.log & cls & type built.log
REM    node "%AppData%\npm\node_modules\requirejs\bin\r.js" -o build-viewMain.js >> built.log & cls & type built.log
REM    
REM    ECHO ************************************************ >> built.log
REM    ECHO Building \Scripts\forms\profileMain.js >> built.log & cls & type built.log
REM    node "%AppData%\npm\node_modules\requirejs\bin\r.js" -o build-profileMain.js >> built.log & cls & type built.log
REM    
REM    ECHO ************************************************ >> built.log
REM    ECHO Building \Scripts\forms\wiMain.js >> built.log & cls & type built.log
REM    node "%AppData%\npm\node_modules\requirejs\bin\r.js" -o build-wiMain.js >> built.log & cls & type built.log
REM    
REM    ECHO ************************************************ >> built.log
REM    ECHO Building \Scripts\forms\wiActivityMain.js >> built.log & cls & type built.log
REM    node "%AppData%\npm\node_modules\requirejs\bin\r.js" -o build-wiActivityMain.js >> built.log & cls & type built.log
REM    
    ECHO ************************************************ >> built.log
    ECHO Building \CustomSpace\Scripts\serviceCatalog\roTaskMain.js >> built.log & cls & type built.log
    node "%AppData%\npm\node_modules\requirejs\bin\r.js" -o build-roTaskMain.js >> built.log & cls & type built.log
    
REM   ECHO ************************************************ >> built.log
REM   ECHO Building \CustomSpace\Scripts\forms\wiTaskMain.js >> built.log & cls & type built.log
REM   node "%AppData%\npm\node_modules\requirejs\bin\r.js" -o build-wiTaskMain.js >> built.log & cls & type built.log
    
REM    ECHO ************************************************ >> built.log
REM    ECHO Building \CustomSpace\Scripts\grids\gridTaskMain.js >> built.log & cls & type built.log
REM    node "%AppData%\npm\node_modules\requirejs\bin\r.js" -o build-gridTaskMain.js >> built.log & cls & type built.log

    ECHO ************************************************ >> built.log
    ECHO RequireJS Build Script completed. >> built.log & cls & type built.log
) || (
    ECHO Failure: Current permissions inadequate. Please rerun in elevated prompt. >> built.log & cls & type built.log
)

REM PAUSE