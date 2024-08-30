---
title: "Privacy Policy"
excerpt: ""
thumbnail_src: ~/assets/img/privacy-policy.jpg
related:
    disable: true
---

{% alert "warning" %}
**Disclaimer**: I am *not* a lawyer; but I believe data privacy and transparency is important in the information age. This privacy policy exists to outline existing third-party services used on this site and how your personal data may be used.
{% endalert %}

## Introduction

{{ site.title }} is committed to protecting your privacy and security. This privacy policy explains how we collect, use, and protect personal data, and the choices you have regarding that data.

## Data Collection

We collect the following personal data:

* **Technical Data**: IP address, Browser type, Device type, Referrer data.
	* This is collected by Cloudflare Pages, Cloudflare Web Analytics, and jsDelivr.
	* {{ site.title }} will only access such data in aggregate forms, and thus won't (be able to) link this data back to you.
	* This data is provided automatically by your browser when you load a web page. A VPN may be used to suppress or hide such data.
* **Cookies**
	* This is data associated with you due to activities such as login/commenting.
	* Used by Cloudflare Pages^[Cloudflare Pages may use cookies to combat spam and malicious activity. See their [cookie policy](https://www.cloudflare.com/cookie-policy/).], our commenting system, and SoundCloud embeds.
	* Cloudflare *Analytics* and jsDelivr claim they don't use cookies. ([Cloudflare](https://www.cloudflare.com/web-analytics/#:~:text=Cloudflare%20Web%20Analytics%20does%20not,the%20purpose%20of%20displaying%20analytics.); [jsDelivr](https://www.jsdelivr.com/terms/privacy-policy-jsdelivr-net#:~:text=We%20do%20not%20use%20cookies))
* **Identity Data**: Name, Email address.
	* In the [Contact Form][contact-form] and Commenting Forms, these are **optional** fields. You have the discretion to *not* fill in those fields.

## Data Usage

We use personal data for the following purposes:

- **Technical Data**: To optimise website experience. To draw insights from readers and to improve the site.
- **Identity Data**: For contact and communication purposes. To personalise responses to comments.

Third-party services may have other clauses, especially for cookies. Please refer to their [privacy policies](#third-party).

## Data Sharing

We do not share your personal data with third-parties.

## Data Protection, Retention, and Rights

Whilst personal data helps us improve the site, such data does not reside with us, but with third-party services. For policies on data protection, retention, and rights to access/correct/delete, please refer to their [privacy policies](#third-party) for details.

Data entered into the contact form is retained up to 30 days by FormCarry, according to custom configuration.

For the commenting system, any data such as comments and user information will be retained indefinitely; but you may [submit a request][contact-form] to have your account deleted or your comments removed.

## Changes to the Privacy Policy

We may update this privacy policy from time to time. Changes to this Privacy Policy are effective when they are posted on this page. You are advised to review this Privacy Policy periodically for any changes.

By using our website, you acknowledge that you have read and understand this privacy policy.

## Third-Party

For your reference, here is a collection of third-party services we use and their policies.

{% table %}

| Service         | Purpose                 | Technical Data[^u] | Identity Data[^u] |     Cookies[^u]     | Privacy Policy                     |
|-----------------|-------------------------|:------------------:|:-----------------:|:-------------------:|------------------------------------|
| Cloudflare      | Hosting, CDN, Analytics |         ✓          |                   | √ (See [CP][cclf].) | [Link][pclf] (*End Users*)         |
| jsDelivr        | CDN                     |         ✓          |                   |                     | [Link][pjsd]                       |
| SoundCloud      | Music Embeds            |         ✓          |      ✓[^sc1]      |          ✓          | [Link][pscl] (*SoundCloud Widget*) |
| FormCarry       | Forms                   |         ✓          |      ✓[^fc1]      |                     |                                    |

{% endtable %}

[pghp]: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#data-collection
[pjsd]: https://www.jsdelivr.com/terms/privacy-policy-jsdelivr-net
[cclf]: https://www.cloudflare.com/cookie-policy/
[pclf]: https://www.cloudflare.com/privacypolicy
[pscl]: https://soundcloud.com/pages/privacy

[^u]: Third-party data collection as of writing. Their policies may have updated since.
[^sc1]: Applicable if logged in.
[^fc1]: Applicable if filled in.

- Cloudflare and jsDelivr are present on all HTML pages of our site.
- SoundCloud embeds are only loaded on relevant pages (music pages, home page, etc.).
- FormCarry only applies to pages containing forms (e.g. the contact form).

## Contact

If you have any questions or concerns about our privacy policy, please [contact us][contact-form].

Thanks for your patience and understanding.


[contact-form]: /#contact
