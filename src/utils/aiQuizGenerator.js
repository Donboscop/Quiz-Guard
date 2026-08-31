// Unified AI & Document Quiz Generation Pipeline for QuizGuard
// Supports: Topic prompt, PPTX slides, PDF documents, and Text Study Notes

import { saveCustomQuiz } from '../data/quizzes';
import { normalizeQuiz } from './quizNormalizer';

// Built-in smart domain templates for offline instant generation
const DOMAIN_TEMPLATES = {
  cricket: {
    title: "Cricket History & World Cup Mastery",
    description: "Test your knowledge on historic World Cups, legendary players, iconic records, and cricket rules.",
    categoryId: "gk",
    questions: [
      {
        question: "Which nation won the inaugural ICC Men's Cricket World Cup in 1975?",
        options: ["West Indies", "Australia", "England", "India"],
        answer: 0,
        explanation: "West Indies won the inaugural 1975 World Cup by defeating Australia in the final at Lord's."
      },
      {
        question: "Who holds the record for the highest individual score in a Test match (400 not out)?",
        options: ["Don Bradman", "Brian Lara", "Sachin Tendulkar", "Virender Sehwag"],
        answer: 1,
        explanation: "Brian Lara scored 400* against England at St John's in 2004."
      },
      {
        question: "Which cricketer is known as the 'Sir' who achieved a career Test batting average of 99.94?",
        options: ["Sir Garfield Sobers", "Sir Viv Richards", "Sir Don Bradman", "Sir Ian Botham"],
        answer: 2,
        explanation: "Sir Donald Bradman of Australia finished his Test career with an unprecedented average of 99.94."
      },
      {
        question: "How many fielders are allowed outside the 30-yard circle during the first mandatory Powerplay in ODI cricket?",
        options: ["Maximum 3", "Maximum 4", "Maximum 5", "Maximum 2"],
        answer: 3,
        explanation: "During Powerplay 1 (overs 1-10 in ODIs), a maximum of 2 fielders are allowed outside the 30-yard circle."
      },
      {
        question: "Who was the captain of the Indian cricket team that won the 1983 World Cup?",
        options: ["Kapil Dev", "Sunil Gavaskar", "Mohinder Amarnath", "Ravi Shastri"],
        answer: 0,
        explanation: "Kapil Dev captained India to their historic 1983 World Cup victory over West Indies."
      },
      {
        question: "What is the standard length of a cricket pitch between the two sets of wickets?",
        options: ["20 yards", "22 yards", "24 yards", "18 yards"],
        answer: 1,
        explanation: "The official distance between wickets on a cricket pitch is 22 yards (20.12 meters)."
      },
      {
        question: "Which bowler took all 10 wickets in a single Test innings for India against Pakistan in 1999?",
        options: ["Kapil Dev", "Harbhajan Singh", "Anil Kumble", "Zaheer Khan"],
        answer: 2,
        explanation: "Anil Kumble achieved the historic 10-wicket haul at Feroz Shah Kotla, Delhi in 1999."
      },
      {
        question: "Which country hosted the first ever T20 International World Cup in 2007?",
        options: ["Australia", "England", "West Indies", "South Africa"],
        answer: 3,
        explanation: "South Africa hosted the inaugural ICC World Twenty20 in September 2007, won by India."
      },
      {
        question: "Who is the first batsman to score a double century (200*) in Men's One Day Internationals (ODIs)?",
        options: ["Sachin Tendulkar", "Virender Sehwag", "Rohit Sharma", "Chris Gayle"],
        answer: 0,
        explanation: "Sachin Tendulkar scored the first men's ODI double century (200*) against South Africa in Gwalior in 2010."
      },
      {
        question: "What is the maximum number of overs a single bowler can bowl in a standard 50-over ODI match?",
        options: ["8 overs", "10 overs", "12 overs", "15 overs"],
        answer: 1,
        explanation: "In a full 50-over ODI, each bowler is restricted to a maximum of 10 overs (one-fifth of the innings)."
      }
    ]
  },
  aws: {
    title: "AWS Cloud Architecture & Services",
    description: "Core concepts of AWS EC2, S3, IAM, VPC, RDS, Lambda, and CloudWatch architecture.",
    categoryId: "cloud",
    questions: [
      {
        question: "Which AWS service provides resizable compute capacity in the cloud as virtual servers?",
        options: ["Amazon EC2", "Amazon S3", "Amazon RDS", "AWS Lambda"],
        answer: 0,
        explanation: "Amazon Elastic Compute Cloud (EC2) provides resizable compute capacity via virtual server instances."
      },
      {
        question: "What AWS IAM component allows granting temporary security credentials for workloads or services?",
        options: ["IAM User", "IAM Role", "IAM Group", "IAM Access Key"],
        answer: 1,
        explanation: "IAM Roles are designed to be assumed by trusted entities, issuing temporary credentials."
      },
      {
        question: "Which S3 storage class is engineered for long-term data archiving with retrieval times from minutes to hours?",
        options: ["S3 Standard", "S3 One Zone-IA", "S3 Glacier Flexible Retrieval", "S3 Express One Zone"],
        answer: 2,
        explanation: "S3 Glacier is a secure, durable, and low-cost storage class for data archiving."
      },
      {
        question: "In AWS VPC, which networking component enables communication between instances in VPC and the Internet?",
        options: ["NAT Instance", "Virtual Private Gateway", "VPC Peering Connection", "Internet Gateway (IGW)"],
        answer: 3,
        explanation: "An Internet Gateway is a horizontally scaled, redundant VPC component that enables Internet communication."
      },
      {
        question: "Which serverless compute service lets you run code in response to events without provisioning servers?",
        options: ["AWS Lambda", "Amazon ECS", "AWS Elastic Beanstalk", "Amazon Lightsail"],
        answer: 0,
        explanation: "AWS Lambda executes your code only when needed and scales automatically from a few requests per day to thousands per second."
      },
      {
        question: "Which AWS service provides a managed relational database supporting PostgreSQL, MySQL, and Aurora?",
        options: ["Amazon DynamoDB", "Amazon RDS", "Amazon Redshift", "Amazon DocumentDB"],
        answer: 1,
        explanation: "Amazon Relational Database Service (Amazon RDS) makes it easy to set up, operate, and scale relational databases in the cloud."
      },
      {
        question: "What AWS service delivers content, videos, and APIs to users globally with low latency via edge locations?",
        options: ["Amazon Route 53", "AWS Direct Connect", "Amazon CloudFront", "AWS Global Accelerator"],
        answer: 2,
        explanation: "Amazon CloudFront is a fast, highly secure Content Delivery Network (CDN) service."
      },
      {
        question: "Which AWS monitoring service provides metrics, logs, and alarms for resource utilization and application health?",
        options: ["AWS CloudTrail", "AWS Config", "AWS Trusted Advisor", "Amazon CloudWatch"],
        answer: 3,
        explanation: "Amazon CloudWatch monitors AWS resources and applications in real-time, collecting metrics and enabling alarm triggers."
      },
      {
        question: "What fully managed NoSQL key-value and document database provides single-digit millisecond latency at any scale?",
        options: ["Amazon DynamoDB", "Amazon Aurora", "Amazon Neptune", "Amazon ElastiCache"],
        answer: 0,
        explanation: "Amazon DynamoDB is a fully managed serverless NoSQL database designed for fast performance."
      },
      {
        question: "Which AWS DNS web service provides domain registration and highly reliable domain name resolution?",
        options: ["Amazon CloudFront", "Amazon Route 53", "AWS Direct Connect", "Elastic Load Balancing"],
        answer: 1,
        explanation: "Amazon Route 53 is a highly available and scalable cloud Domain Name System (DNS) web service."
      }
    ]
  },
  python: {
    title: "Python Core Programming & Data Structures",
    description: "Fundamental Python concepts, data structures, OOP, comprehensions, and memory management.",
    categoryId: "cs",
    questions: [
      {
        question: "Which of the following data types in Python is immutable?",
        options: ["List", "Dictionary", "Tuple", "Set"],
        answer: 2,
        explanation: "Tuples in Python cannot be modified after creation, making them immutable."
      },
      {
        question: "What will `print(type([]))` output in Python 3?",
        options: ["<class 'list'>", "<class 'array'>", "<type 'list'>", "<class 'dict'>"],
        answer: 0,
        explanation: "Square brackets `[]` create a list object, which has the type `<class 'list'>`."
      },
      {
        question: "What keyword is used to create an anonymous inline function in Python?",
        options: ["def", "lambda", "inline", "anon"],
        answer: 1,
        explanation: "The `lambda` keyword in Python is used to define small anonymous functions."
      },
      {
        question: "What does the `GIL` stand for in the standard CPython implementation?",
        options: ["Global Interface Language", "General Integrated Logic", "Global Instruction Loop", "Global Interpreter Lock"],
        answer: 3,
        explanation: "The Global Interpreter Lock (GIL) ensures that only one native thread executes Python bytecode at a time in CPython."
      },
      {
        question: "Which built-in Python function returns the length of an iterable object?",
        options: ["len()", "size()", "count()", "length()"],
        answer: 0,
        explanation: "`len()` is the standard built-in function to obtain the number of items in a container."
      }
    ]
  },
  javascript: {
    title: "Modern JavaScript & ES6+ Architecture",
    description: "Deep dive into event loop, closures, promises, async/await, and scope in JavaScript.",
    categoryId: "js",
    questions: [
      {
        question: "Which keyword declares a block-scoped variable that cannot be reassigned?",
        options: ["var", "const", "let", "static"],
        answer: 1,
        explanation: "`const` declares a block-scoped identifier that cannot be reassigned after declaration."
      },
      {
        question: "What does `typeof NaN` evaluate to in JavaScript?",
        options: ["'undefined'", "'number'", "'object'", "'NaN'"],
        answer: 1,
        explanation: "In JavaScript, `NaN` (Not a Number) is technically a numeric data type, so `typeof NaN === 'number'`."
      },
      {
        question: "What will `console.log(0.1 + 0.2 === 0.3)` output in JavaScript?",
        options: ["true", "false", "undefined", "TypeError"],
        answer: 1,
        explanation: "Due to IEEE 754 floating point arithmetic precision, `0.1 + 0.2` equals `0.30000000000000004`, evaluating to `false`."
      },
      {
        question: "Which array method creates a new array with all elements that pass the provided test function?",
        options: ["map()", "filter()", "forEach()", "reduce()"],
        answer: 1,
        explanation: "`Array.prototype.filter()` returns a new array containing elements that satisfy the predicate callback."
      },
      {
        question: "Which JavaScript mechanism hoists variable and function declarations to the top of their containing scope?",
        options: ["Closure", "Event Loop", "Hoisting", "Currying"],
        answer: 2,
        explanation: "Hoisting is JavaScript's default behavior of moving declarations to the top before execution."
      }
    ]
  }
};

