@echo off
echo Running dokanelbanat.com calendar builder...
echo.

REM Try py launcher first (Windows Python Launcher)
where py >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Using py launcher...
    py -3 "D:\claude-Projects\dokanelbanat\campaign\bootstrap_and_build.py"
    goto :done
)

REM Try python command
where python >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Using python command...
    python "D:\claude-Projects\dokanelbanat\campaign\bootstrap_and_build.py"
    goto :done
)

REM Try python3 command
where python3 >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo Using python3 command...
    python3 "D:\claude-Projects\dokanelbanat\campaign\bootstrap_and_build.py"
    goto :done
)

echo ERROR: Python not found. Please install Python from python.org
exit /b 1

:done
if %ERRORLEVEL% == 0 (
    echo.
    echo Checking file...
    dir "D:\claude-Projects\dokanelbanat\campaign\calendar.xlsx"
) else (
    echo Script failed with error code %ERRORLEVEL%
)
pause
