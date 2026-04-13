// ─────────────────────────────────────────────────────────────────────────────
// Centralized Selectors — update here when UI changes, nowhere else.
// No data-testid in this app; uses element IDs, Angular ng-select, and
// GAMS-prefixed CSS classes.
// ─────────────────────────────────────────────────────────────────────────────

export const LOGIN_SELECTORS = {
  // Facility ng-select (appendto="body" — options render outside the component)
  facilityDropdown: 'ng-select[formcontrolname="Facility"]',
  facilityInput:    'ng-select[formcontrolname="Facility"] input[type="text"]',
  facilityOption:   '.ng-option:has-text("Version1 Test Site")',

  usernameInput: '#UserName',
  passwordInput: '#inputPassword',
  loginButton:   'button[type="submit"]',

  errorAlert:           '[role="alert"].gams-alert-warning',
  errorWrongPassword:   'text=Oops, something was incorrect',
  errorUserNotFound:    "text=Oops, your username couldn't be found",

  // First element visible after a successful login
  patientListHeading: 'h1:has-text("Patient List")',
};

export const NAV_SELECTORS = {
  patientList:    'a:has-text("Patient List")',
  wardRounds:     'a:has-text("Ward Rounds")',
  admin:          'a:has-text("Admin")',
  reports:        'a:has-text("Reports")',
};

export const COMMON_SELECTORS = {
  loadingSpinner: '[data-testid="loading-spinner"]',
  confirmYesBtn:  '[data-testid="confirm-yes"]',
  confirmNoBtn:   '[data-testid="confirm-no"]',
};
