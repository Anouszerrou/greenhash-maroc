"""Legacy entry point. Prefer running with the package module: 
   python -m backend.app

This file uses the factory in backend.__init__ to create the app.
"""
import os
import sys
from . import create_app


def main():
    # Create app using factory
    app = create_app()

    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() in ['true', '1', 't']
    app.run(host='0.0.0.0', port=port, debug=debug)


if __name__ == '__main__':
    # When executed as a module (python -m backend.app), relative imports work.
    main()