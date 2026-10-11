/**
 * Texts for the schedule page.
 * All visible interface text is stored here.
 */
export const HORARIOS_MESSAGES = {
  PLANNING: 'Planning',
  TITLE: 'Schedule Generator',
  DESCRIPTION:
    'Choose your subjects and their time options. We automatically discard combinations with scheduling conflicts.',

  SEMESTER_SUBJECTS: 'Semester Subjects',
  OPTION_LABEL: 'Option',
  SELECT_SUBJECT: 'Select',
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

  DAYS: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
} as const;