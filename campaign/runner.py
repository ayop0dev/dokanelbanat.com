import subprocess, sys, os

result = subprocess.run(
    [sys.executable, r"D:\claude-Projects\dokanelbanat\campaign\exec_calendar.py"],
    capture_output=True, text=True
)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
print("Return code:", result.returncode)
