# DLB Initiative Form

## Complete Implementation Specification

### Version 1.0

### Status: Architecture Freeze

------------------------------------------------------------------------

# 1. Purpose

This document is the single authoritative implementation specification
for the DLB Initiative application form.

It defines every functional, technical, architectural, UX, validation,
security and implementation requirement required to implement the
initiative application system.

No assumptions may be made outside this specification.

Whenever a conflict exists between implementation decisions and this
document, this document takes precedence.

------------------------------------------------------------------------

# 2. Objective

Implement a production-ready initiative application system for
DokanElbanat.com that allows applicants to submit their applications
online.

The implementation must:

-   feel like a native part of the existing website
-   use the current design system
-   integrate seamlessly with the existing Astro architecture
-   store submissions inside Google Sheets
-   send transactional confirmation emails
-   notify administrators
-   provide an excellent mobile-first experience
-   remain maintainable for future initiatives

------------------------------------------------------------------------

# 3. Scope

This specification covers:

-   initiative landing page
-   application form
-   frontend validation
-   backend validation
-   Astro API endpoint
-   Google Sheets integration
-   SMTP email delivery
-   duplicate detection
-   accessibility
-   security
-   anti-spam
-   success page
-   error handling
-   production readiness

------------------------------------------------------------------------

# 4. Out of Scope

The following are explicitly OUT OF SCOPE.

Do not implement unless future requirements explicitly request them.

-   WordPress integration
-   WooCommerce integration
-   User accounts
-   Applicant dashboard
-   Admin dashboard
-   Database
-   CMS
-   Applicant editing
-   Applicant login
-   Multi-step form wizard
-   Autosave
-   Draft saving
-   File uploads
-   PDF generation
-   AI scoring
-   Interview scheduling
-   Google Drive integration
-   CRM integration
-   SMS
-   WhatsApp API
-   Captcha providers
-   Payment
-   Localization beyond current Arabic website

------------------------------------------------------------------------

# 5. Existing Project Context

The existing website already contains:

-   Astro SSR
-   existing design system
-   production deployment
-   RTL support
-   reusable form styles
-   reusable button styles
-   reusable input styles
-   loading state patterns
-   validation patterns
-   existing API routes
-   existing SMTP infrastructure
-   existing environment configuration

The new implementation MUST integrate into the existing architecture.

Do not redesign the project.

Do not introduce a new UI framework.

Do not introduce React.

Do not introduce Vue.

Do not introduce external form libraries.

------------------------------------------------------------------------

# 6. Architecture Decisions (Frozen)

The following architectural decisions are FINAL.

Do not modify them.

## Frontend

Astro

## Styling

Existing Design System

No Bootstrap.

No Tailwind components.

No external UI libraries.

Reuse existing typography.

Reuse existing spacing scale.

Reuse existing colors.

Reuse existing inputs.

Reuse existing buttons.

Reuse existing cards.

Reuse existing alert components where possible.

------------------------------------------------------------------------

## Route

The public page SHALL be

    /dlb-initiative

------------------------------------------------------------------------

## Backend

Astro API Route.

No WordPress endpoint.

No WooCommerce endpoint.

No PHP.

------------------------------------------------------------------------

## Persistence

Google Sheets only.

No SQL database.

No SQLite.

No JSON storage.

No filesystem storage.

------------------------------------------------------------------------

## Email

Titan SMTP.

Do not use Gmail SMTP.

Do not use EmailJS.

Do not use third-party transactional email providers.

------------------------------------------------------------------------

## Sender

Name

    DokanElbanat.com

Email

    info@dokanelbanat.com

------------------------------------------------------------------------

## Admin Notification

Every successful submission SHALL notify

    dlb.egy@gmail.com

------------------------------------------------------------------------

## Sheet

Spreadsheet

    dlb-initiative-2026

Worksheet

    submissions

------------------------------------------------------------------------

## Application Number Format

    DLB-2026-0001
    DLB-2026-0002
    DLB-2026-0003

The sequence MUST increase automatically.

Application IDs must remain unique.

------------------------------------------------------------------------

## Duplicate Detection

Duplicate applications SHALL be rejected if ANY of the following already
exists:

-   Email
-   WhatsApp number

Matching either field is sufficient.

------------------------------------------------------------------------

# 7. UI / UX Requirements

The page must feel like a natural part of DokanElbanat.com.

Users should never feel they have left the website.

------------------------------------------------------------------------

## Language

Arabic only.

RTL only.

------------------------------------------------------------------------

## Emojis

