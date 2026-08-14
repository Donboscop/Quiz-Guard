// Static Quiz Dataset for QuizGuard

export const CATEGORIES = [
  {
    id: "js",
    name: "JavaScript",
    icon: "Code2",
    color: "from-amber-500 to-yellow-500",
    bgLight: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    description: "ES6+, Async JS, Closures, Event Loop, DOM Manipulation & Modern JS Concepts."
  },
  {
    id: "react",
    name: "React",
    icon: "Atom",
    color: "from-cyan-500 to-blue-500",
    bgLight: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    description: "Hooks, Virtual DOM, State Management, Component Lifecycle & Performance."
  },
  {
    id: "web",
    name: "HTML & CSS",
    icon: "Palette",
    color: "from-orange-500 to-rose-500",
    bgLight: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    description: "Flexbox, Grid, Responsive Design, CSS Custom Properties & Semantic HTML5."
  },
  {
    id: "gk",
    name: "General Knowledge",
    icon: "Globe2",
    color: "from-emerald-500 to-teal-500",
    bgLight: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description: "World History, Geography, Science, Innovations & Global Current Affairs."
  },
  {
    id: "aptitude",
    name: "Aptitude & Logic",
    icon: "BrainCircuit",
    color: "from-purple-500 to-indigo-500",
    bgLight: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    description: "Logical Reasoning, Quantitative Analysis, Number Series & Problem Solving."
  },
  {
    id: "cloud",
    name: "Cloud Computing",
    icon: "Cloud",
    color: "from-blue-500 to-indigo-500",
    bgLight: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description: "AWS, Serverless, Containers, DevOps Principles & Cloud Architecture."
  },
  {
    id: "cs",
    name: "Computer Science",
    icon: "Cpu",
    color: "from-violet-500 to-purple-500",
    bgLight: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    description: "Data Structures, Algorithms, OS Concepts, Networking & Databases."
  }
];

