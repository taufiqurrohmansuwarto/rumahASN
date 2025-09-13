const KnowledgeAiMetadata = require("@/models/knowledge/knowledge-ai-metadata.model");
const OpenAI = require("openai");
const { marked } = require("marked");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Model Configuration
const AI_MODEL = "gpt-4o-mini";
const AI_TEMPERATURE_LOW = 0.1;
const AI_TEMPERATURE_MEDIUM = 0.2;
const AI_TEMPERATURE_HIGH = 0.4;

/**
 * Clean markdown content to plain text
 * @param {string} content - Markdown content
 * @returns {string} Clean plain text
 */
const cleanMarkdownContent = (content) => {
  try {
    if (!content || typeof content !== 'string') {
      return '';
    }

    // Configure marked for text extraction only
    const renderer = new marked.Renderer();
    
    // Override renderer methods to return plain text
    renderer.heading = (text) => text + '\n';
    renderer.paragraph = (text) => text + '\n';
    renderer.strong = (text) => text;
    renderer.em = (text) => text;
    renderer.del = (text) => text;
    renderer.link = (href, title, text) => text || href;
    renderer.image = (href, title, text) => text || '';
    renderer.code = (code) => code;
    renderer.codespan = (code) => code;
    renderer.blockquote = (quote) => quote;
    renderer.html = () => ''; // Remove HTML
    renderer.br = () => '\n';
    renderer.hr = () => '\n';
    renderer.list = (body) => body;
    renderer.listitem = (text) => '• ' + text + '\n';
    renderer.table = (header, body) => header + body;
    renderer.tablerow = (content) => content + '\n';
    renderer.tablecell = (content) => content + ' ';

    // Parse markdown to plain text
    const htmlOutput = marked.parse(content, { 
      renderer,
      breaks: true,
      gfm: true,
      silent: true // Don't throw on errors
    });
    
    // Clean up any remaining HTML and normalize whitespace
    const cleanText = htmlOutput
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .replace(/&lt;/g, '<')   // Decode HTML entities
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n/g, '\n') // Remove multiple empty lines
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim();

    return cleanText;
  } catch (error) {
    console.error("Error cleaning markdown content:", error);
    // Fallback: basic cleaning if marked fails
    return content
      .replace(/#{1,6}\s+/g, '')      // Headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1')     // Italic
      .replace(/`(.*?)`/g, '$1')       // Inline code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
      .replace(/!\[.*?\]\(.*?\)/g, '')    // Images
      .replace(/```[\s\S]*?```/g, '')     // Code blocks
      .replace(/-\s+/g, '• ')            // List items
      .replace(/\n+/g, ' ')              // Newlines
      .trim();
  }
};

/**
 * Generate AI summary from content text using OpenAI
 * @param {string} title - Content title
 * @param {string} content - Content body text
 * @returns {Promise<string>} Generated summary
 */
const generateSummary = async (title, content) => {
  try {
    // Clean markdown content properly
    const cleanContent = cleanMarkdownContent(content);
    
    // Fallback to basic method if content is too short
    if (cleanContent.trim().length < 100) {
      const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
      if (sentences.length === 0) {
        return title || "Tidak ada ringkasan tersedia.";
      }
      let summary = sentences.slice(0, 2).join('. ').trim();
      return summary || title || "Tidak ada ringkasan tersedia.";
    }

    // Use OpenAI for longer content
    const prompt = `Buat ringkasan singkat (maksimal 150 kata) dari konten berikut dalam bahasa Indonesia:

Judul: ${title}

Konten:
${cleanContent}

Instruksi:
- Ringkasan harus informatif dan mudah dipahami
- Fokus pada poin-poin utama
- Gunakan bahasa yang profesional namun mudah dimengerti
- Maksimal 2-3 kalimat`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system", 
          content: "Anda adalah asisten yang ahli dalam membuat ringkasan konten dalam bahasa Indonesia dengan gaya profesional namun mudah dipahami."
        },
        { role: "user", content: prompt }
      ],
      temperature: AI_TEMPERATURE_MEDIUM,
      max_tokens: 200,
    });

    const summary = completion.choices[0].message.content.trim();
    return summary || title || "Tidak ada ringkasan tersedia.";
    
  } catch (error) {
    console.error("Error generating AI summary:", error);
    // Fallback to basic method on error
    const cleanContent = cleanMarkdownContent(content);
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length === 0) {
      return title || "Error menggenerate ringkasan.";
    }
    
    let summary = sentences.slice(0, 2).join('. ').trim();
    if (summary.length > 150) {
      summary = summary.substring(0, 147) + "...";
    }
    
    return summary || title || "Error menggenerate ringkasan.";
  }
};

