import asyncio
from pathlib import Path

from app.db.engine import build_engine, build_session_factory
from app.main import run_migrations
from sqlalchemy import text


def test_migrations_run_idempotently(tmp_path: Path) -> None:
    database_url = f"sqlite+aiosqlite:///{tmp_path / 'migrate.db'}"

    run_migrations(database_url)
    run_migrations(database_url)

    engine = build_engine(database_url)

    async def _collect() -> set[str]:
        statement = text("SELECT name FROM sqlite_master WHERE type='table'")
        async with engine.connect() as connection:
            rows = await connection.run_sync(lambda conn: conn.execute(statement).fetchall())
            return {row[0] for row in rows}

    try:
        tables = asyncio.run(_collect())
    finally:
        asyncio.run(engine.dispose())

    assert "readings" in tables
    assert "alembic_version" in tables


def test_session_factory_binds(tmp_path: Path) -> None:
    database_url = f"sqlite+aiosqlite:///{tmp_path / 'bind.db'}"
    run_migrations(database_url)
    engine = build_engine(database_url)
    session_factory = build_session_factory(engine)

    async def _check() -> None:
        async with session_factory() as session:
            result = await session.execute(text("SELECT COUNT(*) FROM readings"))
            assert result.scalar_one() == 0

    try:
        asyncio.run(_check())
    finally:
        asyncio.run(engine.dispose())


def test_sqlite_parent_dirs_created(tmp_path: Path) -> None:
    nested = tmp_path / "deep" / "dir" / "app.db"

    engine = build_engine(f"sqlite+aiosqlite:///{nested}")

    try:
        assert nested.parent.exists()
    finally:
        asyncio.run(engine.dispose())