/**
 * Generate procedural filler questions if a template or document doesn't have enough questions
 */
function createProceduralQuestions(topic, count, startIndex = 0) {
  const cleanTopic = topic || 'Subject';
  return Array.from({ length: count }, (_, idx) => {
    const qNum = startIndex + idx + 1;
    const correctIdx = (qNum - 1) % 4; // Distribute across 0, 1, 2, 3
    const options = [
      `Primary foundational principle #${qNum} of ${cleanTopic}`,
      `Secondary alternative mechanism for ${cleanTopic}`,
      `Deprecative non-standard implementation pattern`,
      `Commonly mistaken anti-pattern in ${cleanTopic}`
    ];
    // Rotate so correct answer is at correctIdx
    const correctText = options[0];
    options.splice(0, 1);
    options.splice(correctIdx, 0, correctText);

    return {
      question: `Core concept question #${qNum}: Which statement represents an established principle of ${cleanTopic}?`,
      options,
      answer: correctIdx,
      explanation: `This reflects the standard curriculum guidelines and core mechanisms of ${cleanTopic}.`
    };
  });
}

/**
 * Call Groq Cloud API or LLM Endpoint to generate questions from prompt/text
 */
async function callAiCompletion(systemPrompt, userPrompt) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
  if (!apiKey || apiKey.includes('placeholder')) {
    return null;
  }

  const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  // Supported models on current Groq Cloud endpoint
  const candidateModels = [
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b'
  ];

  for (const model of candidateModels) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(`[QuizGuard AI] Groq model ${model} returned status ${response.status}:`, errText);
        continue; // Try next candidate model
      }

      const data = await response.json();
      const contentStr = data.choices?.[0]?.message?.content;
      if (!contentStr) continue;

      let cleanedStr = contentStr.trim();
      if (cleanedStr.startsWith('```json')) {
        cleanedStr = cleanedStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedStr.startsWith('```')) {
        cleanedStr = cleanedStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleanedStr);
      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn(`[QuizGuard AI] Groq model ${model} error:`, err);
    }
  }

  return null;
}