/**
 * Extract keywords from title and content using OpenAI
 * @param {string} title - Content title  
 * @param {string} content - Content body text
 * @returns {Promise<Array<string>>} Extracted keywords
 */
const extractKeywords = async (title, content) => {
  try {
    // Clean markdown content properly
    const cleanContent = cleanMarkdownContent(content);
    
    // Fallback to basic method if content is too short
    if (cleanContent.trim().length < 100) {
      return extractKeywordsBasic(title, cleanContent);
    }

    // Use OpenAI for better keyword extraction
    const prompt = `Ekstrak 8-12 kata kunci/frasa kunci yang paling relevan dari konten berikut dalam bahasa Indonesia:

Judul: ${title}

Konten:
${cleanContent}

Instruksi:
- Pilih kata kunci yang paling relevan dan representatif
- Prioritaskan istilah teknis, konsep penting, atau topik utama
- Hindari kata sambung dan kata umum
- Berikan dalam format array JSON: ["keyword1", "keyword2", ...]
- Maksimal 12 kata kunci`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "Anda adalah ahli dalam ekstraksi kata kunci dari teks bahasa Indonesia. Berikan output dalam format JSON array yang valid."
        },
        { role: "user", content: prompt }
      ],
      temperature: AI_TEMPERATURE_MEDIUM,
      max_tokens: 150,
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Extract JSON from response
    let keywords = [];
    try {
      // Try to parse JSON directly
      const jsonMatch = responseText.match(/\[(.*?)\]/s);
      if (jsonMatch) {
        keywords = JSON.parse(jsonMatch[0]);
      } else {
        keywords = JSON.parse(responseText);
      }
      
      // Validate and clean keywords
      keywords = keywords
        .filter(keyword => typeof keyword === 'string' && keyword.trim().length > 2)
        .map(keyword => keyword.trim().toLowerCase())
        .slice(0, 12);
        
    } catch (parseError) {
      console.warn("Failed to parse OpenAI keywords response, using fallback");
      keywords = extractKeywordsBasic(title, cleanContent);
    }
    
    return keywords.length > 0 ? keywords : extractKeywordsBasic(title, cleanContent);
    
  } catch (error) {
    console.error("Error extracting AI keywords:", error);
    return extractKeywordsBasic(title, content);
  }
};

/**
 * Fallback basic keyword extraction
 * @param {string} title - Content title
 * @param {string} content - Content body text
 * @returns {Array<string>} Extracted keywords
 */
const extractKeywordsBasic = (title, content) => {
  try {
    const text = `${title} ${content}`.toLowerCase();
    const cleanText = text.replace(/<[^>]*>/g, ' ');
    
    const stopWords = [
      'yang', 'dan', 'di', 'dari', 'untuk', 'dengan', 'pada', 'dalam', 'ke', 'oleh',
      'ini', 'itu', 'adalah', 'akan', 'atau', 'juga', 'dapat', 'telah', 'sudah',
      'tidak', 'ada', 'sebagai', 'satu', 'dua', 'tiga', 'bisa', 'harus', 'hanya',
      'seperti', 'karena', 'jika', 'maka', 'sehingga', 'namun', 'tetapi', 'masih',
      'lebih', 'sangat', 'semua', 'setiap', 'antara', 'terhadap', 'tentang'
    ];
    
    const words = cleanText
      .match(/[a-zA-Z\u00C0-\u017F\u0100-\u017F]+/g)
      ?.filter(word => 
        word.length >= 3 && 
        !stopWords.includes(word) &&
        !word.match(/^\d+$/)
      ) || [];
    
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  } catch (error) {
    console.error("Error in basic keyword extraction:", error);
    return [];
  }
};

/**
 * Calculate readability score using AI analysis
 * @param {string} content - Content text
 * @returns {Promise<number>} Readability score (1-100, higher = more readable)
 */
