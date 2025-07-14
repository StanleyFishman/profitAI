const fs = require('fs');
const axios = require('axios');
const { google } = require('googleapis');
const { Configuration, OpenAIApi } = require('openai');

// Load environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

async function getYouTubeBookmarks() {
  if (!YOUTUBE_API_KEY) return [];
  const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });
  try {
    const response = await youtube.videos.list({
      part: 'snippet',
      myRating: 'like',
      maxResults: 25
    });
    return response.data.items.map(item => ({
      source: 'youtube',
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description
    }));
  } catch (err) {
    console.error('Failed to fetch YouTube data', err.message);
    return [];
  }
}

async function getInstagramBookmarks() {
  if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_USER_ID) return [];
  const url = `https://graph.instagram.com/${INSTAGRAM_USER_ID}/saved?access_token=${INSTAGRAM_ACCESS_TOKEN}&fields=id,caption`;
  try {
    const response = await axios.get(url);
    if (!Array.isArray(response.data.data)) return [];
    return response.data.data.map(post => ({
      source: 'instagram',
      id: post.id,
      title: post.caption ? post.caption.slice(0, 40) : 'post',
      description: post.caption || ''
    }));
  } catch (err) {
    console.error('Failed to fetch Instagram data', err.message);
    return [];
  }
}

async function categorizeItems(items) {
  if (!OPENAI_API_KEY) return {};
  const content = items.map((it, i) => `${i + 1}. ${it.title} - ${it.description}`).join('\n');
  const prompt = `Сгруппируй эти записи по темам. Верни ответ в формате:\n- тема -\n1) название (описание)\n${content}`;
  try {
    const resp = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4
    });
    return resp.data.choices[0].message.content;
  } catch (err) {
    console.error('OpenAI error', err.message);
    return '';
  }
}

async function run() {
  const yt = await getYouTubeBookmarks();
  const ig = await getInstagramBookmarks();
  const allItems = [...yt, ...ig];
  const result = await categorizeItems(allItems);
  fs.writeFileSync('summary.txt', result, 'utf8');
  console.log('Saved summary to summary.txt');
}

if (require.main === module) {
  run();
}
