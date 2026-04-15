#!/usr/bin/env bash
set -euo pipefail

npm install
pip install -r packages/ai/requirements.txt
echo "Amline Platform dependencies installed."
