# Welcome Email Series — ActiveCampaign Templates

## Files

| File | Email | Day | Format | From |
|------|-------|-----|--------|------|
| `email-1-welcome.html` | Welcome + Reading List | 0 | Designed | The Institute |
| `email-2-founders-story.html` | Founder's Story | 3 | Plain text | Ryan |
| `email-3-curated-selection.html` | Curated Reading | 7 | Designed | Ryan + Fellows |
| `email-4a-default.html` | Community (general) | 14 | Designed | Ryan |
| `email-4b-event.html` | Community (event registrants) | 14 | Designed | Ryan |
| `email-4c-content.html` | Community (content discoverers) | 14 | Designed | Ryan |
| `email-5-invitation.html` | The Invitation | 21 | Mixed | Ryan |

## How to Use

1. In ActiveCampaign, create an **Automation** triggered by joining the Magnalia Letter list
2. For each email step, choose **Custom HTML** and paste the contents of the file
3. Set wait times between emails: 3 days, 4 days, 7 days, 7 days

## Placeholders to Replace

### All Emails
- `%FIRSTNAME%` — AC merge tag, works automatically
- `%UNSUBSCRIBELINK%` — AC merge tag, works automatically

### Email 1
- `%%READING_LIST_URL%%` → URL where the PDF is hosted (e.g., `https://gregorythegreat.ca/downloads/reading-list.pdf`)

### Email 3 (Curated Selection)
Replace these with actual content for the first curated issue:
- `%%ARTICLE_1_TITLE%%`, `%%ARTICLE_1_SOURCE%%`, `%%ARTICLE_1_DESCRIPTION%%`, `%%ARTICLE_1_URL%%`
- `%%ARTICLE_2_TITLE%%`, `%%ARTICLE_2_SOURCE%%`, `%%ARTICLE_2_DESCRIPTION%%`, `%%ARTICLE_2_URL%%`
- `%%BOOK_TITLE%%`, `%%BOOK_AUTHOR%%`, `%%BOOK_DESCRIPTION%%`, `%%BOOK_URL%%`
- `%%VIDEO_TITLE%%`, `%%VIDEO_SOURCE%%`, `%%VIDEO_DESCRIPTION%%`, `%%VIDEO_URL%%`
- `%%BEAUTY_TITLE%%`, `%%BEAUTY_DESCRIPTION%%`

### Email 4 Variants
Event dates and program links should be updated seasonally.

## Segmentation (Email 4)

In the AC automation, add an **If/Else** condition before Email 4:

```
IF contact has tag "source:event:*" → Send email-4b-event.html
ELSE IF contact has tag "source:lead-magnet:*" OR "source:youtube" → Send email-4c-content.html  
ELSE → Send email-4a-default.html
```

## Skip Logic (Email 5)

Add a condition before Email 5:
```
IF contact has tag "donor:active" → Skip (end automation)
ELSE → Send email-5-invitation.html
```

## Image URLs

All templates reference the GGI seal at:
```
https://evanr-web.github.io/ggi-website/images/branding/ggi-seal.png
```

When the site moves to `gregorythegreat.ca`, update to:
```
https://gregorythegreat.ca/images/branding/ggi-seal.png
```

## Testing

Before going live:
1. Send test emails to yourself from AC — check rendering in Gmail, Apple Mail, Outlook
2. Verify all links work
3. Confirm `%FIRSTNAME%` renders (test with a contact that has a first name set)
4. Check mobile rendering (resize browser to 375px)

## Brand Reference

- Navy: `#0e3352`
- Gold: `#b89a47`
- Crimson: `#84292d`
- Parchment: `#f8ebd9`
- Background: `#f4f1eb`
- Body font: Georgia, Times New Roman
- UI font: Arial, Helvetica
