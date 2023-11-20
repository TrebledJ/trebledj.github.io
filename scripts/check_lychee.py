# import sys
# import re
import requests
# import multiprocessing as mp
# from collections import namedtuple
# import json
# from pprint import pprint
# from selenium import webdriver

url = 'https://www.electronics-tutorials.ws/waveforms/waveforms.html'
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    # 'Accept': 'text/html,*/*',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    # 'Accept-Language': 'en,en-US;q=0.9;',
    'Accept-Language': 'en',
    'Connection': 'keep-alive',
    'Dnt': '1',
    'Sec-Ch-Ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
}
res = requests.get(url, headers=headers, timeout=10)

# def check(link):
#     print(f'checking: {link}')

#     # headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.76 Safari/537.36'}
#     headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'}

#     try:
#         res = requests.get(link, headers=headers, timeout=10)
#         if res.status_code != 200:
#             print(f'fail: {link}')
#             print(f'got status {res.status_code} for {link}')
#             return False
#         print(f'success: {link}')
#         return True

#     except requests.exceptions.Timeout:
#         print("Timed out")
#         print("Trying selenium")

#         from selenium import webdriver
#         from selenium.webdriver.chrome.options import Options
#         options = Options()
#         options.add_argument('--headless=new')
#         # Set up the Selenium driver (ensure you have the appropriate driver executable in your PATH)
#         driver = webdriver.Chrome(options=options)

#         # Navigate to the webpage
#         driver.get(link)

#         # Find the link element by its locator
#         # link = driver("Link Text")

#         # Check if the link exists
#         if link:
#             print("Link exists!")
#         else:
#             print("Link does not exist!")

#         # Close the browser
#         driver.quit()
#         return True
    

# if __name__ == '__main__':
#     # if len(sys.argv) < 2:
#     #     print(f'Usage: {sys.argv[0]} <lychee-output>')

#     # file = sys.argv[1]
#     file = 'scripts/output.json'

#     with open(file) as f:
#         data = json.load(f)

#     # Item = namedtuple('Item', ['link', 'type', 'source'])


#     links = set()
#     problem = {}

#     # Get list of links.
#     fail_map = data['fail_map']
#     for src, fails in fail_map.items():
#         for f in fails:
#             url = f['url']
#             if url not in links:
#                 links.add(url)
#                 problem[url] = f['status']

#     # lines = txt.splitlines()
#     # for line in lines:
#     #     if 'http' in line:
#     #         if m := re.findall(r'\[([^\]]+)\]\(([^\]]+?)\)', line):
#     #             display, link = m[0]
#     #             if display == link:
#     #                 links.add(link)

#     links = list(links)
#     print('links:')
#     pprint(links)
#     # with mp.Pool(4) as pool:
#         # res = pool.map(check, links)
#     for l in links:
#         check(l)

#     okmap = {link: status for link, status in zip(links, res)}

#     print(f'{res.count(True)}/{len(links)} links are actually ok!')

#     # Purge false positives.
#     print('fail map (before):')
#     pprint(fail_map)
#     for src, fails in fail_map.items():
#         for f in fails:
#             if okmap[f['url']] == True:
#                 # False positive!
#                 del f
#     print('fail map (after):')
#     pprint(fail_map)

#     # i = 0
#     # output = []
#     # header = '### Errors in'
#     # while i < len(lines):
#     #     if lines[i].startswith(header):
#     #         j = i
#     #         while True:
#     #             if lines[j+1].startswith(header):
#     #                 break
#     #             j += 1
            
#     #     output.append(lines[i])
#     #     i += 1