const calculateReadabilityScore = async (content) => {
  try {
    const cleanContent = cleanMarkdownContent(content);

    if (!cleanContent.trim() || cleanContent.length < 50) {
      return 50; // Default score for very short content
    }

    const prompt = `Analisis tingkat keterbacaan (readability) dari konten berikut dalam bahasa Indonesia:

Konten:
${cleanContent}

Instruksi:
- Berikan skor readability antara 1-100 (100 = sangat mudah dibaca)
- Pertimbangkan:
  * Panjang kalimat (lebih pendek = lebih mudah)
  * Kompleksitas kata (kata sederhana = lebih mudah)
  * Struktur bahasa (jelas dan logis = lebih mudah)
  * Penggunaan istilah teknis (sedikit = lebih mudah)
  * Flow dan koherensi
- Berikan hanya angka skor (contoh: 85, 72, 90)`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "Anda adalah ahli linguistik yang menganalisis tingkat keterbacaan teks bahasa Indonesia. Berikan skor numerik 1-100 tanpa penjelasan."
        },
        { role: "user", content: prompt }
      ],
      temperature: AI_TEMPERATURE_LOW,
      max_tokens: 10,
    });

    const scoreText = completion.choices[0].message.content.trim();
    const score = parseInt(scoreText);

    // Validate and clamp score
    if (isNaN(score)) {
      console.warn("AI returned invalid readability score, using fallback calculation");
      return calculateReadabilityScoreFallback(cleanContent);
    }

    return Math.max(1, Math.min(100, score));

  } catch (error) {
    console.error("Error calculating AI readability score:", error);
    return calculateReadabilityScoreFallback(content);
  }
};

/**
 * Fallback readability calculation (Flesch-like for Indonesian)
 * @param {string} cleanContent - Clean content text
 * @returns {number} Readability score
 */
const calculateReadabilityScoreFallback = (cleanContent) => {
  try {
    if (!cleanContent.trim()) return 50;

    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const words = cleanContent.match(/\S+/g) || [];

    if (words.length === 0) return 50;

    const avgSentenceLength = words.length / (sentences.length || 1);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

    // Simple readability formula for Indonesian
    let score = 100 - (avgSentenceLength * 1.5) - (avgWordLength * 5);
    return Math.max(1, Math.min(100, Math.round(score)));
  } catch (error) {
    return 50;
  }
};

/**
 * Calculate sentiment score using OpenAI
 * @param {string} title - Content title
 * @param {string} content - Content body text
 * @returns {Promise<number>} Sentiment score (-1 to 1, where -1 = negative, 0 = neutral, 1 = positive)
 */
const calculateSentimentScore = async (title, content) => {
  try {
    const cleanContent = cleanMarkdownContent(content);
    
    // Fallback to neutral if content too short
    if (cleanContent.trim().length < 50) {
      return 0;
    }

    const prompt = `Analisis sentiment dari konten berikut dalam bahasa Indonesia:

Judul: ${title}

Konten:
${cleanContent}

Instruksi:
- Berikan skor sentiment antara -1 hingga 1
- -1 = sangat negatif, 0 = netral, 1 = sangat positif
- Fokus pada tone dan sentiment keseluruhan konten
- Berikan hanya angka skor (contoh: 0.3, -0.2, 0.8)`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "Anda adalah ahli analisis sentiment yang memberikan skor numerik dari -1 hingga 1. Berikan hanya angka tanpa penjelasan."
        },
        { role: "user", content: prompt }
      ],
      temperature: AI_TEMPERATURE_LOW,
      max_tokens: 10,
    });

    const scoreText = completion.choices[0].message.content.trim();
    const score = parseFloat(scoreText);
    
    // Validate and clamp score
    if (isNaN(score)) {
      return 0;
    }
    
    return Math.max(-1, Math.min(1, score));
    
  } catch (error) {
    console.error("Error calculating sentiment score:", error);
    return 0; // Neutral fallback
  }
};

/**
 * Suggest category for content using OpenAI
 * @param {string} title - Content title
 * @param {string} content - Content body text
 * @returns {Promise<Object>} Category suggestion with confidence
 */
