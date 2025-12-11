# Implementation Plan

- [x] 1. Initialize project structure and dependencies





  - Create Vite + React + TypeScript project
  - Install required dependencies: tailwindcss, recharts, axios, lucide-react, fast-check
  - Configure Tailwind CSS with dark theme
  - Set up testing framework with Jest and React Testing Library
  - _Requirements: 4.4, 5.1_

- [x] 2. Create core type definitions and utilities




  - Define TypeScript interfaces for Bitcoin and NASA API responses
  - Create date utility functions for API date formatting
  - Define chart data point and cosmic data interfaces
  - _Requirements: 5.2, 5.3_

- [x] 3. Implement API service layers





- [x] 3.1 Create Bitcoin service with CoinGecko integration


  - Implement functions to fetch current Bitcoin price and 7-day history
  - Add error handling and response validation
  - _Requirements: 1.1, 2.1_

- [x] 3.2 Create NASA asteroid service


  - Implement function to fetch NEO data with date ranges
  - Add data flattening logic for date-keyed objects
  - Implement hazard score calculation
  - _Requirements: 1.2, 1.4, 2.2, 5.4_

- [x] 3.3 Write property test for NASA data flattening


  - **Property 1: NASA data flattening preserves asteroid count**
  - **Validates: Requirements 1.4**

- [x] 3.4 Write property test for hazard score calculation

  - **Property 4: Hazard score calculation accuracy**
  - **Validates: Requirements 5.4**

- [x] 4. Create custom data management hook





- [x] 4.1 Implement useCosmicData hook


  - Create hook with state management for all data types
  - Implement data fetching and refresh logic
  - Add date alignment for merging Bitcoin and asteroid data
  - Implement loading and error state management
  - _Requirements: 2.5, 3.1, 3.2, 5.2_

- [x] 4.2 Write property test for date alignment


  - **Property 2: Date alignment produces consistent merged data**
  - **Validates: Requirements 2.5**

- [x] 4.3 Write property test for refresh idempotence


  - **Property 3: Refresh idempotence prevents duplicate calls**
  - **Validates: Requirements 3.5**

- [x] 4.4 Write unit tests for useCosmicData hook


  - Test hook initialization and state management
  - Test error handling and loading states
  - Test refresh functionality
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. Build UI components





- [x] 5.1 Create LoadingSpinner component


  - Implement animated loading indicator with space theme
  - _Requirements: 3.2, 4.1_

- [x] 5.2 Create MetricCard component


  - Build reusable card component for displaying metrics
  - Add loading state and error handling
  - Apply space-themed styling with Tailwind
  - _Requirements: 1.3, 4.1, 4.3_

- [x] 5.3 Create Header component


  - Implement header with title and refresh button
  - Add loading state for refresh button
  - Apply space-themed styling
  - _Requirements: 3.1, 4.2, 4.5_

- [x] 5.4 Create CosmicChart component


  - Implement dual-line chart using Recharts
  - Configure green line for Bitcoin price, red for asteroid count
  - Add responsive container for mobile compatibility
  - Handle empty data states
  - _Requirements: 2.3, 2.4_

- [x] 5.5 Write unit tests for UI components


  - Test MetricCard rendering with different props
  - Test Header component and refresh button interaction
  - Test CosmicChart with various data scenarios
  - Test LoadingSpinner component
  - _Requirements: 1.3, 2.3, 3.1, 4.2_

- [x] 6. Implement main Dashboard component




- [x] 6.1 Create Dashboard component


  - Integrate useCosmicData hook
  - Render Header, MetricCards, and CosmicChart
  - Implement error boundary and error display
  - Apply dark mode space theme styling
  - _Requirements: 1.3, 1.5, 4.1, 5.5_

- [x] 6.2 Write integration tests for Dashboard


  - Test complete data flow from API to UI
  - Test error handling scenarios
  - Test refresh functionality end-to-end
  - _Requirements: 1.5, 3.3, 3.4_

- [x] 7. Configure application entry point




- [x] 7.1 Set up main App component and routing

  - Configure main App.tsx with Dashboard
  - Set up index.html with space-themed meta tags
  - Configure Vite build settings
  - _Requirements: 4.1, 4.4_

- [x] 8. Final integration and testing




- [x] 8.1 Ensure all tests pass, ask the user if questions arise




  - Run all unit tests and property-based tests
  - Verify error handling works correctly
  - Test responsive design functionality
  - _Requirements: All_