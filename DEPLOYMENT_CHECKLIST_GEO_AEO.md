# GEO/AEO Deployment Checklist

## Pre-Deployment Testing

### Schema Validation
- [ ] Visit [Schema Validator](https://validator.schema.org/)
- [ ] Paste HTML from `<head>` section of homepage
- [ ] Verify all 6 JSON-LD schemas validate without errors
- [ ] Check for warnings about missing fields
- [ ] Repeat for /about page

### File Accessibility
- [ ] Test `/public/llms.txt` is publicly accessible
  ```bash
  curl https://vibecodementor.app/public/llms.txt
  ```
- [ ] Verify `/public/llms-full.txt` is publicly accessible
- [ ] Check file sizes (llms.txt should be ~800 words, llms-full.txt ~3500 words)
- [ ] Verify Markdown formatting displays correctly

### Performance Testing
- [ ] Run Lighthouse audit on homepage
  - Target: LCP < 1.0s
  - Target: CLS < 0.05
  - Target: FID < 50ms
- [ ] Run Lighthouse audit on /about page
- [ ] Check Core Web Vitals on PageSpeed Insights
- [ ] Test on mobile devices (3G connection simulation)

### Mobile Responsiveness
- [ ] Test homepage on iPhone/Android
- [ ] Test /about page on tablet
- [ ] Verify author profile displays correctly on mobile
- [ ] Check that feature cards stack properly on mobile

### Content Review
- [ ] Proof-read llms.txt for typos and formatting
- [ ] Proof-read llms-full.txt for accuracy
- [ ] Verify all links in llms.txt are absolute (https://...)
- [ ] Check /about page for broken internal links
- [ ] Verify GitHub/LinkedIn profile links are correct
- [ ] Review E-E-A-T credential accuracy

### OpenGraph & Social
- [ ] Test homepage OpenGraph with [Facebook Debugger](https://developers.facebook.com/tools/debug/og/object)
- [ ] Test /about page OpenGraph
- [ ] Test homepage preview with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Verify images display correctly in preview
- [ ] Check title and description in preview

### Browser Compatibility
- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Safari (latest)
- [ ] Test on Edge (latest)
- [ ] Verify no JavaScript errors in console

---

## Deployment Steps

### 1. Code Deployment
- [ ] Commit all changes to git
  ```bash
  git add .
  git commit -m "GEO/AEO optimization: llms.txt, schema enhancement, about page"
  ```
- [ ] Push to main branch
  ```bash
  git push origin main
  ```
- [ ] Verify deployment pipeline triggers
- [ ] Wait for deployment to complete
- [ ] Verify site is live

### 2. Verify Live Deployment
- [ ] Visit https://vibecodementor.app/ in browser
- [ ] Check `/public/llms.txt` is accessible
- [ ] Check `/public/llms-full.txt` is accessible
- [ ] Visit /about page
- [ ] Verify all links work (no 404s)
- [ ] Check console for errors (F12)

### 3. Search Console Submission
- [ ] Go to [Google Search Console](https://search.google.com/search-console)
- [ ] Verify site is claimed
- [ ] Submit sitemap.xml for re-crawl
- [ ] Submit homepage for re-crawl
- [ ] Submit /about page for crawl
- [ ] Monitor for indexing errors

### 4. Structured Data Verification
- [ ] Go to Search Console → Settings → Enhancement reports
- [ ] Check "Enhancements" → "Rich Results"
- [ ] Verify no structured data errors
- [ ] Wait 24-48 hours for initial crawl

### 5. Analytics Setup
- [ ] Verify Google Analytics is tracking (check Real-time)
- [ ] Set up custom events for:
  - [ ] Blueprint generation
  - [ ] Feature button clicks
  - [ ] Template selections
- [ ] Create dashboard for GEO/AEO metrics:
  - [ ] /about page pageviews
  - [ ] Feature section engagement
  - [ ] External link clicks

---

## Post-Deployment Monitoring (First Week)

### Daily Checks
- [ ] Check homepage loads < 1.0s LCP
- [ ] Verify no console errors
- [ ] Check Search Console for crawl errors
- [ ] Monitor API response times
- [ ] Check uptime monitoring tool (UptimeRobot, etc.)

### Analytics Review
- [ ] Check traffic to /about page
- [ ] Review bounce rate on homepage
- [ ] Monitor feature section engagement
- [ ] Check conversion rate (signups, blueprint generation)

### User Feedback
- [ ] Monitor support tickets for issues
- [ ] Check social media for mentions
- [ ] Review Hacker News/Product Hunt (if posted)
- [ ] Collect early user feedback on changes

### Search Engine Signals
- [ ] Monitor Search Console impressions
- [ ] Watch for any manual action notifications
- [ ] Check average position for target keywords
- [ ] Monitor click-through rate

---

## Post-Deployment Monitoring (First Month)

### Week 1-2
- [ ] Verify all pages are indexed in Google
- [ ] Check for structured data rich results
- [ ] Monitor Core Web Vitals
- [ ] Track traffic sources from referrer logs
- [ ] Collect user feedback

### Week 2-4
- [ ] Analyze /about page engagement
- [ ] Review feature button click patterns
- [ ] Check if featured snippets appear
- [ ] Monitor for AI agent crawling (check referrer logs)
- [ ] Update metrics if they've changed significantly

### Month 1 Analysis
- [ ] Prepare first month report
- [ ] Calculate impact on:
  - [ ] Homepage engagement
  - [ ] /about page traffic
  - [ ] Blueprint generation conversions
- [ ] Review Core Web Vitals performance
- [ ] Document any issues encountered

---

## Ongoing Maintenance (Monthly)

### Monthly Tasks (First of Month)
- [ ] [ ] Update statistics if changed:
  - [ ] Blueprint count
  - [ ] User count
  - [ ] Rating
  - [ ] Open source contributions
- [ ] [ ] Review FAQ for new questions from support tickets
- [ ] [ ] Check all external links still work
- [ ] [ ] Update links if domains have changed
- [ ] [ ] Review Core Web Vitals

### Monthly Search Console Review
- [ ] Check total impressions
- [ ] Monitor click-through rate
- [ ] Review "Discover" impressions
- [ ] Check for any new errors
- [ ] Update sitemaps if needed

### Monthly Analytics Review
- [ ] Review /about page traffic and engagement
- [ ] Check feature section click-through rates
- [ ] Monitor conversion funnel
- [ ] Compare to previous month
- [ ] Identify trends

---

## Quarterly Tasks

### Q1, Q2, Q3, Q4 (Every 3 months)
- [ ] Full content audit
  - [ ] Update creator credentials
  - [ ] Refresh statistics
  - [ ] Review and update FAQ questions
  - [ ] Add new case studies if available
- [ ] Performance audit
  - [ ] Run full Lighthouse report
  - [ ] Review Core Web Vitals
  - [ ] Check security headers
- [ ] Competitive analysis
  - [ ] Monitor competitor tools
  - [ ] Review new AI agent features
  - [ ] Update schema if new fields relevant
- [ ] Update documentation files
  - [ ] Refresh llms.txt if major changes
  - [ ] Update llms-full.txt with new info
  - [ ] Review and update About page

---

## Annual Review (End of Year)

### Year-End Tasks
- [ ] Full metrics review
  - [ ] Total blueprints generated
  - [ ] Total users
  - [ ] Average rating
  - [ ] Traffic growth
- [ ] Update all credentials/achievements
- [ ] Refresh case studies
- [ ] Update roadmap
- [ ] Plan next year's optimizations
- [ ] Prepare annual report
- [ ] Archive quarterly reports

---

## Troubleshooting

### Problem: Schema Validation Error
**Solution:**
1. Check for unescaped quotes in JSON
2. Verify all required fields present
3. Use [Schema Validator](https://validator.schema.org/) to identify exact issue
4. Fix in StructuredData.tsx
5. Test locally before pushing

### Problem: Featured Snippet Not Appearing
**Solution:**
1. Check answer is 40-60 words
2. Verify in `<p>` tag (not `<span>`)
3. Ensure header directly precedes answer
4. Submit page to Search Console for re-crawl
5. Wait 4-8 weeks for Google to update

### Problem: /about Page Not Ranking
**Solution:**
1. Check page is indexed in Search Console
2. Verify no robots.txt blocking
3. Check for meta robots noindex
4. Submit to Search Console for crawl
5. Build backlinks to /about from homepage
6. Ensure mobile-friendly (test with Lighthouse)

### Problem: Core Web Vitals Poor
**Solution:**
1. Check image optimization (use Next.js Image)
2. Review CSS (look for FOUC)
3. Check third-party scripts (Analytics, ads)
4. Review JavaScript bundle size
5. Check database query performance
6. Consider CDN caching optimization

### Problem: Low /about Page Traffic
**Solution:**
1. Add links to /about from homepage
2. Link from footer
3. Create blog posts linking to /about
4. Share on social media
5. Build backlinks (PR, partnerships)
6. Consider content upgrade (video, infographic)

---

## Sign-Off Checklist

### Technical Lead
- [ ] All code reviewed and approved
- [ ] Tests pass
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Signed off: ________________ Date: ________

### Marketing/Product Lead
- [ ] Content approved
- [ ] No branding issues
- [ ] Messaging consistent
- [ ] Links accurate
- [ ] Analytics set up
- [ ] Signed off: ________________ Date: ________

### Deployment Lead
- [ ] All pre-deployment tests passed
- [ ] Deployment completed successfully
- [ ] Post-deployment verification complete
- [ ] Monitoring active
- [ ] Rollback plan ready
- [ ] Signed off: ________________ Date: ________

---

## Go-Live Communication

### Announcement Template
```
🚀 We've optimized VibeCode Mentor for AI agents in 2026!

New features:
✅ llms.txt for easy AI ingestion
✅ Enhanced schema for better understanding
✅ Answer Engine Optimization for snippets
✅ Comprehensive About page with creator info
✅ Question-based feature descriptions

Learn more: vibecodementor.app/about

We're now positioned as the primary authority for "vibecoding" and "AI project blueprints" across Claude, GPT-5, Gemini, and other AI agents.
```

### Sharing Channels
- [ ] Tweet announcement
- [ ] Post to LinkedIn
- [ ] Add to newsletter
- [ ] Update social media bios
- [ ] Mention in blog post
- [ ] Add to changelog

---

## Success Metrics (Track for 6 Months)

| Metric | Target | Current | 1mo | 3mo | 6mo |
|--------|--------|---------|-----|-----|-----|
| /about page traffic | 5% of total | | | | |
| Feature section CTR | 15%+ | | | | |
| Blueprint generation rate | +20% | | | | |
| AI agent referrals | 5% of traffic | | | | |
| Core Web Vitals (LCP) | <1.0s | | | | |
| Uptime | 99.9%+ | | | | |
| Search impressions | +30% | | | | |
| Brand mentions | +10x | | | | |

---

## Notes

**Deployment Date:** _______________

**Deployed By:** _______________

**Any Issues Encountered:** 

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Next Review:** April 2026
