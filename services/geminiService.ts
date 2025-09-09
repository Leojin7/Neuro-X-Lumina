import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { Question, Quiz, CognitiveStateAnalysis, QuizResult, FocusSession, DailyMission, ChatMessage, PortfolioProject, TimelineEvent, Skill, GeneratedResumeContent, AgentExecutionResult, SleepEntry, DailyCheckin, FocusStory, AudioEnvironmentAnalysis, NotebookScript, NotebookSlide } from '../types';
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
// Use a broadly available model by default to avoid 403 due to access restrictions
const ASSISTANT_MODEL = 'gemini-1.5-flash';
const IMAGE_GEN_MODEL = 'imagen-3.0-generate-002';
// Feature flags (default off) to avoid calling restricted endpoints in local dev
const ENABLE_IMAGE_GEN = import.meta.env.VITE_ENABLE_IMAGE_GEN === 'true';
const ENABLE_SEARCH_TOOL = import.meta.env.VITE_ENABLE_SEARCH_TOOL === 'true';
// Streaming can be blocked; default to disabled unless explicitly enabled
const ENABLE_STREAM = import.meta.env.VITE_ENABLE_STREAM === 'true';
const ASSISTANT_SYSTEM_INSTRUCTION = "You are Cerebrum AI, an expert cognitive coach and learning strategist within the NeuroLearn ecosystem. Your personality is that of a wise, encouraging mentor. Your purpose is to help users optimize their learning, enhance focus, and cultivate mental well-being. Your responses should be insightful, empathetic, and actionable, guiding users toward peak performance. Avoid generic AI phrases. Use markdown for clarity and structure. When a user uploads an image, analyze it in the context of their prompt.";
export const getAssistantStream = async (messages: ChatMessage[]): Promise<AsyncGenerator<GenerateContentResponse>> => {
    const lastMessage = messages[messages.length - 1];
    const history = messages.slice(0, -1);
    const geminiHistory = history.map(msg => {
        const parts: any[] = [];
        if (msg.content) parts.push({ text: msg.content });
        if (msg.image) {
            parts.push({
                inlineData: {
                    mimeType: msg.image.mimeType,
                    data: msg.image.data,
                },
            });
        }
        return {
            role: msg.role === 'ai' ? 'model' : 'user',
            parts,
        };
    }).filter(msg => msg.parts.length > 0);
    const chat = ai.chats.create({
        model: ASSISTANT_MODEL,
        config: {
            systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION,
        },
        history: geminiHistory,
    });
    const currentMessageParts: any[] = [];
    if (lastMessage.content) currentMessageParts.push({ text: lastMessage.content });
    if (lastMessage.image) {
        currentMessageParts.push({
            inlineData: {
                mimeType: lastMessage.image.mimeType,
                data: lastMessage.image.data,
            }
        });
    }
    // Helper: create a single-chunk async generator from text
    async function* singleChunk(text: string): AsyncGenerator<GenerateContentResponse> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        yield { text } as any;
    }
    // If streaming disabled, do non-stream request compatible with caller
    if (!ENABLE_STREAM) {
        const nonStreamResponse = await ai.models.generateContent({
            model: ASSISTANT_MODEL,
            contents: [
                ...geminiHistory,
                { role: 'user', parts: currentMessageParts }
            ] as any,
        });
        return singleChunk(nonStreamResponse.text);
    }
    // Try streaming; on failure (e.g., 403), fall back to non-stream
    try {
        const response = await chat.sendMessageStream({ message: currentMessageParts });
        return response;
    } catch (err) {
        console.warn('Streaming failed, falling back to non-stream.', err);
        const nonStreamResponse = await ai.models.generateContent({
            model: ASSISTANT_MODEL,
            contents: [
                ...geminiHistory,
                { role: 'user', parts: currentMessageParts }
            ] as any,
        });
        return singleChunk(nonStreamResponse.text);
    }
};
export const processAssistantRequest = async (messages: ChatMessage[]): Promise<{
    type: 'stream',
    data: AsyncGenerator<GenerateContentResponse>
} | {
    type: 'image',
    image: { mimeType: string, data: string },
    content: string
}> => {
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage.content;
    // Step 1: Check if it's an image generation request.
    const intentSchema = {
        type: Type.OBJECT,
        properties: {
            action: {
                type: Type.STRING,
                enum: ['chat', 'generate_image'],
                description: 'The user intent. "generate_image" if they are asking to create, draw, or generate an image. Otherwise "chat".'
            },
            image_prompt: {
                type: Type.STRING,
                description: 'If action is "generate_image", this is the detailed prompt for the image. Otherwise, this is an empty string.'
            }
        },
        required: ['action', 'image_prompt']
    };
    const intentPrompt = `Analyze the following user prompt to determine the intent.
    Prompt: "${prompt}"
    Determine if the user wants to have a conversation ('chat') or generate an image ('generate_image'). 
    If they want to generate an image (e.g., using words like 'draw', 'create', 'generate a picture of'), extract the full descriptive prompt for the image.`;
    if (ENABLE_IMAGE_GEN) {
        try {
            const intentResponse = await ai.models.generateContent({
                model: ASSISTANT_MODEL,
                contents: intentPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: intentSchema,
                    thinkingConfig: { thinkingBudget: 0 }
                }
            });
            const intentData = JSON.parse(intentResponse.text.trim());
            if (intentData.action === 'generate_image' && intentData.image_prompt) {
                // Step 2: Generate the image (requires access)
                const imageResponse = await ai.models.generateImages({
                    model: IMAGE_GEN_MODEL,
                    prompt: intentData.image_prompt,
                    config: {
                        numberOfImages: 1,
                        outputMimeType: 'image/png',
                        aspectRatio: '1:1',
                    },
                });
                const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
                return {
                    type: 'image',
                    image: {
                        mimeType: 'image/png',
                        data: base64ImageBytes,
                    },
                    content: `Here is the image for: "${intentData.image_prompt}"`
                };
            }
        } catch (e) {
            console.warn("Image intent check failed, falling back to chat.", e);
            // If intent check fails, proceed as a normal chat message.
        }
    }
    // Fallback to text chat stream
    const stream = await getAssistantStream(messages);
    return {
        type: 'stream',
        data: stream,
    };
};
export const getQuizExplanation = async (question: Question, incorrectAnswer: string): Promise<string> => {
    console.log("Calling Gemini API for explanation...");
    const prompt = `
    I was asked the following question: "${question.text}"
    The options were: ${question.options.join(', ')}.
    The correct answer is "${question.correctAnswer}".
    I incorrectly answered "${incorrectAnswer}".
    Please explain briefly, in a friendly and encouraging tone, why my answer was incorrect and why the correct answer is right.
  `;
    try {
        const response = await ai.models.generateContent({
            model: ASSISTANT_MODEL,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return "Sorry, I couldn't get an explanation right now. Please try again later.";
    }
};
export const generateQuiz = async (topic: string, difficulty: 'Easy' | 'Medium' | 'Hard', numQuestions: number): Promise<Quiz> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: `A creative title for a quiz about ${topic}.` },
            description: { type: Type.STRING, description: 'A short, engaging description of the quiz.' },
            difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of 2-3 relevant topic tags.' },
            questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of 4 multiple-choice options.' },
                        correctAnswer: { type: Type.STRING, description: 'The correct answer, which must exactly match one of the options.' }
                    },
                    required: ['text', 'options', 'correctAnswer']
                }
            }
        },
        required: ['title', 'description', 'difficulty', 'tags', 'questions']
    };
    const prompt = `Generate a ${numQuestions}-question multiple-choice quiz about "${topic}".
The difficulty must be exactly "${difficulty}". Do not choose another difficulty.
Each question should have 4 options. Provide relevant tags.
Ensure the correct answer is one of the provided options.`;
    const response = await ai.models.generateContent({
        model: ASSISTANT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });
    let text = response.text.trim();
    if (text.startsWith('```json')) {
        text = text.slice(7, -3).trim();
    } else if (text.startsWith('```')) {
        text = text.slice(3, -3).trim();
    }
    const quizData = JSON.parse(text);
    const quizId = `ai-${topic.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const questionsWithIds = quizData.questions.map((q: any, index: number) => ({
        ...q,
        id: `${quizId}-q${index}`
    }));
    return {
        ...quizData,
        id: quizId,
        questions: questionsWithIds,
        difficulty: difficulty, // Override with user's selection
        isPremium: false,
    };
};
export const getActionableAdvice = async (adviceId: string): Promise<string> => {
    const prompt = `You are "Cerebrum," an encouraging and empathetic AI productivity coach within the NeuroLearn app. Your tone is warm, supportive, and insightful.