No emojis anywhere.

------------------------------------------------------------------------

## Design

Minimal.

Clean.

Comfortable spacing.

Readable typography.

Professional.

Calm.

No playful illustrations.

No decorative animations.

------------------------------------------------------------------------

## Responsive

Desktop

Tablet

Mobile

All layouts must remain fully usable.

------------------------------------------------------------------------

## Form Layout

Single page.

Vertical layout.

Natural scrolling.

No wizard.

No multiple pages.

No tabs.

------------------------------------------------------------------------

## Progress Bar

Display a progress indicator at the top.

Progress is based on page scroll.

Do not calculate completion from answered fields.

The progress bar should update smoothly while scrolling.

------------------------------------------------------------------------

## Character Counters

Every textarea SHALL display

    0 / 500

or

    234 / 500

depending on the field.

The counter should update live.

When approaching the limit, use the existing warning color from the
design system.

------------------------------------------------------------------------

## Buttons

Primary button:

    إرسال طلب الانضمام

Loading state:

    جارٍ إرسال طلبك...

Button must become disabled while submitting.

Double clicking must never create duplicate requests.

------------------------------------------------------------------------

## Success Screen

After successful submission, display a dedicated success state.

The page should clearly communicate:

-   application received
-   confirmation email sent
-   review process
-   application ID

Display:

    رقم الطلب

    DLB-2026-0001

Do not display technical details.

Do not expose backend information.

------------------------------------------------------------------------

## Error Messages

Errors should be:

clear

short

Arabic

human-friendly

No technical wording.

No stack traces.

No exception messages.

------------------------------------------------------------------------

# 8. Accessibility

All inputs must have labels.

All inputs must have IDs.

Labels must be connected correctly.

Required fields must be announced.

Error messages must be readable by screen readers.

Keyboard navigation must work perfectly.

Visible focus styles must remain.

Never remove browser focus without replacing it.

Use semantic HTML.

Do not fake buttons.

Do not fake checkboxes.

------------------------------------------------------------------------

# 9. Performance Goals

The form should load as part of the existing page.

Avoid unnecessary JavaScript.

Do not introduce heavy dependencies.

Prefer progressive enhancement.

Minimize client-side code.

Avoid unnecessary rerenders.

# 10. Form Specification

The application form represents the first official lead collection
system for DokanElbanat.com.

The form should feel conversational rather than administrative.

Questions should encourage honest answers instead of perfect answers.

Applicants should never feel that they are taking an exam.

------------------------------------------------------------------------

# 11. General Form Rules

The form SHALL consist of a single page.

Fields shall appear in the order defined below.

Do not reorder sections.

Do not insert additional questions.

Do not remove existing questions.

All required fields must be validated both client-side and server-side.

All textareas must support multiline input.

Leading and trailing spaces shall be trimmed before validation.

Multiple consecutive spaces should be normalized.

Maximum character limits shall be enforced on both frontend and backend.

------------------------------------------------------------------------

# 12. Sections

The form consists of the following sections.

1.  التعارف

2.  ليه المبادرة؟

3.  المشروع

4.  شخصيتك

5.  رسالة لنفسك

6.  بيانات التواصل

7.  الموافقة

------------------------------------------------------------------------

# 13. Section 1 --- التعارف

Subtitle

    خلينا نتعرف عليكي الأول.

------------------------------------------------------------------------

## Field 1

Name

    الاسم بالكامل

Type

Text

Required

Yes

Placeholder

    اكتبي اسمك كما تحبي أن نناديكي.

Validation

-   Minimum length: 3
-   Maximum length: 100

------------------------------------------------------------------------

## Field 2

Name

    السن

Type

Number

Required

Yes

Validation

Minimum

16

Maximum

80

Only integer values.

------------------------------------------------------------------------

## Field 3

Name

    المحافظة / المدينة

Type

Text

Required

Yes

Placeholder

    مثال: أسيوط - منفلوط

Maximum length

100

------------------------------------------------------------------------

## Field 4

Name

    بتدرسي ولا بتشتغلي؟

Type

Select

Required

Yes

Options

-   طالبة
-   بشتغل
-   الاتنين
-   حاليًا لا ده ولا ده

------------------------------------------------------------------------

## Field 5

Name

    احكيلنا أكتر عن دراستك أو شغلك.

Type

Textarea

Required

No

Placeholder

    التخصص، الكلية، طبيعة الشغل... إلخ.

Maximum

500 characters

------------------------------------------------------------------------

## Field 6

Name

    إيه أكتر حاجة فخورة إنك عملتيها في حياتك؟

