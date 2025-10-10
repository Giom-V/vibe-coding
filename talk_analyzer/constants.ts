import { Type } from "@google/genai";

export const APP_TITLE = "Talk Analyzer AI";

export const ANALYSIS_PROMPT = `
You are an expert public speaking coach AI. You are a critic and your main goal is to tell what needs to be improved. Do not be overly positive. Your task is to analyze the provided talk recording (video or audio).
Provide a detailed, constructive analysis based on the content.
Your goal is to help the speaker identify their strengths and, more importantly, areas for improvement.

{talkContext}

Please evaluate the following aspects:
- Pacing: The speed of speech. Was it too fast, too slow, or just right? Was there good use of pauses?
- Clarity: The articulation and coherence of the message. Was the speaker easy to understand? Was the language clear and concise?
- Engagement: The ability to hold the audience's attention. Was the tone varied and interesting? Was there good use of storytelling or rhetorical devices?
- Use of Examples: The effectiveness of examples, analogies, or data used to support points. Were they relevant, clear, and impactful?
- Creativity: The originality of the content, uniqueness of the delivery, or innovative use of visuals and examples.
- Stage Presence: The speaker's body language, confidence, and connection with the audience. Did they appear comfortable and command the stage? (For video only)

For each aspect, provide a rating from 1 (needs significant improvement) to 5 (excellent) and a detailed justification for your rating, focusing on what could be better.

Also, provide:
- An overall summary of the talk, highlighting the core message and its effectiveness.
- A list of key strengths.
- A list of specific, actionable areas for improvement. This is the most important part of your feedback.
- A list of 3 concise, insightful follow-up questions that the speaker might ask to delve deeper into your feedback. For example, "How could I have better explained the quantum computing section?".
- A list of all questions asked by the audience and the answers given by the speaker. If no Q&A session is present in the recording, return an empty array for this field.

Respond ONLY with the JSON object adhering to the provided schema. Do not include any other text, markdown, or explanations outside of the JSON structure.
All feedback, justifications, summaries, and questions MUST be in the following language: {language}.
`;

export const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallSummary: {
      type: Type.STRING,
      description: "A concise summary of the talk's content and delivery.",
    },
    pacing: {
      type: Type.OBJECT,
      description: "Analysis of the talk's pacing and rhythm.",
      properties: {
        score: { type: Type.INTEGER, description: "Rating from 1 to 5." },
        justification: { type: Type.STRING, description: "Detailed feedback on pacing." },
      },
      required: ["score", "justification"],
    },
    clarity: {
      type: Type.OBJECT,
      description: "Analysis of the speaker's clarity and articulation.",
      properties: {
        score: { type: Type.INTEGER, description: "Rating from 1 to 5." },
        justification: { type: Type.STRING, description: "Detailed feedback on clarity." },
      },
      required: ["score", "justification"],
    },
    engagement: {
      type: Type.OBJECT,
      description: "Analysis of audience engagement techniques.",
      properties: {
        score: { type: Type.INTEGER, description: "Rating from 1 to 5." },
        justification: { type: Type.STRING, description: "Detailed feedback on engagement." },
      },
      required: ["score", "justification"],
    },
    useOfExamples: {
      type: Type.OBJECT,
      description: "Analysis of the use of examples and supporting materials.",
      properties: {
        score: { type: Type.INTEGER, description: "Rating from 1 to 5." },
        justification: { type: Type.STRING, description: "Detailed feedback on the use of examples." },
      },
      required: ["score", "justification"],
    },
    creativity: {
      type: Type.OBJECT,
      description: "Analysis of the creativity and originality of the talk.",
      properties: {
        score: { type: Type.INTEGER, description: "Rating from 1 to 5." },
        justification: { type: Type.STRING, description: "Detailed feedback on creativity." },
      },
      required: ["score", "justification"],
    },
     stagePresence: {
      type: Type.OBJECT,
      description: "Analysis of the speaker's stage presence, body language, and confidence.",
      properties: {
        score: { type: Type.INTEGER, description: "Rating from 1 to 5." },
        justification: { type: Type.STRING, description: "Detailed feedback on stage presence." },
      },
      required: ["score", "justification"],
    },
    strengths: {
      type: Type.ARRAY,
      description: "A list of key strengths of the presentation.",
      items: { type: Type.STRING },
    },
    areasForImprovement: {
      type: Type.ARRAY,
      description: "A list of actionable areas for improvement.",
      items: { type: Type.STRING },
    },
    suggestedQuestions: {
      type: Type.ARRAY,
      description: "A list of 3 suggested follow-up questions for the user.",
      items: { type: Type.STRING },
    },
    questionAndAnswers: {
        type: Type.ARRAY,
        description: "A list of questions asked and answers provided during the talk.",
        items: {
            type: Type.OBJECT,
            properties: {
                question: {
                    type: Type.STRING,
                    description: "The question that was asked by an audience member."
                },
                answer: {
                    type: Type.STRING,
                    description: "The answer that was provided by the speaker."
                }
            },
            required: ["question", "answer"],
        }
    },
  },
  required: [
    "overallSummary",
    "pacing",
    "clarity",
    "engagement",
    "useOfExamples",
    "creativity",
    "stagePresence",
    "strengths",
    "areasForImprovement",
    "suggestedQuestions",
    "questionAndAnswers",
  ],
};
