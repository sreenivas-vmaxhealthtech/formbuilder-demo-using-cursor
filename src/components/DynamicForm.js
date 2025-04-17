import React, { useState } from 'react';

function DynamicForm({ formConfig }) {
  const [formData, setFormData] = useState({});

  const handleChange = (e, elementId) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
  };

  const renderFormElement = (element) => {
    const commonProps = {
      name: element.name,
      id: element.id,
      placeholder: element.placeholder,
      required: element.required,
      onChange: (e) => handleChange(e, element.id)
    };

    switch (element.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <input
            type={element.type}
            {...commonProps}
            value={formData[element.name] || ''}
          />
        );
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            value={formData[element.name] || ''}
          />
        );
      case 'select':
        return (
          <select {...commonProps} value={formData[element.name] || ''}>
            <option value="">Select an option</option>
            {element.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            {...commonProps}
            checked={formData[element.name] || false}
          />
        );
      case 'radio':
        return (
          <input
            type="radio"
            {...commonProps}
            checked={formData[element.name] === element.value}
          />
        );
      case 'grid':
        return (
          <div className={`form-grid grid-${element.columns}`}>
            {element.elements?.map((gridElement, index) => (
              <div key={index} className="grid-item">
                {renderFormElement(gridElement)}
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (!formConfig) {
    return <div>No form configuration provided</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="dynamic-form">
      {formConfig.sections?.map((section) => (
        <div key={section.id} className="form-section">
          <div className="section-header">
            <h3>{section.title}</h3>
          </div>
          <div className="section-content">
            {section.elements.map((element) => (
              <div key={element.id} className="form-control">
                <label htmlFor={element.id}>{element.label}</label>
                {renderFormElement(element)}
              </div>
            ))}
          </div>
        </div>
      ))}
      {formConfig.elements?.map((element) => (
        <div key={element.id} className="form-control">
          <label htmlFor={element.id}>{element.label}</label>
          {renderFormElement(element)}
        </div>
      ))}
      <button type="submit" className="submit-button">
        Submit
      </button>
    </form>
  );
}

export default DynamicForm; 