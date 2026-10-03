/**
 * English messages and interface labels for subjects.
 */

export const MESSAGES_EN = {
  // Headers and titles
  MATERIAS_PAGE_EYEBROW: 'Academic library',
  MATERIAS_PAGE_TITLE: 'Subjects',
  MATERIAS_PAGE_DESCRIPTION:
    'Explore subjects and discover their academic information.',

  // States and counters
  MATERIA_SINGULAR: 'subject available',
  MATERIA_PLURAL: 'subjects available',
  DEMO_NOTICE:
    'Demonstration data: these subjects and their indicators are fictitious.',

  // Subject search (HU-02)
  SEARCH_LABEL: 'Search',
  SEARCH_PLACEHOLDER: 'Subject name',
  SEARCH_CLEAR: 'Clear search',
  SEARCH_RESULT_SINGULAR: 'subject found',
  SEARCH_RESULT_PLURAL: 'subjects found',
  SEARCH_EMPTY_TITLE: 'No matches found',
  SEARCH_EMPTY_DESCRIPTION:
    'Try another name, or clear the search to view all subjects.',

  // Career filter (HU-03)
  CAREER_LABEL: 'Degree program',
  CAREER_ALL: 'All',
  CAREER_EMPTY_TITLE:
    'There are no subjects registered for this degree program',
  CAREER_EMPTY_DESCRIPTION:
    'Select another degree program or choose All to view the available subjects.',
  CAREER_SEARCH_EMPTY_DESCRIPTION:
    'There are no subjects matching the selected name and degree program. Try another name or change the degree program.',
  CAREER_EMPTY: 'No degree programs available for filtering.',
  CAREER_LOAD_ERROR: 'Could not load degree programs.',

  // Semester filter
  SEMESTER_FILTER_LABEL: 'Semester',
  SEMESTER_FILTER_ALL: 'All',

  // Pagination
  PAGINATION_LABEL: 'Subject catalog pagination',
  PREVIOUS_PAGE: 'Previous',
  NEXT_PAGE: 'Next',
  PAGE_LABEL: 'Page',
  PAGE_OF: 'of',

  // Loading
  LOADING_MESSAGE: 'Loading subjects…',

  // Errors
  ERROR_TITLE: 'We could not load the subjects',
  ERROR_DESCRIPTION:
    'Check your connection and try again.',
  ERROR_BUTTON: 'Retry',

  // No data
  EMPTY_TITLE: 'There are no subjects available yet',
  EMPTY_DESCRIPTION:
    'Once subjects are registered, you will be able to view them here.',

  // Indicators and levels
  DIFFICULTY_LABEL: 'Difficulty',
  WORKLOAD_LABEL: 'Workload',
  PREREQUISITES_LABEL: 'Previous knowledge',
  DOMINANCE_LABEL: 'Predominance',
  STUDENTS_EVALUATED_LABEL: 'Evaluations',
  NO_DATA: 'No data',

  // Semester levels
  SEMESTER_LABEL: 'Semester',
  LEVEL_BASIC: 'Basic',
  LEVEL_INTERMEDIATE: 'Intermediate',
  LEVEL_ADVANCED: 'Advanced',

  // Evaluations
  STUDENT_EVALUATED_SINGULAR: 'student evaluated',
  STUDENT_EVALUATED_PLURAL: 'students evaluated',
  EVALUATIONS_UNAVAILABLE: 'Evaluations unavailable',
  STUDENTS_EVALUATED_SUFFIX: 'this subject',

  // Buttons and actions
  EXPLORE_BUTTON: 'Explore subject',
  INFORMATION_BUTTON: 'View subject information',
  VIEW_DETAIL_BUTTON: 'View details and ratings',
  CLOSE_INFORMATION_BUTTON: 'Close subject information',

  // Subject details (HU-04)
  MODAL_EYEBROW: 'Subject information',
  MODAL_CODE_LABEL: 'Code',
  MODAL_CAREER_LABEL: 'Degree program',
  MODAL_SEMESTER_LABEL: 'Suggested semester',
  MODAL_ACADEMIC_PREREQUISITES_LABEL: 'Prerequisites',
  MODAL_RECOMMENDED_PREREQUISITES_LABEL:
    'Recommended previous knowledge',
  MODAL_INFORMATION_UNAVAILABLE: 'Information unavailable',
  MODAL_DOMINANCE_LABEL: 'Predominance',
  MODAL_DIFFICULTY_LABEL: 'Difficulty',
  MODAL_WORKLOAD_LABEL: 'Workload',
  MODAL_PREREQUISITES_LABEL: 'Previous knowledge',
  MODAL_EVALUATIONS_LABEL: 'Evaluations',
  MODAL_STUDENTS_SUFFIX: 'students',

  // Aria labels and accessibility
  INDICATORS_WITH_DATA: 'Subject indicators',
  INDICATORS_WITHOUT_DATA:
    'Indicators: no data available',
  MATERIAS_SECTION_LABEL: 'Subjects section',

  // HU-05.1 - Subject details and rating
  MATERIA_DETAIL_LOADING: 'Loading subject...',
  MATERIA_DETAIL_CODE_LABEL: 'Code',
  MATERIA_DETAIL_SEMESTER_LABEL: 'Semester',

  // Internal navigation of subject details
  MATERIA_DETAIL_SECTIONS_ARIA:
    'Subject information sections',

  MATERIA_DETAIL_SECTION_SUMMARY:
    'Summary',

  MATERIA_DETAIL_SECTION_TEACHERS:
    'Teachers',

  MATERIA_DETAIL_SECTION_MATERIAL:
    'Material',

  MATERIA_DETAIL_SECTION_EVALUATIONS:
    'Evaluations',

  MATERIA_DETAIL_SECTION_ASSISTANTS:
    'Teaching assistants',

  MATERIA_DETAIL_SECTION_PENDING:
    'This section will be available soon.',

  CALIFICATION_VERIFYING:
    'Verifying rating...',

  CALIFICATION_BUTTON_CREATE:
    'Rate subject',

  CALIFICATION_BUTTON_VIEW:
    'View rating',

  CALIFICATION_REGISTERED_TITLE:
    'Rating registered',

  CALIFICATION_REGISTERED_DESCRIPTION:
    'You have already rated this subject.',

  CALIFICATION_FORM_TITLE:
    'Rate subject',

  CALIFICATION_FORM_DESCRIPTION:
    'Rate your experience with this subject.',

  CALIFICATION_CLOSE_BUTTON:
    'Close',

  CALIFICATION_CANCEL_BUTTON:
    'Cancel',

  CALIFICATION_CONTINUE_BUTTON:
    'Continue',

  CALIFICATION_BACK_BUTTON:
    'Back',

  CALIFICATION_CONFIRM_BUTTON:
    'Confirm rating',

  CALIFICATION_REGISTERING:
    'Registering...',

  CALIFICATION_CONFIRM_TITLE:
    'Confirm rating',

  CALIFICATION_CONFIRM_DESCRIPTION:
    'Review the values before registering your rating.',

  CALIFICATION_SINGLE_NOTICE:
    'You can only register one rating per subject.',

  CALIFICATION_CONFIRM_NOTICE:
    'You can only register one rating per subject. Review the information before confirming.',

  CALIFICATION_SUBJECT_LABEL:
    'Subject',

  CALIFICATION_DIFFICULTY_LABEL:
    'Difficulty',

  CALIFICATION_WORKLOAD_LABEL:
    'Workload',

  CALIFICATION_PREVIOUS_KNOWLEDGE_LABEL:
    'Previous knowledge',

  CALIFICATION_PREREQUISITES_LABEL:
    'Prerequisites',

  CALIFICATION_DOMINANCE_LABEL:
    'Predominance',

  CALIFICATION_MANAGEMENT_LABEL:
    'Academic term',

  CALIFICATION_PRACTICAL_LABEL:
    'Practical',

  CALIFICATION_THEORETICAL_LABEL:
    'Theoretical',

  CALIFICATION_PREREQUISITES_PLACEHOLDER:
    'E.g.: Basic programming, Logic, Mathematics',

  CALIFICATION_MANAGEMENT_PLACEHOLDER:
    'E.g.: 2026-1',

  CALIFICATION_PREREQUISITES_REQUIRED:
    'You must enter at least one prerequisite.',

  CALIFICATION_MANAGEMENT_INVALID:
    'The academic term must have the format YEAR-1 or YEAR-2.',

  CALIFICATION_INVALID_SUBJECT_ID:
    'The subject identifier is not valid.',

  CALIFICATION_INVALID_DATA:
    'The rating data is not valid.',

  CALIFICATION_SUBJECT_UNAVAILABLE:
    'The requested subject is unavailable.',

  CALIFICATION_REGISTER_ERROR:
    'Could not register the rating. Please try again.',

  CALIFICATION_SUBJECT_NOT_FOUND:
    'The requested subject does not exist.',

  CALIFICATION_SUBJECT_LOAD_ERROR:
    'Could not load the subject information.',

  CALIFICATION_STATUS_ERROR:
    'Could not verify whether you have already rated this subject.',

  // HU-05.2.2 - Rating editing and deletion
  CALIFICATION_EDIT_BUTTON:
    'Edit',

  CALIFICATION_DELETE_BUTTON:
    'Delete',

  CALIFICATION_EDIT_TITLE:
    'Edit rating',

  CALIFICATION_EDIT_DESCRIPTION:
    'Update the information from your registered rating.',

  CALIFICATION_UPDATE_CONFIRM_TITLE:
    'Confirm changes',

  CALIFICATION_UPDATE_CONFIRM_DESCRIPTION:
    'Review the values before updating your rating.',

  CALIFICATION_UPDATE_BUTTON:
    'Save changes',

  CALIFICATION_UPDATING:
    'Updating...',

  CALIFICATION_UPDATE_ERROR:
    'Could not update the rating. Please try again.',

  CALIFICATION_DELETE_CONFIRM_TITLE:
    'Delete rating',

  CALIFICATION_DELETE_CONFIRM_DESCRIPTION:
    'Are you sure you want to delete this rating? This action cannot be undone.',

  CALIFICATION_DELETE_CONFIRM_BUTTON:
    'Delete rating',

  CALIFICATION_DELETING:
    'Deleting...',

  CALIFICATION_DELETE_NOT_FOUND:
    'The rating you are trying to delete no longer exists.',

  CALIFICATION_DELETE_ERROR:
    'Could not delete the rating. Please try again.',

  // HU-05.2 - Rating visualization
  CALIFICATION_SUMMARY_TITLE:
    'Rating summary',

  CALIFICATION_SUMMARY_DESCRIPTION:
    'Information obtained from registered evaluations.',

  CALIFICATION_SUMMARY_GENERAL_CONTEXT:
    'Overall subject average',

  CALIFICATION_FILTER_APPLIED:
    'Filter applied',

  CALIFICATION_MANAGEMENTS_LOADING:
    'Loading academic terms...',

  CALIFICATION_DATA_LOADING:
    'Loading rating data...',

  CALIFICATION_SUMMARY_EMPTY:
    'There are not enough ratings to display averages.',

  CALIFICATION_SUMMARY_LOAD_ERROR:
    'Could not load the subject rating data.',

  CALIFICATION_MANAGEMENTS_LOAD_ERROR:
    'Could not load the available academic terms.',

  // HU-05.2 - Rating charts
  CALIFICATION_GRAPH_TITLE:
    'Rating metrics',

  CALIFICATION_GRAPH_DESCRIPTION:
    'Visual representation on a scale from 0 to 10.',

  CALIFICATION_GRAPH_DIFFICULTY_ARIA:
    'Average difficulty',

  CALIFICATION_GRAPH_WORKLOAD_ARIA:
    'Average workload',

  CALIFICATION_GRAPH_PREVIOUS_KNOWLEDGE_ARIA:
    'Average previous knowledge',

  // HU-05.2 - Academic term filter
  CALIFICATION_FILTER_HISTORY_TITLE:
    'History by academic term',

  CALIFICATION_FILTER_HISTORY_DESCRIPTION:
    'Quickly view the most recent academic terms or use a custom range.',

  CALIFICATION_FILTER_RECENT:
    'recent',

  CALIFICATION_FILTER_CUSTOM_TITLE:
    'Custom query',

  CALIFICATION_FILTER_CUSTOM_DESCRIPTION:
    'Select a specific academic term or a range of academic terms.',

  CALIFICATION_FILTER_SINGLE_MODE:
    'Single academic term',

  CALIFICATION_FILTER_RANGE_MODE:
    'Academic term range',

  CALIFICATION_FILTER_FROM_LABEL:
    'From',

  CALIFICATION_FILTER_TO_LABEL:
    'To',

  CALIFICATION_FILTER_CLEAR_BUTTON:
    'Clear filter',

  CALIFICATION_FILTER_LOADING:
    'Loading...',

  CALIFICATION_FILTER_APPLY_BUTTON:
    'Apply filter',

  CALIFICATION_FILTER_MANAGEMENT_REQUIRED:
    'Select an academic term.',

  CALIFICATION_FILTER_MANAGEMENT_EMPTY:
    'There are no ratings for the selected academic term.',

  CALIFICATION_FILTER_MANAGEMENT_LOAD_ERROR:
    'Could not load the academic term data.',

  CALIFICATION_FILTER_MANAGEMENT_CONTEXT:
    'Overall academic term average',

  CALIFICATION_FILTER_RANGE_REQUIRED:
    'Select the starting and ending academic terms.',

  CALIFICATION_FILTER_RANGE_INVALID:
    'The starting academic term cannot be later than the ending academic term.',

  CALIFICATION_FILTER_RANGE_EMPTY:
    'There are no ratings for the selected range.',

  CALIFICATION_FILTER_RANGE_LOAD_ERROR:
    'Could not load the range data.',

  CALIFICATION_FILTER_RANGE_CONTEXT:
    'Overall range average',

  CALIFICATION_FILTER_RANGE_SEPARATOR:
    'to',

  // HU-05.2 - Rating history
  CALIFICATION_HISTORY_TITLE:
    'Historical evolution by academic term',

  CALIFICATION_HISTORY_DESCRIPTION:
    'Overall comparison of ratings registered throughout the academic terms.',

  CALIFICATION_HISTORY_LOADING:
    'Loading history...',

  CALIFICATION_HISTORY_LOAD_ERROR:
    'Could not load the rating history.',

  CALIFICATION_HISTORY_ARIA:
    'Historical evolution of ratings by academic term',

  CALIFICATION_HISTORY_NOTE:
    'The history corresponds to the overall averages available for each academic term.',

  CALIFICATION_HISTORY_EMPTY:
    'There are not enough academic terms to build the history.',
} as const;