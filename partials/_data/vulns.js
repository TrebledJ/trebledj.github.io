export default [
    {
        type: 'group',
        name: 'Multiple Vulnerabilities in Siemens Apogee/Talon PLCs',
        tags: ['embedded', 'cpp', 'reverse', 'cryptography'],
        items: [
            {
                type: 'cve',
                name: 'CVE-2024-54089',
                date: '2025-02-11',
                description: 'A vulnerability has been identified in APOGEE PXC Series (BACnet) (All versions), APOGEE PXC Series (P2 Ethernet) (All versions), TALON TC Series (BACnet) (All versions). Affected devices contain a weak encryption mechanism based on a hard-coded key. This could allow an attacker to guess or decrypt the password from the cyphertext.',
                links: { advisory: 'https://cert-portal.siemens.com/productcert/html/ssa-615116.html', writeup: '/posts/reversing-a-siemens-plc-for-funs-and-vulns/' },
            },
            {
                type: 'cve',
                name: 'CVE-2024-54090',
                date: '2025-02-11',
                description: 'A vulnerability has been identified in APOGEE PXC Series (BACnet) (All versions), APOGEE PXC Series (P2 Ethernet) (All versions), TALON TC Series (BACnet) (All versions). Affected devices contain an out-of-bounds read in the memory dump function. This could allow an attacker with Medium (MED) or higher privileges to cause the device to enter an insecure cold start state.',
                links: { advisory: 'https://cert-portal.siemens.com/productcert/html/ssa-615116.html', writeup: '/posts/reversing-a-siemens-plc-for-funs-and-vulns/' },
            },
            {
                type: 'cve',
                name: 'CVE-2025-40757',
                date: '2025-09-09',
                description: 'A vulnerability has been identified in APOGEE PXC Series (BACnet) (All versions), APOGEE PXC Series (P2 Ethernet) (All versions), TALON TC Series (BACnet) (All versions). Affected devices connected to the network allow unrestricted access to sensitive files over BACnet, including a .db file containing encrypted passwords.',
                links: { advisory: 'https://cert-portal.siemens.com/productcert/html/ssa-916339.html', writeup: '/posts/reversing-a-siemens-plc-for-funs-and-vulns/' },
            },
        ]
    },
];