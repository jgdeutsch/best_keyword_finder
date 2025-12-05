# Best Keyword Finder

A web application that finds high-search-volume keywords directly relevant to your input keyword, with Keyword Difficulty (KD) < 40 (equivalent to Ahrefs KD), using the DataForSEO API.

## Features

- 🔍 Find directly relevant keywords to your seed keyword
- 📊 Filter by Keyword Difficulty < 40 (Ahrefs equivalent)
- 📈 Sort by highest search volume
- 🎨 Modern, beautiful UI built with Next.js and Tailwind CSS

## Setup

### 1. Install Dependencies

#### For the Python CLI tool:
```bash
# Create virtual environment (if not already created)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install requests python-dotenv
```

#### For the Next.js web app:
```bash
cd keyword-app
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with your DataForSEO API credentials:

```env
DATAFORSEO_LOGIN=your_email@example.com
DATAFORSEO_PASSWORD=your_api_password_here
```

For the Next.js app, also create a `.env.local` file in the `keyword-app` directory:

```env
DATAFORSEO_LOGIN=your_email@example.com
DATAFORSEO_PASSWORD=your_api_password_here
```

**Important Notes:**
- **API Login**: Use your DataForSEO account email address
- **API Password**: Use your **API password** (not your regular account password). You can find/generate this in your DataForSEO dashboard under API settings
- Get your API credentials from [DataForSEO Dashboard](https://dataforseo.com/)

### 3. Run the Application

#### Python CLI:
```bash
python keyword_finder.py
```

#### Next.js Web App:
```bash
cd keyword-app
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Input**: Enter a seed keyword (e.g., "running shoes")
2. **API Call**: The app queries DataForSEO's Related Keywords API endpoint
3. **Filtering**: Keywords are filtered to only include those with KD < 40
4. **Sorting**: Results are sorted by highest search volume (then by lowest KD as tiebreaker)
5. **Output**: Display the top relevant keywords with their search volume and difficulty scores

## API Endpoint Used

- **DataForSEO Related Keywords API**: `v3/dataforseo_labs/google/related_keywords/live`
- Returns semantically related keywords with search volume and keyword difficulty metrics
- Filters for KD < 40 (equivalent to Ahrefs KD scale)
- Sorts by highest search volume for maximum opportunity

## Authentication

The app includes a login system. Default credentials:
- **Username**: `admin` (or set `APP_USERNAME` env variable)
- **Password**: `admin123` (or set `APP_PASSWORD` env variable)

**Important**: Change these defaults in production by setting environment variables!

## Deployment

### Current Status
- ✅ **GitHub**: Published to [jgdeutsch/best_keyword_finder](https://github.com/jgdeutsch/best_keyword_finder)
- ✅ **Vercel**: Deployed (deployment protection needs to be disabled for public access)

### Documentation
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions
- See [SESSION_SUMMARY.md](./SESSION_SUMMARY.md) for complete project overview and highlights

## Notes

- The app uses DataForSEO's Keyword Difficulty metric, which is equivalent to Ahrefs KD
- Keywords are filtered to KD < 40 to ensure manageable competition
- Results are sorted by search volume (descending) to prioritize high-opportunity keywords
- The related keywords endpoint ensures keywords are directly relevant to your seed keyword
- All routes are protected by authentication (except `/login`)


