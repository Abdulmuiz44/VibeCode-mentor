import re

with open('lib/articleContent.tsx', 'r') as f:
    content = f.read()

# Replace common contractions and possessives with HTML entities
replacements = [
    ("you've", "you&apos;ve"),
    ("you're", "you&apos;re"),
    ("you'll", "you&apos;ll"),
    ("you'd", "you&apos;d"),
    ("that's", "that&apos;s"),
    ("what's", "what&apos;s"),
    ("it's", "it&apos;s"),
    ("don't", "don&apos;t"),
    ("can't", "can&apos;t"),
    ("won't", "won&apos;t"),
    ("haven't", "haven&apos;t"),
    ("isn't", "isn&apos;t"),
    ("aren't", "aren&apos;t"),
    ("wasn't", "wasn&apos;t"),
    ("weren't", "weren&apos;t"),
    ("hasn't", "hasn&apos;t"),
    ("hadn't", "hadn&apos;t"),
    ("shouldn't", "shouldn&apos;t"),
    ("couldn't", "couldn&apos;t"),
    ("wouldn't", "wouldn&apos;t"),
    ("mightn't", "mightn&apos;t"),
    ("mustn't", "mustn&apos;t"),
    ("let's", "let&apos;s"),
    ("I've", "I&apos;ve"),
    ("I'll", "I&apos;ll"),
    ("I'd", "I&apos;d"),
    ("I'm", "I&apos;m"),
    ("we've", "we&apos;ve"),
    ("we'll", "we&apos;ll"),
    ("we'd", "we&apos;d"),
    ("we're", "we&apos;re"),
    ("they've", "they&apos;ve"),
    ("they'll", "they&apos;ll"),
    ("they'd", "they&apos;d"),
    ("they're", "they&apos;re"),
    ("there's", "there&apos;s"),
    ("here's", "here&apos;s"),
    ("who's", "who&apos;s"),
    ("it'll", "it&apos;ll"),
    ("it'd", "it&apos;d"),
    ("that'll", "that&apos;ll"),
    ("that'd", "that&apos;d"),
]

for old, new in replacements:
    content = content.replace(old, new)

# Also replace curly/smart quotes with straight quotes
content = content.replace("'", "'")  # Left single quotation mark U+2018
content = content.replace("'", "'")  # Right single quotation mark U+2019
content = content.replace(""", '"')  # Left double quotation mark U+201C
content = content.replace(""", '"')  # Right double quotation mark U+201D
content = content.replace("´", "'")  # Acute accent U+00B4
content = content.replace("`", "'")  # Grave accent U+0060

with open('lib/articleContent.tsx', 'w') as f:
    f.write(content)

print("Fixed all unescaped quotes!")
