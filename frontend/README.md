# Employee Management Portal - Frontend

A responsive, modern frontend for the Employee Management Portal built with vanilla HTML, CSS, and JavaScript.

## Features

✅ **View Employees** - Display all employees in a beautiful card grid
✅ **Add Employee** - Create new employee records with validation
✅ **Edit Employee** - Update employee details via modal
✅ **Delete Employee** - Remove employees with confirmation
✅ **Search Employees** - Real-time search across multiple fields
✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **API Status Monitoring** - Real-time API connection status
✅ **Toast Notifications** - User-friendly feedback messages
✅ **Loading States** - Visual feedback during API calls
✅ **Error Handling** - Graceful error messages and recovery

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with flexbox and CSS Grid
- **Vanilla JavaScript** - No frameworks or dependencies
- **Fetch API** - Async API calls

## Files

```
frontend/
├── index.html     - Main HTML page
├── styles.css     - All styling
├── config.js      - API configuration
├── app.js         - Main application logic
└── README.md      - This file
```

## Setup & Configuration

### 1. Update API Endpoint

Edit `frontend/config.js` and update the API endpoint:

```javascript
const API_CONFIG = {
  BASE_URL: 'https://your-api-id.execute-api.region.amazonaws.com/prod',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};
```

### 2. Local Development

Serve the frontend locally:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using VS Code Live Server extension
# Just open index.html in your browser
```

Then open `http://localhost:8000` in your browser.

### 3. Deployment to S3

#### Option 1: AWS CLI

```bash
# Create S3 bucket
aws s3 mb s3://employee-portal-prod-$(date +%s)

# Upload files
aws s3 sync . s3://employee-portal-prod-xxx --exclude '.git/*'

# Enable static website hosting
aws s3api put-bucket-website \
  --bucket employee-portal-prod-xxx \
  --website-configuration file://website-config.json

# Make bucket public (bucket policy)
aws s3api put-bucket-policy \
  --bucket employee-portal-prod-xxx \
  --policy file://bucket-policy.json
```

#### Option 2: AWS Management Console

1. Create S3 bucket
2. Upload files via console or drag-drop
3. Enable "Static website hosting"
4. Set index document to `index.html`
5. Add bucket policy for public read access

### 4. CloudFront CDN Setup

```bash
# Create CloudFront distribution pointing to S3 bucket
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## API Integration

### API Service Class

The `APIService` class handles all API calls:

```javascript
// Example usage
const api = new APIService('https://api.example.com', 10000);

// Get all employees
const employees = await api.getEmployees();

// Create employee
const newEmployee = await api.createEmployee({
  name: 'John Doe',
  email: 'john@example.com',
  department: 'Engineering',
  position: 'Developer',
  salary: 75000,
  joinDate: '2025-01-15'
});
```

### Available Methods

```javascript
api.getEmployees()                    // Get all employees
api.getEmployee(id)                   // Get single employee
api.createEmployee(data)              // Create new employee
api.updateEmployee(id, data)          // Update employee
api.deleteEmployee(id)                // Delete employee
api.searchEmployees(query)            // Search employees
```

## Features in Detail

### 1. Employee List View

- Grid layout that responds to screen size
- Card-based design with all employee details
- Real-time employee count
- Refresh button
- API status indicator

### 2. Add Employee Form

- Required fields validation
- Email uniqueness check (via API)
- Department dropdown
- Optional salary and join date
- Success/error messages
- Form reset functionality

### 3. Edit Modal

- Load employee data via API
- Update any field
- Real-time validation
- Success confirmation
- Auto-refresh list on save

### 4. Delete Confirmation

- Confirmation modal
- Display employee details
- Cancel or confirm deletion
- Success notification
- Auto-refresh list

### 5. Search

- Real-time search
- Search by:
  - Employee name
  - Email address
  - Department
  - Position
- Enter key support
- Clear search button

## Keyboard Shortcuts

- `Enter` - Submit search form
- `Escape` - Close modal (coming soon)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

✅ Minimal dependencies (vanilla JS)
✅ Efficient DOM manipulation
✅ CSS animations with hardware acceleration
✅ Fetch API with timeouts
✅ Lazy loading (ready for implementation)
✅ Minified CSS and JS (for production)

## Accessibility

✅ Semantic HTML structure
✅ ARIA labels on interactive elements
✅ Keyboard navigation support
✅ High contrast colors
✅ Clear focus indicators
✅ Form validation messages

## Error Handling

1. **API Connection Errors** - Toast notification + fallback UI
2. **Validation Errors** - Form field inline errors
3. **Network Timeouts** - Automatic retry with backoff
4. **5xx Errors** - User-friendly error messages

## Debugging

### Browser Console

Enable debug logging:

```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

### Check API Endpoint

```javascript
// In browser console
console.log('Current API:', API_CONFIG.BASE_URL);
```

### Network Tab

Use DevTools Network tab to:
- Monitor API requests
- View response headers
- Inspect response payloads
- Check for CORS issues

## Customization

### Change Colors

Edit CSS variables in `styles.css`:

```css
:root {
  --primary-color: #667eea;    /* Change primary color */
  --danger-color: #ef4444;     /* Change danger color */
  /* ... more variables ... */
}
```

### Change API Endpoint

```javascript
// In config.js
const API_CONFIG = {
  BASE_URL: 'https://your-custom-api-endpoint.com'
};
```

### Modify Departments

Edit the select options in `index.html`:

```html
<select id="department">
  <option value="Your Department">Your Department</option>
  <!-- Add more options -->
</select>
```

## Performance Metrics

- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Time to Interactive (TTI):** < 3s

## Deployment Checklist

- [ ] Update API endpoint in `config.js`
- [ ] Test all CRUD operations
- [ ] Verify responsive design on mobile
- [ ] Check console for errors
- [ ] Validate all form inputs
- [ ] Test search functionality
- [ ] Verify error handling
- [ ] Set up S3 static hosting
- [ ] Create CloudFront distribution
- [ ] Test API calls with CORS headers

## Future Enhancements

- [ ] Add employee avatar/profile pictures
- [ ] Implement employee filtering (by department, salary range, etc.)
- [ ] Add data export (CSV, PDF)
- [ ] Bulk operations (bulk import, bulk delete)
- [ ] Employee performance tracking
- [ ] Advanced analytics dashboard
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Offline mode with Service Workers
- [ ] Progressive Web App (PWA)

## Support

For issues or questions:
1. Check browser console for errors
2. Verify API endpoint configuration
3. Check network tab in DevTools
4. Review backend logs
5. Open an issue on GitHub

## License

MIT License - See LICENSE file for details

## Author

**Amit Jadav** - [@amitmjadav27](https://github.com/amitmjadav27)
