#!/bin/bash

echo "🚀 Starting receiver node..."
node index.js &
RECEIVER_PID=$!

# انتظر شوية للـ receiver يبدأ
sleep 3

echo ""
echo "📤 Starting sender node..."
node sender.js

# اقفل الـ receiver
kill $RECEIVER_PID
echo ""
echo "✅ Test complete!"