const suggestCategory = async (title, content) => {
  try {
    const cleanContent = cleanMarkdownContent(content);
    
    if (cleanContent.trim().length < 100) {
      return { category: null, confidence: 0 };
    }

    // Get available categories first
    const KnowledgeCategory = require("@/models/knowledge/categories.model");
    const categories = await KnowledgeCategory.query().select('name', 'description');
    
    // If no categories available, return null
    if (!categories || categories.length === 0) {
      console.warn("No categories found for AI suggestion");
      return { category: null, confidence: 0 };
    }
    
    const categoryList = categories
      .map(cat => `- ${cat.name}${cat.description ? ': ' + cat.description : ''}`)
      .join('\n');

    const prompt = `Analisis konten berikut dan sarankan kategori yang paling sesuai:

Judul: ${title}

Konten:
${cleanContent}

Kategori yang tersedia:
${categoryList}

Instruksi:
- Pilih 1 kategori yang paling sesuai dari daftar di atas
- Berikan skor kepercayaan 0-1 (1 = sangat yakin)
- Format JSON: {"category": "nama_kategori", "confidence": 0.8}`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "Anda adalah sistem klasifikasi konten yang memberikan output JSON yang valid."
        },
        { role: "user", content: prompt }
      ],
      temperature: AI_TEMPERATURE_MEDIUM,
      max_tokens: 100,
    });

    const responseText = completion.choices[0].message.content.trim();
    
    try {
      const result = JSON.parse(responseText);
      return {
        category: result.category || null,
        confidence: Math.max(0, Math.min(1, result.confidence || 0))
      };
    } catch (parseError) {
      return { category: null, confidence: 0 };
    }
    
  } catch (error) {
    console.error("Error suggesting category:", error);
    return { category: null, confidence: 0 };
  }
};

/**
 * Generate content improvement suggestions using OpenAI
 * @param {string} title - Content title
 * @param {string} content - Content body text
 * @returns {Promise<Array<string>>} Array of improvement suggestions
 */
const generateContentSuggestions = async (title, content) => {
  try {
    const cleanContent = cleanMarkdownContent(content);
    
    if (cleanContent.trim().length < 200) {
      return ["Konten terlalu pendek untuk analisis suggestions yang meaningful"];
    }

    const prompt = `Analisis konten berikut dan berikan 3-5 saran perbaikan:

Judul: ${title}

Konten:
${cleanContent}

Instruksi:
- Berikan saran praktis untuk meningkatkan kualitas konten
- Fokus pada struktur, kejelasan, kelengkapan, dan readability
- Saran dalam bahasa Indonesia
- Format JSON array: ["saran 1", "saran 2", "saran 3"]`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "Anda adalah editor konten profesional yang memberikan saran perbaikan dalam format JSON array."
        },
        { role: "user", content: prompt }
      ],
      temperature: AI_TEMPERATURE_HIGH,
      max_tokens: 300,
    });

    const responseText = completion.choices[0].message.content.trim();
    
    try {
      const jsonMatch = responseText.match(/\[(.*?)\]/s);
      let suggestions = [];
      
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        suggestions = JSON.parse(responseText);
      }
      
      return suggestions.filter(s => typeof s === 'string' && s.trim().length > 10);
      
    } catch (parseError) {
      return ["Tidak dapat menganalisis konten untuk suggestions"];
    }
    
  } catch (error) {
    console.error("Error generating content suggestions:", error);
    return [];
  }
};

/**
 * Generate SEO keywords and meta description using OpenAI
 * @param {string} title - Content title
 * @param {string} content - Content body text
 * @returns {Promise<Object>} SEO data with keywords and meta description
 */
const generateSEOData = async (title, content) => {
  try {
    const cleanContent = cleanMarkdownContent(content);
    
    if (cleanContent.trim().length < 100) {
      return {
        seoKeywords: [title].filter(Boolean),
        metaDescription: title || "Tidak ada deskripsi tersedia"
      };
    }

    const prompt = `Generate SEO data untuk konten berikut:

Judul: ${title}

Konten:
${cleanContent}

Instruksi:
- Buat 5-8 SEO keywords yang relevan
- Buat meta description 150-160 karakter yang menarik
- Optimized untuk search engine Indonesia
- Format JSON: {
  "seoKeywords": ["keyword1", "keyword2", ...],
  "metaDescription": "deskripsi menarik..."
}`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "Anda adalah SEO specialist yang membuat keywords dan meta description dalam format JSON."
        },
        { role: "user", content: prompt }
      ],
      temperature: AI_TEMPERATURE_MEDIUM,
      max_tokens: 200,
    });

    const responseText = completion.choices[0].message.content.trim();
    
    try {
      const seoData = JSON.parse(responseText);
      return {
        seoKeywords: Array.isArray(seoData.seoKeywords) ? seoData.seoKeywords : [],
        metaDescription: seoData.metaDescription || title || "Tidak ada deskripsi tersedia"
      };
    } catch (parseError) {
      return {
        seoKeywords: [title].filter(Boolean),
        metaDescription: title || "Tidak ada deskripsi tersedia"
      };
    }
    
  } catch (error) {
    console.error("Error generating SEO data:", error);
    return {
      seoKeywords: [title].filter(Boolean),
      metaDescription: title || "Tidak ada deskripsi tersedia"
    };
  }
};

