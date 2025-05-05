"""
Database connection handling for the FastAPI application.
"""

# =====
# SETUP
# =====
# General imports
import sqlite3
import os
from contextlib import contextmanager

# Third-party imports
import sqlite_vec  # Ensure sqlite_vec is importable, installed via requirements

# ==========
# CONSTANTS
# ==========
# Determine the absolute path to the database file relative to this file.
# __file__ is the path to db.py
# os.path.dirname(__file__) is the directory containing db.py (backend/)
DATABASE_PATH = os.path.join(os.path.dirname(__file__), "database.sqlite")


# ===============
# HELPER FUNCTION
# ===============


def _dict_factory(cursor, row):
    """
    Convert query results from tuples to dictionaries, allowing column name access.
    """
    fields = [column[0] for column in cursor.description]
    return {key: value for key, value in zip(fields, row)}


# ====================
# CONNECTION MANAGER
# ====================


@contextmanager
def get_db_connection():
    """
    Provides a managed database connection using a context manager.

    Ensures the connection is properly closed even if errors occur.
    Connects in read-only mode and enables WAL journaling for better concurrency
    as recommended for the API server in the project description.
    """
    conn = None
    try:
        # Connect in read-write mode using URI to allow setting WAL
        conn = sqlite3.connect(
            f"file:{DATABASE_PATH}?mode=rw",
            uri=True,
            timeout=5.0,  # Set a reasonable timeout
            check_same_thread=False,  # Required for FastAPI/multi-threaded use
        )
        conn.enable_load_extension(True)
        sqlite_vec.load(conn)  # Load the sqlite-vec extension
        conn.row_factory = _dict_factory  # Return rows as dictionaries
        conn.execute("PRAGMA journal_mode=WAL;")  # Use WAL for concurrency
        yield conn
    except sqlite3.Error as e:
        print(f"Database connection error: {e}")
        # Re-raise or handle as appropriate for your application
        raise
    finally:
        if conn:
            conn.close()


# =====================
# FASTAPI DEPENDENCY
# =====================


def get_db():
    """
    FastAPI dependency that yields a database connection for a single request.

    Uses the context manager to ensure the connection is closed after the request.
    """
    with get_db_connection() as db:
        yield db