/**
 * Generate AI Quiz from a Topic
 */
export async function generateAiQuiz(topic, difficulty = 'Medium', questionCount = 5, language = 'English') {
  const cleanTopic = (topic || '').trim();
  if (!cleanTopic) throw new Error('Please provide a quiz topic or subject.');
  const targetCount = Number(questionCount) > 0 ? Number(questionCount) : 5;

  const systemPrompt = `You are QuizGuard's expert educational assessment AI.
Generate a high quality, rigorously verified multiple-choice quiz in JSON format based on the user's prompt.
Target language: ${language}. Difficulty: ${difficulty}. Total questions: EXACTLY ${targetCount}.

CRITICAL REQUIREMENTS:
1. You MUST generate EXACTLY ${targetCount} questions.
2. Evenly distribute the correct answer index across 0, 1, 2, and 3 (Options A, B, C, D). Do NOT put all correct answers in index 0.

Return ONLY valid JSON matching this schema:
{
  "title": "Clear Quiz Title",
  "description": "Short 1-2 sentence description",
  "categoryId": "cs" | "js" | "react" | "web" | "cloud" | "aptitude" | "gk",
  "difficulty": "${difficulty}",
  "duration": ${Math.max(5, targetCount * 2)},
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": 2, // Integer 0 to 3 index of the correct option
      "explanation": "Clear factual explanation why this option is correct."
    }
  ]
}`;

  try {
    const aiResult = await callAiCompletion(systemPrompt, `Generate a ${targetCount}-question quiz about: ${cleanTopic}`);
    if (aiResult && aiResult.questions && Array.isArray(aiResult.questions) && aiResult.questions.length > 0) {
      let finalQuestions = aiResult.questions;
      // If AI returned fewer questions than requested, pad with procedural questions
      if (finalQuestions.length < targetCount) {
        const extra = createProceduralQuestions(cleanTopic, targetCount - finalQuestions.length, finalQuestions.length);
        finalQuestions = [...finalQuestions, ...extra];
      } else if (finalQuestions.length > targetCount) {
        finalQuestions = finalQuestions.slice(0, targetCount);
      }
      return normalizeQuiz({
        ...aiResult,
        questions: finalQuestions
      }, { sourceType: 'ai' });
    }
  } catch (err) {
    console.warn('[QuizGuard AI] Remote API fallback:', err);
  }

  // Fallback to template or procedural generator
  const matchedKey = Object.keys(DOMAIN_TEMPLATES).find(k => cleanTopic.toLowerCase().includes(k));
  if (matchedKey) {
    const tmpl = DOMAIN_TEMPLATES[matchedKey];
    let selectedQuestions = [...tmpl.questions];

    if (selectedQuestions.length < targetCount) {
      // Pad with procedural questions
      const needed = targetCount - selectedQuestions.length;
      const extra = createProceduralQuestions(cleanTopic, needed, selectedQuestions.length);
      selectedQuestions = [...selectedQuestions, ...extra];
    } else {
      selectedQuestions = selectedQuestions.slice(0, targetCount);
    }

    return normalizeQuiz({
      title: tmpl.title,
      description: tmpl.description,
      categoryId: tmpl.categoryId,
      difficulty,
      questions: selectedQuestions
    }, { sourceType: 'ai' });
  }

  // Procedural fallback
  const fallbackQuestions = createProceduralQuestions(cleanTopic, targetCount);

  return normalizeQuiz({
    title: `${cleanTopic} Knowledge Check`,
    description: `Assessment covering essential concepts and practical applications of ${cleanTopic}.`,
    categoryId: 'cs',
    difficulty,
    questions: fallbackQuestions
  }, { sourceType: 'ai' });
}

