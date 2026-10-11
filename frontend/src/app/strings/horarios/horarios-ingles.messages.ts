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
    'Select the semester and subjects you want to add.',
  CLOSE_MODAL: 'Close dialog',
  SEMESTER: 'Semester',
  SEMESTER_OPTION_SUFFIX: ' semester',
  ADD_SUBJECTS_EMPTY:
    'There are no subjects available to add for this semester.',
  CANCEL: 'Cancel',
  ADD_SELECTED: 'Add selected',
  DOWNLOAD_DESCRIPTION:
    'Review the selected schedule before continuing.',
  SCHEDULE_OPTION_OF: 'of',
  SELECTED_SUBJECT: 'subject selected',
  SELECTED_SUBJECTS: 'subjects selected',
  INCLUDED_SUBJECTS: 'Included subjects',
  SELECTED_SUBJECTS_EMPTY: 'No subjects selected to display.',
  CONFIRM: 'Confirm',

  DAYS: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
} as const;