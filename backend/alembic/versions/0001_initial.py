"""create readings table

Revision ID: 0001_initial
Revises:
Create Date: 2026-08-23

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

INTENT_VALUES = ("love", "career", "prosperity", "future", "general")


def upgrade() -> None:
    intent_enum = sa.Enum(
        *INTENT_VALUES,
        name="intent_category",
        native_enum=False,
        length=16,
        create_constraint=True,
    )
    op.create_table(
        "readings",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), nullable=True),
        sa.Column("spread_id", sa.String(length=32), nullable=False),
        sa.Column("spread_name", sa.String(length=64), nullable=False),
        sa.Column("question", sa.String(length=500), nullable=False),
        sa.Column("intent_category", intent_enum, nullable=False),
        sa.Column("drawn_cards_json", sa.JSON(), nullable=False),
        sa.Column("interpretation_text", sa.Text(), nullable=True),
        sa.Column("seed", sa.BigInteger(), nullable=False),
        sa.Column("reversal_rate", sa.Float(), nullable=False),
        sa.Column("provider", sa.String(length=16), nullable=False),
        sa.Column("model", sa.String(length=64), nullable=False),
        sa.Column("prompt_version", sa.String(length=16), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_readings_created_at", "readings", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_readings_created_at", table_name="readings")
    op.drop_table("readings")
