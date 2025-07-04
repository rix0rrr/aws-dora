// Enhanced functionality for AWS API Explorer

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeSyntaxHighlighting();
  initializeJsonEditor();
});

// Re-initialize after HTMX updates
document.addEventListener('htmx:afterSwap', function() {
  initializeSyntaxHighlighting();
  initializeJsonEditor();
});

// Initialize Prism syntax highlighting
function initializeSyntaxHighlighting() {
  if (typeof Prism !== 'undefined') {
    Prism.highlightAll();
  }
}

// Enhanced JSON editor functionality
function initializeJsonEditor() {
  const editor = document.getElementById('json-editor');
  if (!editor) return;
  
  // Add line numbers and better formatting
  editor.addEventListener('input', function() {
    try {
      const value = editor.value;
      if (value.trim()) {
        const parsed = JSON.parse(value);
        // Valid JSON - remove error styling
        editor.classList.remove('border-red-500', 'bg-red-50');
        editor.classList.add('border-gray-300');
      }
    } catch (e) {
      // Invalid JSON - add error styling
      editor.classList.remove('border-gray-300');
      editor.classList.add('border-red-500', 'bg-red-50');
    }
  });
  
  // Auto-format JSON on blur
  editor.addEventListener('blur', function() {
    try {
      const value = editor.value.trim();
      if (value) {
        const parsed = JSON.parse(value);
        const formatted = JSON.stringify(parsed, null, 2);
        if (formatted !== value) {
          editor.value = formatted;
        }
      }
    } catch (e) {
      // Invalid JSON - don't format
    }
  });
  
  // Add keyboard shortcuts
  editor.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to execute
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const executeButton = document.querySelector('button[hx-post="/execute"]');
      if (executeButton) {
        executeButton.click();
      }
    }
    
    // Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
      editor.selectionStart = editor.selectionEnd = start + 2;
    }
  });
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
    type === 'error' ? 'bg-red-500 text-white' :
    type === 'success' ? 'bg-green-500 text-white' :
    'bg-blue-500 text-white'
  }`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Handle HTMX errors
document.addEventListener('htmx:responseError', function(e) {
  showNotification('Request failed. Please check your connection and try again.', 'error');
});

// Handle successful requests
document.addEventListener('htmx:afterRequest', function(e) {
  if (e.detail.successful && e.detail.xhr.status === 200) {
    // Only show success for execute requests
    if (e.detail.pathInfo.requestPath === '/execute') {
      showNotification('Request executed successfully!', 'success');
    }
  }
});

// Auto-scroll to new log entries
document.addEventListener('htmx:afterSwap', function(e) {
  if (e.target.id === 'response-log') {
    const logContainer = document.getElementById('log-entries');
    if (logContainer) {
      logContainer.scrollTop = 0; // Scroll to top to see newest entries
    }
  }
});

// Collapsible log entries
document.addEventListener('click', function(e) {
  if (e.target.matches('.log-entry-header')) {
    const content = e.target.nextElementSibling;
    if (content) {
      content.classList.toggle('hidden');
    }
  }
});

// Copy to clipboard functionality
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard!', 'success');
  }).catch(() => {
    showNotification('Failed to copy to clipboard', 'error');
  });
}

// Export log functionality
function exportLog() {
  fetch('/logs')
    .then(response => response.json())
    .then(data => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aws-api-log-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    })
    .catch(() => {
      showNotification('Failed to export log', 'error');
    });
}
