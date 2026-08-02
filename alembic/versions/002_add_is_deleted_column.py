"""Add is_deleted column to orders table

Revision ID: 002_add_is_deleted_column
Revises: 001_initial_schema
Create Date: 2026-08-02 23:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_add_is_deleted_column'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('orders', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    op.drop_column('orders', 'is_deleted')
