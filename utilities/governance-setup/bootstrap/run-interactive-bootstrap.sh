#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║       VERODAT WORKSPACE INTERACTIVE BOOTSTRAP              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "This script will:"
echo "  1. Let you select an account and workspace interactively"
echo "  2. Create governance datasets in DRAFT"
echo "  3. Guide you through promotion to PUBLISHED"
echo "  4. Load all governance data"
echo "  5. Track progress with RAIDA updates"
echo ""
echo "Starting interactive bootstrap..."
echo ""

# Run the interactive bootstrap
node raida-bootstrap-interactive.cjs

echo ""
echo "Bootstrap process completed!"
