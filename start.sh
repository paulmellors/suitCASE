#!/bin/bash
set -e

cleanup() {
    kill "$PID" 2>/dev/null
    wait "$PID" 2>/dev/null
}
trap cleanup EXIT INT TERM

cd "$(dirname "$0")"
npm run dev &
PID=$!
wait $PID