const STATIC_QUIZZES = [
  {
    id: "js-fundamentals",
    categoryId: "js",
    category: "JavaScript",
    title: "JavaScript Core & Modern ES6+",
    description: "Test your knowledge of closures, scope, Promises, async/await, and event loop mechanics.",
    difficulty: "Medium",
    duration: 10, // minutes
    totalQuestions: 8,
    questions: [
      {
        id: 101,
        question: "What will be logged to the console when executing `console.log(typeof typeof 1)`?",
        options: ["'number'", "'string'", "'undefined'", "'object'"],
        answer: 1,
        explanation: "`typeof 1` returns the string `'number'`. Then `typeof 'number'` returns `'string'`."
      },
      {
        id: 102,
        question: "Which mechanism allows functions in JavaScript to access variables from an outer enclosing scope even after that scope has closed?",
        options: ["Hoisting", "Closure", "Prototype Chaining", "Currying"],
        answer: 1,
        explanation: "A Closure is created whenever a function is defined inside another function, retaining access to the outer lexical environment."
      },
      {
        id: 103,
        question: "What is the result of `0.1 + 0.2 === 0.3` in JavaScript?",
        options: ["true", "false", "TypeError", "NaN"],
        answer: 1,
        explanation: "Due to IEEE 754 floating-point precision issues, `0.1 + 0.2` equals `0.30000000000000004`, making the strict equality check false."
      },
      {
        id: 104,
        question: "Which of the following methods creates a shallow copy of an array without modifying the original array?",
        options: ["Array.prototype.push()", "Array.prototype.slice()", "Array.prototype.splice()", "Array.prototype.reverse()"],
        answer: 1,
        explanation: "`slice()` returns a shallow copy of a portion of an array into a new array object. `splice()`, `push()`, and `reverse()` mutate the original array."
      },
      {
        id: 105,
        question: "What will `Promise.all([p1, p2, p3])` do if one of the promises rejects?",
        options: [
          "Waits for all promises to settle and returns an object with results",
          "Immediately rejects with the reason of the first promise that rejected",
          "Ignores the rejected promise and resolves with successful values",
          "Returns null"
        ],
        answer: 1,
        explanation: "`Promise.all` follows an 'all-or-nothing' principle: if any input promise rejects, the returned promise immediately rejects."
      },
      {
        id: 106,
        question: "What does the `use strict` directive enforce in a JavaScript file or function?",
        options: [
          "Compiles code into WebAssembly",
          "Prevents the use of undeclared variables and catches silent errors",
          "Enforces static type checking at runtime",
          "Disables asynchronous execution"
        ],
        answer: 1,
        explanation: "`'use strict'` catches silent errors, prevents accidental global variables, and disables deprecated language features."
      },
      {
        id: 107,
        question: "What is the primary difference between `map()` and `forEach()` on JavaScript arrays?",
        options: [
          "`map()` modifies the original array; `forEach()` does not.",
          "`map()` returns a new array with transformed elements; `forEach()` returns `undefined`.",
          "`map()` is asynchronous; `forEach()` is synchronous.",
          "`map()` only works on numbers; `forEach()` works on strings."
        ],
        answer: 1,
        explanation: "`map()` returns a new array of the same length containing callback results. `forEach()` iterates and returns `undefined`."
      },
      {
        id: 108,
        question: "Which data structure was introduced in ES6 to store unique values of any type?",
        options: ["WeakMap", "Set", "Symbol", "Object.freeze"],
        answer: 1,
        explanation: "`Set` is a collection of values where each value may occur only once."
      }
    ]
  },
  {
    id: "react-mastery",
    categoryId: "react",
    category: "React",
    title: "React Architecture & Hooks Mastery",
    description: "Assess your expertise in React 18, custom hooks, useEffect lifecycle, memoization, and Context API.",
    difficulty: "Hard",
    duration: 12,
    totalQuestions: 8,
    questions: [
      {
        id: 201,
        question: "Why should keys passed to list elements in React be stable and unique?",
        options: [
          "Keys determine the CSS styling order of child components",
          "Keys help React identify which items have changed, been added, or removed during reconciliation",
          "Keys trigger automatic re-renders when data updates",
          "Keys are required to make components accessible for screen readers"
        ],
        answer: 1,
        explanation: "Unique keys allow the React Virtual DOM diffing algorithm to match elements efficiently across renders without re-mounting DOM elements."
      },
      {
        id: 202,
        question: "What happens if you omit the dependency array in a `useEffect` hook?",
        options: [
          "The effect runs only once when the component mounts",
          "The effect runs after every single render of the component",
          "The effect never runs",
          "React throws a compilation error"
        ],
        answer: 1,
        explanation: "Without a dependency array, `useEffect(fn)` executes after every completed render cycle."
      },
      {
        id: 203,
        question: "Which hook should be used to store a mutable reference value that doesn't trigger a re-render when changed?",
        options: ["useState", "useRef", "useMemo", "useCallback"],
        answer: 1,
        explanation: "`useRef` returns a mutable object whose `.current` property persists across renders without causing component re-renders when updated."
      },
      {
        id: 204,
        question: "What feature did React 18 introduce to prioritize urgent state updates over non-urgent background rendering?",
        options: ["React Fiber", "Concurrent React & startTransition", "Server Components", "Suspense for Data Fetching"],
        answer: 1,
        explanation: "Concurrent rendering and `startTransition` allow developers to mark updates as non-urgent transitions so high-priority updates (typing/clicks) remain smooth."
      },
      {
        id: 205,
        question: "What is the main benefit of `useCallback`?",
        options: [
          "It caches the result of an expensive calculation",
          "It memoizes a callback function instance between renders to prevent unnecessary child re-renders",
          "It automatically handles async API calls",
          "It replaces the need for React Context"
        ],
        answer: 1,
        explanation: "`useCallback` returns a memoized version of the callback function that only changes if one of the dependencies has changed."
      },
      {
        id: 206,
        question: "In React Context, what causes consumer components to re-render?",
        options: [
          "Any change to the component's internal local state",
          "Whenever the value prop passed to the Context Provider changes by reference",
          "Only when screen resolution changes",
          "Context consumers never re-render automatically"
        ],
        answer: 1,
        explanation: "All consumers re-render whenever the `value` prop passed to the Context Provider changes by reference (`Object.is` check)."
      },
      {
        id: 207,
        question: "What rule must be followed when calling React Hooks?",
        options: [
          "Hooks can be called inside nested loops and conditionals",
          "Hooks must only be called at the top level of React function components or custom hooks",
          "Hooks must always be declared as async functions",
          "Hooks can be called from regular plain utility JS functions"
        ],
        answer: 1,
        explanation: "Hooks must be called at the top level to guarantee that Hooks are called in the exact same order on every render."
      },
      {
        id: 208,
        question: "What is the purpose of `React.memo`?",
        options: [
          "It memoizes the return value of a calculation",
          "It prevents a functional component from re-rendering if its props have not changed",
          "It stores component state in localStorage automatically",
          "It compiles JSX into native DOM elements at build time"
        ],
        answer: 1,
        explanation: "`React.memo` is a higher-order component that skips rendering a component when its props are unchanged."
      }
    ]
  },
  {
    id: "html-css-expert",
    categoryId: "web",
    category: "HTML & CSS",
    title: "Modern HTML5 & CSS3 Design System",
    description: "Test responsive layouts, Flexbox/Grid alignment rules, accessibility attributes, and CSS variable mechanics.",
    difficulty: "Easy",
    duration: 8,
    totalQuestions: 8,
    questions: [
      {
        id: 301,
        question: "Which CSS property defines how flex items shrink relative to the rest of the flex items when space is limited?",
        options: ["flex-grow", "flex-shrink", "flex-basis", "flex-wrap"],
        answer: 1,
        explanation: "`flex-shrink` specifies the flex shrink factor, determining how much a flex item will shrink relative to the rest of the items in the flex container."
      },
      {
        id: 302,
        question: "What does the `ch` length unit represent in CSS?",
        options: [
          "Percentage of the viewport height",
          "Width of the '0' (zero) character of the element's font",
          "Height of the capital 'H' character",
          "Distance between characters in pixels"
        ],
        answer: 1,
        explanation: "1ch is equal to the width of the '0' (zero) glyph in the element's current font."
      },
      {
        id: 303,
        question: "In HTML5, which semantic tag should be used for main navigation links across a website?",
        options: ["<header>", "<nav>", "<section>", "<aside>"],
        answer: 1,
        explanation: "The `<nav>` element represents a section of a page whose purpose is to provide navigation links."
      },
      {
        id: 304,
        question: "What is the default value of the `position` property in CSS?",
        options: ["relative", "static", "absolute", "fixed"],
        answer: 1,
        explanation: "Elements are positioned `static` by default, meaning they follow the normal page flow."
      },
      {
        id: 305,
        question: "What does `box-sizing: border-box` do?",
        options: [
          "Adds a 1px border around every element",
          "Includes element padding and border in its specified total width and height",
          "Removes margins from all child elements",
          "Forces elements to display as inline-blocks"
        ],
        answer: 1,
        explanation: "With `border-box`, `width = content + padding + border`, preventing layout breaks when adding padding or borders."
      },
      {
        id: 306,
        question: "Which CSS Grid property specifies the size of grid tracks created implicitly when items fall outside defined explicit tracks?",
        options: ["grid-template-rows", "grid-auto-rows", "grid-column-gap", "grid-auto-flow"],
        answer: 1,
        explanation: "`grid-auto-rows` sets the size for implicit grid row tracks."
      },
      {
        id: 307,
        question: "What ARIA attribute informs screen reader users that a section of the page is updating dynamically without reloading?",
        options: ["aria-live", "aria-expanded", "aria-hidden", "aria-controls"],
        answer: 0,
        explanation: "`aria-live` announces dynamic content changes to assistive technologies (e.g., `aria-live=\"polite\"`)."
      },
      {
        id: 308,
        question: "What is the specificity weight order of CSS selectors from highest to lowest?",
        options: [
          "Inline style > ID > Class/Attribute/Pseudo-class > Element/Pseudo-element",
          "ID > Inline style > Element > Class",
          "Class > ID > Element > Inline style",
          "Element > Class > ID > Inline style"
        ],
        answer: 0,
        explanation: "Inline styles (1000) > IDs (100) > Classes/Attributes/Pseudo-classes (10) > Elements/Pseudo-elements (1)."
      }
    ]
  },
  {
    id: "general-knowledge-pro",
    categoryId: "gk",
    category: "General Knowledge",
    title: "Global Science, History & Technology",
    description: "Challenge your awareness of world landmarks, scientific discoveries, space exploration, and historical events.",
    difficulty: "Easy",
    duration: 8,
    totalQuestions: 8,
    questions: [
      {
        id: 401,
        question: "Which chemical element has the highest thermal conductivity and reflective properties of all metals?",
        options: ["Gold", "Silver", "Copper", "Platinum"],
        answer: 1,
        explanation: "Silver (Ag) has the highest electrical conductivity, thermal conductivity, and reflectivity of any known metal."
      },
      {
        id: 402,
        question: "Which space observatory launched in December 2021 is the successor to the Hubble Space Telescope?",
        options: ["Kepler Observatory", "James Webb Space Telescope", "Chandra Observatory", "Spitzer Telescope"],
        answer: 1,
        explanation: "The James Webb Space Telescope (JWST) was launched in December 2021 to observe infrared light from the early universe."
      },
      {
        id: 403,
        question: "Which deep ocean trench contains the deepest known point on Earth, known as Challenger Deep?",
        options: ["Puerto Rico Trench", "Mariana Trench", "Java Trench", "Tonga Trench"],
        answer: 1,
        explanation: "The Mariana Trench in the western Pacific Ocean contains Challenger Deep, reaching nearly 11,000 meters (36,000 feet) down."
      },
      {
        id: 404,
        question: "Who is widely credited with inventing the World Wide Web in 1989 while working at CERN?",
        options: ["Alan Turing", "Tim Berners-Lee", "Vint Cerf", "Linus Torvalds"],
        answer: 1,
        explanation: "Sir Tim Berners-Lee invented the World Wide Web in 1989, including HTTP, HTML, and URLs."
      },
      {
        id: 405,
        question: "What is the primary gas that makes up the Earth's atmosphere by volume?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"],
        answer: 1,
        explanation: "Nitrogen makes up approximately 78% of Earth's atmosphere, followed by Oxygen at 21%."
      },
      {
        id: 406,
        question: "Which organ in the human body is responsible for producing insulin?",
        options: ["Liver", "Pancreas", "Kidney", "Gallbladder"],
        answer: 1,
        explanation: "The beta cells of the Pancreas produce insulin to regulate blood glucose levels."
      },
      {
        id: 407,
        question: "Which country has the longest coastline in the world?",
        options: ["Russia", "Canada", "Australia", "Indonesia"],
        answer: 1,
        explanation: "Canada possesses the world's longest coastline, spanning over 202,080 kilometers (125,567 miles)."
      },
      {
        id: 408,
        question: "In physics, what is the speed of light in a vacuum approximately equal to?",
        options: ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "30,000 km/s"],
        answer: 0,
        explanation: "The speed of light in a vacuum ($c$) is exactly $299,792,458\\text{ m/s}$, or approximately $300,000\\text{ km/s}$."
      }
    ]
  },
  {
    id: "aptitude-logic",
    categoryId: "aptitude",
    category: "Aptitude & Logic",
    title: "Logical Reasoning & Problem Solving",
    description: "Sharpen your analytical skills with number series, speed-distance calculations, probability, and logical deduction.",
    difficulty: "Medium",
    duration: 10,
    totalQuestions: 8,
    questions: [
      {
        id: 501,
        question: "Find the next number in the sequence: 2, 6, 12, 20, 30, 42, ?",
        options: ["52", "56", "60", "64"],
        answer: 1,
        explanation: "The differences between consecutive terms are +4, +6, +8, +10, +12. So the next difference is +14: $42 + 14 = 56$ (or $n(n+1)$ for $n=7$ gives $7 \\times 8 = 56$)."
      },
      {
        id: 502,
        question: "A train running at 60 km/h crosses a 200-meter-long pole in 12 seconds. What is the length of the train?",
        options: ["150 meters", "200 meters", "250 meters", "300 meters"],
        answer: 1,
        explanation: "Speed in m/s = $60 \\times (5/18) = 50/3\\text{ m/s}$. Distance = Speed $\\times$ Time = $(50/3) \\times 12 = 200\\text{ meters}$."
      },
      {
        id: 503,
        question: "If a fair 6-sided die is rolled twice, what is the probability of rolling a sum equal to 7?",
        options: ["1/12", "1/6", "5/36", "1/4"],
        answer: 1,
        explanation: "There are 6 total pairs that sum to 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) out of $6 \\times 6 = 36$ outcomes. Probability = $6/36 = 1/6$."
      },
      {
        id: 504,
        question: "A merchant buys an item for $80 and sells it for $100. What is the percentage profit?",
        options: ["20%", "25%", "15%", "30%"],
        answer: 1,
        explanation: "Profit = $100 - 80 = $20. Percentage Profit = $(20 / 80) \\times 100\\% = 25\\%$."
      },
      {
        id: 505,
        question: "If 5 workers complete a project in 12 days, how many days will 3 workers take to complete the same project at the same rate?",
        options: ["15 days", "20 days", "18 days", "24 days"],
        answer: 1,
        explanation: "Total work = $5 \\times 12 = 60\\text{ worker-days}$. Time for 3 workers = $60 / 3 = 20\\text{ days}$."
      },
      {
        id: 506,
        question: "Choose the word that is an antonym for 'EPHEMERAL':",
        options: ["Transient", "Permanent", "Fleeting", "Momentary"],
        answer: 1,
        explanation: "'Ephemeral' means lasting for a short time; its antonym is 'Permanent'."
      },
      {
        id: 507,
        question: "If CODING is written as DPEJOH in a secret code, how is GUARD written in that code?",
        options: ["HVBSE", "HVBRE", "HTASE", "HVCSE"],
        answer: 0,
        explanation: "Each letter is shifted forward by +1 position in the alphabet: G->H, U->V, A->B, R->S, D->E -> HVBSE."
      },
      {
        id: 508,
        question: "The average of 5 numbers is 20. If one number is excluded, the average becomes 18. What is the excluded number?",
        options: ["22", "28", "25", "30"],
        answer: 1,
        explanation: "Sum of 5 numbers = $5 \\times 20 = 100$. Sum of remaining 4 numbers = $4 \\times 18 = 72$. Excluded number = $100 - 72 = 28$."
      }
    ]
  },
  {
    id: "cloud-devops",
    categoryId: "cloud",
    category: "Cloud Computing",
    title: "AWS & Serverless Architecture",
    description: "Explore cloud fundamentals, IaaS vs PaaS vs SaaS, IAM roles, Docker containerization, and AWS Lambda.",
    difficulty: "Medium",
    duration: 10,
    totalQuestions: 8,
    questions: [
      {
        id: 601,
        question: "Which cloud service model provides virtualized computing infrastructure over the internet (e.g., EC2, GCP Compute Engine)?",
        options: ["PaaS", "IaaS", "SaaS", "FaaS"],
        answer: 1,
        explanation: "IaaS (Infrastructure as a Service) provides fundamental compute, storage, and networking resources on demand."
      },
      {
        id: 602,
        question: "In AWS IAM, what should be attached to EC2 instances or Lambda functions to grant them temporary AWS credentials securely?",
        options: ["IAM User Access Keys", "IAM Role", "Root Password", "Security Group Rule"],
        answer: 1,
        explanation: "IAM Roles allow resources to request temporary security credentials dynamically without hardcoding secret keys."
      },
      {
        id: 603,
        question: "What is a 'Cold Start' in serverless computing (e.g., AWS Lambda)?",
        options: [
          "Restarting a physical server hardware node",
          "The initialization delay when a serverless function is invoked after being inactive or scaling up new container instances",
          "Failure of a database connection due to low traffic",
          "Deploying code without running unit tests"
        ],
        answer: 1,
        explanation: "Cold start refers to the execution latency incurred when a cloud provider initializes a new container instance to handle an incoming invocation."
      },
      {
        id: 604,
        question: "What is the primary difference between a Docker container and a Virtual Machine (VM)?",
        options: [
          "Containers include a full hypervisor and dedicated OS kernel; VMs do not",
          "Containers share the host operating system kernel and are lightweight; VMs run full guest OS instances on hypervisors",
          "VMs execute faster than containers",
          "Containers can only run Linux apps; VMs can only run Windows"
        ],
        answer: 1,
        explanation: "Containers virtualize at the OS level, sharing the host OS kernel, making them significantly faster and lighter than hypervisor-based VMs."
      },
      {
        id: 605,
        question: "Which AWS storage service provides object storage with 99.999999999% (11 9s) of durability?",
        options: ["AWS EBS", "AWS S3", "AWS EFS", "AWS Glacier"],
        answer: 1,
        explanation: "AWS S3 (Simple Storage Service) is engineered for 99.999999999% durability across multiple availability zones."
      },
      {
        id: 606,
        question: "What does the Cloud Infrastructure concept of 'Auto Scaling' achieve?",
        options: [
          "Automatically upgrades application source code",
          "Dynamically adjusts compute capacity up or down based on incoming traffic demand patterns",
          "Encrypts all data at rest automatically",
          "Generates automated SSL certificates"
        ],
        answer: 1,
        explanation: "Auto Scaling maintains application availability and optimizes cost by automatically adding or removing server capacity based on conditions like CPU utilization."
      },
      {
        id: 607,
        question: "In DevOps, what does CI/CD stand for?",
        options: [
          "Code Inspection & Continuous Deployment",
          "Continuous Integration & Continuous Delivery/Deployment",
          "Cloud Infrastructure & Cloud Distribution",
          "Centralized Operations & Controlled Delivery"
        ],
        answer: 1,
        explanation: "CI/CD stands for Continuous Integration (frequent code integration and automated testing) and Continuous Delivery/Deployment."
      },
      {
        id: 608,
        question: "What is the function of a Reverse Proxy (such as Nginx or AWS ALB)?",
        options: [
          "Stores user passwords safely",
          "Sits in front of backend servers to forward client requests, handle load balancing, and terminate SSL",
          "Recompiles frontend JavaScript code on the fly",
          "Acts as a physical router inside local Wi-Fi networks"
        ],
        answer: 1,
        explanation: "A reverse proxy handles load balancing, SSL termination, caching, and forwards client requests to backend application servers."
      }
    ]
  },
  {
    id: "cs-fundamentals",
    categoryId: "cs",
    category: "Computer Science",
    title: "Data Structures, Algorithms & OS",
    description: "Deep dive into Big-O complexity, binary search trees, operating system processes, threads, and SQL JOINs.",
    difficulty: "Hard",
    duration: 15,
    totalQuestions: 8,
    questions: [
      {
        id: 701,
        question: "What is the worst-case time complexity of QuickSort algorithm?",
        options: ["O(n log n)", "O(n²)", "O(n)", "O(2ⁿ)"],
        answer: 1,
        explanation: "When the pivot chosen is consistently the smallest or largest element (e.g. sorted array without random pivot), QuickSort degrades to $O(n^2)$."
      },
      {
        id: 702,
        question: "Which data structure follows the LIFO (Last In, First Out) principle?",
        options: ["Queue", "Stack", "Heap", "Linked List"],
        answer: 1,
        explanation: "A Stack pushes and pops elements from the top, adhering to Last In, First Out (LIFO)."
      },
      {
        id: 703,
        question: "In Relational Database systems, which SQL JOIN returns all rows from the left table and matched rows from the right table?",
        options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
        answer: 1,
        explanation: "LEFT JOIN (or LEFT OUTER JOIN) returns all records from the left table, and matching records from the right table (with NULLs for non-matches)."
      },
      {
        id: 704,
        question: "What condition causes a Deadlock in an Operating System?",
        options: [
          "When a CPU runs out of RAM",
          "When two or more processes are blocked indefinitely, each holding a resource that the other requires",
          "When an infinite loop occurs in application code",
          "When a network packet is dropped"
        ],
        answer: 1,
        explanation: "Deadlock occurs when processes hold resources and wait for others in a circular dependency chain."
      },
      {
        id: 705,
        question: "What is the average time complexity of looking up a key in a well-balanced Hash Table?",
        options: ["O(log n)", "O(1)", "O(n)", "O(n log n)"],
        answer: 1,
        explanation: "Direct hash addressing provides $O(1)$ constant average time complexity for insertions, lookups, and deletions."
      },
      {
        id: 706,
        question: "Which OSI network layer protocol is TCP (Transmission Control Protocol)?",
        options: ["Network Layer (Layer 3)", "Transport Layer (Layer 4)", "Application Layer (Layer 7)", "Data Link Layer (Layer 2)"],
        answer: 1,
        explanation: "TCP operates at Layer 4 (Transport Layer), providing reliable, connection-oriented data transmission."
      },
      {
        id: 707,
        question: "In a Binary Search Tree (BST), what traversal order visits nodes in ascending sorted order?",
        options: ["Pre-order traversal", "In-order traversal", "Post-order traversal", "Level-order traversal"],
        answer: 1,
        explanation: "In-order traversal (Left child -> Current node -> Right child) visits BST keys in non-decreasing sorted order."
      },
      {
        id: 708,
        question: "What is Virtual Memory in modern Operating Systems?",
        options: [
          "RAM mounted inside a GPU card",
          "A memory management technique that uses secondary disk storage to extend physical RAM transparently",
          "Cloud backup space for user files",
          "Cache memory built directly inside CPU registers"
        ],
        answer: 1,
        explanation: "Virtual memory maps virtual addresses to physical RAM and page files on disk, enabling processes to run even if their memory footprint exceeds physical RAM."
      }
    ]
  }
];

export const getCustomQuizzes = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem('quizguard_custom_quizzes_v1');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error reading custom quizzes:', e);
    return [];
  }
};

export const getQuizzesList = () => {
  return [...STATIC_QUIZZES, ...getCustomQuizzes()];
};

export const getQuizById = (id) => {
  return getQuizzesList().find(q => q.id === id) || null;
};

export const getQuizzesByCategory = (catId) => {
  return getQuizzesList().filter(q => q.categoryId === catId);
};
