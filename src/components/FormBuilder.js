import React from 'react';

const formElements = [
  { type: 'section', label: 'Section' },
  { type: 'grid', label: 'Grid Layout' },
  { type: 'text', label: 'Text Input' },
  { type: 'textarea', label: 'Text Area' },
  { type: 'select', label: 'Dropdown' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'radio', label: 'Radio Button' },
  { type: 'date', label: 'Date Picker' },
  { type: 'number', label: 'Number Input' },
  { type: 'email', label: 'Email Input' },
];

function FormBuilder({ onAddElement }) {
  const handleDragStart = (e, element) => {
    e.dataTransfer.setData('application/json', JSON.stringify(element));
  };

  return (
    <div className="form-builder-container">
      <h2>Form Elements</h2>
      <div className="element-list">
        {formElements.map((element, index) => (
          <div
            key={index}
            className={`element-item ${element.type === 'section' ? 'section-element' : ''} ${element.type === 'grid' ? 'grid-element' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, element)}
          >
            {element.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FormBuilder; 