import hashlib


# Function to generate a consistent hash from text
def get_consistent_hash(text: str) -> str:
    """
    Generate a cryptographically stronger hash value from a string.

    This implementation uses SHA-256 for better collision resistance
    and more uniform distribution of hash values.

    Args:
        text: The input text to hash

    Returns:
        A consistent 12-character hash value as string
    """

    # Use SHA-256 for better collision resistance
    hash_obj = hashlib.sha256(text.encode("utf-8"))
    # Get hexadecimal digest and take first 12 characters
    return hash_obj.hexdigest()[:12]