/**
 * Generate AI tags from content using OpenAI
 * @param {string} title - Content title
 * @param {string} content - Content body text
 * @param {Array<string>} existingTags - Existing manual tags
 * @returns {Promise<Array<string>>} Generated tags
 */
const generateAITags = async (title, content, existingTags = []) => {
  try {
    // Clean markdown content properly
    const cleanContent = cleanMarkdownContent(content);
    
    // Fallback to keyword-based method if content is too short
    if (cleanContent.trim().length < 100) {
      const keywords = await extractKeywords(title, cleanContent);
      const existingTagsLower = existingTags.map(tag => tag.toLowerCase());
      const newTags = keywords.filter(keyword => 
        !existingTagsLower.includes(keyword.toLowerCase())
      );
      return newTags.slice(0, 5);
    }

    // Use OpenAI for better tag generation
    const existingTagsText = existingTags.length > 0 
      ? `Tag yang sudah ada: ${existingTags.join(', ')}\n` 
      : '';

    const prompt = `Generate 5-8 tag yang relevan untuk konten berikut dalam bahasa Indonesia:

Judul: ${title}

Konten:
${cleanContent}

${existingTagsText}
Instruksi:
- Buat tag yang spesifik dan berguna untuk pencarian
- Prioritaskan topik utama, konsep penting, atau kategori
- Hindari tag yang terlalu umum atau sudah ada
- Gunakan format camelCase atau kata tunggal jika memungkinkan
- Berikan dalam format array JSON: ["tag1", "tag2", ...]
- Maksimal 8 tag baru`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "Anda adalah ahli dalam pembuatan tag konten yang SEO-friendly dan user-friendly untuk sistem knowledge management. Berikan output dalam format JSON array yang valid."
        },
        { role: "user", content: prompt }
      ],
      temperature: AI_TEMPERATURE_HIGH,
      max_tokens: 150,
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Extract JSON from response
    let aiTags = [];
    try {
      const jsonMatch = responseText.match(/\[(.*?)\]/s);
      if (jsonMatch) {
        aiTags = JSON.parse(jsonMatch[0]);
      } else {
        aiTags = JSON.parse(responseText);
      }
      
      // Validate and clean tags
      aiTags = aiTags
        .filter(tag => typeof tag === 'string' && tag.trim().length > 2)
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => {
          // Remove duplicates with existing tags
          const existingTagsLower = existingTags.map(existingTag => existingTag.toLowerCase());
          return !existingTagsLower.includes(tag);
        })
        .slice(0, 8);
        
    } catch (parseError) {
      console.warn("Failed to parse OpenAI tags response, using fallback");
      const keywords = await extractKeywords(title, cleanContent);
      const existingTagsLower = existingTags.map(tag => tag.toLowerCase());
      aiTags = keywords.filter(keyword => 
        !existingTagsLower.includes(keyword.toLowerCase())
      ).slice(0, 5);
    }
    
    return aiTags;
    
  } catch (error) {
    console.error("Error generating AI tags:", error);
    // Fallback to keyword-based method
    const keywords = await extractKeywords(title, content);
    const existingTagsLower = existingTags.map(tag => tag.toLowerCase());
    const newTags = keywords.filter(keyword => 
      !existingTagsLower.includes(keyword.toLowerCase())
    );
    return newTags.slice(0, 5);
  }
};

/**
 * Main function to process content with AI
 * @param {string} contentId - Content ID
 * @returns {Promise<Object>} Processing result
 */