Type

Textarea

Required

Yes

Placeholder

    حتى لو الناس شايفاها بسيطة.

Maximum

500 characters

------------------------------------------------------------------------

# 14. Section 2 --- ليه المبادرة؟

Subtitle

    عايزين نفهم إيه اللي خلاكي تقدمي.

------------------------------------------------------------------------

## Field 7

Question

    إيه اللي خلاكي تقدمي في 100 دكان لـ100 بنت؟

Textarea

Required

Maximum

500

------------------------------------------------------------------------

## Field 8

Question

    إيه اللي بتتمني تطلعي بيه من المبادرة؟

Textarea

Required

Maximum

500

------------------------------------------------------------------------

## Field 9

Question

    لو متقبلتيش في الدفعة دي، هتعملي إيه؟

Textarea

Required

Maximum

500

------------------------------------------------------------------------

# 15. Section 3 --- المشروع

Subtitle

    احكيلنا عن فكرتك.

------------------------------------------------------------------------

## Field 10

Question

    هل عندك فكرة مشروع حاليًا؟

Type

Radio Buttons

Required

Yes

Options

-   أيوه
-   لسه بدور على فكرة

------------------------------------------------------------------------

Conditional logic is required.

------------------------------------------------------------------------

If applicant chooses

    أيوه

Display

    احكيلنا عن فكرتك.

Textarea

Required

Maximum

500

------------------------------------------------------------------------

If applicant chooses

    لسه بدور على فكرة

Display

    إيه المجال اللي نفسك تبدأي فيه؟ وليه؟

Textarea

Required

Maximum

500

Only one of these two fields should be submitted.

------------------------------------------------------------------------

## Field 11

Question

    إيه أكتر حاجة مخوفاكي في فكرة المشروع؟

Textarea

Required

Maximum

500

------------------------------------------------------------------------

# 16. Section 4 --- شخصيتك

Subtitle

    مفيش إجابة صح أو غلط.

------------------------------------------------------------------------

## Field 12

Question

    احكيلنا عن موقف حسيتي فيه إنك فشلتي... واتعلمتي منه إيه؟

Textarea

Required

Maximum

700

------------------------------------------------------------------------

## Field 13

Question

    لو اكتشفتي بعد شهر إن فكرتك محتاجة تتغير بالكامل، هيكون رد فعلك إيه؟ وليه؟

Textarea

Required

Maximum

700

------------------------------------------------------------------------

## Field 14

Question

    إيه أكتر نقطة قوة في شخصيتك هتساعدك تنجحي؟

Textarea

Required

Maximum

500

------------------------------------------------------------------------

## Field 15

Question

    وإيه الصفة اللي نفسك تطوريها؟

Textarea

Required

Maximum

500

------------------------------------------------------------------------

# 17. Section 5 --- رسالة لنفسك

Subtitle

    خدي دقيقة واكتبي رسالة لنفسك بعد سنة.

------------------------------------------------------------------------

Instruction

Display

    ابدئي بـ

    عزيزتي (اسمك)...

    واحكيلها:

    - نفسك تكوني وصلتي لإيه؟
    - وليه حلم المشروع ده مهم بالنسبة لك؟

    مش مطلوب كلام كبير...
    المطلوب يكون كلام حقيقي.

------------------------------------------------------------------------

Field

Textarea

Required

Maximum

1000

Character counter required.

------------------------------------------------------------------------

# 18. Section 6 --- بيانات التواصل

Subtitle

    دي البيانات اللي هنتواصل معاكي من خلالها.

------------------------------------------------------------------------

## Field 16

Name

    رقم الواتساب

Required

Yes

Type

Tel

Validation

-   Egyptian numbers only (normalize before comparison)
-   Store normalized value
-   Maximum length: 20

Autocomplete

    tel

------------------------------------------------------------------------

## Field 17

Name

    البريد الإلكتروني

Required

Yes

Type

Email

Validation

RFC-compliant email validation.

Convert to lowercase before duplicate detection.

Autocomplete

    email

------------------------------------------------------------------------

# 19. Section 7 --- الموافقة

Checkbox

Required

Yes

Text

    أوافق على استخدام بياناتي لمراجعة طلب الانضمام والتواصل معي بخصوص المبادرة، وفقًا لسياسة الخصوصية.

The phrase

    سياسة الخصوصية

must link to

    https://dokanelbanat.com/privacy

Open in same tab.

------------------------------------------------------------------------

# 20. Submission Flow

User presses

    إرسال طلب الانضمام

