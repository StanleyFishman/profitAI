# ProfitAI Bookmark Organizer

This project fetches bookmarked items from Instagram and YouTube and groups them by topic using the OpenAI API. The output is saved to `summary.txt`.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Provide API credentials as environment variables:
   - `YOUTUBE_API_KEY` – API key or OAuth token for the YouTube Data API
   - `INSTAGRAM_ACCESS_TOKEN` – Instagram Graph API access token
   - `INSTAGRAM_USER_ID` – Instagram user ID
   - `OPENAI_API_KEY` – token for OpenAI API

## Usage

Run the script with:

```bash
npm start
```

This will create `summary.txt` with grouped results similar to:

```
пользователь 14.07.2025 добавил в избранное следующие записи:

- спорт -
1) Программа для пресса... (описание видео)
2) Лайфхак как похудеть ... (описание видео)
```

## Notes
- Some APIs may require OAuth flows that are not included here.
- The OpenAI API categorizes items via GPT-3.5-turbo.
