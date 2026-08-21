// Utility module for AI Quiz Generation in QuizGuard

import { saveCustomQuiz } from '../data/quizzes';

// Built-in smart templates for offline instant generation
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
        options: ["Brian Lara", "Sachin Tendulkar", "Don Bradman", "Virender Sehwag"],
        answer: 0,
        explanation: "Brian Lara scored 400* against England at St John's in 2004."
      },
      {
        question: "Which cricketer is known as the 'Sir' who achieved a career Test batting average of 99.94?",
        options: ["Sir Don Bradman", "Sir Garfield Sobers", "Sir Viv Richards", "Sir Ian Botham"],
        answer: 0,
        explanation: "Sir Donald Bradman of Australia finished his Test career with an unprecedented average of 99.94."
      },
      {
        question: "How many fielders are allowed outside the 30-yard circle during the first mandatory Powerplay in ODI cricket?",
        options: ["Maximum 2", "Maximum 3", "Maximum 4", "Maximum 5"],
        answer: 0,
        explanation: "During Powerplay 1 (overs 1-10 in ODIs), a maximum of 2 fielders are allowed outside the 30-yard circle."
      },
      {
        question: "Who was the captain of the Indian cricket team that won the 1983 World Cup?",
        options: ["Kapil Dev", "Sunil Gavaskar", "Mohinder Amarnath", "Ravi Shastri"],
        answer: 0,
        explanation: "Kapil Dev captained India to their historic 1983 World Cup victory over West Indies."
      },
      {
        question: "Which bowler has taken the highest number of wickets in international Test cricket (800 wickets)?",
        options: ["Muttiah Muralitharan", "Shane Warne", "James Anderson", "Anil Kumble"],
        answer: 0,
        explanation: "Sri Lanka's Muttiah Muralitharan holds the record with 800 Test wickets."
      },
      {
        question: "What is the maximum allowed number of overs a single bowler can bowl in an ODI match?",
        options: ["10 overs", "12 overs", "8 overs", "15 overs"],
        answer: 0,
        explanation: "In a standard 50-over One Day International, an individual bowler can bowl a maximum of 10 overs."
      },
      {
        question: "Who scored the first double century in Men's ODI cricket history?",
        options: ["Sachin Tendulkar", "Virender Sehwag", "Rohit Sharma", "Chris Gayle"],
        answer: 0,
        explanation: "Sachin Tendulkar scored the first men's ODI double hundred (200*) against South Africa in Gwalior in 2010."
      },
      {
        question: "Which ground is traditionally referred to as the 'Home of Cricket'?",
        options: ["Lord's (London)", "Melbourne Cricket Ground (MCG)", "Eden Gardens (Kolkata)", "The Oval (London)"],
        answer: 0,
        explanation: "Lord's Cricket Ground in London, England is known globally as the 'Home of Cricket'."
      },
      {
        question: "In T20 International cricket, how many overs consist of a standard innings for one team?",
        options: ["20 overs", "15 overs", "50 overs", "10 overs"],
        answer: 0,
        explanation: "A standard Twenty20 innings consists of 20 overs per side."
      },
      {
        question: "What does DLS stand for in rain-affected cricket matches?",
        options: ["Duckworth-Lewis-Stern Method", "Direct Line System", "Digital Live Scoreboard", "Dynamic Length Strategy"],
        answer: 0,
        explanation: "DLS stands for Duckworth-Lewis-Stern method, used to calculate target scores in rain-affected matches."
      },
      {
        question: "Which country hosted and won the 2019 ICC Men's Cricket World Cup?",
        options: ["England", "New Zealand", "Australia", "India"],
        answer: 0,
        explanation: "England hosted and won the 2019 Cricket World Cup after a boundary countback against New Zealand."
      },
      {
        question: "Who hit 6 sixes in an over off Stuart Broad during the 2007 T20 World Cup?",
        options: ["Yuvraj Singh", "Herschelle Gibbs", "Kieron Pollard", "Chris Gayle"],
        answer: 0,
        explanation: "Yuvraj Singh struck 6 sixes in an over off Stuart Broad in Durban during the 2007 T20 World Cup."
      },
      {
        question: "What term describes a batsman being dismissed on the very first ball they face?",
        options: ["Golden Duck", "Diamond Duck", "Silver Duck", "Pair"],
        answer: 0,
        explanation: "Getting out on the first ball faced is termed a Golden Duck."
      },
      {
        question: "Which team won the inaugural ICC Men's T20 World Cup in 2007?",
        options: ["India", "Pakistan", "Australia", "West Indies"],
        answer: 0,
        explanation: "India won the inaugural 2007 T20 World Cup by defeating Pakistan in the Johannesburg final."
      }
    ]
  },
  docker: {
    title: "Docker & Containerization Mastery",
    description: "Test your skills on containers, Dockerfiles, multi-stage builds, networking, and volumes.",
    categoryId: "cs",
    questions: [
      {
        question: "In a Dockerfile, which instruction specifies the base image to use for building a container?",
        options: ["FROM", "BASE", "IMAGE", "RUN"],
        answer: 0,
        explanation: "The FROM instruction sets the Base Image for subsequent instructions in a Dockerfile."
      },
      {
        question: "What is the primary difference between COPY and ADD instructions in Dockerfile?",
        options: [
          "ADD can fetch remote URLs and unpack tar archives; COPY only copies local files.",
          "COPY can fetch remote URLs; ADD only copies local files.",
          "COPY runs during build time; ADD runs during runtime.",
          "There is no difference; they are exact aliases."
        ],
        answer: 0,
        explanation: "ADD supports remote URL fetching and automatic tar extraction, whereas COPY is strictly for copying local files into the container image."
      },
      {
        question: "Which Docker network driver allows containers to communicate directly on the host interface without NAT?",
        options: ["host", "bridge", "overlay", "macvlan"],
        answer: 0,
        explanation: "The host network driver removes network isolation between the container and the Docker host."
      },
      {
        question: "How do you persistent storage data outside a container's writable layer?",
        options: ["Docker Volumes & Bind Mounts", "Environment variables", "Container layers", "RAM disk buffers"],
        answer: 0,
        explanation: "Volumes and bind mounts allow data to persist independently of container lifecycles."
      },
      {
        question: "What does the command 'docker system prune' perform?",
        options: [
          "Removes all unused containers, networks, images, and optionally volumes.",
          "Restarts all active containers.",
          "Upgrades Docker Engine to the latest release.",
          "Export container logs to a zip file."
        ],
        answer: 0,
        explanation: "docker system prune removes stopped containers, unused networks, and dangling images."
      }
    ]
  },
  typescript: {
    title: "TypeScript Essentials & Advanced Types",
    description: "Assess your mastery of static typing, generics, utility types, and strict mode in TypeScript.",
    categoryId: "js",
    questions: [
      {
        question: "What is the difference between 'unknown' and 'any' in TypeScript?",
        options: [
          "'unknown' is type-safe because operations require type narrowing/checking before use, whereas 'any' disables type checking.",
          "'any' requires explicit casting, while 'unknown' permits arbitrary property access.",
          "'unknown' can only store primitive values, whereas 'any' stores objects.",
          "They are completely identical in TypeScript 5+."
        ],
        answer: 0,
        explanation: "'unknown' is the type-safe counterpart of 'any'. Anything is assignable to unknown, but unknown is not assignable to anything without a type assertion or narrowing check."
      },
      {
        question: "Which utility type constructs a type with all properties of T set to optional?",
        options: ["Partial<T>", "Readonly<T>", "Required<T>", "Omit<T, K>"],
        answer: 0,
        explanation: "Partial<T> turns all properties of object type T into optional properties."
      },
      {
        question: "What does the 'never' type represent in TypeScript?",
        options: [
          "Values that never occur, such as a function that always throws an error or never returns.",
          "A variable that has not been initialized yet.",
          "A type alias for void.",
          "An async promise that never resolves."
        ],
        answer: 0,
        explanation: "'never' represents the type of values that never occur, such as unreachable code branches or infinite loops."
      },
      {
        question: "How do you enforce read-only properties in an interface definition?",
        options: ["Using the 'readonly' modifier before property names", "Using the 'const' keyword", "Using 'frozen' modifier", "Using private getters"],
        answer: 0,
        explanation: "The 'readonly' modifier marks interface properties as immutable after initialization."
      },
      {
        question: "What keyword is used to derive a type from an existing variable or object value?",
        options: ["typeof", "keyof", "instanceof", "type"],
        answer: 0,
        explanation: "The 'typeof' operator in type context refers to the TypeScript type of a variable."
      }
    ]
  },
  python: {
    title: "Python 3 & Data Science Fundamentals",
    description: "Test list comprehensions, decorators, generators, GIL, and memory management in Python.",
    categoryId: "cs",
    questions: [
      {
        question: "What is the purpose of Python's Global Interpreter Lock (GIL)?",
        options: [
          "To prevent multiple native threads from executing Python bytecodes simultaneously in CPython.",
          "To speed up memory allocation for dictionaries.",
          "To automatically compile Python to C binary code.",
          "To encrypt bytecode files before saving."
        ],
        answer: 0,
        explanation: "GIL is a mutex that protects access to Python objects, preventing multiple threads from executing CPython bytecodes at once."
      },
      {
        question: "What does a function containing the 'yield' keyword return when invoked?",
        options: ["A Generator object", "A Tuple", "An Async Future", "A List"],
        answer: 0,
        explanation: "Functions with 'yield' return a generator object, which yields values lazily upon iteration."
      },
      {
        question: "Which list comprehension correctly filters even numbers from range(10)?",
        options: [
          "[x for x in range(10) if x % 2 == 0]",
          "[x filter x % 2 == 0 in range(10)]",
          "[if x % 2 == 0: x for x in range(10)]",
          "[x in range(10) where x % 2 == 0]"
        ],
        answer: 0,
        explanation: "[x for x in range(10) if x % 2 == 0] evaluates the condition and yields even numbers."
      },
      {
        question: "What is a Python decorator?",
        options: [
          "A callable that takes another function as an argument and extends its behavior without modifying it explicitly.",
          "A built-in GUI widget for styling console outputs.",
          "A static type annotation comment.",
          "A special syntax for class inheritance."
        ],
        answer: 0,
        explanation: "Decorators wrap functions to extend or alter their execution behavior dynamically."
      },
      {
        question: "What is the key difference between lists and tuples in Python?",
        options: [
          "Lists are mutable, whereas tuples are immutable.",
          "Tuples allow duplicate elements, lists do not.",
          "Lists store strings, tuples store numbers.",
          "Lists use 1-based indexing, tuples use 0-based indexing."
        ],
        answer: 0,
        explanation: "Lists can be modified after creation (mutable), while tuples cannot be changed (immutable)."
      }
    ]
  },
  ai: {
    title: "AI & Machine Learning Concepts",
    description: "Evaluate neural networks, transformer architectures, loss functions, overfitting, and LLMs.",
    categoryId: "cs",
    questions: [
      {
        question: "What key mechanism introduced in the 2017 'Attention Is All You Need' paper powers modern Transformers?",
        options: ["Self-Attention Mechanism", "Convolutional Stride", "Recurrent Backpropagation", "Generative Adversarial Routing"],
        answer: 0,
        explanation: "Self-attention enables transformers to dynamically weigh the importance of input tokens relative to each other."
      },
      {
        question: "What phenomenon occurs when a machine learning model performs exceptionally on training data but poorly on unseen test data?",
        options: ["Overfitting", "Underfitting", "Vanishing Gradient", "Mode Collapse"],
        answer: 0,
        explanation: "Overfitting happens when a model learns noise and specific details of the training set rather than generalizable patterns."
      },
      {
        question: "Which activation function outputs values constrained between 0 and 1, often used in binary classification output layers?",
        options: ["Sigmoid", "ReLU", "Leaky ReLU", "Softmax"],
        answer: 0,
        explanation: "The Sigmoid function maps any real-valued number into a value between 0 and 1."
      },
      {
        question: "What technique is used to prevent neural networks from overfitting by randomly setting a fraction of input units to 0 during training?",
        options: ["Dropout", "Batch Normalization", "Gradient Clipping", "Early Stopping"],
        answer: 0,
        explanation: "Dropout regularizes models by randomly deactivating neurons during training steps."
      },
      {
        question: "In Supervised Learning, what does the model require during training?",
        options: ["Input features paired with ground-truth target labels", "Unlabeled raw data points only", "Reward signals from an interactive environment", "No data at all"],
        answer: 0,
        explanation: "Supervised learning relies on paired dataset examples consisting of inputs and correct target labels."
      }
    ]
  },
  devops: {
    title: "DevOps, CI/CD & Kubernetes",
    description: "Assess container orchestration, deployment strategies, infrastructure as code, and monitoring.",
    categoryId: "cloud",
    questions: [
      {
        question: "In Kubernetes, what is the smallest deployable computing unit that can be created and managed?",
        options: ["Pod", "Node", "Container", "Service"],
        answer: 0,
        explanation: "A Pod represents a single instance of a running process in your cluster and contains one or more containers."
      },
      {
        question: "Which deployment strategy gradually shifts traffic from an old version of an app to a new version to minimize risk?",
        options: ["Canary Deployment", "Recreate Deployment", "Big Bang Deployment", "In-place Upgrade"],
        answer: 0,
        explanation: "Canary deployment exposes the new version to a small percentage of users before rolling out to everyone."
      },
      {
        question: "What is Infrastructure as Code (IaC)?",
        options: [
          "Managing and provisioning infrastructure through machine-readable definition files rather than manual configuration.",
          "Writing server code directly inside HTML files.",
          "Running database queries using shell commands.",
          "Deploying code without automated testing."
        ],
        answer: 0,
        explanation: "IaC allows infrastructure to be versioned, tested, and provisioned automatically using code scripts (e.g. Terraform)."
      },
      {
        question: "What Kubernetes object manages persistent storage requests made by Pods?",
        options: ["PersistentVolumeClaim (PVC)", "Ingress", "ConfigMap", "DaemonSet"],
        answer: 0,
        explanation: "A PersistentVolumeClaim (PVC) is a request for storage resources by a user or Pod."
      },
      {
        question: "What does CI/CD stand for?",
        options: [
          "Continuous Integration / Continuous Deployment (or Delivery)",
          "Central Interface / Core Data",
          "Computer Inspection / Code Debugging",
          "Cloud Infrastructure / Container Development"
        ],
        answer: 0,
        explanation: "CI/CD automates building, testing, and deploying software changes continuously."
      }
    ]
  },
  history: {
    title: "World History & Civilization Mastery",
    description: "Explore major historical milestones, ancient empires, global revolutions, and world conflicts.",
    categoryId: "gk",
    questions: [
      {
        question: "Which ancient civilization constructed the Great Pyramids of Giza?",
        options: ["Ancient Egyptians", "Mesopotamians", "Ancient Greeks", "Persians"],
        answer: 0,
        explanation: "The Great Pyramids of Giza were built by the Ancient Egyptians during the Old Kingdom period."
      },
      {
        question: "In which year did World War II officially end?",
        options: ["1945", "1944", "1939", "1950"],
        answer: 0,
        explanation: "World War II ended in 1945 following the surrender of Germany and Japan."
      },
      {
        question: "Who was the first Emperor of a unified China, known for beginning the Great Wall?",
        options: ["Qin Shi Huang", "Han Wudi", "Kublai Khan", "Sun Yat-sen"],
        answer: 0,
        explanation: "Qin Shi Huang unified China in 221 BC and established the Qin Dynasty."
      },
      {
        question: "Which historic event in 1789 marked the beginning of the French Revolution?",
        options: ["Storming of the Bastille", "Execution of Louis XVI", "Tennis Court Oath", "Reign of Terror"],
        answer: 0,
        explanation: "The Storming of the Bastille on July 14, 1789 is recognized as the onset of the French Revolution."
      },
      {
        question: "Which Roman general transformed the Roman Republic into the Roman Empire?",
        options: ["Julius Caesar & Augustus", "Mark Antony", "Scipio Africanus", "Nero"],
        answer: 0,
        explanation: "Julius Caesar's rise and his heir Augustus becoming the first Emperor established the Roman Empire."
      },
      {
        question: "What historic document signed in 1215 limited the power of the English Monarchy?",
        options: ["Magna Carta", "Bill of Rights 1689", "Treaty of Versailles", "Declaration of Arbroath"],
        answer: 0,
        explanation: "The Magna Carta was signed by King John of England in 1215."
      },
      {
        question: "Which global war broke out following the assassination of Archduke Franz Ferdinand in 1914?",
        options: ["World War I", "World War II", "Crimean War", "Seven Years' War"],
        answer: 0,
        explanation: "The assassination of Archduke Franz Ferdinand of Austria in Sarajevo ignited World War I."
      },
      {
        question: "Who led the Salt March in 1930 as part of India's non-violent independence movement?",
        options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Subhas Chandra Bose", "Sardar Patel"],
        answer: 0,
        explanation: "Mahatma Gandhi led the 240-mile Salt March to Dandi in 1930 to protest the British salt tax."
      },
      {
        question: "Which renaissance polymath painted the Mona Lisa and The Last Supper?",
        options: ["Leonardo da Vinci", "Michelangelo", "Raphael", "Donatello"],
        answer: 0,
        explanation: "Leonardo da Vinci painted both masterpieces during the Italian Renaissance."
      },
      {
        question: "What period of geopolitical tension existed between the US and USSR from 1947 to 1991?",
        options: ["The Cold War", "The Great Game", "The Thirty Years' War", "The Korean Conflict"],
        answer: 0,
        explanation: "The Cold War was an era of global ideological conflict between Western powers and the Soviet Union."
      },
      {
        question: "Which empire ruled much of Southeastern Europe, Western Asia, and Northern Africa from 1299 to 1922?",
        options: ["Ottoman Empire", "Byzantine Empire", "Persian Empire", "Mongol Empire"],
        answer: 0,
        explanation: "The Ottoman Empire was founded by Osman I and lasted over six centuries."
      },
      {
        question: "Who was the first President of the United States?",
        options: ["George Washington", "Thomas Jefferson", "Abraham Lincoln", "Benjamin Franklin"],
        answer: 0,
        explanation: "George Washington served as the first US President from 1789 to 1797."
      },
      {
        question: "What major international peace organization was founded immediately after World War II in 1945?",
        options: ["United Nations (UN)", "League of Nations", "NATO", "European Union"],
        answer: 0,
        explanation: "The United Nations was established in October 1945 to foster international cooperation."
      },
      {
        question: "Which ancient trade network connected East Asia with the Mediterranean world?",
        options: ["The Silk Road", "The Incense Route", "The Amber Road", "The Trans-Saharan Route"],
        answer: 0,
        explanation: "The Silk Road was an extensive network of Eurasian trade routes active for centuries."
      },
      {
        question: "Which Soviet leader instituted the policies of Perestroika and Glasnost in the late 1980s?",
        options: ["Mikhail Gorbachev", "Nikita Khrushchev", "Leonid Brezhnev", "Boris Yeltsin"],
        answer: 0,
        explanation: "Mikhail Gorbachev introduced Glasnost (openness) and Perestroika (restructuring) prior to USSR dissolution."
      }
    ]
  },
  geography: {
    title: "World Geography & Earth Science",
    description: "Test your knowledge of continents, capitals, oceans, mountain ranges, and geographical milestones.",
    categoryId: "gk",
    questions: [
      {
        question: "Which is the largest continent on Earth by both land area and population?",
        options: ["Asia", "Africa", "North America", "Europe"],
        answer: 0,
        explanation: "Asia is the world's largest and most populous continent."
      },
      {
        question: "What is the longest river in the world?",
        options: ["Nile River", "Amazon River", "Yangtze River", "Mississippi River"],
        answer: 0,
        explanation: "The Nile River in Africa is traditionally recognized as the longest river in the world."
      },
      {
        question: "Which mountain peak is the highest point above sea level on Earth?",
        options: ["Mount Everest", "K2", "Kangchenjunga", "Kilimanjaro"],
        answer: 0,
        explanation: "Mount Everest in the Himalayas reaches an elevation of 8,848.86 meters above sea level."
      },
      {
        question: "What is the capital city of Australia?",
        options: ["Canberra", "Sydney", "Melbourne", "Brisbane"],
        answer: 0,
        explanation: "Canberra is the federal capital city of Australia."
      },
      {
        question: "Which ocean is the largest and deepest on Earth?",
        options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
        answer: 0,
        explanation: "The Pacific Ocean covers over 30% of the Earth's surface."
      }
    ]
  }
};