↓

Disable submit button.

↓

Show loading state.

↓

Submit request.

↓

Wait for server response.

↓

If success

Redirect to success state.

↓

If validation error

Display field errors.

↓

If duplicate

Display duplicate message.

↓

If server error

Display generic error.

------------------------------------------------------------------------

# 21. Duplicate Message

Display

    يوجد طلب مسجل بالفعل باستخدام البريد الإلكتروني أو رقم الواتساب الذي أدخلتيه.

    إذا كنتِ تعتقدين أن هناك خطأ، يمكنك التواصل معنا.

------------------------------------------------------------------------

# 22. Validation Messages

Examples

Required

    هذا الحقل مطلوب.

Email

    يرجى إدخال بريد إلكتروني صحيح.

WhatsApp

    يرجى إدخال رقم واتساب صحيح.

Characters

    تجاوزت الحد الأقصى المسموح.

Agreement

    يجب الموافقة على سياسة الخصوصية.

------------------------------------------------------------------------

# 23. Google Sheets Specification

Spreadsheet

    dlb-initiative-2026

Worksheet

    submissions

The worksheet columns SHALL be created exactly in the following order.

  Column
  -----------------------
  Application ID
  Submitted At
  Status
  Email Status
  Name
  Age
  Governorate
  Study / Work Status
  Study / Work Details
  Proud Achievement
  Initiative Reason
  Expected Outcome
  If Not Accepted
  Has Project Idea
  Project Idea
  Desired Field
  Biggest Fear
  Failure Story
  Idea Change Reaction
  Biggest Strength
  Trait To Improve
  Letter To Future Self
  WhatsApp
  Email
  Privacy Accepted
  User Agent
  Client IP
  Submission Source

Notes

-   Submitted At must use server time only.
-   Status default = `New`
-   Email Status default = `Pending`
-   Privacy Accepted = Yes/No
-   Client IP should never be exposed to the applicant.
-   Application ID must be unique.
-   Email addresses must be stored lowercase.
-   WhatsApp numbers must be stored normalized.

```{=html}
<!-- -->
```

    # 24. Backend Architecture

    The implementation SHALL follow the existing Astro architecture.

    The browser MUST NEVER communicate directly with Google Sheets.

    The browser MUST NEVER communicate directly with SMTP.

    The browser MUST NEVER receive any secret credentials.

    The complete request flow SHALL be:

Browser ↓ /api/dlb-initiative ↓ Server Validation ↓ Duplicate Detection
↓ Generate Application ID ↓ Write Google Sheet ↓ Send Applicant Email ↓
Send Admin Email ↓ Return Success Response


    No step may be skipped.

    ---

    # 25. API Specification

    Route

src/pages/api/dlb-initiative.ts


    Method

POST


    Only POST is allowed.

    GET must return

405 Method Not Allowed


    ---

    ## Request

    JSON only.

    Reject every other content type.

    ---

    ## Successful Response

