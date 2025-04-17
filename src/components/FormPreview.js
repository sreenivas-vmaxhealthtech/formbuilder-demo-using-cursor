import React, { useState, useRef, useEffect } from 'react';

function FormPreview({ elements, onAddElement, onRemoveElement, onUpdateElement }) {
  const [editingElement, setEditingElement] = useState(null);
  const [editingValues, setEditingValues] = useState({});
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const editFormRef = useRef(null);

  // Close edit form when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editFormRef.current && !editFormRef.current.contains(event.target)) {
        // Only close if the click is not on an edit button
        if (!event.target.closest('.edit-button')) {
          setEditingElement(null);
          setEditingValues({});
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update editing values when editing element changes
  useEffect(() => {
    if (editingElement) {
      setEditingValues({...editingElement});
    } else {
      setEditingValues({});
    }
  }, [editingElement]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const elementData = JSON.parse(e.dataTransfer.getData('application/json'));
    
    if (elementData.type === 'section') {
      const newSection = {
        id: Date.now(),
        title: 'New Section',
        elements: []
      };
      setSections([...sections, newSection]);
      // Don't automatically set currentSection when creating a new section
    } else if (elementData.type === 'grid') {
      const newGrid = {
        id: Date.now(),
        type: 'grid',
        columns: 2,
        elements: []
      };
      if (currentSection) {
        const updatedSections = sections.map(section => 
          section.id === currentSection 
            ? { ...section, elements: [...section.elements, newGrid] }
            : section
        );
        setSections(updatedSections);
      } else {
        onAddElement(newGrid);
      }
    } else {
      const newElement = { ...elementData, id: Date.now() };
      if (currentSection) {
        const updatedSections = sections.map(section => 
          section.id === currentSection 
            ? { ...section, elements: [...section.elements, newElement] }
            : section
        );
        setSections(updatedSections);
      } else {
        onAddElement(newElement);
      }
    }
  };

  const handleEdit = (element, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditingElement(element);
  };

  const handleEditChange = (field, value) => {
    setEditingValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // New function specifically for updating section titles
  const updateSectionTitle = (sectionId, newTitle) => {
    // Create a completely new sections array
    const newSections = sections.map(section => {
      if (section.id === sectionId) {
        // Return a new section object with the updated title
        return {
          ...section,
          title: newTitle
        };
      }
      return section;
    });
    
    // Update the state with the new array
    setSections(newSections);
    
    // Log for debugging
    console.log('Section title updated:', newTitle);
    console.log('Updated sections:', newSections);
  };

  const handleSaveEdit = () => {
    if (editingElement.type === 'section') {
      // Use the dedicated function to update section title
      updateSectionTitle(editingElement.id, editingValues.title);
    } else {
      // Update the element in the main elements array
      onUpdateElement(editingElement.id, editingValues);
      
      // Also update the element in any section that contains it
      const updatedSections = sections.map(section => {
        const updatedElements = section.elements.map(element => 
          element.id === editingElement.id ? { ...element, ...editingValues } : element
        );
        return { ...section, elements: updatedElements };
      });
      setSections(updatedSections);
    }
    setEditingElement(null);
    setEditingValues({});
  };

  const handleCancelEdit = () => {
    setEditingElement(null);
    setEditingValues({});
  };

  const selectSection = (sectionId) => {
    setCurrentSection(sectionId);
  };

  const handlePublish = () => {
    const formConfig = {
      version: '1.0',
      sections: sections.map(section => ({
        id: section.id,
        title: section.title,
        elements: section.elements.map(element => ({
          id: element.id,
          type: element.type,
          label: element.label,
          placeholder: element.placeholder || '',
          required: element.required || false,
          options: element.options || [],
          name: element.name || `field_${element.id}`,
          columns: element.columns,
          validation: {
            required: element.required || false,
            minLength: element.minLength,
            maxLength: element.maxLength,
            pattern: element.pattern,
            customValidation: element.customValidation
          }
        }))
      })),
      elements: elements.map(element => ({
        id: element.id,
        type: element.type,
        label: element.label,
        placeholder: element.placeholder || '',
        required: element.required || false,
        options: element.options || [],
        name: element.name || `field_${element.id}`,
        columns: element.columns,
        validation: {
          required: element.required || false,
          minLength: element.minLength,
          maxLength: element.maxLength,
          pattern: element.pattern,
          customValidation: element.customValidation
        }
      }))
    };

    console.log('Form Configuration:', JSON.stringify(formConfig, null, 2));
    navigator.clipboard.writeText(JSON.stringify(formConfig, null, 2))
      .then(() => alert('Form configuration copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };

  const handleElementDragStart = (e, element, sourceSectionId = null) => {
    setDraggedElement({ element, sourceSectionId });
    
    // Create a clean copy of the element without circular references
    const elementCopy = {
      id: element.id,
      type: element.type,
      label: element.label,
      placeholder: element.placeholder,
      required: element.required,
      options: element.options ? [...element.options] : [],
      name: element.name,
      columns: element.columns,
      isMoving: true,
      sourceSectionId
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(elementCopy));
  };

  const handleElementDrop = (e, targetSectionId = null) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      
      // If this is a move operation (not a new element)
      if (data.isMoving) {
        // Remove from source
        if (data.sourceSectionId) {
          // Remove from source section
          const updatedSections = sections.map(section => {
            if (section.id === data.sourceSectionId) {
              return {
                ...section,
                elements: section.elements.filter(el => el.id !== data.id)
              };
            }
            return section;
          });
          setSections(updatedSections);
        } else {
          // Remove from main elements
          onRemoveElement(data.id);
        }
        
        // Add to target
        if (targetSectionId) {
          // Add to target section
          const updatedSections = sections.map(section => {
            if (section.id === targetSectionId) {
              return {
                ...section,
                elements: [...section.elements, data]
              };
            }
            return section;
          });
          setSections(updatedSections);
        } else {
          // Add to main elements
          onAddElement(data);
        }
      } else {
        // This is a new element being dropped
        if (targetSectionId) {
          // Add to target section
          const updatedSections = sections.map(section => {
            if (section.id === targetSectionId) {
              return {
                ...section,
                elements: [...section.elements, { ...data, id: Date.now() }]
              };
            }
            return section;
          });
          setSections(updatedSections);
        } else {
          // Add to main elements
          onAddElement({ ...data, id: Date.now() });
        }
      }
    } catch (error) {
      console.error('Error handling element drop:', error);
    }
  };

  const renderFormElement = (element) => {
    switch (element.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <input
            type={element.type}
            placeholder={element.placeholder || ''}
            required={element.required}
          />
        );
      case 'textarea':
        return (
          <textarea
            placeholder={element.placeholder || ''}
            required={element.required}
          />
        );
      case 'select':
        return (
          <select required={element.required}>
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
            id={element.id}
            required={element.required}
          />
        );
      case 'radio':
        return (
          <input
            type="radio"
            id={element.id}
            name={element.name}
            required={element.required}
          />
        );
      case 'grid':
        return (
          <div className={`form-grid grid-${element.columns}`}>
            {Array(element.columns).fill(null).map((_, index) => (
              <div 
                key={index} 
                className="grid-item"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  try {
                    const elementData = JSON.parse(e.dataTransfer.getData('application/json'));
                    console.log('Dropped element data:', elementData);
                    
                    // Create a new element with a unique ID
                    const newElement = { 
                      ...elementData, 
                      id: Date.now() 
                    };
                    
                    // Log the current state before update
                    console.log('Current sections before update:', sections);
                    console.log('Current section elements:', sections.find(s => s.id === currentSection)?.elements);
                    console.log('Current grid element:', sections.find(s => s.id === currentSection)?.elements.find(el => el.id === element.id));
                    
                    // Update the grid with the new element
                    const updatedSections = sections.map(section => {
                      if (section.id === currentSection) {
                        // Create a new section with updated elements
                        const updatedElements = section.elements.map(el => {
                          if (el.id === element.id) {
                            // Create a new grid element with updated elements
                            const currentElements = el.elements || [];
                            const updatedGridElements = [...currentElements];
                            updatedGridElements[index] = newElement;
                            
                            console.log('Updated grid elements:', updatedGridElements);
                            
                            return {
                              ...el,
                              elements: updatedGridElements
                            };
                          }
                          return el;
                        });
                        
                        return {
                          ...section,
                          elements: updatedElements
                        };
                      }
                      return section;
                    });
                    
                    // Update the state
                    setSections(updatedSections);
                    console.log('Updated sections after update:', updatedSections);
                    console.log('Updated section elements:', updatedSections.find(s => s.id === currentSection)?.elements);
                    console.log('Updated grid element:', updatedSections.find(s => s.id === currentSection)?.elements.find(el => el.id === element.id));
                  } catch (error) {
                    console.error('Error handling grid drop:', error);
                  }
                }}
              >
                {element.elements && element.elements[index] ? (
                  <div className="grid-element-container">
                    {renderFormElement(element.elements[index])}
                  </div>
                ) : (
                  <div className="empty-grid-item">Drop element here</div>
                )}
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const renderEditForm = (element) => {
    if (!element) return null;
    
    return (
      <div className="element-settings" ref={editFormRef}>
        <div className="form-control">
          <label>Label</label>
          <input
            type="text"
            value={editingValues.label || ''}
            onChange={(e) => handleEditChange('label', e.target.value)}
          />
        </div>
        <div className="form-control">
          <label>Placeholder</label>
          <input
            type="text"
            value={editingValues.placeholder || ''}
            onChange={(e) => handleEditChange('placeholder', e.target.value)}
          />
        </div>
        <div className="form-control">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={editingValues.required || false}
              onChange={(e) => handleEditChange('required', e.target.checked)}
            />
            Required
          </label>
        </div>
        {element.type === 'select' && (
          <div className="form-control">
            <label>Options (comma-separated)</label>
            <input
              type="text"
              value={editingValues.options?.join(', ') || ''}
              onChange={(e) => handleEditChange('options', e.target.value.split(',').map(opt => opt.trim()))}
            />
          </div>
        )}
        {element.type === 'grid' && (
          <div className="form-control">
            <label>Number of Columns</label>
            <select
              value={editingValues.columns || 2}
              onChange={(e) => handleEditChange('columns', parseInt(e.target.value))}
            >
              <option value="1">1 Column</option>
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
            </select>
          </div>
        )}
        <div className="button-group">
          <button 
            className="save-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSaveEdit();
            }}
          >
            Save
          </button>
          <button 
            className="cancel-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCancelEdit();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="form-preview-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="form-preview-header">
        <h2>Form Preview</h2>
        <button className="publish-button" onClick={handlePublish}>
          Publish Form
        </button>
      </div>
      <form
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => handleElementDrop(e)}
      >
        {sections.map((section) => (
          <div 
            key={section.id} 
            className={`form-section ${currentSection === section.id ? 'active-section' : ''}`}
            onClick={() => selectSection(section.id)}
          >
            <div className="section-header">
              <h3>{section.title}</h3>
              <div className="element-controls">
                <button className="edit-button" onClick={(e) => handleEdit(section, e)}>Edit Title</button>
                <button onClick={(e) => {
                  e.stopPropagation();
                  setSections(sections.filter(s => s.id !== section.id));
                  if (currentSection === section.id) {
                    setCurrentSection(null);
                  }
                }}>Remove</button>
              </div>
            </div>
            {editingElement?.id === section.id ? (
              <div className="element-settings" ref={editFormRef}>
                <div className="form-control">
                  <label>Section Title</label>
                  <input
                    type="text"
                    value={editingValues.title || ''}
                    onChange={(e) => handleEditChange('title', e.target.value)}
                    placeholder="Enter section title"
                    autoFocus
                  />
                </div>
                <div className="button-group">
                  <button 
                    className="save-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Directly update the section title
                      updateSectionTitle(section.id, editingValues.title);
                      setEditingElement(null);
                      setEditingValues({});
                    }}
                  >
                    Save
                  </button>
                  <button 
                    className="cancel-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCancelEdit();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="section-content"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => handleElementDrop(e, section.id)}
              >
                {section.elements.map((element) => (
                  <div key={element.id} className="preview-element">
                    <div className="element-controls">
                      <div 
                        className="drag-handle"
                        draggable
                        onDragStart={(e) => handleElementDragStart(e, element, section.id)}
                      >
                        ⋮⋮
                      </div>
                      <button className="edit-button" onClick={(e) => handleEdit(element, e)}>Edit</button>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        const updatedSections = sections.map(s =>
                          s.id === section.id
                            ? { ...s, elements: s.elements.filter(e => e.id !== element.id) }
                            : s
                        );
                        setSections(updatedSections);
                      }}>Remove</button>
                    </div>
                    <div className="form-control">
                      <label>{element.label}</label>
                      {renderFormElement(element)}
                    </div>
                    {editingElement?.id === element.id && renderEditForm(editingElement)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {elements.map((element) => (
          <div key={element.id} className="preview-element">
            <div className="element-controls">
              <div 
                className="drag-handle"
                draggable
                onDragStart={(e) => handleElementDragStart(e, element)}
              >
                ⋮⋮
              </div>
              <button className="edit-button" onClick={(e) => handleEdit(element, e)}>Edit</button>
              <button onClick={(e) => {
                e.stopPropagation();
                onRemoveElement(element.id);
              }}>Remove</button>
            </div>
            <div className="form-control">
              <label>{element.label}</label>
              {renderFormElement(element)}
            </div>
            {editingElement?.id === element.id && renderEditForm(editingElement)}
          </div>
        ))}
      </form>
    </div>
  );
}

export default FormPreview; 