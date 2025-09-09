import type { CodingProblem } from '../types';
export const CODING_PROBLEMS: CodingProblem[] = [
  // Problem 1: Two Sum
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays & Hashing',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.
You may assume that each input would have **exactly one solution**, and you may not use the same element twice.
You can return the answer in any order.`,
    functionSignature: 'twoSum(nums, target)',
    starterCode: {
      javascript: 'function twoSum(nums, target) {\n  // Write your code here\n}',
      cpp: '#include <vector>\n#include <unordered_map>\n\nstd::vector<int> twoSum(std::vector<int>& nums, int target) {\n    // Write your code here\n    return {};\n}',
      c: '#include <stdio.h>\n#include <stdlib.h>\n\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize){\n    // Write your code here\n    *returnSize = 2;\n    int* result = (int*)malloc(2 * sizeof(int));\n    return result;\n}',
      python: '',
      java: ''
    },
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1], isPublic: true },
      { input: [[3, 2, 4], 6], expected: [1, 2], isPublic: true },
      { input: [[3, 3], 6], expected: [0, 1], isPublic: true },
      { input: [[-1, -3, 5, 90], 4], expected: [0, 2], isPublic: false },
    ],
  },
  // Problem 2: Valid Parentheses
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: 'Stack',
    description: `Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.
An input string is valid if:
1.  Open brackets must be closed by the same type of brackets.
2.  Open brackets must be closed in the correct order.
3.  Every close bracket has a corresponding open bracket of the same type.`,
    functionSignature: 'isValid(s)',
    starterCode: {
      javascript: 'function isValid(s) {\n  // Write your code here\n}',
      cpp: '#include <string>\n#include <stack>\n\nbool isValid(std::string s) {\n    // Write your code here\n    return false;\n}',
      c: '#include <stdio.h>\n#include <stdlib.h>\n#include <stdbool.h>\n\nbool isValid(char * s){\n    // Write your code here\n    return false;\n}',
      python: '',
      java: ''
    },
    testCases: [
      { input: ['()'], expected: true, isPublic: true },
      { input: ['()[]{}'], expected: true, isPublic: true },
      { input: ['(]'], expected: false, isPublic: true },
      { input: ['([)]'], expected: false, isPublic: false },
      { input: ['{[]}'], expected: true, isPublic: false },
    ],
  },
  // Problem 3: Merge Two Sorted Lists
  {
      id: 'merge-two-sorted-lists',
      title: 'Merge Two Sorted Lists',
      difficulty: 'Easy',
      topic: 'Linked List',
      description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.
Merge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists.
Return the head of the merged linked list.
A ListNode definition is provided for you in JavaScript:
\`\`\`
function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val)
    this.next = (next===undefined ? null : next)
}
\`\`\``,
      functionSignature: 'mergeTwoLists(list1, list2)',
      starterCode: {
        javascript: '\nfunction mergeTwoLists(list1, list2) {\n  // Write your code here\n}',
        cpp: '// Definition for singly-linked list.\n// struct ListNode {\n//     int val;\n//     ListNode *next;\n//     ListNode() : val(0), next(nullptr) {}\n//     ListNode(int x) : val(x), next(nullptr) {}\n//     ListNode(int x, ListNode *next) : val(x), next(next) {}\n// };\n\nListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n    // Write your code here\n    return nullptr;\n}',
        c: '// Definition for singly-linked list.\n// struct ListNode {\n//     int val;\n//     struct ListNode *next;\n// };\n\nstruct ListNode* mergeTwoLists(struct ListNode* list1, struct ListNode* list2){\n    // Write your code here\n    return NULL;\n}',
        python: '',
        java: ''
      },
      testCases: [
          { input: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4], isPublic: true },
          { input: [[], []], expected: [], isPublic: true },
          { input: [[], [0]], expected: [0], isPublic: false },
      ],
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    topic: 'Arrays & DP',
    description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
    functionSignature: 'maxSubArray(nums)',
    starterCode: {
        javascript: 'function maxSubArray(nums) {\n  // Write your code here\n}',
        cpp: '#include <vector>\n#include <algorithm>\n\nint maxSubArray(std::vector<int>& nums) {\n    // Write your code here\n    return 0;\n}',
        c: '#include <stdio.h>\n\nint maxSubArray(int* nums, int numsSize){\n    // Write your code here\n    return 0;\n}',
        python: '',
        java: ''
    },
    testCases: [
        { input: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6, isPublic: true },
        { input: [[1]], expected: 1, isPublic: true },
        { input: [[5,4,-1,7,8]], expected: 23, isPublic: false },
    ],
  },
  {
      id: 'contains-duplicate',
      title: 'Contains Duplicate',
      difficulty: 'Easy',
      topic: 'Arrays & Hashing',
      description: 'Given an integer array `nums`, return `true` if any value appears **at least twice** in the array, and return `false` if every element is distinct.',
      functionSignature: 'containsDuplicate(nums)',
      starterCode: {
          javascript: 'function containsDuplicate(nums) {\n  // Write your code here\n}',
          cpp: '#include <vector>\n#include <unordered_set>\n\nbool containsDuplicate(std::vector<int>& nums) {\n    // Write your code here\n    return false;\n}',
          c: '#include <stdio.h>\n#include <stdbool.h>\n\nbool containsDuplicate(int* nums, int numsSize){\n    // Write your code here\n    return false;\n}',
          python: '',
          java: ''
      },
      testCases: [
          { input: [[1,2,3,1]], expected: true, isPublic: true },
          { input: [[1,2,3,4]], expected: false, isPublic: true },
          { input: [[1,1,1,3,3,4,3,2,4,2]], expected: true, isPublic: false },
      ],
  },
  {
      id: 'valid-anagram',
      title: 'Valid Anagram',
      difficulty: 'Easy',
      topic: 'String & Hashing',
      description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\nAn **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
      functionSignature: 'isAnagram(s, t)',
      starterCode: {
          javascript: 'function isAnagram(s, t) {\n  // Write your code here\n}',
          cpp: '#include <string>\n#include <unordered_map>\n\nbool isAnagram(std::string s, std::string t) {\n    // Write your code here\n    return false;\n}',
          c: '#include <stdio.h>\n#include <string.h>\n#include <stdbool.h>\n\nbool isAnagram(char * s, char * t){\n    // Write your code here\n    return false;\n}',
          python: '',
          java: ''
      },
      testCases: [
          { input: ['anagram', 'nagaram'], expected: true, isPublic: true },
          { input: ['rat', 'car'], expected: false, isPublic: true },
      ]
  },
  {
      id: 'invert-binary-tree',
      title: 'Invert Binary Tree',
      difficulty: 'Easy',
      topic: 'Trees',
      description: 'Given the `root` of a binary tree, invert the tree, and return its root.\n\nA TreeNode definition is provided for you.',
      functionSignature: 'invertTree(root)',
      starterCode: {
          javascript: '\nfunction invertTree(root) {\n  // Write your code here\n};',
          cpp: '// Definition for a binary tree node.\n// struct TreeNode {\n//     int val;\n//     TreeNode *left;\n//     TreeNode *right;\n// };\n\nTreeNode* invertTree(TreeNode* root) {\n    // Write your code here\n    return root;\n}',
          c: '// Definition for a binary tree node.\n// struct TreeNode {\n//     int val;\n//     struct TreeNode *left;\n//     struct TreeNode *right;\n// };\n\nstruct TreeNode* invertTree(struct TreeNode* root){\n    // Write your code here\n    return root;\n}',
          python: '',
          java: ''
      },
      testCases: [
          { input: [[4,2,7,1,3,6,9]], expected: [4,7,2,9,6,3,1], isPublic: true },
          { input: [[2,1,3]], expected: [2,3,1], isPublic: false },
      ],
  },
  {
      id: 'binary-search',
      title: 'Binary Search',
      difficulty: 'Easy',
      topic: 'Searching',
      description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return -1.\n\nYou must write an algorithm with `O(log n)` runtime complexity.',
      functionSignature: 'search(nums, target)',
      starterCode: {
          javascript: 'function search(nums, target) {\n  // Write your code here\n}',
          cpp: '#include <vector>\n\nint search(std::vector<int>& nums, int target) {\n    // Write your code here\n    return -1;\n}',
          c: '#include <stdio.h>\n\nint search(int* nums, int numsSize, int target){\n    // Write your code here\n    return -1;\n}',
          python: '',
          java: ''
      },
      testCases: [
          { input: [[-1,0,3,5,9,12], 9], expected: 4, isPublic: true },
          { input: [[-1,0,3,5,9,12], 2], expected: -1, isPublic: true },
      ],
  },
  {
      id: 'reverse-linked-list',
      title: 'Reverse Linked List',
      difficulty: 'Easy',
      topic: 'Linked List',
      description: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list.',
      functionSignature: 'reverseList(head)',
      starterCode: {
          javascript: '\nfunction reverseList(head) {\n  // Write your code here\n};',
          cpp: '// Definition for singly-linked list.\n// struct ListNode {\n//     int val;\n//     ListNode *next;\n// };\n\nListNode* reverseList(ListNode* head) {\n    // Write your code here\n    return head;\n}',
          c: '// Definition for singly-linked list.\n// struct ListNode {\n//     int val;\n//     struct ListNode *next;\n// };\n\nstruct ListNode* reverseList(struct ListNode* head){\n    // Write your code here\n    return head;\n}',
          python: '',
          java: ''
      },
      testCases: [
          { input: [[1,2,3,4,5]], expected: [5,4,3,2,1], isPublic: true },
          { input: [[1,2]], expected: [2,1], isPublic: false },
      ],
  },
  {
      id: 'longest-substring-no-repeats',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'Medium',
      topic: 'String & Sliding Window',
      description: 'Given a string `s`, find the length of the **longest substring** without repeating characters.',
      functionSignature: 'lengthOfLongestSubstring(s)',
      starterCode: {
          javascript: 'function lengthOfLongestSubstring(s) {\n  // Write your code here\n}',
          cpp: '#include <string>\n#include <unordered_set>\n\nint lengthOfLongestSubstring(std::string s) {\n    // Write your code here\n    return 0;\n}',
          c: '#include <string.h>\n\nint lengthOfLongestSubstring(char * s){\n    // Write your code here\n    return 0;\n}',
          python: '',
          java: ''
      },
      testCases: [
          { input: ['abcabcbb'], expected: 3, isPublic: true },
          { input: ['bbbbb'], expected: 1, isPublic: true },
          { input: ['pwwkew'], expected: 3, isPublic: true },
      ],
  },
];
