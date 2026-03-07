#!/usr/bin/env python3
"""Update BookStack wiki pages after publish.

Updates:
  - Overview page (id=422): version badge in content

Requires env vars: BOOKSTACK_TOKEN_ID, BOOKSTACK_TOKEN_SECRET
Runs inside gitlab-runner container which has access to bookstack via docker exec.
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path

TOKEN_ID = os.environ.get("BOOKSTACK_TOKEN_ID", "")
TOKEN_SECRET = os.environ.get("BOOKSTACK_TOKEN_SECRET", "")
OVERVIEW_PAGE_ID = 422


def bookstack_api(method: str, endpoint: str, data: dict | None = None) -> dict:
    """Call BookStack API via docker exec bookstack curl."""
    cmd = [
        "docker", "exec", "bookstack", "curl", "-s",
        "-X", method,
        f"http://localhost/api/{endpoint}",
        "-H", f"Authorization: Token {TOKEN_ID}:{TOKEN_SECRET}",
        "-H", "Content-Type: application/json",
    ]
    if data:
        payload = json.dumps(data)
        cmd.extend(["-d", payload])
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"ERROR: docker exec failed: {result.stderr}", file=sys.stderr)
        sys.exit(1)
    return json.loads(result.stdout)


def read_version() -> str:
    """Read version from ha-canvas-ribbons.js."""
    js = Path("dist/ha-canvas-ribbons.js").read_text()
    match = re.search(r'const VERSION\s*=\s*"(.+?)"', js)
    return match.group(1) if match else "unknown"


def read_changelog() -> str:
    """Read changelog table from README."""
    readme = Path("README.md").read_text()
    # Extract changelog table
    match = re.search(
        r'## Changelog\n\n(\|.+?\|)\n(\|[-| ]+\|)\n((?:\|.+?\|\n)+)',
        readme, re.DOTALL
    )
    if match:
        return match.group(0)
    return ""


def update_overview(version: str):
    """Update Overview page with current version."""
    page = bookstack_api("GET", f"pages/{OVERVIEW_PAGE_ID}")
    html = page.get("html", "")
    if not html:
        print("WARN: Overview page has no HTML content")
        return

    # Update version references (e.g. "v1.8.0" -> "v1.9.0")
    updated = False

    # Pattern: v followed by semver in headings or bold
    new_html = re.sub(
        r'(Canvas Ribbons Background\s*</h\d>.*?<p>.*?)v[\d.]+',
        lambda m: m.group(1) + f'v{version}',
        html,
        count=1,
        flags=re.DOTALL
    )
    if new_html != html:
        html = new_html
        updated = True

    # Update version in any "Wersja:" or "Version:" field
    new_html = re.sub(
        r'(>[Ww]ersja:?\s*</(?:strong|b|td)>\s*(?:</td>\s*<td>|</?[^>]*>)*\s*)[\d.]+',
        lambda m: m.group(1) + version,
        html
    )
    if new_html != html:
        html = new_html
        updated = True

    if not updated:
        print(f"  Overview page: no version pattern found to update")
        return

    bookstack_api("PUT", f"pages/{OVERVIEW_PAGE_ID}", {
        "html": html,
        "tags": [
            {"name": "typ", "value": "dokumentacja"},
            {"name": "status", "value": "active"},
            {"name": "version", "value": version},
        ]
    })
    print(f"  Overview page updated to v{version}")


def main():
    if not TOKEN_ID or not TOKEN_SECRET:
        print("WARN: BOOKSTACK_TOKEN_ID/SECRET not set, skipping wiki update")
        sys.exit(0)

    version = read_version()
    print(f"Updating wiki for v{version}...")

    try:
        update_overview(version)
    except Exception as e:
        print(f"WARN: Overview update failed: {e}")

    print("Wiki update complete")


if __name__ == "__main__":
    main()
