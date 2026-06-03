#!/usr/bin/env python3
"""Standalone verifier - checks Python/openpyxl availability then runs calendar builder."""
import sys, os

print(f"Python: {sys.version}")
print(f"Working dir: {os.getcwd()}")

try:
    import openpyxl
    print(f"openpyxl version: {openpyxl.__version__}")
except ImportError as e:
    print(f"openpyxl NOT available: {e}")
    print("Install with: pip install openpyxl")
    sys.exit(1)

# Run the main script
import subprocess
result = subprocess.run(
    [sys.executable, r"D:\claude-Projects\dokanelbanat\campaign\exec_calendar.py"],
    capture_output=True, text=True, encoding="utf-8"
)
print("--- CALENDAR BUILDER OUTPUT ---")
print(result.stdout)
if result.stderr:
    print("--- STDERR ---")
    print(result.stderr)
print(f"Exit code: {result.returncode}")

# Check file
import pathlib
p = pathlib.Path(r"D:\claude-Projects\dokanelbanat\campaign\calendar.xlsx")
if p.exists():
    print(f"\nFile confirmed: {p}")
    print(f"Size: {p.stat().st_size:,} bytes")
    print("\nCALENDAR DONE")
else:
    print("\nERROR: calendar.xlsx not found after script execution")
    sys.exit(1)