const processContentWithAI = async (contentId) => {
  try {
    // Get content with relations
    const KnowledgeContent = require("@/models/knowledge/contents.model");
    const content = await KnowledgeContent.query()
      .findById(contentId)
      .withGraphFetched('[category]');
    
    if (!content) {
      throw new Error(`Content with ID ${contentId} not found`);
    }
    
    // Process with AI - Run all AI functions in parallel
    const [
      summary, 
      keywords, 
      readabilityScore, 
      aiTags,
      sentimentScore,
      categoryData,
      suggestions,
      seoData
    ] = await Promise.all([
      generateSummary(content.title, content.content),
      extractKeywords(content.title, content.content), 
      calculateReadabilityScore(content.content),
      generateAITags(content.title, content.content, content.tags || []),
      calculateSentimentScore(content.title, content.content),
      suggestCategory(content.title, content.content),
      generateContentSuggestions(content.title, content.content),
      generateSEOData(content.title, content.content)
    ]);
    
    // Calculate completeness score (needs to be done after summary)
    const completenessScore = await calculateCompletenessScore(
      content.title, 
      content.content, 
      content.summary || summary
    );
    
    // Calculate quality score using AI analysis
    const qualityScore = await calculateQualityScore(content.title, content.content, {
      readabilityScore,
      summary: content.summary || summary,
      keywordCount: keywords.length
    });
    
    // Check if AI metadata already exists
    const existingAiMetadata = await KnowledgeAiMetadata.query()
      .where('content_id', contentId)
      .first();

    let aiMetadata;
    if (existingAiMetadata) {
      // Update existing record
      aiMetadata = await KnowledgeAiMetadata.query()
        .where('content_id', contentId)
        .patch({
          ai_summary: summary,
          ai_keywords: JSON.stringify(keywords || []),
          ai_tags: JSON.stringify(aiTags || []),
          ai_readability_score: readabilityScore,
          ai_quality_score: qualityScore,
          ai_completeness_score: completenessScore,
          ai_sentiment_score: sentimentScore,
          ai_suggested_category: categoryData.category,
          ai_confidence_score: categoryData.confidence,
          ai_related_content: JSON.stringify([]), // TODO: Implement related content logic
          ai_suggestions: JSON.stringify(suggestions || []),
          ai_seo_keywords: JSON.stringify(seoData.seoKeywords || []),
          ai_meta_description: seoData.metaDescription,
          processing_status: 'completed',
          model_version: AI_MODEL,
          last_processed: new Date(),
          updated_at: new Date()
        })
        .returning('*')
        .first();
    } else {
      // Insert new record
      aiMetadata = await KnowledgeAiMetadata.query()
        .insert({
          content_id: contentId,
          ai_summary: summary,
          ai_keywords: JSON.stringify(keywords || []),
          ai_tags: JSON.stringify(aiTags || []),
          ai_readability_score: readabilityScore,
          ai_quality_score: qualityScore,
          ai_completeness_score: completenessScore,
          ai_sentiment_score: sentimentScore,
          ai_suggested_category: categoryData.category,
          ai_confidence_score: categoryData.confidence,
          ai_related_content: JSON.stringify([]), // TODO: Implement related content logic
          ai_suggestions: JSON.stringify(suggestions || []),
          ai_seo_keywords: JSON.stringify(seoData.seoKeywords || []),
          ai_meta_description: seoData.metaDescription,
          processing_status: 'completed',
          model_version: AI_MODEL,
          last_processed: new Date()
        });
    }
    
    return {
      success: true,
      contentId,
      summary,
      keywords,
      aiTags,
      readabilityScore,
      qualityScore,
      completenessScore,
      sentimentScore,
      suggestedCategory: categoryData.category,
      confidenceScore: categoryData.confidence,
      suggestions,
      seoKeywords: seoData.seoKeywords,
      metaDescription: seoData.metaDescription,
      aiMetadataId: aiMetadata.id || aiMetadata
    };
    
  } catch (error) {
    console.error("Error processing content with AI:", error);
    
    // Save error to database
    try {
      const existingErrorRecord = await KnowledgeAiMetadata.query()
        .where('content_id', contentId)
        .first();

      if (existingErrorRecord) {
        // Update existing record with error
        await KnowledgeAiMetadata.query()
          .where('content_id', contentId)
          .patch({
            processing_status: 'failed',
            error_message: error.message,
            last_processed: new Date(),
            updated_at: new Date()
          });
      } else {
        // Insert new error record
        await KnowledgeAiMetadata.query()
          .insert({
            content_id: contentId,
            processing_status: 'failed',
            error_message: error.message,
            last_processed: new Date()
          });
      }
    } catch (dbError) {
      console.error("Error saving AI processing error:", dbError);
    }
    
    return {
      success: false,
      contentId,
      error: error.message
    };
  }
};

