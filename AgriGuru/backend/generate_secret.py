import secrets

# Generate a secure secret key
secret_key = secrets.token_hex(32)
print("\nYour secret key is:")
print(secret_key)
print("\nAdd this to your .env file as:")
print("SECRET_KEY=" + secret_key)