/**
 * Generate Quiz from PPTX presentation slides
 * Preserves slide numbers and sourceSlide citations
 */
export async function generateQuizFromPptx(parsedPptx, options = {}) {
  const { questionCount = 5, difficulty = 'Medium', language = 'English' } = options;
  const targetCount = Number(questionCount) > 0 ? Number(questionCount) : 5;
  const slides = parsedPptx.slides || [];
  if (slides.length === 0) throw new Error('No slides available to generate questions from.');

  const slideSummaries = slides.map(s => `[Slide ${s.slideNumber}: ${s.title}]\n${s.text}\n${s.notes ? `Notes: ${s.notes}` : ''}`).join('\n\n');

  const systemPrompt = `You are QuizGuard's PowerPoint Assessment Generator.
Extract and formulate EXACTLY ${targetCount} multiple-choice quiz questions STRICTLY based on the provided slide content.
Do NOT invent outside facts. Formulate clear, educational questions from the concepts, facts, or questions present in the presentation.
Distribute correct answers randomly across indices 0, 1, 2, and 3 (Options A, B, C, D).
For each question, include the "sourceSlide" property specifying which slide contained the answer (e.g., "Slide 1").
Target Language: ${language}. Difficulty: ${difficulty}.
Return ONLY valid JSON with this format:
{
  "title": "${parsedPptx.title || 'PowerPoint Presentation Assessment'}",
  "description": "Assessment generated from presentation slides.",
  "categoryId": "cs",
  "difficulty": "${difficulty}",
  "duration": ${Math.max(5, targetCount * 2)},
  "questions": [
    {
      "question": "Question text based on slide content?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 1,
      "explanation": "Explanation citing facts from the slide.",
      "sourceSlide": "Slide 1"
    }
  ]
}`;

  try {
    const aiResult = await callAiCompletion(systemPrompt, `Presentation Content:\n${slideSummaries}`);
    if (aiResult && Array.isArray(aiResult.questions) && aiResult.questions.length > 0) {
      let finalQuestions = aiResult.questions;
      if (finalQuestions.length < targetCount) {
        const extra = createProceduralQuestions(parsedPptx.title || 'Presentation', targetCount - finalQuestions.length, finalQuestions.length);
        finalQuestions = [...finalQuestions, ...extra];
      } else if (finalQuestions.length > targetCount) {
        finalQuestions = finalQuestions.slice(0, targetCount);
      }
      return normalizeQuiz({
        ...aiResult,
        questions: finalQuestions
      }, { sourceType: 'pptx' });
    }
  } catch (err) {
    console.warn('[QuizGuard AI] PPTX AI generation fallback:', err);
  }

  // Smart Procedural PPTX fallback
  const questions = Array.from({ length: targetCount }, (_, idx) => {
    const slide = slides[idx % slides.length];
    const text = (slide.text || '').trim();
    const lines = text.split(/[\n\.]+/).map(l => l.trim()).filter(l => l.length > 10);

    const questionText = lines.find(l => l.endsWith('?') || /^(what|which|how|why|who|when|where|is|are)\b/i.test(l))
      || `Key concept from ${slide.title}: Which statement is correct according to Slide ${slide.slideNumber}?`;

    const factLines = lines.filter(l => l !== questionText);
    const correctConcept = factLines[0] || (text.length > 15 ? text.substring(0, 70) : `Core mechanism of ${slide.title}`);

    const options = [
      correctConcept,
      `Alternative implementation of ${slide.title}`,
      `Secondary guideline for Slide ${slide.slideNumber}`,
      `Standard framework prerequisite`
    ];

    const correctIdx = idx % 4;
    const correctVal = options[0];
    options.splice(0, 1);
    options.splice(correctIdx, 0, correctVal);

    return {
      question: questionText,
      options,
      answer: correctIdx,
      explanation: `Extracted directly from Slide ${slide.slideNumber} of the presentation.`,
      sourceSlide: `Slide ${slide.slideNumber}`
    };
  });

  return normalizeQuiz({
    title: parsedPptx.title ? `${parsedPptx.title} Quiz` : 'Presentation Assessment',
    description: `Assessment based on ${slides.length} slides from PowerPoint presentation.`,
    categoryId: 'cs',
    difficulty,
    questions
  }, { sourceType: 'pptx' });
}

