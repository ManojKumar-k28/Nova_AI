import sys
from os.path import dirname, abspath, join

# Add backend directory to Python path so that 'app' module and 'main.py' can be imported correctly
backend_path = join(dirname(dirname(abspath(__file__))), 'backend')
sys.path.insert(0, backend_path)

from main import app
