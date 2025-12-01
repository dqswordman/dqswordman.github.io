---
permalink: /
title: ""
excerpt: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

Hi! I am **Wenzhang Du**, currently with the Department of Computer Engineering at the International College (MUTIC), Mahanakorn University of Technology in Bangkok, Thailand.

You can find my Google Scholar profile <a href='https://scholar.google.com/citations?user=8nLydvUAAAAJ&hl=en'>here</a>, with total <strong><span id='total_cit'>loading</span></strong> citations tracked automatically <a href='https://scholar.google.com/citations?user=8nLydvUAAAAJ&hl=en'><img src="https://img.shields.io/endpoint?url={{ url | url_encode }}&logo=Google%20Scholar&labelColor=f6f6f6&color=9cf&style=flat&label=citations"></a>.

**Links:** [GitHub](https://github.com/dqswordman) | [Google Scholar](https://scholar.google.com/citations?user=8nLydvUAAAAJ&hl=en)

# News
- 2025-12: Personal homepage initialized.

# Publications
- Add your publications here. Example format with citation badge:
- [Paper title](#), Authors, Venue. <strong><span class='show_paper_citations' data='REPLACE_WITH_PAPER_ID'></span></strong>

# Honors and Awards
- Add your honors and awards here.

# Educations
- Add your education entries here.

# Invited Talks
- Add invited talks here.

# Internships
- Add internships here.
