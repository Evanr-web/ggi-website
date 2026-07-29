# Photo Gallery & Videos — CMS Guide

This guide explains how to add photo galleries and videos to Library articles (essays, news, event recaps, etc.) using Sanity Studio.

Both features are **optional** — if you don't add any photos or videos, those sections simply won't appear on the article page.

---

## Table of Contents

1. [Adding Photos to the Gallery](#1-adding-photos-to-the-gallery)
2. [Adding Videos](#2-adding-videos)
3. [Option A: Uploading a Video Directly](#3-option-a-uploading-a-video-directly)
4. [Option B: Using a YouTube Link](#4-option-b-using-a-youtube-link)
5. [Making a YouTube Video Unlisted](#5-making-a-youtube-video-unlisted)
6. [Tips & Best Practices](#6-tips--best-practices)

---

## 1. Adding Photos to the Gallery

The photo gallery appears as a scrollable filmstrip of thumbnails at the bottom of the article. Visitors can click any photo to open a full-screen lightbox viewer with captions and arrow navigation.

### Steps:

1. **Open Sanity Studio** → go to **Library** → open the article you want to edit (or create a new one)
2. **Scroll down** to the **Photo Gallery** field
3. **Click "Add item"** to add a photo
4. **Click "Upload"** and select a photo from your computer (or drag and drop)
5. **Fill in the optional fields:**
   - **Caption** — shown below the photo in the lightbox viewer (e.g., "Participants rehearsing on Day 2")
   - **Alt Text** — a short description for accessibility (e.g., "Group of students singing in the chapel"). This helps visually impaired visitors who use screen readers.
6. **Repeat** for each photo you want to add
7. **Reorder photos** by dragging them up or down in the list — the order here is the order they appear in the filmstrip
8. **Click Publish** when you're done

### Removing a photo:
Click the **trash icon** next to any photo in the list to remove it. The photo is removed from the article but stays in your Sanity media library for future use.

---

## 2. Adding Videos

The video section appears below the photo gallery. Each video shows as a card with a thumbnail, title, and play button. Visitors click to watch in a popup player.

You have two options for each video:

| Option | Best For | How It Works |
|--------|----------|--------------|
| **Upload File** | Short clips under 3 minutes (phone recordings, quick highlights) | Video file is uploaded directly to Sanity and hosted there |
| **YouTube URL** | Longer videos over 3 minutes (full concerts, lectures, talks) | Video stays on YouTube; the website embeds it |

You can mix both types in the same article — for example, three short uploaded clips and one longer YouTube video.

---

## 3. Option A: Uploading a Video Directly

Best for short clips (under 3 minutes) like event highlights, quick recaps, or behind-the-scenes moments.

### Steps:

1. In your article, scroll down to the **Videos** field
2. Click **"Add item"**
3. Fill in the fields:
   - **Title** (required) — e.g., "Opening Day Rehearsal"
   - **Description** (optional) — e.g., "First run-through of the week's repertoire"
   - **Source** — select **"Upload File"**
   - **Video File** — click Upload and select your video file
   - **Custom Thumbnail** (optional) — upload a still image to use as the preview. If you skip this, visitors will see a plain navy background before they press play.
4. **Click Publish**

### ⚠️ Important: Preparing Your Video for Upload

Large video files will slow down the website and use up storage space. **Please prepare your video before uploading:**

**If you recorded on an iPhone:**
1. Open **Settings** → **Camera** → **Record Video**
2. Change to **1080p at 30fps** (this is plenty for web — 4K is unnecessary and creates files 4× larger)
3. Record your video at this setting

**If you already have a 4K video:**
- Use a free compression tool before uploading:
  - **On iPhone/iPad:** Use the Shortcuts app → search for "Compress Video" shortcut
  - **On Mac:** Use [HandBrake](https://handbrake.fr/) (free) — open your video, select "Fast 1080p30" preset, click Start
  - **On Windows:** Use [HandBrake](https://handbrake.fr/) — same steps as Mac
- Aim for files **under 100MB**

**Quick reference for file sizes:**
| Length | 4K (too big) | 1080p (good) |
|--------|-------------|--------------|
| 30 seconds | ~200 MB | ~50 MB |
| 1 minute | ~400 MB | ~100 MB |
| 2 minutes | ~800 MB | ~200 MB |
| 3 minutes | ~1.2 GB ❌ | ~300 MB |

If your video is over 3 minutes, use **YouTube URL** instead (Option B below).

---

## 4. Option B: Using a YouTube Link

Best for longer videos (concerts, lectures, talks, panel recordings) — YouTube handles the streaming, quality adjustment, and storage.

### Steps:

1. In your article, scroll down to the **Videos** field
2. Click **"Add item"**
3. Fill in the fields:
   - **Title** (required) — e.g., "Final Concert — Full Performance"
   - **Description** (optional) — e.g., "The culminating concert at St. Mary's Cathedral"
   - **Source** — select **"YouTube URL"**
   - **YouTube URL** — paste the full video URL (e.g., `https://www.youtube.com/watch?v=abc123`)
   - **Custom Thumbnail** (optional) — if blank, the YouTube thumbnail is automatically used
4. **Click Publish**

The website will automatically pull the YouTube thumbnail and embed the video player. Visitors watch the video without leaving your website.

---

## 5. Making a YouTube Video Unlisted

If you want a video to appear **only on the GGI website** and **not** in YouTube search results or on your YouTube channel's public page, set it as **Unlisted**.

An unlisted video:
- ✅ Can be embedded and played on the GGI website
- ✅ Can be watched by anyone who has the direct link
- ❌ Does **not** appear in YouTube search results
- ❌ Does **not** appear on your channel's public video list
- ❌ Does **not** get recommended to other YouTube users

### How to upload an Unlisted video to YouTube:

**On a computer (youtube.com):**

1. Go to [YouTube Studio](https://studio.youtube.com/)
2. Click the **Create** button (camera icon with +) in the top right
3. Select **Upload videos**
4. Drag your video file in or click **Select files**
5. Fill in the title and description
6. Click **Next** through the Details, Video Elements, and Checks screens
7. On the **Visibility** screen, select **Unlisted**
8. Click **Save**
9. **Copy the video URL** — you'll paste this into Sanity Studio

**On iPhone/iPad (YouTube app):**

1. Open the **YouTube app**
2. Tap the **+** button at the bottom → **Upload a video**
3. Select your video from your camera roll
4. Add a title and description
5. Tap **Visibility** (or the globe/lock icon)
6. Select **Unlisted**
7. Tap **Upload**
8. Once uploaded, tap the video → tap **Share** → **Copy link**
9. Paste this link into Sanity Studio

**On Android (YouTube app):**

1. Open the **YouTube app**
2. Tap the **+** button → **Upload a video**
3. Select your video
4. Add title and description
5. Tap **Visibility** → select **Unlisted**
6. Tap **Upload**
7. Copy the video link and paste into Sanity Studio

### Changing an existing video to Unlisted:

1. Go to [YouTube Studio](https://studio.youtube.com/) → **Content** (left sidebar)
2. Find the video you want to change
3. Click the **visibility** dropdown (it will say "Public" or "Private")
4. Select **Unlisted**
5. Click **Save**

> **Note:** Do NOT set the video to "Private" — private videos cannot be embedded on websites. **Unlisted** is the correct setting.

---

## 6. Tips & Best Practices

### Photos
- **Image size:** Photos are automatically resized for the filmstrip and lightbox. You don't need to resize them before uploading — Sanity handles this.
- **Orientation:** Landscape (horizontal) photos look best in the filmstrip. Portrait photos will work but will have bars on the sides in the lightbox.
- **Number of photos:** There's no hard limit. 5–20 photos is a good range for an event recap. More than 30 may feel excessive.
- **Captions:** Keep them short (one sentence). They appear below the photo in the lightbox.
- **Order matters:** The first photo in the list is the first one visitors see. Lead with your strongest image.

### Videos
- **Short clips → Upload directly.** Keeps everything in one place, simpler workflow.
- **Long videos → YouTube (Unlisted).** Better streaming quality, no storage concerns.
- **Thumbnails matter.** A good thumbnail makes people want to press play. If your uploaded video doesn't have a custom thumbnail, visitors see a plain navy background — consider adding one.
- **Title every video.** "IMG_4523.mov" is not a title. "Day 3 Choir Rehearsal" is.

### General
- **Preview before publishing:** Use the Preview pane in Sanity Studio to see how your article will look with the gallery and videos before going live.
- **Empty = hidden:** If you don't add any photos, the gallery section doesn't show up at all. Same for videos. You don't need to worry about blank sections.
- **You can always edit later:** Add more photos after publishing, reorder them, swap videos — just edit the article and re-publish.

---

*Questions? Contact the developer for technical issues or the Communications lead for content guidance.*
