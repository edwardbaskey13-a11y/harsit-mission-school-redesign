HARSIT MISSION SCHOOL — REDESIGNED WEBSITE

Files
- index.html: redesigned school website and three-step admission enquiry
- styles.css: responsive premium visual system
- script.js: navigation, gallery and admission wizard interactions
- images/: original school image assets retained
- cloud-config.js / cloud-public.js: existing optional public Supabase content sync retained

DEPLOYMENT
1. Upload this project folder to the connected GitHub repository (or deploy this folder to Netlify).
2. In Netlify, open Forms and ensure form detection is enabled. Trigger a fresh deploy after enabling form detection.
3. Submit one test admission enquiry and confirm it appears in Netlify Forms > admission-enquiry.
4. Configure form notification emails in Netlify so the school office receives new enquiries.
5. The campus visit date/time is a requested preference, not a confirmed appointment. The school must contact the parent to confirm it.

IMPORTANT
- The form uses Netlify Forms. It will only save enquiries after deployment to a Netlify site with form detection enabled.
- The reference number is generated in the browser for the parent's confirmation and is included in the submitted form data; it is not a server-issued application ID.
- No payment gateway, official online payment collection, or final admission decision has been fabricated.
- Existing school facts, contact details, address, leadership names, curriculum wording and original photos were retained from the supplied source. Verify them with the school before production launch.
- cloud-config.js contains empty Supabase public settings in the supplied source. Do not place a Supabase service-role key or other secret in browser files.
