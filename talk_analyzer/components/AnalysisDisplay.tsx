import React from 'react';
import type { Analysis, Rating } from '../types';
import RatingStars from './RatingStars';

interface AnalysisDisplayProps {
  analysis: Analysis;
  source?: string | null;
  context?: string | null;
}

const RatingCard: React.FC<{ title: string; rating: Rating }> = ({ title, rating }) => (
  <div className="bg-slate-800 p-4 rounded-lg">
    <h3 className="font-semibold text-lg text-slate-200">{title}</h3>
    <div className="my-2">
      <RatingStars score={rating.score} />
    </div>
    <p className="text-slate-400 text-sm">{rating.justification}</p>
  </div>
);

const ListCard: React.FC<{ title: string; items: string[]; itemColor: string }> = ({ title, items, itemColor }) => (
  <div className="bg-slate-800 p-4 rounded-lg">
    <h3 className="font-semibold text-lg text-slate-200 mb-3">{title}</h3>
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <span className={`mr-3 mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${itemColor}`}></span>
          <span className="text-slate-400 text-sm">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, source, context }) => {
  const handleDownload = () => {
    const { 
      overallSummary, 
      pacing, clarity, engagement, useOfExamples, creativity, stagePresence, 
      strengths, 
      areasForImprovement 
    } = analysis;

    const ratingToMd = (title: string, rating: Rating) => {
      return `### ${title}\n- **Score:** ${rating.score}/5\n- **Feedback:** ${rating.justification}\n\n`;
    };

    const listToMd = (title: string, items: string[]) => {
      return `### ${title}\n${items.map(item => `- ${item}`).join('\n')}\n\n`;
    };

    let sourceSection = '';
    if (source) {
      if (source.startsWith('http')) {
        sourceSection = `**Source:** [${source}](${source})\n\n`;
      } else {
        sourceSection = `**Source File:** ${source}\n\n`;
      }
    }

    let contextSection = '';
    if (context && context.trim()) {
      contextSection = `## Provided Talk Context\n${context.trim()}\n\n`;
    }

    const markdownContent = `# Talk Analysis Report\n\n`
      + sourceSection
      + contextSection
      + `## Overall Summary\n${overallSummary}\n\n`
      + `## Detailed Ratings\n`
      + ratingToMd('Pacing', pacing)
      + ratingToMd('Clarity', clarity)
      + ratingToMd('Engagement', engagement)
      + ratingToMd('Use of Examples', useOfExamples)
      + ratingToMd('Creativity', creativity)
      + ratingToMd('Stage Presence', stagePresence)
      + `## Key Areas\n`
      + listToMd('Strengths', strengths)
      + listToMd('Areas for Improvement', areasForImprovement);

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'talk-analysis-report.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div id="analysis-summary" className="bg-slate-800 p-6 rounded-lg shadow-lg scroll-mt-8">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-sky-400">Overall Summary</h2>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
              aria-label="Download analysis report as a markdown file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download Report
            </button>
        </div>
        <p className="text-slate-300 leading-relaxed">{analysis.overallSummary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RatingCard title="Pacing" rating={analysis.pacing} />
        <RatingCard title="Clarity" rating={analysis.clarity} />
        <RatingCard title="Engagement" rating={analysis.engagement} />
        <RatingCard title="Use of Examples" rating={analysis.useOfExamples} />
        <RatingCard title="Creativity" rating={analysis.creativity} />
        <RatingCard title="Stage Presence" rating={analysis.stagePresence} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ListCard title="Strengths" items={analysis.strengths} itemColor="bg-green-400" />
        <ListCard title="Areas for Improvement" items={analysis.areasForImprovement} itemColor="bg-yellow-400" />
      </div>
    </div>
  );
};

export default AnalysisDisplay;