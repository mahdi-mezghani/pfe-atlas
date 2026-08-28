
node_modules\@supabase\auth-js\dist\main\lib\error-codes.d.ts:6:export type 
ErrorCode = 'unexpected_failure' | 'validation_failed' | 'bad_json' | 
'email_exists' | 'phone_exists' | 'bad_jwt' | 'not_admin' | 'no_authorization' 
| 'user_not_found' | 'session_not_found' | 'session_expired' | 
'refresh_token_not_found' | 'refresh_token_already_used' | 
'flow_state_not_found' | 'flow_state_expired' | 'signup_disabled' | 
'user_banned' | 'provider_email_needs_verification' | 'invite_not_found' | 
'bad_oauth_state' | 'bad_oauth_callback' | 'oauth_provider_not_supported' | 
'unexpected_audience' | 'single_identity_not_deletable' | 
'email_conflict_identity_not_deletable' | 'identity_already_exists' | 
'email_provider_disabled' | 'phone_provider_disabled' | 
'too_many_enrolled_mfa_factors' | 'mfa_factor_name_conflict' | 
'mfa_factor_not_found' | 'mfa_ip_address_mismatch' | 'mfa_challenge_expired' | 
'mfa_verification_failed' | 'mfa_verification_rejected' | 'insufficient_aal' | 
'captcha_failed' | 'saml_provider_disabled' | 'manual_linking_disabled' | 
'sms_send_failed' | 'email_not_confirmed' | 'phone_not_confirmed' | 
'reauth_nonce_missing' | 'saml_relay_state_not_found' | 
'saml_relay_state_expired' | 'saml_idp_not_found' | 
'saml_assertion_no_user_id' | 'saml_assertion_no_email' | 
'user_already_exists' | 'sso_provider_not_found' | 
'saml_metadata_fetch_failed' | 'saml_idp_already_exists' | 
'sso_domain_already_exists' | 'saml_entity_id_mismatch' | 'conflict' | 
'provider_disabled' | 'user_sso_managed' | 'reauthentication_needed' | 
'same_password' | 'reauthentication_not_valid' | 'otp_expired' | 
'otp_disabled' | 'identity_not_found' | 'weak_password' | 
'over_request_rate_limit' | 'over_email_send_rate_limit' | 
'over_sms_send_rate_limit' | 'bad_code_verifier' | 
'anonymous_provider_disabled' | 'hook_timeout' | 'hook_timeout_after_retry' | 
'hook_payload_over_size_limit' | 'hook_payload_invalid_content_type' | 
'request_timeout' | 'mfa_phone_enroll_not_enabled' | 
'mfa_phone_verify_not_enabled' | 'mfa_totp_enroll_not_enabled' | 
'mfa_totp_verify_not_enabled' | 'mfa_webauthn_enroll_not_enabled' | 
'mfa_webauthn_verify_not_enabled' | 'mfa_verified_factor_exists' | 
'invalid_credentials' | 'email_address_not_authorized' | 
'email_address_invalid';
node_modules\@supabase\auth-js\dist\main\lib\fetch.d.ts:36:    redirectTo?: 
string;
node_modules\@supabase\auth-js\dist\main\lib\fetch.js:105:    if (options === 
null || options === void 0 ? void 0 : options.redirectTo) {
node_modules\@supabase\auth-js\dist\main\lib\fetch.js:106:        
qs['redirect_to'] = options.redirectTo;
node_modules\@supabase\auth-js\dist\main\lib\fetch.js:150:    // Some /verify 
responses (e.g. secure email_change first-confirmation) return
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:253:     * The number 
of seconds until the token expires (since it was issued). Returned when a 
login is confirmed.
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:257:     * A timestamp 
of when the token will expire. Returned when a login is confirmed.
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:354:    
confirmation_sent_at?: string;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:364:    confirmed_at?: 
string;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:365:    
email_confirmed_at?: string;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:366:    
phone_confirmed_at?: string;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:434:     * Sets the 
user's email as confirmed when true, or unconfirmed when false.
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:438:    
email_confirm?: boolean;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:440:     * Sets the 
user's phone as confirmed when true, or unconfirmed when false.
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:444:    
phone_confirm?: boolean;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:509:        
emailRedirectTo?: string;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:532:        
emailRedirectTo?: string;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:567:        /** A URL 
to send the user to after they are confirmed. */
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:568:        
redirectTo?: string;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:659:        /** A URL 
to send the user to after they are confirmed. */
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:660:        
redirectTo?: string;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:677:        /** A URL 
to send the user to after they are confirmed. */
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:678:        
redirectTo?: string;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:699:        
emailRedirectTo?: string;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:716:        
redirectTo?: string;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:731:        
redirectTo?: string;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:746:    options?: 
Pick<GenerateLinkOptions, 'data' | 'redirectTo'>;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:752:    options?: 
Pick<GenerateLinkOptions, 'data' | 'redirectTo'>;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:758:    options?: 
Pick<GenerateLinkOptions, 'redirectTo'>;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:768:    options?: 
Pick<GenerateLinkOptions, 'redirectTo'>;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:778:    redirectTo?: 
string;
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:1190:     *       
email_confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:1192:     *       
confirmation_sent_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:1193:     *       
confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:1299:     *       
email_confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:1301:     *       
confirmation_sent_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\lib\types.d.ts:1302:     *       
confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:96:     *       
"confirmation_sent_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:135:        
redirectTo?: string;
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:139:     * @param 
params The parameters for generating the link, including the link `type`, the 
user's `email`, and type-specific options such as `password`, `data`, and 
`redirectTo`.
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:175:     *       
"confirmation_sent_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:260:     * - To 
confirm the user's email address or phone number, set `email_confirm` or 
`phone_confirm` to true. Both arguments default to false.
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:261:     * - 
`createUser()` will not send a confirmation email to the user. You can use [`in
viteUserByEmail()`](/docs/reference/javascript/auth-admin-inviteuserbyemail) 
if you want to send them an email invite instead.
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:262:     * - If 
you are sure that the created user's email or phone number is legitimate and 
verified, you can set the `email_confirm` or `phone_confirm` param to `true`.
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:282:     *       
email_confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:284:     *       
confirmation_sent_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:285:     *       
confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:316:     * 
@example Auto-confirm the user's email
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:320:     *   
email_confirm: true
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:324:     * 
@example Auto-confirm the user's phone number
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:328:     *   
phone_confirm: true
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:398:     *       
email_confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:400:     *       
confirmation_sent_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:401:     *       
confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:434:     * 
Updates the user data. Changes are applied directly without confirmation flows.
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:485:     *       
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:487:     *       
"confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:553:     * 
@example Confirms a user's email address
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:557:     *   { 
email_confirm: true }
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:561:     * 
@example Confirms a user's phone number
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.d.ts:565:     *   { 
phone_confirm: true }
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:115:     *       
"confirmation_sent_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:155:                
redirectTo: options.redirectTo,
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:168:     * @param 
params The parameters for generating the link, including the link `type`, the 
user's `email`, and type-specific options such as `password`, `data`, and 
`redirectTo`.
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:204:     *       
"confirmation_sent_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:293:                
redirectTo: options === null || options === void 0 ? void 0 : 
options.redirectTo,
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:318:     * - To 
confirm the user's email address or phone number, set `email_confirm` or 
`phone_confirm` to true. Both arguments default to false.
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:319:     * - 
`createUser()` will not send a confirmation email to the user. You can use [`in
viteUserByEmail()`](/docs/reference/javascript/auth-admin-inviteuserbyemail) 
if you want to send them an email invite instead.
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:320:     * - If you 
are sure that the created user's email or phone number is legitimate and 
verified, you can set the `email_confirm` or `phone_confirm` param to `true`.
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:340:     *       
email_confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:342:     *       
confirmation_sent_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:343:     *       
confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:374:     * @example 
Auto-confirm the user's email
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:378:     *   
email_confirm: true
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:382:     * @example 
Auto-confirm the user's phone number
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:386:     *   
phone_confirm: true
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:493:     *       
email_confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:495:     *       
confirmation_sent_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:496:     *       
confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:543:     * Updates 
the user data. Changes are applied directly without confirmation flows.
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:594:     *       
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:596:     *       
"confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:662:     * @example 
Confirms a user's email address
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:666:     *   { 
email_confirm: true }
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:670:     * @example 
Confirms a user's phone number
node_modules\@supabase\auth-js\dist\main\GoTrueAdminApi.js:674:     *   { 
phone_confirm: true }
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:284:     * This 
method has support for PKCE via email signups. The PKCE flow cannot be used 
when autoconfirm is enabled.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:286:     * @returns 
A logged-in session if the server has "autoconfirm" ON
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:287:     * @returns 
A user if the server has "autoconfirm" OFF
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:292:     * - By 
default, the user needs to verify their email address before logging in. To 
turn this off, disable **Confirm email** in [your 
project](/dashboard/project/_/auth/providers).
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:293:     * - 
**Confirm email** determines if users need to confirm their email address 
after signing up.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:294:     *   - If 
**Confirm email** is enabled, a `user` is returned but `session` is null.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:295:     *   - If 
**Confirm email** is disabled, both a `user` and a `session` are returned.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:296:     * - When 
the user confirms their email address, they are redirected to the 
[`SITE_URL`](/docs/guides/auth/redirect-urls#use-wildcards-in-redirect-urls) 
by default. You can modify your `SITE_URL` or add additional redirect URLs in 
[your project](/dashboard/project/_/auth/url-configuration).
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:297:     * - If 
signUp() is called for an existing confirmed user:
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:298:     *   - When 
both **Confirm email** and **Confirm phone** (even when phone provider is 
disabled) are enabled in [your project](/dashboard/project/_/auth/providers), 
an obfuscated/fake user object is returned.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:299:     *   - When 
either **Confirm email** or **Confirm phone** (even when phone provider is 
disabled) is disabled, the error message, `User already registered` is 
returned.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:304:     * const { 
data, error } = await supabase.auth.signUp({
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:312:     * // Some 
fields may be null if "confirm email" is enabled.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:320:     *       
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:362:     *         
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:401:     * const { 
data, error } = await supabase.auth.signUp({
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:415:     * const { 
data, error } = await supabase.auth.signUp({
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:426:     * const { 
data, error } = await supabase.auth.signUp(
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:445:     * const { 
data, error } = await supabase.auth.signUp(
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:450:     *       
emailRedirectTo: 'https://example.com/welcome'
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:456:    
signUp(credentials: SignUpWithPasswordCredentials): Promise<AuthResponse>;
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:472:     * const { 
data, error } = await supabase.auth.signInWithPassword({
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:487:     *       
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:529:     *         
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:568:     * const { 
data, error } = await supabase.auth.signInWithPassword({
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:575:     * Log the 
full `error` object so fields like `code`, `status`, and `name` aren't hidden. 
The `error.code` (e.g. `'invalid_credentials'`, `'email_not_confirmed'`) is 
often more useful for branching than `error.message`, and the full object 
surfaces both.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:579:     * const { 
data, error } = await supabase.auth.signInWithPassword({
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:589:    
signInWithPassword(credentials: SignInWithPasswordCredentials): 
Promise<AuthTokenResponsePassword>;
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:619:     * - When 
the OAuth provider successfully authenticates the user, they are redirected to 
the URL specified in the `redirectTo` parameter. This parameter defaults to 
the 
[`SITE_URL`](/docs/guides/auth/redirect-urls#use-wildcards-in-redirect-urls). 
It does not redirect the user immediately after invoking this method.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:627:     *     
redirectTo: 'https://example.com/welcome'
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:698:     *         
email_confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:700:     *         
confirmation_sent_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:701:     *         
confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:770:     *       
email_confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:772:     *       
confirmation_sent_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:773:     *       
confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1024:     * If the 
`{{ .ConfirmationURL }}` variable is specified in the email template, a 
magiclink will be sent.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1048:     * - Magic 
links and OTPs share the same implementation. To send users a one-time code 
instead of a magic link, [modify the magic link email 
template](/dashboard/project/_/auth/templates) to include `{{ .Token }}` 
instead of `{{ .ConfirmationURL }}`.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1059:     *     
emailRedirectTo: 'https://example.com/welcome'
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1131:     *       
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1133:     *       
"confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1181:     *         
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1183:     *         
"confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1301:     * - This 
method will send a nonce to the user's email. If the user doesn't have a 
confirmed email address, the method will send the nonce to the user's 
confirmed phone number instead.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1315:     * Resends 
an existing signup confirmation email, email change email, SMS OTP or phone 
change OTP.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1320:     * - 
Resends a signup confirmation, email change or phone change email to the user.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1324:     * - You 
can specify a redirect url when you resend an email link using the 
`emailRedirectTo` option.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1326:     * 
@exampleDescription Resend an email signup confirmation
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1327:     * Resends 
the email signup confirmation to the user
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1329:     * 
@example Resend an email signup confirmation
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1335:     *     
emailRedirectTo: 'https://example.com/welcome'
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1340:     * 
@exampleDescription Resend a phone signup confirmation
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1341:     * Resends 
the phone signup confirmation email to the user
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1343:     * 
@example Resend a phone signup confirmation
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1416:     *         
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1523:     *       
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1525:     *       
"confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1580:     * - By 
default, email updates sends a confirmation link to both the user's current 
and new email.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1581:     * To only 
send a confirmation link to the user's new email, disable **Secure email 
change** in your project's [email auth provider 
settings](/dashboard/project/_/auth/providers).
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1584:     * Sends a 
"Confirm Email Change" email to the new address. If **Secure Email Change** is 
enabled (default), confirmation is also required from the **old email** before 
the change is applied. To skip dual confirmation and apply the change after 
only the new email is verified, disable **Secure Email Change** in the [Email 
Auth Provider settings](/dashboard/project/_/auth/providers?provider=Email).
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1602:     *       
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1604:     *       
"confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1688:        
emailRedirectTo?: string | undefined;
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1691:        
emailRedirectTo?: string | undefined;
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1724:     *       
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1726:     *       
"confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1770:     *         
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1772:     *         
"confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1851:     *       
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1853:     *       
"confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1900:     *         
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:1902:     *         
"confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:2055:     * @param 
options.redirectTo The URL to send the user to after they click the password 
reset link.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:2067:     * You can 
configure the URL that the user is redirected to with the `redirectTo` 
parameter.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:2079:     *   
redirectTo: 'https://example.com/update-password',
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:2119:        
redirectTo?: string;
node_modules\@supabase\auth-js\dist\main\GoTrueClient.d.ts:2380:     * @param 
options.redirectTo A URL or mobile address to send the user to after they are 
confirmed.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:546:     * This 
method has support for PKCE via email signups. The PKCE flow cannot be used 
when autoconfirm is enabled.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:548:     * @returns A 
logged-in session if the server has "autoconfirm" ON
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:549:     * @returns A 
user if the server has "autoconfirm" OFF
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:554:     * - By 
default, the user needs to verify their email address before logging in. To 
turn this off, disable **Confirm email** in [your 
project](/dashboard/project/_/auth/providers).
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:555:     * - 
**Confirm email** determines if users need to confirm their email address 
after signing up.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:556:     *   - If 
**Confirm email** is enabled, a `user` is returned but `session` is null.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:557:     *   - If 
**Confirm email** is disabled, both a `user` and a `session` are returned.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:558:     * - When the 
user confirms their email address, they are redirected to the 
[`SITE_URL`](/docs/guides/auth/redirect-urls#use-wildcards-in-redirect-urls) 
by default. You can modify your `SITE_URL` or add additional redirect URLs in 
[your project](/dashboard/project/_/auth/url-configuration).
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:559:     * - If 
signUp() is called for an existing confirmed user:
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:560:     *   - When 
both **Confirm email** and **Confirm phone** (even when phone provider is 
disabled) are enabled in [your project](/dashboard/project/_/auth/providers), 
an obfuscated/fake user object is returned.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:561:     *   - When 
either **Confirm email** or **Confirm phone** (even when phone provider is 
disabled) is disabled, the error message, `User already registered` is 
returned.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:566:     * const { 
data, error } = await supabase.auth.signUp({
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:574:     * // Some 
fields may be null if "confirm email" is enabled.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:582:     *       
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:624:     *         
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:663:     * const { 
data, error } = await supabase.auth.signUp({
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:677:     * const { 
data, error } = await supabase.auth.signUp({
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:688:     * const { 
data, error } = await supabase.auth.signUp(
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:707:     * const { 
data, error } = await supabase.auth.signUp(
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:712:     *       
emailRedirectTo: 'https://example.com/welcome'
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:718:    async 
signUp(credentials) {
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:732:                  
  redirectTo: options === null || options === void 0 ? void 0 : 
options.emailRedirectTo,
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:797:     * const { 
data, error } = await supabase.auth.signInWithPassword({
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:812:     *       
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:854:     *         
"email_confirmed_at": "2024-01-01T00:00:00Z",
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:893:     * const { 
data, error } = await supabase.auth.signInWithPassword({
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:900:     * Log the 
full `error` object so fields like `code`, `status`, and `name` aren't hidden. 
The `error.code` (e.g. `'invalid_credentials'`, `'email_not_confirmed'`) is 
often more useful for branching than `error.message`, and the full object 
surfaces both.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:904:     * const { 
data, error } = await supabase.auth.signInWithPassword({
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:914:    async 
signInWithPassword(credentials) {
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:997:     * - When the 
OAuth provider successfully authenticates the user, they are redirected to the 
URL specified in the `redirectTo` parameter. This parameter defaults to the 
[`SITE_URL`](/docs/guides/auth/redirect-urls#use-wildcards-in-redirect-urls). 
It does not redirect the user immediately after invoking this method.
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:1005:     *     
redirectTo: 'https://example.com/welcome'
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:1050:            
redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : 
_a.redirectTo,
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:1084:     *         
email_confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:1086:     *         
confirmation_sent_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:1087:     *         
confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:1156:     *       
email_confirmed_at: '2024-01-01T00:00:00Z',
node_modules\@supabase\auth-js\dist\main\GoTrueClient.js:1158:     *       
confirmation_sent_at: '2024-01-01T00:00:00Z',


