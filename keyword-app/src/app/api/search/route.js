import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { seed_keyword } = await request.json();

    if (!seed_keyword) {
      return NextResponse.json({ error: 'Seed keyword is required' }, { status: 400 });
    }

    const login = process.env.DATAFORSEO_LOGIN;
    // Prefer DATAFORSEO_API_PASSWORD if it exists, otherwise use DATAFORSEO_PASSWORD
    const password = process.env.DATAFORSEO_API_PASSWORD || process.env.DATAFORSEO_PASSWORD;

    if (!login || !password) {
      console.error('Missing credentials - LOGIN:', !!login, 'PASSWORD:', !!password);
      return NextResponse.json({ error: 'Server configuration error: Missing credentials' }, { status: 500 });
    }

    const credentials = Buffer.from(`${login}:${password}`).toString('base64');
    const url = "https://api.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live";

    const postData = [{
      keyword: seed_keyword,
      location_code: 2840,
      language_code: "en",
      include_serp_info: true,
      include_clickstream_data: true,
      depth: 1,
      limit: 1000  // Increased limit to get more relevant keywords
    }];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      let errorMessage = `API Request Failed: ${response.statusText}`;
      try {
        const errorText = await response.text();
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            // Check if DataForSEO returned a specific error message
            if (errorData.tasks && errorData.tasks[0]) {
              const task = errorData.tasks[0];
              if (task.status_message) {
                errorMessage = task.status_message;
              }
            } else if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            // If JSON parsing fails, use the text as-is (limited length)
            errorMessage = errorText.substring(0, 200);
          }
        }
      } catch (e) {
        // If reading fails, use the status text
        errorMessage = `API Request Failed: ${response.statusText}`;
      }
      
      // Provide helpful message for payment/credit issues
      if (response.status === 402 || errorMessage.toLowerCase().includes('payment') || errorMessage.toLowerCase().includes('credit')) {
        errorMessage = 'Payment Required: Your DataForSEO account may be out of credits. Please check your account balance at https://dataforseo.com/';
      }
      
      console.error("API Request Failed:", errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();

    if (!data || !data.tasks || !data.tasks[0]) {
      return NextResponse.json({ error: 'Invalid response from DataForSEO' }, { status: 502 });
    }

    const task = data.tasks[0];
    if (task.status_code !== 20000) {
      return NextResponse.json({ error: `API Task Error: ${task.status_message}` }, { status: 502 });
    }

    const results = task.result;
    if (!results || !results[0] || !results[0].items) {
      return NextResponse.json({ keywords: [] });
    }

    const items = results[0].items;
    const filteredKeywords = [];

    for (const item of items) {
      const keywordData = item.keyword_data || {};
      const keyword = keywordData.keyword || item.keyword;
      
      // Extract search volume - try multiple possible locations
      let volume = keywordData.keyword_info?.search_volume;
      if (volume === undefined || volume === null) {
        volume = item.keyword_info?.search_volume;
      }
      if (volume === undefined || volume === null) {
        volume = keywordData.search_volume;
      }
      
      // Extract keyword difficulty (KD) - try multiple possible locations
      // DataForSEO may return it in keyword_properties or serp_info
      let kd = keywordData.keyword_properties?.keyword_difficulty;
      if (kd === undefined || kd === null) {
        kd = item.keyword_properties?.keyword_difficulty;
      }
      if (kd === undefined || kd === null) {
        kd = keywordData.serp_info?.keyword_difficulty;
      }
      if (kd === undefined || kd === null) {
        kd = item.serp_info?.keyword_difficulty;
      }

      // Only include keywords with valid volume and KD data, and KD < 40
      if (volume !== undefined && volume !== null && 
          kd !== undefined && kd !== null && 
          kd < 40) {
        filteredKeywords.push({
          keyword,
          search_volume: volume,
          keyword_difficulty: kd
        });
      }
    }

    // Sort: Highest Volume first (most important), then Lowest KD (tiebreaker)
    // This ensures we get the highest search volume keywords that are directly relevant
    filteredKeywords.sort((a, b) => {
      // Primary sort: descending by search volume
      if (b.search_volume !== a.search_volume) {
        return b.search_volume - a.search_volume;
      }
      // Secondary sort: ascending by keyword difficulty (lower is easier)
      return a.keyword_difficulty - b.keyword_difficulty;
    });

    return NextResponse.json({ keywords: filteredKeywords });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
