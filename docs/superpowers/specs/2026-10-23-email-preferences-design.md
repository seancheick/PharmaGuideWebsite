# Email preferences — approved design

Approved by Sean in the parent chat. Standalone, script-free HTML uses the site's cream (#FAF9F6), deep teal (#183B3F), warm ink and editorial serif with local system fallbacks. No external fonts or requests. Keep no-store, no-referrer, noindex and a restrictive CSP with a style hash.

GET shows one clear topic-specific Unsubscribe button and a secondary keep-current-preferences link to a read-only confirmation. Successful visible opt-out offers an optional labeled native reason select. No survey on one-click POST, no pressure, pause or rejoin promises. Other topic consent stays unchanged.

Only too_many, not_relevant, not_using, did_not_signup or other may be saved. Verify the signed topic is actually opt_out before storing one latest list:reason string in Resend pg_unsubscribe_feedback. Disclose optional storage alongside the contact, without free text or medical data. Feedback errors never undo opt-out or claim successful storage.

Scope excludes stop-all, provider-native email work, campaign copy, tracking, deployment and commits.