/**
 * Calculate content completeness score using AI analysis
 * @param {string} title - Content title
 * @param {string} content - Content body text
 * @param {string} summary - Content summary
 * @returns {Promise<number>} Completeness score (1-100)
 */
const calculateCompletenessScore = async (title, content, summary) => {
  try {
    const cleanContent = cleanMarkdownContent(content);

    if (!cleanContent.trim() || cleanContent.length < 100) {
      return calculateCompletenessScoreFallback(title, content, summary);
    }

    const prompt = `Analisis kelengkapan (completeness) dari konten berikut dalam bahasa Indonesia:

Judul: ${title}

Konten:
${cleanContent}

Summary: ${summary || 'Tidak ada summary'}

Instruksi:
- Berikan skor kelengkapan antara 1-100 (100 = sangat lengkap dan comprehensive)
- Pertimbangkan:
  * Apakah topik dibahas secara menyeluruh?
  * Ada introduction, body, dan conclusion yang jelas?
  * Informasi yang diberikan cukup untuk memahami topik?
  * Adanya contoh, detail, atau penjelasan yang mendukung?
  * Coverage dari berbagai aspek relevan topik?
  * Struktur dan organisasi informasi yang baik?
  * Adanya referensi, data, atau supporting materials?
- Berikan hanya angka skor (contoh: 85, 72, 90)`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "Anda adalah ahli evaluasi konten yang dapat menilai kelengkapan dan comprehensiveness artikel dalam bahasa Indonesia. Berikan skor numerik 1-100 tanpa penjelasan."
        },
        { role: "user", content: prompt }
      ],
      temperature: AI_TEMPERATURE_LOW,
      max_tokens: 10,
    });

    const scoreText = completion.choices[0].message.content.trim();
    const score = parseInt(scoreText);

    // Validate and clamp score
    if (isNaN(score)) {
      console.warn("AI returned invalid completeness score, using fallback calculation");
      return calculateCompletenessScoreFallback(title, content, summary);
    }

    return Math.max(1, Math.min(100, score));

  } catch (error) {
    console.error("Error calculating AI completeness score:", error);
    return calculateCompletenessScoreFallback(title, content, summary);
  }
};

/**
 * Fallback completeness score calculation
 * @param {string} title - Content title
 * @param {string} content - Content body text
 * @param {string} summary - Content summary
 * @returns {number} Completeness score (1-100)
 */
const calculateCompletenessScoreFallback = (title, content, summary) => {
  try {
    const cleanContent = cleanMarkdownContent(content);
    let score = 0;

    // Title completeness (15 points)
    if (title && title.trim().length > 0) {
      score += 15;
      if (title.length >= 10 && title.length <= 100) {
        score += 5; // Good length title
      }
    }

    // Content length and structure (40 points)
    if (cleanContent && cleanContent.length > 0) {
      score += 10; // Has content

      if (cleanContent.length >= 200) score += 10; // Substantial content
      if (cleanContent.length >= 500) score += 10; // Good length
      if (cleanContent.length >= 1000) score += 10; // Comprehensive

      // Check for structure indicators
      const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
      if (sentences.length >= 3) score += 5; // Multiple sentences
      if (sentences.length >= 10) score += 5; // Well-developed
    }

    // Summary completeness (20 points)
    if (summary && summary.trim().length > 0) {
      score += 15;
      if (summary.length >= 50 && summary.length <= 300) {
        score += 5; // Good summary length
      }
    }

    // Content depth indicators (25 points)
    const hasNumbers = /\d/.test(cleanContent);
    const hasLists = cleanContent.includes('•') || /^\d+\./m.test(cleanContent);
    const hasHeaders = content.includes('#') || content.includes('<h');
    const hasLinks = content.includes('[') && content.includes(']');
    const hasFormatting = content.includes('**') || content.includes('*') || content.includes('<');

    if (hasNumbers) score += 5;    // Contains data/numbers
    if (hasLists) score += 5;      // Has structured lists
    if (hasHeaders) score += 5;    // Well organized
    if (hasLinks) score += 5;      // Contains references
    if (hasFormatting) score += 5; // Proper formatting

    return Math.max(1, Math.min(100, Math.round(score)));

  } catch (error) {
    console.error("Error calculating completeness score:", error);
    return 50; // Default moderate score
  }
};

