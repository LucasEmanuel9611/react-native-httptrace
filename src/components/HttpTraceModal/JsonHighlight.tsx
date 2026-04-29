import React from 'react';
import { Text } from 'react-native';

const COLORS = {
  key: '#881391',
  string: '#1A1AA6',
  number: '#098658',
  boolean: '#0000FF',
  null: '#808080',
  bracket: '#333333',
};

interface JsonHighlightProps {
  content: string | Record<string, unknown> | unknown[];
}

const tokenizeJson = (jsonString: string): React.ReactNode[] => {
  const tokens: React.ReactNode[] = [];
  const regex =
    /("(?:\\.|[^"\\])*")\s*:|("(?:\\.|[^"\\])*")|(true|false)|(null)|(-?\d+\.?\d*(?:[eE][+-]?\d+)?)|([{}[\],])|(\s+)/g;

  let lastIndex = 0;

  for (
    let match = regex.exec(jsonString);
    match !== null;
    match = regex.exec(jsonString)
  ) {
    if (match.index > lastIndex) {
      tokens.push(jsonString.slice(lastIndex, match.index));
    }

    const [
      fullMatch,
      keyMatch,
      stringMatch,
      boolMatch,
      nullMatch,
      numMatch,
      bracketMatch,
      whitespace,
    ] = match;

    if (keyMatch) {
      tokens.push(
        <Text key={`k-${match.index}`} style={{ color: COLORS.key }}>
          {keyMatch}
        </Text>,
      );
      tokens.push(':');
    } else if (stringMatch) {
      tokens.push(
        <Text key={`s-${match.index}`} style={{ color: COLORS.string }}>
          {stringMatch}
        </Text>,
      );
    } else if (boolMatch) {
      tokens.push(
        <Text key={`b-${match.index}`} style={{ color: COLORS.boolean }}>
          {boolMatch}
        </Text>,
      );
    } else if (nullMatch) {
      tokens.push(
        <Text key={`n-${match.index}`} style={{ color: COLORS.null }}>
          {nullMatch}
        </Text>,
      );
    } else if (numMatch) {
      tokens.push(
        <Text key={`d-${match.index}`} style={{ color: COLORS.number }}>
          {numMatch}
        </Text>,
      );
    } else if (bracketMatch) {
      tokens.push(
        <Text key={`br-${match.index}`} style={{ color: COLORS.bracket }}>
          {bracketMatch}
        </Text>,
      );
    } else if (whitespace) {
      tokens.push(whitespace);
    } else {
      tokens.push(fullMatch);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < jsonString.length) {
    tokens.push(jsonString.slice(lastIndex));
  }

  return tokens;
};

export function JsonHighlight({ content }: JsonHighlightProps) {
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      return (
        <Text style={{ fontFamily: 'monospace', fontSize: 14 }}>
          {tokenizeJson(formatted)}
        </Text>
      );
    } catch {
      return (
        <Text style={{ fontFamily: 'monospace', fontSize: 14 }}>
          {content}
        </Text>
      );
    }
  }

  const jsonString = JSON.stringify(content, null, 2);
  return (
    <Text style={{ fontFamily: 'monospace', fontSize: 14 }}>
      {tokenizeJson(jsonString)}
    </Text>
  );
}
