# React Form Builder

A simple and intuitive form builder application built with React.js. This application allows you to create custom forms by dragging and dropping form elements, customizing their properties, and previewing the final result.

## Features

- Drag and drop form elements
- Customize form element properties
- Preview form in real-time
- Support for various input types:
  - Text Input
  - Text Area
  - Dropdown
  - Checkbox
  - Radio Button
  - Date Picker
  - Number Input
  - Email Input

## Getting Started

### Option 1: Running Locally

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Option 2: Running with Docker

1. Make sure you have Docker and Docker Compose installed
2. Build and run the container:
   ```bash
   docker-compose up --build
   ```
3. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

To stop the container:

```bash
docker-compose down
```

## How to Use

1. Drag form elements from the left sidebar to the preview area
2. Click the "Edit" button on any form element to customize its properties
3. Set properties such as:
   - Label
   - Placeholder
   - Required field
   - Options (for dropdown)
4. Remove elements using the "Remove" button
5. Preview your form in real-time

## Technologies Used

- React.js
- CSS3
- HTML5 Drag and Drop API
- Docker
- Nginx

## License

MIT
