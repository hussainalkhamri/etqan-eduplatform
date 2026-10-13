# Realistic User Journeys & Operational Scenarios

## Persona 1: The Elementary School Teacher (أ. نورة الشمري)
1. **Discovery:** Visits the Etqan EduPlatform homepage and navigates to `/catalog` to review available curriculum workbooks.
2. **Review:** Inspects the *Comprehensive Arabic Teacher Workbook*, reads dimension and page specifications, and launches the protected PDF sample preview.
3. **Customization:** Clicks *Order Now* to launch the 5-step wizard.
   - Types school name: "ثانوية الرواد النموذجية".
   - Inputs qualification: "بكالوريوس لغة عربية ودراسات إسلامية".
   - Uploads high-res school crest with live preview.
4. **Checkout & Submission:** Reviews the generated composite order summary, verifies total price (3 copies x 65 SAR = 195 SAR), and confirms the order.
5. **Tracking:** Receives order number `ORD-20261010-1042` and monitors real-time status in the `/account` orders view.

---

## Persona 2: The Store Administrator & Operations Lead (مدير النظام)
1. **1-Click Authentication:** Accesses `/auth` and clicks the *Admin Demo* quick-access button.
2. **Analytics Review:** Lands on `/admin` dashboard to inspect live revenue statistics, active orders count, and status distribution via Recharts.
3. **Catalog Management:** Navigates to `/admin/products` to update product pricing, upload new PDF previews, or toggle availability.
4. **Order Fulfillment:** Navigates to `/admin/orders`, filters pending orders, updates status to *processing* or *delivered*, and attaches internal shipping notes.