Your task is to generate a short, positive, and user-facing message (1-2 sentences) that corresponds to the given actionable_advice_id.
**Examples:**
- Input ID: \`ADVICE_PRAISE\` -> Output: "You're in the zone! Great job maintaining deep focus. Keep up the amazing work."
- Input ID: \`ADVICE_STRETCH\` -> Output: "It looks like your focus is wavering slightly. A quick 30-second stretch can work wonders to reset your mind."
- Input ID: \`ADVICE_BREATHE\` -> Output: "I'm sensing some tension. Let's try a quick, deep breath together. Inhale... and exhale. You've got this."
- Input ID: \`ADVICE_BREAK\` -> Output: "You seem a bit tired. Remember, rest is productive too! It might be a good time for a short break to recharge."
---
Input ID: \`${adviceId}\`
Output:`;
    const response = await ai.models.generateContent({
        model: ASSISTANT_MODEL,
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 0 } // for quick response
        }
    });
    return response.text.trim();
};
export const analyzeCognitiveState = async (base64Image: string): Promise<CognitiveStateAnalysis> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            cognitive_state: {
                type: Type.STRING,
                enum: ["Deep Focus", "Neutral", "Slightly Distracted", "Visibly Stressed", "Tired"],
            },
            confidence_score: {
                type: Type.NUMBER,
                description: 'A value between 0.0 and 1.0 representing your confidence in the cognitive_state classification.'
            },
            key_indicators: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'An array of 2-3 observed visual cues that led to your conclusion (e.g., "furrowed brow", "gaze averted from center", "neutral expression", "yawning motion").'
            },
            actionable_advice_id: {
                type: Type.STRING,
                description: 'A unique ID corresponding to a piece of advice. Examples: "ADVICE_STRETCH", "ADVICE_BREATHE", "ADVICE_PRAISE", "ADVICE_BREAK".'
            }
        },
        required: ['cognitive_state', 'confidence_score', 'key_indicators', 'actionable_advice_id']
    };
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };
    const textPart = {
        text: `You are an expert AI model specializing in interpreting non-verbal cues for cognitive states, with a background in psychology and human-computer interaction. Your purpose is to provide anonymous, real-time feedback to help users improve their focus during study sessions.
You will receive a base64 encoded image of a user who is currently in a focus session. Your task is to analyze the user's facial expression, posture, and gaze to infer their cognitive state.
Ethical Constraints & Safeguards (Crucial):
1.  Anonymity is paramount. DO NOT attempt to identify the person, their gender, age, or ethnicity. Your analysis must be strictly limited to the cognitive state indicators.
2.  No Medical Diagnoses. You are a productivity coach, not a medical professional. Do not mention medical conditions. Frame all observations in the context of focus and productivity.
3.  Positive Framing. Even when identifying distraction or stress, maintain a supportive and non-judgmental tone in your key_indicators.
You MUST respond with ONLY a valid JSON object. Do not include any explanatory text outside of the JSON structure.`
    };
    const response = await ai.models.generateContent({
        model: ASSISTANT_MODEL,
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema
        }
    });
    return JSON.parse(response.text);
};
export const analyzeAudioEnvironment = async (detectedSounds: string[]): Promise<AudioEnvironmentAnalysis> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            environment_quality: {
                type: Type.STRING,
                enum: ["Optimal", "Acceptable", "Distracting"],
            },
            primary_distraction: {
                type: Type.STRING,
                description: 'The most significant distracting sound type from the input, or "None".'
            },
            suggestion_id: {
                type: Type.STRING,
                enum: ["SUGGEST_SOUNDSCAPE", "SUGGEST_HEADPHONES", "SUGGEST_NOTHING"],
            }
        },
        required: ['environment_quality', 'primary_distraction', 'suggestion_id']
    };
    const prompt = `You are an expert AI acoustic engineer. Your specialty is analyzing sound environments to determine their suitability for focused work and study.
Your task is to analyze the pattern of sound events detected in a user's environment and determine the overall environmental quality for focus.
Input JSON:
${JSON.stringify({ "detected_sounds": detectedSounds })}
You MUST respond with ONLY a valid JSON object with the specified schema.`;
    const response = await ai.models.generateContent({
        model: ASSISTANT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
            thinkingConfig: { thinkingBudget: 0 } // faster response for classification
        }
    });
    return JSON.parse(response.text);
};
export const getAudioEnvironmentSuggestion = async (
    suggestionId: "SUGGEST_SOUNDSCAPE" | "SUGGEST_HEADPHONES" | "SUGGEST_NOTHING",
    primaryDistraction: string
): Promise<string> => {
    const prompt = `You are "Cerebrum," a helpful AI assistant in the NeuroLearn app. You provide smart suggestions to help users optimize their study environment.
Your task is to generate a concise, helpful tip for the user based on a suggestion_id and a primary_distraction.
**Examples:**
1.  **Input ID:** \`SUGGEST_HEADPHONES\`, **Distraction:** \`Human Speech\`
    **Output:** "Conversations nearby can make it tough to focus. Noise-cancelling headphones could help create your personal study bubble."
2.  **Input ID:** \`SUGGEST_SOUNDSCAPE\`, **Distraction:** \`Traffic Hum\`
    **Output:** "Constant background noise can be draining. Would you like to try a calming soundscape, like 'Rainy Cafe', to mask it?"
3.  **Input ID:** \`SUGGEST_NOTHING\`, **Distraction:** \`None\`
    **Output:** "Your environment seems perfect for deep focus. Great job creating a productive space!"
---
**Input ID:** \`${suggestionId}\`
**Distraction:** \`${primaryDistraction}\`
**Output:**`;
    const response = await ai.models.generateContent({
        model: ASSISTANT_MODEL,
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 0 } // for quick response
        }
    });
    return response.text.trim();
};
export const generateStudyPlan = async (quizHistory: QuizResult[], focusHistory: FocusSession[]): Promise<Omit<DailyMission, 'status'>[]> => {
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                day: { type: Type.NUMBER, description: 'The day number, from 1 to 7.' },
                title: { type: Type.STRING, description: 'A catchy, motivational title for the day\'s mission.' },
                description: { type: Type.STRING, description: 'A brief, encouraging description of the task and its purpose.' },
                activityType: { type: Type.STRING, enum: ['quiz', 'focus', 'review', 'generate'], description: "The type of activity: 'quiz' for an existing quiz, 'focus' for a pomodoro session, 'review' for a concept, 'generate' to create a new quiz." },
                activityTarget: { type: Type.STRING, description: "The target of the activity. For 'quiz' or 'review', the quiz title. For 'focus', the duration (e.g., '25-min'). For 'generate', the topic for a new quiz." },
                reasoning: { type: Type.STRING, description: 'A brief, encouraging rationale for why this specific mission was chosen for this day, based on user history.' }
            },
            required: ['day', 'title', 'description', 'activityType', 'activityTarget', 'reasoning']
        }
    };
    const formattedQuizHistory = quizHistory.length > 0
        ? quizHistory.map(q => `- ${q.title} (Difficulty: ${q.difficulty}, Score: ${q.score}%)`).join('\n')
        : 'No quiz history yet.';
    const averageFocusScore = focusHistory.length > 0
        ? (focusHistory.reduce((acc, session) => acc + session.score, 0) / focusHistory.length).toFixed(0)
        : 'No focus history yet.';
    const prompt = `
        Based on the following user data, create a personalized, encouraging 7-day study plan to help them improve.
        **Quiz History:**
        ${formattedQuizHistory}
        **Focus Analysis:**
        - Average Focus Score: ${averageFocusScore}/100
        **Instructions:**
        1.  Analyze their quiz history to identify weak areas (low scores) and strong areas.
        2.  Create a balanced 7-day plan. Each day should have one mission.
        3.  Mix activities: suggest retaking quizzes they did poorly on ('quiz'), focusing on weak topics ('review'), generating new quizzes on related topics ('generate'), and practicing focus ('focus').
        4.  Make the plan progressive and motivational. Start with something achievable.
        5.  The 'activityTarget' for a 'quiz' must match an existing quiz title from their history.
        6.  The 'activityTarget' for 'generate' should be a logical next step from their existing knowledge.
        7.  Keep titles and descriptions concise and positive.
        8.  For each mission, provide a "reasoning" field explaining why it was chosen. E.g., "Since you scored low on [Quiz], we're reviewing it.", or "To build on your strength in [Topic], let's generate a new quiz."
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema
        }
    });
    return JSON.parse(response.text);
}
export const getSupportiveReply = async (type: 'intention' | 'reflection', content: string): Promise<string> => {
    const prompt = type === 'intention'
        ? `A user set their daily intention to "${content}". Write a very short (1-2 sentences), encouraging reply to affirm their goal.`
        : `A user is reflecting on their day, saying "${content}". Write a very short (1-2 sentences), warm, and validating reply.`;
    const response = await ai.models.generateContent({
        model: ASSISTANT_MODEL,
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 0 } // Low latency for quick replies
        }
    });
    return response.text;
};
export const getMindShiftGuidance = async (thought: string, step: 'challenge' | 'reframe'): Promise<string> => {
    let prompt;
    if (step === 'challenge') {
        prompt = `A user is having the negative thought: "${thought}". 
        Ask one insightful, Socratic question to gently challenge the evidence for this thought. 
        Frame it kindly. For example: 'What evidence suggests that thought is 100% true?' or 'Is there a more compassionate way to look at this situation?'.`;
    } else { // 'reframe'
        prompt = `Based on the negative thought "${thought}", suggest a more balanced and compassionate alternative thought.
        Start your response with 'A possible reframe could be:'. Be concise and supportive.`;
    }
    const response = await ai.models.generateContent({
        model: ASSISTANT_MODEL,
        contents: prompt,
    });
    return response.text;
};
export const breakdownGoalIntoSubtasks = async (goal: string): Promise<string[]> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            tasks: {
                type: Type.ARRAY,
                description: 'A list of 3-5 granular, actionable subtasks to achieve the main goal. Each task should be a concise string.',
                items: { type: Type.STRING }
            }
        },
        required: ['tasks']
    };
    const prompt = `Break down the following high-level goal into a series of smaller, actionable subtasks.
    Goal: "${goal}"`;
    const response = await ai.models.generateContent({
        model: ASSISTANT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });
    const result = JSON.parse(response.text);
    return result.tasks;
};
export const executeResearchTask = async (taskText: string): Promise<AgentExecutionResult> => {
    const prompt = `Research the following topic and provide a concise summary (2-3 paragraphs).
    Topic: "${taskText}"`;
    const response = await ai.models.generateContent({
        model: ASSISTANT_MODEL,
        contents: prompt,
        config: {
            tools: ENABLE_SEARCH_TOOL ? [{ googleSearch: {} }] : undefined,
        },
    });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const validSources = groundingChunks
        .filter(chunk => chunk.web && chunk.web.uri && chunk.web.title)
        .map(chunk => ({
            web: {
                uri: chunk.web.uri!,
                title: chunk.web.title!,
            }
        }));
    return {
        text: response.text,
        sources: validSources,
    };
};
export const executePresentationTask = async (taskText: string): Promise<AgentExecutionResult> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            presentation: {
                type: Type.ARRAY,
                description: 'An array of slides for a presentation outline.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        slideTitle: { type: Type.STRING },
                        bulletPoints: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: '3-5 key bullet points for the slide.'
                        }
                    },
                    required: ['slideTitle', 'bulletPoints']
                }
            }
        },
        required: ['presentation']
    };
    const prompt = `Create a presentation outline with a title slide, 3-4 content slides, and a conclusion slide for the following topic: "${taskText}".`;
    const response = await ai.models.generateContent({
        model: ASSISTANT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
        }
    });
    const result = JSON.parse(response.text);
    return { presentation: result.presentation };
};
export const generateResumeContent = async (portfolioData: {
    professionalTitle: string;
    bio: string;
    skills: Skill[];
    projects: PortfolioProject[];
    timelineEvents: TimelineEvent[];
}): Promise<GeneratedResumeContent> => {
    const resumeSchema = {
        type: Type.OBJECT,
        properties: {
            summary: {
                type: Type.STRING,
                description: "A 2-3 sentence professional summary optimized for ATS with keywords from the user's skills."
            },
            experience: {
                type: Type.ARRAY,
                description: "A list of professional experiences, derived from timeline events. Use 'Professional Experience' as the section title.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Job title." },
                        date: { type: Type.STRING, description: "Employment dates (e.g., 'Jun 2022 - Present')." },
                        bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of achievement-oriented bullet points starting with action verbs." }
                    },
                    required: ["title", "date", "bulletPoints"]
                }
            },
            projects: {
                type: Type.ARRAY,
                description: "A list of key projects. Use 'Projects' as the section title.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Project name." },
                        techStack: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of technologies used." },
                        bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of bullet points describing the project's impact and challenges." }
                    },
                    required: ["title", "techStack", "bulletPoints"]
                }
            }
        },
        required: ["summary", "experience", "projects"]
    };
    const prompt = `
        You are an expert technical resume writer, specializing in creating content that is highly optimized for Applicant Tracking Systems (ATS).
        Your goal is to generate professional, ATS-friendly content for a technical resume based on the provided portfolio data. The output must be concise, impactful, and easily parsable.
        **Core ATS Principles to Follow:**
        - Use standard, universally recognized section headers (e.g., "Professional Experience", "Projects").
        - Avoid complex formatting, tables, columns, or special characters.
        - Use action verbs to start every bullet point.
        - Quantify achievements with metrics (numbers, percentages, dollar amounts) whenever possible.
        - Mirror keywords from the skills list throughout the experience and project descriptions.
        **Portfolio Data:**
        - Professional Title: ${portfolioData.professionalTitle}
        - Bio: ${portfolioData.bio}
        - Skills: ${portfolioData.skills.map(s => s.name).join(', ')}
        - Projects: ${portfolioData.projects.map(p => `${p.title}: ${p.description}`).join('\n')}
        - Timeline: ${portfolioData.timelineEvents.map(e => `${e.title} (${e.date}): ${e.description}`).join('\n')}
        **Instructions for Generation:**
        1.  **Summary:** Write a powerful 2-4 sentence professional summary. Start with the professional title, highlight key skills from the list, and mention years of experience (infer if not present).
        2.  **Experience:**
            - From the timeline, infer distinct job positions/roles. Group related events logically.
            - For each role, create 2-4 bullet points.
            - **Each bullet point MUST begin with a strong action verb (e.g., Architected, Developed, Led, Implemented, Optimized, Spearheaded).**
            - **Quantify achievements to show impact (e.g., 'Reduced API latency by 30%', 'Increased user engagement by 15%', 'Managed a budget of $50k').** Be creative yet plausible if data is sparse.
            - Naturally incorporate relevant skills from the skills list.
        3.  **Projects:**
            - Select the most impressive projects.
            - Rewrite their descriptions into 2-3 achievement-oriented bullet points each.
            - Focus on the *user impact* and the *technical challenges solved*. Use the STAR method (Situation, Task, Action, Result) as a guide.
            - Explicitly mention the technologies used in the bullet points or a dedicated tech stack list for the project.
    `;
    const response = await ai.models.generateContent({
        model: ASSISTANT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: resumeSchema,
        }
    });
    return JSON.parse(response.text);
};
export const generateFocusPlan = async (goal: string, duration: number): Promise<string> => {
    const prompt = `
        As Cerebrum AI, create a "Focus Filter" plan for a user.
        Their goal is: "${goal}"
        The duration is: ${duration} minutes.
        Your response should be a concise, encouraging, and structured plan in markdown.
        - Start with an affirmation.
        - Create a "Digital Shield" section: specify what kinds of notifications to pause (e.g., social media, games) and what to allow (e.g., calendar, specific educational domains if relevant).
        - Create a "Wellbeing Protocol" section: suggest one micro-break (e.g., stretch, hydrate) and schedule it appropriately within the duration.
        - Conclude with a motivational sign-off.
    `;
    const response = await ai.models.generateContent({
        model: ASSISTANT_MODEL,
        contents: prompt,
    });
    return response.text;
};
export const generateSleepAdvice = async (duration: number, quality: number, history: SleepEntry[]): Promise<{ advice: string; score: number }> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.NUMBER, description: "A 'Cognitive Recharge Score' from 0-100 based on the sleep data. 8 hours at 90%+ quality should be around 95-100. Under 6 hours or low quality should be significantly lower." },
            advice: { type: Type.STRING, description: "Personalized, actionable advice for the day in 2-3 sentences. If sleep was good, suggest tackling hard tasks. If poor, suggest starting with lighter tasks, hydration, and a short walk." }
        },
        required: ['score', 'advice']
    };
    const formattedHistory = history.slice(-5).map(e => ` - ${e.duration.toFixed(1)} hours, ${e.quality}% quality`).join('\n');
    const prompt = `
        As Cerebrum AI, analyze the user's sleep and provide a Cognitive Recharge Score and advice.
        Today's sleep:
        - Duration: ${duration.toFixed(1)} hours
        - Quality: ${quality}%
        Recent sleep history (for context):
        ${formattedHistory}
        Based on this, calculate the score and generate advice. Poor sleep (e.g., <6.5 hours, <70% quality) should result in a lower score and advice focused on recovery. Good sleep should result in a high score and advice focused on peak performance.
    `;
    const response = await ai.models.generateContent({
        model: ASSISTANT_MODEL,
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: schema }
    });
    const result = JSON.parse(response.text);
    // Clamp score to be safe
    result.score = Math.max(0, Math.min(100, result.score));
    return result;
};
export const generateMindfulnessStream = async (duration: number): Promise<AsyncGenerator<GenerateContentResponse>> => {
    const prompt = `
        You are a calm and soothing mindfulness guide. Lead a unique, ${duration}-minute guided meditation session.
        The script should be generated in real-time.
        - Start with a calming introduction to settle in.
        - Guide the user through observing their breath and body sensations.
        - Include a short period of quiet reflection.
        - Conclude with a gentle return to awareness and a positive affirmation for the rest of their day.
        - Structure your output in short, easy-to-read sentences. Use paragraph breaks (\\n\\n) to create pauses.
    `;
    const response = await ai.models.generateContentStream({
        model: ASSISTANT_MODEL,
        contents: prompt,
    });
    return response;
};
export const generateWellnessInsights = async (data: {
    checkins: DailyCheckin[],
    sleep: SleepEntry[],
    focus: FocusStory[]
}): Promise<{ title: string; insight: string }[]> => {
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: 'A catchy, insightful title for the correlation found (e.g., "Sleep is Your Superpower").' },
                insight: { type: Type.STRING, description: "A 2-3 sentence narrative explaining a correlation found in the data. Be encouraging and focus on positive reinforcement or gentle suggestions for improvement." }
            },
            required: ['title', 'insight']
        }
    };
    // Summarize data to fit context window
    const checkinSummary = data.checkins.slice(-7).map(c => `Date: ${c.date}, Mood: ${c.mood}`).join('; ');
    const sleepSummary = data.sleep.slice(-7).map(s => `Date: ${s.date}, Duration: ${s.duration}h, Quality: ${s.quality}%`).join('; ');
    const focusSummary = data.focus.slice(-7).map(f => `Date: ${f.date.substring(0, 10)}, Duration: ${f.duration}min, Flow: ${f.flowState}%`).join('; ');
    const prompt = `
        As Cerebrum AI, you are a personal data scientist. Analyze the user's wellness data from the last 7 days to find 2-3 meaningful correlations. Present these as "Insight Cards".
        **User Data:**
        - Mood Check-ins: ${checkinSummary || 'No data'}
        - Sleep Data: ${sleepSummary || 'No data'}
        - Focus Sessions: ${focusSummary || 'No data'}
        **Instructions:**
        1. Look for connections. For example: Do good sleep nights correlate with higher flow states? Does mood affect focus duration?
        2. Create 2-3 unique insights.
        3. Frame the insights positively and encouragingly.
        4. Do not just state data, tell a story about what it means for the user's wellbeing and performance.
    `;
    const response = await ai.models.generateContent({
        model: ASSISTANT_MODEL,
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: schema }
    });
    return JSON.parse(response.text);
};
export const generateStudyRoadmap = async (goal: string): Promise<{ days: { day: number; topics: string[] }[] }> => {
    const prompt = `Create a detailed 7-day study roadmap for the following learning goal: "${goal}"
