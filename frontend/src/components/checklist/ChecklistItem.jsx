import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

export default function ChecklistItem({ itemKey, itemText, isChecked, onToggle }) {
  const cleanText = DOMPurify.sanitize(itemText || '');

  return (
    <label style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', background: 'white', padding: '0.65rem', borderRadius: '4px', border: '1px solid #e1e2e9' }}>
      <input
        type="checkbox"
        checked={!!isChecked}
        onChange={() => onToggle(itemKey)}
        aria-label={`Check item: ${itemText}`}
      />
      <span
        style={{ textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? '#888' : '#191c21' }}
        dangerouslySetInnerHTML={{ __html: cleanText }}
      />
    </label>
  );
}
