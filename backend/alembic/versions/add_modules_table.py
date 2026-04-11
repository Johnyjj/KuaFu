"""add modules table and task module_id

Revision ID: a1b2c3d4e5f6
Revises: c8a5d479601e
Create Date: 2026-04-12 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'c8a5d479601e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'modules',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('project_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('owner_id', sa.UUID(), nullable=True),
        sa.Column('order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id']),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_modules_project_id', 'modules', ['project_id'])
    op.add_column('tasks', sa.Column('module_id', sa.UUID(), nullable=True))
    op.create_foreign_key('fk_tasks_module_id', 'tasks', 'modules', ['module_id'], ['id'])
    op.create_index('ix_tasks_module_id', 'tasks', ['module_id'])


def downgrade() -> None:
    op.drop_index('ix_tasks_module_id', 'tasks')
    op.drop_constraint('fk_tasks_module_id', 'tasks', type_='foreignkey')
    op.drop_column('tasks', 'module_id')
    op.drop_index('ix_modules_project_id', 'modules')
    op.drop_table('modules')
