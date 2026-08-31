"""Local disk storage for file-kind fields, generated from the field spec.

Every file field's value stored in the database is a server-generated
relative path under STORAGE_DIR -- never raw bytes, and never a
client-supplied path. Extension and size limits are baked in per
entity/field from the spec's file_accept/file_max_size_mb (default:
['.pdf', '.jpg', '.jpeg', '.png'], 10.0 MB).
"""
from __future__ import annotations

import os
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile

STORAGE_DIR = Path(os.getenv("STORAGE_DIR", "./uploads"))

# "<entity_snake>.<field_name>" -> (allowed extensions, max size in MB)
_UPLOAD_LIMITS: dict[str, tuple[list[str], float]] = {
    "change_request.attachment": (['.pdf', '.jpg', '.jpeg', '.png'], 10.0),
    "audit_scan.report_file": (['.pdf', '.jpg', '.jpeg', '.png'], 10.0),
    "compliance_mapping.evidence_file": (['.pdf', '.jpg', '.jpeg', '.png'], 10.0),
}

_DEFAULT_LIMIT: tuple[list[str], float] = (['.pdf', '.jpg', '.jpeg', '.png'], 10.0)
_CHUNK_SIZE = 1024 * 1024


def ensure_storage_dir() -> None:
    """Creates STORAGE_DIR (and parents) if it doesn't already exist."""
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)


def save_upload(entity_snake: str, field_name: str, upload: UploadFile) -> tuple[str, int]:
    """Validates *upload*'s extension/size against the field's configured
    limits while streaming it to disk under STORAGE_DIR/<entity_snake>/,
    and returns (relative_path, size_bytes). Raises HTTPException(415) for
    a disallowed extension, HTTPException(413) if the stream exceeds the
    configured max size (the partial file is removed in that case)."""
    allowed_extensions, max_size_mb = _UPLOAD_LIMITS.get(f"{entity_snake}.{field_name}", _DEFAULT_LIMIT)
    ext = Path(upload.filename or "").suffix.lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ext}' for {field_name}; allowed: {allowed_extensions}",
        )

    max_bytes = int(max_size_mb * 1024 * 1024)
    entity_dir = STORAGE_DIR / entity_snake
    entity_dir.mkdir(parents=True, exist_ok=True)
    dest_name = f"{uuid4()}{ext}"
    dest_path = entity_dir / dest_name

    size = 0
    with open(dest_path, "wb") as out:
        while True:
            chunk = upload.file.read(_CHUNK_SIZE)
            if not chunk:
                break
            size += len(chunk)
            if size > max_bytes:
                out.close()
                try:
                    dest_path.unlink()
                except FileNotFoundError:
                    pass
                raise HTTPException(
                    status_code=413,
                    detail=f"File exceeds max size of {max_size_mb}MB for {field_name}",
                )
            out.write(chunk)

    return f"{entity_snake}/{dest_name}", size


def delete_upload(path: str) -> None:
    """Best-effort unlink of a previously-saved relative *path*; a missing
    file is not an error (nothing else to clean up)."""
    if not path:
        return
    try:
        (STORAGE_DIR / path).unlink()
    except FileNotFoundError:
        pass
