"""Initial database schema for Food Castle

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-02 19:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create menu_items table
    op.create_table(
        'menu_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('has_variants', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('price_single', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('price_half', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('price_full', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('is_available', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_menu_items_category'), 'menu_items', ['category'], unique=False)
    op.create_index(op.f('ix_menu_items_id'), 'menu_items', ['id'], unique=False)
    op.create_index(op.f('ix_menu_items_name'), 'menu_items', ['name'], unique=False)

    # Create orders table
    op.create_table(
        'orders',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_type', sa.Enum('DINE_IN', 'TAKEAWAY', name='ordertype'), nullable=False),
        sa.Column('table_number', sa.String(length=50), nullable=True),
        sa.Column('total_amount', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0.00'),
        sa.Column('status', sa.Enum('PENDING', 'COMPLETED', 'CANCELLED', name='orderstatus'), nullable=False, server_default='PENDING'),
        sa.Column('payment_status', sa.Enum('UNPAID', 'PAID', name='paymentstatus'), nullable=False, server_default='UNPAID'),
        sa.Column('created_by_admin', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_orders_id'), 'orders', ['id'], unique=False)

    # Create order_items table
    op.create_table(
        'order_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('menu_item_id', sa.Integer(), nullable=False),
        sa.Column('portion_size', sa.Enum('SINGLE', 'HALF', 'FULL', name='portionsize'), nullable=False, server_default='SINGLE'),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('unit_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.ForeignKeyConstraint(['menu_item_id'], ['menu_items.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_order_items_id'), 'order_items', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_order_items_id'), table_name='order_items')
    op.drop_table('order_items')
    op.drop_index(op.f('ix_orders_id'), table_name='orders')
    op.drop_table('orders')
    op.drop_index(op.f('ix_menu_items_name'), table_name='menu_items')
    op.drop_index(op.f('ix_menu_items_id'), table_name='menu_items')
    op.drop_index(op.f('ix_menu_items_category'), table_name='menu_items')
    op.drop_table('menu_items')
    op.execute("DROP TYPE IF EXISTS ordertype;")
    op.execute("DROP TYPE IF EXISTS orderstatus;")
    op.execute("DROP TYPE IF EXISTS paymentstatus;")
    op.execute("DROP TYPE IF EXISTS portionsize;")
