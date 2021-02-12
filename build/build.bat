@ECHO OFF
fltmc >nul 2>&1 && (
    cd /D "%~dp0"

    ECHO ************************************************ > built.log
    ECHO [%date% %time%] RequireJS Build Script started. >> built.log & cls & type built.log

    ECHO ************************************************ >> built.log
    ECHO [%date% %time%] Building \custom.css >> built.log & cls & type built.log
    node r.js -o build-customCSS.js >> built.log & cls & type built.log
    
    ECHO ************************************************ >> built.log
    ECHO [%date% %time%] Building \Scripts\viewMain.js >> built.log & cls & type built.log
    node r.js -o build-viewMain.js >> built.log & cls & type built.log
    
    ECHO ************************************************ >> built.log
    ECHO [%date% %time%] Building \Scripts\forms\profileMain.js >> built.log & cls & type built.log
    node r.js -o build-profileMain.js >> built.log & cls & type built.log
    
    ECHO ************************************************ >> built.log
    ECHO [%date% %time%] Building \Scripts\forms\wiMain.js >> built.log & cls & type built.log
    node r.js -o build-wiMain.js >> built.log & cls & type built.log
    
    ECHO ************************************************ >> built.log
    ECHO [%date% %time%] Building \Scripts\forms\wiActivityMain.js >> built.log & cls & type built.log
    node r.js -o build-wiActivityMain.js >> built.log & cls & type built.log
    
    ECHO ************************************************ >> built.log
    ECHO [%date% %time%] Building \CustomSpace\Scripts\serviceCatalog\roTaskMain.js >> built.log & cls & type built.log
    node r.js -o build-roTaskMain.js >> built.log & cls & type built.log
    
    ECHO ************************************************ >> built.log
    ECHO [%date% %time%] Building \CustomSpace\Scripts\forms\wiTaskMain.js >> built.log & cls & type built.log
    node r.js -o build-wiTaskMain.js >> built.log & cls & type built.log
    
    ECHO ************************************************ >> built.log
    ECHO [%date% %time%] Building \CustomSpace\Scripts\grids\gridTaskMain.js >> built.log & cls & type built.log
    node r.js -o build-gridTaskMain.js >> built.log & cls & type built.log
    
    ECHO ************************************************ >> built.log
    ECHO [%date% %time%] Building \CustomSpace\Scripts\page\pageTaskMain.js >> built.log & cls & type built.log
    node r.js -o build-pageTaskMain.js >> built.log & cls & type built.log
    
    ECHO ************************************************ >> built.log
    ECHO [%date% %time%] Building \CustomSpace\Scripts\forms/configItemMain.js >> built.log & cls & type built.log
    node r.js -o build-configItemMain.js >> built.log & cls & type built.log

    ECHO ************************************************ >> built.log
    ECHO [%date% %time%] RequireJS Build Script completed. >> built.log & cls & type built.log
) || (
    ECHO ************************************************
    ECHO [%date% %time%] Failure: Current permissions inadequate. Please rerun in elevated prompt.
)

REM PAUSE