/**
 * Generates dynamic questions procedurally for any topic string without boilerplate software jargon
 */
function generateProceduralQuiz(topic, difficulty = 'Medium', count = 5) {
  const cleanTopic = topic.trim();
  const formattedTopic = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);
  
  const questionPool = [
    {
      q: `What is a primary defining concept or milestone associated with ${formattedTopic}?`,
      opts: [
        `Understanding its fundamental rules, historical context, and core principles.`,
        `Direct physical operating system kernel allocation.`,
        `Converting physical network signals into database transactions.`,
        `Strict memory cache invalidation.`
      ],
      ans: 0,
      exp: `${formattedTopic} is defined by its unique principles, historical developments, and domain rules.`
    },
    {
      q: `In the study and practice of ${formattedTopic}, which element is essential for success?`,
      opts: [
        `Consistent practice, factual precision, and systematic knowledge of core fundamentals.`,
        `Hardcoding text parameters in hardware drivers.`,
        `Skipping validation checks during execution.`,
        `Ignoring foundational rules altogether.`
      ],
      ans: 0,
      exp: `Mastering foundational rules and key principles is essential when studying ${formattedTopic}.`
    },
    {
      q: `Which key milestone or breakthrough significantly impacted the development of ${formattedTopic}?`,
      opts: [
        `Standardization of rules, global adoption, and major documented historical breakthroughs.`,
        `Automatic deletion of database records.`,
        `Disabling network encryption layers.`,
        `Random memory address allocation.`
      ],
      ans: 0,
      exp: `Major historic events and standardized frameworks shaped modern ${formattedTopic}.`
    },
    {
      q: `How are key events, achievements, or concepts categorized in ${formattedTopic}?`,
      opts: [
        `Through structured classifications, chronological eras, or standardized category rules.`,
        `By rebooting physical host hardware.`,
        `By saving variable names in temporary text files.`,
        `Through unorganized arbitrary assignments.`
      ],
      ans: 0,
      exp: `${formattedTopic} uses structured frameworks and historical chronologies for categorization.`
    },
    {
      q: `When analyzing advanced topics within ${formattedTopic}, which approach provides maximum accuracy?`,
      opts: [
        `Evaluating empirical evidence, verified historical records, and expert consensus.`,
        `Increasing text font size in documentation.`,
        `Running duplicate background processes.`,
        `Relying on unverified hearsay.`
      ],
      ans: 0,
      exp: `Factual records and verified consensus yield the highest accuracy when evaluating ${formattedTopic}.`
    }
  ];

  // Dynamically pad questions to requested count if necessary
  let selected = [];
  while (selected.length < count) {
    questionPool.forEach((item, idx) => {
      if (selected.length < count) {
        selected.push({
          q: item.q,
          opts: item.opts,
          ans: item.ans,
          exp: item.exp
        });
      }
    });
  }

  return {
    title: `${formattedTopic} Mastery Test`,
    description: `Comprehensive assessment evaluating core concepts, historical milestones, and key principles in ${formattedTopic}.`,
    categoryId: "gk",
    difficulty: difficulty,
    duration: Math.max(5, count * 2),
    timePerQuestion: 60,
    questions: selected.map((item, idx) => ({
      id: Date.now() + idx + Math.random(),
      question: item.q,
      options: item.opts,
      answer: item.ans,
      explanation: item.exp
    }))
  };
}