/**
 * Generate Quiz from PDF Document
 * Preserves page numbers and sourcePage citations
 */
export async function generateQuizFromPdf(parsedPdf, options = {}) {
  const { questionCount = 5, difficulty = 'Medium', language = 'English' } = options;
  const targetCount = Number(questionCount) > 0 ? Number(questionCount) : 5;
  const pages = parsedPdf.pages || [];
  if (pages.length === 0) throw new Error('No pages available to generate questions from.');

  const pageSummaries = pages.map(p => `[Page ${p.pageNumber}]\n${p.text.substring(0, 4000)}`).join('\n\n');

  const systemPrompt = `You are QuizGuard's PDF Assessment Generator.
Extract and formulate EXACTLY ${targetCount} multiple-choice quiz questions STRICTLY based on the provided PDF document pages.
If the PDF already contains quiz questions or assessments, extract them faithfully with their choices and verified answers.
Otherwise, formulate clear questions grounded in the key facts and concepts of the document.
Distribute correct answers across indices 0, 1, 2, and 3 (Options A, B, C, D).
For each question, include the "sourcePage" property specifying which page contained the fact (e.g. "Page 1").
Target Language: ${language}. Difficulty: ${difficulty}.
Return ONLY valid JSON with this format:
{
  "title": "${parsedPdf.title || 'PDF Document Assessment'}",
  "description": "Assessment extracted from PDF pages.",
  "categoryId": "cs",
  "difficulty": "${difficulty}",
  "duration": ${Math.max(5, targetCount * 2)},
  "questions": [
    {
      "question": "Question text based on PDF page?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 2,
      "explanation": "Explanation citing facts from the page.",
      "sourcePage": "Page 1"
    }
  ]
}`;

  try {
    const aiResult = await callAiCompletion(systemPrompt, `PDF Content:\n${pageSummaries}`);
    if (aiResult && Array.isArray(aiResult.questions) && aiResult.questions.length > 0) {
      let finalQuestions = aiResult.questions;
      if (finalQuestions.length < targetCount) {
        const extra = createProceduralQuestions(parsedPdf.title || 'Document', targetCount - finalQuestions.length, finalQuestions.length);
        finalQuestions = [...finalQuestions, ...extra];
      } else if (finalQuestions.length > targetCount) {
        finalQuestions = finalQuestions.slice(0, targetCount);
      }
      return normalizeQuiz({
        ...aiResult,
        questions: finalQuestions
      }, { sourceType: 'pdf' });
    }
  } catch (err) {
    console.warn('[QuizGuard AI] PDF AI generation fallback:', err);
  }

  // Procedural PDF fallback
  const questions = Array.from({ length: targetCount }, (_, idx) => {
    const page = pages[idx % pages.length];
    const correctIdx = idx % 4;
    const options = [
      page.text ? `${page.text.substring(0, 80)}...` : `Verified information from Page ${page.pageNumber}`,
      `Factual error contrary to Page ${page.pageNumber}`,
      `Unstated hypothesis from outside the text`,
      `Invalid conclusion`
    ];
    const correctText = options[0];
    options.splice(0, 1);
    options.splice(correctIdx, 0, correctText);

    return {
      question: `Based on content found on Page ${page.pageNumber}, which statement is accurate?`,
      options,
      answer: correctIdx,
      explanation: `Extracted from Page ${page.pageNumber} of the uploaded document.`,
      sourcePage: `Page ${page.pageNumber}`
    };
  });

  return normalizeQuiz({
    title: parsedPdf.title ? `${parsedPdf.title} Assessment` : 'PDF Document Assessment',
    description: `Assessment generated from ${pages.length} pages of PDF content.`,
    categoryId: 'cs',
    difficulty,
    questions
  }, { sourceType: 'pdf' });
}

