const KnowledgeAiMetadata = require("@/models/knowledge/knowledge-ai-metadata.model");
const OpenAI = require("openai");
const { marked } = require("marked");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      model: "gpt-4o-mini", // More cost-effective for summarization
      messages: [
        {
          role: "system", 
          content: "Anda adalah asisten yang ahli dalam membuat ringkasan konten dalam bahasa Indonesia dengan gaya profesional namun mudah dipahami."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
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
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Anda adalah ahli dalam ekstraksi kata kunci dari teks bahasa Indonesia. Berikan output dalam format JSON array yang valid."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
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
 * Calculate readability score (Flesch-like for Indonesian)
 * @param {string} content - Content text
 * @returns {Promise<number>} Readability score (1-100, higher = more readable)
 */
const calculateReadabilityScore = async (content) => {
  try {
    // Clean markdown content properly
    const cleanContent = cleanMarkdownContent(content);
    
    if (!cleanContent.trim()) {
      return 0;
    }
    
    // Count sentences (basic)
    const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const sentenceCount = sentences.length || 1;
    
    // Count words
    const words = cleanContent.match(/\S+/g) || [];
    const wordCount = words.length;
    
    if (wordCount === 0) {
      return 0;
    }
    
    // Count syllables (approximation for Indonesian)
    const syllableCount = words.reduce((total, word) => {
      // Simple vowel counting as syllable approximation
      const vowelMatches = word.match(/[aiueo]/gi);
      return total + (vowelMatches ? vowelMatches.length : 1);
    }, 0);
    
    // Calculate average sentence length and syllables per word
    const avgSentenceLength = wordCount / sentenceCount;
    const avgSyllablesPerWord = syllableCount / wordCount;
    
    // Modified Flesch formula for Indonesian (simplified)
    let score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    // Normalize to 1-100 range
    score = Math.max(1, Math.min(100, Math.round(score)));
    
    return score;
  } catch (error) {
    console.error("Error calculating readability score:", error);
    return 50; // Default moderate score
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
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Anda adalah ahli dalam pembuatan tag konten yang SEO-friendly dan user-friendly untuk sistem knowledge management. Berikan output dalam format JSON array yang valid."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
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
    
    // Process with AI
    const [summary, keywords, readabilityScore, aiTags] = await Promise.all([
      generateSummary(content.title, content.content),
      extractKeywords(content.title, content.content), 
      calculateReadabilityScore(content.content),
      generateAITags(content.title, content.content, content.tags || [])
    ]);
    
    // Calculate quality score based on various factors
    const qualityScore = calculateQualityScore({
      readabilityScore,
      contentLength: content.content?.length || 0,
      hasTitle: !!content.title,
      hasSummary: !!content.summary,
      keywordCount: keywords.length
    });
    
    // Save to database
    const aiMetadata = await KnowledgeAiMetadata.query()
      .insert({
        content_id: contentId,
        ai_summary: summary,
        ai_keywords: keywords,
        ai_tags: aiTags,
        ai_readability_score: readabilityScore,
        ai_quality_score: qualityScore,
        processing_status: 'completed',
        model_version: 'basic-v1.0',
        last_processed: new Date()
      })
      .onConflict('content_id')
      .merge([
        'ai_summary', 'ai_keywords', 'ai_tags', 'ai_readability_score', 
        'ai_quality_score', 'processing_status', 'model_version', 'last_processed', 'updated_at'
      ]);
    
    return {
      success: true,
      contentId,
      summary,
      keywords,
      aiTags,
      readabilityScore,
      qualityScore,
      aiMetadataId: aiMetadata.id
    };
    
  } catch (error) {
    console.error("Error processing content with AI:", error);
    
    // Save error to database
    try {
      await KnowledgeAiMetadata.query()
        .insert({
          content_id: contentId,
          processing_status: 'failed',
          error_message: error.message,
          last_processed: new Date()
        })
        .onConflict('content_id')
        .merge(['processing_status', 'error_message', 'last_processed', 'updated_at']);
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
 * Calculate overall quality score
 * @param {Object} factors - Quality factors
 * @returns {number} Quality score (1-100)
 */
const calculateQualityScore = (factors) => {
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
  calculateQualityScore
};