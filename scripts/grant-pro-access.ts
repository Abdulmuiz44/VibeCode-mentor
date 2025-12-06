/**
 * Admin Script: Manually Grant Pro Access
 * 
 * Usage: npx tsx scripts/grant-pro-access.ts
 */

import { setProStatusInCloud } from '../lib/supabase.server';

async function grantProAccess() {
    const email = 'abdulmuizproject@gmail.com';

    console.log(`Granting Pro access to: ${email}`);

    // You'll need to get the user_id from Supabase
    // For now, using email as userId (update if needed)
    const userId = email;

    const success = await setProStatusInCloud(userId, email, true);

    if (success) {
        console.log('✅ Pro access granted successfully!');
        console.log(`User: ${email}`);
        console.log(`Status: is_pro = true`);
    } else {
        console.error('❌ Failed to grant Pro access');
        console.error('Check Supabase logs and verify SUPABASE_SERVICE_ROLE_KEY is set');
    }
}

grantProAccess().catch(console.error);
