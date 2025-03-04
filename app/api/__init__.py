from flask import Blueprint

bp = Blueprint('api', __name__)

from app.api import auth, books, errors

# Register error handlers
from app.api.errors import error_response
bp.register_error_handler(404, lambda e: error_response(404))
bp.register_error_handler(500, lambda e: error_response(500)) 