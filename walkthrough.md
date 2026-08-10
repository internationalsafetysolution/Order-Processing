# Email Notification Customizer & Recipient Settings Walkthrough

The email notification templates have been restructured to support exactly the requested list of templates, and a new recipient control system has been added to give the Administrator full power over who receives each update alert.

## Changes Completed

### 1. Database Schema & Fallbacks (`src/lib/db.js`)
- Updated the `email_templates` database seeding script for both MySQL and the JSON fallback database to define the new templates list.
- Added four recipient control columns to the `email_templates` table:
  - `notify_admin` (DEFAULT 1)
  - `notify_staff_1` (DEFAULT 1)
  - `notify_staff_2` (DEFAULT 1)
  - `notify_staff_3` (DEFAULT 1)
- Re-seeded the database table with the 5 templates and their default configurations:
  - **New Order Notification** (Default: Admin, Stage 1, Stage 2, and Stage 3 allowed)
  - **Stage 1 Completed** (Default: Admin and Stage 2 allowed)
  - **Stage 2 Completed** (Default: Admin and Stage 3 allowed)
  - **Order Completed** (Default: Admin, Stage 1, Stage 2, and Stage 3 allowed)
  - **Task Reupload Request** (Default: Admin, Stage 1, Stage 2, and Stage 3 allowed)

### 2. Recipient Control UI Checkboxes (`src/app/admin/settings/integration/page.js`)
- Added a sleek **Allowed Notification Recipients** toggle card panel to the template customization form.
- The Admin can select any template, toggle the checkboxes, and click **Save Template Changes** to persist the allowed notification list to the database.

### 3. Automated SMTP Email Notifier (`src/lib/mailer.js`)
- Created a robust SMTP mail dispatcher function (`sendSystemEmail`) built over custom Node sockets matching the portal's custom handshake logic.
- Resolves template parameters dynamically and reads the `notify_admin`, `notify_staff_1`, `notify_staff_2`, and `notify_staff_3` columns for the active template.
- Queries user database details to route the email dynamically only to checked recipient groups.

### 4. Trigger Integration
- Integrated mailer triggers into active order status transition points:
  - **New Order Created** triggers `order_created` notification template.
  - **Stage 1 DC Submission** triggers `stage1_completed` notification template.
  - **Stage 2 Invoice Submission** triggers `stage2_completed` notification template.
  - **Stage 3 Courier Submission** triggers `order_completed` notification template.

## Visual Verification
The templates select dropdown list and the new recipients toggle interface are fully functional:

![Allowed Notification Recipients Customizer](file:///C:/Users/uolna/.gemini/antigravity-ide/brain/fb22312c-c683-426f-8ac8-f7965065febb/templates_and_recipients_layout_1784201119710.png)

*The templates list and recipient toggles render beautifully and update the database on save.*
