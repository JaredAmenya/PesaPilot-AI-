from alembic import op
import sqlalchemy as sa

revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass  # Tables are created via SQLAlchemy Base.metadata.create_all in main.py


def downgrade() -> None:
    pass
