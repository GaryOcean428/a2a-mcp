# Form Automation Feature Guide

## Overview

The Form Automation feature of the MCP Integration Platform allows applications to programmatically fill and submit web forms with validation. This functionality is particularly useful for automating repetitive form submissions, testing web applications, or integrating with systems that don't have direct API access.

## Basic Usage

To use the form automation feature, send a POST request to `/api/mcp` with the following payload structure:

```json
{
  "id": "request-456",
  "name": "form_automation",
  "parameters": {
    "url": "https://example.com/contact",
    "fields": {
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello world"
    },
    "submit": true
  }
}
```

### Required Parameters

- `url` (string): The URL of the webpage containing the form
- `fields` (object): Key-value pairs representing form fields and their values

### Optional Parameters

- `submit` (boolean): Whether to submit the form after filling it (default: true)
- `wait_for_navigation` (boolean): Whether to wait for the page to navigate after submission (default: true)
- `timeout` (number): Maximum time in milliseconds to wait for form operations (default: 30000)
- `field_selectors` (object): Custom CSS selectors for finding form fields
- `submit_selector` (string): Custom CSS selector for the submit button

## Response Format

Successful form automation requests return a response with the following structure:

```json
{
  "id": "request-456",
  "status": "success",
  "result": {
    "submitted": true,
    "navigated": true,
    "final_url": "https://example.com/thank-you",
    "page_title": "Thank You for Your Submission",
    "page_text": "Your message has been received..."
  }
}
```

## Advanced Usage

### Custom Field Selectors

If the form fields cannot be automatically detected, you can provide custom CSS selectors:

```json
{
  "id": "request-789",
  "name": "form_automation",
  "parameters": {
    "url": "https://example.com/complex-form",
    "fields": {
      "username": "johndoe",
      "password": "securepassword123",
      "agree_terms": true
    },
    "field_selectors": {
      "username": "#login-form input[name='user_name']",
      "password": "#login-form input[type='password']",
      "agree_terms": ".terms-checkbox input[type='checkbox']"
    },
    "submit_selector": "#login-form button[type='submit']",
    "submit": true
  }
}
```

### Handling Different Form Field Types

The form automation feature supports various field types:

#### Text Inputs

```json
{
  "fields": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Checkboxes and Radio Buttons

```json
{
  "fields": {
    "subscribe_newsletter": true,
    "preferred_contact": "email"
  }
}
```

#### Select Dropdowns

```json
{
  "fields": {
    "country": "United States",
    "state": "California"
  }
}
```

#### File Uploads

Currently, file uploads are not supported directly. For forms requiring file uploads, consider using a different approach or contact the platform administrators for possible workarounds.

### Form Validation

The platform performs basic validation before submitting forms:

1. Checking that required fields are filled
2. Validating email formats for email fields
3. Ensuring number inputs contain valid numbers

If validation fails, the response will include details:

```json
{
  "id": "request-456",
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Form validation failed",
    "details": [
      {
        "field": "email",
        "error": "Invalid email format"
      }
    ]
  }
}
```

### Waiting for Navigation

Form submissions often redirect to a different page. You can control how the platform handles this:

```json
{
  "parameters": {
    "url": "https://example.com/signup",
    "fields": { /* fields */ },
    "submit": true,
    "wait_for_navigation": true,
    "navigation_timeout": 10000
  }
}
```

With `wait_for_navigation` set to true, the response will include information about the page after redirection.

## Best Practices

### Form Automation Ethics

1. **Respect Terms of Service**: Only automate form submissions on websites where you have permission or where it's allowed by the terms of service
2. **Rate Limiting**: Implement appropriate rate limiting to avoid overwhelming the target website
3. **Error Handling**: Implement proper error handling for cases where form structure changes

### Error Handling

Common errors you might encounter:

- `FORM_NOT_FOUND`: The form could not be found on the page
- `FIELD_NOT_FOUND`: One or more specified fields could not be found
- `SUBMIT_BUTTON_NOT_FOUND`: The submit button could not be found
- `VALIDATION_ERROR`: Form validation failed
- `NAVIGATION_TIMEOUT`: The page did not navigate within the specified timeout
- `CAPTCHA_DETECTED`: A CAPTCHA or other anti-automation measure was detected

Implement robust error handling to manage these scenarios gracefully.

### Performance Optimization

1. **Caching**: Cache form structures for frequently used forms
2. **Timeout Management**: Set appropriate timeouts based on expected form complexity and network conditions
3. **Batch Operations**: Where appropriate, batch multiple form operations into a single workflow

## Use Cases

### Customer Onboarding

Automate the process of signing up customers on third-party platforms that don't provide direct API access.

```javascript
async function onboardCustomer(customerData) {
  const response = await fetch('https://api.mcp-platform.com/api/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key-here'
    },
    body: JSON.stringify({
      id: generateUniqueId(),
      name: 'form_automation',
      parameters: {
        url: 'https://partner-portal.example.com/register',
        fields: {
          company_name: customerData.companyName,
          contact_name: customerData.contactName,
          email: customerData.email,
          phone: customerData.phone,
          plan: customerData.selectedPlan,
          terms_accepted: true
        },
        submit: true,
        wait_for_navigation: true
      }
    })
  });
  
  const data = await response.json();
  return {
    success: data.status === 'success',
    confirmationPage: data.result?.page_text || null
  };
}
```

### Web Application Testing

Test web applications by automating form submissions and validating the responses.

### Data Collection

Collect data from websites that require form submissions to access information.

## Limitations

- **CAPTCHAs**: Cannot bypass CAPTCHA or similar anti-automation measures
- **JavaScript-Heavy Forms**: May have difficulty with forms that rely heavily on JavaScript for validation or submission
- **Multi-Step Forms**: Basic support for multi-step forms; complex workflows may require multiple requests
- **File Uploads**: Does not support file upload fields

## FAQ

### Can the form automation feature bypass CAPTCHAs?

No, the platform cannot bypass CAPTCHAs or similar anti-automation measures. If a form includes a CAPTCHA, you'll receive an error response.

### How does the platform handle dynamic forms?

The platform supports basic dynamic forms where fields appear based on previous selections. For highly complex dynamic forms, you may need to break the process into multiple requests.

### Can I automate multi-step form processes?

Yes, but each step needs to be handled as a separate request. You can chain these requests together in your application logic.

### Is form automation limited to specific browsers?

No, the platform uses a headless browser environment that works with most modern websites. However, some websites might detect headless browsers and block them.

### How secure is form automation for sensitive data?

The platform uses secure connections and does not store form data after processing. However, for highly sensitive data, consider using direct API integrations when available rather than form automation.

## Further Resources

- [API Reference Documentation](/api-docs.yaml)
- [Rate Limiting Details](/docs/rate-limiting.md)
- [Error Code Reference](/docs/error-codes.md)
- [Form Automation Ethics Guidelines](/docs/automation-ethics.md)