200 OK


    Response

    ```json
    {
      "success": true,
      "applicationId": "DLB-2026-0001"
    }

------------------------------------------------------------------------

## Validation Failure


    422 Unprocessable Entity

Example

``` json
{
  "success": false,
  "errors": {
    "email": "يرجى إدخال بريد إلكتروني صحيح."
  }
}
```

Errors must be mapped back to fields.

Never return generic validation failures.

------------------------------------------------------------------------

## Duplicate Submission


    409 Conflict

Example

``` json
{
  "success": false,
  "duplicate": true
}
```

------------------------------------------------------------------------

## Rate Limited


    429 Too Many Requests

------------------------------------------------------------------------

## Internal Error


    500 Internal Server Error

Never expose stack traces.

Never expose exception messages.

Never expose Google API errors.

Never expose SMTP errors.

Always return a generic Arabic message.

------------------------------------------------------------------------

# 26. Validation Rules

Validation SHALL exist in BOTH:

-   Client
-   Server

Server validation is authoritative.

Frontend validation exists only to improve UX.

------------------------------------------------------------------------

## Text Fields

Trim spaces.

Collapse multiple spaces.

Reject empty strings.

Reject whitespace-only values.

------------------------------------------------------------------------

## Email

Convert to lowercase.

Trim.

Validate format.

Maximum length

254

------------------------------------------------------------------------

## WhatsApp

Trim.

Normalize.

Remove spaces.

Remove separators.

Support:


    +20XXXXXXXXXX

and


    01XXXXXXXXX

Store normalized value.

------------------------------------------------------------------------

## Textareas

Reject values exceeding limits.

Preserve line breaks.

Do not escape user formatting unnecessarily.

------------------------------------------------------------------------

## Checkbox

Must equal true.

------------------------------------------------------------------------

# 27. Duplicate Detection

Duplicate detection SHALL happen BEFORE writing to Google Sheets.

Search existing submissions.

Duplicate exists if

Email matches

OR

WhatsApp matches.

Application must immediately stop.

No email should be sent.

No row should be inserted.

------------------------------------------------------------------------

# 28. Application ID Generation

Generate IDs as


    DLB-2026-0001

Rules

-   sequential
-   zero padded
-   unique
-   server generated

Never trust browser values.

If generation fails

Abort submission.

------------------------------------------------------------------------

# 29. Google Sheets Integration

Implementation SHALL use

Google Sheets API

with

Service Account

Never use OAuth browser flow.

Never ask applicant to authenticate.

------------------------------------------------------------------------

The spreadsheet ID shall come from environment variables.

Never hardcode it.

------------------------------------------------------------------------

Worksheet


    submissions

must exist.

If missing

Return server error.

------------------------------------------------------------------------

Append rows only.

Never overwrite existing rows.

Never delete rows.

Never reorder rows.

------------------------------------------------------------------------

# 30. SMTP Specification

SMTP

Titan

Host


    smtp.titan.email

Port


    465

Encryption


    SSL

Sender


    DokanElbanat.com

Sender Email


    info@dokanelbanat.com

Credentials must come from environment variables.

Never hardcode passwords.

------------------------------------------------------------------------

# 31. Applicant Email

Subject


    تم استلام طلب انضمامك بنجاح

The email should include

-   greeting
-   confirmation
-   application number
-   review process
-   closing

Include


    رقم الطلب

    DLB-2026-0001

Do not promise acceptance.

Do not mention timelines.

Do not expose internal information.

------------------------------------------------------------------------

# 32. Admin Email

Recipient


    dlb.egy@gmail.com

Subject


    طلب جديد - مبادرة 100 دكان لـ100 بنت

Include

-   Application ID
-   Name
-   Email
-   WhatsApp
-   Submission Time

Do not include HTML-heavy formatting.

Plain HTML email is sufficient.

------------------------------------------------------------------------

# 33. Email Failure Handling

Google Sheets write is the authoritative success.

Flow

Write Google Sheet

↓

Success

↓

Attempt emails

↓

Email succeeds

↓

Email Status = Sent

OR

↓

Email fails

↓

Email Status = Failed

↓

Return SUCCESS to applicant

The applicant must never lose her application because SMTP failed.

------------------------------------------------------------------------

# 34. Security Requirements

Never expose

-   SMTP password
-   Google credentials
-   Spreadsheet ID
-   Service Account JSON

Never trust browser data.

Never trust hidden inputs.

Never trust application IDs from client.

Everything important must be generated server-side.

------------------------------------------------------------------------

# 35. Anti-Spam

Implement

Honeypot

Reuse existing implementation style from project.

Hidden from users.

Visible to bots.

If honeypot contains value

Reject request silently.

------------------------------------------------------------------------

Implement

Rate Limiting

Reuse existing project pattern.

Prevent abuse.

------------------------------------------------------------------------

Implement

Double Submit Protection

Disable submit button.

Reject duplicate simultaneous requests.

------------------------------------------------------------------------

# 36. Privacy

Collect only required information.

Never expose applicant data publicly.

Never log sensitive data unnecessarily.

Never send personal data to analytics.

Privacy checkbox must be stored.

------------------------------------------------------------------------

# 37. Accessibility

All errors

aria-live

Labels connected correctly.

Visible keyboard focus.

Logical tab order.

No keyboard traps.

Character counters should be announced politely.

Required fields clearly identified.

------------------------------------------------------------------------

# 38. Performance

No heavy libraries.

No unnecessary dependencies.

No framework changes.

No client-side state management libraries.

No React.

No Vue.

No Alpine.

No jQuery.

Reuse existing project architecture.

The implementation should add the minimum amount of JavaScript
necessary.

# 39. File Structure

The implementation shall reuse the existing project structure.

Only create files that are genuinely required.

Prefer extending the existing architecture over introducing new
abstractions.

------------------------------------------------------------------------

## Expected Files

### Public Page

    src/pages/dlb-initiative.astro

------------------------------------------------------------------------

### API Route

    src/pages/api/dlb-initiative.ts

------------------------------------------------------------------------

### Google Sheets Helper

Create only if one does not already exist.

Recommended location

    src/lib/google-sheets.ts

Its sole responsibility is communicating with Google Sheets.

Do not mix validation logic inside this helper.

------------------------------------------------------------------------

### Existing Mail Infrastructure

Reuse the existing SMTP/email implementation whenever possible.

Do not duplicate mailer logic.

Do not create a second email implementation.

If a reusable mail helper already exists, extend it.

------------------------------------------------------------------------

### Existing Utilities

Before creating any new helper, inspect the repository for:

-   validation helpers
-   HTTP helpers
-   environment helpers
-   response helpers
-   email helpers

Reuse existing utilities whenever possible.

Avoid duplicate functionality.

------------------------------------------------------------------------

# 40. Environment Variables

Every secret MUST come from environment variables.

Never commit secrets.

Never hardcode credentials.

Expected variables include:

    GOOGLE_SPREADSHEET_ID

    GOOGLE_SERVICE_ACCOUNT_EMAIL

    GOOGLE_PRIVATE_KEY

    SMTP_HOST

    SMTP_PORT

    SMTP_USERNAME

    SMTP_PASSWORD

    SMTP_FROM_NAME

    SMTP_FROM_EMAIL

If existing environment variables already provide SMTP configuration,
reuse them instead of creating new names.

------------------------------------------------------------------------

# 41. Frontend Behaviour

The frontend should remain intentionally simple.

Responsibilities:

-   render UI
-   validate basic input
-   display errors
-   display loading state
-   submit request
-   display success

The frontend MUST NOT:

-   generate Application IDs
-   detect duplicates
-   communicate with Google APIs
-   communicate with SMTP
-   contain secrets

------------------------------------------------------------------------

# 42. Backend Responsibilities

The API route is the single source of truth.

Responsibilities include:

-   input validation
-   normalization
-   duplicate detection
-   application ID generation
-   Google Sheets insertion
-   email sending
-   response generation

No business logic should exist exclusively in the frontend.

------------------------------------------------------------------------

# 43. Success Flow

Successful submission order SHALL be:

1.  

Receive request.

↓

2.  

Validate.

↓

3.  

Normalize.

↓

4.  

Duplicate detection.

↓

5.  

Generate Application ID.

↓

6.  

Append Google Sheet row.

↓

7.  

Send applicant email.

↓

8.  

Send admin email.

↓

9.  

Update Email Status if required.

↓

10. 

Return success response.

Changing this order is not allowed.

------------------------------------------------------------------------

# 44. Failure Scenarios

Validation Failure

↓

Return field errors.

No Google Sheets.

No emails.

------------------------------------------------------------------------

Duplicate

↓

Return duplicate message.

No Google Sheets.

No emails.

------------------------------------------------------------------------

Google Sheets Failure

↓

Abort.

Do not send emails.

Return generic server error.

------------------------------------------------------------------------

Applicant Email Failure

↓

Keep submission.

Mark Email Status = Failed.

Continue.

------------------------------------------------------------------------

Admin Email Failure

↓

Keep submission.

Continue.

------------------------------------------------------------------------

Unexpected Exception

↓

Log server error.

Return generic Arabic error.

Never expose implementation details.

------------------------------------------------------------------------

# 45. Logging

Server logging should include enough information for debugging.

Avoid logging:

-   applicant answers
-   private messages
-   future letter
-   personal information beyond what is necessary

Log only operational events.

Examples

-   Google API unavailable
-   SMTP unavailable
-   duplicate detected
-   validation failure
-   successful submission

------------------------------------------------------------------------

# 46. Coding Standards

Follow the project's existing conventions.

Maintain consistent formatting.

Do not introduce a different coding style.

Prefer readability over cleverness.

Avoid unnecessary abstraction.

Avoid premature optimization.

Keep functions focused.

Keep responsibilities separated.

Write descriptive variable names.

Remove dead code.

Avoid duplicated logic.

------------------------------------------------------------------------

# 47. Forbidden Changes

This implementation MUST NOT modify unrelated parts of the project.

Forbidden examples include:

-   redesigning the website
-   replacing the design system
-   changing typography
-   changing navigation
-   changing layout structure
-   changing global styles
-   changing unrelated pages
-   modifying checkout flow
-   modifying recover-download flow
-   upgrading dependencies unnecessarily
-   changing build configuration
-   introducing unrelated refactoring

If an unrelated issue is discovered:

Document it.

Do not fix it.

------------------------------------------------------------------------

# 48. Testing Requirements

The implementation is not complete until all tests below pass.

Frontend

✓ Required validation

✓ Character counters

✓ Progress bar

✓ Loading state

✓ Mobile layout

✓ Desktop layout

✓ Keyboard navigation

✓ Screen reader labels

✓ Duplicate message

✓ Success state

------------------------------------------------------------------------

Backend

✓ Valid submission

✓ Invalid submission

✓ Duplicate email

✓ Duplicate WhatsApp

✓ Google Sheets write

✓ Google Sheets failure

✓ Applicant email success

✓ Applicant email failure

✓ Admin email success

✓ Admin email failure

✓ Honeypot

✓ Rate limiting

✓ Unexpected exception

------------------------------------------------------------------------

Integration

✓ New row created

✓ Application ID generated

✓ Correct column order

✓ Email contains Application ID

✓ Admin receives notification

✓ Email Status stored

✓ No duplicate rows

------------------------------------------------------------------------

# 49. Browser Compatibility

Support latest stable versions of:

-   Chrome
-   Edge
-   Firefox
-   Safari

Mobile:

-   Chrome Android
-   Safari iOS

No browser-specific code unless absolutely required.

------------------------------------------------------------------------

# 50. Accessibility Acceptance

The implementation should satisfy:

-   semantic HTML
-   keyboard navigation
-   visible focus
-   accessible labels
-   accessible errors
-   screen-reader announcements

Accessibility regressions are considered implementation failures.

# 51. Acceptance Criteria

The implementation SHALL NOT be considered complete until **every**
requirement below has been satisfied.

------------------------------------------------------------------------

## Functional Acceptance

The page

    /dlb-initiative

exists and is publicly accessible.

The form matches the approved specification.

All sections appear in the approved order.

All required fields behave correctly.

Optional fields remain optional.

Character counters work correctly.

Progress bar works correctly.

Validation works correctly.

Duplicate detection works correctly.

Application IDs are generated correctly.

Google Sheets receives every successful application.

Confirmation email is delivered.

Administrator notification is delivered.

Privacy checkbox is stored.

The success page displays the generated Application ID.

------------------------------------------------------------------------

## Technical Acceptance

Implementation follows existing Astro architecture.

No WordPress integration exists.

No WooCommerce integration exists.

No unnecessary dependencies added.

No unrelated files modified.

No secrets committed.

No credentials exposed.

No browser access to Google APIs.

No browser access to SMTP.

No frontend-generated Application IDs.

------------------------------------------------------------------------

## UX Acceptance

Page feels like part of DokanElbanat.com.

Visual language matches existing website.

Responsive behaviour is correct.

Loading state prevents duplicate submission.

Error messages are clear.

Success state is clear.

No confusing wording.

No unnecessary animations.

No emojis.

------------------------------------------------------------------------

## Security Acceptance

Secrets remain server-side.

Google credentials remain server-side.

SMTP credentials remain server-side.

Duplicate detection happens server-side.

Validation happens server-side.

Rate limiting functions correctly.

Honeypot functions correctly.

Sensitive information is never exposed.

------------------------------------------------------------------------

## Performance Acceptance

No significant performance regression.

Minimal JavaScript.

No unnecessary network requests.

No layout shift caused by JavaScript.

Fast first interaction.

------------------------------------------------------------------------

# 52. Manual Setup (Not Implemented by Code)

The following tasks MUST NOT be implemented automatically.

They are manual deployment steps.

------------------------------------------------------------------------

## Google Cloud

Create a Google Cloud Project.

Enable

    Google Sheets API

------------------------------------------------------------------------

Create

    Service Account

------------------------------------------------------------------------

Generate

    Service Account JSON Credentials

------------------------------------------------------------------------

Store credentials securely.

Do not commit them.

------------------------------------------------------------------------

## Google Sheet

Spreadsheet

    dlb-initiative-2026

Worksheet

    submissions

must already exist.

------------------------------------------------------------------------

Share the spreadsheet with the Service Account email.

Permission

    Editor

------------------------------------------------------------------------

## Environment Variables

Configure production environment variables.

Verify:

-   Spreadsheet ID
-   Service Account Email
-   Private Key
-   SMTP Host
-   SMTP Port
-   SMTP Username
-   SMTP Password
-   Sender Name
-   Sender Email

------------------------------------------------------------------------

## SMTP

Verify Titan SMTP credentials.

Verify outgoing email.

Verify SPF.

Verify DKIM.

Verify DMARC if configured.

------------------------------------------------------------------------

## Production Verification

Submit a real application.

Verify

-   Google Sheet row
-   Applicant email
-   Admin email
-   Duplicate detection
-   Success page
-   Application ID

------------------------------------------------------------------------

# 53. Final Report

Upon completion, produce a final implementation report.

The report MUST contain exactly the following sections.

------------------------------------------------------------------------

## Summary

Overall implementation status.

------------------------------------------------------------------------

## Files Created

Complete list.

------------------------------------------------------------------------

## Files Modified

Complete list.

------------------------------------------------------------------------

## Environment Variables Required

List only.

Do not include values.

------------------------------------------------------------------------

## Features Implemented

Bullet list.

------------------------------------------------------------------------

## Validation Implemented

Bullet list.

------------------------------------------------------------------------

## Security Implemented

Bullet list.

------------------------------------------------------------------------

## Google Sheets Integration

Summary.

------------------------------------------------------------------------

## SMTP Integration

Summary.

------------------------------------------------------------------------

## Accessibility

Summary.

------------------------------------------------------------------------

## Testing Performed

List every completed verification.

------------------------------------------------------------------------

## Remaining Manual Steps

Only manual deployment tasks.

------------------------------------------------------------------------

## Notes

Anything important for future maintenance.

------------------------------------------------------------------------

# 54. Stop Conditions

Immediately stop implementation and request review if any of the
following occurs.

------------------------------------------------------------------------

Google Sheets API cannot authenticate.

------------------------------------------------------------------------

Service Account lacks permission.

------------------------------------------------------------------------

Spreadsheet cannot be found.

------------------------------------------------------------------------

Worksheet

    submissions

does not exist.

------------------------------------------------------------------------

Existing SMTP implementation cannot be reused.

------------------------------------------------------------------------

Current project architecture conflicts with this specification.

------------------------------------------------------------------------

Required environment variables are unavailable.

------------------------------------------------------------------------

Unexpected production-only limitation discovered.

------------------------------------------------------------------------

Any requested change expands scope beyond this specification.

------------------------------------------------------------------------

# 55. Implementation Philosophy

The goal of this implementation is not simply to build a form.

The goal is to build a production-ready initiative application system
that:

-   integrates naturally into the existing DokanElbanat.com architecture
-   follows the existing design system
-   remains maintainable
-   protects applicant data
-   provides an excellent user experience
-   avoids unnecessary complexity
-   introduces no architectural debt

Every implementation decision should favor:

-   simplicity
-   readability
-   maintainability
-   accessibility
-   security
-   consistency with the existing project

Over-engineering is discouraged.

Unnecessary abstractions are discouraged.

Unrelated refactoring is prohibited.

------------------------------------------------------------------------

# END OF SPECIFICATION

This document is the complete and authoritative implementation
specification for the DLB Initiative Form.

No assumptions should be made beyond what is explicitly defined here.

Any ambiguity shall be resolved by requesting clarification rather than
introducing undocumented behavior.

Implementation may begin only after this specification has been reviewed
and approved.

------------------------------------------------------------------------

# 56. Additional Production Decisions (Final Freeze)

The following decisions were approved after the initial specification
and are considered part of this document.

## Environment Variables

Prefer reusing existing project environment variable names whenever
possible.

Do not introduce new variables if equivalent ones already exist.

Only create new variables for Google Sheets if no reusable variables
exist.

------------------------------------------------------------------------

## Success Experience

Preferred implementation:

Remain on the same page and replace the form with a success state.

Do not redirect to a separate success page unless the existing project
architecture already follows that pattern.

------------------------------------------------------------------------

## Email Format

Applicant and administrator emails should be responsive HTML emails with
a plain-text fallback.

Reuse any existing email layout if one already exists.

------------------------------------------------------------------------

## Recommended Rate Limiting

Default recommendation:

-   5 submissions per IP per hour

The value should be configurable through environment variables.

------------------------------------------------------------------------

## Application ID Generation

Application IDs MUST be generated atomically.

The implementation MUST prevent race conditions.

The implementation may use an application lock, transaction, mutex, or
another server-side synchronization mechanism.

Duplicate IDs are never acceptable.

------------------------------------------------------------------------

## Quality Gate

Implementation SHALL NOT be considered complete until all of the
following succeed without errors:

-   Production build
-   Lint (if configured)
-   Type checking (if configured)
-   Existing project verification scripts
-   One successful real submission
-   One duplicate submission verification
-   One SMTP verification
-   One Google Sheets verification

If any quality gate fails, implementation is considered incomplete.

------------------------------------------------------------------------

# END OF DOCUMENT
