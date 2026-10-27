# Premium Day 14 Poll Implementation Plan

**Goal:** keep the existing PharmaGuide shell, give six choices email-safe filled
buttons, simplify confirmation, and provide a private report from Resend.

**Approved design:** deep-teal buttons with light text and an arrow; the linked
page shows the selected answer and Confirm, with Change answer secondary. GET
never writes. Resend remains the only answer store. Reports are private local
files, not public routes. All marketing sends remain disabled except Sean's test.

1. Add failing button, confirmation and report tests.
2. Render filled buttons with React Email table primitives and Button.
3. Show a hidden selected value plus a visible answer on confirmation; expose
   the existing select only when changing the answer or no valid choice exists.
4. Add a read-only poll-report command: current subscribed beta cohort, counts,
   respondents, nonrespondents, separate previous-choice values, safe CSV/HTML.
5. Run email tests, types and focused lint; preview visually.
6. Copy only approved sources to the existing isolated deployment, deploy, and
   refresh disabled native templates. Verify live answer saving and restore the
   owner test answer. Generate the report after cleanup.
7. Send exactly one newly identified owner test, verify Gmail content and ensure
   all subscriber broadcasts remain draft and the sequence remains disabled.
