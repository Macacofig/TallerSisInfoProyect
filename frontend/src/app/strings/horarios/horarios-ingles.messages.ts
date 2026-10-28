/**
 * Texts for the schedule page.
 * All visible interface text is stored here.
 */
export const HORARIOS_MESSAGES = {
  PLANNING: 'Planning',
  TITLE: 'Schedule Generator',
  DESCRIPTION:
    'Choose your subjects and their time options. We automatically discard combinations with scheduling conflicts.',
  ADD_SUBJECT: 'Add subject',
  DOWNLOAD_SCHEDULE: 'Download schedule',

  SEMESTER_SUBJECTS: 'Semester Subjects',
  OPTION_LABEL: 'Option',
  SELECT_SUBJECT: 'Select',
  PREVIOUS_SUBJECTS_PAGE: 'Previous page of subjects',
  NEXT_SUBJECTS_PAGE: 'Next page of subjects',
  SUBJECT_NAMES: {
    'INF-101': 'Programming I',
    'INF-202': 'Data Structures',
    'INF-305': 'Databases',
    'INF-410': 'Software Engineering',
  },

  HOUR: 'Time',
  OPTIONS_FOUND: 'Available schedule options:',
  PREVIOUS: 'Previous',
  NEXT: 'Next',

  EMPTY_STATE:
    'Select at least one subject to view its schedule options.',
  ADD_SUBJECTS_TITLE: 'Add subjects',
  ADD_SUBJECTS_DESCRIPTION:
    'Enter the details of each subject and its schedules, then add them to the list.',
  CLOSE_MODAL: 'Close dialog',
  SEMESTER: 'Semester',
  SEMESTER_OPTION_SUFFIX: ' semester',
  ADD_SUBJECTS_EMPTY:
    'There are no subjects available to add for this semester.',
  CANCEL: 'Cancel',
  ADD_SELECTED: 'Add selected',
  SIGLA: 'Code',
  SUBJECT_NAME: 'Subject name',
  PARALLEL: 'Parallel',
  TEACHER: 'Teacher',
  DAY: 'Day',
  START_TIME: 'Start time',
  END_TIME: 'End time',
  SCHEDULE_BLOCKS: 'Subject schedules',
  ADD_SCHEDULE_BLOCK: 'Add time block',
  ADD_TO_LIST: 'Add to list',
  SUBJECTS_TO_SEND: 'Subjects to send',
  SUBJECTS_TO_SEND_EMPTY: 'You have not added any subject to the list yet.',
  SEND_SUBJECTS: 'Send subjects',
  REMOVE: 'Remove',
  NO_OFFERS: 'No offers available.',
  SHOW_OFFERS: 'Show teachers and schedules',
  HIDE_OFFERS: 'Hide teachers and schedules',
  REUSE: 'Reuse',
  DUPLICATE_SUBJECT:
    'That teacher is already added with the same parallel for this subject.',
  DOWNLOAD_DESCRIPTION:
    'Review the selected schedule before continuing.',
  SCHEDULE_OPTION_OF: 'of',
  SELECTED_SUBJECT: 'subject selected',
  SELECTED_SUBJECTS: 'subjects selected',
  INCLUDED_SUBJECTS: 'Included subjects',
  SELECTED_SUBJECTS_EMPTY: 'No subjects selected to display.',
  CONFIRM: 'Confirm',

  FILTERS: 'Generation filters',
  COUNT_SUBJECTS: 'Number of subjects',
  MIN_SUBJECTS: 'Minimum number of subjects',
  MAX_SUBJECTS: 'Maximum number of subjects',
  NO_GAPS: 'Avoid gaps',
  REQUIRED_SUBJECT: 'Required',
  EXCLUDE_SUBJECT: 'Exclude',
  TEACHER_REQUIRED: 'Required',
  TEACHER_FREE: 'Free',

  GENERATE_SCHEDULES: 'Generate schedules',
  GENERATING: 'Generating...',
  GENERATED_SOLUTIONS: 'Generated solutions',
  SOLUTION: 'Solution',
  SCORE: 'Score',
  NO_SOLUTIONS: 'No solutions found with the selected filters.',
  GENERATE_ERROR: 'Could not generate schedules. Please try again.',

  DAYS: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
} as const;