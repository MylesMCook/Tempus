# AI Development Rules

## Project Structure
- Keep all files in the root directory, no nested folders
- Maintain only 3-4 core files:
  1. `date-parser.ts` - Core parsing logic
  2. `date-picker.tsx` - Main component
  3. `page.tsx` - Demo page

## Code Style
1. Use TypeScript for all files
2. Follow React best practices:
   - Use functional components
   - Implement proper prop types
   - Use hooks appropriately
3. Maintain clean code:
   - Clear variable names
   - Proper comments for complex logic
   - Consistent formatting

## Date Parser Rules
1. Support various date formats:
   - Natural language (e.g., "next friday")
   - Relative dates (e.g., "3 weeks from now")
   - Date math (e.g., "2 months before September 14")
2. Handle edge cases:
   - Invalid inputs
   - Ambiguous dates
   - Overflow dates (e.g., February 30th)

## Component Guidelines
1. DatePicker component should:
   - Be fully accessible
   - Support keyboard navigation
   - Show clear feedback
   - Handle errors gracefully
2. Use shadcn/ui components
3. Follow Tailwind CSS conventions

## Testing Considerations
1. Test all date parsing edge cases
2. Verify accessibility compliance
3. Check cross-browser compatibility
4. Ensure responsive design

## Performance Guidelines
1. Optimize date calculations
2. Minimize re-renders
3. Lazy load when possible
4. Cache parsed results when appropriate

## Documentation
1. Keep code well-documented
2. Update comments when modifying logic
3. Document any known limitations
4. Include examples for complex features
