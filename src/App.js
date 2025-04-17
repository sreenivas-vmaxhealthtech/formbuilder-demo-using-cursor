import React, { useState } from 'react';
import FormBuilder from './components/FormBuilder';
import FormPreview from './components/FormPreview';
import './App.css';

function App() {
  const [formElements, setFormElements] = useState([]);

  const handleAddElement = (element) => {
    setFormElements([...formElements, { ...element, id: Date.now() }]);
  };

  const handleRemoveElement = (id) => {
    setFormElements(formElements.filter(element => element.id !== id));
  };

  const handleUpdateElement = (id, updatedElement) => {
    setFormElements(formElements.map(element => 
      element.id === id ? { ...element, ...updatedElement } : element
    ));
  };

  return (
    <div className="app-container">
      <FormBuilder onAddElement={handleAddElement} />
      <FormPreview 
        elements={formElements}
        onAddElement={handleAddElement}
        onRemoveElement={handleRemoveElement}
        onUpdateElement={handleUpdateElement}
      />
    </div>
  );
}

export default App; 