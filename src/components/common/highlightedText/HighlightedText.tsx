import React from 'react';

interface HighlightedTextProps {
  text: string;
  query: string;
}

const highlightSearch = (text: string, query: string) => {
  if (!query) {
    return text;
  }

  // Escape special characters in the query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Split the query by comma to handle comma-separated values
  const queries = escapedQuery.split(',').map(q => q.trim());

  // Create a regular expression for each query
  const regexes = queries.map(q => new RegExp(`(${q})`, 'gi'));

  // Replace each query with <mark> tags
  return text && regexes.reduce((result, regex) => {
    return result.toString().replace(regex, (match, p1) => `<mark>${p1}</mark>`);
  }, text);
};

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, query }) => {
  const queryWithoutComma = query.endsWith(',') ? query.slice(0, -1) : query;
  const highlightedText = highlightSearch(text, queryWithoutComma);
  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  
};

export default HighlightedText;