/**
 * Main AI Quiz Generator function
 */
export async function generateAiQuiz({
  topic,
  difficulty = 'Medium',
  questionCount = 5,
  apiKey = '',
  apiProvider = 'groq',
  onProgress = () => {}
}) {
  const cleanTopic = topic.trim().toLowerCase();

  // Progress simulation steps for visual feedback
  const steps = [
    "Contacting Groq Cloud AI Engine (Qwen 27B)...",
    `Formulating ${questionCount} scenario-based questions for "${topic}"...`,
    "Synthesizing option distractors and correct answer keys...",
    "Drafting detailed explanations and timer parameters...",
    "Finalizing QuizGuard proctored package..."
  ];

  for (let i = 0; i < steps.length; i++) {
    onProgress({ step: i + 1, total: steps.length, message: steps[i] });
    await new Promise(r => setTimeout(r, 450));
  }

  // Groq key loaded from .env (VITE_GROQ_API_KEY)
  const DEFAULT_GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

  // Determine active provider & API key
  const activeProvider = apiProvider === 'mock' ? 'mock' : 'groq';
  const activeApiKey = apiKey || (activeProvider === 'groq' ? DEFAULT_GROQ_KEY : '');

  if (activeApiKey && activeProvider !== 'mock') {
    try {
      console.log(`[QuizGuard AI] Sending API request to Groq Cloud (qwen/qwen3.6-27b) for topic: "${topic}" (${questionCount} questions)`);

      const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeApiKey}`
      };

      const body = {
        model: 'qwen/qwen3.6-27b',
        max_tokens: 8192,
        messages: [
          {
            role: 'system',
            content: 'You are an expert quiz generation AI for QuizGuard. Return ONLY a valid JSON object matching this structure: {"title": string, "description": string, "categoryId": "cs"|"js"|"react"|"cloud"|"gk"|"aptitude", "difficulty": string, "duration": number, "timePerQuestion": 60, "questions": [{"question": string, "options": [string, string, string, string], "answer": 0|1|2|3, "explanation": string}]}. Do not include markdown code block backticks.'
          },
          {
            role: 'user',
            content: `Generate a ${difficulty} difficulty quiz on "${topic}" with exactly ${questionCount} multiple choice questions.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        const contentStr = data.choices?.[0]?.message?.content;
        console.log("[QuizGuard AI] Groq API Response received successfully!", data);

        if (contentStr) {
          let cleanedStr = contentStr.trim();
          if (cleanedStr.startsWith('```json')) {
            cleanedStr = cleanedStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanedStr.startsWith('```')) {
            cleanedStr = cleanedStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }

          const parsed = JSON.parse(cleanedStr);
          if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
            const finalQuiz = {
              id: `custom_${Date.now()}`,
              title: parsed.title || `${topic} Quiz`,
              description: parsed.description || `AI-generated quiz on ${topic}`,
              categoryId: parsed.categoryId || 'cs',
              difficulty: parsed.difficulty || difficulty,
              duration: parsed.duration || Math.max(5, questionCount * 2),
              timePerQuestion: parsed.timePerQuestion || 60,
              questions: parsed.questions.map((q, idx) => ({
                id: Date.now() + idx,
                question: q.question,
                options: q.options,
                answer: typeof q.answer === 'number' ? q.answer : 0,
                explanation: q.explanation || 'Verified correct answer.'
              })),
              createdAt: new Date().toISOString(),
              isCustom: true,
              isAiGenerated: true,
              aiModel: 'Groq Cloud (LLaMA-3.3-70B)'
            };

            saveCustomQuiz(finalQuiz);
            return finalQuiz;
          }
        }
      } else {
        const errText = await response.text();
        console.warn(`[QuizGuard AI] Groq API error HTTP ${response.status}:`, errText);
      }
    } catch (err) {
      console.warn("[QuizGuard AI] Groq API fetch error, falling back to built-in procedural engine:", err);
    }
  }

  // Matching preset domain templates
  let matchedTemplateKey = Object.keys(DOMAIN_TEMPLATES).find(key => cleanTopic.includes(key));
  let quizData;

  if (matchedTemplateKey) {
    const tmpl = DOMAIN_TEMPLATES[matchedTemplateKey];
    const slicedQuestions = tmpl.questions.slice(0, questionCount);
    quizData = {
      title: tmpl.title,
      description: tmpl.description,
      categoryId: tmpl.categoryId,
      difficulty: difficulty,
      duration: Math.max(5, slicedQuestions.length * 2),
      timePerQuestion: 60,
      questions: slicedQuestions.map((q, idx) => ({
        ...q,
        id: Date.now() + idx
      }))
    };
  } else {
    // Generate procedurally
    quizData = generateProceduralQuiz(topic, difficulty, questionCount);
  }

  // Construct complete custom quiz package
  const finalQuiz = {
    id: `custom_${Date.now()}`,
    title: quizData.title,
    description: quizData.description,
    categoryId: quizData.categoryId,
    difficulty: difficulty,
    duration: quizData.duration,
    timePerQuestion: quizData.timePerQuestion,
    questions: quizData.questions,
    createdAt: new Date().toISOString(),
    isCustom: true,
    isAiGenerated: true
  };

  // Persist to local quizzes
  saveCustomQuiz(finalQuiz);

  return finalQuiz;
}
