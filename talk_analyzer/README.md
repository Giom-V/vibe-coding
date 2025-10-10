# Talk coach

## Description

A coach for your talks. Give it a recording or youtube link and it will tell you how to get even better.
## **[Try it on AI Studio](https://aistudio.google.com/apps/drive/1ZifLzSuOqzg3Ita9CC7kmRweauVanCy7?fullscreenApplet=true)**

Here are some of my recent talks you can try it with:
* A 50mn talk in English at Devoxx Belgium about the newest Gemini features, especially the gen-media models, and about vibe-coding: https://www.youtube.com/watch?v=cOp5rklR3jI
* A 25mn talk in French for the GenAi Days about the recent features and some live demos: https://www.youtube.com/watch?v=eV7AdA3-U_A

## Initial Prompt

"I want to create an app to analyze talks recording. You can either upload a video, an audio file or add a youtube link (default choice) and ahve gemini-2.5-pro analyze the talk and rate its pacing, the clarity, the examples, the interactiveness, and whatever you think would make sense on top of a global analysis, use structured output to organize. It should use chat mode so that we can have follow-up questions, and come up with 2 or 3 proposed questions like, if tehre was a demo, was it interesting, if there was a technical problem, what were the impacts, and for everything that could be improved, maybe questions liks "how could I have done that better".

Here's some doc to help you (especially on how to get a youtube video):
* https://ai.google.dev/gemini-api/docs/video-understanding.md.txt
* https://ai.google.dev/gemini-api/docs/structured-output.md.txt
* https://ai.google.dev/gemini-api/docs/text-generation.md.txt
" (note that I actually copy pasted the md pages)

## Time Spent

About an hour. 

## AI Tools Used

*   [AI Studio](ai.studio/apps)
*   [Gemini Video Understanding](https://ai.google.dev/gemini-api/docs/video-understanding)
*   And Gemini long context


## Challenges

I lost some time before understanding that the videos were toon long and I needed to reduce the framerate to reduce their token usage and keep it under 500k (and also force it to use pro).

## Learnings

Gemini is quite on point even though I already knew what I didn't do well it's interesting that it not just what I thought but also how it felt to the audience. Still I had to tell it to be more crtic otherwise it was in its usual "you are amazing" behavior.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## To Do

I'd like to add a better way to export the report to keep track of them.

I also want to extract the questions asked from the videos.