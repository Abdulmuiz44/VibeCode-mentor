# Firestore Security Rules for VibeCode Mentor

## Overview
These rules ensure that:
1. Only authenticated users can access their own data
2. Users cannot modify their Pro status directly (only via webhook)
3. All blueprint operations are user-scoped

## Rules Explanation

### User Documents
```
match /users/{userId}
```
- **Read**: Allowed if authenticated and requesting own document
- **Write**: Allowed if authenticated and requesting own document
  - Exception: Cannot modify `isPro` field (webhook only)

### Blueprints Subcollection
```
match /users/{userId}/blueprints/{blueprintId}
```
- **Read/Write**: Allowed if authenticated and userId matches auth.uid

## Testing
To test these rules in Firebase Console:
1. Go to Firestore → Rules
2. Click "Rules playground"
3. Test scenarios:
   - Read user doc (authenticated, matching UID): ✅ Allow
   - Read user doc (authenticated, different UID): ❌ Deny
   - Write blueprint (authenticated, matching UID): ✅ Allow
   - Write isPro field (user request): ❌ Deny
   - Write isPro field (server/webhook): ✅ Allow

## Deployment
```bash
firebase deploy --only firestore:rules
```
