import psycopg2
import sys

# Common passwords to try for local development
passwords = ['', 'postgres', 'password', 'admin', 'root', '123456', 'sulthanshafeer']
users = ['sulthanshafeer', 'postgres']
dbname = 'postgres'  # Try connecting to default db first
port = 5433

for user in users:
    for pwd in passwords:
        try:
            print(f"Testing: user='{user}' password='{pwd}' port={port}...")
            conn = psycopg2.connect(
                dbname=dbname,
                user=user,
                password=pwd,
                host='localhost',
                port=port
            )
            print(f"SUCCESS: Connected with user='{user}' and password='{pwd}'")
            conn.close()
            sys.exit(0)
        except Exception as e:
            print(f"FAILED: user='{user}' password='{pwd}' - {e}")

print("All attempts failed.")
