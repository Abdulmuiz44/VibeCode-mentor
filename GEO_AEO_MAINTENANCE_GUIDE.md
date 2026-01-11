# GEO/AEO Maintenance Guide

## Quick Reference for Keeping Optimizations Current

### Files to Maintain

#### 1. `/public/llms.txt` and `/public/llms-full.txt`
**Update Frequency:** Quarterly or when major features launch

**What to Update:**
- Statistics (blueprints generated, users, ratings)
- Feature list if new capabilities added
- API endpoint documentation
- Roadmap items (move completed items to past tense)
- Creator contact information

**Format:** Markdown only - no code

**Testing:** 
```bash
# Verify file is accessible
curl https://vibecodementor.app/public/llms.txt
```

---

#### 2. `components/StructuredData.tsx`
**Update Frequency:** When features change or new FAQs emerge

**What to Update:**
- `features` array: Add/remove when capabilities change
- `faqData.mainEntity`: Add new questions as conversational queries arise
- `aggregateRating`: Update with new user feedback
- `organizationData`: Update founder info if roles change
- `howToSchema.step`: Update workflow if process changes

**Testing:**
- Use [Google Schema Validator](https://validator.schema.org/) to test JSON-LD
- Check console for any JSON syntax errors

---

#### 3. `/app/about/page.tsx`
**Update Frequency:** Semi-annually

**What to Update:**
- Credentials and metrics (500+, 10+, 99.9%, 5,000+)
- Founder bio and achievements
- Technology stack versions (Next.js, .NET, etc.)
- Performance metrics (uptime, LCP, CLS)
- Trust signals and case studies

**Key Sections:**
```tsx
// Update these numbers quarterly
- Open Source Contributions: 500+
- Production SaaS Apps: 10+
- Blueprints Generated: 5,000+
- Accuracy Rate: 99.9%
```

---

#### 4. `/app/page.tsx` (Homepage)
**Update Frequency:** When major features launch

**What to Update:**
- Feature descriptions (H3 question headers)
- Direct answer paragraphs (40-60 words)
- Statistics in hero section
- Template count if new templates added
- CTA button text if pricing changes

**Critical Sections:**
```tsx
// Direct answer paragraphs for AEO
<div className="bg-gray-800 border-l-4 border-purple-500 p-6">
  <p className="text-gray-200 font-medium italic">
    // Keep this to 40-60 words for AI snippet extraction
  </p>
</div>
```

---

### Quarterly Maintenance Checklist

```markdown
## Q1 Review (January)
- [ ] Update blueprint count statistics
- [ ] Review FAQPage schema for new conversational queries
- [ ] Update accuracy metrics if changed
- [ ] Check Core Web Vitals (Lighthouse)
- [ ] Review uptime metrics

## Q2 Review (April)
- [ ] Update tech stack versions if upgraded
- [ ] Review founder achievements and add new credentials
- [ ] Update roadmap items in llms-full.txt
- [ ] Add new FAQ questions based on support tickets
- [ ] Update pricing if changed

## Q3 Review (July)
- [ ] Review all statistics and update with latest numbers
- [ ] Add case studies or success metrics to About page
- [ ] Update team information if expanded
- [ ] Review performance metrics
- [ ] Update security compliance status

## Q4 Review (October)
- [ ] Annual metrics update (users, blueprints, ratings)
- [ ] Update year-end achievements
- [ ] Review and refresh all E-E-A-T signals
- [ ] Plan next year's roadmap
- [ ] Verify all external links work
```

---

### How to Add a New FAQ

**Location:** `components/StructuredData.tsx` → `faqData.mainEntity`

**Template:**
```tsx
{
  '@type': 'Question',
  name: 'Your question here?',
  acceptedAnswer: {
    '@type': 'Answer',
    text: 'Your answer here. Keep to 40-80 words. Use clear, direct language that AI agents can extract as snippets.',
  },
},
```

**Guidelines:**
- Use 40-80 words for answers
- Write in first/second person ("you", "we")
- Include keywords naturally
- Make answers standalone (can be read without context)
- Target conversational queries (questions people ask AI agents)

**Examples:**
✅ "How do I start vibecoding?"  
✅ "What is the best tech stack for AI apps?"  
✅ "Can I use VibeCode with Claude or ChatGPT?"  
❌ "Vibecoding Basics" (not a question)

---

### How to Update Statistics

**Where to Update:**
1. **Homepage** (`app/page.tsx`):
   ```tsx
   <div className="text-2xl font-bold text-white">
     {stats.blueprintsCount.toLocaleString()}+
   </div>
   <div className="text-sm">Blueprints Generated</div>
   ```

2. **About Page** (`app/about/page.tsx`):
   ```tsx
   <div className="text-lg font-bold text-white">5,000+</div>
   <div className="text-sm text-gray-400">Blueprints Generated</div>
   ```

3. **StructuredData** (`components/StructuredData.tsx`):
   ```tsx
   aggregateRating: {
     '@type': 'AggregateRating',
     ratingValue: '4.8',      // Update if changed
     ratingCount: '100',      // Update with real count
   },
   ```

4. **llms-full.txt**:
   ```
   5,000+ Blueprints Generated
   5,000+ Active Users
   4.8★ User Rating
   ```

**Data Source:** Should come from `/api/stats` endpoint

---

### Performance Monitoring

**Key Metrics to Track:**

```
Weekly:
- Homepage LCP: target < 1.0s
- API response times: target < 200ms
- Uptime: target 99.9%+

Monthly:
- Core Web Vitals (Lighthouse)
  - LCP: < 1.0s
  - FID: < 50ms
  - CLS: < 0.05
- Search Console impressions
- AI agent crawl patterns

Quarterly:
- User feedback on accuracy
- Customer support trends
- Performance regression analysis
```

**Tools:**
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Schema Validator](https://validator.schema.org/)
- [Search Console](https://search.google.com/search-console)

---

### Content Style Guide for AEO Optimization

**Answer Length:** 40-60 words for quick AI extraction

**Writing Style:**
- Clear, direct language
- Use active voice
- Include keywords naturally
- Avoid jargon when possible
- Provide specific examples

**Example (Good):**
"VibeCode Mentor instantly generates production-ready blueprints. Describe your project idea and receive a comprehensive blueprint with system architecture, database schema, API specifications, and tech stack recommendations powered by Mistral AI."
(52 words - perfect for AEO)

**Example (Bad):**
"Our platform uses sophisticated AI algorithms to facilitate the generation of architectural artifacts that enable more efficient software development workflows."
(Too vague, too long, unclear)

---

### Handling New Features

**When Adding a New Feature:**

1. **Update Homepage** (`app/page.tsx`)
   - Add to features grid with question-formatted heading
   - Include 40-60 word direct answer
   - Add relevant icon/visual

2. **Update StructuredData** (`components/StructuredData.tsx`)
   - Add to `features` array
   - Add related FAQ if appropriate
   - Update `featureSchema` if new feature category

3. **Update About Page** (`app/about/page.tsx`)
   - Mention in "Technology & Transparency" section
   - Update roadmap if it was a planned feature
   - Add to tech stack if relevant

4. **Update llms.txt Files**
   - Add to feature list
   - Update descriptions in llms-full.txt
   - Add API docs if new endpoint

5. **Test Schema**
   - Run through [Schema Validator](https://validator.schema.org/)
   - Check Google Search Console for indexing

---

### Link Maintenance

**Check Monthly:**
- All internal links work (no 404s)
- External links still active
  - GitHub profile links
  - LinkedIn profile links
  - Social media links
- CTA buttons point to correct pages

**Tools:**
- [Dead Link Checker](https://www.deadlinkchecker.com/)
- Google Search Console (404 report)

---

### Competitive Monitoring

**Watch These Competitors:**
- Other blueprint generators (if emerge)
- General code generation tools (ChatGPT, Claude)
- Web framework starter templates

**Update FAQs based on:**
- Customer support questions
- Competitive advantages we gain
- New conversational queries trending on AI agents

---

### Schema Validation Checklist

Before deploying any changes:

```
[ ] Run StructuredData.tsx through schema validator
[ ] Check Google Search Console for structured data errors
[ ] Verify all JSON is valid (no syntax errors)
[ ] Test on mobile devices (some tags mobile-only)
[ ] Verify images are accessible (for schema image fields)
[ ] Check that all URLs in schema are absolute (https://...)
[ ] Test that FAQPage renders correctly in Google results
```

---

### Analytics to Track

**In Google Analytics:**
- Pageviews for `/about` page (E-E-A-T content)
- Bounce rate on AEO-optimized sections
- Time on page for feature descriptions
- Clicks on "Learn more" links in features

**In Search Console:**
- Impressions for "vibecoding" queries
- Click-through rate for structured data
- "How to" query performance (HowTo schema)
- FAQ query performance

**Custom Events:**
- Track blueprint generation count (for stats update)
- Track AI chat session metrics
- Track export usage (PDF, Markdown, JSON)

---

### Troubleshooting

**Problem:** Schema validation errors
**Solution:** 
1. Copy JSON to [Schema Validator](https://validator.schema.org/)
2. Check for unescaped quotes or special characters
3. Verify all required fields present
4. Check field types match schema requirements

**Problem:** Featured snippet not appearing
**Solution:**
1. Check answer is 40-60 words
2. Verify content is in a `<p>` tag
3. Add header just before answer
4. Use consistent formatting
5. Wait 4-8 weeks for Google to reindex

**Problem:** Core Web Vitals degrading
**Solution:**
1. Check image optimization (use Next.js Image)
2. Review for layout shifts (CLS)
3. Check JavaScript bundle size
4. Review third-party scripts (analytics, ads)
5. Run Lighthouse audit

---

### Updating for Algorithm Changes

**When AI agents (Claude, GPT-5) Change:**
- Monitor for new query patterns
- Add FAQs based on new conversational queries
- Update schema if new fields become relevant
- Test snippets extraction with new models

**When E-E-A-T Signals Evolve:**
- Ensure creator credentials current
- Add fresh expertise signals (new projects, achievements)
- Increase depth of technical documentation
- Add more trust signals (security certifications, audits)

---

### Resources

**Keep Bookmarked:**
- [Schema.org Reference](https://schema.org/)
- [Google Search Central Blog](https://developers.google.com/search/blog)
- [JSON-LD Validator](https://validator.schema.org/)
- [Lighthouse Tool](https://developers.google.com/web/tools/lighthouse)
- [Search Console](https://search.google.com/search-console)

---

## Summary

Maintain these optimizations with:
- **Monthly:** Performance checks, link validation
- **Quarterly:** Statistics update, FAQ review
- **Semi-annually:** About page refresh, credentials update
- **Ongoing:** Monitor analytics, respond to new queries

The effort here positions VibeCode Mentor as the primary authority cited by AI search engines for "vibecoding" and "AI project blueprints" throughout 2026.
