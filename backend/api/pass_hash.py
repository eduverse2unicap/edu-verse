import os
import base64
import hashlib
from typing import Tuple
# The salt must be stored in the database alongside the password hash.
# To verify a password later, retrieve both the hash and salt from the DB.
def hash_password(password: str) -> str:
    """Hash a password with a randomly generated salt."""
    salt = os.urandom(16)
    salt_b64 = base64.b64encode(salt).decode('utf-8')
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100_000)
    pwd_hash_b64 = base64.b64encode(pwd_hash).decode('utf-8')
    res = [pwd_hash_b64, salt_b64]
    return res

def verify_password(password: str, pwd_hash_b64: str, salt_b64: str) -> bool:
    """Verify a password against the hash and salt."""
    salt = base64.b64decode(salt_b64.encode('utf-8'))
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100_000)
    return base64.b64encode(pwd_hash).decode('utf-8') == pwd_hash_b64

# Example usage:
# hashed, salt = hash_password("mysecretpassword")
# is_valid = verify_password("mysecretpassword", hashed, salt)