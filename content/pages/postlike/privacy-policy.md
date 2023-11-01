---
title: "Privacy Policy"
description: ""
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
	* This is collected by GitHub Pages, Cloudflare Web Analytics, Disqus, and jsDelivr.
	* {{ site.title }} will only access such data in aggregate forms, and thus won't (be able to) link this data back to you.
	* This data is provided automatically by your browser when you load a web page. A VPN may be used to suppress or hide such data.
* **Cookies**
	* This is data associated with you and may be used by third-party services to track you.
	* Used by Disqus and SoundCloud embeds.
	* Cloudflare and jsDelivr claim they don't use cookies. ([Cloudflare](https://www.cloudflare.com/web-analytics/#:~:text=Cloudflare%20Web%20Analytics%20does%20not,the%20purpose%20of%20displaying%20analytics.); [jsDelivr](https://www.jsdelivr.com/terms/privacy-policy-jsdelivr-net#:~:text=We%20do%20not%20use%20cookies))
* **Identity Data**: Name, Email address.
	* In the [Contact Form][contact-form], these are **optional** fields. You have the discretion to *not* fill in those fields.
	* In Disqus guest commenting, these are **mandatory** fields.

## Data Usage

We use personal data for the following purposes:

- **Technical Data**: To optimise website experience. To draw insights on readers and to improve the site.
- **Identity Data**: For contact and communication purposes. To personalise responses to comments.

Third-party services may have other clauses, especially for cookies. Please refer to their [privacy policies](#third-party).

## Data Sharing

We do not share your personal data with third-parties. Any personal data collected by third-parties were obtained when you load the page, use a third-party account, or voluntarily submit your identity data.

## Data Protection, Retention, and Rights

Whilst personal data helps us improve the site, such data does not reside with us, but with third-party services. For policies on data protection, retention, and rights to access/correct/delete, please refer to their [privacy policies](#third-party) for details.

For names or email addresses, if you'd like to delete data entered into the [Contact Form][contact-form], you may also [contact us][contact-form] directly.


## Changes to the Privacy Policy

We may update this privacy policy from time to time. Changes to this Privacy Policy are effective when they are posted on this page. You are advised to review this Privacy Policy periodically for any changes.

By using our website, you acknowledge that you have read and understand this privacy policy.

## Third-Party

For your reference, here is a collection of third-party services we use and their policies.

{% table %}

| Service         | Purpose      | Technical Data[^u] | Identity Data[^u] | Cookies[^u] | Privacy Policy                     |
|-----------------|--------------|:------------------:|:-----------------:|:-----------:|------------------------------------|
| GitHub Pages    | Hosting      |         ✓          |                   |             | [Link][pghp]                       |
| jsDelivr        | CDN          |         ✓          |                   |             | [Link][pjsd]                       |
| Cloudflare      | Analytics    |         ✓          |                   |             | [Link][pclf] (*End Users*)         |
| Disqus[^disqus] | Comments     |         ✓          |      ✓[^dq1]      |      ✓      | [Link][pdqs]                       |
| SoundCloud      | Music Embeds |         ✓          |      ✓[^sc1]      |      ✓      | [Link][pscl] (*SoundCloud Widget*) |
| Getform         | Forms        |         ✓          |      ✓[^gf1]      |   ✓[^gf2]   | [Link][pgfm] (*Respondents*)       |

{% endtable %}

[pghp]: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#data-collection
[pjsd]: https://www.jsdelivr.com/terms/privacy-policy-jsdelivr-net
[pclf]: https://www.cloudflare.com/privacypolicy
[pdqs]: https://help.disqus.com/en/articles/1717103-disqus-privacy-policy
[pscl]: https://soundcloud.com/pages/privacy
[pgfm]: https://getform.io/legal/privacy-policy

[^u]: Third-party data collection as of writing. Their policies may have updated since.
[^dq1]: Applicable if commenting or logged in.
[^sc1]: Applicable if logged in.
[^gf1]: Applicable if filled in.
[^gf2]: Applicable when redirected to getform.io.

- GitHub Pages, jsDelivr, and Cloudflare are present on all HTML pages of our site.
- Disqus will only be loaded on posts which allow comments, and when the page is scrolled down far enough.
- SoundCloud embeds are only loaded on relevant pages (music pages, home page, etc.).
- Getform only applies to pages containing forms (e.g. the contact form).

[^disqus]: Free tier. Supposedly comes with advertising.

## Contact

If you have any questions or concerns about our privacy policy, please [contact us][contact-form].

Thanks for your patience and understanding.


[contact-form]: /#contact
