#!/bin/bash
git config core.hooksPath .githooks
chmod +x .githooks/*
echo "Git hooks configured to .githooks folder successfully!"
