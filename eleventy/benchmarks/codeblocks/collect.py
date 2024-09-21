"""
Collect all code blocks in content.
"""

import os
import re

def remove_prefix(fence):
    lines = fence.split('\n')
    first_line = lines[0]
    prefix = first_line[:first_line.index('```')]
    return '\n'.join(x[len(prefix):] for x in lines)

# Function to extract code fences from a given markdown file
def extract_code_fences(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
        # code_fences = re.findall(r'```[\w\W]*?```', content, re.MULTILINE)
        # return code_fences
        code_fences = re.findall(r'\n(([^\n]*)```[\w\W]*?\n(\2)```)', content, re.MULTILINE)
        return [remove_prefix(x[0]) for x in code_fences]

# Function to recursively find markdown files in a directory
def find_markdown_files(directory):
    markdown_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.md'):
                markdown_files.append(os.path.join(root, file))
    return markdown_files

# Main function to extract code fences from markdown files and write them to sample.md
def extract_and_write_code_fences(directory, output_file):
    markdown_files = find_markdown_files(directory)
    code_fences = []
    for file in markdown_files:
        code_fences += extract_code_fences(file)
    
    print(f'Found {len(code_fences)} code blocks!')
    
    with open(output_file, 'w', encoding='utf-8') as out_file:
        for code_fence in code_fences:
            out_file.write(code_fence + '\n\n')

# Run the script
extract_and_write_code_fences('content', 'eleventy/fixtures/codeblocks.md')