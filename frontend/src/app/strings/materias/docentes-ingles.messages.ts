export const DOCENTES_MESSAGES_EN = {
  TITLE: 'Teachers',
  DESCRIPTION: 'View and rate the teachers registered for this subject.',

  LOADING: 'Loading teachers...',
  LOAD_ERROR: 'Could not load the teachers for this subject.',
  STATUS_ERROR:
    'The teachers were loaded, but the status of some evaluations could not be verified.',
  AVERAGES_LOADING: 'Updating teacher averages...',
  AVERAGES_ERROR:
    'The teachers were loaded, but their averages could not be retrieved.',
  NO_AVERAGES: 'This teacher does not have available averages yet.',
  GESTIONS_ERROR: 'Could not load the available evaluation periods.',
  HISTORY_TITLE: 'Evaluation history',
  HISTORY_DESCRIPTION: 'View teacher averages by academic period.',
  CUSTOM_FILTER_TITLE: 'Custom query',
  CUSTOM_FILTER_DESCRIPTION:
    'Select a period or a range to filter the averages.',
  RECENT: 'Recent',
  SINGLE_MODE: 'Single period',
  RANGE_MODE: 'Period range',
  MANAGEMENT_LABEL: 'Period',
  FROM_LABEL: 'From',
  TO_LABEL: 'To',
  APPLY_FILTER: 'Apply filter',
  FILTER_GESTION_REQUIRED: 'Select a period to continue.',
  FILTER_RANGE_REQUIRED: 'Select the starting and ending periods.',
  FILTER_RANGE_INVALID:
    'The starting period cannot be later than the ending period.',
  FILTER_GESTION_CONTEXT: 'Teacher averages in',
  FILTER_RANGE_CONTEXT: 'Teacher averages between',
  FILTER_RANGE_SEPARATOR: 'and',
  FILTER_ERROR: 'Could not retrieve the averages for that period.',
  FILTER_LOADING: 'Updating averages for the selected period...',
  FILTER_EMPTY: 'There are no teacher evaluations for the selected period.',
  MANAGEMENTS_LOADING: 'Loading available periods...',
  RESET_FILTER: 'View all periods',
  HISTORY_LOADING: 'Loading teacher history...',
  HISTORY_ERROR: 'Could not load the evaluation history.',
  HISTORY_EMPTY:
    'There are not enough periods available to display the history.',
  HISTORY_ARIA: 'Teacher averages history by academic period',
  HISTORY_NOTE:
    'Each point represents the average of the evaluations registered for that period.',
  RETRY: 'Retry',

  EMPTY_TITLE: 'No teachers registered',
  EMPTY_DESCRIPTION: 'This subject currently has no available teachers.',

  PENDING_STATUS: 'Evaluation pending',
  REGISTERED_STATUS: 'Evaluation registered',
  UNAVAILABLE_STATUS: 'Evaluation status unavailable',

  RATE_BUTTON: 'Rate teacher',
  VIEW_BUTTON: 'View evaluation',

  MODAL_TITLE: 'Rate teacher',
  MODAL_DESCRIPTION: 'Rate your experience with this teacher.',

  DETAIL_TITLE: 'Teacher evaluation',
  DETAIL_DESCRIPTION:
    'These are the values you registered for this teacher.',

  EDIT_BUTTON: 'Edit evaluation',
  DELETE_BUTTON: 'Delete',
  CLOSE_BUTTON: 'Close',

  EDIT_TITLE: 'Edit evaluation',
  EDIT_DESCRIPTION: 'Update the values of your evaluation.',

  CLARITY_LABEL: 'Clarity of explanations',
  METHODOLOGY_LABEL: 'Methodology',
  RELATION_LABEL: 'Class/evaluation relationship',

  PERIOD_LABEL: 'Period',
  CURRENT_PERIOD_LABEL: 'Current period',

  CANCEL_BUTTON: 'Cancel',
  CONTINUE_BUTTON: 'Continue',

  CONFIRM_TITLE: 'Confirm evaluation',
  CONFIRM_DESCRIPTION:
    'Review the values before registering your evaluation.',

  UPDATE_CONFIRM_TITLE: 'Confirm changes',
  UPDATE_CONFIRM_DESCRIPTION:
    'Review the values before updating your evaluation.',

  BACK_BUTTON: 'Back',
  CONFIRM_BUTTON: 'Confirm evaluation',
  SAVE_BUTTON: 'Save changes',

  SENDING: 'Registering...',
  UPDATING: 'Updating...',

  SUCCESS: 'Evaluation registered successfully.',
  UPDATE_SUCCESS: 'Evaluation updated successfully.',

  REGISTER_ERROR:
    'Could not register the evaluation. Please try again.',
  UPDATE_ERROR:
    'Could not update the evaluation. Please try again.',
  DUPLICATE_ERROR: 'You have already rated this teacher.',

  DELETE_CONFIRM_TITLE: 'Delete evaluation',
  DELETE_CONFIRM_DESCRIPTION:
    'Are you sure you want to delete this evaluation? This action cannot be undone.',
  DELETE_CONFIRM_BUTTON: 'Delete evaluation',
  DELETING: 'Deleting...',
  DELETE_SUCCESS: 'Evaluation deleted successfully.',
  DELETE_ERROR:
    'Could not delete the evaluation. Please try again.'
} as const;