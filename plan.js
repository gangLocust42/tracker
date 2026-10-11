/*
 * The 17-week plan. Edit freely.
 * Item syntax:  "Problem name@leetcode-slug"  -> links to LeetCode
 *               "Anything else"                -> links to a Google search
 * Each week = 5 weekday units (1.5h) + a Saturday unit + a Sunday unit (4-5h each).
 */
const PLAN_START = '2026-10-12';

const PLAN_WEEKS = [
  { // W1
    topic: 'Recursion basics',
    days: [
      ['Call stack & base cases', 'Print name N times (recursion)', 'Print 1 to N (recursion)', 'Print N to 1 (recursion)'],
      ['Parameterised vs functional recursion', 'Sum of first N numbers (recursion)', 'Factorial (recursion)', 'Reverse an array (recursion)'],
      ['Simple recursion problems', 'Valid Palindrome@valid-palindrome', 'Fibonacci Number@fibonacci-number', 'Power of Two@power-of-two'],
      ['Fast power', 'Pow(x, n)@powx-n', 'Count Good Numbers@count-good-numbers'],
      ['Recursion on linked lists', 'Reverse Linked List (recursive)@reverse-linked-list', 'Merge Two Sorted Lists (recursive)@merge-two-sorted-lists'],
    ],
    sat: ['Sort a stack using recursion', 'Reverse a stack using recursion', 'K-th Symbol in Grammar@k-th-symbol-in-grammar'],
    sd: ['Fundamentals', 'Client–server model & request lifecycle', 'Latency vs throughput, p50/p99', 'Availability, consistency & CAP theorem', 'Write a 1-page summary in your notes'],
    sun: ['URL Shortener · kickoff', 'Write functional & non-functional requirements', 'API design: POST /shorten, GET /:code', 'DB schema (links, users, clicks)', 'Init NestJS repo + push to GitHub'],
  },
  { // W2
    topic: 'Recursion · subsequences',
    days: [
      ['Generate patterns', 'Generate all binary strings without consecutive 1s', 'Generate Parentheses@generate-parentheses'],
      ['Pick / not-pick', 'Print all subsequences of an array', 'Subsets@subsets'],
      ['Duplicates handling', 'Subsets II@subsets-ii', 'Subset Sums (GfG)'],
      ['Counting subsequences', 'Count subsequences with sum K', 'Combination Sum@combination-sum'],
      ['Review + one more', 'Combination Sum II@combination-sum-ii', 'Re-solve 2 problems you got stuck on this week'],
    ],
    sat: ['Combination Sum III@combination-sum-iii', 'Letter Combinations of a Phone Number@letter-combinations-of-a-phone-number', 'Palindrome Partitioning@palindrome-partitioning'],
    sd: ['Scaling', 'Vertical vs horizontal scaling', 'Load balancers: L4 vs L7, algorithms', 'Stateless services & session handling'],
    sun: ['URL Shortener · core', 'Base62 encoding + ID strategy (counter vs hash vs random)', 'Implement POST /shorten', 'Implement redirect (301 vs 302)', 'Unit tests for encoder'],
  },
  { // W3
    topic: 'Backtracking',
    days: [
      ['Permutations', 'Permutations@permutations', 'Permutations II@permutations-ii'],
      ['Grid backtracking', 'Word Search@word-search', 'Rat in a Maze (GfG)'],
      ['N-Queens', 'N-Queens@n-queens', 'N-Queens II@n-queens-ii'],
      ['Sudoku', 'Sudoku Solver@sudoku-solver'],
      ['Harder backtracking', 'M-Coloring Problem (GfG)', 'Expression Add Operators@expression-add-operators'],
    ],
    sat: ['Word Break (recursive first)@word-break', 'Restore IP Addresses@restore-ip-addresses', 'Permutation Sequence@permutation-sequence'],
    sd: ['Caching', 'Why cache + where (client, CDN, server, DB)', 'Cache-aside vs write-through vs write-back', 'Eviction: LRU, LFU, TTL', 'CDN basics'],
    sun: ['URL Shortener · caching', 'Add Redis cache for redirects', 'Link expiry / TTL', 'Measure redirect latency before vs after'],
  },
  { // W4
    topic: 'DP · 1D',
    days: [
      ['Intro: memo → tabulation → space opt', 'Fibonacci all 3 ways', 'Climbing Stairs@climbing-stairs'],
      ['Frog jumps', 'Frog Jump (CodeStudio)', 'Frog Jump with K distances'],
      ['Non-adjacent picks', 'House Robber@house-robber', 'Min Cost Climbing Stairs@min-cost-climbing-stairs'],
      ['Variations', 'House Robber II@house-robber-ii', 'Decode Ways@decode-ways'],
      ['2D state intro', "Ninja's Training (CodeStudio)", 'Re-solve 1 problem from this week without notes'],
    ],
    sat: ['Jump Game@jump-game', 'Jump Game II@jump-game-ii', 'Delete and Earn@delete-and-earn'],
    sd: ['Databases', 'SQL vs NoSQL: when to pick which', 'Indexing (B-tree) & query plans', 'Replication: leader-follower, read replicas'],
    sun: ['URL Shortener · hardening', 'Custom aliases + input validation', 'Rate limiting per IP with Redis', 'Error handling & logging'],
  },
  { // W5
    topic: 'DP · grids',
    days: [
      ['Grid paths', 'Unique Paths@unique-paths', 'Unique Paths II@unique-paths-ii'],
      ['Min path', 'Minimum Path Sum@minimum-path-sum'],
      ['Variable end', 'Triangle@triangle'],
      ['Variable start & end', 'Minimum Falling Path Sum@minimum-falling-path-sum'],
      ['Squares', 'Maximal Square@maximal-square', 'Re-solve 1 grid problem with space optimisation'],
    ],
    sat: ['Cherry Pickup II (3D DP)@cherry-pickup-ii', 'Dungeon Game@dungeon-game'],
    sd: ['Partitioning', 'Sharding strategies (range, hash, directory)', 'Consistent hashing', 'Hot partitions & resharding'],
    sun: ['URL Shortener · analytics', 'Publish click events to a queue (BullMQ)', 'Worker that aggregates clicks', 'Stats endpoint per link'],
  },
  { // W6
    topic: 'DP · subsequences & knapsack',
    days: [
      ['Subset sum', 'Subset Sum equal to K (GfG)', 'Partition Equal Subset Sum@partition-equal-subset-sum'],
      ['Counting subsets', 'Partition array into two subsets with min absolute difference', 'Count subsets with sum K'],
      ['Knapsack', '0/1 Knapsack (GfG)', 'Coin Change@coin-change'],
      ['Ways & signs', 'Coin Change II@coin-change-ii', 'Target Sum@target-sum'],
      ['Unbounded', 'Unbounded Knapsack (GfG)', 'Rod Cutting (GfG)'],
    ],
    sat: ['Last Stone Weight II@last-stone-weight-ii', 'Perfect Squares@perfect-squares', 'Ones and Zeroes@ones-and-zeroes'],
    sd: ['Async processing', 'Message queues & why', 'Kafka: topics, partitions, consumer groups', 'Pub/sub vs queue, at-least-once delivery'],
    sun: ['URL Shortener · users', 'JWT auth', 'Dashboard: my links + click counts', 'Delete / disable a link'],
  },
  { // W7
    topic: 'DP · strings',
    days: [
      ['LCS', 'Longest Common Subsequence@longest-common-subsequence', 'Print the LCS string'],
      ['LCS variants', 'Longest Common Substring (GfG)', 'Longest Palindromic Subsequence@longest-palindromic-subsequence'],
      ['Insert / delete', 'Minimum Insertion Steps to Make a String Palindrome@minimum-insertion-steps-to-make-a-string-palindrome', 'Delete Operation for Two Strings@delete-operation-for-two-strings'],
      ['Supersequence & counting', 'Shortest Common Supersequence@shortest-common-supersequence', 'Distinct Subsequences@distinct-subsequences'],
      ['Edit distance', 'Edit Distance@edit-distance'],
    ],
    sat: ['Wildcard Matching@wildcard-matching', 'Regular Expression Matching (attempt)@regular-expression-matching'],
    sd: ['API design', 'REST design, pagination, versioning', 'Rate limiting: token bucket, sliding window', 'Idempotency keys'],
    sun: ['URL Shortener · ship it ✅', 'Docker compose (app + Redis + DB)', 'Deploy on AWS', 'Load test with k6, note numbers', 'README with architecture diagram'],
  },
  { // W8
    topic: 'DP · stocks, LIS, partitions',
    days: [
      ['Stocks I/II', 'Best Time to Buy and Sell Stock@best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock II@best-time-to-buy-and-sell-stock-ii'],
      ['Stocks III/IV', 'Best Time to Buy and Sell Stock III@best-time-to-buy-and-sell-stock-iii', 'Best Time to Buy and Sell Stock IV@best-time-to-buy-and-sell-stock-iv'],
      ['Stocks with rules', 'Stock with Cooldown@best-time-to-buy-and-sell-stock-with-cooldown', 'Stock with Transaction Fee@best-time-to-buy-and-sell-stock-with-transaction-fee'],
      ['LIS', 'Longest Increasing Subsequence@longest-increasing-subsequence', 'Largest Divisible Subset@largest-divisible-subset'],
      ['LIS variants', 'Number of Longest Increasing Subsequence@number-of-longest-increasing-subsequence', 'Longest String Chain@longest-string-chain'],
    ],
    sat: ['Matrix Chain Multiplication (GfG)', 'Minimum Cost to Cut a Stick@minimum-cost-to-cut-a-stick', 'Burst Balloons@burst-balloons'],
    sd: ['Case study', 'Design a URL shortener end-to-end (QPS, storage estimates)', 'ID generation, caching, DB, analytics', 'Compare with what you built — note gaps'],
    sun: ['AI Project · kickoff', 'Pick: Resume↔JD analyzer / Docs RAG / Log analyzer', 'Write scope + success criteria', 'Architecture + stack', 'Init repo'],
  },
  { // W9
    topic: 'Arrays, hashing, prefix sums, sorting',
    days: [
      ['Sorting algorithms', 'Implement merge sort', 'Implement quick sort', 'Sort Colors@sort-colors'],
      ['Hashing', 'Two Sum@two-sum', 'Group Anagrams@group-anagrams', 'Longest Consecutive Sequence@longest-consecutive-sequence'],
      ['Prefix sums', 'Subarray Sum Equals K@subarray-sum-equals-k', 'Product of Array Except Self@product-of-array-except-self', 'Contiguous Array@contiguous-array'],
      ['Kadane & array tricks', 'Maximum Subarray@maximum-subarray', 'Majority Element II@majority-element-ii', 'Next Permutation@next-permutation'],
      ['Merge-sort applications', 'Count Inversions (GfG)', 'Reverse Pairs@reverse-pairs'],
    ],
    sat: ['Set Matrix Zeroes@set-matrix-zeroes', 'Rotate Image@rotate-image', 'Spiral Matrix@spiral-matrix', 'DP re-solve (untimed): Coin Change@coin-change', 'DP re-solve (untimed): Edit Distance@edit-distance'],
    sd: ['Case studies', 'Design a distributed rate limiter', 'Design a notification system'],
    sun: ['AI Project · data pipeline', 'Input parsing (PDF/text)', 'Chunking strategy', 'Embeddings + store (pgvector)'],
  },
  { // W10
    topic: 'Strings & linked lists',
    days: [
      ['String basics', 'Valid Anagram@valid-anagram', 'Longest Common Prefix@longest-common-prefix', 'String to Integer (atoi)@string-to-integer-atoi'],
      ['String matching (KMP / rolling hash)', 'KMP + LPS array notes', 'Find the Index of the First Occurrence in a String@find-the-index-of-the-first-occurrence-in-a-string', 'Repeated String Match@repeated-string-match'],
      ['Linked list basics', 'Middle of the Linked List@middle-of-the-linked-list', 'Linked List Cycle II@linked-list-cycle-ii', 'Remove Nth Node From End of List@remove-nth-node-from-end-of-list'],
      ['Linked list patterns', 'Palindrome Linked List@palindrome-linked-list', 'Intersection of Two Linked Lists@intersection-of-two-linked-lists', 'Add Two Numbers@add-two-numbers'],
      ['Linked list hard', 'Reverse Nodes in k-Group@reverse-nodes-in-k-group', 'Copy List with Random Pointer@copy-list-with-random-pointer'],
    ],
    sat: ['Sort List@sort-list', 'Rotate List@rotate-list', 'Longest Palindromic Substring@longest-palindromic-substring', 'Z-function notes + Shortest Palindrome@shortest-palindrome'],
    sd: ['Case study', 'Design a chat app (WhatsApp)', 'WebSockets, presence, delivery receipts', 'Message storage & fan-out'],
    sun: ['AI Project · LLM layer', 'Prompt design + structured output', 'Streaming responses', 'Basic API endpoints'],
  },
  { // W11
    topic: 'Binary trees',
    days: [
      ['Traversals', 'Binary Tree Inorder Traversal@binary-tree-inorder-traversal', 'Binary Tree Preorder Traversal@binary-tree-preorder-traversal', 'Binary Tree Postorder Traversal@binary-tree-postorder-traversal'],
      ['BFS & depth', 'Binary Tree Level Order Traversal@binary-tree-level-order-traversal', 'Maximum Depth of Binary Tree@maximum-depth-of-binary-tree', 'Binary Tree Zigzag Level Order Traversal@binary-tree-zigzag-level-order-traversal'],
      ['Height tricks', 'Diameter of Binary Tree@diameter-of-binary-tree', 'Balanced Binary Tree@balanced-binary-tree', 'Symmetric Tree@symmetric-tree'],
      ['Views', 'Binary Tree Right Side View@binary-tree-right-side-view', 'Vertical Order Traversal@vertical-order-traversal-of-a-binary-tree', 'Boundary Traversal of Binary Tree (GfG)'],
      ['LCA & path sums', 'Lowest Common Ancestor of a Binary Tree@lowest-common-ancestor-of-a-binary-tree', 'Binary Tree Maximum Path Sum@binary-tree-maximum-path-sum'],
    ],
    sat: ['Construct Binary Tree from Preorder and Inorder@construct-binary-tree-from-preorder-and-inorder-traversal', 'Serialize and Deserialize Binary Tree@serialize-and-deserialize-binary-tree', 'All Nodes Distance K@all-nodes-distance-k-in-binary-tree', 'Flatten Binary Tree to Linked List (Morris idea)@flatten-binary-tree-to-linked-list'],
    sd: ['Case study', 'Design a news feed', 'Fan-out on write vs read', 'Ranking & caching the feed'],
    sun: ['AI Project · quality', 'Better context / retrieval', 'Show sources / citations', 'Guardrails for bad input'],
  },
  { // W12
    topic: 'BST, tries, DP on trees',
    days: [
      ['BST basics', 'Validate Binary Search Tree@validate-binary-search-tree', 'Kth Smallest Element in a BST@kth-smallest-element-in-a-bst', 'Search in a BST@search-in-a-binary-search-tree'],
      ['BST operations', 'Lowest Common Ancestor of a BST@lowest-common-ancestor-of-a-binary-search-tree', 'Insert into a BST@insert-into-a-binary-search-tree', 'Delete Node in a BST@delete-node-in-a-bst'],
      ['Trie', 'Implement Trie (Prefix Tree)@implement-trie-prefix-tree', 'Design Add and Search Words Data Structure@design-add-and-search-words-data-structure'],
      ['Trie on bits', 'Maximum XOR of Two Numbers in an Array@maximum-xor-of-two-numbers-in-an-array', 'Longest Word in Dictionary@longest-word-in-dictionary'],
      ['DP on trees', 'House Robber III@house-robber-iii', 'Binary Tree Cameras@binary-tree-cameras'],
    ],
    sat: ['Word Search II@word-search-ii', 'Binary Search Tree Iterator@binary-search-tree-iterator', 'Recover Binary Search Tree@recover-binary-search-tree', 'Two Sum IV - Input is a BST@two-sum-iv-input-is-a-bst'],
    sd: ['Case study', 'Design YouTube / file storage', 'Chunked upload, blob storage, transcoding', 'CDN delivery'],
    sun: ['AI Project · frontend', 'UI for upload + results', 'Loading & streaming states', 'Mobile-friendly layout'],
  },
  { // W13
    topic: 'Graphs · traversal & topo sort',
    days: [
      ['Representation + DFS/BFS', 'Number of Provinces@number-of-provinces', 'Clone Graph@clone-graph'],
      ['Grid graphs', 'Number of Islands@number-of-islands', 'Flood Fill@flood-fill', 'Max Area of Island@max-area-of-island'],
      ['Multi-source BFS', 'Rotting Oranges@rotting-oranges', '01 Matrix@01-matrix', 'Surrounded Regions@surrounded-regions'],
      ['Cycles & bipartite', 'Detect cycle in an undirected graph (GfG)', 'Detect cycle in a directed graph (GfG)', 'Is Graph Bipartite?@is-graph-bipartite'],
      ['Topological sort', 'Course Schedule@course-schedule', 'Course Schedule II@course-schedule-ii', 'Alien Dictionary (GfG)'],
    ],
    sat: ['Word Ladder@word-ladder', 'Number of Enclaves@number-of-enclaves', 'Pacific Atlantic Water Flow@pacific-atlantic-water-flow', 'Find Eventual Safe States@find-eventual-safe-states'],
    sd: ['Case study', 'Design Uber / ride-sharing', 'Geo-indexing (geohash, quadtree)', 'Matching & location updates'],
    sun: ['AI Project · evals & cost', 'Small eval set + scoring', 'Log tokens, cost & latency', 'Cache repeated LLM calls'],
  },
  { // W14
    topic: 'Graphs · shortest paths, DSU, MST, advanced',
    days: [
      ['Dijkstra', 'Network Delay Time@network-delay-time', 'Path With Minimum Effort@path-with-minimum-effort'],
      ['Bellman-Ford', 'Cheapest Flights Within K Stops@cheapest-flights-within-k-stops', 'Bellman-Ford (GfG)'],
      ['Floyd-Warshall', 'Floyd Warshall (GfG)', 'Find the City With the Smallest Number of Neighbors@find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance'],
      ['Disjoint Set Union', 'DSU notes: union by rank + path compression', 'Number of Operations to Make Network Connected@number-of-operations-to-make-network-connected', 'Accounts Merge@accounts-merge'],
      ['Minimum spanning tree', 'Min Cost to Connect All Points@min-cost-to-connect-all-points', 'Redundant Connection@redundant-connection'],
    ],
    sat: ['Strongly Connected Components – Kosaraju (GfG)', 'Critical Connections in a Network (bridges)@critical-connections-in-a-network', 'Swim in Rising Water@swim-in-rising-water'],
    sd: ['Case study', 'Design a payment system', 'Idempotency, ledger, reconciliation', 'Webhooks & retries'],
    sun: ['AI Project · ship it ✅', 'Deploy', 'Record a 2-min demo video', 'README with architecture diagram'],
  },
  { // W15
    topic: 'Binary search, two pointers, sliding window',
    days: [
      ['Binary search', 'Binary Search@binary-search', 'Search Insert Position@search-insert-position', 'Find First and Last Position of Element@find-first-and-last-position-of-element-in-sorted-array'],
      ['Rotated & peaks', 'Search in Rotated Sorted Array@search-in-rotated-sorted-array', 'Find Minimum in Rotated Sorted Array@find-minimum-in-rotated-sorted-array', 'Find Peak Element@find-peak-element'],
      ['Binary search on answer', 'Koko Eating Bananas@koko-eating-bananas', 'Capacity To Ship Packages Within D Days@capacity-to-ship-packages-within-d-days', 'Minimum Number of Days to Make m Bouquets@minimum-number-of-days-to-make-m-bouquets'],
      ['Two pointers', '3Sum@3sum', 'Container With Most Water@container-with-most-water', 'Trapping Rain Water@trapping-rain-water'],
      ['Sliding window', 'Longest Substring Without Repeating Characters@longest-substring-without-repeating-characters', 'Longest Repeating Character Replacement@longest-repeating-character-replacement', 'Fruit Into Baskets@fruit-into-baskets'],
    ],
    sat: ['Minimum Window Substring@minimum-window-substring', 'Sliding Window Maximum (deque)@sliding-window-maximum', 'Split Array Largest Sum@split-array-largest-sum', 'Median of Two Sorted Arrays@median-of-two-sorted-arrays'],
    sd: ['LLD', 'SOLID principles', 'Patterns: strategy, factory, observer', 'Design a parking lot (classes + code)'],
    sun: ['Career', 'Update resume with both projects + metrics', 'Clean up GitHub & LinkedIn', 'Shortlist 20 target companies'],
  },
  { // W16
    topic: 'Stacks, queues, heaps, greedy',
    days: [
      ['Stack & queue basics', 'Valid Parentheses@valid-parentheses', 'Min Stack@min-stack', 'Implement Queue using Stacks@implement-queue-using-stacks'],
      ['Monotonic stack', 'Next Greater Element II@next-greater-element-ii', 'Daily Temperatures@daily-temperatures', 'Asteroid Collision@asteroid-collision'],
      ['Histogram family + design', 'Largest Rectangle in Histogram@largest-rectangle-in-histogram', 'Maximal Rectangle@maximal-rectangle', 'LRU Cache@lru-cache'],
      ['Heaps', 'Kth Largest Element in an Array@kth-largest-element-in-an-array', 'Top K Frequent Elements@top-k-frequent-elements', 'Find Median from Data Stream@find-median-from-data-stream'],
      ['Greedy', 'Assign Cookies@assign-cookies', 'Gas Station@gas-station', 'Minimum Number of Arrows to Burst Balloons@minimum-number-of-arrows-to-burst-balloons'],
    ],
    sat: ['Merge k Sorted Lists@merge-k-sorted-lists', 'Task Scheduler@task-scheduler', 'Candy@candy', 'Valid Parenthesis String@valid-parenthesis-string', 'Timed mock: 2 mediums in 60 min (LeetCode virtual contest)'],
    sd: ['LLD', 'Design BookMyShow', 'Design Splitwise'],
    sun: ['Apply', 'Apply to 10+ roles', 'Practise 5-min walkthrough: URL shortener', 'Practise 5-min walkthrough: AI project'],
  },
  { // W17
    topic: 'Bits, math, intervals, segment tree, bitmask DP',
    days: [
      ['Bit manipulation', 'Single Number@single-number', 'Number of 1 Bits@number-of-1-bits', 'Counting Bits@counting-bits', 'Single Number II@single-number-ii'],
      ['Bits + math', 'Sum of Two Integers@sum-of-two-integers', 'Count Primes (sieve)@count-primes', 'GCD, modular arithmetic & fast pow notes'],
      ['Intervals', 'Merge Intervals@merge-intervals', 'Insert Interval@insert-interval', 'Non-overlapping Intervals@non-overlapping-intervals'],
      ['Segment tree / Fenwick tree', 'Range Sum Query - Mutable@range-sum-query-mutable', 'Count of Smaller Numbers After Self@count-of-smaller-numbers-after-self'],
      ['Bitmask DP', 'Partition to K Equal Sum Subsets@partition-to-k-equal-sum-subsets', 'Shortest Path Visiting All Nodes@shortest-path-visiting-all-nodes'],
    ],
    sat: ['Final DSA mock: 1 easy + 1 medium + 1 hard in 90 min', 'Go through your revision list (⚑) once'],
    sd: ['SD mocks', 'Full mock: design URL shortener (45 min)', 'Full mock: design chat app (45 min)'],
    sun: ['🎯 D-Day', 'Final review of notes', 'Send pending applications', 'Celebrate — you did it'],
  },
];

const SUNDAY_REVISION = ['Weekly revision', 'Re-solve 3 problems from this week from scratch', 'Flag anything you struggled with'];