For each day, provide 3-5 specific topics or tasks that will help achieve this goal. Format your response as a JSON object with the following structure:
{
  "days": [
    {
      "day": 1,
      "topics": ["Topic 1", "Topic 2", "Topic 3"]
    },
    {
      "day": 2,
      "topics": ["Topic 1", "Topic 2", "Topic 3"]
    },
    // ... for 7 days
  ]
}
Make sure the roadmap is realistic, progressive, and covers the topic comprehensively. Include a mix of theory and practical exercises.`;
    try {
        const response = await ai.models.generateContent({
            model: ASSISTANT_MODEL,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'object',
                    properties: {
                        days: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    day: { type: 'number' },
                                    topics: {
                                        type: 'array',
                                        items: { type: 'string' }
                                    }
                                },
                                required: ['day', 'topics']
                            }
                        }
                    },
                    required: ['days']
                }
            }
        });
        // The response should already be parsed JSON due to responseSchema
        const data = JSON.parse(response.text);
        // Validate the response format
        if (!data.days || !Array.isArray(data.days) || data.days.length !== 7) {
            throw new Error('Invalid response format from AI');
        }
        return data;
    } catch (error) {
        console.error('Error generating study roadmap:', error);
        // Fallback to a default roadmap if generation fails
        return {
            days: Array(7).fill(0).map((_, i) => ({
                day: i + 1,
                topics: [
                    `Introduction to ${goal} - Day ${i + 1} Concept 1`,
                    `Hands-on exercise with ${goal} - Day ${i + 1}`,
                    `Review and practice key concepts from Day ${i + 1}`
                ]
            }))
        };
    }
};
export const generateNotebookScript = async (sourceText: string): Promise<NotebookScript> => {
    const slideSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'A concise title for the slide.' },
            points: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'An array of 2-4 key bullet points for the slide.'
            },
            narration: {
                type: Type.STRING,
                description: 'A brief, engaging narration script for this slide (1-3 sentences).'
            }
        },
        required: ['title', 'points', 'narration']
    };
    const scriptSchema = {
        type: Type.OBJECT,
        properties: {
            summary: {
                type: Type.STRING,
                description: 'A comprehensive, well-structured summary of the source text (3-5 paragraphs).'
            },
            slides: {
                type: Type.ARRAY,
                description: 'An array of 3-5 slides that form a presentation about the source text.',
                items: slideSchema
            }
        },
        required: ['summary', 'slides']
    };
    const prompt = `You are an expert instructional designer. Analyze the following source text and transform it into a structured learning module.
Your task is to generate two things:
1.  A detailed, paragraph-based summary of the entire text.
2.  A script for a short presentation (3-5 slides). Each slide must have a title, a few bullet points, and a corresponding narration script.
Source Text:
---
${sourceText}
---
Generate the output in a valid JSON format.`;
    const response = await ai.models.generateContent({
        model: ASSISTANT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: scriptSchema,
        }
    });
    return JSON.parse(response.text.trim());
};