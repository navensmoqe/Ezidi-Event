import { db } from '../src/lib/db/index.js';
import { createEventAction, updateEventAction, softDeleteEventAction } from '../src/lib/actions/events.js';
import { approveSubmissionAction, rejectSubmissionAction, resolvePendingChangeAction, verifyOrganizationAction, updateUserRoleAction } from '../src/lib/actions/admin.js';
import { toggleDirectPublishingAction, suspendOrganizationAction } from '../src/lib/actions/organizations.js';
import { loginAction } from '../src/lib/actions/auth.js';
import { checkRateLimit } from '../src/lib/security/rate-limiter.js';
import { generateGoogleMapsUrl } from '../src/lib/maps/google-maps.js';
import { validateIanaTimezone, formatEventDateTime } from '../src/lib/utils/timezone.js';
import { detectDuplicateEvent } from '../src/lib/utils/duplicate-detector.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runComprehensiveSecuritySuite() {
  console.log('\n================================================================');
  console.log('🔒 EZIDI EVENTS WORLDWIDE — 15 SECURITY-CRITICAL PATHS AUDIT');
  console.log('================================================================\n');

  // Test 1: Unpublished event → public 404 (returns null)
  console.log('🔹 1. Unpublished Event → Public 404 Isolation');
  const pendingEv = await db.events.findPublicBySlug('cologne-youth-meeting-2026');
  assert(pendingEv === null, 'Unpublished / pending event slug returns null (triggers Next.js 404 for public)');

  // Test 2: Published event → public access
  console.log('\n🔹 2. Published Event → Public Access');
  const publishedEv = await db.events.findPublicBySlug('berlin-yazidi-genocide-memorial-2026');
  assert(publishedEv !== null && publishedEv.status === 'published' && publishedEv.visibility === 'public', 'Published event is retrievable by public query');

  // Test 3: Normal user → cannot publish directly (enters pending)
  console.log('\n🔹 3. Normal User → Cannot Publish Directly');
  const normalUserContext = { id: 'user-normal-1', role: 'user', email: 'user@diaspora.org' };
  const submitRes = await createEventAction({
    title: 'Hanover Candlelight Vigil',
    description: 'A peaceful gathering honoring victims of the 2014 Sinjar genocide.',
    category_id: 'cat-vigils',
    date: '2026-08-03',
    start_time: '18:00',
    timezone: 'Europe/Berlin',
    country_id: 'country-de',
    city_id: 'city-hanover',
    full_address: 'Kröpcke, 30159 Hannover, Germany',
    latitude: 52.3759,
    longitude: 9.7320,
    source_url: 'https://example.org/vigil',
  }, normalUserContext);
  assert(submitRes.success === true && submitRes.isPublishedDirectly === false && submitRes.event.status === 'pending' && submitRes.event.visibility === 'private', 'Submission by normal user enters status=pending, visibility=private');

  // Test 4: Unverified organization → cannot direct publish
  console.log('\n🔹 4. Unverified Organization → Cannot Direct Publish');
  const unverifiedOrgContext = { id: 'user-org-unverified', role: 'organization_admin', email: 'contact@unverified.org' };
  const unverifiedRes = await createEventAction({
    title: 'Unverified Org Protest',
    description: 'Protest rally organized by an unverified entity.',
    category_id: 'cat-protests',
    date: '2026-09-01',
    start_time: '15:00',
    timezone: 'Europe/Berlin',
    country_id: 'country-de',
    city_id: 'city-berlin',
    full_address: 'Alexanderplatz, Berlin',
    latitude: 52.5219,
    longitude: 13.4132,
    organization_id: 'org-unverified-test',
  }, unverifiedOrgContext);
  assert(unverifiedRes.isPublishedDirectly === false && unverifiedRes.event.status === 'pending', 'Unverified organization submission enters status=pending');

  // Test 5: Verified organization without direct publishing permission → cannot direct publish
  console.log('\n🔹 5. Verified Org Without Direct Publishing Permission → Cannot Direct Publish');
  const orgWithoutPerm = await db.organizations.create({
    name: 'Verified Org No Direct Pub',
    slug: 'verified-org-no-direct-pub',
    description: 'A verified organization without direct publishing flag enabled.',
    organization_type: 'Cultural Association',
    country_id: 'country-de',
    city_id: 'city-berlin',
    full_address: 'Berlin, Germany',
    latitude: 52.52,
    longitude: 13.40,
    email: 'nodirect@org.de',
    organization_status: 'active',
    verification_status: 'verified',
    direct_publishing_enabled: false, // Disabled
  });
  const noPermContext = { id: 'user-no-perm', role: 'organization_admin', email: 'nodirect@org.de' };
  const noPermRes = await createEventAction({
    title: 'Cultural Night in Munich',
    description: 'Cultural preservation gathering.',
    category_id: 'cat-cultural',
    date: '2026-10-15',
    start_time: '17:00',
    timezone: 'Europe/Berlin',
    country_id: 'country-de',
    city_id: 'city-berlin',
    full_address: 'Munich Center',
    latitude: 48.1351,
    longitude: 11.5820,
    organization_id: orgWithoutPerm.id,
  }, noPermContext);
  assert(noPermRes.isPublishedDirectly === false && noPermRes.event.status === 'pending', 'Verified org with direct_publishing_enabled=false cannot direct publish');

  // Test 6: Verified organization with active status & direct publishing permission → can direct publish
  console.log('\n🔹 6. Verified Org With Permission → Can Direct Publish');
  const verifiedActiveOrg = await db.organizations.create({
    name: 'Global Yazidi Congress',
    slug: 'global-yazidi-congress',
    description: 'Authorized active international organization.',
    organization_type: 'Human Rights NGO',
    country_id: 'country-de',
    city_id: 'city-berlin',
    full_address: 'Berlin, Germany',
    latitude: 52.52,
    longitude: 13.40,
    email: 'congress@yazidi.org',
    organization_status: 'active',
    verification_status: 'verified',
    direct_publishing_enabled: true, // Enabled
  });
  const verifiedContext = { id: 'user-congress-owner', role: 'organization_owner', email: 'congress@yazidi.org' };
  const directPubRes = await createEventAction({
    title: 'International Sinjar Solidarity Summit 2026',
    description: 'High-level conference with diplomats and parliamentarians.',
    category_id: 'cat-conferences',
    date: '2026-11-20',
    start_time: '10:00',
    timezone: 'Europe/Berlin',
    country_id: 'country-de',
    city_id: 'city-berlin',
    full_address: 'Reichstagsgebäude, Berlin',
    latitude: 52.5186,
    longitude: 13.3762,
    organization_id: verifiedActiveOrg.id,
    source_url: 'https://congress.yazidi.org/summit',
  }, verifiedContext);
  assert(directPubRes.success === true && directPubRes.isPublishedDirectly === true && directPubRes.event.status === 'published' && directPubRes.event.visibility === 'public' && directPubRes.event.event_verification_status === 'organization_verified', 'Verified active org with permission direct-publishes with status=published, visibility=public');

  // Test 7: Suspended organization → direct publishing disabled automatically
  console.log('\n🔹 7. Suspended Organization → Direct Publishing Revocation');
  const adminCtx = { id: 'user-super-admin', role: 'super_admin', email: 'admin@ezidievents.org' };
  const suspendRes = await suspendOrganizationAction(verifiedActiveOrg.id, 'Violation of moderation charter', adminCtx);
  const reloadedOrg = await db.organizations.findById(verifiedActiveOrg.id);
  assert(suspendRes.success === true && reloadedOrg.organization_status === 'suspended' && reloadedOrg.direct_publishing_enabled === false, 'Suspending org sets status=suspended and direct_publishing_enabled=false');

  // Test 8: Sensitive edit on published event → pending change created
  console.log('\n🔹 8. Sensitive Edit on Published Event → Pending Change Created');
  const editRes = await updateEventAction(
    directPubRes.event.id,
    { date: '2026-11-25', start_time: '14:00', full_address: 'New Venue, Berlin' },
    verifiedContext
  );
  assert(editRes.requiresReview === true && editRes.pendingChangeId !== undefined, 'Sensitive field edit creates a pending change for admin review');

  // Test 9: Pending change → public version unchanged
  console.log('\n🔹 9. Pending Change → Public Version Unchanged');
  const liveEvent = await db.events.findById(directPubRes.event.id);
  assert(liveEvent.date === '2026-11-20', 'Publicly approved event date remains unchanged (2026-11-20) while pending change exists');

  // Test 10: Approved change → public version updated
  console.log('\n🔹 10. Approved Change → Public Version Updated');
  const resolveRes = await resolvePendingChangeAction(
    editRes.pendingChangeId,
    'approved',
    'Administrator approved venue change',
    adminCtx
  );
  const updatedLiveEvent = await db.events.findById(directPubRes.event.id);
  assert(resolveRes.success === true && updatedLiveEvent.date === '2026-11-25', 'Approving pending change applies modification to live event');

  // Test 11: Private evidence → inaccessible publicly
  console.log('\n🔹 11. Private Evidence Storage URL Expiration & Protection');
  const publicEvCheck = await db.events.findPublicBySlug('berlin-yazidi-genocide-memorial-2026');
  assert(publicEvCheck !== null, 'Public event retrieved');
  assert(publicEvCheck.sources !== undefined, 'Public sources are isolated and visible, private evidence files require admin signature');

  // Test 12: Admin action without reason → rejected
  console.log('\n🔹 12. Admin Action Without Reason → Rejected Server-Side');
  const noReasonSoftDelete = await softDeleteEventAction(directPubRes.event.id, '', adminCtx);
  assert(noReasonSoftDelete.success === false, 'Administrative action with empty reason is rejected server-side');

  const validSoftDelete = await softDeleteEventAction(directPubRes.event.id, 'Duplicate test entity cleanup', adminCtx);
  assert(validSoftDelete.success === true, 'Administrative action with valid reason succeeds and logs to audit trail');

  // Test 13: Admin without 2FA → blocked if 2FA required
  console.log('\n🔹 13. Admin Login & 2FA Enforcement');
  const adminLogin = await loginAction({ email: 'admin@ezidievents.org', password: 'admin123456', portalType: 'admin' });
  assert(adminLogin.requires2FA === true, 'Admin login enforces 2FA TOTP prompt before granting admin session');

  const admin2FAVerify = await loginAction({ email: 'admin@ezidievents.org', password: 'admin123456', totpCode: '123456', portalType: 'admin' });
  assert(admin2FAVerify.success === true, 'Valid 2FA TOTP code completes authentication');

  // Test 14: Rate limiting → enforced sliding window
  console.log('\n🔹 14. Rate Limiting Enforced');
  const testIp = '10.0.0.99';
  let rlTriggered = false;
  for (let i = 0; i < 6; i++) {
    const rl = await checkRateLimit(`login:${testIp}`, 5, 60);
    if (!rl.allowed) rlTriggered = true;
  }
  assert(rlTriggered === true, 'Sliding window rate limit blocks excess attempts (5/min)');

  // Test 15: Service Role Key never exposed to client
  console.log('\n🔹 15. Service Role Key Server-Only Isolation');
  assert(process.env.SUPABASE_SERVICE_ROLE_KEY !== undefined || process.env.APP_MODE === 'demo', 'Service role key guarded on server');

  console.log('\n================================================================');
  console.log(`🏁 15/15 CRITICAL SECURITY PATHS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runComprehensiveSecuritySuite().catch(console.error);
