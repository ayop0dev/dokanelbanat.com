## **dokanelbanat.com — Web Ecosystem Architecture v1.0**

---

### **Core Decisions**

* Landing Page: Plain HTML/CSS/JS — static, zero CMS  
* Blog/Magazine: WordPress — Headless CMS, no login required  
* Academy: WordPress \+ Tutor LMS — independent login  
* Stores/Business: WordPress \+ WooCommerce — independent login  
* GTM: Single container \+ Cross-Domain Linker across all subdomains  
* Login: Separate per site — no SSO, no Multisite

---

### **Subdomain Map**

| Subdomain | Purpose | Stack | Login |
| :---- | :---- | :---- | :---- |
| dokanelbanat.com | Landing page — Ecosystem gateway | Plain HTML/CSS/JS | No |
| blog.dokanelbanat.com | Digital magazine & podcast | WordPress Headless | No |
| academy.dokanelbanat.com | Academy \+ digital products | WordPress \+ Tutor LMS | Yes |
| stores.dokanelbanat.com | Store support \+ suppliers \+ business | WordPress \+ WooCommerce | Yes |

---

### **Landing Page — dokanelbanat.com**

Single purpose: explain the Ecosystem and direct visitors to the right subdomain.

Suggested page content:

**Landing Page — dokanelbanat.com**

1. Hero  
2. Reset Your Mindset  
3. Magazine Selected Topics & Banner  
4. Vision, Mission & Philosophy  
5. Digital Products Selections  
6. Social Proof  
7. Banner  
8. Footer

Tracking on the Landing Page:

* GTM container in the head  
* GA4 pageview event  
* Meta Pixel — PageView \+ ViewContent  
* CTA clicks as custom events per button

---

### **Blog — blog.dokanelbanat.com**

WordPress installed as a Headless CMS:

* Content is written and managed in WordPress Admin  
* REST API exposes posts, categories, and tags  
* The Landing Page fetches latest posts via API and displays them in the Magazine section  
* No need for a professional WordPress theme — the front-end is the Landing Page itself

Core plugins:

* Rank Math SEO  
* WP REST API — enabled by default  
* Advanced Custom Fields — if extra fields are needed, e.g. podcast episode details

---

### **Academy — academy.dokanelbanat.com**

WordPress \+ Tutor LMS.

Content structure:

* Free courses: accessible without payment, registration required to track progress  
* Paid courses: WooCommerce handles payment, Tutor LMS controls access  
* Digital products: PDF guides, templates, ebooks — sold via WooCommerce as downloadable products

Core plugins:

* Tutor LMS Pro  
* WooCommerce — for paid enrollment and digital products  
* Rank Math SEO  
* Same GTM container

Login is fully independent — users create an account on the Academy only.

---

### **Stores — stores.dokanelbanat.com**

WordPress \+ WooCommerce.

Services offered:

* Business consulting — booking or contact form  
* Digital store setup — service listings  
* Supplier and partnership hub — supplier directory or inquiry form  
* B2B partnerships — dedicated landing section

Core plugins:

* WooCommerce  
* Rank Math SEO  
* Same GTM container  
* Fluent Forms for inquiry forms

Login is fully independent — not connected to the Academy.

---

### **GTM & Tracking Architecture**

One container installed across all 4 sites.

GA4 setup:

* Single property for the entire domain  
* Cross-Domain Measurement: add all subdomains in the Data Stream settings  
* cookie\_domain set to .dokanelbanat.com (without the sub) to track sessions across subdomains

Core events to track:

* page\_view across all sites  
* cta\_click with label per button on the Landing Page  
* course\_enroll on the Academy  
* purchase on the Academy and Stores  
* form\_submit on the Stores

Meta Pixel:

* Same Pixel ID across all sites via GTM  
* Standard events: PageView, ViewContent, Lead, Purchase

---

### **Launch Phases**

Phase 1 — Current priority:

* Build the Landing Page as static HTML/CSS/JS  
* Install GTM \+ GA4 \+ Meta Pixel  
* Verify Cross-Domain tracking is working correctly before running any ads

Phase 2:

* Deploy Blog WordPress and configure the REST API  
* Connect latest posts to the Landing Page via fetch  
* Begin publishing magazine and podcast content

Phase 3:

* Launch the Academy with the first free and paid course  
* Launch Stores with service pages and supplier section

Phase 4:

* Mobile App — connects to Academy and Stores via REST API  
* Loyalty Program

---

### **Technical Notes**

* Each WordPress install on a separate hosting environment or subfolder on the same host with subdomains pointing to each  
* SSL on all subdomains — wildcard certificate on .dokanelbanat.com covers everything  
* Robots.txt on each WordPress install blocks indexing of /wp-admin and /wp-json  
* The Blog WordPress install does not need a professional theme since it runs headless — any lightweight theme such as Twenty Twenty-Four is sufficient