/**
 * Generate Quiz from pasted study notes / text
 */
export async function generateQuizFromText(parsedText, options = {}) {
  const { questionCount = 5, difficulty = 'Medium', language = 'English' } = options;
  const targetCount = Number(questionCount) > 0 ? Number(questionCount) : 5;
  const sections = parsedText.sections || [];

  const systemPrompt = `You are QuizGuard's Text Notes Assessment Generator.
Extract and formulate EXACTLY ${targetCount} multiple-choice questions from the provided study text.
Distribute correct answers randomly across indices 0, 1, 2, and 3.
For each question, cite "sourceNote" with the section number.
Target Language: ${language}. Difficulty: ${difficulty}.
Return ONLY JSON with this format:
{
  "title": "${parsedText.title || 'Study Material Assessment'}",
  "description": "Generated from lecture notes and textbook content.",
  "categoryId": "cs",
  "difficulty": "${difficulty}",
  "duration": ${Math.max(5, targetCount * 2)},
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 3,
      "explanation": "Clear explanation based on notes.",
      "sourceNote": "Section 1"
    }
  ]
}`;

  try {
    const aiResult = await callAiCompletion(systemPrompt, `Study Notes:\n${parsedText.rawText}`);
    if (aiResult && Array.isArray(aiResult.questions) && aiResult.questions.length > 0) {
      let finalQuestions = aiResult.questions;
      if (finalQuestions.length < targetCount) {
        const extra = createProceduralQuestions(parsedText.title || 'Notes', targetCount - finalQuestions.length, finalQuestions.length);
        finalQuestions = [...finalQuestions, ...extra];
      } else if (finalQuestions.length > targetCount) {
        finalQuestions = finalQuestions.slice(0, targetCount);
      }
      return normalizeQuiz({
        ...aiResult,
        questions: finalQuestions
      }, { sourceType: 'text' });
    }
  } catch (err) {
    console.warn('[QuizGuard AI] Text AI generation fallback:', err);
  }

  // Procedural text fallback
  const validSections = sections.length > 0 ? sections : [{ sectionNumber: 1, text: parsedText.rawText || '' }];
  const questions = Array.from({ length: targetCount }, (_, idx) => {
    const sec = validSections[idx % validSections.length];
    const correctIdx = idx % 4;
    const options = [
      sec.text ? `${sec.text.substring(0, 80)}...` : `Core thesis of Section ${sec.sectionNumber}`,
      `Contradictory claim rejected by the notes`,
      `Outdated principle not mentioned`,
      `Irrelevant detail`
    ];
    const correctText = options[0];
    options.splice(0, 1);
    options.splice(correctIdx, 0, correctText);

    return {
      question: `According to study notes Section ${sec.sectionNumber}, which key concept is highlighted?`,
      options,
      answer: correctIdx,
      explanation: `Referenced directly in Section ${sec.sectionNumber} of the study material.`,
      sourceNote: `Section ${sec.sectionNumber}`
    };
  });

  return normalizeQuiz({
    title: parsedText.title || 'Study Notes Quiz',
    description: 'Assessment generated from provided study notes.',
    categoryId: 'cs',
    difficulty,
    questions
  }, { sourceType: 'text' });
}