/**
 * Calculate overall quality score using AI analysis
 * @param {string} title - Content title
 * @param {string} content - Content body text
 * @param {Object} metadata - Additional metadata (readability, keywords, etc)
 * @returns {Promise<number>} Quality score (1-100)
 */
const calculateQualityScore = async (title, content, metadata = {}) => {
  try {
    const cleanContent = cleanMarkdownContent(content);

    if (!cleanContent.trim() || cleanContent.length < 100) {
      return calculateQualityScoreFallback({
        readabilityScore: metadata.readabilityScore || 50,
        contentLength: cleanContent.length,
        hasTitle: !!title,
        hasSummary: !!metadata.summary,
        keywordCount: metadata.keywordCount || 0
      });
    }

    const prompt = `Analisis kualitas keseluruhan dari konten berikut dalam bahasa Indonesia:

Judul: ${title}

Konten:
${cleanContent}

Metadata tambahan:
- Readability Score: ${metadata.readabilityScore || 'Unknown'}
- Jumlah Keywords: ${metadata.keywordCount || 0}
- Ada Summary: ${metadata.summary ? 'Ya' : 'Tidak'}

Instruksi:
- Berikan skor kualitas konten antara 1-100 (100 = kualitas excellent)
- Pertimbangkan:
  * Kejelasan dan struktur informasi
  * Kelengkapan pembahasan topik
  * Akurasi dan credibility
  * Nilai informatif dan usefulness
  * Organisasi dan flow content
  * Grammar dan language quality
  * Depth of analysis atau insight
- Berikan hanya angka skor (contoh: 88, 75, 92)`;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "Anda adalah ahli evaluasi konten yang dapat menilai kualitas artikel atau dokumentasi dalam bahasa Indonesia secara objektif. Berikan skor numerik 1-100 tanpa penjelasan."
        },
        { role: "user", content: prompt }
      ],
      temperature: AI_TEMPERATURE_LOW,
      max_tokens: 10,
    });

    const scoreText = completion.choices[0].message.content.trim();
    const score = parseInt(scoreText);

    // Validate and clamp score
    if (isNaN(score)) {
      console.warn("AI returned invalid quality score, using fallback calculation");
      return calculateQualityScoreFallback({
        readabilityScore: metadata.readabilityScore || 50,
        contentLength: cleanContent.length,
        hasTitle: !!title,
        hasSummary: !!metadata.summary,
        keywordCount: metadata.keywordCount || 0
      });
    }

    return Math.max(1, Math.min(100, score));

  } catch (error) {
    console.error("Error calculating AI quality score:", error);
    return calculateQualityScoreFallback({
      readabilityScore: metadata.readabilityScore || 50,
      contentLength: (content || '').length,
      hasTitle: !!title,
      hasSummary: !!metadata.summary,
      keywordCount: metadata.keywordCount || 0
    });
  }
};

/**
 * Fallback quality score calculation
 * @param {Object} factors - Quality factors
 * @returns {number} Quality score (1-100)
 */
const calculateQualityScoreFallback = (factors) => {
  let score = 0;

  // Readability score (40% weight)
  score += (factors.readabilityScore || 0) * 0.4;

  // Content length score (25% weight)
  const lengthScore = Math.min(100, Math.max(0, (factors.contentLength / 500) * 100));
  score += lengthScore * 0.25;

  // Structure completeness (35% weight)
  let structureScore = 0;
  if (factors.hasTitle) structureScore += 30;
  if (factors.hasSummary) structureScore += 25;
  if (factors.keywordCount > 0) structureScore += 20;
  if (factors.keywordCount >= 5) structureScore += 25;

  score += structureScore * 0.35;

  return Math.max(1, Math.min(100, Math.round(score)));
};

module.exports = {
  generateSummary,
  extractKeywords,
  calculateReadabilityScore,
  generateAITags,
  processContentWithAI,
  calculateQualityScore,
  calculateCompletenessScore,
  calculateSentimentScore,
  suggestCategory,
  generateContentSuggestions,
  generateSEOData
};