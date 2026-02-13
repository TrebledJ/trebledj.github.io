const VULNS = [
    {
        type: 'group',
        name: 'Multiple Vulnerabilities in Siemens APOGEE/TALON Field Panels',
        tags: ['embedded', 'cpp', 'reverse', 'cryptography'],
        description: 'The Siemens APOGEE PXC and TALON TC Series are a collection of field panels used for complex control, monitoring, and energy management within commercial buildings. They interconnect with other components to form a building automation system, often communicating via BACnet over IP. Affected Devices: APOGEE PXC Series (BACnet) (All versions), APOGEE PXC Series (P2 Ethernet) (All versions), TALON TC Series (BACnet) (All versions).',
        items: [
            {
                type: 'cve',
                name: 'CVE-2024-54089',
                date: '2025-02-11',
                severity: 'high',
                description: 'Affected devices contain a weak encryption mechanism based on a hard-coded key. This could allow an attacker to guess or decrypt the password from the cyphertext.',
                links: [
                    { url: 'https://cert-portal.siemens.com/productcert/html/ssa-615116.html', title: 'advisory' },
                    { url: 'https://blog.darklab.hk/2025/09/12/reverse-engineering-a-siemens-programmable-logic-controller-for-funs-and-vulns/', title: 'writeup.main' },
                    { url: '/posts/reversing-a-siemens-plc-for-funs-and-vulns/', title: 'writeup.mirror' },
                ],
            },
            {
                type: 'cve',
                name: 'CVE-2024-54090',
                date: '2025-02-11',
                severity: 'medium / high',
                description: 'Affected devices contain an out-of-bounds read in the memory dump function. This could allow an attacker with Medium (MED) or higher privileges to cause the device to enter an insecure cold start state.',
                links: [
                    { url: 'https://cert-portal.siemens.com/productcert/html/ssa-615116.html', title: 'advisory' },
                    { url: 'https://blog.darklab.hk/2025/09/12/reverse-engineering-a-siemens-programmable-logic-controller-for-funs-and-vulns/', title: 'writeup.main' },
                    { url: '/posts/reversing-a-siemens-plc-for-funs-and-vulns/', title: 'writeup.mirror' },
                ]
            },
            {
                type: 'cve',
                name: 'CVE-2025-40757',
                date: '2025-09-09',
                severity: 'high',
                description: 'Affected devices connected to the network allow unrestricted access to sensitive files over BACnet, including a .db file containing encrypted passwords. Can be chained with CVE-2024-54089 to bypass authentication and takeover/shutdown the affected devices.',
                links: [
                    { url: 'https://cert-portal.siemens.com/productcert/html/ssa-916339.html', title: 'advisory' },
                    { url: 'https://blog.darklab.hk/2025/09/12/reverse-engineering-a-siemens-programmable-logic-controller-for-funs-and-vulns/', title: 'writeup.main' },
                    { url: '/posts/reversing-a-siemens-plc-for-funs-and-vulns/', title: 'writeup.mirror' },
                ]
            },
        ]
    },
    {
        type: 'group',
        name: 'Multiple Vulnerabilities in Oracle Hospitality OPERA 5',
        tags: ['web', 'java'],
        description: 'Oracle Hospitality OPERA is a property management system (PMS) used by hotels, resorts, and chains to manage daily operations such as reservations, check-ins, room assignments, billing, and revenue. At the time of writing, there are over 500 instances exposed to the public internet. Affected Software: Oracle Hospitality OPERA 5, versions at and below 5.6.19.23, 5.6.25.17, 5.6.26.10, 5.6.27.4, 5.6.28.0.',
        items: [
            {
                type: 'cve',
                name: 'CVE-2026-21966',
                date: '2026-01-20',
                severity: 'low / medium',
                description: 'A reflected cross-site scripting (XSS) vulnerability has been identified in Oracle Hospitality OPERA. Attackers can leverage the vulnerability to deliver social engineering attacks and execute client-side code in the victim\'s browser.',
                links: [
                    { url: 'https://www.oracle.com/security-alerts/cpujan2026.html', title: 'advisory' },
                    { url: 'https://blog.darklab.hk/2026/02/13/when-hospitality-software-is-too-hospitable-a-curious-ssrf-in-oracle-hospitality-opera-cve-2026-21966-cve-2026-21967/', title: 'writeup.main' },
                    { url: '/posts/oracle-opera-vulns/', title: 'writeup.mirror' },
                ],
            },
            {
                type: 'cve',
                name: 'CVE-2026-21967',
                date: '2026-01-20',
                severity: 'high / critical',
                description: 'A server-side request forgery (SSRF) vulnerability has been identified in Oracle Hospitality OPERA. Attackers can leverage the vulnerability to disclose database credentials, invoke POST requests on arbitrary URLs, and enumerate internal networks. The compromised database accounts are used by the OPERA system for business operations and are thus configured with read/write privileges. This may lead to further disclosure of personally-identifiable information (PII) or disruption of business operations if the attacker has access to the database port.',
                links: [
                    { url: 'https://www.oracle.com/security-alerts/cpujan2026.html', title: 'advisory' },
                    { url: 'https://blog.darklab.hk/2026/02/13/when-hospitality-software-is-too-hospitable-a-curious-ssrf-in-oracle-hospitality-opera-cve-2026-21966-cve-2026-21967/', title: 'writeup.main' },
                    { url: '/posts/oracle-opera-vulns/', title: 'writeup.mirror' },
                ]
            },
        ]
    },
];

const vrAssignIndex = (vulns) => {
    /**
     * Modifies the title of a link with a unique index so that we can render it
     * like [x(0)](http://a.com), [y(1)](http://b.com), [z(0)](http://a.com).
     * This makes it clear some links are the same.
     */
    const seen = [];

    const process = (link) => {
        let index = seen.indexOf(link.url);
        if (index === -1) {
            seen.push(link.url);
            index = seen.length - 1;
        }
        // Update the title in the new format.
        link.title = `${link.title}[${index}]`;
    };

    for (const vuln of vulns) {
        if (vuln.type === 'group') {
            for (const item of vuln.items) {
                for (const link of item.links) {
                    process(link);
                }
            }
        } else {
            throw 'not implemented';
        }
    }
};

VULNS.reverse();
vrAssignIndex(VULNS);

export default VULNS;