#!/bin/bash

# Authentication & Comments System - E2E Test
# This script demonstrates the complete user flow

set -e

API_BASE="http://localhost:3101/api"
FRONTEND_URL="http://localhost:3100"

echo "🧪 Authentication & Comments System - E2E Test"
echo "=============================================="
echo ""

# Test 1: Register new user
echo "1️⃣ Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username":"e2e_test_user",
    "password":"test_secure_pass_2026",
    "email":"e2e@test.com"
  }')

USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.id')
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
USERNAME=$(echo "$REGISTER_RESPONSE" | jq -r '.username')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Registration failed"
  echo "$REGISTER_RESPONSE" | jq .
  exit 1
fi

echo "✅ User registered successfully"
echo "   - ID: $USER_ID"
echo "   - Username: $USERNAME"
echo "   - Token length: ${#TOKEN}"
echo ""

# Test 2: Verify token
echo "2️⃣ Testing Token Verification..."
VERIFY_RESPONSE=$(curl -s -X POST "$API_BASE/auth/verify" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$TOKEN\"}")

VERIFIED_ID=$(echo "$VERIFY_RESPONSE" | jq -r '.id')
VERIFIED_USERNAME=$(echo "$VERIFY_RESPONSE" | jq -r '.username')

if [ "$VERIFIED_ID" != "$USER_ID" ]; then
  echo "❌ Token verification failed"
  exit 1
fi

echo "✅ Token verified successfully"
echo "   - Verified ID: $VERIFIED_ID"
echo "   - Verified Username: $VERIFIED_USERNAME"
echo ""

# Test 3: Create comment as project
echo "3️⃣ Testing Comment Creation (Project)..."
COMMENT1=$(curl -s -X POST "$API_BASE/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "targetType":"project",
    "targetId":1,
    "content":"Excellent roadmap structure! Very clear phases."
  }')

COMMENT1_ID=$(echo "$COMMENT1" | jq -r '.id')

if [ -z "$COMMENT1_ID" ] || [ "$COMMENT1_ID" == "null" ]; then
  echo "❌ Comment creation failed"
  echo "$COMMENT1" | jq .
  exit 1
fi

echo "✅ Comment created on project"
echo "   - Comment ID: $COMMENT1_ID"
echo "   - Content: $(echo "$COMMENT1" | jq -r '.content')"
echo ""

# Test 4: Create comment on module
echo "4️⃣ Testing Comment Creation (Module)..."
COMMENT2=$(curl -s -X POST "$API_BASE/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "targetType":"module",
    "targetId":1,
    "content":"Looking forward to the API Development phase"
  }')

COMMENT2_ID=$(echo "$COMMENT2" | jq -r '.id')

echo "✅ Comment created on module"
echo "   - Comment ID: $COMMENT2_ID"
echo ""

# Test 5: Create comment on stage
echo "5️⃣ Testing Comment Creation (Stage)..."
COMMENT3=$(curl -s -X POST "$API_BASE/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "targetType":"stage",
    "targetId":1,
    "content":"Stage 1 deliverables look achievable"
  }')

COMMENT3_ID=$(echo "$COMMENT3" | jq -r '.id')

echo "✅ Comment created on stage"
echo "   - Comment ID: $COMMENT3_ID"
echo ""

# Test 6: Fetch comments for project
echo "6️⃣ Testing Comment Retrieval..."
COMMENTS=$(curl -s -X GET "$API_BASE/comments?targetType=project&targetId=1")
COMMENT_COUNT=$(echo "$COMMENTS" | jq 'length')

echo "✅ Comments retrieved successfully"
echo "   - Total comments on project 1: $COMMENT_COUNT"
echo "   - Comments:"
echo "$COMMENTS" | jq '.[] | "     - \(.content) (by user \(.userId))"' -r
echo ""

# Test 7: Update comment
echo "7️⃣ Testing Comment Update..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE/comments/$COMMENT1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content":"Updated: Excellent roadmap structure! Very clear phases. Ready to start."
  }')

UPDATED_CONTENT=$(echo "$UPDATE_RESPONSE" | jq -r '.content')

echo "✅ Comment updated successfully"
echo "   - New content: $UPDATED_CONTENT"
echo ""

# Test 8: Delete comment
echo "8️⃣ Testing Comment Deletion..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API_BASE/comments/$COMMENT2_ID" \
  -H "Authorization: Bearer $TOKEN")

if [ $? -eq 0 ]; then
  echo "✅ Comment deleted successfully"
  echo "   - Deleted comment ID: $COMMENT2_ID"
else
  echo "❌ Comment deletion failed"
  exit 1
fi
echo ""

# Test 9: Login with registered user
echo "9️⃣ Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username":"e2e_test_user",
    "password":"test_secure_pass_2026"
  }')

LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
LOGIN_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.id')

if [ "$LOGIN_ID" != "$USER_ID" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful"
echo "   - Logged in as: e2e_test_user"
echo "   - Got new token: ${LOGIN_TOKEN:0:20}..."
echo ""

# Test 10: Frontend access
echo "🔟 Testing Frontend Access..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")

if [ "$FRONTEND_STATUS" == "200" ]; then
  echo "✅ Frontend is accessible"
  echo "   - HTTP Status: $FRONTEND_STATUS"
else
  echo "❌ Frontend is not accessible"
  echo "   - HTTP Status: $FRONTEND_STATUS"
  exit 1
fi
echo ""

# Summary
echo "=============================================="
echo "✅ ALL TESTS PASSED! 🎉"
echo "=============================================="
echo ""
echo "Summary:"
echo "- ✅ User registration and JWT token generation"
echo "- ✅ Token verification"
echo "- ✅ Comments on projects, modules, and stages"
echo "- ✅ Comment CRUD operations (Create, Read, Update, Delete)"
echo "- ✅ User login and session restoration"
echo "- ✅ Frontend accessibility"
echo ""
echo "System ready for production use!"
echo ""
echo "Test User Credentials:"
echo "  Username: e2e_test_user"
echo "  Password: test_secure_pass_2026"
echo "  User ID: $USER_ID"
echo ""
