from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Supabase requires SSL connection
database_url = settings.DATABASE_URL
if database_url and database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

# FORCE IPv4: Resolve hostname to IP to bypass Render's IPv6 DNS issues
try:
    from sqlalchemy.engine.url import make_url
    import socket
    
    url_obj = make_url(database_url)
    if url_obj.host and "supabase" in url_obj.host:
        ipv4 = socket.gethostbyname(url_obj.host)
        print(f"🔄 Auto-resolved Supabase host {url_obj.host} to {ipv4} (IPv4)")
        database_url = url_obj.set(host=ipv4).render_as_string(hide_password=False)
except Exception as e:
    print(f"⚠️ Could not resolve IPv4 for database: {e}")

engine = create_engine(
    database_url,
    connect_args={"sslmode": "require"},
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for API Routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()